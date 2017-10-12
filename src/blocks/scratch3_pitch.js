const ArgumentType = require('../extension-support/argument-type');
const BlockType = require('../extension-support/block-type');

class PitchTracker {

    constructor (sampleRate) {
        this.sampleRate = sampleRate;
    }

    getPitch (buffer) {
        const rms = this.getRMS(buffer);
        if (rms < 0.1) {
            return -1;
        }

        const pitchData = this.pitchDataForBuffer(buffer);
        const pitch = Math.round(pitchData.pitch);

        if (pitch > 96) {
            return -1;
        }

        return pitch;
    }

    getRMS (buffer) {
        var sum = 0;
        for (var i=0; i<buffer.length; i++) {
            var s = buffer[i];
            sum += s * s;
        }
        var rms = Math.sqrt(sum / buffer.length);

        // magic scaling
        rms *= 1.63;
        rms = Math.sqrt(rms);

        return rms;
    }

    pitchDataForBuffer (buffer) {

        // run autocorrelation
        var corrBuff = this.autoCorrelate(buffer);

        // find the first pitch peak - largest point with a smaller point before it
        var lagMax = 0;
        var corrMax = 0;
        for (var i = 1; i < corrBuff.length; i++) {
            if ((corrBuff[i] > corrBuff[i-1]) && (corrBuff[i] > corrMax)) {
                corrMax = corrBuff[i];
                lagMax = i;
            }
        }

        // get frequency and pitch info
        var interpolatedLag = this.parabolic(corrBuff, lagMax);
        var freq = this.sampleRate / interpolatedLag;

        var pitch = this.pitchFromFreq(freq);
        var pitchClass = Math.round(pitch % 12);
        var octave = Math.floor(pitch / 12);

        var pitchData = {
            freq:freq,
            pitch:pitch,
            pitchClass:pitchClass,
            octave:octave
        };

        return pitchData;
    }

    // from https://github.com/cwilso/PitchDetect/blob/master/js/pitchdetect.js
    pitchFromFreq (freq) {
        var noteNum = 12 * (Math.log(freq / 440)/Math.log(2));
        return noteNum + 69;
    }

    // parabolic interpolation from
    // https://gist.github.com/endolith/255291
    parabolic (b, i) {
        var result =  1/2 * (b[i-1] - b[i+1]) / (b[i-1] - 2 * b[i] + b[i+1]) + i;
        return result;
    }

    // from a p5 sound example
    autoCorrelate (buffer) {
        var newBuffer = [];
        var nSamples = buffer.length;

        var autocorrelation = [];

        // center clipping (with cutoff proportional to signal level)
        var max = buffer.reduce(function(a, b) {
            return Math.max(a, b);
        });
        var cutoff = max * 0.5;
        for (var i = 0; i < buffer.length; i++) {
            var val = buffer[i];
            buffer[i] = Math.abs(val) > cutoff ? val : 0;
        }

        // autocorrelate!
        for (var lag = 0; lag < nSamples; lag++){
            var sum = 0;
            for (var index = 0; index < nSamples; index++){
                var indexLagged = index+lag;
                if (indexLagged < nSamples){
                    var sound1 = buffer[index];
                    var sound2 = buffer[indexLagged];
                    var product = sound1 * sound2;
                    sum += product;
                }
            }

            // average to a value between -1 and 1
            newBuffer[lag] = sum/nSamples;
        }

        // normalize
        var biggestVal = 0;
        for (var i = 0; i < nSamples; i++) {
            var val = Math.abs(newBuffer[i]);
            if (val > biggestVal){
                biggestVal = val;
            }
        }

        for (var index = 0; index < nSamples; index++){
            newBuffer[index] /= biggestVal;
        }

        return newBuffer;
    }
}

class Scratch3PitchBlocks {
    constructor (runtime) {
        this.audioContext = new AudioContext();
        navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
            this.mic = this.audioContext.createMediaStreamSource(stream);
            this.lowpass = this.audioContext.createBiquadFilter();
            this.lowpass.type = 'lowpass';
            this.lowpass.frequency.value = 2000;
            this.analyser = this.audioContext.createAnalyser();
            this.mic.connect(this.lowpass);
            this.lowpass.connect(this.analyser);
            this.micDataArray = new Float32Array(this.analyser.fftSize);
        }).catch(err => {
            console.log(err);
        }).then(() => {
            this.startAnalyzing();
        });

        this.pitchTracker = new PitchTracker(this.audioContext.sampleRate);

        this.pitch = -1;
    }

    startAnalyzing () {
        window.setInterval(() => {
            this.analyser.getFloatTimeDomainData(this.micDataArray);
            this.pitch = this.pitchTracker.getPitch(this.micDataArray);
        }, 50);
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'pitch',
            name: 'Pitch',
            blocks: [
                {
                    opcode: 'getPitch',
                    text: 'pitch',
                    blockType: BlockType.REPORTER
                }
            ]
        };
    }

    getPitch () {
        return this.pitch;
    }
}

module.exports = Scratch3PitchBlocks;
