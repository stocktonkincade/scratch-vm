const Cast = require('../util/cast');
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
        this.Events = Matter.Events;

        // create an engine
        this.engine = this.Engine.create();

        // gravity is negative because scratch coords (y goes up) are inverted from matter coords (y goes down)
        this.engine.world.gravity.y = -1;

        // add the ground and walls to the world
        // todo: make the walls much taller than the stage, so you can't jump up and over them
        const wallSize = 500;
        this.ground = this.Bodies.rectangle(0, -180 - (wallSize / 2), wallSize, wallSize, {isStatic: true});
        this.leftWall = this.Bodies.rectangle(-240 - (wallSize / 2), 0, wallSize, wallSize, {isStatic: true});
        this.rightWall = this.Bodies.rectangle(240 + (wallSize / 2), 0, wallSize, wallSize, {isStatic: true});
        this.topWall = this.Bodies.rectangle(0, 180 + (wallSize / 2), wallSize, wallSize, {isStatic: true});
        this.World.add(this.engine.world, [this.ground, this.leftWall, this.rightWall, this.topWall]);

        // a map of scratch target ids to matter bodies
        this.bodies = new Map();

        // fire events on collision between any pair of bodies
        this.Events.on(this.engine, 'collisionStart', event => {
            // for each pair, look up each body in this.bodies
            // trigger the collide hat for the target
            const pairs = event.pairs;
            for (let i = 0; i < pairs.length; i++) {
                const pair = pairs[i];
                for (const [id, body] of this.bodies) {
                    if ((pair.bodyA.id === body.id) || (pair.bodyB.id === body.id)) {
                        const target = this.runtime.getTargetById(id);
                        this.runtime.startHats('physics_whenCollide', null, target);
                    }
                }
            }
        });

        this.showDebugRenderer();
    }

    showDebugRenderer () {
        // create a renderer (for debugging)
        const render = Matter.Render.create({
            element: document.body,
            engine: this.engine,
            options: {
                width: 480 + 10,
                height: 360 + 10,
                pixelRatio: 2
            }
        });
        Matter.Render.lookAt(render, [this.ground, this.leftWall, this.rightWall]);
        Matter.Render.run(render);
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
        for (let i = 1; i < this.runtime.targets.length; i++) {
            const target = this.runtime.targets[i];
            const state = this._getPhysicsState(target);
            if (!state.body) {
                const bounds = target.getBounds();
                const width = bounds.right - bounds.left;
                const height = bounds.top - bounds.bottom;
                const options = {
                    restitution: 0.8
                };
                const body = this.Bodies.rectangle(target.x, target.y, width, height, options);
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
            }
        }

        // If a target has been moved by a motion block or a drag
        // update it in the engine and zero its velocity
        for (let i = 1; i < this.runtime.targets.length; i++) {
            const target = this.runtime.targets[i];
            const state = this._getPhysicsState(target);
            const body = state.body;
            const updatedPos = {x: target.x, y: target.y};
            if ((updatedPos.x !== body.position.x) || (updatedPos.y !== body.position.y)) {
                Matter.Body.setPosition(body, updatedPos);
                Matter.Body.setVelocity(body, {x: 0, y: 0});
            }
        }

        // todo: check if target's bounds have changed and update engine
        // (in case of rotation, costume change, size change)

        // update the physics engine
        this.Engine.update(this.engine, 1000 / 60);

        // update the positions of the targets
        for (let i = 1; i < this.runtime.targets.length; i++) {
            const target = this.runtime.targets[i];
            const state = this._getPhysicsState(target);
            const body = state.body;
            target.setXY(body.position.x, body.position.y);
            const bodyDegrees = body.angle * 180 / Math.PI;
            const scratchAngle = (360 - bodyDegrees) + 90;
            target.setDirection(scratchAngle);
        }
        window.requestAnimationFrame(this.step.bind(this));
    }

    /**
     * Retrieve the block primitives implemented by this package.
     * @return {object.<string, Function>} Mapping of opcode to Function.
     */
    getPrimitives () {
        return {
            physics_pushXY: this.pushXY,
            physics_setGravity: this.setGravity
        };
    }

    getHats () {
        return {
            physics_whenCollide: {
                restartExistingThreads: true,
                edgeActivated: false
            }
        };
    }

    pushXY (args, util) {
        const state = this._getPhysicsState(util.target);
        const scale = 0.01;
        const x = Cast.toNumber(args.X) * scale;
        const y = Cast.toNumber(args.Y) * scale;
        Matter.Body.applyForce(state.body, state.body.position, {x: x, y: y});
    }

    setGravity (args) {
        const g = -1 * Cast.toNumber(args.GRAVITY) / 100;
        this.engine.world.gravity.y = g;
    }
}

module.exports = Scratch3PhysicsBlocks;
