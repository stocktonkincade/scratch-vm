const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const log = require('../../util/log');
const Cast = require('../../util/cast');
const formatMessage = require('format-message');
const MathUtil = require('../../util/math-util');
const BLE = require('../../io/ble');
const godirect = require('@vernier/godirect/dist/godirect.min.umd.js');
const ScratchLinkDeviceAdapter = require('./scratch-link-device-adapter');

/**
 * Icon png to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoOCAuNSkiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZD0iTTEyIDM5LjVBMi41IDIuNSAwIDAgMSA5LjUgMzdjMC0uMy4yLS41LjUtLjVzLjUuMi41LjVhMS41IDEuNSAwIDEgMCAzIDB2LS4yYzAtLjQtLjItLjgtLjUtMWwtLjgtLjljLS41LS40LS43LTEtLjctMS43VjMxYzAtLjMuMi0uNS41LS41cy41LjIuNS41djIuMmMwIC40LjEuOC40IDFsLjguOWMuNS40LjggMSAuOCAxLjd2LjJjMCAxLjQtMS4xIDIuNS0yLjUgMi41eiIgZmlsbD0iI0U2RTdFOCIvPjxwYXRoIGQ9Ik0yMy43LjNBMSAxIDAgMCAwIDIzIDBIMWExIDEgMCAwIDAtLjcuM0ExIDEgMCAwIDAgMCAxdjI2YzAgLjMuMS41LjMuNy4yLjIuNC4zLjcuM2gyMmMuMyAwIC41LS4xLjctLjMuMi0uMi4zLS40LjMtLjdWMWExIDEgMCAwIDAtLjMtLjd6TTEyIDRjMiAwIDMuMyAyIDIuNiAzLjhMMTMuMyAxMWExLjQgMS40IDAgMCAxLTIuNyAwTDkuNSA3LjdsLS4yLTFDOS4yIDUuNCAxMC40IDQgMTIgNHoiIHN0cm9rZT0iIzdDODdBNSIgZmlsbD0iIzg1OTJBRiIgZmlsbC1ydWxlPSJub256ZXJvIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMiAydjI0aDIwVjJIMnptMTAgMmMyIDAgMy4zIDIgMi42IDMuOEwxMy4zIDExYTEuNCAxLjQgMCAwIDEtMi43IDBMOS41IDcuN2wtLjItMUM5LjIgNS40IDEwLjQgNCAxMiA0eiIgc3Ryb2tlPSIjN0M4N0E1IiBmaWxsPSIjNUNCMUQ2IiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIHN0cm9rZT0iIzdDODdBNSIgZmlsbD0iIzg1OTJBRiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNMjIgMjZIMnYtNmwyMC00eiIvPjxwYXRoIGQ9Ik0uMyAyNy43TDIgMjZNLjMuM0wyIDJNMjIgMkwyMy43LjNNMjMuNyAyNy43TDIyIDI2IiBzdHJva2U9IiM3Qzg3QTUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxjaXJjbGUgZmlsbD0iI0ZGQkYwMCIgY3g9IjEyIiBjeT0iMTQuOCIgcj0iMS4yIi8+PHBhdGggc3Ryb2tlPSIjN0M4N0E1IiBmaWxsPSIjRTZFN0U4IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Ik0xMCAyOGg0djRoLTR6Ii8+PHBhdGggZD0iTTE1LjUgMjJoLTdhLjUuNSAwIDAgMS0uNS0uNWMwLS4zLjItLjUuNS0uNWg3Yy4zIDAgLjUuMi41LjVzLS4yLjUtLjUuNXpNMTcuNSAyNGgtMTFhLjUuNSAwIDAgMS0uNS0uNWMwLS4zLjItLjUuNS0uNWgxMWMuMyAwIC41LjIuNS41cy0uMi41LS41LjV6IiBmaWxsPSIjRkZCRjAwIi8+PC9nPjwvc3ZnPg==';

/**
 * Enum for Vernier godirect protocol.
 * @readonly
 * @enum {string}
 */
const BLEUUID = {
    service: 'd91714ef-28b9-4f91-ba16-f0d9a604f112',
    commandChar: 'f4bf14a6-c7d5-4b6d-8aa8-df1a7c83adcb',
    responseChar: 'b41e6675-a329-40e0-aa01-44d2f444babe'
};

const SMOOTHING_POINTS = 3;

/**
 * Scratch default frame rate.
 * @type {number}
 */
const FRAMES_PER_SEC = 30;

/**
 * Manage communication with a GDX-FOR peripheral over a Scratch Link client socket.
 */
class GdxFor {

    /**
     * Construct a GDX-FOR communication object.
     * @param {Runtime} runtime - the Scratch 3.0 runtime
     * @param {string} extensionId - the id of the extension
     */
    constructor (runtime, extensionId) {

        /**
         * The Scratch 3.0 runtime used to trigger the green flag button.
         * @type {Runtime}
         * @private
         */
        this._runtime = runtime;

        /**
         * The BluetoothLowEnergy connection socket for reading/writing peripheral data.
         * @type {BLE}
         * @private
         */
        this._scratchLinkSocket = null;

        /**
         * An @vernier/godirect Device
         * @type {Device}
         * @private
         */
        this._device = null;

        this._runtime.registerPeripheralExtension(extensionId, this);

        /**
         * The id of the extension this peripheral belongs to.
         */
        this._extensionId = extensionId;

        this.disconnect = this.disconnect.bind(this);
        this._onConnect = this._onConnect.bind(this);

        this._accelBufferX = [];
        this._accelBufferY = [];
        this._accelBufferZ = [];
    }


    /**
     * Called by the runtime when user wants to scan for a peripheral.
     */
    scan () {
        if (this._device) {
            this._device.close();
        }

        this._scratchLinkSocket = new BLE(this._runtime, this._extensionId, {
            filters: [
                {namePrefix: 'GDX-FOR'}
            ],
            optionalServices: [
                BLEUUID.service
            ]
        }, this._onConnect);
    }

    /**
     * Called by the runtime when user wants to connect to a certain peripheral.
     * @param {number} id - the id of the peripheral to connect to.
     */
    connect (id) {
        if (this._scratchLinkSocket) {
            this._scratchLinkSocket.connectPeripheral(id);
        }
    }

    /**
     * Called by the runtime when a use exits the connection popup.
     * Disconnect from the GDX FOR.
     */
    disconnect () {
        if (this._device) {
            this._device.close();
        }
    }

    /**
     * Return true if connected to the goforce device.
     * @return {boolean} - whether the goforce is connected.
     */
    isConnected () {
        let connected = false;
        if (this._scratchLinkSocket) {
            connected = this._scratchLinkSocket.isConnected();
        }
        return connected;
    }

    /**
     * Starts reading data from peripheral after BLE has connected to it.
     * @private
     */
    _onConnect () {
        const adapter = new ScratchLinkDeviceAdapter(this._scratchLinkSocket, BLEUUID);
        godirect.createDevice(adapter, {open: true, startMeasurements: false}).then(device => {
            this._device = device;
            this._device.keepValues = false;
            this._startMeasurements();
        });
    }

    /**
     * Enable and begin reading measurements
     * @private
     */
    _startMeasurements () {
        this._device.sensors.forEach(sensor => {
            sensor.setEnabled(true);
        });
        this._device.start(10); // Set the period to 10 milliseconds
    }


    getForce () {
        if (this.isConnected()) {
            let force = this._device.getSensor(1).value;
            // Normalize the force, which can be measured between -50 and 50 N,
            // to be a value between -100 and 100.
            force = MathUtil.clamp(force * 2, -100, 100);
            force *= -1;
            force = Math.round(force);
            return force;
        }
        return 0;
    }

    getTiltZ () {
        if (this.isConnected()) {
            let x = this.getAccelerationX();
            let y = this.getAccelerationY();
            let z = this.getAccelerationZ();

            let xSign = 1;
            let ySign = 1;
            let zSign = 1;

            if (x < 0.0) {
                x *= -1.0; xSign = -1;
            }
            if (y < 0.0) {
                y *= -1.0; ySign = -1;
            }
            if (z < 0.0) {
                z *= -1.0; zSign = -1;
            }

            // Compute the yz unit vector
            const x2 = x * x;
            const y2 = y * y;
            let value = x2 + y2;
            value = Math.sqrt(value);

            // For sufficiently small zy vector values we are essentially at 90 degrees.
            // The following snaps to 90 and avoids divide-by-zero errors.
            // The snap factor was derived through observation -- just enough to
            // still allow single degree steps up to 90 (..., 87, 88, 89, 90).
            if (value < 0.35) {
                value = 90;
            } else {
                // Compute the x-axis angle
                value = z / value;
                value = Math.atan(value);
                value *= 57.2957795; // convert from rad to deg
            }

            // Manage the sign of the result
            let yxSign = ySign;
            if (x > y) yxSign = xSign;
            if (yxSign === -1) value = 180.0 - value;
            value *= zSign;

            // Round the result to the nearest degree
            value = Math.round(value);
            return value;
        }
        return 0;
    }

    getTiltX () {
        if (this.isConnected()) {
            const x = this.getAccelerationX(false);
            const y = this.getAccelerationY(false);
            const z = this.getAccelerationZ(false);
            let xTan2 = 0;
            let xMicroY = 0;

            let xSign = 1;
            if (x < 0) xSign = -1;
            let ySign = 1;
            if (y < 0) ySign = -1;
            let zSign = 1;
            if (z < 0) zSign = -1;
            // Compute the yz unit vector
            const y2 = y * y;
            const z2 = z * z;
            let value = y2 + z2;
            value = Math.sqrt(value);
            
            xTan2 = Math.atan2(x, z);
            xTan2 *= 57.2957795;
            xMicroY = zSign * Math.sqrt(z2 + (0.1 * y2));
            xMicroY = Math.atan(x / xMicroY);
            xMicroY *= 57.2957795;

            value = x / Math.sqrt(z2 + y2);
            value = Math.atan(value);
            value *= 57.2957795; // convert from rad to deg

            // Manage the sign of the result
            // Manage the sign of the result
            let yzSign = ySign;
            if (Math.abs(z) > Math.abs(y)) yzSign = xSign;
            if (yzSign === -1) value = 180.0 - value;
            value *= xSign;
            
            // eslint-disable-next-line no-console
            console.log('ACC: ', value, xMicroY, xTan2);

            // Round the result to the nearest degree
            value = Math.round(value);
            xMicroY = Math.round(xMicroY);
            xTan2 = Math.round(xTan2);
            return xTan2;
        }
        return 0;
    }

    getTiltY () {
        if (this.isConnected()) {
            const x = this.getAccelerationX(false);
            const y = this.getAccelerationY(false);
            const z = this.getAccelerationZ(false);

            let ySign = 1;
            if (y < 0) ySign = -1;
            // Compute the yz unit vector
            const x2 = x * x;
            const z2 = z * z;
            let value = x2 + z2;
            value = Math.sqrt(value);

            // For sufficiently small zy vector values we are essentially at 90 degrees.
            // The following snaps to 90 and avoids divide-by-zero errors.
            // The snap factor was derived through observation -- just enough to
            // still allow single degree steps up to 90 (..., 87, 88, 89, 90).
            if (value < 0.35) {
                value = (ySign * 90);
            } else {
                value = Math.atan2(y, z);
                value *= 57.2957795; // convert from rad to deg
            }

            // Round the result to the nearest degree
            value = Math.round(value);
            return value;
        }
        return 0;
    }

    getTiltMicroY () {
        if (this.isConnected()) {
            const x = this.getAccelerationX(false);
            const y = this.getAccelerationY(false);
            const z = this.getAccelerationZ(false);
            let xMicroY = 0;

            let zSign = 1;
            if (z < 0) zSign = -1;
            // Compute the yz unit vector
            const y2 = y * y;
            const z2 = z * z;

            xMicroY = zSign * Math.sqrt(z2 + (0.1 * y2));
            xMicroY = Math.atan(x / xMicroY);
            xMicroY *= 57.2957795;

            // Round the result to the nearest degree
            xMicroY = Math.round(xMicroY);
            return xMicroY;
        }
        return 0;
    }

    getTiltTan2 () {
        if (this.isConnected()) {
            const x = this.getAccelerationX(false);
            const z = this.getAccelerationZ(false);

            let xTan2 = Math.atan2(x, z);
            xTan2 *= 57.2957795;

            // Round the result to the nearest degree
            xTan2 = Math.round(xTan2);
            return xTan2;
        }
        return 0;
    }

    getTiltFrontBack (back = false) {
        if (this.isConnected()) {
            const x = this.getAccelerationX(false);
            const y = this.getAccelerationY(false);
            const z = this.getAccelerationZ(false);

            // Compute the yz unit vector
            const y2 = y * y;
            const z2 = z * z;
            let value = y2 + z2;
            value = Math.sqrt(value);

            if (value < 0.35) {
                value = 90;
            } else {
                value = x / value;
                value = Math.atan(value);
                value *= 57.2957795; // convert from rad to deg
            }

            if (back) value *= -1;

            // Round the result to the nearest degree
            value = Math.round(value);
            return value;
        }
        return 0;
    }

    getTiltLeftRight (right = false) {
        if (this.isConnected()) {
            const x = this.getAccelerationX(false);
            const y = this.getAccelerationY(false);
            const z = this.getAccelerationZ(false);

            // Compute the yz unit vector
            const x2 = x * x;
            const z2 = z * z;
            let value = x2 + z2;
            value = Math.sqrt(value);

            if (value < 0.35) {
                value = 90;
            } else {
                value = y / value;
                value = Math.atan(value);
                value *= 57.2957795; // convert from rad to deg
            }

            if (right) value *= -1;

            // Round the result to the nearest degree
            value = Math.round(value);
            return value;
        }
        return 0;
    }

    /**
     * @param {array} vals - array of vals to smoooth
     * @return {number} - the smoothed value
     */
    smooth (vals) {
        let smooth = 0;
        const valsLength = vals.length;
        let i = 0;

        for (i = 0; i < valsLength; i++) {
            smooth += vals[i];
        }
        //  The last value gets twice the weight
        smooth += vals[valsLength - 1];

        smooth /= (valsLength + 1);

        return smooth;
    }

    getAccelerationAvg (chan = 1, round = true) {
        let vals;

        switch (chan) {
        case 2: vals = this._accelBufferX; break;
        case 3: vals = this._accelBufferY; break;
        case 4: vals = this._accelBufferZ; break;
        default:
            log.warn(`Unknown channel number for getAccelAvg`);
            return 0;
        }

        const valsLength = vals.length;
        const accel = this._getAcceleration(chan, round);

        if (valsLength < 2 || vals[valsLength - 1] !== accel) {
            if (valsLength < SMOOTHING_POINTS) {
                // Not a full array, so we fill it out
                vals.push(accel);
            } else {
                let i = valsLength - 1;

                // Shift out the oldest in favor of the new measurement
                while (i > 0) {
                    vals[i - 1] = vals[i];
                    i--;
                }

                // Add the new measurement
                vals[valsLength - 1] = accel;
            }
        }

        const result = this.smooth(vals);
        return result;
    }

    getAccelerationX (round = true) {
        return this._getAcceleration(2, round);
    }

    getAccelerationY (round = true) {
        return this._getAcceleration(3, round);
    }

    getAccelerationZ (round = true) {
        return this._getAcceleration(4, round);
    }

    _getAcceleration (sensorNum, round = true) {
        if (!this.isConnected()) return 0;
        let val = this._device.getSensor(sensorNum).value;
        if (round) val = Math.round(val);
        return val;
    }

    getSpinSpeedX (round = true) {
        return this._getSpinSpeed(5, round);
    }

    getSpinSpeedY (round = true) {
        return this._getSpinSpeed(6, round);
    }

    getSpinSpeedZ (round = true) {
        return this._getSpinSpeed(7, round);
    }

    _getSpinSpeed (sensorNum, round = true) {
        if (!this.isConnected()) return 0;
        let val = this._device.getSensor(sensorNum).value;
        val *= 180 / Math.PI; // Convert from radians to degrees
        val /= FRAMES_PER_SEC; // Convert from degrees per sec to degrees per frame
        val *= -1;
        if (round) val = Math.round(val);
        return val;
    }
}

/**
 * Enum for comparison operations.
 * @readonly
 * @enum {string}
 */
const ComparisonOptions = {
    LESS_THAN: 'less_than',
    GREATER_THAN: 'greater_than'
};

/**
 * Scratch 3.0 blocks to interact with a GDX-FOR peripheral.
 */
class Scratch3GdxForBlocks {

    /**
     * @return {string} - the name of this extension.
     */
    static get EXTENSION_NAME () {
        return 'GDX-FOR';
    }

    /**
     * @return {string} - the ID of this extension.
     */
    static get EXTENSION_ID () {
        return 'gdxfor';
    }

    get DIRECTIONS_MENU () {
        return [
            {
                text: 'x',
                value: 'x'
            },
            {
                text: 'y',
                value: 'y'
            },
            {
                text: 'z',
                value: 'z'
            }
        ];
    }

    get TILT_MENU () {
        return [
            {
                text: 'x',
                value: 'x'
            },
            {
                text: 'front',
                value: 'front'
            },
            {
                text: 'back',
                value: 'back'
            },
            {
                text: 'left',
                value: 'left'
            },
            {
                text: 'right',
                value: 'right'
            },
            {
                text: 'tan2',
                value: 'tan2'
            },
            {
                text: 'microY',
                value: 'microY'
            },
            {
                text: 'y',
                value: 'y'
            }
        ];
    }

    get FACE_MENU () {
        return [
            {
                text: 'up',
                value: 'up'
            },
            {
                text: 'down',
                value: 'down'
            }
        ];
    }


    get COMPARE_MENU () {
        return [
            {
                text: '<',
                value: ComparisonOptions.LESS_THAN
            },
            {
                text: '>',
                value: ComparisonOptions.GREATER_THAN
            }
        ];
    }


    /**
     * Construct a set of GDX-FOR blocks.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor (runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        // Create a new GdxFor peripheral instance
        this._peripheral = new GdxFor(this.runtime, Scratch3GdxForBlocks.EXTENSION_ID);
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: Scratch3GdxForBlocks.EXTENSION_ID,
            name: Scratch3GdxForBlocks.EXTENSION_NAME,
            blockIconURI: blockIconURI,
            showStatusButton: true,
            blocks: [
                {
                    opcode: 'whenForceCompare',
                    text: formatMessage({
                        id: 'gdxfor.whenForceCompare',
                        default: 'when force [COMPARE] [VALUE]',
                        description: 'when the value measured by the force sensor is compared to some value'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        COMPARE: {
                            type: ArgumentType.STRING,
                            menu: 'compareOptions',
                            defaultValue: ComparisonOptions.GREATER_THAN
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5
                        }
                    }
                },
                {
                    opcode: 'getForce',
                    text: formatMessage({
                        id: 'gdxfor.getForce',
                        default: 'force',
                        description: 'gets force'
                    }),
                    blockType: BlockType.REPORTER
                },
                '---',
                {
                    opcode: 'whenAccelerationCompare',
                    text: formatMessage({
                        id: 'gdxfor.whenAccelerationCompare',
                        default: 'when acceleration [COMPARE] [VALUE]',
                        description: 'when the meters/second^2 value measured by the ' +
                            'acceleration sensor is compared to some value'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        COMPARE: {
                            type: ArgumentType.STRING,
                            menu: 'compareOptions',
                            defaultValue: ComparisonOptions.GREATER_THAN
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5
                        }
                    }
                },
                {
                    opcode: 'getAcceleration',
                    text: formatMessage({
                        id: 'gdxfor.getAcceleration',
                        default: 'acceleration [DIRECTION]',
                        description: 'gets acceleration'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        DIRECTION: {
                            type: ArgumentType.STRING,
                            menu: 'directionOptions',
                            defaultValue: 'x'
                        }
                    }
                },
                {
                    opcode: 'getTilt',
                    text: formatMessage({
                        id: 'gdxfor.getTilt',
                        default: 'tilt [TILT]',
                        description: 'gets tilt'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        TILT: {
                            type: ArgumentType.STRING,
                            menu: 'tiltOptions',
                            defaultValue: 'x'
                        }
                    }
                },
                '---',
                {
                    opcode: 'whenSpinSpeedCompare',
                    text: formatMessage({
                        id: 'gdxfor.whenSpinSpeedCompare',
                        default: 'when spin speed [COMPARE] [VALUE]',
                        description: 'when the degrees/second value measured by the ' +
                            'gyroscope sensor is compared to some value'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        COMPARE: {
                            type: ArgumentType.STRING,
                            menu: 'compareOptions',
                            defaultValue: ComparisonOptions.GREATER_THAN
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5
                        }
                    }
                },
                {
                    opcode: 'getSpinSpeed',
                    text: formatMessage({
                        id: 'gdxfor.getSpinSpeed',
                        default: 'spin speed [DIRECTION]',
                        description: 'gets spin speed'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        DIRECTION: {
                            type: ArgumentType.STRING,
                            menu: 'directionOptions',
                            defaultValue: 'x'
                        }
                    }
                },
                '---',
                {
                    opcode: 'whenFreeFalling',
                    text: formatMessage({
                        id: 'gdxfor.whenFreeFalling',
                        default: 'when free falling',
                        description: 'when the device is in free fall'
                    }),
                    blockType: BlockType.HAT
                },
                {
                    opcode: 'isFreeFalling',
                    text: formatMessage({
                        id: 'gdxfor.isFreeFalling',
                        default: 'free falling?',
                        description: 'is the device in freefall?'
                    }),
                    blockType: BlockType.BOOLEAN
                },
                '---',
                {
                    opcode: 'isFacing',
                    text: formatMessage({
                        id: 'gdxfor.isFacing',
                        default: 'facing [FACING]?',
                        description: 'is the device facing up or down?'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        FACING: {
                            type: ArgumentType.STRING,
                            menu: 'faceOptions',
                            defaultValue: 'up'
                        }
                    }
                }
            ],
            menus: {
                directionOptions: this.DIRECTIONS_MENU,
                compareOptions: this.COMPARE_MENU,
                tiltOptions: this.TILT_MENU,
                faceOptions: this.FACE_MENU
            }
        };
    }

    /**
     * @param {number} x - x axis vector
     * @param {number} y - y axis vector
     * @param {number} z - z axis vector
     * @return {number} - the magnitude of a three dimension vector.
     */
    magnitude (x, y, z) {
        return Math.sqrt((x * x) + (y * y) + (z * z));
    }

    whenAccelerationCompare (args) {
        let currentVal = this.magnitude(
            this._peripheral.getAccelerationX(),
            this._peripheral.getAccelerationY(),
            this._peripheral.getAccelerationZ()
        );

        // Remove acceleration due to gravity
        currentVal = currentVal - 9.8;

        switch (args.COMPARE) {
        case ComparisonOptions.LESS_THAN:
            return currentVal < Cast.toNumber(args.VALUE);
        case ComparisonOptions.GREATER_THAN:
            return currentVal > Cast.toNumber(args.VALUE);
        default:
            log.warn(`Unknown comparison operator in whenAccelerationCompare: ${args.COMPARE}`);
            return false;
        }
    }
    whenFreeFalling () {
        return this.isFreeFalling();
    }
    whenSpinSpeedCompare (args) {
        const currentVal = this.magnitude(
            this._peripheral.getSpinSpeedX(),
            this._peripheral.getSpinSpeedY(),
            this._peripheral.getSpinSpeedZ()
        );

        switch (args.COMPARE) {
        case ComparisonOptions.LESS_THAN:
            return currentVal < Cast.toNumber(args.VALUE);
        case ComparisonOptions.GREATER_THAN:
            return currentVal > Cast.toNumber(args.VALUE);
        default:
            log.warn(`Unknown comparison operator in whenSpinSpeedCompare: ${args.COMPARE}`);
            return false;
        }
    }
    whenForceCompare (args) {
        switch (args.COMPARE) {
        case ComparisonOptions.LESS_THAN:
            return this._peripheral.getForce() < Cast.toNumber(args.VALUE);
        case ComparisonOptions.GREATER_THAN:
            return this._peripheral.getForce() > Cast.toNumber(args.VALUE);
        default:
            log.warn(`Unknown comparison operator in whenForceCompare: ${args.COMPARE}`);
            return false;
        }
    }
    getAcceleration (args) {
        switch (args.DIRECTION) {
        case 'x':
            return this._peripheral.getAccelerationX();
        case 'y':
            return this._peripheral.getAccelerationY();
        case 'z':
            return this._peripheral.getAccelerationZ();
        default:
            log.warn(`Unknown direction in getAcceleration: ${args.DIRECTION}`);
        }
    }
    getSpinSpeed (args) {
        switch (args.DIRECTION) {
        case 'x':
            return this._peripheral.getSpinSpeedX();
        case 'y':
            return this._peripheral.getSpinSpeedY();
        case 'z':
            return this._peripheral.getSpinSpeedZ();
        default:
            log.warn(`Unknown direction in getSpinSpeed: ${args.DIRECTION}`);
        }
    }
    getTilt (args) {
        switch (args.TILT) {
        case 'x':
            return this._peripheral.getTiltX();
        case 'y':
            return this._peripheral.getTiltY();
        case 'microY':
            return this._peripheral.getTiltMicroY();
        case 'tan2':
            return this._peripheral.getTiltTan2();
        case 'front':
            return this._peripheral.getTiltFrontBack(false);
        case 'back':
            return this._peripheral.getTiltFrontBack(true);
        case 'left':
            return this._peripheral.getTiltLeftRight(false);
        case 'right':
            return this._peripheral.getTiltLeftRight(true);
        default:
            log.warn(`Unknown direction in getTilt: ${args.TILT}`);
        }
    }
    getForce () {
        return this._peripheral.getForce();
    }
    isFacing (args) {
        switch (args.FACING) {
        case 'up':
            return this._peripheral.getAccelerationZ() > 9;
        case 'down':
            return this._peripheral.getAccelerationZ() < -9;
        default:
            log.warn(`Unknown direction in isFacing: ${args.FACING}`);
        }
    }
    isFreeFalling () {
        const currentVal = this.magnitude(
            this._peripheral.getAccelerationX(false),
            this._peripheral.getAccelerationY(false),
            this._peripheral.getAccelerationZ(false)
        );
        const currentSpinMag = this.magnitude(
            this._peripheral.getSpinSpeedX(false),
            this._peripheral.getSpinSpeedY(false),
            this._peripheral.getSpinSpeedZ(false)
        );

        // We want to account for rotation during freefall,
        // so we tack on a an estimated "rotational effect"
        // The spinFactor const is used to both scale the magnitude
        // of the gyro measurements and convert them to radians/second.
        // Where 0.3 was determined experimentally
        const spinFactor = 0.3;
        // The ffThresh const is what we compare our accel magnitude
        // against to judge if the device is in free fall.
        // The ideal is 0, but 0.5 allows for inevitable noise.
        const ffThresh = 0.5;
        let thresh = 0;
        thresh = ((spinFactor * currentSpinMag) + ffThresh);

        return currentVal < thresh;
    }
}

module.exports = Scratch3GdxForBlocks;
