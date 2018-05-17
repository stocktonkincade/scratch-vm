const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// key with banana
// eslint-disable-next-line max-len
// const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIxLjAuMiwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxMzQuNiAxMzQuNiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTM0LjYgMTM0LjY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZGlzcGxheTpub25lO30KCS5zdDF7ZGlzcGxheTppbmxpbmU7c3Ryb2tlOiNGRkZGRkY7c3Ryb2tlLW1pdGVybGltaXQ6MTA7fQoJLnN0MntmaWxsOiNGRkZGRkY7fQoJLnN0M3tmaWxsOiNFMERGREY7fQoJLnN0NHtmaWxsOiM2RTZGNzE7fQoJLnN0NXtmaWxsOiNGMkRBM0Q7fQo8L3N0eWxlPgo8ZyBpZD0iTGF5ZXJfMiIgY2xhc3M9InN0MCI+Cgk8cmVjdCB4PSItMTAuNCIgeT0iLTMiIGNsYXNzPSJzdDEiIHdpZHRoPSIxNjMuNiIgaGVpZ2h0PSIxNDAiLz4KPC9nPgo8ZyBpZD0iTGF5ZXJfMV8xXyI+Cgk8dGl0bGU+VW50aXRsZWQtMjwvdGl0bGU+Cgk8cGF0aCBjbGFzcz0ic3QyIiBkPSJNMTAxLjgsOTcuOWMwLjQtMC45LDAuOC0xLjksMS4zLTIuN2M3LTExLjIsMTQuMS0yMi40LDIxLjMtMzMuNiBNOTguNSwxMDIuOGMtMS42LDIuOC0zLjIsNS44LTUsOC42CgkJYy0yLjQsMy41LTYuMSwzLjctOS43LDIuOWMtMjMuNS01LjQtNDYuOS0xMS03MC40LTE2LjNDNy4xLDk2LjUsNi45LDkxLjEsOC43LDg3YzAuOC0yLDIuMS0zLjksMy4xLTUuOUMxNS45LDcyLjksMjAsNjQuNiwyNCw1Ni40CgkJYzAuMy0wLjUsMC42LTEuMiwxLTEuN2M2LjgtOS44LDEzLjgtMTkuNCwyMC43LTI5LjJjMS41LTIuMSwzLTQuMyw1LjctNC44YzEuNy0wLjMsMy42LTAuMyw1LjQsMGMxMi4zLDIuMiwyNC43LDQuNSwzNy4xLDYuNwoJCWMyLjcsMC41LDUuNiwwLjYsOC4xLDEuNWMyLjEsMC42LDMuOSwxLjcsNS41LDMuM2M1LjYsNi4xLDEwLjksMTIuNSwxNi40LDE4LjdjMi45LDMuMSwzLjMsNy44LDEuMSwxMS40Ii8+Cgk8cGF0aCBjbGFzcz0ic3QzIiBkPSJNOTcuOSw5OC44bC00LjQsNS44Yy0wLjYtMS45LTEuMy0zLjQtMS42LTQuOWMtMi4zLTkuNS00LjctMTktNi43LTI4LjVjLTAuMi0xLjQsMC4yLTIuNiwwLjktMy44CgkJYzYuMi05LjMsMTIuNi0xOC40LDE5LTI3LjZjMC44LTEuMiwxLjYtMi41LDIuNS0zLjljMSwxLjMsMi4xLDIuNSwzLjEsMy43YzMuOCw0LjcsNy43LDkuNSwxMS41LDE0LjJjMS42LDEuNywxLjcsNC40LDAuNCw2LjMKCQljLTYuNywxMC41LTEzLjUsMjEtMjAuMiwzMS41Yy0wLjUsMC44LTAuOSwxLjctMS4yLDIuNkw5Ny45LDk4Ljh6Ii8+Cgk8cGF0aCBjbGFzcz0ic3Q0IiBkPSJNNjQuMiw2NC40Yy02LjUsMC4xLTEyLjgtMS44LTE4LjEtNS42QzQxLjgsNTYsMzksNTEuMiwzOC44LDQ2Yy0wLjMtMy45LDIuOS02LjIsNi41LTQuNgoJCWMyLjcsMS4yLDUuNCwyLjYsNy45LDQuMWM4LjksNS40LDE4LjEsMy45LDI0LjYtNC4xYzAuNS0wLjcsMC44LTEuNiwxLTIuNGMwLjYtMi4yLDEtNC40LDEuNy02LjVjMC44LTIuNSwyLjktMi45LDQuOS0xLjIKCQljMC41LDAuNSwxLjQsMC43LDEuNywxLjRjMC41LDAuOSwxLjIsMiwxLjEsMi45Yy0wLjMsMS44LTEuMiwzLjYtMS42LDUuNGMtMC4yLDEuMi0wLjEsMi41LDAuMiwzLjZjMS4yLDUuNS0wLjUsOS45LTQuNywxMy41CgkJQzc3LjQsNjIuMyw3MS4zLDY0LjQsNjQuMiw2NC40eiBNNjMuNiw2Mi42YzYuMy0wLjEsMTEuOC0xLjYsMTYuNi01LjNjNC4zLTMuMyw1LjktNy40LDQuNy0xMi43Yy0wLjUtMS45LTAuNC0zLjksMC42LTUuNwoJCWMxLjUtMi42LDAuOS00LjMtMS4zLTZjLTEtMC44LTEuNi0wLjUtMiwwLjVjLTAuNSwxLjQtMS40LDIuOS0xLjQsNC4zYzAuMSwzLjctMi4yLDUuNy00LjcsNy44Yy03LjcsNi43LTE1LjQsNi42LTI0LDEuNwoJCWMtMi42LTEuNS01LjEtMi43LTcuOC0zLjljLTEtMC4zLTIuMS0wLjItMi45LDAuNGMtMC42LDAuNy0xLDEuNy0wLjgsMi42YzAuNSw0LjcsMy4zLDguOCw3LjMsMTEuNEM1Mi42LDYwLjcsNTgsNjIuNCw2My42LDYyLjYKCQlMNjMuNiw2Mi42eiIvPgoJPHBhdGggY2xhc3M9InN0NSIgZD0iTTYzLjYsNjIuNkM1OCw2Mi40LDUyLjYsNjAuNyw0OCw1Ny44Yy00LTIuNS02LjctNi43LTcuMy0xMS40Yy0wLjEtMSwwLjItMS45LDAuOC0yLjYKCQljMC44LTAuNSwxLjktMC43LDIuOS0wLjRjMi42LDEuMiw1LjMsMi41LDcuOCwzLjljOC42LDQuOCwxNi4zLDQuOSwyNC0xLjdjMi41LTIuMiw0LjgtNC4xLDQuNy03LjhjMC0xLjUsMC44LTIuOSwxLjQtNC4zCgkJYzAuNC0xLDEtMS4zLDItMC41YzIuMiwxLjcsMi44LDMuNSwxLjMsNmMtMSwxLjctMS4yLDMuNy0wLjYsNS43YzEuMyw1LjMtMC41LDkuNC00LjcsMTIuN0M3NS4zLDYxLDY5LjksNjIuNSw2My42LDYyLjZ6Ii8+Cgk8cGF0aCBjbGFzcz0ic3Q0IiBkPSJNODYsMTE1LjljLTMtMC42LTYuMS0xLjItOS4xLTEuOWMtMjEuNy01LTQzLjUtMTAuMS02NS4yLTE1LjFjLTQuMS0wLjgtNi43LTQuNy02LTguOGMwLjMtMiwwLjgtMy44LDEuNy01LjcKCQljNC44LTkuNyw5LjYtMTkuNSwxNS0yOC45YzMuNS01LjksNy45LTExLjMsMTEuOS0xN2MzLjYtNS4xLDcuNC0xMC4xLDEwLjktMTUuMmMzLjMtNC43LDcuNy01LjEsMTIuOC00LjIKCQljMTQuMSwyLjYsMjguMyw1LjEsNDIuNCw3LjVjNS4yLDAuOCw4LjUsNC4xLDExLjcsNy44YzQuMSw0LjgsOC40LDkuNSwxMi42LDE0LjJjNCw0LjcsNS42LDkuOCwxLjYsMTUuNgoJCWMtOS42LDE0LjMtMTguOCwyOC44LTI4LjEsNDMuMmMtMC41LDAuNi0wLjksMS40LTEuMywyQzk0LjYsMTEzLjgsOTEsMTE1LjksODYsMTE1Ljl6IE0xMDQuMiw5NC4xQzExMS4xLDgzLjQsMTE4LDcyLjcsMTI1LDYyCgkJYzIuMy0zLjYsMS44LTguMi0xLjEtMTEuM2MtNS41LTYuMS0xMC44LTEyLjQtMTYuNC0xOC41Yy0xLjYtMS42LTMuNC0yLjYtNS41LTMuM2MtMi42LTAuOC01LjUtMC45LTguMS0xLjUKCQljLTEyLjMtMi4xLTI0LjctNC4zLTM3LjEtNi40Yy0xLjctMC4zLTMuNi0wLjMtNS4zLDBjLTIuNywwLjUtNC4zLDIuNi01LjcsNC43QzM4LjgsMzUuNCwzMS45LDQ1LDI1LDU0LjZjLTAuNCwwLjUtMC43LDEuMS0xLDEuNgoJCWMtNC4xLDguMS04LjIsMTYuMi0xMi4zLDI0LjRjLTEsMS45LTIuMiwzLjgtMy4xLDUuOGMtMS43LDQtMS41LDkuNCw0LjcsMTAuOGMyMy41LDUuMiw0NywxMC45LDcwLjQsMTYuMWMzLjYsMC44LDcuMywwLjUsOS43LTIuOQoJCSIvPgo8L2c+Cjwvc3ZnPgo=';

// just a banana
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMTM0LjYgMTM0LjYiPjxzdHlsZT4uc3QwLC5zdDN7ZmlsbDojNmU2ZjcxfS5zdDN7ZGlzcGxheTppbmxpbmV9PC9zdHlsZT48ZyBpZD0iTGF5ZXJfMV8xXyI+PHBhdGggY2xhc3M9InN0MCIgZD0iTTQ5LjcgMTIwLjVjLTExLjEgMC0yMi01LTI5LTEzLjQtMy4zLTMuNy00LjUtOC4yLTMuMy0xMi40IDEuMy00LjIgNC44LTcuMyA5LjctOC41IDYuNC0xLjYgMTMuMi0yLjggMTkuNi0zLjYgMjEuNS0yLjUgMzQuNS0xNi42IDM1LTM3LjgtLjEtMS4yLS41LTIuNy0xLjMtNC41LS43LTEuOC0xLjUtMy41LTIuMy01LjItMS4zLTIuOC0yLjYtNS42LTMuNi04LjYtMS4yLTMuMi0uOS02LjIuNi04LjUgMS42LTIuMyA0LjUtMy42IDguMS0zLjZoMS4xYy4zIDAgLjcgMCAxLjEtLjEuNS0uMSAxLjEtLjEgMS43LS4xIDEgMCAxLjkuMiAyLjYuNmwuNi4zYzIuMi45IDQuOSAyLjEgNi4zIDQuM2wuMS4xYzEuMSAyLjEgMS45IDQuNCAyLjcgNi43LjYgMS44IDEuMiAzLjQgMS45IDUgMSAxLjkgMi43IDMuOCA0LjUgNS4xbC4xLjFjOS45IDguMyAxMy42IDE5LjIgMTAuOSAzMi4zLTIuNiAxNC4yLTEwLjUgMjYuNS0yMy42IDM2LjYtMTEuNyA5LjQtMjUuNyAxNC43LTQwLjUgMTUuMi0uOS0uMS0yIDAtMyAwek0yNi42IDk4LjNjMCAxLjQuNSAyLjYgMS4yIDMuMmwuMS4xLjEuMWM1LjggNiAxNCA5LjMgMjMgOS4zIDEgMCAyIDAgMy0uMSAxMS44LTEuMSAyMy4xLTUuMyAzMi42LTEyLjIgMTEuMi05IDE3LjgtMTguNiAyMC44LTMwLjMgMi44LTEwLjguMi0xOS04LjEtMjUuOS00LjItMy4yLTYuOC03LjUtNy41LTEyLjMtLjctNS0yLjYtNi41LTcuOC02LjVoLS41YzAgLjEgMCAuMi4xLjMuMy45LjYgMS45LjggMi45LjUgMi4xIDEuMSA0LjMgMi4xIDUuNiA2IDcuMyA0LjMgMTUuMSAyLjggMjJDODUgNzYuNyA3MS44IDg4LjYgNDcuOCA5MmMtNS43LjgtMTEuMiAxLjktMTguNCAzLjctMS40LjUtMi40IDEuNS0yLjggMi42eiIvPjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik05MS43IDEwMy4xYy0xMS4yIDktMjQuNyAxNC4yLTM5LjEgMTQuNy0xMS4zLjktMjIuNi0zLjYtMzAtMTIuNC01LjgtNi40LTMuMy0xNC43IDUuMS0xNi44QzM0IDg3IDQwLjYgODUuOCA0NyA4NS4xYzIyLjgtMi42IDM2LjgtMTcuNyAzNy4zLTQwLjQtLjEtMS45LS44LTMuOS0xLjUtNS41LTEuOS00LjYtNC4yLTktNS44LTEzLjYtMi01LjQgMS4xLTkgNi45LTguNyAxLjUuMiAzLjQtLjcgNC44LjEgMi4xLjkgNC44IDEuOSA1LjggMy42IDEuOSAzLjUgMi44IDcuOSA0LjUgMTEuNiAxLjMgMi40IDMuMiA0LjUgNS4yIDYgOS41IDcuOSAxMi41IDE3LjkgMTAuMSAyOS44LTIuNSAxMy42LTEwLjMgMjUuNS0yMi42IDM1LjF6bS0zLjUtMi4zYzEwLjgtOC43IDE4LjQtMTguNyAyMS43LTMxLjYgMy0xMS42LjMtMjAuOC05LTI4LjQtMy40LTIuNi02LTYuMi02LjctMTAuNy0uOS02LjYtNC4yLTguNy0xMC40LTguNy0yLjggMC0zLjUgMS4zLTIuOCAzLjYgMSAzLjEgMS41IDYuOSAzLjQgOS40IDUuMiA2LjMgMy45IDEyLjkgMi40IDE5LjlDODIuNSA3Ni4yIDY5IDg2LjQgNDcuNCA4OS41Yy02LjYuOS0xMi41IDIuMi0xOC44IDMuNy0yLjEuOC0zLjkgMi41LTQuNSA0LjYtLjEgMiAuNiA0LjMgMi4xIDUuNiA3LjIgNy41IDE3LjYgMTAuOSAyOC4xIDEwIDEyLjItMS4xIDIzLjktNS40IDMzLjktMTIuNnoiLz48cGF0aCBkPSJNODcuNiAxMDAuNmMtMTAgNy4yLTIxLjcgMTEuNi0zMy42IDEyLjctMTAuMyAxLjEtMjAuNy0yLjYtMjguMS0xMC0xLjUtMS42LTIuMi0zLjYtMi4xLTUuNi43LTIgMi40LTMuOCA0LjUtNC42IDYuMS0xLjQgMTIuNi0yLjggMTguOC0zLjcgMjEuNC0zLjMgMzUtMTMuNSAzOS41LTM1LjQgMS40LTcuMiAyLjgtMTMuNi0yLjQtMTkuOS0yLTIuNi0yLjUtNi4xLTMuNC05LjQtLjctMi4zIDAtMy42IDIuOC0zLjYgNi4xIDAgOS42IDIuMyAxMC40IDguNy42IDQuMyAyLjkgOC4xIDYuNyAxMC43IDkuNCA3LjUgMTEuOCAxNyA5IDI4LjQtMy45IDEzLjEtMTEuMiAyMy0yMi4xIDMxLjd6IiBmaWxsPSIjZjJkYTNkIi8+PC9nPjwvc3ZnPg==';

const menuIconURI = blockIconURI;

/**
 * Class for the makey makey blocks in Scratch 3.0
 * @constructor
 */
class Scratch3MakeyMakeyBlocks {
    constructor (runtime) {
        this.runtime = runtime;
        this.keyRepeatFlags = {};
    }
    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'makeymakey',
            name: 'Makey Makey',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'whenMakeyKeyPressed',
                    text: 'when [KEY] key pressed',
                    blockType: BlockType.HAT,
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            menu: 'KEY',
                            defaultValue: 'space'
                        }
                    }
                },
                {
                    opcode: 'whenMakeyKeyReleased',
                    text: 'when [KEY] key released',
                    blockType: BlockType.HAT,
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            menu: 'KEY',
                            defaultValue: 'space'
                        }
                    }
                }
                // {
                //     opcode: 'playSoundOnNote',
                //     text: 'play [SOUND] on note [NOTE]',
                //     blockType: BlockType.COMMAND,
                //     arguments: {
                //         SOUND: {
                //             type: ArgumentType.STRING,
                //             menu: 'SOUNDS',
                //             defaultValue: this.getSounds()[0].value
                //         },
                //         NOTE: {
                //             type: ArgumentType.STRING,
                //             menu: 'NOTES',
                //             defaultValue: '0'
                //         }
                //     }
                // }
            ],
            menus: {
                KEY: [
                    {text: 'space', value: 'space'},
                    {text: '← left arrow', value: 'left arrow'},
                    {text: '→ right arrow', value: 'right arrow'},
                    {text: '↓ down arrow', value: 'down arrow'},
                    {text: '↑ up arrow', value: 'up arrow'},
                    {text: 'w', value: 'w'},
                    {text: 'a', value: 'a'},
                    {text: 's', value: 's'},
                    {text: 'd', value: 'd'},
                    {text: 'f', value: 'f'},
                    {text: 'g', value: 'g'}
                ]
                // SOUNDS: 'getSounds',
                // NOTES: [
                //     {text: 'C', value: 0},
                //     {text: 'D', value: 20},
                //     {text: 'E', value: 40},
                //     {text: 'F', value: 50},
                //     {text: 'G', value: 70},
                //     {text: 'A', value: 90},
                //     {text: 'B', value: 110},
                //     {text: 'C2', value: 120}
                // ]
            }
        };
    }
    whenMakeyKeyPressed (args, util) {
        if (typeof this.keyRepeatFlags[args.KEY] === 'undefined') {
            this.keyRepeatFlags[args.KEY] = false;
        }
        // If the selected key is down, toggle its flag.
        // This will cause the hat to trigger every other frame (15 per second).
        // @todo: consider which of these options for key repeat to go with:
        // A) Repeat immediately at 15 presses per second (current version)
        // B) Repeat immediately at a lower rate (10fps?)
        // C) Fire once, short delay, then repeat at some rate (simulating
        //    typical OS level keyboard auto-repeat)
        // D) Do not repeat
        if (util.ioQuery('keyboard', 'getKeyIsDown', [args.KEY])) {
            this.keyRepeatFlags[args.KEY] = !this.keyRepeatFlags[args.KEY];
        } else {
            this.keyRepeatFlags[args.KEY] = false;
        }
        return this.keyRepeatFlags[args.KEY];
    }

    whenMakeyKeyReleased (args, util) {
        return (!util.ioQuery('keyboard', 'getKeyIsDown', [args.KEY]));
    }

    // playSoundOnNote (args, util) {
    //     const index = this.getSoundIndexByName(args.SOUND, util);
    //     if (index >= 0) {
    //         const soundId = util.target.sprite.sounds[index].soundId;
    //         if (util.target.audioPlayer === null) return;
    //         util.target.audioPlayer.setEffect('pitch', args.NOTE);
    //         util.target.audioPlayer.playSound(soundId);
    //     }
    // }
    //
    // getSoundIndexByName (soundName, util) {
    //     const sounds = util.target.sprite.sounds;
    //     for (let i = 0; i < sounds.length; i++) {
    //         if (sounds[i].name === soundName) {
    //             return i;
    //         }
    //     }
    //     // if there is no sound by that name, return -1
    //     return -1;
    // }
    //
    // getSounds () {
    //     const sounds = this.runtime._editingTarget.sprite.sounds;
    //     return sounds.map(sound => {
    //         const obj = {};
    //         obj.text = sound.name;
    //         obj.value = sound.name;
    //         return obj;
    //     });
    // }
}
module.exports = Scratch3MakeyMakeyBlocks;
