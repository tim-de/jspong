//import { Bounds, Vector2, Ball, Paddle } from "engine.js";

const canvas = document.getElementById("timsCanvas");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

/** @type {Bounds} */
const canvasBounds = {minX:0, minY: 0, maxX: canvas.width, maxY: canvas.height};

/** @type {Paddle[]} */
let controllable = []

let blob = new Ball(canvasBounds, 10, "#aa2233", new Vector2(canvasBounds.maxX/2, canvasBounds.maxY/2), new Vector2(1.5, 0), ctx);

let padA = new Paddle(canvasBounds, new Vector2(10, 50), "#22aa33", new Vector2(15, canvasBounds.maxY / 2), new Vector2(0, 0), ["w"], ["s"], ctx);

controllable.push(padA);
blob.addCollider(padA);

let padB = new Paddle(canvasBounds, new Vector2(10, 50), "#2233aa", new Vector2(canvasBounds.maxX - 15, canvasBounds.maxy / 2), new Vector2(0, 0), ["Up", "ArrowUp"], ["Down, ArrowDown"], ctx);

controllable.push(padB);
blob.addCollider(padB);

function keyDownHandler(event) {
    for (var actor of controllable) {
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

setInterval(draw, 5);
