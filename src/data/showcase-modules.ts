import type { CollectionEntry } from 'astro:content';
import type { ResumeData } from './resume.schema';
import { SITE, withBase } from './site';

export type ModuleIconKey = 'profile' | 'automation' | 'uav' | 'rag' | 'rover' | 'connect';

export interface ShowcaseMetric {
  label: string;
  value: string;
}

export interface ShowcaseLensCopy {
  summary: string;
  bullets: string[];
}

export interface ShowcaseAction {
  type: 'route' | 'external' | 'copy-email';
  label: string;
  href?: string;
  primary: boolean;
}

export interface ShowcaseHighlightItem {
  term: string;
  desc: string;
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
  readoutSummary: string;
  href: string;
  glyphId: string;
  stats: ShowcaseMetric[];
  recruiter: ShowcaseLensCopy;
  engineer: ShowcaseLensCopy;
  stack: string[];
  actions: ShowcaseAction[];
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
 * High-detail 17x17 retro pixel-art Quadrotor UAV sprite rendered at 34x34px (exact 2x integer pixel scale).
 * Includes alternating 2-phase spinning rotor discs ('r'/'p'), carbon arms, stereo depth optics, and tail LEDs.
 */
export const DETAILED_UAV_GRID: readonly string[] = [
  '.rmp.........pmr.',
  'r...p.......p...r',
  'm.k.m..kkk..m.k.m',
  'p..k..kcbck..k..p',
  '.pm.k.kwwwk.k.mp.',
  '.....kkkkkkk.....',
  '.....ksmwmsk.....',
  '....kkwbobwkk....',
  '....ksmwwwmsk....',
  '.....kskkksk.....',
  '.....kksmmkk.....',
  '....k..kkk..k....',
  '.rmk...o.o...kmr.',
  'p..k.........k..p',
  'm.k.m.......m.k.m',
  'r...p.......p...r',
  '.pmr.........rmp.',
];

export function buildShowcaseModules(
  resume: ResumeData,
  projects: CollectionEntry<'projects'>[],
): ShowcaseModule[] {
  const bySlug = new Map(projects.map((p) => [p.id.replace(/\.mdx$/, ''), p]));
  const betfair = resume.experience[0];
  const quadyxExp = resume.experience[1];
  const msc = resume.education[0];
  const bsc = resume.education[1];

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
      readoutSummary: `${resume.profile.headline} · ${resume.profile.location}`,
      href: withBase('/resume/'),
      glyphId: 'chip',
      stats: [
        { label: 'TENURE', value: betfair?.period ?? 'Mar 2022 – Jan 2027' },
        { label: 'DELIVERY', value: '40+ Workflows · ~70%' },
        { label: 'EDUCATION', value: `${msc?.degree ?? 'MSc CPS'} · ${bsc?.degree ?? 'BSc Robotics'}` },
      ],
      recruiter: {
        summary: resume.profile.summary,
        bullets: [
          betfair?.highlights[0]?.text ?? 'Delivered 40+ production automation workflows end to end.',
          betfair?.highlights[1]?.text ?? 'Cut operator review time by ~70% via Enterprise Agentic AI.',
          `${resume.certifications.length} verified certifications including AWS Certified AI Practitioner (AIF-C01) & UiPath Advanced RPA.`,
        ],
      },
      engineer: {
        summary:
          'Deterministic-first AI and systems engineer bridging governed enterprise automation (UiPath Maestro, Python, Redshift, LLM validation) with real-time robotics (ROS 2, ORB-SLAM3, C++).',
        bullets: [
          'Strict Pydantic schema validation, enterprise PII boundaries, and human-in-the-loop review gates.',
          'Single Zod-validated resume.json compiling HTML, 1-page A4 ATS PDF, /llms.txt, and /index.md with zero drift.',
          `Location & availability: ${resume.profile.location}.`,
        ],
      },
      stack: ['Python', 'TypeScript', 'C++', 'UiPath Maestro', 'ROS 2', 'RAG / LLMs'],
      actions: [
        { type: 'route', label: 'Open Full Resume →', href: withBase('/resume/'), primary: true },
        { type: 'route', label: 'Download ATS PDF ↓', href: withBase('/Claudiu-Span-CV.pdf'), primary: false },
        { type: 'copy-email', label: 'Copy Email', primary: false },
      ],
    },
    {
      id: 'enterprise',
      category: 'RPA AUTOMATION',
      iconKey: 'automation',
      title: 'Flutter UK&I',
      cardSummary: '40+ E2E workflows, Maestro Agentic AI review (-70% time), Python, REFramework & REST APIs',
      chips: ['UiPath', 'API', 'SQL'],
      proof: '40+ Flows · ~70%',
      readoutSummary:
        'Flutter UK&I (Betfair Romania Development) — 40+ E2E automation workflows, Maestro LLM review (-70% effort), Python, REST APIs & SQL.',
      href: withBase('/projects/enterprise-agentic-review/'),
      glyphId: 'gripper',
      stats: [
        { label: 'PRODUCTION', value: '40+ Workflows' },
        { label: 'IMPACT', value: '~70% Review Cut' },
        { label: 'TENURE', value: '2022–2027 · Flutter' },
      ],
      recruiter: {
        summary:
          enterpriseProj?.data.summary ??
          'Delivered 40+ production automations at Betfair Romania Development (Flutter UK&I), unifying three internal platforms and eight Amazon Redshift SQL scripts with Maestro Agentic AI.',
        bullets: [
          'Reduced operator data-review time by approximately 70% across target review workflows using validated LLM summaries.',
          'Engineered resilient unattended/attended RPA, REST API integrations, and SQL pipelines across Salesforce and internal platforms.',
          `Full end-to-end lifecycle ownership (${betfair?.period ?? 'Mar 2022 – Jan 2027'}) from discovery through CI/CD & hypercare.`,
        ],
      },
      engineer: {
        summary:
          'Deterministic RPA & SQL/API extraction paired with Maestro orchestration and schema-validated LLM synthesis.',
        bullets: [
          'UiPath Maestro orchestrates core REFramework/API extraction flows feeding a schema-validated LLM summarizer in Studio Web.',
          'Deterministic SQL arithmetic computed in Redshift prior to LLM input to prevent numerical hallucinations with zero external PII egress.',
          'Interactive Nominal vs. Guardrail/Failure architecture diagram available on the full case study page.',
        ],
      },
      stack: [
        'UiPath Maestro',
        'REFramework',
        'Python',
        'REST APIs',
        'SQL / Redshift',
        'LLM Agents',
      ],
      actions: [
        {
          type: 'route',
          label: 'Inspect Interactive Architecture →',
          href: withBase('/projects/enterprise-agentic-review/'),
          primary: true,
        },
        { type: 'route', label: 'View Role in Resume', href: withBase('/resume/#experience'), primary: false },
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
      readoutSummary:
        quadyxProj?.data.summary ??
        'Co-founded UAV autonomy venture: spatial algorithms (ORB-SLAM3 + Depth V2), camera–IMU calibration & precision landing.',
      href: withBase('/projects/quadyx-autonomy/'),
      glyphId: 'uav',
      stats: [
        { label: 'ROLE', value: 'Co-Founder · Autonomy' },
        { label: 'ALGORITHMS', value: 'ORB-SLAM3 + Depth V2' },
        { label: 'CALIBRATION', value: 'Camera–IMU · Precision Land' },
      ],
      recruiter: {
        summary:
          quadyxProj?.data.summary ??
          'Technical side venture building autonomous drone perception algorithms, calibrated camera–IMU sensing, and visual precision landing over ROS 2.',
        bullets: (quadyxExp?.highlights ?? []).map((h) => h.text),
      },
      engineer: {
        summary:
          'Hybrid C++/Python autonomy runtime uniting calibrated visual-inertial perception, monocular depth algorithms, and optical-flow precision landing.',
        bullets: [
          'Algorithms: ORB-SLAM3 localization fused with Depth Anything V2 monocular depth and OpenCV point-cloud obstacle clustering.',
          'Sensor calibration: synchronized camera–IMU spatial alignment for stable onboard pose estimation and Gazebo validation.',
          'Precision landing & failover: hybrid ORB + Lucas-Kanade optical-flow target tracking plus automatic GSM/IP telemetry failover.',
        ],
      },
      stack: quadyxProj?.data.stack ?? ['ROS 2', 'ORB-SLAM3', 'Depth Anything V2', 'C++', 'Python', 'OpenCV'],
      actions: [
        {
          type: 'route',
          label: 'Inspect Interactive Architecture →',
          href: withBase('/projects/quadyx-autonomy/'),
          primary: true,
        },
        { type: 'external', label: 'Visit quadyx.com ↗', href: SITE.quadyxUrl, primary: false },
      ],
    },
    {
      id: 'electrocasnicu',
      category: 'AGENTIC AI',
      iconKey: 'rag',
      title: 'ElectrocasNicu',
      cardSummary: 'Agentic AI RAG chat for appliance manuals & warranties — hybrid search with exact page citations',
      chips: ['ChromaDB', 'Pydantic'],
      proof: 'Agentic RAG · Cited',
      readoutSummary:
        'Agentic AI RAG chat assistant for home-appliance manuals & warranties with ChromaDB + BM25 hybrid retrieval and cited page proof.',
      href: withBase('/projects/electrocasnicu-rag/'),
      glyphId: 'rag',
      stats: [
        { label: 'SYSTEM', value: 'Agentic AI RAG Chat' },
        { label: 'RETRIEVAL', value: 'ChromaDB + BM25 Hybrid' },
        { label: 'GROUNDING', value: 'Exact Page Citations' },
      ],
      recruiter: {
        summary:
          'Independently engineered Agentic AI RAG chat assistant for home-appliance manuals and warranties, delivering verified answers with exact page citations and refusal guardrails.',
        bullets: [
          'Natural-language AI chat that inspects uploaded PDF/TXT appliance manuals and warranties to answer repair and model questions safely.',
          'Eliminates unsafe hallucinations by anchoring every instruction to cited document pages and refusing cleanly when evidence is missing.',
          'Backed by automated pytest checks validating tool routing, retrieval contracts, and citation integrity.',
        ],
      },
      engineer: {
        summary:
          'Decoupled offline indexing and Streamlit Agentic AI chat runtime combining local ChromaDB vectors + BM25 lexical search under Pydantic tool schemas.',
        bullets: [
          'Page-aware PDF ingestion and multilingual embeddings in local ChromaDB fused with BM25 keyword retrieval.',
          'Typed Pydantic function calling routes model lookups, safety constraints, and citation verification before rendering answers.',
          'Inspect Nominal retrieval vs. Refusal Guardrail flows in the full interactive architecture diagram.',
        ],
      },
      stack: ragProj?.data.stack ?? ['Python', 'ChromaDB', 'Pydantic', 'Streamlit', 'RAG', 'pytest'],
      actions: [
        {
          type: 'route',
          label: 'Inspect Interactive Architecture →',
          href: withBase('/projects/electrocasnicu-rag/'),
          primary: true,
        },
        {
          type: 'external',
          label: 'Source Repo ↗',
          href: ragProj?.data.repoUrl ?? 'https://github.com/Mr-Span/SpanClaudiu_ElectrocasNicu',
          primary: false,
        },
      ],
    },
    {
      id: 'agri-rover',
      category: 'MECHATRONICS',
      iconKey: 'rover',
      title: 'Agri-Rover',
      cardSummary: 'Completed BSc orchard rover · GPS/IMU C++ guidance',
      chips: ['C++', 'Embedded'],
      proof: 'UTCN BSc · C++',
      readoutSummary:
        roverProj?.data.summary ??
        'Completed BSc Robotics orchard navigation rover fusing GPS & IMU compass via embedded C++ Haversine guidance.',
      href: withBase('/projects/#agri-rover'),
      glyphId: 'rover',
      stats: [
        { label: 'STATUS', value: 'Completed Prototype' },
        { label: 'NAVIGATION', value: 'GPS + IMU Haversine' },
        { label: 'DEGREE', value: 'UTCN BSc Robotics' },
      ],
      recruiter: {
        summary:
          roverProj?.data.summary ??
          'Completed autonomous orchard navigation rover prototype built end to end as my UTCN BSc Robotics thesis.',
        bullets: [
          'Full mechanical, electrical, and embedded C++ ownership from physical assembly to autonomous outdoor navigation.',
          'Navigated multi-point GPS routes while streaming environmental telemetry over Bluetooth.',
          'Showcased alongside 4 additional AI, automation, and client web builds on /projects/.',
        ],
      },
      engineer: {
        summary:
          'Closed-loop embedded C++ navigation controller fusing asynchronous GPS fixes with digital magnetometer headings.',
        bullets: [
          'Implemented great-circle Haversine distance and target bearing calculations directly in C++ firmware.',
          'Complementary heading stabilization reduces magnetometer drift during differential-drive turns.',
          'Bluetooth telemetry link paired with hardware failsafe motor stop on signal loss.',
        ],
      },
      stack: roverProj?.data.stack ?? ['C++', 'Embedded Systems', 'GPS / IMU Fusion', 'Mechatronics'],
      actions: [
        { type: 'route', label: 'View in Projects Showcase →', href: withBase('/projects/#agri-rover'), primary: true },
        { type: 'route', label: 'UTCN Education & Thesis', href: withBase('/resume/#education'), primary: false },
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
      readoutSummary: `${resume.certifications.length} verified certifications (AWS AIF-C01, UiPath Advanced, NVIDIA, Simplilearn, Veoneer) · Languages: RO · EN · DE`,
      href: withBase('/resume/#certifications'),
      glyphId: 'terminal',
      stats: [
        { label: 'CERTIFIED', value: `${resume.certifications.length} Verified Credentials` },
        { label: 'LANGUAGES', value: 'RO · EN · DE' },
        { label: 'DIRECT', value: resume.profile.email },
      ],
      recruiter: {
        summary:
          'Verified technical credentials, spoken languages (RO, EN, DE), and zero-friction direct contact channels — instant ATS PDF access.',
        bullets: [
          'AWS Certified AI Practitioner (AIF-C01), UiPath Advanced RPA Developer, NVIDIA Fundamentals of Deep Learning, Veoneer ML.',
          "Simplilearn AI Engineer Master's Program (TensorFlow, ML & Python), plus Python & Agentic AI Engineering (Școala Informala de IT).",
          `Languages: RO · EN · DE · Direct email: ${resume.profile.email} (${resume.profile.location}).`,
        ],
      },
      engineer: {
        summary:
          'Full stack matrix across Applied AI, Enterprise Automation, Backend/Web Software, and Cyber-Physical Robotics — plus machine-readable /llms.txt.',
        bullets: resume.skillGroups.map((g) => `${g.title}: ${g.items.slice(0, 6).join(', ')}`),
      },
      stack: ['AWS AIF-C01', 'UiPath Advanced', 'NVIDIA DL', 'Python', 'C++', 'ROS 2'],
      actions: [
        { type: 'copy-email', label: 'Copy Email', primary: true },
        {
          type: 'route',
          label: `All ${resume.certifications.length} Certifications →`,
          href: withBase('/resume/#certifications'),
          primary: false,
        },
        { type: 'external', label: 'LinkedIn ↗', href: SITE.linkedinUrl, primary: false },
      ],
    },
  ];
}
