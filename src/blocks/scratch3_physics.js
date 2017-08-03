const Cast = require('../util/cast');
const Clone = require('../util/clone');
const MathUtil = require('../util/math-util');

import decomp from 'poly-decomp';
window.decomp = decomp;
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

        // scale factor for force applied by push and pushXY blocks
        this.forceScale = 0.01;

        // add the ground and walls to the world
        // todo: make the walls much taller than the stage, so you can't jump up and over them
        const wallSize = 1000;
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
                width: 480 / 2,
                height: 360 / 2,
                showAngleIndicator: true,
                showCollisions: true,
                showVelocity: true
            }
        });
        Matter.Render.lookAt(render, {
            min: {x: -240, y: -180},
            max: {x: 240, y: 180}
        });

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
                const hull = this.runtime.renderer._getConvexHullPointsForDrawable(target.drawableID);
                let body;
                if (hull.length > 0) {
                    let vertices = hull.map(p => {
                        return {x: p[0], y: p[1]};
                    });
                    vertices = Matter.Vertices.hull(vertices);
                    body = this.Bodies.fromVertices(target.x, target.y, vertices, options);
                } else {
                    body = this.Bodies.rectangle(target.x, target.y, width, height, options);
                }

                // offset matter body by target rotation center?
                // where should this offset happen?
                // const centerX = target.getCurrentCostume().rotationCenterX;
                // const centerY = target.getCurrentCostume().rotationCenterY;
                // Matter.Body.translate(body, Matter.Vector.sub({x: centerX, y: centerY}, body.position));

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

        // If a target has been moved by a drag, or otherwise moved, rotated or scaled,
        // update it in the engine and zero its velocity
        for (let i = 1; i < this.runtime.targets.length; i++) {
            const target = this.runtime.targets[i];
            const state = this._getPhysicsState(target);
            const body = state.body;
            // check for position change
            const updatedPos = {x: target.x, y: target.y};
            if ((updatedPos.x !== body.position.x) || (updatedPos.y !== body.position.y)) {
                Matter.Body.setPosition(body, updatedPos);
                Matter.Body.setVelocity(body, {x: 0, y: 0});
                Matter.Body.setAngularVelocity(body, 0);
            }
            // check for rotation change
            let angleDiff = Math.abs(target.direction - this._matterToScratchAngle(body.angle));
            angleDiff %= 360;
            if (angleDiff > 1) {
                Matter.Body.setAngle(body, this._scratchToMatterAngle(target.direction));
                Matter.Body.setAngularVelocity(body, 0);
            }
            // how to do scaling? target.size is a percentage of the original size... so
            // we can't keep re-applying the scale operation...
            // Matter.Body.scale(body, target.size / 100, target.size / 100);

            // todo: update the convex hull if we have changed costume
        }

        // update the physics engine
        this.Engine.update(this.engine, 1000 / 30);

        // update the position and angle of the targets
        for (let i = 1; i < this.runtime.targets.length; i++) {
            const target = this.runtime.targets[i];
            const state = this._getPhysicsState(target);
            const body = state.body;
            target.setXY(body.position.x, body.position.y);
            target.setDirection(this._matterToScratchAngle(body.angle));
        }
        window.requestAnimationFrame(this.step.bind(this));
    }

    _matterToScratchAngle (matterAngleRadians) {
        return (360 - Math.round(MathUtil.radToDeg(matterAngleRadians)) + 90);
    }

    _scratchToMatterAngle (scratchAngleDegrees) {
        return MathUtil.degToRad(90 - scratchAngleDegrees);
    }

    /**
     * Retrieve the block primitives implemented by this package.
     * @return {object.<string, Function>} Mapping of opcode to Function.
     */
    getPrimitives () {
        return {
            physics_push: this.push,
            physics_pushXY: this.pushXY,
            physics_twist: this.twist,
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
        // todo: clamp the force
        const state = this._getPhysicsState(util.target);
        const x = Cast.toNumber(args.X) * this.forceScale;
        const y = Cast.toNumber(args.Y) * this.forceScale;
        Matter.Body.applyForce(state.body, state.body.position, {x: x, y: y});
    }

    push (args, util) {
        // todo: clamp the force
        const state = this._getPhysicsState(util.target);
        const force = Cast.toNumber(args.FORCE);
        const radians = this._scratchToMatterAngle(util.target.direction);
        const fx = force * Math.cos(radians) * this.forceScale;
        const fy = force * Math.sin(radians) * this.forceScale;
        Matter.Body.applyForce(state.body, state.body.position, {x: fx, y: fy});
    }

    twist (args, util) {
        // todo: clamp the force
        const state = this._getPhysicsState(util.target);
        const force = Cast.toNumber(args.FORCE) * -1;
        state.body.torque = force;
    }

    setGravity (args) {
        // todo: clamp gravity
        const g = -1 * Cast.toNumber(args.GRAVITY) / 100;
        this.engine.world.gravity.y = g;
    }
}

module.exports = Scratch3PhysicsBlocks;
