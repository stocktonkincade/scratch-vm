var Cast = require('../util/cast');

var Scratch3SpeechBlocks = function (runtime) {
    /**
     * The runtime instantiating this block package.
     * @type {Runtime}
     */
    this.runtime = runtime;

    /**
     * The most recent result from the speech recognizer, used for a reporter block.
     * @type {String}
     */
    this.latest_speech = '';

    /**
     * The name of the selected voice for speech synthesis.
     * @type {String}
     */
    this.current_voice = 'default';

    this.runtime.HACK_SpeechBlocks = this;
};

/**
 * Retrieve the block primitives implemented by this package.
 * @return {object.<string, Function>} Mapping of opcode to Function.
 */
Scratch3SpeechBlocks.prototype.getPrimitives = function () {
    return {
        speech_whenihear: this.hatWhenIHear,
        speech_speak: this.speak,
        speech_setvoice: this.setVoice,
        speech_getlatestspeech: this.getLatestSpeech
    };
};

Scratch3SpeechBlocks.prototype.getHats = function () {
    return {
        speech_whenihear: {
            restartExistingThreads: false,
            edgeActivated: true
        }
    };
};

Scratch3SpeechBlocks.prototype.startSpeechRecogntion = function () {
    if (!this.recognition) {
        console.log('starting speech recognition');
        this.recognition = new webkitSpeechRecognition();
        this.recognition.interimResults = true;
        // this.recognition.continuous = true;
        this.recognized_speech = '';

        this.recognition.onresult = function (event) {
            console.log(event.results);
            this.recognized_speech = event.results[0][0].transcript.toLowerCase();
            console.log('speech recognition result: ' + this.recognized_speech);
            this.latest_speech = this.recognized_speech;
        }.bind(this);

        this.recognition.onend = function () {
            this.recognition.start();
            this.recognized_speech = '';
            console.log('speech recognition restarting');
        }.bind(this);

        this.recognition.start();
    }
};
Scratch3SpeechBlocks.prototype.setVoice = function (args) {
    this.current_voice = args.VOICE;
};

Scratch3SpeechBlocks.prototype.getVoices = function () {
    if(typeof speechSynthesis === 'undefined') {
        return;
    }

    const voices = speechSynthesis.getVoices();

    const scratchVoices = ['Alex', 'Samantha', 'Cellos', 'Whisper', 'Zarvox', 'Bells', 'Bad News',
        'Daniel', 'Fiona', 'Junior', 'Pipe Organ'];

    var availableVoices = [];

    for (let i = 0; i < voices.length; i++) {
        if (scratchVoices.includes(voices[i].name)) {
            availableVoices.push(voices[i]);
        }
    }

    return availableVoices;
};

Scratch3SpeechBlocks.prototype.hatWhenIHear = function (args) {
    var input = Cast.toString(args.STRING).toLowerCase();

    if (input === '') return false;

    if (this.recognized_speech.includes(input)) {
        console.log('detected: ' + input);
        this.recognized_speech = '';
        return true;
    }
    return false;
};

Scratch3SpeechBlocks.prototype.getLatestSpeech = function () {
    return this.latest_speech;
};

Scratch3SpeechBlocks.prototype.speak = function (args, util) {
    var input = Cast.toString(args.STRING).toLowerCase();

    var utterance = new SpeechSynthesisUtterance(input);

    const voices = this.getVoices();
    for (let i = 0; i < voices.length; i++) {
        if (this.current_voice === voices[i].name) {
            utterance.voice = voices[i];
        }
    }

    speechSynthesis.speak(utterance);

    return new Promise(function (resolve) {
        utterance.onend = function () {
            resolve();
        };
    });
};

module.exports = Scratch3SpeechBlocks;
