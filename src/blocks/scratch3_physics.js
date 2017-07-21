const Cast = require('../util/cast');
const log = require('../util/log');
const Clone = require('../util/clone');
const Physics = require('matter-js');

class Scratch3PhysicsBlocks {

    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        this.runtime.HACK_PhysicsBlocks = this;

        // module aliases
        var Engine = Matter.Engine,
            Render = Matter.Render,
            World = Matter.World,
            Bodies = Matter.Bodies;

        // create an engine
        var engine = Engine.create();

        // create a renderer
        var render = Render.create({
            element: document.body,
            engine: engine
        });

        // create two boxes and a ground
        var boxA = Bodies.rectangle(400, 200, 80, 80);
        var boxB = Bodies.rectangle(450, 50, 80, 80);
        var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

        // add all of the bodies to the world
        World.add(engine.world, [boxA, boxB, ground]);

        // run the engine
        Engine.run(engine);

        // run the renderer
        Render.run(render);
    }

    /**
     * The key to load & store a target's state related to the physics extension.
     * @type {string}
     */
    static get STATE_KEY () {
        return 'Scratch.physics';
    }

    /**
     * The default physics-related state, to be used when a target has no existing physics state.
     * @type {SpeechState}
     */
    static get DEFAULT_PHYSICS_STATE () {
        return {
        };
    }

    /**
     * @param {Target} target - collect physics state for this target.
     * @returns {physicsState} the mutable physics state associated with that target. This will be created if necessary.
     * @private
     */
    _getPhysicsState (target) {
        let physicsState = target.getCustomState(Scratch3PhysicsBlocks.STATE_KEY);
        if (!physicsState) {
            physicsState = Clone.simple(Scratch3PhysicsBlocks.DEFAULT_PHYSICS_STATE);
            target.setCustomState(Scratch3PhysicsBlocks.STATE_KEY, physicsState);
        }
        return physicsState;
    }

    /**
     * Retrieve the block primitives implemented by this package.
     * @return {object.<string, Function>} Mapping of opcode to Function.
     */
    getPrimitives () {
        return {
            // speech_whenihear: this.hatWhenIHear,
        };
    }

    getHats () {
        return {
            // speech_whenihear: {
            //     restartExistingThreads: false,
            //     edgeActivated: true
            }
        };
    }


}

module.exports = Scratch3PhysicsBlocks;
