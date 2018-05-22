const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMTM0LjYgMTM0LjYiPjxzdHlsZT4uc3Qwe2ZpbGw6IzZlNmY3MX08L3N0eWxlPjxnIGlkPSJMYXllcl8xXzFfIj48cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjQuNiA5MS43Yy04LjYtNi45LTE0LTE3LjYtMTQuMi0yOC41LS4zLTQuOSAxLjYtOS4yIDUuMi0xMS43czguMy0yLjcgMTIuOC0uNmM2IDIuNyAxMiA2LjEgMTcuNSA5LjQgMTguMyAxMS41IDM3LjEgOC42IDUwLjgtNy41LjctMSAxLjMtMi40IDEuOC00LjMuNi0xLjggMS0zLjcgMS41LTUuNS43LTMgMS41LTYgMi42LTguOSAxLjEtMy4yIDMuMi01LjQgNS44LTYuMiAyLjctLjggNS43IDAgOC41IDIuM2wuOS43Yy4yLjIuNS40LjkuNi41LjIuOS42IDEuNCAxIC44LjYgMS40IDEuMyAxLjYgMi4xbC4zLjZjMS4xIDIuMSAyLjUgNC43IDIuMiA3LjN2LjFjLS41IDIuMy0xLjMgNC42LTIuMSA2LjktLjcgMS44LTEuMiAzLjQtMS42IDUuMS0uNCAyLjEtLjMgNC42LjMgNi44di4xYzIuNSAxMi42LTEuNCAyMy40LTExLjcgMzEuOS0xMC45IDkuNC0yNC43IDE0LTQxLjIgMTMuN0M1MyAxMDcgMzguOCAxMDIuNCAyNyA5My41Yy0uNy0uNi0xLjYtMS4yLTIuNC0xLjh6TTIwLjUgNjBjLS45IDEuMS0xLjIgMi4zLTEuMSAzLjJ2LjJjLjggOC4zIDUuMSAxNiAxMi4xIDIxLjZsMi40IDEuOGM5LjkgNi41IDIxLjIgMTAuMyAzMi45IDEwLjkgMTQuMyAwIDI1LjQtMy4zIDM1LjEtMTAuNiA4LjktNi42IDEyLTE0LjYgOS45LTI1LjItMS4zLTUuMS0uNi0xMC4xIDEuOC0xNC4yIDIuNi00LjMgMi02LjctMi05LjlsLS40LS4zYy0uMS4xLS4xLjItLjEuMy0uMy45LS43IDEuOC0xLjIgMi44LS45IDEuOS0xLjggNC0xLjkgNS43LjEgOS40LTYuMSAxNC40LTExLjUgMTguOC0xNy4yIDE0LjYtMzQuOSAxNS42LTU1LjYgMy4yLTQuOS0yLjktOS45LTUuNS0xNi42LTguNi0xLjQtLjQtMi44LS4zLTMuOC4zeiIvPjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik02OC4xIDEwNC4zYy0xNC4zIDAtMjgtNC40LTM5LjUtMTNDMTkuMiA4NSAxMy4zIDc0LjUgMTMgNjNjLS41LTguNiA2LjYtMTMuNSAxNC40LTkuOSA1LjkgMi43IDExLjggNS45IDE3LjIgOS4zIDE5LjMgMTIuMiAzOS42IDkuMiA1NC4yLTguMSAxLjEtMS41IDEuOC0zLjUgMi4zLTUuMiAxLjQtNC44IDIuNC05LjYgNC0xNC4yIDEuOC01LjQgNi41LTYuMyAxMC44LTIuNSAxIDEuMSAzLjEgMS42IDMuNyAzLjEgMS4xIDIgMi41IDQuNSAyLjMgNi40LS43IDMuOS0yLjggNy45LTMuNyAxMS44LS41IDIuNy0uMyA1LjUuMyA3LjlDMTIxIDczLjcgMTE3IDgzLjMgMTA3LjggOTFjLTEwLjcgOS4yLTI0LjEgMTMuNi0zOS43IDEzLjN6bS0xLjMtMy45YzEzLjggMCAyNi0zLjEgMzYuNi0xMSA5LjYtNy4xIDEzLjItMTYgMTAuNy0yNy43LTEtNC4xLS44LTguNiAxLjUtMTIuNSAzLjQtNS43IDIuMi05LjQtMi43LTEzLjItMi4yLTEuNy0zLjUtMS4yLTQuNCAxLjEtMS4yIDMtMy4xIDYuMy0zLjIgOS40LjEgOC4xLTUgMTIuNS0xMC41IDE3LTE3IDE0LjMtMzMuOCAxMy44LTUyLjYgMi44LTUuNy0zLjQtMTEuMS02LjEtMTYuOS04LjgtMi4xLS43LTQuNi0uNS02LjQuOC0xLjMgMS41LTIuMiAzLjctMS45IDUuNyAxIDEwIDYuOSAxOS4yIDE1LjYgMjUgMTAuMiA2LjggMjIgMTAuNyAzNC4yIDExLjR6Ii8+PHBhdGggZD0iTTY2LjUgOTkuOGMtMTIuMy0uNi0yNC4xLTQuNS0zNC0xMS4xLTguNy01LjUtMTQuNS0xNC45LTE1LjYtMjUuMi0uMi0yLjIuNS00LjIgMS45LTUuNyAxLjgtMS4xIDQuMi0xLjUgNi40LS44IDUuNiAyLjcgMTEuNSA1LjcgMTYuOSA4LjhDNjAuNyA3Ni43IDc3LjYgNzcuMiA5NC44IDYzYzUuNi00LjcgMTAuNy04LjggMTAuNS0xNyAuMS0zLjMgMS45LTYuMyAzLjItOS40LjktMi4yIDIuMi0yLjggNC40LTEuMSA0LjcgMy44IDYgNy44IDIuNyAxMy4yLTIuMiAzLjctMi44IDguMS0xLjUgMTIuNSAyLjYgMTEuNy0xLjQgMjAuNi0xMC43IDI3LjctMTEuMiA3LjgtMjMgMTEtMzYuOSAxMC45eiIgZmlsbD0iI2YyZGEzZCIvPjwvZz48L3N2Zz4=';

const menuIconURI = blockIconURI;

/**
 * Class for the makey makey blocks in Scratch 3.0
 * @constructor
 */
class Scratch3MakeyMakeyBlocks {
    constructor (runtime) {
        this.runtime = runtime;
        this.frameCounter = 0;
        setInterval(() => this.frameCounter++, this.runtime.currentStepTime);

        this.konamiArray = [
            'up arrow',
            '',
            'up arrow',
            '',
            'down arrow',
            '',
            'down arrow',
            '',
            'left arrow',
            '',
            'right arrow',
            '',
            'left arrow',
            '',
            'right arrow',
            ''
        ];
        this.konamiIndex = 0;
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
                    text: 'while [KEY] key held down',
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
                },
                {
                    opcode: 'whenKonamiCodePressed',
                    text: 'when konami code pressed',
                    blockType: BlockType.HAT
                }

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
            }
        };
    }

    whenMakeyKeyPressed (args, util) {
        const isDown = this.isKeyDown(args.KEY, util);
        return isDown && (this.frameCounter % 2 === 0);
    }

    whenMakeyKeyReleased (args, util) {
        return !this.isKeyDown(args.KEY, util);
    }

    whenKonamiCodePressed (args, util) {
        if (this.konamiArray[this.konamiIndex] === '') {
            if (!this.isKeyDown(this.konamiArray[this.konamiIndex - 1], util)) {
                this.konamiIndex++;
            }
            return false;
        }
        if (this.isKeyDown(this.konamiArray[this.konamiIndex], util)) {
            this.konamiIndex++;
        } else if (this.isKeyDown('any', util)) {
            this.konamiIndex = 0;
        }
        if (this.konamiIndex === this.konamiArray.length) {
            this.konamiIndex = 0;
            return true;
        }
        return false;
    }

    isKeyDown (keyArg, util) {
        return util.ioQuery('keyboard', 'getKeyIsDown', [keyArg]);
    }
}
module.exports = Scratch3MakeyMakeyBlocks;
