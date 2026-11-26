import { describe, expect, it } from 'vitest';
import {
  clamp,
  computeArmGeometry,
  computeForwardKinematics,
  pickSafeDroneWaypoint,
  ServoSpring,
  solvePlanarIK,
  stepDroneFlight,
} from '../../src/lib/kinematic-solver';

describe('Kinematic Solver & Autonomous Pixel Drone Math', () => {
  it('computes arm geometry scaling reach to detent height', () => {
    const geom = computeArmGeometry(1200, 480);
    expect(geom.l1 + geom.l2).toBeGreaterThan(480 - geom.shoulderY - geom.wristDrop);
    expect(geom.carriageLeadX).toBeGreaterThan(0);
  });

  it('solves planar left-elbow IK accurately and avoids NaN on edge targets', () => {
    const geom = computeArmGeometry(1200, 460);
    const pose = solvePlanarIK(620, 440, geom);

    expect(Number.isFinite(pose.j1)).toBe(true);
    expect(Number.isFinite(pose.j2)).toBe(true);
    expect(Number.isFinite(pose.j3)).toBe(true);
    expect(pose.j2).toBeLessThanOrEqual(0); // left-elbow bend invariant
    expect(Math.abs(pose.tip.x - 620)).toBeLessThan(1.5);
    expect(Math.abs(pose.tip.y - 440)).toBeLessThan(1.5);

    // Out-of-bounds target clamps cleanly without NaN
    const extreme = solvePlanarIK(-400, 9999, geom);
    expect(extreme.carriageX).toBeGreaterThanOrEqual(geom.xMargin);
    expect(Number.isFinite(extreme.tip.x)).toBe(true);
    expect(Number.isFinite(extreme.tip.y)).toBe(true);

    // Every station (including far-left Station 0) and IDLE keeps elbow inside visible canvas (x >= 20)
    const idle = solvePlanarIK(Math.round(1200 * 0.21), Math.round(460 * 0.68), geom);
    expect(idle.elbow.x).toBeGreaterThanOrEqual(20);
    for (const sx of [100, 300, 500, 700, 900, 1100]) {
      const p = solvePlanarIK(sx, 438, geom);
      expect(p.elbow.x).toBeGreaterThanOrEqual(20);
    }

    const fk = computeForwardKinematics(extreme.carriageX, extreme.j1, extreme.j2, extreme.j3, geom);
    expect(fk.tip.x).toBeCloseTo(extreme.tip.x, 4);
  });

  it('converges critically damped ServoSpring and triggers auto-sleep settle threshold', () => {
    const sp = new ServoSpring(0, 20, 1.0, 0.15, 0.15);
    expect(sp.isSettled(100)).toBe(false);
    for (let i = 0; i < 60; i++) {
      sp.step(100, 0.016);
    }
    expect(sp.isSettled(100)).toBe(true);
    expect(sp.x).toBe(100);
    expect(sp.v).toBe(0);

    sp.reset(42);
    expect(sp.x).toBe(42);
    expect(clamp(50, 0, 10)).toBe(10);
  });

  it('picks safe autonomous drone waypoints avoiding open modal rectangles', () => {
    const avoid = { left: 300, right: 900, top: 100, bottom: 600 };
    const wp = pickSafeDroneWaypoint({ width: 1280, height: 800 }, avoid, () => 0.5);
    expect(wp.x).toBeGreaterThan(avoid.right);
  });

  it('steps drone flight smoothly inside viewport bounds with realistic banking tilt', () => {
    let state = {
      x: 120,
      y: 120,
      vx: 0,
      vy: 0,
      targetX: 800,
      targetY: 320,
      tiltDeg: 0,
      phase: 0,
      dwellSec: 0,
    };

    for (let i = 0; i < 40; i++) {
      state = stepDroneFlight(state, 0.016, { width: 1280, height: 800 }, null, null, () => 0.2);
    }

    expect(state.x).toBeGreaterThan(150);
    expect(state.tiltDeg).toBeGreaterThan(0);
    expect(Math.abs(state.tiltDeg)).toBeLessThanOrEqual(16);

    // Override target (e.g., QUADYX hover acknowledgement) steers toward override point
    const ack = stepDroneFlight(
      state,
      0.016,
      { width: 1280, height: 800 },
      { x: 400, y: 200 },
      null,
    );
    expect(ack.targetX).toBe(400);
  });
});
