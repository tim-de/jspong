const canvas = document.getElementById("timsCanvas");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

/**
 * @param {number} a - First value to compare
 * @param {number} b - Second value to compare
 * @param {number} [epsilon=0.0001] - The maximum allowed error
 * @return {boolean}
 */
function approxEqual(a, b, epsilon = 0.0001) {
    return Math.abs(a - b) < epsilon;
}

/**
 * @function Reflect a 2-vector in a line of a given angle from the x-axis
 * @param {{ x: number, y: number }} inVector - The vector to reflect
 * @param {number} theta - The angle of the surface to reflect from
 * @return {{ x: number, y: number }} The reflected vector
 */
function reflectVector(inVector, theta) {
    return {
        x: (inVector.x * Math.cos(2 * theta)) + (inVector.y * Math.sin(2 * theta)),
        y: (inVector.x * Math.sin(2 * theta)) - (inVector.y * Math.cos(2 * theta)),
    };
}
/** @type {{ x: number, y: number }} */
let testvector = reflectVector({x: 0, y: 1}, Math.PI / 4);
console.assert(approxEqual(testvector.x, 1) && approxEqual(testvector.y, 0), testvector);

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

/** @class */
class Ball {
    /**
     * Constructor for Ball
     * @constructor
     * @param {Bounds} bounds - The area this object is limited to
     * @param {number} radius - The radius of the ball
     * @param {string} fillStyle
     * @param {Vector2} initPos - The starting position
     * @param {Vector2} vel - The starting velocity
     */
    constructor(bounds, radius, fillStyle, initPos, vel, context) {
        /** @type {Bounds} */
        this.bounds = bounds;
        /** @type {number} */
        this.radius = radius;
        /** @type {string} */
        this.fillStyle = fillStyle;
        /** @type {Vector2} */
        this.pos = initPos;
        /** @type {Vector2} */
        this.vel = vel;
        this.context = context;
        /** @type {any[]} */
        this.colliders = [];
        /** @type {number} */
        this.collisionCooldown = 0;
    }

    addCollider(collider) {
        this.colliders.push(collider);
    }

    draw() {
        this.context.beginPath();
        this.context.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI*2);
        this.context.fillStyle = this.fillStyle;
        this.context.fill();
        this.context.closePath();
    }

    boundsClamp() {
        if (this.pos.x - this.bounds.minX < this.radius) {
            this.pos.x = this.bounds.minX + this.radius;
        }
        else if (this.bounds.maxX - this.pos.x < this.radius) {
            this.pos.x = this.bounds.maxX - this.radius;
        }

        if (this.pos.y - this.bounds.minY < this.radius) {
            this.pos.y = this.bounds.minY + this.radius;
        }
        else if (this.bounds.maxY - this.pos.y < this.radius) {
            this.pos.y = this.bounds.maxY - this.radius;
        }
    }

    collisionCheck() {
        for (var collider of this.colliders) {
            // For the sake of laziness (also come on, I'm not writing a game engine here)
            // I am assuming all colliders are rectangles (well, instances of Paddle really)
            if (Math.abs(this.pos.x - collider.pos.x) <= this.radius + (collider.size.x / 2) && Math.abs(this.pos.y - collider.pos.y) <= collider.size.y / 2) {
                // Handle the case of a collision on a vertical face of the collider
                this.vel.x = Math.abs(this.vel.x) * Math.sign(this.pos.x - collider.pos.x);
                this.collisionCooldown = 20;
            }
            else if (Math.abs(this.pos.y - collider.pos.y) <= this.radius + (collider.size.y / 2) && Math.abs(this.pos.x - collider.pos.x) <= collider.size.x / 2) {
                // Handle the case of a collision on a horizontal face of the collider
                this.vel.y = Math.abs(this.vel.y) * Math.sign(this.pos.y - collider.pos.y);
                this.collisionCooldown = 20;
            }
            else if (Math.abs(this.pos.x - collider.pos.x) < this.radius + (collider.size.x / 2) && Math.abs(this.pos.y - collider.pos.y) < this.radius + (collider.size.y / 2)) {
                // The ball is near the corner of a collider, so a more thorough check can be
                // performed to see if it collides. If so, then the displacement to the corner
                // involved in the collision needs to be known (will need to be found during
                // the check, so can be saved and reused) so that the ball's velocity can be
                // reflected across the displacement vector.
                // This feels like a lot of work, but hopefully it's not too slow.
                let closestCorner = {x: null, y: null}
                if (this.pos.x < collider.pos.x) {
                    closestCorner.x = collider.pos.x - (collider.size.x / 2);
                }
                else {
                    closestCorner.x = collider.pos.x + (collider.size.x / 2);
                }
                if (this.pos.y < collider.pos.y) {
                    closestCorner.y = collider.pos.y - (collider.size.y / 2);
                }
                else {
                    closestCorner.y = collider.pos.y + (collider.size.y / 2);
                }
                let toCorner = {x: closestCorner.x - this.pos.x, y: closestCorner.y - this.pos.y};
                let magnitude = Math.sqrt(Math.pow(toCorner.x, 2) + Math.pow(toCorner.y, 2));
                if (magnitude <= this.radius) {
                    // Handle the collision with the corner
                    /** @type {number} */
                    let theta = Math.asin(toCorner.y / magnitude) + (this.pos.x > collider.pos.x ? -(Math.PI) : (Math.PI / 2));
                    /** @type {number} */
                    let deltaY = collider.vel.y * (toCorner.y / magnitude);
                    this.vel.y += deltaY;
                    this.vel = reflectVector(this.vel, theta);
                    console.log(Math.sqrt(Math.pow(this.vel.x, 2) + Math.pow(this.vel.y, 2)));
                    this.collisionCooldown = 20;
                }
            }
        }
    }
    
    bounceCheck() {
        if (this.pos.x - this.bounds.minX <= this.radius || this.bounds.maxX - this.pos.x <= this.radius) {
            this.vel.x = -this.vel.x;
        }
        if (this.pos.y - this.bounds.minY <= this.radius || this.bounds.maxY - this.pos.y <= this.radius) {
            this.vel.y = -this.vel.y;
        }
    }

    updatePos() {
        if (this.collisionCooldown > 0) {
            this.collisionCooldown -= 1;
        }
        this.boundsClamp();
        this.bounceCheck();
        if (this.collisionCooldown == 0) {
            this.collisionCheck();
        }
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
    }
}

/** @class */
class Paddle {
    /**
     * Constructor for Paddle
     * @constructor
     * @param {Bounds} bounds - The limits of where the paddle can go
     * @param {Vector2} size - The size of the rectangular paddle
     * @param {string} fillStyle - the fill style to pass to the context during the draw step
     * @param {Vector2} initPos - The initial position of the centre of the paddle
     * @param {Vector2} vel - The initial velocity components of the paddle
     * @param {string[]} upKeys - A list of the keys used to send a "move up" signal
     * @param {string[]} downKeys - A list of the keys used to send a "move down" signal
     */
    constructor(bounds, size, fillStyle, initPos, vel, context, upKeys, downKeys) {
        /** @type {Bounds} */
        this.bounds = bounds;
        /** @type {Vector2} */
        this.size = size;
        /** @type {string} */
        this.fillStyle = fillStyle;
        /** @type {Vector2} */
        this.pos = initPos;
        /** @type {Vector2} */
        this.vel = vel;
        this.context = context;
        /** @type {string[]} */
        this.upKeys = upKeys;
        /** @type {string[]} */
        this.downKeys = downKeys;
        /** @type {boolean} */
        this.upPressed = false;
        /** @type {boolean} */
        this.downPressed = false;
    }

    draw() {
        this.context.beginPath();
        this.context.rect(this.pos.x - (this.size.x / 2), this.pos.y - (this.size.y / 2), this.size.x, this.size.y);
        this.context.fillStyle = this.fillStyle;
        this.context.fill();
        this.context.closePath();
    }

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

    bounceCheck() {
        if (this.pos.x - this.bounds.minX <= this.size.x / 2 || this.bounds.maxX - this.pos.x <= this.size.x / 2) {
            this.vel.x = -this.vel.x;
        }
        if (this.pos.y - this.bounds.minY <= this.size.y / 2 || this.bounds.maxY - this.pos.y <= this.size.y / 2) {
            this.vel.y = -this.vel.y;
        }
    }

    updatePos() {
        this.updateVel();
        this.boundsClamp();
        this.bounceCheck();
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
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

/** @type {{minX: number, minY: number, maxX: number, maxY: number}} */
const canvasBounds = {minX: 0, minY: 0, maxX: canvas.width, maxY: canvas.height};
let controllable = []
// Both Ball and Paddle should really inherit from a base actor class with all the base movement logic
// but cba with that rn

let blob = new Ball(canvasBounds, 10, "#22aa33", {x: canvas.width/2, y:canvas.height/2}, {x:1.5, y:0}, ctx);

let padB = new Paddle(canvasBounds, {x: 10, y: 50 }, "#aa2233", {x: canvasBounds.maxX - 15, y: canvasBounds.maxY / 2}, {x: 0, y: 0}, ctx, ["Up", "ArrowUp"], ["Down", "ArrowDown"]);
controllable.push(padB);
blob.addCollider(padB);

let padA = new Paddle(canvasBounds, {x: 10, y: 50}, "#2233aa", {x: 15, y: canvasBounds.maxY / 2}, {x: 0, y: 0}, ctx, ["w"], ["s"]);
controllable.push(padA);
blob.addCollider(padA);

function keyDownHandler(event) {
    for (actor of controllable) {
        if (actor.upKeys.includes(event.key)) {
            actor.upPressed = true;
        }
        else if (actor.downKeys.includes(event.key)) {
            actor.downPressed = true;
        }
    }
}

function keyUpHandler(event) {
    for (actor of controllable) {
        if (actor.upKeys.includes(event.key)) {
            actor.upPressed = false;
        }
        else if (actor.downKeys.includes(event.key)) {
            actor.downPressed = false;
        }
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    blob.updatePos();
    padA.updatePos();
    padB.updatePos();
    blob.draw();
    padA.draw();
    padB.draw();
}

setInterval(draw, 2);
