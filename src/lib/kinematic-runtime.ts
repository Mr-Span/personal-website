/**
 * Desktop-only (min-width: 1024px & pointer: fine) Three.js PBR 6-DOF UR Cobot
 * + Heavy CNC 7th-Axis Gantry Rail + Snappy Pick/Hoist/Place Choreography
 * + 9x9 Pixel-Art Intro -> Autonomous Obstacle-Avoiding Flying Pixel Drone.
 *
 * Zero bytes downloaded on mobile (< 1024px / coarse pointer).
 * Auto-sleeps GPU/rAF when idle, off-screen, or tab hidden; disposes all GPU buffers on destroy.
 */
import {
  ACESFilmicToneMapping,
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  ClampToEdgeWrapping,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  InstancedMesh,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  NearestFilter,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  RepeatWrapping,
  Scene,
  SRGBColorSpace,
  Timer,
  Vector3,
  WebGLRenderer,
  type Material,
  type Texture,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { getMotionEnvironment } from './motion';
import { ServoSpring, type Point2D } from './kinematic-solver';

const INTRO_SESSION_KEY = 'cs-pixel-intro-v30';

type ArmPhase =
  | 'IDLE'
  | 'TRACKING'
  | 'APPROACHING'
  | 'DESCENDING'
  | 'CLAMPING'
  | 'HOISTING'
  | 'LOCKED'
  | 'PLACING'
  | 'RELEASING'
  | 'RETURNING'
  | 'BADGE_TRACKING'
  | 'BADGE_APPROACHING'
  | 'BADGE_CLAMPING'
  | 'BADGE_PULLING'
  | 'BADGE_LOCKED'
  | 'BADGE_RETURNING';

export interface KinematicController {
  destroy: () => void;
  requestPickModule: (idx: number, onLockCallback: (idx: number) => void) => void;
  releaseModule: () => void;
  setActiveSlot: (idx: number) => void;
  requestPickBadge: (onLockCallback: () => void) => void;
  releaseBadge: () => void;
}

const PALETTE_3D = {
  light: {
    railAlu: 0xbeb9af,
    railSteel: 0x343942,
    cableTrack: 0x262930,
    saddleAlu: 0xcac5bc,
    runnerSteel: 0x282c34,
    wiperRubber: 0x1c1e24,
    boltSteel: 0x4b5059,
    armTube: 0xc2bdb4,
    armCollar: 0xa6a198,
    jointHousing: 0xa8a399,
    jointCap: 0x22262e,
    orange: 0xb83e0e,
    orangeLed: 0xea580c,
    blueLed: 0x38bdf8,
    gripperBody: 0x242830,
    gripperLink: 0x8e939c,
    gripperPad: 0x181b21,
    ambientInt: 0.68,
    hemiSky: 0xfffdf8,
    hemiGround: 0x9c968a,
    hemiInt: 0.44,
    keyInt: 1.48,
    fillInt: 0.62,
    envInt: 0.44,
  },
  dark: {
    railAlu: 0x3d4452,
    railSteel: 0x252b36,
    cableTrack: 0x161920,
    saddleAlu: 0x4b5363,
    runnerSteel: 0x1f232c,
    wiperRubber: 0x12141a,
    boltSteel: 0x8790a2,
    armTube: 0x3d4452,
    armCollar: 0x323845,
    jointHousing: 0x2e3440,
    jointCap: 0x181b22,
    orange: 0xea580c,
    orangeLed: 0xf97316,
    blueLed: 0x38bdf8,
    gripperBody: 0x1e222b,
    gripperLink: 0x767f90,
    gripperPad: 0x13161c,
    ambientInt: 0.74,
    hemiSky: 0xdbeafe,
    hemiGround: 0x0f1218,
    hemiInt: 0.48,
    keyInt: 1.46,
    fillInt: 0.76,
    envInt: 0.56,
  },
} as const;

function quinticEase(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * c * (c * (c * 6 - 15) + 10);
}

function getEffectiveTheme(): 'light' | 'dark' {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'dark' || attr === 'light') return attr;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Site signature geometric "C" with burnt-orange center dot & ray (matches public/favicon.svg) */
function createCarriageLogoTexture(isDark: boolean): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d')!;

  // Dark anodized emblem housing matching favicon.svg
  ctx.fillStyle = isDark ? '#14171E' : '#151619';
  ctx.fillRect(0, 0, 128, 128);

  // Subtle recessed inner frame border
  ctx.strokeStyle = isDark ? '#4F5768' : '#47453F';
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, 116, 116);

  // Crisp open geometric "C" arc (#F5F2EB)
  const openHalfAngle = Math.atan2(14, 8);
  ctx.beginPath();
  ctx.arc(64, 64, 30, openHalfAngle, Math.PI * 2 - openHalfAngle, false);
  ctx.strokeStyle = '#F5F2EB';
  ctx.lineWidth = 11;
  ctx.lineCap = 'square';
  ctx.stroke();

  // Burnt-orange center dot + signal ray extending right from center
  const accent = isDark ? '#F97316' : '#E35F32';
  ctx.beginPath();
  ctx.moveTo(64, 64);
  ctx.lineTo(98, 64);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 10;
  ctx.lineCap = 'square';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(64, 64, 10, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.fill();

  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createGantryTexture(isDark: boolean): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = isDark ? '#3D4452' : '#CECAC2';
  ctx.fillRect(0, 0, 256, 64);

  // Subtle horizontal pixel extrusion grain
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.22)';
  for (let y = 0; y < 64; y += 4) {
    ctx.fillRect(0, y, 256, 2);
  }

  // Crisp pixel channel slot
  ctx.fillStyle = isDark ? '#1A1E27' : '#585C64';
  ctx.fillRect(0, 24, 256, 16);
  ctx.fillStyle = isDark ? '#11141A' : '#3E424A';
  ctx.fillRect(0, 28, 256, 8);

  // Stepped 2px pixel scale ruler ticks
  ctx.fillStyle = isDark ? 'rgba(242,239,233,0.32)' : 'rgba(23,24,27,0.28)';
  for (let x = 0; x < 256; x += 8) {
    const major = x % 32 === 0;
    const h = major ? 12 : 6;
    ctx.fillRect(x, 64 - h, 2, h);
  }

  const tex = new CanvasTexture(c);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = ClampToEdgeWrapping;
  tex.repeat.set(9, 1);
  tex.colorSpace = SRGBColorSpace;
  tex.magFilter = NearestFilter;
  tex.minFilter = NearestFilter;
  tex.generateMipmaps = false;
  return tex;
}

/** Vertical slotted CNC structural aluminum beam texture (NearestFilter, zero distortion under scale.y) */
function createArmBeamTexture(isDark: boolean): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = isDark ? '#3D4452' : '#CECAC2';
  ctx.fillRect(0, 0, 64, 64);

  // Fine vertical extruded CNC micro-grain
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.20)';
  for (let x = 0; x < 64; x += 4) {
    ctx.fillRect(x, 0, 2, 64);
  }

  // Crisp outer machined edge bevel rails
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.45)';
  ctx.fillRect(0, 0, 3, 64);
  ctx.fillStyle = isDark ? 'rgba(0,0,0,0.28)' : 'rgba(23,24,27,0.14)';
  ctx.fillRect(61, 0, 3, 64);

  // Recessed center T-slot channel matching the gantry rail slot colors
  ctx.fillStyle = isDark ? '#1A1E27' : '#585C64';
  ctx.fillRect(23, 0, 18, 64);
  ctx.fillStyle = isDark ? '#11141A' : '#3E424A';
  ctx.fillRect(27, 0, 10, 64);

  const tex = new CanvasTexture(c);
  tex.wrapS = ClampToEdgeWrapping;
  tex.wrapT = RepeatWrapping;
  tex.colorSpace = SRGBColorSpace;
  tex.magFilter = NearestFilter;
  tex.minFilter = NearestFilter;
  tex.generateMipmaps = false;
  return tex;
}

export function mountKinematicRuntime(stageEl: HTMLElement): KinematicController {
  const canvas = stageEl.querySelector<HTMLCanvasElement>('#arm-canvas');
  const hoistCard = document.getElementById('hoist-card');
  const badgeTriggerEl = stageEl.querySelector<HTMLElement>('#personal-badge-trigger');
  const badgeAnchorDotEl = badgeTriggerEl?.querySelector<HTMLElement>('[data-badge-anchor-dot]') ?? null;
  const badgeProxyEl = document.getElementById('badge-pull-proxy');
  const cardDock = stageEl.querySelector<HTMLElement>('[data-station-dock]');
  const cardEls = Array.from(stageEl.querySelectorAll<HTMLElement>('[data-station-index]'));

  const pauseBtn = document.getElementById('btn-motion-toggle');
  const pauseLabel = document.getElementById('motion-toggle-label');
  const pixelStrip = document.getElementById('pixel-intro-strip');
  const pixelRow = document.getElementById('pixel-glyph-row');
  const pixelCaption = document.getElementById('pixel-domain-caption');

  const env = getMotionEnvironment();
  const reducedMq =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;

  let prefersReduced = env.prefersReducedMotion;
  let userPaused = prefersReduced || env.saveData;
  let heroInView = true;
  let tabVisible = document.visibilityState !== 'hidden';
  let currentTheme = getEffectiveTheme();

  let armPhase: ArmPhase = 'IDLE';
  let phaseTime = 0;
  let hoveredIdx = -1;
  let activeIdx = -1;
  let onLockCb: ((idx: number) => void) | null = null;
  let badgeHovered = false;
  let badgeActive = false;
  let onBadgeLockCb: (() => void) | null = null;
  let badgeCenterLocalY = 260;
  let badgeAnchorOriginViewport: Point2D | null = null;
  let badgePickupHoleWorld: Point2D | null = null;
  let badgeReturnDockWorld: Point2D | null = null;
  let releaseStartWristTilt = 0;
  let badgeProxyFadeTimer: number | null = null;
  let suppressBadgeRelease = false;
  let badgeReleasePointerOrigin: Point2D | null = null;
  let segStart: Point2D = { x: 0, y: 120 };
  let segEnd: Point2D = { x: 0, y: 120 };
  let hoistWidth = 200;
  let hoistHeight = 200;

  // Cached stage-local geometry (recomputed strictly via ResizeObserver, ZERO per-frame DOM reads!)
  let stageW = 1280;
  let stageH = 720;
  let cardAnchorsWorld: Point2D[] = [];
  let cardRectsLocal: Array<{ left: number; top: number; width: number; height: number; topLocal: number; latchY: number }> = [];
  let hoistStartViewport: Point2D | null = null;
  let hoistFadeTimer: number | null = null;

  // Three.js scene objects
  let webglReady = false;
  let renderer: WebGLRenderer | null = null;
  let scene: Scene | null = null;
  let camera: PerspectiveCamera | null = null;
  let envRT: { texture: Texture; dispose: () => void } | null = null;
  let lights: {
    ambient: AmbientLight;
    hemi: HemisphereLight;
    keyLight: DirectionalLight;
    fillLight: DirectionalLight;
    rimLight: DirectionalLight;
  } | null = null;
  let mats: {
    railFace: MeshStandardMaterial;
    armFace: MeshStandardMaterial;
    railAlu: MeshStandardMaterial;
    railSteel: MeshStandardMaterial;
    cableTrack: MeshStandardMaterial;
    saddleAlu: MeshStandardMaterial;
    runnerSteel: MeshStandardMaterial;
    wiperRubber: MeshStandardMaterial;
    boltSteel: MeshStandardMaterial;
    armTube: MeshStandardMaterial;
    armCollar: MeshStandardMaterial;
    jointHousing: MeshStandardMaterial;
    jointCap: MeshStandardMaterial;
    orange: MeshStandardMaterial;
    gripperBody: MeshStandardMaterial;
    gripperLink: MeshStandardMaterial;
    gripperPad: MeshStandardMaterial;
    clauxBadge: MeshStandardMaterial;
    toolLed: MeshStandardMaterial;
  } | null = null;

  let railGroup: Group | null = null;
  let leftEndStop: Group | null = null;
  let rightEndStop: Group | null = null;
  let carriageGroup: Group | null = null;
  let baseTurret: Group | null = null;
  let shoulderPivot: Group | null = null;
  let upperArmTube: Group | null = null;
  let elbowPivot: Group | null = null;
  let forearmTube: Group | null = null;
  let wrist1Pivot: Group | null = null;
  let wrist2Pivot: Group | null = null;
  let leftJaw: Group | null = null;
  let rightJaw: Group | null = null;
  let tipMarker: Object3D | null = null;

  const baseDropY = 50;
  const wristDropY = 22;
  const toolDropFromWrist1 = 70;
  let railY = 300;
  let L1 = 212;
  let L2 = 216;

  // Smooth weighted industrial UR cobot servo springs (slightly overdamped for silky, wobble-free inertia)
  const spCarriageX = new ServoSpring(-280, 8.2, 1.05, 0.6, 0.6);
  const spJ0 = new ServoSpring(0.08, 8.6, 1.05, 0.006, 0.008);
  const spJ1 = new ServoSpring(-0.75, 9.0, 1.05, 0.006, 0.008);
  const spJ2 = new ServoSpring(1.75, 9.2, 1.05, 0.006, 0.008);
  const spJ3 = new ServoSpring(-1.0, 9.8, 1.05, 0.006, 0.008);
  const spJ4 = new ServoSpring(-0.07, 8.8, 1.05, 0.006, 0.008);
  const spGrip = new ServoSpring(0.72, 12.0, 1.02, 0.008, 0.01);
  const spLed = new ServoSpring(0, 10.0, 1.0, 0.01, 0.01);

  const timer = new Timer();
  timer.connect(document);

  let loopRunning = false;
  let armActive = false;
  let lastFrameWallMs = 0;
  let pickSafetyTimer: number | null = null;
  let needsSingleRender = true;
  let suppressHoverUntil = 0;
  let suppressRestoredCardIdx = -1;
  let lastPointerPos: Point2D | null = null;
  let releasePointerOrigin: Point2D | null = null;
  let releaseWarmupFrame = false;
  const introTimers: number[] = [];

  const cBlue = new Color();
  const cOrange = new Color();
  const cMixed = new Color();
  const projVec = new Vector3();

  function stageToWorld(sx: number, sy: number): Point2D {
    return { x: sx - stageW / 2, y: stageH / 2 - sy };
  }

  function getIdleTipTarget(): Point2D {
    // Park gracefully on upper-left framing quadrant (compact folded pose, never overlapping Hero H1)
    const leftX = -Math.min(stageW * 0.275, 345);
    return { x: leftX, y: railY - 224 };
  }

  function getVisorClampWorld(): Point2D {
    // Align cleanly with top center gripper clamp of enlarged centered Inspection Visor
    const clampScreenY = Math.max(132, Math.min(188, stageH * 0.21));
    return stageToWorld(stageW / 2, clampScreenY);
  }

  function getBadgeRestScale(): number {
    return window.innerHeight <= 780 ? 0.76 : 0.84;
  }

  function getLiveBadgeAnchorViewport(): Point2D | null {
    if (!badgeAnchorDotEl) return null;
    const r = badgeAnchorDotEl.getBoundingClientRect();
    if (r.width === 0 && r.height === 0 && r.left === 0 && r.top === 0) return null;
    return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.5 };
  }

  // Punched stadium lanyard hole center inside 248x344 badge (SVG y=20.5/366 = 5.601%)
  const BADGE_HOLE_RATIO_Y = 20.5 / 366;
  const BADGE_HOLE_PX_Y = 344 * BADGE_HOLE_RATIO_Y;

  function viewportToStageWorld(vp: Point2D): Point2D {
    const sRect = stageEl.getBoundingClientRect();
    const sx = Math.min(stageW - 14, Math.max(40, vp.x - sRect.left));
    const sy = MathUtils.clamp(vp.y - sRect.top, 120, stageH - 160);
    return stageToWorld(sx, sy);
  }

  function getBadgeLugWorld(mode: 'hover' | 'docked'): Point2D {
    // Prefer exact live DOM center of the punched lanyard hole when the trigger is visible in place
    if (mode === 'hover' && badgeTriggerEl && !badgeTriggerEl.classList.contains('is-picked')) {
      const liveHole = getLiveBadgeAnchorViewport();
      if (liveHole) {
        return viewportToStageWorld(liveHole);
      }
    }
    // Fallback analytic center of punched lanyard hole on the tilted ceramic badge
    const anchorFromRight = mode === 'hover' ? 76 : 12;
    const lugSx = Math.min(stageW - 14, Math.max(stageW * 0.58, stageW - anchorFromRight));
    const topOffset = mode === 'hover' ? 88 : 68;
    const lugSy = MathUtils.clamp(badgeCenterLocalY - topOffset, 120, stageH - 180);
    return stageToWorld(lugSx, lugSy);
  }

  function getBadgeOpenLugWorld(): Point2D {
    // Native <dialog> is centered in the viewport (window.innerHeight / 2), not stageH / 2
    const sRect = stageEl.getBoundingClientRect();
    const badgeW = Math.min(318, Math.max(248, window.innerWidth - 32));
    const badgeH = badgeW * (366 / 264);
    const holeViewportX = window.innerWidth / 2;
    const holeViewportY = window.innerHeight / 2 - badgeH / 2 + badgeH * BADGE_HOLE_RATIO_Y;
    const lugSx = MathUtils.clamp(holeViewportX - sRect.left, 40, stageW - 40);
    const lugSy = MathUtils.clamp(holeViewportY - sRect.top, 118, stageH - 180);
    return stageToWorld(lugSx, lugSy);
  }

  function clearBadgeReleaseSuppression(): void {
    if (suppressBadgeRelease) {
      badgeTriggerEl?.removeAttribute('data-just-released');
      suppressBadgeRelease = false;
    }
    badgeReleasePointerOrigin = null;
  }

  function clearReleasedHighlightSuppression(): void {
    if (suppressRestoredCardIdx >= 0) {
      cardEls[suppressRestoredCardIdx]?.removeAttribute('data-just-released');
      suppressRestoredCardIdx = -1;
    }
    releasePointerOrigin = null;
  }

  function createIndustrialJoint(radius: number, length: number, capSide: number, includeOrangeTrim: boolean): Group {
    const g = new Group();
    if (!mats) return g;

    // Chamfered 8-sided industrial servo housing (matches CNC hardware geometry without rounded toy shine)
    const bodyGeo = new CylinderGeometry(radius, radius, length, 8);
    bodyGeo.rotateY(Math.PI / 8);
    bodyGeo.rotateX(Math.PI / 2);
    g.add(new Mesh(bodyGeo, mats.jointHousing));

    const capH = 4.2;
    const capGeo = new CylinderGeometry(radius * 0.88, radius * 0.94, capH, 8);
    capGeo.rotateY(Math.PI / 8);
    capGeo.rotateX(Math.PI / 2);
    const cap = new Mesh(capGeo, mats.jointCap);
    cap.position.z = capSide * (length / 2 + capH / 2 - 0.4);
    g.add(cap);

    // 4 square pixel bolts on flat face plate matching gantry bolts
    const boltGeo = new BoxGeometry(2.8, 2.8, 2.0);
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      const b = new Mesh(boltGeo, mats.boltSteel);
      b.position.set(
        Math.cos(a) * radius * 0.62,
        Math.sin(a) * radius * 0.62,
        capSide * (length / 2 + capH - 0.1),
      );
      g.add(b);
    }

    if (includeOrangeTrim) {
      const trimGeo = new CylinderGeometry(radius * 1.03, radius * 1.03, 3.0, 8);
      trimGeo.rotateY(Math.PI / 8);
      trimGeo.rotateX(Math.PI / 2);
      const trim = new Mesh(trimGeo, mats.orange);
      trim.position.z = capSide * (length / 2 - 1.2);
      g.add(trim);
    }

    return g;
  }

  function createCNCBeam(width: number, depth: number): Group {
    const g = new Group();
    if (!mats) return g;

    const beamGeo = new BoxGeometry(width, 1, depth);
    const main = new Mesh(beamGeo, [
      mats.armTube,
      mats.armTube,
      mats.armTube,
      mats.armTube,
      mats.armFace,
      mats.armTube,
    ]);
    main.position.set(0, -0.5, 0);
    g.add(main);

    // Crisp outer steel guide lips echoing the overhead gantry rails
    const railGeo = new BoxGeometry(2.5, 1, depth + 1.4);
    const leftRail = new Mesh(railGeo, mats.railSteel);
    leftRail.position.set(-width / 2 + 1.0, -0.5, 0);
    const rightRail = new Mesh(railGeo, mats.railSteel);
    rightRail.position.set(width / 2 - 1.0, -0.5, 0);
    g.add(leftRail, rightRail);

    return g;
  }

  function initThreeScene(): {
    renderer: WebGLRenderer;
    scene: Scene;
    camera: PerspectiveCamera;
  } | null {
    if (!canvas) return null;
    try {
      renderer = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return null;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;

    scene = new Scene();
    camera = new PerspectiveCamera(24, 16 / 9, 10, 8000);

    // Subtle procedural Studio IBL for clean matte edge contrast without glossy clearcoat shine
    const pmrem = new PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    envRT = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    roomEnv.dispose();
    pmrem.dispose();

    const p = PALETTE_3D[currentTheme];
    scene.environmentIntensity = p.envInt;

    const ambient = new AmbientLight(0xffffff, p.ambientInt);
    const hemi = new HemisphereLight(p.hemiSky, p.hemiGround, p.hemiInt);
    const keyLight = new DirectionalLight(0xfffdf8, p.keyInt);
    keyLight.position.set(-460, 720, 980);
    const fillLight = new DirectionalLight(0xe8f1fa, p.fillInt);
    fillLight.position.set(560, -160, 680);
    const rimLight = new DirectionalLight(0xffebd2, 0.24);
    rimLight.position.set(0, 380, -480);
    scene.add(ambient, hemi, keyLight, fillLight, rimLight);
    lights = { ambient, hemi, keyLight, fillLight, rimLight };

    const isDark = currentTheme === 'dark';
    mats = {
      railFace: new MeshStandardMaterial({ map: createGantryTexture(isDark), roughness: 0.56, metalness: 0.22 }),
      armFace: new MeshStandardMaterial({ map: createArmBeamTexture(isDark), roughness: 0.62, metalness: 0.18 }),
      railAlu: new MeshStandardMaterial({ color: p.railAlu, roughness: 0.56, metalness: 0.24 }),
      railSteel: new MeshStandardMaterial({ color: p.railSteel, roughness: 0.44, metalness: 0.48 }),
      cableTrack: new MeshStandardMaterial({ color: p.cableTrack, roughness: 0.72, metalness: 0.12 }),
      saddleAlu: new MeshStandardMaterial({ color: p.saddleAlu, roughness: 0.56, metalness: 0.24 }),
      runnerSteel: new MeshStandardMaterial({ color: p.runnerSteel, roughness: 0.48, metalness: 0.42 }),
      wiperRubber: new MeshStandardMaterial({ color: p.wiperRubber, roughness: 0.82, metalness: 0.05 }),
      boltSteel: new MeshStandardMaterial({ color: p.boltSteel, roughness: 0.42, metalness: 0.52 }),
      armTube: new MeshStandardMaterial({ color: p.armTube, roughness: 0.64, metalness: 0.18 }),
      armCollar: new MeshStandardMaterial({ color: p.armCollar, roughness: 0.62, metalness: 0.24 }),
      jointHousing: new MeshStandardMaterial({ color: p.jointHousing, roughness: 0.68, metalness: 0.18 }),
      jointCap: new MeshStandardMaterial({ color: p.jointCap, roughness: 0.76, metalness: 0.14 }),
      orange: new MeshStandardMaterial({ color: p.orange, roughness: 0.56, metalness: 0.10 }),
      gripperBody: new MeshStandardMaterial({ color: p.gripperBody, roughness: 0.72, metalness: 0.18 }),
      gripperLink: new MeshStandardMaterial({ color: p.gripperLink, roughness: 0.50, metalness: 0.36 }),
      gripperPad: new MeshStandardMaterial({ color: p.gripperPad, roughness: 0.84, metalness: 0.06 }),
      clauxBadge: new MeshStandardMaterial({
        map: createCarriageLogoTexture(isDark),
        roughness: 0.48,
        metalness: 0.16,
      }),
      toolLed: new MeshStandardMaterial({
        color: p.blueLed,
        emissive: new Color(p.blueLed),
        emissiveIntensity: 1.35,
        roughness: 0.3,
      }),
    };

    // 1. Sleeker 7th-Axis CNC Linear Gantry Rail
    railGroup = new Group();
    const beam = new Mesh(new BoxGeometry(3800, 24, 22), [
      mats.railAlu,
      mats.railAlu,
      mats.railAlu,
      mats.railAlu,
      mats.railFace,
      mats.railAlu,
    ]);
    beam.position.set(0, 0, -18);
    railGroup.add(beam);

    const lipGeo = new BoxGeometry(3800, 3, 26);
    const topLip = new Mesh(lipGeo, mats.railAlu);
    topLip.position.set(0, 12, -16);
    const botLip = new Mesh(lipGeo, mats.railAlu);
    botLip.position.set(0, -12, -16);
    railGroup.add(topLip, botLip);

    const guideGeo = new BoxGeometry(3800, 4.6, 10);
    const upperGuide = new Mesh(guideGeo, mats.railSteel);
    upperGuide.position.set(0, 9, -2.5);
    const lowerGuide = new Mesh(guideGeo, mats.railSteel);
    lowerGuide.position.set(0, -9, -2.5);
    railGroup.add(upperGuide, lowerGuide);

    const cableTray = new Mesh(new BoxGeometry(3800, 4.2, 12), mats.cableTrack);
    cableTray.position.set(0, 15.8, -21);
    railGroup.add(cableTray);

    const boltCount = 56;
    const boltGeo = new BoxGeometry(3.6, 3.6, 3.8);
    const bolts = new InstancedMesh(boltGeo, mats.boltSteel, boltCount);
    const dummy = new Object3D();
    for (let i = 0; i < boltCount; i++) {
      dummy.position.set((i - boltCount / 2) * 64, 0, -5.5);
      dummy.updateMatrix();
      bolts.setMatrixAt(i, dummy.matrix);
    }
    bolts.instanceMatrix.needsUpdate = true;
    railGroup.add(bolts);

    const makeEndStop = (padX: number) => {
      const eg = new Group();
      const block = new Mesh(new BoxGeometry(14, 28, 26), mats!.runnerSteel);
      const pad = new Mesh(new BoxGeometry(4.5, 20, 20), mats!.orange);
      pad.position.x = padX;
      eg.add(block, pad);
      return eg;
    };
    leftEndStop = makeEndStop(7.5);
    rightEndStop = makeEndStop(-7.5);
    railGroup.add(leftEndStop, rightEndStop);
    scene.add(railGroup);

    // 2. Slimmer Precision CNC Carriage (Site C-dot emblem) + 6-DOF Unbranded UR Cobot
    carriageGroup = new Group();
    const saddlePlate = new Mesh(new RoundedBoxGeometry(86, 32, 15, 3, 2.5), mats.saddleAlu);
    saddlePlate.position.set(0, 0, 7);
    carriageGroup.add(saddlePlate);

    const pocket = new Mesh(new RoundedBoxGeometry(25, 25, 4, 2, 1.5), mats.armCollar);
    pocket.position.set(0, 0, 13.7);
    carriageGroup.add(pocket);

    const badgePlate = new Mesh(new PlaneGeometry(22, 22), mats.clauxBadge);
    badgePlate.position.set(0, 0, 15.85);
    carriageGroup.add(badgePlate);

    const runnerGeo = new RoundedBoxGeometry(20, 9.5, 16, 2, 1.8);
    const wiperGeo = new BoxGeometry(2.8, 8.8, 15);
    [
      [-28, 9.5],
      [28, 9.5],
      [-28, -9.5],
      [28, -9.5],
    ].forEach(([rx, ry]) => {
      const runner = new Mesh(runnerGeo, mats!.runnerSteel);
      runner.position.set(rx, ry, -2);
      carriageGroup!.add(runner);
      const wiper = new Mesh(wiperGeo, mats!.wiperRubber);
      wiper.position.set(rx + (rx < 0 ? -10.8 : 10.8), ry, -2);
      carriageGroup!.add(wiper);
    });

    const sBoltGeo = new BoxGeometry(3.6, 3.6, 2.8);
    [
      [-33, 9.5],
      [33, 9.5],
      [-33, -9.5],
      [33, -9.5],
    ].forEach(([bx, by]) => {
      const b = new Mesh(sBoltGeo, mats!.boltSteel);
      b.position.set(bx, by, 14.9);
      carriageGroup!.add(b);
    });

    const undersideBlock = new Mesh(new RoundedBoxGeometry(58, 10, 30, 2, 2), mats.runnerSteel);
    undersideBlock.position.set(0, -19.5, 2);
    carriageGroup.add(undersideBlock);

    const flangeGeo = new CylinderGeometry(21, 21, 6.5, 8);
    flangeGeo.rotateY(Math.PI / 8);
    const baseFlange = new Mesh(flangeGeo, mats.saddleAlu);
    baseFlange.position.set(0, -27, 0);
    carriageGroup.add(baseFlange);

    baseTurret = new Group();
    baseTurret.position.set(0, -29, 0);
    carriageGroup.add(baseTurret);

    const turretGeo = new CylinderGeometry(18, 19, 17, 8);
    turretGeo.rotateY(Math.PI / 8);
    const baseCyl = new Mesh(turretGeo, mats.jointHousing);
    baseCyl.position.set(0, -9, 0);
    baseTurret.add(baseCyl);

    const bandGeo = new CylinderGeometry(19.2, 19.2, 2.8, 8);
    bandGeo.rotateY(Math.PI / 8);
    const baseRing = new Mesh(bandGeo, mats.orange);
    baseRing.position.set(0, -3, 0);
    baseTurret.add(baseRing);

    shoulderPivot = new Group();
    shoulderPivot.position.set(0, -21, 0);
    baseTurret.add(shoulderPivot);

    const shoulderHub = createIndustrialJoint(18, 21, -1, true);
    shoulderHub.position.set(0, 0, 5);
    shoulderPivot.add(shoulderHub);

    upperArmTube = createCNCBeam(18.5, 13.5);
    upperArmTube.position.set(0, 0, 12);
    shoulderPivot.add(upperArmTube);

    elbowPivot = new Group();
    elbowPivot.position.set(0, -L1, 0);
    shoulderPivot.add(elbowPivot);

    const elbowHub = createIndustrialJoint(15.5, 20, 1, true);
    elbowHub.position.set(0, 0, 7.5);
    elbowPivot.add(elbowHub);

    forearmTube = createCNCBeam(15.5, 11.5);
    forearmTube.position.set(0, 0, 2);
    elbowPivot.add(forearmTube);

    wrist1Pivot = new Group();
    wrist1Pivot.position.set(0, -L2, 0);
    elbowPivot.add(wrist1Pivot);

    const wrist1Hub = createIndustrialJoint(12, 16, 1, false);
    wrist1Hub.position.set(0, 0, 2);
    wrist1Pivot.add(wrist1Hub);

    const wristNeck = new Mesh(new BoxGeometry(15, 13, 13), mats.jointHousing);
    wristNeck.position.set(0, -10.5, 0);
    wrist1Pivot.add(wristNeck);

    wrist2Pivot = new Group();
    wrist2Pivot.position.set(0, -wristDropY, 0);
    wrist1Pivot.add(wrist2Pivot);

    const wrist2Body = new Mesh(new BoxGeometry(22, 9.5, 15), mats.jointHousing);
    wrist2Body.position.set(0, -4.5, 0);
    wrist2Pivot.add(wrist2Body);

    const toolLedBar = new Mesh(new BoxGeometry(22.8, 2.2, 15.8), mats.toolLed);
    toolLedBar.position.set(0, -10.4, 0);
    wrist2Pivot.add(toolLedBar);

    const toolFlange = new Mesh(new BoxGeometry(25, 3.6, 17), mats.armCollar);
    toolFlange.position.set(0, -13.4, 0);
    wrist2Pivot.add(toolFlange);

    // Parallel Adaptive Gripper
    const lockRing = new Mesh(new BoxGeometry(26, 2.6, 17.2), mats.orange);
    lockRing.position.set(0, -16.6, 0);
    wrist2Pivot.add(lockRing);

    const actuatorBody = new Mesh(new RoundedBoxGeometry(40, 15, 17, 2, 2), mats.gripperBody);
    actuatorBody.position.set(0, -25, 0);
    wrist2Pivot.add(actuatorBody);

    const guideRail = new Mesh(new BoxGeometry(34, 3.6, 18), mats.gripperLink);
    guideRail.position.set(0, -29.8, 0);
    wrist2Pivot.add(guideRail);

    // 3 discrete square pixel LED emitters across the gripper actuator front face
    const ledPixelGeo = new BoxGeometry(3.2, 3.2, 1.8);
    [-6, 0, 6].forEach((lx) => {
      const ledPx = new Mesh(ledPixelGeo, mats!.toolLed);
      ledPx.position.set(lx, -22.5, 8.4);
      wrist2Pivot!.add(ledPx);
    });

    const makeJaw = (side: number) => {
      const jg = new Group();
      const slider = new Mesh(new RoundedBoxGeometry(8, 5.8, 14.2, 2, 1.0), mats!.armCollar);
      slider.position.set(0, -32.8, 0);
      const finger = new Mesh(new RoundedBoxGeometry(6.4, 16.5, 12.2, 2, 1.0), mats!.gripperBody);
      finger.position.set(0, -42.5, 0);
      const pad = new Mesh(new RoundedBoxGeometry(2.6, 12.8, 10.2, 2, 0.8), mats!.gripperPad);
      pad.position.set(-side * 3.5, -44, 0);
      const tipTrim = new Mesh(new BoxGeometry(6.6, 2.1, 12.4), mats!.orange);
      tipTrim.position.set(0, -50.2, 0);
      jg.add(slider, finger, pad, tipTrim);
      return jg;
    };
    leftJaw = makeJaw(-1);
    rightJaw = makeJaw(1);

    tipMarker = new Object3D();
    tipMarker.position.set(0, -46, 0);
    wrist2Pivot.add(leftJaw, rightJaw, tipMarker);
    scene.add(carriageGroup);

    webglReady = true;
    return { renderer, scene, camera };
  }

  function applyThreeTheme(themeName: 'light' | 'dark'): void {
    currentTheme = themeName;
    if (!webglReady || !mats || !lights || !scene) return;
    const p = PALETTE_3D[themeName];
    const isDark = themeName === 'dark';

    if (mats.railFace.map) mats.railFace.map.dispose();
    mats.railFace.map = createGantryTexture(isDark);
    mats.railFace.needsUpdate = true;

    if (mats.armFace.map) mats.armFace.map.dispose();
    mats.armFace.map = createArmBeamTexture(isDark);
    mats.armFace.needsUpdate = true;

    mats.railAlu.color.setHex(p.railAlu);
    mats.railSteel.color.setHex(p.railSteel);
    mats.cableTrack.color.setHex(p.cableTrack);
    mats.saddleAlu.color.setHex(p.saddleAlu);
    mats.runnerSteel.color.setHex(p.runnerSteel);
    mats.wiperRubber.color.setHex(p.wiperRubber);
    mats.boltSteel.color.setHex(p.boltSteel);
    mats.armTube.color.setHex(p.armTube);
    mats.armCollar.color.setHex(p.armCollar);
    mats.jointHousing.color.setHex(p.jointHousing);
    mats.jointCap.color.setHex(p.jointCap);
    mats.orange.color.setHex(p.orange);
    mats.gripperBody.color.setHex(p.gripperBody);
    mats.gripperLink.color.setHex(p.gripperLink);
    mats.gripperPad.color.setHex(p.gripperPad);

    if (mats.clauxBadge.map) mats.clauxBadge.map.dispose();
    mats.clauxBadge.map = createCarriageLogoTexture(isDark);
    mats.clauxBadge.needsUpdate = true;

    lights.ambient.intensity = p.ambientInt;
    lights.hemi.color.setHex(p.hemiSky);
    lights.hemi.groundColor.setHex(p.hemiGround);
    lights.hemi.intensity = p.hemiInt;
    lights.keyLight.intensity = p.keyInt;
    lights.fillLight.intensity = p.fillInt;
    scene.environmentIntensity = p.envInt;

    needsSingleRender = true;
    wakeLoop();
  }

  function computeDirectionalIK(tipX: number, tipY: number, wristTilt = 0) {
    const elbowSide = -1; // Always left-elbow for clean wobble-free UR geometry
    const shoulderY = railY - baseDropY;
    const j0 = 0.08;
    const j4 = -0.07;
    const cosJ0 = Math.max(0.86, Math.cos(j0));

    // Account for optional positive wristTilt (angles gripper rightward to pull right-edge badge FROM THE LEFT)
    const wristTargetX = tipX - toolDropFromWrist1 * Math.sin(wristTilt) * cosJ0;
    const wy = tipY + toolDropFromWrist1 * Math.cos(wristTilt);

    // Preserve left-margin clearance so elbow drum never clips off left canvas border
    const maxRailX = stageW / 2 - 92;
    const minRailX = -stageW / 2 + Math.max(135, L1 * 0.68);
    const carriageLead = wristTilt > 0.1 ? 38 : 20;
    const carriageX = MathUtils.clamp(wristTargetX - carriageLead, minRailX, maxRailX);

    const dx = (wristTargetX - carriageX) / cosJ0;
    const downY = Math.max(32, shoulderY - wy);

    const minR = Math.abs(L1 - L2) + 28;
    const maxR = L1 + L2 - 4;
    const r = MathUtils.clamp(Math.hypot(dx, downY), minR, maxR);

    const alpha = Math.atan2(dx, downY);
    const cosBeta = MathUtils.clamp((L1 * L1 + r * r - L2 * L2) / (2 * L1 * r), -1, 1);
    const beta = Math.acos(cosBeta);
    const cosGamma = MathUtils.clamp((L1 * L1 + L2 * L2 - r * r) / (2 * L1 * L2), -1, 1);
    const gamma = Math.acos(cosGamma);

    const j1 = alpha + elbowSide * beta;
    const j2 = -elbowSide * (Math.PI - gamma);
    const j3 = -(j1 + j2) + wristTilt;

    return { carriageX, j0, j1, j2, j3, j4 };
  }

  function computeCurrentTipFK(): Point2D {
    const sx = spCarriageX.x;
    const sy = railY - baseDropY;
    const j0 = spJ0.x;
    const j1 = spJ1.x;
    const j2 = spJ2.x;
    const actualWristTilt = j1 + j2 + spJ3.x;
    const localX =
      L1 * Math.sin(j1) +
      L2 * Math.sin(j1 + j2) +
      toolDropFromWrist1 * Math.sin(actualWristTilt);
    const localDownY =
      L1 * Math.cos(j1) +
      L2 * Math.cos(j1 + j2) +
      toolDropFromWrist1 * Math.cos(actualWristTilt);
    return {
      x: sx + localX * Math.cos(j0),
      y: sy - localDownY,
    };
  }

  function getProjectedTipViewport(): Point2D {
    if (!scene || !camera || !tipMarker || !canvas) {
      return { x: window.innerWidth / 2, y: 220 };
    }
    scene.updateMatrixWorld(true);
    tipMarker.getWorldPosition(projVec);
    projVec.project(camera);
    const cRect = canvas.getBoundingClientRect();
    return {
      x: cRect.left + (projVec.x * 0.5 + 0.5) * cRect.width,
      y: cRect.top + (-projVec.y * 0.5 + 0.5) * cRect.height,
    };
  }

  function measureStage(snapInitial = false): void {
    const sRect = stageEl.getBoundingClientRect();
    stageW = Math.max(768, Math.round(sRect.width));
    stageH = Math.max(520, Math.round(sRect.height));

    if (badgeTriggerEl) {
      const resolvedTop = parseFloat(window.getComputedStyle(badgeTriggerEl).top);
      if (Number.isFinite(resolvedTop) && resolvedTop > 0) {
        badgeCenterLocalY = resolvedTop;
      } else {
        badgeCenterLocalY = stageH * 0.43;
      }
    }

    cardAnchorsWorld = [];
    cardRectsLocal = [];
    // Measure resting card geometry cleanly (using a non-hovered sibling's top if one card is mid-hover)
    const rawRects = cardEls.map((el) => ({
      el,
      r: el.getBoundingClientRect(),
      rested:
        !el.classList.contains('is-hovered') &&
        !el.classList.contains('is-grabbing') &&
        !el.classList.contains('is-picked') &&
        !el.matches(':hover'),
    }));
    const baselineTop = rawRects.find((item) => item.rested)?.r.top ?? rawRects[0]?.r.top ?? sRect.bottom - 220;

    rawRects.forEach(({ el, r, rested }) => {
      const restTop = rested ? r.top : baselineTop;
      const leftLocal = r.left - sRect.left;
      const topLocal = restTop - sRect.top;
      const cx = leftLocal + r.width / 2;
      // Target the recessed robot latch machined dead-center in the S1 top roof thickness
      const roofEl = el.querySelector<HTMLElement>('.tile-roof');
      const roofH = roofEl ? roofEl.getBoundingClientRect().height : 19;
      const latchY = Math.max(6, roofH * 0.5);
      cardAnchorsWorld.push(stageToWorld(cx, topLocal + latchY));
      cardRectsLocal.push({
        left: leftLocal,
        top: topLocal,
        width: r.width,
        height: r.height,
        topLocal: topLocal + latchY,
        latchY,
      });
    });

    if (webglReady && renderer && camera && railGroup && leftEndStop && rightEndStop) {
      renderer.setSize(stageW, stageH, false);
      camera.aspect = stageW / stageH;
      camera.updateProjectionMatrix();

      const halfFovRad = MathUtils.degToRad(camera.fov / 2);
      const camZ = stageH / 2 / Math.tan(halfFovRad);
      camera.position.set(0, 0, camZ);
      camera.lookAt(0, 0, 0);

      // Mount slimmer CNC gantry rail cleanly near top edge of hero stage right below header
      railY = stageH / 2 - 17;
      railGroup.position.set(0, railY, 0);

      const stopOffset = stageW / 2 - 20;
      leftEndStop.position.set(-stopOffset, 0, -4);
      rightEndStop.position.set(stopOffset, 0, -4);

      const sampleTopLocal = cardRectsLocal[0]?.topLocal ?? stageH - 220;
      const shoulderLocalY = 17 + baseDropY;
      // Extend arm links proportionally to compensate for the higher, slimmer gantry rail (+6px jaw reach margin)
      const neededReach = Math.max(230, sampleTopLocal - shoulderLocalY - toolDropFromWrist1 + 6);
      const totalReach = Math.max(neededReach, Math.min(416, stageH * 0.48));

      L1 = totalReach * 0.495;
      L2 = totalReach * 0.505;

      upperArmTube?.scale.set(1, L1, 1);
      elbowPivot?.position.set(0, -L1, 0);
      forearmTube?.scale.set(1, L2, 1);
      wrist1Pivot?.position.set(0, -L2, 0);

      if (snapInitial) {
        const idle = getIdleTipTarget();
        const pose = computeDirectionalIK(idle.x, idle.y);
        spCarriageX.reset(pose.carriageX);
        spJ0.reset(pose.j0);
        spJ1.reset(pose.j1);
        spJ2.reset(pose.j2);
        spJ3.reset(pose.j3);
        spJ4.reset(pose.j4);
        spGrip.reset(0.72);
        spLed.reset(0);
        applyArmTransforms(0.72, 0);
      }
      needsSingleRender = true;
    }
  }

  function applyArmTransforms(grip: number, ledMix: number): void {
    if (!webglReady || !carriageGroup || !baseTurret || !shoulderPivot || !elbowPivot || !wrist1Pivot || !wrist2Pivot || !leftJaw || !rightJaw || !mats) {
      return;
    }

    carriageGroup.position.set(spCarriageX.x, railY, 0);
    baseTurret.rotation.y = spJ0.x;
    shoulderPivot.rotation.z = spJ1.x;
    elbowPivot.rotation.z = spJ2.x;
    wrist1Pivot.rotation.z = spJ3.x;
    wrist2Pivot.rotation.y = spJ4.x;

    const clampedGrip = MathUtils.clamp(grip, 0, 1);
    const halfSpan = 8.6 + clampedGrip * 11.2;
    leftJaw.position.x = -halfSpan;
    rightJaw.position.x = halfSpan;

    const p3d = PALETTE_3D[currentTheme];
    cBlue.setHex(p3d.blueLed);
    cOrange.setHex(p3d.orangeLed);
    cMixed.copy(cBlue).lerp(cOrange, MathUtils.clamp(ledMix, 0, 1));
    mats.toolLed.color.copy(cMixed);
    mats.toolLed.emissive.copy(cMixed);
  }

  function clearHoistFadeTimer(): void {
    if (hoistFadeTimer !== null) {
      window.clearTimeout(hoistFadeTimer);
      hoistFadeTimer = null;
    }
  }

  function getRestingSlotViewport(idx: number): Point2D {
    const sRect = stageEl.getBoundingClientRect();
    const meta = cardRectsLocal[idx];
    if (meta) {
      return { x: sRect.left + meta.left, y: sRect.top + meta.top };
    }
    const el = cardEls[idx];
    if (el) {
      const r = el.getBoundingClientRect();
      return { x: r.left, y: r.top };
    }
    return { x: window.innerWidth / 2 - hoistWidth / 2, y: window.innerHeight - hoistHeight - 24 };
  }

  function attachHoistCard(idx: number, fadeIn = false): void {
    clearHoistFadeTimer();
    const src = cardEls[idx];
    if (!src || !hoistCard) return;
    const meta = cardRectsLocal[idx];
    hoistWidth = meta?.width ?? 210;
    hoistHeight = meta?.height ?? 200;

    // Capture exact live card coordinates before swapping to recessed slot so lift-off has ZERO 1px jump
    const liveRect = src.getBoundingClientRect();
    hoistStartViewport = fadeIn
      ? getRestingSlotViewport(idx)
      : { x: liveRect.left, y: liveRect.top };

    hoistCard.innerHTML = src.innerHTML;
    hoistCard.style.width = `${hoistWidth}px`;
    hoistCard.style.height = `${hoistHeight}px`;
    hoistCard.classList.remove('is-settling', 'is-docking');
    hoistCard.classList.add('active');
    hoistCard.style.opacity = '1';

    cardEls.forEach((el, i) => {
      el.classList.remove('is-grabbing');
      el.classList.toggle('is-picked', i === idx);
    });
  }

  function detachHoistCard(immediate = false): void {
    clearHoistFadeTimer();
    if (!hoistCard) return;
    if (immediate || !hoistCard.classList.contains('active')) {
      hoistCard.classList.remove('active', 'is-settling', 'is-docking');
      hoistCard.style.opacity = '0';
      return;
    }
    // Crossfade out cleanly over the seated bay or opening Visor (zero hard visual clip)
    hoistCard.classList.add('is-settling');
    hoistCard.style.opacity = '0';
    hoistFadeTimer = window.setTimeout(() => {
      hoistFadeTimer = null;
      hoistCard.classList.remove('active', 'is-settling', 'is-docking');
    }, 150);
  }

  function syncHoistCardToGripper(progress: number, isClosing: boolean): void {
    if (!hoistCard || !hoistCard.classList.contains('active')) return;
    const tip = getProjectedTipViewport();
    const liftRatio = isClosing ? 1 - progress : progress;
    const scale = 1 + liftRatio * 0.14;
    const latchY = cardRectsLocal[activeIdx]?.latchY ?? 9.5;

    const gripX = tip.x - hoistWidth / 2;
    const gripY = tip.y - latchY;
    const slotOrigin = isClosing
      ? getRestingSlotViewport(activeIdx)
      : (hoistStartViewport ?? getRestingSlotViewport(activeIdx));

    // Seamlessly pin endpoints (liftRatio -> 0) directly to exact pixel coordinates of the dock bay,
    // staying rigidly locked 1:1 to the 3D gripper jaws until final seating (zero drift ahead of arm!)
    const blendZone = isClosing ? 0.18 : 0.32;
    const rawBlend = MathUtils.clamp(liftRatio / blendZone, 0, 1);
    const gripBlend = rawBlend * rawBlend * (3 - 2 * rawBlend);
    const x = MathUtils.lerp(slotOrigin.x, gripX, gripBlend);
    const y = MathUtils.lerp(slotOrigin.y, gripY, gripBlend);

    // Soften hoist border highlight as it docks flush back into the bay
    hoistCard.classList.toggle('is-docking', isClosing && liftRatio < 0.18);
    hoistCard.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
  }

  function clearBadgeProxyFadeTimer(): void {
    if (badgeProxyFadeTimer !== null) {
      window.clearTimeout(badgeProxyFadeTimer);
      badgeProxyFadeTimer = null;
    }
  }

  function attachBadgeProxy(isReturning = false): void {
    clearBadgeProxyFadeTimer();
    if (!badgeProxyEl) return;

    // Capture the EXACT browser-computed viewport position of the top lanyard anchor:
    // - On pickup (isReturning = false): live hovered anchor BEFORE adding .is-picked
    // - On return (isReturning = true): real docked resting anchor (trigger is already in rest transform with opacity: 0!)
    const liveAnchor = getLiveBadgeAnchorViewport();
    if (liveAnchor) {
      badgeAnchorOriginViewport = liveAnchor;
    } else {
      const sRect = stageEl.getBoundingClientRect();
      const fallbackX = sRect.left + stageW - (isReturning ? 12 : 80);
      const fallbackY = sRect.top + badgeCenterLocalY - (isReturning ? 82 : 104);
      badgeAnchorOriginViewport = { x: fallbackX, y: fallbackY };
    }

    badgeReturnDockWorld = isReturning ? viewportToStageWorld(badgeAnchorOriginViewport) : null;

    badgeProxyEl.classList.remove('is-docking');
    badgeProxyEl.classList.add('active');
    badgeProxyEl.style.opacity = '1';

    badgeTriggerEl?.classList.remove('is-grabbing', 'is-hovered');
    badgeTriggerEl?.classList.add('is-picked');
  }

  function detachBadgeProxy(immediate = false): void {
    clearBadgeProxyFadeTimer();
    if (!badgeProxyEl) return;
    if (immediate || !badgeProxyEl.classList.contains('active')) {
      badgeProxyEl.classList.remove('active', 'is-docking');
      badgeProxyEl.style.opacity = '0';
      return;
    }
    badgeProxyEl.style.opacity = '0';
    badgeProxyFadeTimer = window.setTimeout(() => {
      badgeProxyFadeTimer = null;
      badgeProxyEl.classList.remove('active', 'is-docking');
    }, 120);
  }

  function syncBadgeProxyToGripper(progress: number, isReturning: boolean): void {
    if (!badgeProxyEl || !badgeProxyEl.classList.contains('active')) return;
    const tip = getProjectedTipViewport();
    // pullRatio: 0 = right-edge badge pose (hover on pickup / docked rest on return), 1 = centered modal pose
    const pullRatio = MathUtils.clamp(isReturning ? 1 - progress : progress, 0, 1);

    // Punched lanyard hole sits at (124px, BADGE_HOLE_PX_Y) inside the 248x344 proxy (transform-origin: 50% 5.6%)
    const gripX = tip.x - 124;
    const gripY = tip.y - BADGE_HOLE_PX_Y;

    const targetW = Math.min(318, Math.max(248, stageW - 32));
    const openScale = targetW / 248;
    const edgeScale = isReturning ? getBadgeRestScale() : 0.92;
    const edgeRotY = isReturning ? -17 : -10;
    const edgeRotZ = isReturning ? -24 : -20;

    const scale = MathUtils.lerp(edgeScale, openScale, pullRatio);
    const rotY = MathUtils.lerp(edgeRotY, 0, pullRatio);
    // Gentle hanging-lanyard pendulum lag that vanishes strictly to 0 at BOTH endpoints (pullRatio=0 and pullRatio=1)
    const pendulumZ = Math.sin(pullRatio * Math.PI) * (isReturning ? -3.2 : 4.0);
    const rotZ = MathUtils.lerp(edgeRotZ, 0, pullRatio) + pendulumZ;

    // Anchor destination/origin at pullRatio=0 is ALWAYS the exact right-edge punched lanyard hole (NEVER center!)
    const edgeAnchor = badgeAnchorOriginViewport ?? { x: tip.x, y: tip.y };
    const edgeX = edgeAnchor.x - 124;
    const edgeY = edgeAnchor.y - BADGE_HOLE_PX_Y;

    const blendZone = isReturning ? 0.24 : 0.22;
    const rawBlend = MathUtils.clamp(pullRatio / blendZone, 0, 1);
    const gripBlend = rawBlend * rawBlend * (3 - 2 * rawBlend);

    const x = MathUtils.lerp(edgeX, gripX, gripBlend);
    const y = MathUtils.lerp(edgeY, gripY, gripBlend);

    badgeProxyEl.classList.toggle('is-docking', isReturning && pullRatio < 0.22);
    badgeProxyEl.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) perspective(920px) rotateY(${rotY.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
  }

  function clearPickSafetyTimer(): void {
    if (pickSafetyTimer !== null) {
      window.clearTimeout(pickSafetyTimer);
      pickSafetyTimer = null;
    }
  }

  function completeBadgeLock(): void {
    clearPickSafetyTimer();
    document.body.classList.remove('arm-hoisting');
    badgeTriggerEl?.classList.remove('is-grabbing', 'is-hovered');
    badgeTriggerEl?.classList.add('is-picked');
    armPhase = 'BADGE_LOCKED';
    phaseTime = 0;
    armActive = true;
    needsSingleRender = true;
    if (onBadgeLockCb) {
      const cb = onBadgeLockCb;
      onBadgeLockCb = null;
      cb();
    }
    // Hide proxy immediately right after <dialog> enters top layer (zero double-badge ghost!)
    detachBadgeProxy(true);
    wakeLoop();
  }

  function completePickLock(): void {
    clearPickSafetyTimer();
    const lockedIdx = activeIdx;
    // Soft crossfade out as the enlarged Visor fades in over top
    detachHoistCard(false);
    document.body.classList.remove('arm-hoisting');
    if (lockedIdx >= 0) {
      cardEls.forEach((el, i) => {
        el.classList.remove('is-grabbing');
        el.classList.toggle('is-picked', i === lockedIdx);
      });
    }
    armPhase = 'LOCKED';
    phaseTime = 0;
    armActive = true;
    needsSingleRender = true;
    if (onLockCb && lockedIdx >= 0) {
      const cb = onLockCb;
      onLockCb = null;
      cb(lockedIdx);
    }
    wakeLoop();
  }

  function onFrame(timestamp: number): void {
    if (!tabVisible) {
      stopLoop();
      return;
    }

    timer.update(timestamp);
    // Strict 0.05s clamp for spring/drone stability; cap phaseTime steps so modal-close repaints NEVER skip phases
    const dt = Math.min(Math.max(timer.getDelta(), 0.001), 0.05);
    const nowMs = performance.now();
    const wallDt =
      lastFrameWallMs > 0 ? Math.min(Math.max((nowMs - lastFrameWallMs) / 1000, 0.001), 0.12) : 0.016;
    lastFrameWallMs = nowMs;

    if (
      webglReady &&
      renderer &&
      scene &&
      camera &&
      (heroInView || needsSingleRender) &&
      (armActive || needsSingleRender)
    ) {
      if (!userPaused || needsSingleRender) {
        const isReleaseMotion =
          armPhase === 'PLACING' ||
          armPhase === 'RELEASING' ||
          armPhase === 'RETURNING' ||
          armPhase === 'BADGE_RETURNING';
        const releaseDt = releaseWarmupFrame ? 0.016 : Math.min(dt, 0.05);
        if (releaseWarmupFrame) releaseWarmupFrame = false;
        const phaseStepDt = isReleaseMotion ? releaseDt : wallDt;
        phaseTime += userPaused ? 0 : phaseStepDt;

        const idleTarget = getIdleTipTarget();
        let goalTipX = idleTarget.x;
        let goalTipY = idleTarget.y;
        let goalWristTilt = 0;
        let goalGrip = 0.72;
        let goalLed = 0;
        let hoistSyncMode: 'up' | 'down' | null = null;
        let hoistSyncProgress = 0;
        let badgeSyncMode: 'pull' | 'return' | null = null;
        let badgeSyncProgress = 0;

        if (armPhase === 'IDLE') {
          goalTipX = idleTarget.x;
          goalTipY = idleTarget.y;
          goalGrip = 0.70;
        } else if (armPhase === 'TRACKING' && hoveredIdx >= 0 && cardAnchorsWorld[hoveredIdx]) {
          const notch = cardAnchorsWorld[hoveredIdx];
          goalTipX = notch.x;
          goalTipY = notch.y + 52;
          goalGrip = 0.94;
        } else if (armPhase === 'APPROACHING' && activeIdx >= 0 && cardAnchorsWorld[activeIdx]) {
          const notch = cardAnchorsWorld[activeIdx];
          segEnd = { x: notch.x, y: notch.y + 48 };
          const p = quinticEase(phaseTime / 0.16);
          goalTipX = MathUtils.lerp(segStart.x, segEnd.x, p);
          goalTipY = MathUtils.lerp(segStart.y, segEnd.y, p);
          goalGrip = 0.96;
          if (phaseTime >= 0.17) {
            const cur = computeCurrentTipFK();
            segStart = { x: cur.x, y: cur.y };
            segEnd = { x: notch.x, y: notch.y + 1 };
            armPhase = 'DESCENDING';
            phaseTime = 0;
          }
        } else if (armPhase === 'DESCENDING' && activeIdx >= 0 && cardAnchorsWorld[activeIdx]) {
          const notch = cardAnchorsWorld[activeIdx];
          segEnd = { x: notch.x, y: notch.y + 1 };
          const p = quinticEase(phaseTime / 0.10);
          goalTipX = MathUtils.lerp(segStart.x, segEnd.x, p);
          goalTipY = MathUtils.lerp(segStart.y, segEnd.y, p);
          goalGrip = 0.96;
          if (phaseTime >= 0.11) {
            armPhase = 'CLAMPING';
            phaseTime = 0;
          }
        } else if (armPhase === 'CLAMPING' && activeIdx >= 0 && cardAnchorsWorld[activeIdx]) {
          const notch = cardAnchorsWorld[activeIdx];
          goalTipX = notch.x;
          goalTipY = notch.y + 1;
          goalGrip = 0.06;
          goalLed = 1;
          if (phaseTime >= 0.09) {
            const cur = computeCurrentTipFK();
            const clamp = getVisorClampWorld();
            segStart = { x: cur.x, y: cur.y };
            segEnd = { x: clamp.x, y: clamp.y };
            attachHoistCard(activeIdx, false);
            syncHoistCardToGripper(0, false);
            document.body.classList.add('arm-hoisting');
            armPhase = 'HOISTING';
            phaseTime = 0;
          }
        } else if (armPhase === 'HOISTING' && activeIdx >= 0) {
          const clamp = getVisorClampWorld();
          segEnd = { x: clamp.x, y: clamp.y };
          const p = quinticEase(phaseTime / 0.25);
          goalTipX = MathUtils.lerp(segStart.x, segEnd.x, p);
          goalTipY = MathUtils.lerp(segStart.y, segEnd.y, p);
          goalGrip = 0.08;
          goalLed = 1;
          hoistSyncMode = 'up';
          hoistSyncProgress = p;
          if (phaseTime >= 0.27) {
            completePickLock();
            hoistSyncMode = null;
          }
        } else if (armPhase === 'LOCKED' && activeIdx >= 0) {
          const clamp = getVisorClampWorld();
          goalTipX = clamp.x;
          goalTipY = clamp.y;
          goalGrip = 0.10;
          goalLed = 1;
        } else if (armPhase === 'PLACING' && activeIdx >= 0 && cardAnchorsWorld[activeIdx]) {
          const home = cardAnchorsWorld[activeIdx];
          segEnd = { x: home.x, y: home.y + 1 };
          const p = quinticEase(phaseTime / 0.34);
          goalTipX = MathUtils.lerp(segStart.x, segEnd.x, p);
          goalTipY = MathUtils.lerp(segStart.y, segEnd.y, p);
          goalGrip = 0.08;
          goalLed = 1;
          hoistSyncMode = 'down';
          hoistSyncProgress = p;
          const liveTip = computeCurrentTipFK();
          const tipDist = Math.hypot(liveTip.x - home.x, liveTip.y - (home.y + 1));
          // Release cleanly the instant the fast-tracked 3D gripper physically seats the card into the bay
          if ((phaseTime >= 0.36 && tipDist < 12) || phaseTime >= 0.48) {
            // Snap hoist card to exact flush slot position, reveal real docked card underneath, then crossfade proxy out
            syncHoistCardToGripper(1, true);
            cardEls.forEach((el) => el.classList.remove('is-picked', 'is-grabbing', 'is-hovered'));
            cardDock?.classList.remove('has-hover');
            document.body.classList.remove('arm-hoisting');
            detachHoistCard(true);
            hoistSyncMode = null;
            releaseStartWristTilt = 0;
            segStart = { x: liveTip.x, y: liveTip.y };
            segEnd = { x: home.x, y: home.y + 56 };
            armPhase = 'RELEASING';
            phaseTime = 0;
          }
        } else if (armPhase === 'RELEASING') {
          const p = quinticEase(phaseTime / 0.20);
          goalTipX = MathUtils.lerp(segStart.x, segEnd.x, p);
          goalTipY = MathUtils.lerp(segStart.y, segEnd.y, p);
          goalWristTilt = MathUtils.lerp(releaseStartWristTilt, 0, p);
          goalGrip = 0.90;
          goalLed = 0;
          if (phaseTime >= 0.22) {
            const cur = computeCurrentTipFK();
            segStart = { x: cur.x, y: cur.y };
            segEnd = { x: idleTarget.x, y: idleTarget.y };
            activeIdx = -1;
            releaseStartWristTilt = 0;
            cardDock?.classList.remove('is-releasing');
            armPhase = 'RETURNING';
            phaseTime = 0;
          }
        } else if (armPhase === 'RETURNING') {
          segEnd = { x: idleTarget.x, y: idleTarget.y };
          const p = quinticEase(phaseTime / 0.40);
          goalTipX = MathUtils.lerp(segStart.x, segEnd.x, p);
          goalTipY = MathUtils.lerp(segStart.y, segEnd.y, p);
          goalGrip = 0.72;
          goalLed = 0;
          if (phaseTime >= 0.42) {
            armPhase = badgeHovered ? 'BADGE_TRACKING' : hoveredIdx >= 0 ? 'TRACKING' : 'IDLE';
            phaseTime = 0;
          }
        } else if (armPhase === 'BADGE_TRACKING') {
          const lug = getBadgeLugWorld('hover');
          goalTipX = lug.x - 6;
          goalTipY = lug.y + 18;
          goalWristTilt = 0.34;
          goalGrip = 0.94;
        } else if (armPhase === 'BADGE_APPROACHING') {
          const lug = badgePickupHoleWorld ?? getBadgeLugWorld('hover');
          segEnd = { x: lug.x, y: lug.y };
          const p = quinticEase(phaseTime / 0.14);
          goalTipX = MathUtils.lerp(segStart.x, segEnd.x, p);
          goalTipY = MathUtils.lerp(segStart.y, segEnd.y, p);
          goalWristTilt = 0.34;
          goalGrip = 0.95;
          if (phaseTime >= 0.15) {
            armPhase = 'BADGE_CLAMPING';
            phaseTime = 0;
          }
        } else if (armPhase === 'BADGE_CLAMPING') {
          const lug = badgePickupHoleWorld ?? getBadgeLugWorld('hover');
          goalTipX = lug.x;
          goalTipY = lug.y;
          goalWristTilt = 0.34;
          goalGrip = 0.06;
          goalLed = 1;
          if (phaseTime >= 0.09) {
            const cur = computeCurrentTipFK();
            const openLug = getBadgeOpenLugWorld();
            segStart = { x: cur.x, y: cur.y };
            segEnd = { x: openLug.x, y: openLug.y };
            attachBadgeProxy(false);
            syncBadgeProxyToGripper(0, false);
            document.body.classList.add('arm-hoisting');
            armPhase = 'BADGE_PULLING';
            phaseTime = 0;
          }
        } else if (armPhase === 'BADGE_PULLING') {
          const openLug = getBadgeOpenLugWorld();
          segEnd = { x: openLug.x, y: openLug.y };
          const p = quinticEase(phaseTime / 0.28);
          goalTipX = MathUtils.lerp(segStart.x, segEnd.x, p);
          goalTipY = MathUtils.lerp(segStart.y, segEnd.y, p);
          goalWristTilt = MathUtils.lerp(0.34, 0, p);
          goalGrip = 0.08;
          goalLed = 1;
          badgeSyncMode = 'pull';
          badgeSyncProgress = p;
          if (phaseTime >= 0.30) {
            completeBadgeLock();
            badgeSyncMode = null;
          }
        } else if (armPhase === 'BADGE_LOCKED') {
          const openLug = getBadgeOpenLugWorld();
          goalTipX = openLug.x;
          goalTipY = openLug.y;
          goalWristTilt = 0;
          goalGrip = 0.08;
          goalLed = 1;
        } else if (armPhase === 'BADGE_RETURNING') {
          const dockLug = badgeReturnDockWorld ?? getBadgeLugWorld('docked');
          segEnd = { x: dockLug.x, y: dockLug.y + 1 };
          const p = quinticEase(phaseTime / 0.32);
          goalTipX = MathUtils.lerp(segStart.x, segEnd.x, p);
          goalTipY = MathUtils.lerp(segStart.y, segEnd.y, p);
          goalWristTilt = MathUtils.lerp(0, 0.38, p);
          goalGrip = 0.08;
          goalLed = 1;
          badgeSyncMode = 'return';
          badgeSyncProgress = p;
          const liveTip = computeCurrentTipFK();
          const tipDist = Math.hypot(liveTip.x - segEnd.x, liveTip.y - segEnd.y);
          if ((phaseTime >= 0.34 && tipDist < 14) || phaseTime >= 0.48) {
            // Seat proxy flush over exact docked right-edge anchor, swap instantly to real badge, zero ghost/teleport!
            syncBadgeProxyToGripper(1, true);
            badgeTriggerEl?.classList.remove('is-picked', 'is-grabbing', 'is-hovered');
            document.body.classList.remove('arm-hoisting');
            detachBadgeProxy(true);
            badgeSyncMode = null;
            badgePickupHoleWorld = null;
            badgeReturnDockWorld = null;
            badgeActive = false;
            releaseStartWristTilt = 0.38;
            segStart = { x: liveTip.x, y: liveTip.y };
            segEnd = { x: dockLug.x - 32, y: dockLug.y + 44 };
            armPhase = 'RELEASING';
            phaseTime = 0;
          }
        }

        const targetPose = computeDirectionalIK(goalTipX, goalTipY, goalWristTilt);
        const stepDt = userPaused ? 0 : dt;
        if (!userPaused) {
          // Engage crisp high-torque payload servo gain during PLACING / HOISTING / BADGE_PULLING / BADGE_RETURNING
          // using 2 stable sub-steps so the 3D arm keeps exact 1:1 pace with the carried element
          const servoGain =
            armPhase === 'PLACING' || armPhase === 'BADGE_RETURNING'
              ? 1.75
              : armPhase === 'HOISTING' || armPhase === 'BADGE_PULLING'
                ? 1.4
                : 1.0;
          const subSteps = servoGain > 1.0 ? 2 : 1;
          const subDt = (stepDt * servoGain) / subSteps;
          for (let s = 0; s < subSteps; s++) {
            spCarriageX.step(targetPose.carriageX, subDt);
            spJ0.step(targetPose.j0, subDt);
            spJ1.step(targetPose.j1, subDt);
            spJ2.step(targetPose.j2, subDt);
            spJ3.step(targetPose.j3, subDt);
            spJ4.step(targetPose.j4, subDt);
            spGrip.step(goalGrip, subDt);
            spLed.step(goalLed, subDt);
          }
        }

        applyArmTransforms(spGrip.x, spLed.x);

        if (hoistSyncMode === 'down' && activeIdx >= 0 && cardAnchorsWorld[activeIdx]) {
          // Drive drop-off card seating from ACTUAL physical FK gripper position so card NEVER outruns the jaws
          const home = cardAnchorsWorld[activeIdx];
          const liveTip = computeCurrentTipFK();
          const totalDist = Math.max(1, Math.hypot(home.x - segStart.x, home.y + 1 - segStart.y));
          const remDist = Math.hypot(home.x - liveTip.x, home.y + 1 - liveTip.y);
          const physicalProgress = MathUtils.clamp(1 - remDist / totalDist, 0, 1);
          syncHoistCardToGripper(physicalProgress, true);
        } else if (hoistSyncMode === 'up') {
          syncHoistCardToGripper(hoistSyncProgress, false);
        } else if (badgeSyncMode === 'pull') {
          syncBadgeProxyToGripper(badgeSyncProgress, false);
        } else if (badgeSyncMode === 'return') {
          const dockLug = badgeReturnDockWorld ?? getBadgeLugWorld('docked');
          const liveTip = computeCurrentTipFK();
          const totalDist = Math.max(1, Math.hypot(dockLug.x - segStart.x, dockLug.y + 1 - segStart.y));
          const remDist = Math.hypot(dockLug.x - liveTip.x, dockLug.y + 1 - liveTip.y);
          const physicalProgress = MathUtils.clamp(1 - remDist / totalDist, 0, 1);
          syncBadgeProxyToGripper(physicalProgress, true);
        }

        renderer.render(scene, camera);
        needsSingleRender = false;

        const isSettledState =
          (armPhase === 'IDLE' ||
            armPhase === 'LOCKED' ||
            armPhase === 'TRACKING' ||
            armPhase === 'BADGE_TRACKING' ||
            armPhase === 'BADGE_LOCKED') &&
          spCarriageX.isSettled(targetPose.carriageX) &&
          spJ0.isSettled(targetPose.j0) &&
          spJ1.isSettled(targetPose.j1) &&
          spJ2.isSettled(targetPose.j2) &&
          spJ3.isSettled(targetPose.j3) &&
          spJ4.isSettled(targetPose.j4) &&
          spGrip.isSettled(goalGrip) &&
          spLed.isSettled(goalLed);

        armActive = !userPaused && !isSettledState;
      }
    }

    if (!armActive && !needsSingleRender) {
      stopLoop();
    }
  }

  function wakeLoop(): void {
    if (!tabVisible) return;
    if (webglReady && renderer) {
      if (!loopRunning) {
        loopRunning = true;
        const now = performance.now();
        timer.update(now);
        lastFrameWallMs = now;
        renderer.setAnimationLoop(onFrame);
      }
    }
  }

  function stopLoop(): void {
    lastFrameWallMs = 0;
    if (renderer && loopRunning) {
      renderer.setAnimationLoop(null);
      loopRunning = false;
    }
  }

  // 9x9 Retro Pixel-Art Intro Cascade -> Smoothly folds into Domain Capsule
  function clearIntroTimers(): void {
    while (introTimers.length > 0) {
      const id = introTimers.pop();
      if (id !== undefined) window.clearTimeout(id);
    }
  }

  function runPixelIntroAndLaunch(): void {
    clearIntroTimers();
    if (!pixelStrip || !pixelRow || !pixelCaption) return;

    let alreadySeen = false;
    try {
      alreadySeen = window.sessionStorage.getItem(INTRO_SESSION_KEY) === '1';
    } catch {
      alreadySeen = false;
    }

    if (userPaused || alreadySeen) {
      pixelRow.setAttribute('data-state', 'hidden');
      pixelCaption.setAttribute('data-state', 'visible');
      return;
    }

    pixelCaption.setAttribute('data-state', 'hidden');
    pixelRow.setAttribute('data-state', 'playing');

    const glyphs = Array.from(pixelRow.querySelectorAll<SVGSVGElement>('[data-pixel-glyph]'));
    glyphs.forEach((g) => g.classList.remove('is-in', 'is-out', 'is-takeoff'));

    glyphs.forEach((g, idx) => {
      introTimers.push(window.setTimeout(() => g.classList.add('is-in'), 35 + idx * 45));
    });

    introTimers.push(
      window.setTimeout(() => {
        glyphs.forEach((g, idx) => {
          if (idx === 1) g.classList.add('is-takeoff');
          else g.classList.add('is-out');
        });
      }, 450),
    );

    introTimers.push(
      window.setTimeout(() => {
        pixelRow.setAttribute('data-state', 'hidden');
        pixelCaption.setAttribute('data-state', 'visible');
        try {
          window.sessionStorage.setItem(INTRO_SESSION_KEY, '1');
        } catch {
          // Ignore strict WebView storage block
        }
      }, 690),
    );
  }

  function updatePauseButtonUI(): void {
    if (!pauseBtn) return;
    if (pauseLabel) {
      pauseLabel.textContent = userPaused ? 'Resume' : 'Pause';
    } else {
      pauseBtn.textContent = userPaused ? 'Resume' : 'Pause';
    }
  }

  function setActiveSlot(idx: number): void {
    activeIdx = idx;
    cardEls.forEach((el, i) => {
      el.classList.remove('is-grabbing', 'is-hovered');
      el.classList.toggle('is-picked', i === idx);
    });
  }

  function requestPickModule(idx: number, cb: (i: number) => void): void {
    clearPickSafetyTimer();
    clearReleasedHighlightSuppression();
    badgeHovered = false;
    badgeTriggerEl?.classList.remove('is-hovered');
    cardDock?.classList.remove('is-releasing');
    // Instant open if WebGL unavailable, paused, or reduced-motion
    if (!webglReady || userPaused || prefersReduced || !cardAnchorsWorld[idx]) {
      setActiveSlot(idx);
      armPhase = 'LOCKED';
      cb(idx);
      return;
    }

    const wasAlreadyHovering = armPhase === 'TRACKING' && hoveredIdx === idx;
    activeIdx = idx;
    onLockCb = cb;
    const notch = cardAnchorsWorld[idx];
    const fk = computeCurrentTipFK();
    cardEls.forEach((el, i) => {
      el.classList.remove('is-hovered');
      el.classList.toggle('is-grabbing', i === idx);
    });
    cardDock?.classList.remove('has-hover');

    if (wasAlreadyHovering) {
      segStart = { x: fk.x, y: fk.y };
      segEnd = { x: notch.x, y: notch.y + 1 };
      armPhase = 'DESCENDING';
    } else {
      segStart = { x: fk.x, y: fk.y };
      segEnd = { x: notch.x, y: notch.y + 48 };
      armPhase = 'APPROACHING';
    }
    phaseTime = 0;
    armActive = true;
    const now = performance.now();
    timer.update(now);
    lastFrameWallMs = now;
    // Hard safety guard so low-FPS software WebGL never blocks the inspection visor past 480-600ms
    // (60fps+ GPUs complete full hoist naturally in ~470ms from hover / ~640ms cold click)
    const safetyMs = wasAlreadyHovering ? 480 : 600;
    pickSafetyTimer = window.setTimeout(() => {
      pickSafetyTimer = null;
      if (
        onLockCb &&
        (armPhase === 'APPROACHING' ||
          armPhase === 'DESCENDING' ||
          armPhase === 'CLAMPING' ||
          armPhase === 'HOISTING')
      ) {
        completePickLock();
      }
    }, safetyMs);
    wakeLoop();
  }

  function requestPickBadge(cb: () => void): void {
    clearPickSafetyTimer();
    clearBadgeReleaseSuppression();
    clearReleasedHighlightSuppression();
    cardDock?.classList.remove('is-releasing', 'has-hover');
    hoveredIdx = -1;
    cardEls.forEach((el) => el.classList.remove('is-hovered', 'is-grabbing'));

    if (!webglReady || userPaused || prefersReduced || !badgeTriggerEl) {
      badgeActive = true;
      badgeTriggerEl?.classList.add('is-picked');
      armPhase = 'BADGE_LOCKED';
      cb();
      return;
    }

    const wasAlreadyHovering = armPhase === 'BADGE_TRACKING' && badgeHovered;
    badgeActive = true;
    onBadgeLockCb = cb;
    badgePickupHoleWorld = getBadgeLugWorld('hover');
    const lug = badgePickupHoleWorld;
    const fk = computeCurrentTipFK();
    badgeTriggerEl.classList.remove('is-hovered');
    badgeTriggerEl.classList.add('is-grabbing');

    segStart = { x: fk.x, y: fk.y };
    segEnd = { x: lug.x, y: lug.y };
    armPhase = 'BADGE_APPROACHING';
    phaseTime = 0;
    armActive = true;
    const now = performance.now();
    timer.update(now);
    lastFrameWallMs = now;

    const safetyMs = wasAlreadyHovering ? 540 : 660;
    pickSafetyTimer = window.setTimeout(() => {
      pickSafetyTimer = null;
      if (
        onBadgeLockCb &&
        (armPhase === 'BADGE_APPROACHING' ||
          armPhase === 'BADGE_CLAMPING' ||
          armPhase === 'BADGE_PULLING')
      ) {
        completeBadgeLock();
      }
    }, safetyMs);
    wakeLoop();
  }

  function releaseBadge(): void {
    clearPickSafetyTimer();
    onBadgeLockCb = null;
    badgeHovered = false;
    suppressHoverUntil = performance.now() + 600;
    clearBadgeReleaseSuppression();
    suppressBadgeRelease = true;
    badgeReleasePointerOrigin = lastPointerPos ? { ...lastPointerPos } : null;
    badgeTriggerEl?.setAttribute('data-just-released', 'true');
    badgeTriggerEl?.classList.remove('is-hovered', 'is-grabbing');

    if (!badgeActive) return;

    if (!webglReady || userPaused || prefersReduced || !badgeTriggerEl) {
      detachBadgeProxy(true);
      badgeTriggerEl?.classList.remove('is-picked', 'is-grabbing', 'is-hovered');
      document.body.classList.remove('arm-hoisting');
      badgeActive = false;
      armPhase = 'IDLE';
      needsSingleRender = true;
      wakeLoop();
      return;
    }

    attachBadgeProxy(true);
    syncBadgeProxyToGripper(0, true);
    document.body.classList.add('arm-hoisting');

    const fk = computeCurrentTipFK();
    const dockLug = badgeReturnDockWorld ?? getBadgeLugWorld('docked');
    segStart = { x: fk.x, y: fk.y };
    segEnd = { x: dockLug.x, y: dockLug.y + 1 };
    armPhase = 'BADGE_RETURNING';
    phaseTime = 0;
    releaseWarmupFrame = true;
    armActive = true;
    const now = performance.now();
    timer.update(now);
    lastFrameWallMs = now;
    wakeLoop();
  }

  function releaseModule(): void {
    clearPickSafetyTimer();
    onLockCb = null;
    const releasedIdx = activeIdx;

    // Immediately scrub hover/focus highlight state so Esc NEVER leaves the returned card highlighted
    hoveredIdx = -1;
    suppressHoverUntil = performance.now() + 600;
    clearReleasedHighlightSuppression();
    if (releasedIdx >= 0) {
      suppressRestoredCardIdx = releasedIdx;
      releasePointerOrigin = lastPointerPos ? { ...lastPointerPos } : null;
      cardEls[releasedIdx]?.setAttribute('data-just-released', 'true');
    }
    cardDock?.classList.remove('has-hover');
    cardEls.forEach((el) => el.classList.remove('is-hovered', 'is-grabbing'));

    if (releasedIdx < 0) return;

    if (!webglReady || userPaused || prefersReduced || !cardAnchorsWorld[releasedIdx]) {
      detachHoistCard(true);
      cardEls.forEach((el) => el.classList.remove('is-picked', 'is-grabbing', 'is-hovered'));
      cardDock?.classList.remove('is-releasing');
      document.body.classList.remove('arm-hoisting');
      activeIdx = -1;
      armPhase = 'IDLE';
      needsSingleRender = true;
      wakeLoop();
      return;
    }

    cardDock?.classList.add('is-releasing');
    attachHoistCard(releasedIdx, true);
    syncHoistCardToGripper(0, true);
    document.body.classList.add('arm-hoisting');

    const fk = computeCurrentTipFK();
    const home = cardAnchorsWorld[releasedIdx];
    segStart = { x: fk.x, y: fk.y };
    segEnd = { x: home.x, y: home.y + 1 };
    armPhase = 'PLACING';
    phaseTime = 0;
    releaseWarmupFrame = true;
    armActive = true;
    const now = performance.now();
    timer.update(now);
    lastFrameWallMs = now;
    wakeLoop();
  }

  // Event wiring
  const onPauseClick = () => {
    userPaused = !userPaused;
    updatePauseButtonUI();
    if (userPaused) {
      clearIntroTimers();
      clearPickSafetyTimer();
      clearHoistFadeTimer();
      clearBadgeProxyFadeTimer();
      detachHoistCard(true);
      detachBadgeProxy(true);
      badgeTriggerEl?.classList.remove('is-picked', 'is-grabbing', 'is-hovered');
      badgeActive = false;
      document.body.classList.remove('arm-hoisting');
      pixelRow?.setAttribute('data-state', 'hidden');
      pixelCaption?.setAttribute('data-state', 'visible');
      stopLoop();
    } else {
      armActive = true;
      needsSingleRender = true;
      wakeLoop();
    }
  };

  const onVisibilityChange = () => {
    tabVisible = document.visibilityState !== 'hidden';
    if (!tabVisible) {
      stopLoop();
    } else if (!userPaused) {
      needsSingleRender = true;
      wakeLoop();
    }
  };

  const onReducedChange = (e: MediaQueryListEvent) => {
    prefersReduced = e.matches;
    if (prefersReduced) {
      userPaused = true;
      updatePauseButtonUI();
      stopLoop();
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    lastPointerPos = { x: e.clientX, y: e.clientY };
    if (
      suppressRestoredCardIdx >= 0 &&
      armPhase !== 'PLACING' &&
      armPhase !== 'RELEASING' &&
      performance.now() >= suppressHoverUntil
    ) {
      if (!releasePointerOrigin) {
        releasePointerOrigin = { x: e.clientX, y: e.clientY };
      } else if (Math.hypot(e.clientX - releasePointerOrigin.x, e.clientY - releasePointerOrigin.y) >= 12) {
        clearReleasedHighlightSuppression();
      }
    }
    if (
      suppressBadgeRelease &&
      armPhase !== 'BADGE_RETURNING' &&
      armPhase !== 'RELEASING' &&
      performance.now() >= suppressHoverUntil
    ) {
      if (!badgeReleasePointerOrigin) {
        badgeReleasePointerOrigin = { x: e.clientX, y: e.clientY };
      } else if (
        Math.hypot(e.clientX - badgeReleasePointerOrigin.x, e.clientY - badgeReleasePointerOrigin.y) >= 12
      ) {
        clearBadgeReleaseSuppression();
      }
    }
  };

  const isArmBusy = () =>
    armPhase === 'APPROACHING' ||
    armPhase === 'DESCENDING' ||
    armPhase === 'CLAMPING' ||
    armPhase === 'HOISTING' ||
    armPhase === 'LOCKED' ||
    armPhase === 'PLACING' ||
    armPhase === 'RELEASING' ||
    armPhase === 'BADGE_APPROACHING' ||
    armPhase === 'BADGE_CLAMPING' ||
    armPhase === 'BADGE_PULLING' ||
    armPhase === 'BADGE_LOCKED' ||
    armPhase === 'BADGE_RETURNING';

  const onBadgeHoverIn = (fromFocus: boolean) => {
    if (fromFocus && performance.now() < suppressHoverUntil) return;
    if (isArmBusy()) return;
    if (!fromFocus && suppressBadgeRelease) {
      if (performance.now() < suppressHoverUntil) return;
      clearBadgeReleaseSuppression();
    }
    badgeHovered = true;
    hoveredIdx = -1;
    cardDock?.classList.remove('has-hover');
    cardEls.forEach((c) => c.classList.remove('is-hovered'));
    badgeTriggerEl?.classList.add('is-hovered');
    if (
      armPhase === 'IDLE' ||
      armPhase === 'TRACKING' ||
      armPhase === 'RETURNING' ||
      armPhase === 'BADGE_TRACKING'
    ) {
      armPhase = 'BADGE_TRACKING';
      armActive = true;
      wakeLoop();
    }
  };

  const onBadgeHoverOut = (fromBlur: boolean) => {
    if (
      !fromBlur &&
      suppressBadgeRelease &&
      armPhase !== 'BADGE_RETURNING' &&
      armPhase !== 'RELEASING' &&
      performance.now() >= suppressHoverUntil
    ) {
      clearBadgeReleaseSuppression();
    }
    if (!badgeHovered) return;
    badgeHovered = false;
    badgeTriggerEl?.classList.remove('is-hovered');
    if (armPhase === 'BADGE_TRACKING') {
      armPhase = hoveredIdx >= 0 ? 'TRACKING' : 'IDLE';
      armActive = true;
      wakeLoop();
    }
  };

  const onBadgeMouseEnter = () => onBadgeHoverIn(false);
  const onBadgeFocus = () => onBadgeHoverIn(true);
  const onBadgeMouseLeave = () => onBadgeHoverOut(false);
  const onBadgeBlur = () => onBadgeHoverOut(true);

  badgeTriggerEl?.addEventListener('mouseenter', onBadgeMouseEnter);
  badgeTriggerEl?.addEventListener('focus', onBadgeFocus);
  badgeTriggerEl?.addEventListener('mouseleave', onBadgeMouseLeave);
  badgeTriggerEl?.addEventListener('blur', onBadgeBlur);

  const cardHandlers: Array<{
    el: HTMLElement;
    onMouseEnter: () => void;
    onFocus: () => void;
    onMouseLeave: () => void;
    onBlur: () => void;
  }> = [];
  cardEls.forEach((el, idx) => {
    const activateHover = (fromFocus: boolean) => {
      if (fromFocus && performance.now() < suppressHoverUntil) return;
      if (isArmBusy()) {
        return;
      }
      if (!fromFocus && idx === suppressRestoredCardIdx) {
        return;
      }
      if (idx !== suppressRestoredCardIdx) {
        clearReleasedHighlightSuppression();
      }
      badgeHovered = false;
      badgeTriggerEl?.classList.remove('is-hovered');
      hoveredIdx = idx;
      cardDock?.classList.add('has-hover');
      cardEls.forEach((c, i) => c.classList.toggle('is-hovered', i === idx));
      if (
        armPhase === 'IDLE' ||
        armPhase === 'TRACKING' ||
        armPhase === 'RETURNING' ||
        armPhase === 'BADGE_TRACKING'
      ) {
        armPhase = 'TRACKING';
        armActive = true;
        wakeLoop();
      }
    };
    const onMouseEnter = () => activateHover(false);
    const onFocus = () => activateHover(true);
    const deactivateHover = (fromBlur: boolean) => {
      // Never let programmatic blur() or synthetic modal-close mouseleave clear post-Esc hover suppression!
      if (
        !fromBlur &&
        idx === suppressRestoredCardIdx &&
        armPhase !== 'PLACING' &&
        armPhase !== 'RELEASING' &&
        performance.now() >= suppressHoverUntil
      ) {
        clearReleasedHighlightSuppression();
      }
      if (hoveredIdx !== idx) return;
      hoveredIdx = -1;
      cardDock?.classList.remove('has-hover');
      cardEls.forEach((c) => c.classList.remove('is-hovered'));
      if (armPhase === 'TRACKING') {
        armPhase = 'IDLE';
        armActive = true;
        wakeLoop();
      }
    };
    const onMouseLeave = () => deactivateHover(false);
    const onBlur = () => deactivateHover(true);
    el.addEventListener('mouseenter', onMouseEnter);
    el.addEventListener('focus', onFocus);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('blur', onBlur);
    cardHandlers.push({ el, onMouseEnter, onFocus, onMouseLeave, onBlur });
  });

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  pauseBtn?.addEventListener('click', onPauseClick);
  document.addEventListener('visibilitychange', onVisibilityChange);
  reducedMq?.addEventListener('change', onReducedChange);

  const themeObserver = new MutationObserver(() => {
    const next = getEffectiveTheme();
    if (next !== currentTheme) {
      applyThreeTheme(next);
    }
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  let resizeObserver: ResizeObserver | undefined;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      measureStage(false);
      wakeLoop();
    });
    resizeObserver.observe(stageEl);
  }

  let io: IntersectionObserver | undefined;
  if (typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        heroInView = entry.isIntersecting;
        if (heroInView) {
          needsSingleRender = true;
          wakeLoop();
        }
      },
      { threshold: 0.05 },
    );
    io.observe(stageEl);
  }

  // Bootstrap 3D scene + initial render + pixel intro
  const threeCtx = initThreeScene();
  updatePauseButtonUI();
  measureStage(true);
  if (threeCtx) {
    threeCtx.renderer.render(threeCtx.scene, threeCtx.camera);
    needsSingleRender = false;
  }

  runPixelIntroAndLaunch();

  // Expose hooks cleanly for ModuleVisorDialog, PersonalBadgeDialog & CommandPalette
  const win = window as unknown as {
    __cobotPickModule?: (idx: number, cb: (i: number) => void) => void;
    __cobotReleaseModule?: () => void;
    __cobotSetActiveSlot?: (idx: number) => void;
    __cobotPickBadge?: (cb: () => void) => void;
    __cobotReleaseBadge?: () => void;
  };
  win.__cobotPickModule = requestPickModule;
  win.__cobotReleaseModule = releaseModule;
  win.__cobotSetActiveSlot = setActiveSlot;
  win.__cobotPickBadge = requestPickBadge;
  win.__cobotReleaseBadge = releaseBadge;

  return {
    requestPickModule,
    releaseModule,
    setActiveSlot,
    requestPickBadge,
    releaseBadge,
    destroy: () => {
      clearIntroTimers();
      clearPickSafetyTimer();
      clearHoistFadeTimer();
      clearBadgeProxyFadeTimer();
      stopLoop();
      detachHoistCard(true);
      detachBadgeProxy(true);
      badgeTriggerEl?.classList.remove('is-picked', 'is-grabbing', 'is-hovered');
      document.body.classList.remove('arm-hoisting');
      delete win.__cobotPickModule;
      delete win.__cobotReleaseModule;
      delete win.__cobotSetActiveSlot;
      delete win.__cobotPickBadge;
      delete win.__cobotReleaseBadge;

      themeObserver.disconnect();
      resizeObserver?.disconnect();
      io?.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      clearReleasedHighlightSuppression();
      clearBadgeReleaseSuppression();
      cardDock?.classList.remove('is-releasing');
      badgeTriggerEl?.removeEventListener('mouseenter', onBadgeMouseEnter);
      badgeTriggerEl?.removeEventListener('focus', onBadgeFocus);
      badgeTriggerEl?.removeEventListener('mouseleave', onBadgeMouseLeave);
      badgeTriggerEl?.removeEventListener('blur', onBadgeBlur);
      pauseBtn?.removeEventListener('click', onPauseClick);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reducedMq?.removeEventListener('change', onReducedChange);
      cardHandlers.forEach(({ el, onMouseEnter, onFocus, onMouseLeave, onBlur }) => {
        el.removeEventListener('mouseenter', onMouseEnter);
        el.removeEventListener('focus', onFocus);
        el.removeEventListener('mouseleave', onMouseLeave);
        el.removeEventListener('blur', onBlur);
      });

      // Strict GPU memory cleanup
      if (scene) {
        scene.traverse((obj) => {
          if ((obj as Mesh).isMesh) {
            const m = obj as Mesh;
            m.geometry?.dispose();
            const matList: Material[] = Array.isArray(m.material) ? m.material : [m.material];
            matList.forEach((mat) => {
              const std = mat as MeshStandardMaterial;
              std.map?.dispose();
              mat.dispose();
            });
          }
        });
      }
      envRT?.dispose();
      renderer?.dispose();
      timer.dispose();
    },
  };
}
