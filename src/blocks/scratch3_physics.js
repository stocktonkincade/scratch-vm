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
        this.World = Matter.World;
        this.Bodies = Matter.Bodies;

        // create an engine
        this.engine = this.Engine.create();

        // gravity is negative because scratch coords (y goes up) are inverted from matter coords (y goes down)
        this.engine.world.gravity.y = -1;

        // add the ground and wallsto the world
        const wallSize = 500;
        this.ground = this.Bodies.rectangle(0, -180 - wallSize / 2, wallSize, wallSize, { isStatic: true });
        this.leftWall = this.Bodies.rectangle(-240 - wallSize / 2, 0, wallSize, wallSize, { isStatic: true });
        this.rightWall = this.Bodies.rectangle(240 + wallSize / 2, 0, wallSize, wallSize, { isStatic: true });
        this.World.add(this.engine.world, [this.ground, this.leftWall, this.rightWall]);

        // a map of scratch target ids to matter bodies
        this.bodies = new Map();
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
     * @type {PhysicsState}
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
        // for each target, if it has no body, create one, and add it to its custom state
        for (let i=1; i<this.runtime.targets.length; i++) {
            const target = this.runtime.targets[i];
            const state = this._getPhysicsState(target);
            if (!state.body) {
                const bounds = target.getBounds();
                const width = bounds.right - bounds.left;
                const height = bounds.top - bounds.bottom;
                const options = {
                    restitution: 0.8
                };
                const body = this.Bodies.rectangle(target.x, target.y, width, height, options );
                this.World.add(this.engine.world, body);
                state.body = body;
                this.bodies.set(target.id, body);
            }
        }

        // remove any bodies that do not have targets associated with them
        for (const [id, body] of this.bodies) {
            const target = this.runtime.getTargetById(id);
            if (!target) {
                this.World.remove(this.engine.world, body);
                this.bodies.delete(id);
                console.log(this.bodies);
            }
        }

        // If a target has been moved by a motion block or a drag
        // update it in the engine and zero its velocity
        for (let i=1; i<this.runtime.targets.length; i++) {
            const target = this.runtime.targets[i];
            const state = this._getPhysicsState(target);
            const body = state.body;
            const updatedPos = {x:target.x, y:target.y};
            if ((updatedPos.x !== body.position.x) || (updatedPos.x !== body.position.x)) {
                Matter.Body.setPosition(body, updatedPos);
                Matter.Body.setVelocity(body, {x:0, y:0});
            }
        }
        // update the physics engine
        this.Engine.update(this.engine, 1000/60);

        // update the positions of the targets
        for (let i=1; i<this.runtime.targets.length; i++) {
            const target = this.runtime.targets[i];
            const state = this._getPhysicsState(target);
            const body = state.body;
            target.setXY(body.position.x, body.position.y);
        }
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
