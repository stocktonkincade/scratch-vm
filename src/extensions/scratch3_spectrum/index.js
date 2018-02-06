const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const log = require('../../util/log');
const Cast = require('../../util/cast');
const MathUtil = require('../../util/math-util');
const Timer = require('../../util/timer');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const menuIconURI = 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNDAgNDAiPjxzdHlsZT4uc3Qwe3N0cm9rZTojMDAwO3N0cm9rZS1taXRlcmxpbWl0OjEwfTwvc3R5bGU+PHBhdGggY2xhc3M9InN0MCIgZD0iTTExLjMgMTRoMS41djEyaC0xLjV6TTE1LjMgOGgxLjV2MjRoLTEuNXpNMTkuMiAzaDEuNXYzNGgtMS41ek03LjMgMTdoMS41djZINy4zek0zLjMgMTguNWgxLjV2M0gzLjN6Ii8+PHBhdGggdHJhbnNmb3JtPSJyb3RhdGUoLTE4MCAyNy45NzcgMjApIiBjbGFzcz0ic3QwIiBkPSJNMjcuMiAxNGgxLjV2MTJoLTEuNXoiLz48cGF0aCB0cmFuc2Zvcm09InJvdGF0ZSgtMTgwIDIzLjk4OCAyMCkiIGNsYXNzPSJzdDAiIGQ9Ik0yMy4yIDhoMS41djI0aC0xLjV6Ii8+PHBhdGggdHJhbnNmb3JtPSJyb3RhdGUoLTE4MCAzMS45NjUgMjApIiBjbGFzcz0ic3QwIiBkPSJNMzEuMiAxN2gxLjV2NmgtMS41eiIvPjxwYXRoIHRyYW5zZm9ybT0icm90YXRlKC0xODAgMzUuOTUzIDIwKSIgY2xhc3M9InN0MCIgZD0iTTM1LjIgMTguNWgxLjV2M2gtMS41eiIvPjwvc3ZnPg==';
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNDAgNDAiPjxzdHlsZT4uc3Qwe2ZpbGw6I2ZmZjtzdHJva2U6I2ZmZjtzdHJva2UtbWl0ZXJsaW1pdDoxMH08L3N0eWxlPjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0xMS4zIDE0aDEuNXYxMmgtMS41ek0xNS4zIDhoMS41djI0aC0xLjV6TTE5LjIgM2gxLjV2MzRoLTEuNXpNNy4zIDE3aDEuNXY2SDcuM3pNMy4zIDE4LjVoMS41djNIMy4zeiIvPjxwYXRoIHRyYW5zZm9ybT0icm90YXRlKC0xODAgMjcuOTc3IDIwKSIgY2xhc3M9InN0MCIgZD0iTTI3LjIgMTRoMS41djEyaC0xLjV6Ii8+PHBhdGggdHJhbnNmb3JtPSJyb3RhdGUoLTE4MCAyMy45ODggMjApIiBjbGFzcz0ic3QwIiBkPSJNMjMuMiA4aDEuNXYyNGgtMS41eiIvPjxwYXRoIHRyYW5zZm9ybT0icm90YXRlKC0xODAgMzEuOTY1IDIwKSIgY2xhc3M9InN0MCIgZD0iTTMxLjIgMTdoMS41djZoLTEuNXoiLz48cGF0aCB0cmFuc2Zvcm09InJvdGF0ZSgtMTgwIDM1Ljk1MyAyMCkiIGNsYXNzPSJzdDAiIGQ9Ik0zNS4yIDE4LjVoMS41djNoLTEuNXoiLz48L3N2Zz4=';
/**
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class Scratch3SpectrumBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        this.timer = new Timer();
        this.spectrumTime = this.timer.time();
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'spectrum',
            name: 'Spectrum',
            blockIconURI: blockIconURI,
            menuIconURI: menuIconURI,
            blocks: [
                {
                    opcode: 'getBand',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'spectrum.getBand',
                        default: 'get band [BAND]',
                        description: 'get the energy in the requested frequency band index'
                    }),
                    arguments: {
                        BAND: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                }
            ]
        };
    }

    getBand (args) {
        if (typeof this.runtime.currentStepTime === 'undefined') return -1;

        const timeSinceSpectrum = this.timer.time() - this.spectrumTime;
        if (timeSinceSpectrum > this.runtime.currentStepTime) {
            this.analyze();
            this.spectrumTime = this.timer.time();
        }

        return this.getBandValue(args.BAND);
    }

    getBandValue (band) {
        if (typeof this.frequencyArray === 'undefined') return -1;

        let bandNum = Cast.toNumber(band);
        bandNum = MathUtil.clamp(bandNum, 1, this.frequencyArray.length);
        let energy = this.frequencyArray[bandNum - 1];
        energy = (energy / 255) * 100;

        return energy;
    }

    analyze () {
        if (typeof this.runtime.audioEngine === 'undefined') return;
        const audioContext = this.runtime.audioEngine.audioContext;

        // The microphone has not been set up, so try to connect to it
        if (!this.mic && !this.connectingToMic) {
            this.connectingToMic = true; // prevent multiple connection attempts
            navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
                this.audioStream = stream;
                this.mic = audioContext.createMediaStreamSource(stream);
                this.analyser = audioContext.createAnalyser();
                this.analyser.fftSize = 1024;
                this.analyser.smoothingTimeConstant = 0.2;
                this.mic.connect(this.analyser);
                this.frequencyArray = new Uint8Array(this.analyser.frequencyBinCount);

            })
                .catch(err => {
                    log.warn(err);
                });
        }

        // If the microphone is set up and active, analyze the spectrum
        if (this.mic && this.audioStream.active) {
            this.analyser.getByteFrequencyData(this.frequencyArray);
        }
    }

}

module.exports = Scratch3SpectrumBlocks;
