/*
 * This is going to be a kind of second try at the whole
 * pong thing, and mostly a refactor of ctest.js, which
 * is a bit of a mess.
 *
 * Being able to start afresh using JSdoc typing will
 * make for a neater type situation than the kind of
 * tacked-on-halfway-through mess we have over there.
 */

/**
 * @typedef {string | CanvasGradient | CanvasPattern} FillStyle
 */

/**
 * @typedef {object} Bounds - For storing corners of a bounding rectangle
 * @property {number} minX
 * @property {number} minY
 * @property {number} maxX
 * @property {number} maxY
 */

/**
 * @typedef {object} Vector2 - A 2-element vector
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {object} Actor
 * @property {Bounds} bounds
 * @property {Vector2} pos
 * @property {Vector2} vel
 * @property {FillStyle} fillStyle
 * @property {CanvasRenderingContext2D} context
 */

/** A class representing a generic actor in a scene */
class Actor {
    /**
     * Create a new Actor
     * @param {Bounds} bounds - The area the actor is limited to
     * @param {Vector2} initPos - The starting position
     * @param {Vector2} initVel - The starting velocity
     * @param {FillStyle} fillStyle - The fill style to be passed on to the context when drawing the actor
     * @param {CanvasRenderingContext2D} context - The 2d canvas context the actor is to be drawn into
     */
    constructor(bounds, initPos, initVel, fillStyle, context) {
        this.bounds = bounds;
        this.pos = initPos;
        this.vel = initVel;
        this.fillStyle = fillStyle;
        this.context = context;
    }
}
