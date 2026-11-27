import type { CollectionEntry } from 'astro:content';
import type { ResumeData } from './resume.schema';
import { SITE, withBase } from './site';

export type ModuleIconKey = 'profile' | 'automation' | 'uav' | 'rag' | 'rover' | 'connect';
export type RailStationId = 'experience' | 'education' | 'projects' | 'certifications' | 'stack';

export interface ShowcaseHighlightItem {
  term: string;
  desc: string;
}

export interface ShowcaseSecondaryLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface ShowcaseModule {
  id: string;
  category: string;
  iconKey: ModuleIconKey;
  title: string;
  cardSummary: string;
  cardHighlights?: ShowcaseHighlightItem[];
  chips: string[];
  proof: string;
  href: string;
  targetId: string;
  railStation: RailStationId;
  glyphId: string;
  previewTitle?: string;
  previewSummary: string;
  previewFacts: string[];
  stack: string[];
  secondaryLink?: ShowcaseSecondaryLink;
}

/**
 * 6 crisp 9x9 engineering pixel glyphs (ported from Claudiu's original prototype).
 * Index 1 is the UAV Quadrotor that detaches and flies autonomously across the desktop viewport.
 */
export const PIXEL_GLYPHS: readonly { id: string; label: string; grid: readonly string[] }[] = [
  {
    id: 'chip',
    label: 'Applied AI',
    grid: [
      '..k.k.k..',
      '.kkkkkkk.',
      'k.bbbbb.k',
      '.kbwwwbk.',
      'k.bwowb.k',
      '.kbwwwbk.',
      'k.bbbbb.k',
      '.kkkkkkk.',
      '..k.k.k..',
    ],
  },
  {
    id: 'uav',
    label: 'QUADYX UAV',
    grid: [
      'kk.....kk',
      '.k.....k.',
      '..kk.kk..',
      '...kok...',
      '..kbbbk..',
      '...kkk...',
      '..k...k..',
      '.k.....k.',
      'kk.....kk',
    ],
  },
  {
    id: 'gripper',
    label: 'Automation & Cobot',
    grid: [
      '...kkk...',
      '...kok...',
      '..kkkkk..',
      '.kb...bk.',
      '.k.....k.',
      '.k.....k.',
      '..k...k..',
      '...k.k...',
      '.........',
    ],
  },
  {
    id: 'rag',
    label: 'Document RAG',
    grid: [
      '...kk....',
      '..kbbk...',
      '...kk..k.',
      'k...k.kok',
      'kk..k..k.',
      'k..k.k...',
      '..k...kk.',
      '.kbbk.k..',
      '..kk.....',
    ],
  },
  {
    id: 'rover',
    label: 'Agri-Rover',
    grid: [
      '..kk.....',
      '.kbbk.kk.',
      '..kk.kok.',
      '..k...k..',
      '..k..k...',
      '..kkk....',
      '..k......',
      '.kbbk....',
      '..kk.....',
    ],
  },
  {
    id: 'terminal',
    label: 'Credentials & Stack',
    grid: [
      'kkkkkkkkk',
      'k.......k',
      'k.o.....k',
      'k..o....k',
      'k...o...k',
      'k..o....k',
      'k.o.bbbbk',
      'k.......k',
      'kkkkkkkkk',
    ],
  },
];

/**
 * 2D front-elevation 23x12 retro pixel-art cargo drone matching the site's exact PIXEL_GLYPHS hardware palette
 * (rendered at 46x24px exact 2x integer pixel scale). Features animated 2-frame spinning horizontal blades at y=1,
 * warm ceramic/ink chassis with cyan optical eye, curved landing skids, and a burnt-orange center belly winch hook.
 */
export const CARGO_DRONE_GRID: readonly string[] = [
  '...o...............o...',
  '...k...............k...',
  '...k.....kkkkk.....k...',
  '..ksk...kwwwwwk...ksk..',
  '.ksmkkkkkwbcbwkkkkkmsk.',
  '..kkkkkskwcwcwkskkkkk..',
  '.....kkkksmwmskkkk.....',
  '.......kkkkkkkkk.......',
  '......ks.ksosk.sk......',
  '.....ks...kkk...sk.....',
  '.....k.....k.....k.....',
  '....kk...........kk....',
];

/**
 * 9x9 pixel-art mortarboard glyph for the 5-station CNC rail & shuttle (rendered at 18x18px exact 2x scale).
 */
export const RAIL_EDUCATION_GLYPH: readonly string[] = [
  '...kkk...',
  '.kkbbbkk.',
  'kkbbobbkk',
  '.kkbbbko.',
  '..ksssko.',
  '..kwwwko.',
  '..kkkkko.',
  '......ooo',
  '.........',
];

/**
 * 23x15 multi-tone pixel-art graduation cap body for #education (rendered at 46x30px exact 2x scale).
 */
export const GRADUATION_CAP_GRID: readonly string[] = [
  '.........kkkkk.........',
  '......kkkwwwwwkkk......',
  '....kkwwwbbcbbwwwkk....',
  '..kkwwbbbccoccbbbwwkk..',
  'kkwwbbbbbbboooooobbwwkk',
  'kkssbbbbbbbbbbbbboooskk',
  '..kkssbbbbbbbbbbbssko..',
  '....kkkssssssssskkk....',
  '.....ksssssssssssk.....',
  '.....ksmwwwwwwwmsk.....',
  '.....ksmwwwwwwwmsk.....',
  '.....kssmmmmmmmssk.....',
  '......kkkkkkkkkkk......',
  '.......................',
  '.......................',
];

/**
 * Separate animated tassel rects anchored at mortarboard right rim (x=20, y=7) clear of the cap skull.
 */
export const GRADUATION_TASSEL_RECTS: readonly {
  x: number;
  y: number;
  w?: number;
  h?: number;
  fill: 'k' | 'o' | 'v';
}[] = [
  { x: 20, y: 7, h: 2, fill: 'o' },
  { x: 19, y: 9, fill: 'k' },
  { x: 20, y: 9, fill: 'o' },
  { x: 21, y: 9, fill: 'k' },
  { x: 19, y: 10, h: 3, fill: 'o' },
  { x: 20, y: 10, h: 3, fill: 'v' },
  { x: 21, y: 10, h: 3, fill: 'o' },
  { x: 19, y: 13, fill: 'o' },
  { x: 21, y: 13, fill: 'o' },
];

export function buildShowcaseModules(
  resume: ResumeData,
  projects?: CollectionEntry<'projects'>[],
): ShowcaseModule[] {
  const betfair = resume.experience[0];
  const msc = resume.education[0];
  const bsc = resume.education[1];
  const bySlug = new Map((projects ?? []).map((p) => [p.id.replace(/\.mdx$/, ''), p]));

  const enterpriseProj = bySlug.get('enterprise-agentic-review');
  const quadyxProj = bySlug.get('quadyx-autonomy');
  const ragProj = bySlug.get('electrocasnicu-rag');
  const roverProj = bySlug.get('agri-rover');

  return [
    {
      id: 'profile',
      category: 'PROFILE',
      iconKey: 'profile',
      title: 'Profile & CV',
      cardSummary: 'Applied AI, Automation & Robotics · Betfair + UTCN MSc',
      chips: ['2022–2027', 'ATS PDF'],
      proof: betfair?.period ?? 'Mar 2022 – Jan 2027',
      href: '#experience',
      targetId: 'experience',
      railStation: 'experience',
      glyphId: 'chip',
      previewTitle: 'Profile & CV',
      previewSummary: resume.profile.summary,
      previewFacts: [
        `${betfair?.company ?? 'Betfair Romania Development'} (${betfair?.period ?? 'Mar 2022 – Jan 2027'}) — 40+ E2E automation workflows`,
        `${msc?.degree ?? 'MSc. Cyber-Physical Systems'} & ${bsc?.degree ?? 'BSc. Robotics'} — ${msc?.institution ?? 'Technical University of Cluj-Napoca'}`,
        `${resume.certifications.length} verified certifications (AWS AIF-C01, UiPath Advanced, NVIDIA DL)`,
      ],
      stack: ['Python', 'TypeScript', 'C++', 'UiPath Maestro', 'ROS 2', 'RAG / LLMs'],
      secondaryLink: {
        label: 'ATS PDF ↓',
        href: withBase('/Claudiu-Span-CV.pdf'),
        external: false,
      },
    },
    {
      id: 'enterprise',
      category: 'RPA AUTOMATION',
      iconKey: 'automation',
      title: 'Flutter UK&I',
      cardSummary: '40+ E2E workflows, Maestro Agentic AI review (-70% time), Python, REFramework & REST APIs',
      chips: ['UiPath', 'API', 'SQL'],
      proof: '40+ Flows · ~70%',
      href: '#proj-flutter',
      targetId: 'proj-flutter',
      railStation: 'projects',
      glyphId: 'gripper',
      previewTitle: 'Flutter UK&I — Enterprise RPA & Agentic AI',
      previewSummary:
        enterpriseProj?.data.summary ??
        'Unified three internal operational platforms and eight Amazon Redshift scripts into a single UiPath Studio Web review workspace with Maestro orchestration and validated LLM summaries.',
      previewFacts: enterpriseProj?.data.highlights ?? [
        'On-demand live aggregation across 3 internal platforms and 8 Redshift SQL scripts.',
        'Deterministic SQL pre-aggregation before LLM synthesis inside the enterprise PII boundary.',
        'Human-in-the-loop Studio Web workspace across 40+ production deliveries.',
      ],
      stack: enterpriseProj?.data.stack ?? [
        'UiPath Studio Web',
        'Maestro',
        'LLM Agents',
        'Human-in-the-Loop',
        'Amazon Redshift',
        'Python',
      ],
    },
    {
      id: 'quadyx',
      category: 'UAV SYSTEMS',
      iconKey: 'uav',
      title: 'QUADYX',
      cardSummary: 'Algorithms (ORB-SLAM3 & Depth V2), camera–IMU sensor calibration & optical-flow precision landing',
      cardHighlights: [
        { term: 'Algorithms', desc: 'ORB-SLAM3 & Depth V2' },
        { term: 'Sensor calibration', desc: 'camera–IMU sync' },
        { term: 'Precision landing', desc: 'optical-flow lock' },
      ],
      chips: ['ROS 2', 'OpenCV', 'Python'],
      proof: 'ROS 2 · SLAM + Depth',
      href: '#proj-quadyx',
      targetId: 'proj-quadyx',
      railStation: 'projects',
      glyphId: 'uav',
      previewTitle: quadyxProj?.data.title ?? 'QUADYX — Autonomous UAV Perception & Resilient Telemetry',
      previewSummary:
        quadyxProj?.data.summary ??
        'Technical side venture exploring real-time drone spatial perception (ORB-SLAM3 + Depth Anything V2), point-cloud obstacle clustering, and resilient multi-channel GSM/IP telemetry over ROS 2.',
      previewFacts: quadyxProj?.data.highlights ?? [
        'Real-time monocular spatial perception with ORB-SLAM3 and Depth Anything V2.',
        'Hybrid C++/OpenCV point-cloud obstacle clustering with Python orchestration.',
        'Multi-channel ROS 2, GSM, and IP telemetry with automatic link failover.',
      ],
      stack: quadyxProj?.data.stack ?? [
        'ROS 2',
        'ORB-SLAM3',
        'Depth Anything V2',
        'C++',
        'Python',
        'OpenCV',
      ],
      secondaryLink: {
        label: 'quadyx.com ↗',
        href: SITE.quadyxUrl,
        external: true,
      },
    },
    {
      id: 'electrocasnicu',
      category: 'AGENTIC AI',
      iconKey: 'rag',
      title: 'ElectrocasNicu',
      cardSummary: 'Agentic AI RAG chat for appliance manuals & warranties — hybrid search with exact page citations',
      chips: ['ChromaDB', 'Pydantic'],
      proof: 'Agentic RAG · Cited',
      href: '#proj-electrocasnicu',
      targetId: 'proj-electrocasnicu',
      railStation: 'projects',
      glyphId: 'rag',
      previewTitle: ragProj?.data.title ?? 'Document RAG Agent — ElectrocasNicu',
      previewSummary:
        ragProj?.data.summary ??
        'Document RAG assistant for home-appliance manuals and warranties built with decoupled indexing/execution pipelines, ChromaDB local embeddings, Pydantic-validated tool schemas, and explicit page citations.',
      previewFacts: ragProj?.data.highlights ?? [
        'Decoupled offline page-aware indexing into local ChromaDB embeddings.',
        'Typed Pydantic tool schemas verify every cited document name and page reference.',
        'Explicit refusal guardrail prevents speculation on low-confidence retrieval.',
      ],
      stack: ragProj?.data.stack ?? [
        'Python',
        'ChromaDB',
        'Pydantic',
        'Streamlit',
        'RAG',
        'pytest',
      ],
      secondaryLink: {
        label: 'GitHub Repo ↗',
        href: ragProj?.data.repoUrl ?? 'https://github.com/Mr-Span/SpanClaudiu_ElectrocasNicu',
        external: true,
      },
    },
    {
      id: 'agri-rover',
      category: 'MECHATRONICS',
      iconKey: 'rover',
      title: 'Agri-Rover',
      cardSummary: 'Completed BSc orchard rover · GPS/IMU C++ guidance',
      chips: ['C++', 'Embedded'],
      proof: 'UTCN BSc · C++',
      href: '#proj-agri-rover',
      targetId: 'proj-agri-rover',
      railStation: 'projects',
      glyphId: 'rover',
      previewTitle: roverProj?.data.title ?? 'Agri-Rover — Autonomous Orchard Navigation Rover',
      previewSummary:
        roverProj?.data.summary ??
        'Completed BSc Robotics hardware prototype for autonomous orchard waypoint navigation and environmental telemetry, fusing GPS fixes and digital compass IMU headings via embedded C++ Haversine guidance.',
      previewFacts: roverProj?.data.highlights ?? [
        'Fuses asynchronous GPS fixes and IMU headings via embedded C++ Haversine guidance.',
        'Complete UTCN BSc Robotics hardware build and differential-drive control.',
        'Streams environmental telemetry over Bluetooth with hardware failsafe motor stop.',
      ],
      stack: roverProj?.data.stack ?? [
        'C++',
        'Embedded Systems',
        'GPS / IMU Fusion',
        'Mechatronics',
      ],
    },
    {
      id: 'credentials',
      category: 'CREDENTIALS',
      iconKey: 'connect',
      title: 'Certs & Contact',
      cardSummary: `${resume.certifications.length} verified certs (AWS, UiPath, NVIDIA, Simplilearn) · EU contact`,
      chips: ['RO', 'EN', 'DE'],
      proof: `${resume.certifications.length} Certs · RO/EN/DE`,
      href: '#certifications',
      targetId: 'certifications',
      railStation: 'certifications',
      glyphId: 'terminal',
      previewTitle: 'Verified Certifications & Direct Contact',
      previewSummary: `${resume.certifications.length} verified certifications across AWS, UiPath, NVIDIA, Simplilearn, and Veoneer. Fluent in RO, EN, and DE — ${resume.profile.location}.`,
      previewFacts: [
        'AWS Certified AI Practitioner (AIF-C01), UiPath Advanced RPA Developer & NVIDIA Deep Learning',
        "Simplilearn AI Engineer Master's Program & Python / Agentic AI Engineering",
        `Direct email: ${resume.profile.email}`,
      ],
      stack: ['AWS AIF-C01', 'UiPath Advanced', 'NVIDIA DL', 'RO · EN · DE'],
      secondaryLink: {
        label: 'LinkedIn ↗',
        href: SITE.linkedinUrl,
        external: true,
      },
    },
  ];
}
