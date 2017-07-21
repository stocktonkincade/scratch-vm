const Cast = require('../util/cast');
const log = require('../util/log');
const Clone = require('../util/clone');
const Matter = require('matter-js');

class Scratch3PhysicsBlocks {

    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        this.runtime.HACK_PhysicsBlocks = this;

        // module aliases
        this.Engine = Matter.Engine;
        // this.Render = Matter.Render;
        this.World = Matter.World;
        this.Bodies = Matter.Bodies;

        // create an engine
        this.engine = this.Engine.create();

        // create a renderer
        // var render = this.Render.create({
        //     element: document.body,
        //     engine: this.engine
        // });
        //
        this.engine.world.gravity.y = -1;

        this.ground = this.Bodies.rectangle(-240, -130, 480, 100, { isStatic: true });

        this.bodies = [];

        // add all of the bodies to the world
        this.World.add(this.engine.world, this.ground);

        // run the engine
        // Engine.run(engine);

        // run the renderer
        // this.Render.run(this.render);
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
            body: null
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

    start () {
        window.requestAnimationFrame(this.step.bind(this));
    }

    step () {
        // todo:
        // for each target
        // if it has no body, create one, and add it using custom state
        // set position of body to position of sprite (coordinate systems!)
        for (let i=1; i<this.runtime.targets.length; i++) {
            const target = this.runtime.targets[i];
            const state = this._getPhysicsState(target);
            if (!state.body) {
                const options = {
                    restitution: 0.8
                };
                console.log(target);
                const body = this.Bodies.rectangle(0, 0, 50, 50, options );
                this.bodies.push(body);
                state.body = body;
            }
        }

        /*

        // check the position of each target and update it in the engine
        // in case it has been moved by a motion block or a drag
        for (let i=1; i<this.runtime.targets.length; i++) {
            const target = this.runtime.targets[i];
            const updatedPos = {x:target.x, y:target.y};
            // todo: check if the position has actually changed before doing this
            // and if so, zero out the velocities
            Matter.Body.setPosition(this.boxes[i], updatedPos);
        }
        // update the physics engine
        this.Engine.update(this.engine, 1000/60);
        // update the positions of the targets
        for (let i=1; i<this.runtime.targets.length; i++) {
            const target = this.runtime.targets[i];
            target.setXY(this.boxes[i].position.x, this.boxes[i].position.y);
        }

        */

        window.requestAnimationFrame(this.step.bind(this));
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
        // return {
            // speech_whenihear: {
            //     restartExistingThreads: false,
            //     edgeActivated: true
            // }
        // };
    }
}

module.exports = Scratch3PhysicsBlocks;
