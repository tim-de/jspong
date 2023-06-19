import {expect, test, describe} from "bun:test";

import { Vector2, Ball, Actor } from "./engine.js";

/**
 * Determine if two values are very close (within floating-point error)
 * @param {number} a
 * @param {number} b
 * @param {number} [epsilon=0.000001] - The max difference before false is returned
 * @return {boolean}
 */
const almostEqual = function(a, b, epsilon = 0.000001) {
    return Math.abs(a - b) <= epsilon;
}

test("Get magnitude of vector", () => {
    let testVec = new Vector2(3, 4);
    expect(testVec.getMagnitude()).toEqual(5);
});

test("Normalise a vector", () => {
    let testVec = new Vector2(1, 1);
    testVec.normalise();
    expect(testVec.x).toEqual(1 / Math.sqrt(2));
    expect(testVec.y).toEqual(1 / Math.sqrt(2));
});

test("Get dot product", () => {
    let a = new Vector2(2, 1);
    let b = new Vector2(3, 3);
    expect(a.dotProduct(b)).toEqual(9);
});

test("Reflect a vector", () => {
    let testVec = new Vector2(2, 0);
    let normal = new Vector2(-1, -1);
    normal.normalise();
    testVec.reflect(normal);
    expect(almostEqual(testVec.x, 0)).toBeTruthy();
    expect(almostEqual(testVec.y, -2)).toBeTruthy();
});

describe("Ball collision with corner (manually)", () => {
    let testBounds = {minX: -100, minY: -100, maxX: 100, maxY: 100};
    let testCtx = null;
    let testBall = new Ball(testBounds, 10, "#112233", new Vector2(0, 0), new Vector2(8, 6), testCtx);
    let corner = new Vector2(4, 13);
    let proportion = testBall.velProportionToCorner(corner);
    let to_collision = testBall.vel.scale(proportion);
    let collision_pos = testBall.pos.add(to_collision);
    test("Find the point of collision with a corner", () => {
        expect(almostEqual(proportion, 0.5)).toBeTruthy();
        expect(almostEqual(corner.subtract(collision_pos).getMagnitude(), testBall.radius)).toBeTruthy();
        expect(almostEqual(collision_pos.x, 4)).toBeTruthy();
        expect(almostEqual(collision_pos.y, 3)).toBeTruthy();
    });
    let normal = collision_pos.subtract(corner).normalise();
    let reflected = testBall.vel.subtract(to_collision).reflect(normal);
    test("Get the reflected part of the vector", () => {
        expect(almostEqual(reflected.x, 4)).toBeTruthy();
        expect(almostEqual(reflected.y, -3)).toBeTruthy();
    });
    testBall.pos.link(to_collision.add(reflected));
    testBall.vel.reflect(normal);
    test("Get the position of the ball post-collision", () => {
        expect(almostEqual(testBall.pos.x, 8)).toBeTruthy();
        expect(almostEqual(testBall.pos.y, 0)).toBeTruthy();
    });
    test("Get the velocity of the ball post-collision", () => {
        expect(almostEqual(testBall.vel.x, 8)).toBeTruthy();
        expect(almostEqual(testBall.vel.y, -6)).toBeTruthy();
    });
});

describe("Find closest corner", () => {
    let testBounds = {minX: -100, minY: -100, maxX: 100, maxY: 100};
    let testCtx = null;
    let testBall = new Ball(testBounds, 10, "#112233", new Vector2(0, 0), new Vector2(8, 6), testCtx);
    test("Collider at +x, +y", () => {
        let testCollider = new Actor(testBounds, new Vector2(9, 18), new Vector2(0,0), new Vector2(10,10), "#001122", testCtx);
        let corner = testBall.getClosestCorner(testCollider);
        expect(almostEqual(corner.x, 4)).toBeTruthy();
        expect(almostEqual(corner.y, 13)).toBeTruthy();
    });
    test("Collider at +x, -y", () => {
        let testCollider = new Actor(testBounds, new Vector2(9, -18), new Vector2(0,0), new Vector2(10,10), "#001122", testCtx);
        let corner = testBall.getClosestCorner(testCollider);
        expect(almostEqual(corner.x, 4)).toBeTruthy();
        expect(almostEqual(corner.y, -13)).toBeTruthy();
    });
    test("Collider at -x, +y", () => {
        let testCollider = new Actor(testBounds, new Vector2(-9, 18), new Vector2(0,0), new Vector2(10,10), "#001122", testCtx);
        let corner = testBall.getClosestCorner(testCollider);
        expect(almostEqual(corner.x, -4)).toBeTruthy();
        expect(almostEqual(corner.y, 13)).toBeTruthy();
    });
    test("Collider at -x, -y", () => {
        let testCollider = new Actor(testBounds, new Vector2(-9, -18), new Vector2(0,0), new Vector2(10,10), "#001122", testCtx);
        let corner = testBall.getClosestCorner(testCollider);
        expect(almostEqual(corner.x, -4)).toBeTruthy();
        expect(almostEqual(corner.y, -13)).toBeTruthy();
    });
});

describe("Find proportion to corner", () => {
    let testBounds = {minX: -100, minY: -100, maxX: 100, maxY: 100};
    let testCtx = null;
    test("Corner at +x, +y", () => {
        let testBall = new Ball(testBounds, 10, "#112233", new Vector2(0, 0), new Vector2(8, 6), testCtx);
        let corner = new Vector2(4, 13);
        let proportion = testBall.velProportionToCorner(corner);
        expect(almostEqual(proportion, 0.5)).toBeTruthy();
    });
    test("Corner at +x, -y", () => {
        let testBall = new Ball(testBounds, 10, "#112233", new Vector2(0, 0), new Vector2(8, -6), testCtx);
        let corner = new Vector2(4, -13);
        let proportion = testBall.velProportionToCorner(corner);
        expect(almostEqual(proportion, 0.5)).toBeTruthy();
    });
    test("Corner at -x, +y", () => {
        let testBall = new Ball(testBounds, 10, "#112233", new Vector2(0, 0), new Vector2(-8, 6), testCtx);
        let corner = new Vector2(-4, 13);
        let proportion = testBall.velProportionToCorner(corner);
        expect(almostEqual(proportion, 0.5)).toBeTruthy();
    });
    test("Corner at -x, -y", () => {
        let testBall = new Ball(testBounds, 10, "#112233", new Vector2(0, 0), new Vector2(-8, -6), testCtx);
        let corner = new Vector2(-4, -13);
        let proportion = testBall.velProportionToCorner(corner);
        expect(almostEqual(proportion, 0.5)).toBeTruthy();
    });
});

test("Ball collision with corner (using cornerCollision)", () => {
    let testBounds = {minX: -100, minY: -100, maxX: 100, maxY: 100};
    let testCtx = null;
    let testBall = new Ball(testBounds, 10, "#112233", new Vector2(0, 0), new Vector2(8, 6), testCtx);
    let testCollider = new Actor(testBounds, new Vector2(9, 18), new Vector2(0,0), new Vector2(10,10), "#001122", testCtx);
    let corner = testBall.getClosestCorner(testCollider);
    expect(almostEqual(corner.x, 4)).toBeTruthy();
    expect(almostEqual(corner.y, 13)).toBeTruthy();
    testBall.cornerCollision(corner, testCollider);
    expect(almostEqual(testBall.pos.x, 8)).toBeTruthy();
    expect(almostEqual(testBall.pos.y, 0)).toBeTruthy();
    expect(almostEqual(testBall.vel.x, 8)).toBeTruthy();
    expect(almostEqual(testBall.vel.y, -6)).toBeTruthy();
});

test("Ball collision with vertical edge (manually)", () => {
    let testBounds = {minX: -100, minY: -100, maxX: 100, maxY: 100};
    let testCtx = null;
    let testBall = new Ball(testBounds, 10, "#112233", new Vector2(2, 0), new Vector2(6, 6), testCtx);
    let edgex = 16;
    let to_collision = testBall.vel.x - (edgex - (testBall.pos.x +  testBall.radius));
    let from_collision = testBall.vel.x - to_collision;
    let collision_delta = new Vector2(testBall.vel.x - (2 * from_collision), testBall.vel.y);
    testBall.pos.link(collision_delta);
    testBall.vel.x = -testBall.vel.x;
    expect(testBall.pos.x).toEqual(0);
    expect(almostEqual(testBall.pos.y, 6)).toBeTruthy();
    expect(almostEqual(testBall.vel.x, -6)).toBeTruthy();
    expect(almostEqual(testBall.vel.y, 6)).toBeTruthy();
});

test("Ball collision with vertical edge (using edgeCollisionV)", () => {
    let testBounds = {minX: -100, minY: -100, maxX: 100, maxY: 100};
    let testCtx = null;
    let testBall = new Ball(testBounds, 10, "#112233", new Vector2(0, 0), new Vector2(6, 6), testCtx);
    let edgex = 14;
    testBall.edgeCollisionV(edgex);
    expect(testBall.pos.x).toEqual(2);
    expect(almostEqual(testBall.pos.y, 6)).toBeTruthy();
    expect(almostEqual(testBall.vel.x, -6)).toBeTruthy();
    expect(almostEqual(testBall.vel.y, 6)).toBeTruthy();
}); 
