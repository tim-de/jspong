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

/** A class representing a generic actor in a scene */
class Actor {
    /**
     * Create a new Actor
     * @param {Bounds} bounds - The area the actor is limited to
     * @param {Vector2} initPos - The starting position
     * @param {Vector2} initVel - The starting velocity
     * @param {Vector2} size - The width and height of the Actor
     * @param {FillStyle} fillStyle - The fill style to be passed on to the context when drawing the actor
     * @param {CanvasRenderingContext2D} context - The 2d canvas context the actor is to be drawn into
     */
    constructor(bounds, initPos, initVel, size, fillStyle, context) {
        /** @type {Bounds} */
        this.bounds = bounds;
        /** @type {Vector2} */
        this.pos = initPos;
        /** @type {Vector2} */
        this.vel = initVel;
        /** @type {Vector2} */
        this.size = size;
        /** @type {FillStyle} */
        this.fillStyle = fillStyle;
        /** @type {CanvasRenderingContext2D} */
        this.context = context;
    }

    /**
     * Draw the Actor as a rectangle in the specified context
     */
    draw() {
        this.context.beginPath();
        this.context.rect(this.pos.x - (this.size.x / 2), this.pos.y - (this.size.y / 2), this.size.x, this.size.y);
        this.context.fillStyle = this.fillStyle;
        this.context.fill();
        this.context.closePath();
    }

    /**
     * Ensure the Actor is within the specified bounds
     */
    boundsClamp() {
        if (this.pos.x - this.bounds.minX < this.size.x / 2) {
            this.pos.x = this.bounds.minX + this.size.x / 2;
        }
        else if (this.bounds.maxX - this.pos.x < this.size.x / 2) {
            this.pos.x = this.bounds.maxX - this.size.x / 2;
        }

        if (this.pos.y - this.bounds.minY < this.size.y / 2) {
            this.pos.y = this.bounds.minY + this.size.y / 2;
        }
        else if (this.bounds.maxY - this.pos.y < this.size.y / 2) {
            this.pos.y = this.bounds.maxY - this.size.y / 2;
        }
    }

    /**
     * Handle any collisions with the edges of the bound areas
     */
    bounceCheck() {
        if (this.pos.x - this.bounds.minX <= this.size.x / 2 || this.bounds.maxX - this.pos.x <= this.size.x / 2) {
            this.vel.x = -this.vel.x;
        }
        if (this.pos.y - this.bounds.minY <= this.size.y / 2 || this.bounds.maxY - this.pos.y <= this.size.y / 2) {
            this.vel.y = -this.vel.y;
        }
    }

    /**
     * Update the position of the Actor
     */
    updatePos() {
        this.boundsClamp();
        this.bounceCheck();
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
    }
}
