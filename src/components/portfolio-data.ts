export type WorkId = string;

export type WorkItem = {
  id: WorkId;
  name: string;
  descriptor: string;
  description: string;
  href: string;
  repositoryOwner: string;
  createdAt: string;
  featured: boolean;
  sourceHrefs: readonly string[];
  boundary?: string;
  visual?: { src: `/${string}`; alt: string; credit?: string; creditHref?: string };
  role?: string;
  liveHref?: string;
  caseStudyHref?: string;
  accent?: string;
};

export type PortfolioLink = {
  id: string;
  label: string;
  href: string;
};

export const work: readonly WorkItem[] = [
  {
    id: "continuum",
    visual: { src: "/media/work/continuum.webp", alt: "An editorial documentation excerpt showing Continuum's real index, search, report, and outcome commands." },
    name: "Continuum",
    descriptor: "Coding-agent context and observability",
    description:
      "A vendor-neutral system for observing AI coding agents, recording run evidence locally, and indexing repository context for search and retrieval.",
    href: "https://github.com/AntiDynamic/Continuum",
    repositoryOwner: "AntiDynamic",
    createdAt: "2026-07-11T22:37:12Z",
    featured: true,
    sourceHrefs: [
      "https://github.com/AntiDynamic/Continuum/blob/d5b104453302a33148be7b117ec2613b26aba2ed/README.md",
    ],
    boundary:
      "Records evidence exposed by agent adapters; it does not read private model reasoning. Context token counts are estimates, not billing totals.",
  },
  {
    id: "tracepilot",
    visual: { src: "/media/work/tracepilot.webp", alt: "The actual TracePilot repair workbench interface in its offline idle state." },
    name: "TracePilot",
    descriptor: "Trace-informed diagnosis and repair",
    description:
      "A Gemini CLI fork with Phoenix tracing, MCP self-introspection, repair-memory retrieval, safety gates, redaction, and a verified broken-repository repair demo.",
    href: "https://github.com/priyanshuchawda/tracepilot-gemini-cli",
    repositoryOwner: "priyanshuchawda",
    createdAt: "2026-05-11T17:33:36Z",
    featured: true,
    sourceHrefs: [
      "https://github.com/priyanshuchawda/tracepilot-gemini-cli/blob/e834ca4ae1001e5e628398ce4a4b0292198bcbac/README.md",
    ],
    boundary:
      "The repository documents a repair demo and product foundation; production readiness for arbitrary repositories is not established. A personal contribution role is not specified here.",
  },
  {
    id: "netranagar",
    visual: { src: "/media/work/netranagar.webp", alt: "The actual NagarNetra public application map, with monitoring data marked unavailable.", credit: "Map data © OpenStreetMap contributors", creditHref: "https://www.openstreetmap.org/copyright" },
    name: "NetraNagar",
    descriptor: "Local pollution reporting and civic workflows",
    description:
      "A public application build for reporting visible local pollution hotspots, with citizen and drone-reporting interfaces and municipal verification workflows.",
    href: "https://github.com/AntiDynamic/NetraNagar-public",
    repositoryOwner: "AntiDynamic",
    createdAt: "2026-09-30T17:55:47Z",
    featured: true,
    sourceHrefs: [
      "https://github.com/AntiDynamic/NetraNagar-public/blob/6d926f291308587e9040fc56370c98de5b6cc8e6/dist/index.html",
      "https://github.com/AntiDynamic/NetraNagar-public/blob/6d926f291308587e9040fc56370c98de5b6cc8e6/dist/assets/DroneReportingPage-C-eDfrpG.js",
      "https://github.com/AntiDynamic/NetraNagar-public/blob/6d926f291308587e9040fc56370c98de5b6cc8e6/dist-server/routes/reports.js",
    ],
    boundary:
      "The public build uses the name NagarNetra. Published interfaces do not establish live municipal deployment or physical drone operation.",
  },
  {
    id: "video",
    name: "AI Video Editor",
    descriptor: "Local editing with an AI assistant",
    description:
      "QuickCut, an Electron desktop video editor with a multi-track timeline, subtitles, local transcription, FFmpeg export, and an AI assistant for planning and executing supported edits.",
    href: "https://github.com/AntiDynamic/video",
    repositoryOwner: "AntiDynamic",
    createdAt: "2026-05-10T09:14:09Z",
    featured: false,
    sourceHrefs: [
      "https://github.com/AntiDynamic/video/blob/dadd8ab83c2a24cf40d65c90978189928f2da102/README.md",
    ],
  },
  {
    id: "browser",
    name: "AI4Browser",
    descriptor: "Navigation and download threat inspection",
    description:
      "An Electron browser whose documented threat-analysis pipeline combines local rules, Gemini analysis, and VirusTotal checks for URLs, navigation events, and downloads.",
    href: "https://github.com/AntiDynamic/browser4all",
    repositoryOwner: "AntiDynamic",
    createdAt: "2026-05-10T09:14:13Z",
    featured: false,
    sourceHrefs: [
      "https://github.com/AntiDynamic/browser4all/blob/a617baeafcfb6d8fb106120c19fab7ffcd886348/README.md",
    ],
    boundary:
      "The README names the project AI Secure Browser. Its accuracy and performance claims have not been independently verified.",
  },
];

export const featuredWork: readonly WorkItem[] = work.filter((item) => item.featured);

export const links: readonly PortfolioLink[] = [
  { id: "email", label: "gayaladitya9@gmail.com", href: "mailto:gayaladitya9@gmail.com" },
  { id: "github", label: "GitHub", href: "https://github.com/AntiDynamic" },
  { id: "linkedin", label: "LinkedIn", href: "https://in.linkedin.com/in/adityagayal" },
];
