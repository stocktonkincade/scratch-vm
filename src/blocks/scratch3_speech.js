const Cast = require('../util/cast');
const log = require('../util/log');

class Scratch3SpeechBlocks {

    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        /**
         * Try to correctly prefix the speech recognition object across browsers.
         */
        this.SpeechRecognition = window.SpeechRecognition ||
                              window.webkitSpeechRecognition ||
                              window.mozSpeechRecognition ||
                              window.msSpeechRecognition ||
                              window.oSpeechRecognition;

        /**
         * A flag to indicate that speech recognition is paused during a speech synthesis utterance
         * to avoid feedback. This is used to avoid stopping and re-starting the speech recognition
         * engine.
         * @type {Boolean}
         */
        this.speechRecognitionPaused = false;

        /**
         * The most recent result from the speech recognizer, used for a reporter block.
         * @type {String}
         */
        this.latest_speech = '';

        /**
         * The name of the selected voice for speech synthesis.
         * @type {String}
         */
        this.current_voice_name = 'default';

        /**
         * The current speech synthesis utterance object.
         * Storing the utterance prevents a bug in which garbage collection causes the onend event to fail.
         * @type {String}
         */
        this.current_utterance = null;

        this.runtime.HACK_SpeechBlocks = this;
    }

    /**
     * Retrieve the block primitives implemented by this package.
     * @return {object.<string, Function>} Mapping of opcode to Function.
     */
    getPrimitives () {
        return {
            speech_whenihear: this.hatWhenIHear,
            speech_speak: this.speak,
            speech_setvoice: this.setVoice,
            speech_getlatestspeech: this.getLatestSpeech
        };
    }

    getHats () {
        return {
            speech_whenihear: {
                restartExistingThreads: false,
                edgeActivated: true
            }
        };
    }

    /* //////////////// Speech Recognition ///////////////// */

    startSpeechRecogntion () {
        this.recognition = new this.SpeechRecognition();
        this.recognition.interimResults = true;
        this.recognized_speech = [];

        this.recognition.onresult = function (event) {
            if (this.speechRecognitionPaused) {
                return;
            }

            const SpeechRecognitionResult = event.results[event.resultIndex];
            const results = [];
            for (let k = 0; k < SpeechRecognitionResult.length; k++) {
                results[k] = SpeechRecognitionResult[k].transcript.toLowerCase();
            }
            this.recognized_speech = results;

            this.latest_speech = this.recognized_speech[0];
        }.bind(this);

        this.recognition.onend = function () {
            if (this.speechRecognitionPaused) {
                return;
            }
            this.recognition.start();
        }.bind(this);

        this.recognition.onstart = function () {
            log.warn('Speech recognition started');
        };

        this.recognition.onerror = function (event) {
            log.warn('Speech recognition error', event.error);
        };

        this.recognition.onnomatch = function () {
            log.warn('Speech recognition: no match');
        };

        try {
            this.recognition.start();
        } catch (e) {
            log.warn(e);
        }
    }

    hatWhenIHear (args) {
        if (!this.recognition) {
            return;
        }

        let input = Cast.toString(args.STRING).toLowerCase();
        // facilitate matches by removing some punctuation: . ? !
        input = input.replace(/[.?!]/g, '');
        // trim off any white space
        input = input.trim();

        if (input === '') return false;

        for (let i = 0; i < this.recognized_speech.length; i++) {
            if (this.recognized_speech[i].includes(input)) {
                // This timeout gives time for other hats
                // to fire before we clear the speech array
                window.setTimeout(() => {
                    this.recognized_speech = [];
                }, 60);
                return true;
            }
        }
        return false;
    }

    getLatestSpeech () {
        return this.latest_speech;
    }

    /* //////////////// Speech Synthesis ///////////////// */

    setVoice (args) {
        if (args.VOICE === 'Random') {
            const voices = this.getVoices();
            const index = Math.floor(Math.random() * voices.length);
            this.current_voice_name = voices[index].name;
        } else {
            this.current_voice_name = args.VOICE;
        }
    }

    getVoices () {
        if (typeof speechSynthesis === 'undefined') {
            return;
        }

        const voices = speechSynthesis.getVoices();

        const scratchVoiceNames = ['Alex', 'Samantha', 'Whisper', 'Zarvox', 'Bad News',
            'Daniel', 'Pipe Organ', 'Boing', 'Karen', 'Ralph', 'Trinoids'];

        const availableVoices = [];

        for (let i = 0; i < voices.length; i++) {
            if (scratchVoiceNames.includes(voices[i].name)) {
                availableVoices.push(voices[i]);
            }
        }

        return availableVoices;
    }

    speak (args) {
        const input = Cast.toString(args.STRING).toLowerCase();

        this.stopSpeaking();

        this.current_utterance = new SpeechSynthesisUtterance(input);

        const voices = this.getVoices();
        for (let i = 0; i < voices.length; i++) {
            if (this.current_voice_name === voices[i].name) {
                this.current_utterance.voice = voices[i];
            }
        }

        // Pause speech recognition during speech synthesis
        this.speechRecognitionPaused = true;
        if (this.recognition) {
            this.recognition.stop();
        }

        speechSynthesis.speak(this.current_utterance);

        return new Promise(resolve => {
            this.current_utterance.onend = () => {
                if (this.speechRecognitionPaused) {
                    this.speechRecognitionPaused = false;
                    if (this.recognition) {
                        try {
                            this.recognition.start();
                        } catch (e) {
                            log.warn(e);
                        }
                    }
                }
                resolve();
            };
        });
    }

    stopSpeaking () {
        // Stop any currently playing utterances
        speechSynthesis.cancel();
    }
}

module.exports = Scratch3SpeechBlocks;
