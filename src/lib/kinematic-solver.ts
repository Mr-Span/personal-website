/**
 * Pure TypeScript analytical kinematics, critically damped servo springs,
 * and autonomous pixel-drone steering math (100% DOM-free for Vitest Node unit testing).
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface ArmGeometry {
  stageWidth: number;
  railY: number;
  shoulderY: number;
  l1: number;
  l2: number;
  wristDrop: number;
  xMargin: number;
  carriageLeadX: number;
}

export interface ArmPose {
  carriageX: number;
  j1: number; // shoulder angle (radians, 0 = straight right, +PI/2 = straight down)
  j2: number; // elbow relative angle (radians, positive = left-elbow bend)
  j3: number; // wrist relative angle keeping gripper vertical downward
  elbow: Point2D;
  wrist: Point2D;
  tip: Point2D;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeArmGeometry(stageWidth: number, detentY: number): ArmGeometry {
  const railY = 14;
  const shoulderY = 36;
  const wristDrop = 16;
  const verticalSpan = Math.max(180, detentY - shoulderY - wristDrop);
  const totalReach = verticalSpan * 1.055;
  return {
    stageWidth,
    railY,
    shoulderY,
    l1: totalReach * 0.51,
    l2: totalReach * 0.49,
    wristDrop,
    xMargin: 56,
    carriageLeadX: 32,
  };
}

/**
 * Analytical 2-link left-elbow Inverse Kinematics (zero branch-flip discontinuities).
 * Coordinate space: +X right, +Y downward.
 */
export function solvePlanarIK(targetX: number, targetY: number, geom: ArmGeometry): ArmPose {
  const minX = geom.xMargin;
  const maxX = Math.max(minX, geom.stageWidth - geom.xMargin);
  // Keep carriage slightly left of target while preserving left-margin elbow clearance
  const minCarriageForElbow = Math.min(maxX, Math.max(minX, Math.round(geom.l1 * 0.7)));
  const carriageX = clamp(targetX - geom.carriageLeadX, minCarriageForElbow, maxX);

  const wristTargetX = targetX;
  const wristTargetY = Math.max(geom.shoulderY + 24, targetY - geom.wristDrop);

  const dx = wristTargetX - carriageX;
  const dy = wristTargetY - geom.shoulderY;

  const minR = Math.abs(geom.l1 - geom.l2) + 8;
  const maxR = geom.l1 + geom.l2 - 4;
  const rawR = Math.hypot(dx, dy);
  const r = clamp(rawR, minR, maxR);

  const cosJ2 = clamp(
    (r * r - geom.l1 * geom.l1 - geom.l2 * geom.l2) / (2 * geom.l1 * geom.l2),
    -1,
    1,
  );
  // Fixed negative elbow bend places elbow cleanly to the LEFT while reaching downward
  const j2 = -Math.acos(cosJ2);
  const baseAngle = Math.atan2(dy, dx);
  const k1 = geom.l1 + geom.l2 * Math.cos(j2);
  const k2 = geom.l2 * Math.sin(j2);
  const j1 = baseAngle - Math.atan2(k2, k1);
  // Keep gripper tool axis strictly vertical (+PI/2)
  const j3 = Math.PI / 2 - (j1 + j2);

  return computeForwardKinematics(carriageX, j1, j2, j3, geom);
}

export function computeForwardKinematics(
  carriageX: number,
  j1: number,
  j2: number,
  j3: number,
  geom: ArmGeometry,
): ArmPose {
  const elbowX = carriageX + geom.l1 * Math.cos(j1);
  const elbowY = geom.shoulderY + geom.l1 * Math.sin(j1);
  const wristX = elbowX + geom.l2 * Math.cos(j1 + j2);
  const wristY = elbowY + geom.l2 * Math.sin(j1 + j2);
  const tipX = wristX;
  const tipY = wristY + geom.wristDrop;

  return {
    carriageX,
    j1,
    j2,
    j3,
    elbow: { x: elbowX, y: elbowY },
    wrist: { x: wristX, y: wristY },
    tip: { x: tipX, y: tipY },
  };
}

/**
 * Second-order spring integrator (semi-implicit Euler sub-stepped) with separate
 * position/velocity settle thresholds for clean rAF auto-sleep.
 */
export class ServoSpring {
  public x: number;
  public v: number;
  private readonly stiffness: number;
  private readonly damping: number;
  private readonly posEps: number;
  private readonly velEps: number;

  constructor(
    initial: number,
    omegaN: number,
    dampingRatio = 1.0,
    posEps = 0.15,
    velEps = 0.15,
  ) {
    this.x = initial;
    this.v = 0;
    this.stiffness = omegaN * omegaN;
    this.damping = 2 * omegaN * dampingRatio;
    this.posEps = posEps;
    this.velEps = velEps;
  }

  public reset(value: number): void {
    this.x = value;
    this.v = 0;
  }

  public step(target: number, dtSec: number): number {
    const dt = clamp(dtSec, 0, 0.05);
    const half = dt * 0.5;
    for (let i = 0; i < 2; i++) {
      const accel = (target - this.x) * this.stiffness - this.v * this.damping;
      this.v += accel * half;
      this.x += this.v * half;
    }
    if (this.isSettled(target)) {
      this.x = target;
      this.v = 0;
    }
    return this.x;
  }

  public isSettled(target: number): boolean {
    return Math.abs(target - this.x) <= this.posEps && Math.abs(this.v) <= this.velEps;
  }
}

/* =========================================================================
   AUTONOMOUS PIXEL DRONE STEERING (Smooth Random Waypoint Flight)
   ========================================================================= */

export interface DroneBounds {
  width: number;
  height: number;
  marginX?: number;
  topMargin?: number;
  bottomMargin?: number;
}

export interface DroneState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  tiltDeg: number;
  phase: number;
  dwellSec: number;
}

export interface AvoidRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function normalizeAvoidRects(avoid: AvoidRect | AvoidRect[] | null): AvoidRect[] {
  if (!avoid) return [];
  return Array.isArray(avoid) ? avoid : [avoid];
}

function isInsideAvoid(x: number, y: number, rects: AvoidRect[], pad = 26): boolean {
  return rects.some(
    (r) => x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad,
  );
}

export function pickSafeDroneWaypoint(
  bounds: DroneBounds,
  avoid: AvoidRect | AvoidRect[] | null,
  rng: () => number = Math.random,
): Point2D {
  const mx = bounds.marginX ?? 44;
  const top = bounds.topMargin ?? 76;
  const bottom = bounds.bottomMargin ?? 48;
  const spanX = Math.max(40, bounds.width - mx * 2);
  const spanY = Math.max(40, bounds.height - top - bottom);
  const rects = normalizeAvoidRects(avoid);

  for (let attempt = 0; attempt < 14; attempt++) {
    const x = mx + rng() * spanX;
    const y = top + rng() * spanY;
    if (!isInsideAvoid(x, y, rects, 26)) {
      return { x, y };
    }
  }
  // Safe perimeter fallback (upper-right corridor inside margin)
  return { x: Math.max(mx, bounds.width - mx - 28), y: top + 24 };
}

export function stepDroneFlight(
  state: DroneState,
  dtSec: number,
  bounds: DroneBounds,
  overrideTarget: Point2D | null,
  avoid: AvoidRect | AvoidRect[] | null,
  rng: () => number = Math.random,
): DroneState {
  const dt = clamp(dtSec, 0, 0.05);
  const nextPhase = state.phase + dt * 3.8;
  const rects = normalizeAvoidRects(avoid);

  let tx = overrideTarget ? overrideTarget.x : state.targetX;
  let ty = overrideTarget ? overrideTarget.y : state.targetY;
  let dwell = state.dwellSec;

  const dist = Math.hypot(tx - state.x, ty - state.y);
  if (!overrideTarget && (dist < 24 || isInsideAvoid(tx, ty, rects, 20))) {
    dwell += dt;
    if (dwell >= 1.15 || isInsideAvoid(tx, ty, rects, 20)) {
      const wp = pickSafeDroneWaypoint(bounds, rects, rng);
      tx = wp.x;
      ty = wp.y;
      dwell = 0;
    }
  } else {
    dwell = 0;
  }

  // Smooth spring-damped velocity steering toward waypoint + soft obstacle repulsion
  const maxSpeed = overrideTarget ? 280 : 145;
  let desiredVx = clamp((tx - state.x) * 1.45, -maxSpeed, maxSpeed);
  let desiredVy = clamp((ty - state.y) * 1.45, -maxSpeed, maxSpeed);

  if (!overrideTarget) {
    for (const r of rects) {
      const pad = 26;
      if (
        state.x >= r.left - pad &&
        state.x <= r.right + pad &&
        state.y >= r.top - pad &&
        state.y <= r.bottom + pad
      ) {
        const cx = (r.left + r.right) * 0.5;
        const cy = (r.top + r.bottom) * 0.5;
        const rx = state.x - cx;
        const ry = state.y - cy;
        const len = Math.max(1, Math.hypot(rx, ry));
        desiredVx += (rx / len) * 140;
        desiredVy += (ry / len) * 140;
      }
    }
  }

  const blend = Math.min(1, dt * 2.8);
  const vx = state.vx + (desiredVx - state.vx) * blend;
  const vy = state.vy + (desiredVy - state.vy) * blend;

  const bobOffset = Math.sin(nextPhase) * 0.35;
  const mx = bounds.marginX ?? 32;
  const top = bounds.topMargin ?? 62;
  const bottom = bounds.bottomMargin ?? 32;

  const x = clamp(state.x + vx * dt, mx, Math.max(mx, bounds.width - mx));
  const y = clamp(state.y + (vy + bobOffset * 18) * dt, top, Math.max(top, bounds.height - bottom));
  const tiltDeg = clamp(vx * 0.075, -16, 16);

  return {
    x,
    y,
    vx,
    vy,
    targetX: tx,
    targetY: ty,
    tiltDeg,
    phase: nextPhase,
    dwellSec: dwell,
  };
}
