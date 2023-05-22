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
 * For the fillStyle property of the CanvasRenderingContext2D class
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

export class Vector2 {
    /**
     * Instantiate a Vector2
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        /** @type {number} */
        this.x = x;
        /** @type {number} */
        this.y = y;
    }

    /**
     * Add another vector to this one, returning the
     * resulting vector.
     * @param {Vector2} other
     * @return {Vector2}
     */
    add(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    /**
     * Subtract another vector from this one, returning
     * the difference.
     * @param {Vector2} other
     * @return {Vector2}
     */
    subtract(other) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }

    /**
     * scale by a given factor
     * @param {number} scale_factor
     * @return {Vector2}
     */
    scale(scale_factor) {
        return new Vector2(this.x * scale_factor, this.y * scale_factor);
    }

    /**
     * Add another vector to this one, modifying it in place
     * and returning it.
     * @param {Vector2} other
     * @return {Vector2}
     */
    link(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    /**
     * Get the magnitude of a Vector2
     * @return {number}
     */
    getMagnitude() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    /**
     * Normalise a Vector2 (reduce magnitude to 1)
     * @return {Vector2}
     */
    normalise() {
        let magnitude = this.getMagnitude();
        this.x /= magnitude;
        this.y /= magnitude;
        return this;
    }

    /**
     * Calculate the dot product of this and another Vector2
     * @param {Vector2} other
     * @return {number}
     */
    dotProduct(other) {
        return (this.x * other.x) + (this.y * other.y);
    }

    /**
     * Reflect a Vector2 across a normal. Normal MUST have magnitude
     * of 1
     * @param {Vector2} normal
     * @return {Vector2}
     */
    reflect(normal) {
        let dot = this.dotProduct(normal);
        this.x -= 2 * dot * normal.x;
        this.y -= 2 * dot * normal.y;
        return this;
    }
}


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
        this.bounceCheck();
        this.boundsClamp();
        this.pos.link(this.vel);
    }
}

/** A class to implement a ball in pong */
export class Ball extends Actor {
    /**
     * Instantiate a ball object
     * @param {Bounds} bounds
     * @param {number} radius
     * @param {FillStyle} fillStyle
     * @param {Vector2} initPos
     * @param {Vector2} initVel
     * @param {CanvasRenderingContext2D}
     */
    constructor(bounds, radius, fillStyle, initPos, initVel, context) {
        super(bounds, initPos, initVel, new Vector2(radius * 2, radius * 2), fillStyle, context);
        /** @type {number} */
        this.radius = radius;
        /** @type {Actor[]} */
        this.colliders = [];
        /** @type {number} */
        this.collisionCooldown = 0;
    }

    /**
     * @param {Actor} collider
     */
    addCollider(collider) {
        this.colliders.push(collider);
    }

    /**
     * Draw the ball on the canvas.
     */
    draw() {
        this.context.beginPath();
        this.context.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI*2);
        this.context.fillStyle = this.fillStyle;
        this.context.fill();
        this.context.closePath();
    }

    /**
     * @param {Paddle} collider
     * @return {Vector2}
     */
    getClosestCorner(collider) {
        return new Vector2(collider.pos.x + (collider.size.x * Math.sign(this.pos.x - collider.pos.x)),
                           collider.pos.y + (collider.size.y * Math.sign(this.pos.y - collider.pos.y)));
    }

    /**
     * @param {Vector2} corner
     * @return {number}
     */
    velProportionToCorner(corner) {
        let to_corner = new Vector2(corner.x - this.pos.x, corner.y - this.pos.y);
        // The a, b, and c variables are named for the coefficients used in the
        // quadratic formula:
        // x = (-b +- sqrt(b^2 - 4ac)) / 2a
        // where a is the x^2 coefficient, b is the x coefficient, and c
        // is the constant
        let a = Math.pow(this.vel.x, 2) + Math.pow(this.vel.y, 2);
        let b = - (2 * to_corner.x * this.vel.x) - (2 * to_corner.y * this.vel.y);
        let c = Math.pow(to_corner.x, 2) + Math.pow(to_corner.y, 2) - Math.pow(this.radius, 2);
        if (Math.pow(b, 2) - (4 * a * c) >= 0) {
            return (-b - Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a);
        }
        else {
            return NaN;
        }
    }

    /**
     * Check and handle collision with a corner,
     * returning false if a collision did not occur
     * and true if it did and was handled
     * @param {Vector2} corner
     * @return {boolean}
     */
    cornerCollision(corner) {
        let proportion = this.velProportionToCorner(corner);
        if (proportion == NaN) {
            return false;
        }
        let to_collision = this.vel.scale(proportion);
        let pos_at_collision = this.pos.add(to_collision);
        let normal = pos_at_collision.subtract(corner).normalise();
        let reflected = this.vel.subtract(to_collision).reflect(normal);
        this.pos.link(to_collision.add(reflected));
        this.vel.reflect(normal);
        return true;
    }

    /**
     * @param {Actor} collider
     * @return {boolean}
     */
    collisionCheck(collider) {
        if (Math.abs(this.pos.x - collider.pos.x) - (this.radius + (collider.size.x / 2)) <= Math.abs(this.vel.x) && Math.abs(this.pos.y - collider.pos.y) < collider.size.y / 2) {
            // Colliding with a vertical face
            let x_to_collision = this.vel.x - ((collider.pos.x - this.pos.x) - (this.radius + (collider.size.x / 2)));
            // Simplify this, it's probably possible
            this.pos.x += this.vel.x - (2 * (this.vel.x - x_to_collision));
            this.pos.y += this.vel.y;
            this.vel.x = -this.vel.x;
            return true;
        }
        else if (Math.abs(this.pos.y - collider.pos.y) - (this.radius + collider.size.y) <= Math.abs(this.vel.y - collider.vel.y) && Math.abs(this.pos.x - collider.pos.x) < collider.size.x / 2) {
            // Colliding with a horizontal face
            let y_to_collision = this.vel.y - ((collider.pos.y - this.pos.y) - (this.radius + (collider.size.y / 2)));
            this.pos.y += this.vel.x - (2 * (this.vel.x - y_to_collision));
            this.pos.x += this.vel.x;
            this.vel.y = -this.vel.y;
            return true;
        }
        else if (Math.abs(this.pos.x - collider.pos.x) - (this.radius + collider.size / 2) <= Math.abs(this.vel.x) && Math.abs(this.pos.y - collider.pos.y) - (this.radius + collider.size.y) <= Math.abs(this.vel.y - collider.vel.y)) {
            // Maybe colliding with a corner
            // Do further check and handle possible collision
            let closest_corner = this.getClosestCorner(collider);
            return this.cornerCollision(closest_corner);
        }
        return false;
    }

    /**
     * Test for collisions with all possible objects
     * @return {boolean}
     */
    checkAllColliders() {
        for (const collider of this.colliders) {
            if (this.collisionCheck(collider)) {
                return true;
            }
        }
        return false;
    }

    updatePos() {
        if(!this.checkAllColliders()) {
            this.boundsClamp();
            this.bounceCheck();
            this.pos.link(this.vel);
        }
    }
}

/** a class to implement the paddles */
export class Paddle extends Actor {
    /**
     * Constructor for Paddle
     * @param {Bounds} bounds - The limits of where the paddle can go
     * @param {Vector2} size - The size of the rectangular paddle
     * @param {FillStyle} fillStyle - the fill style to pass to the context during the draw step
     * @param {Vector2} initPos - The initial position of the centre of the paddle
     * @param {Vector2} vel - The initial velocity components of the paddle
     * @param {string[]} upKeys - A list of the keys used to send a "move up" signal
     * @param {string[]} downKeys - A list of the keys used to send a "move down" signal
     * @param {CanvasRenderingContext2D} context
     */
    constructor(bounds, size, fillStyle, initPos, initVel, upKeys, downKeys, context) {
        super(bounds, initPos, initVel, size, fillStyle, context);
        /** @type {string[]} */
        this.upKeys = upKeys;
        /** @type {string[]} */
        this.downKeys = downKeys;
        /** @type {boolean} */
        this.upPressed = false;
        /** @type {boolean} */
        this.downPressed = false;
    }

    updatePos() {
        this.updateVel();
        this.boundsClamp();
        this.bounceCheck();
        this.pos.link(this.vel);
    }

    updateVel() {
        if (this.upPressed) {
            this.vel.y -= 0.2;
        }
        else if (this.downPressed) {
            this.vel.y += 0.2;
        }
        this.vel.y -= 0.04 * this.vel.y;
    }
}
