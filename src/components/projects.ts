export type Project = {
  id: string;
  number: string;
  name: string;
  descriptor: string;
  href: string;
  color: string;
  index: number;
};

export const projects: Project[] = [
  {
    id: "continuum",
    number: "01",
    name: "Continuum",
    descriptor: "time / traces / memory",
    href: "https://github.com/AntiDynamic/Continuum",
    color: "#173fb8",
    index: 0,
  },
  {
    id: "tracepilot",
    number: "02",
    name: "TracePilot",
    descriptor: "diagnosis / repair / safety",
    href: "https://github.com/priyanshuchawda/tracepilot-gemini-cli",
    color: "#c62942",
    index: 1,
  },
  {
    id: "netranagar",
    number: "03",
    name: "NetraNagar",
    descriptor: "civic signals / city / drones",
    href: "https://github.com/AntiDynamic/NetraNagar-public",
    color: "#f16832",
    index: 2,
  },
  {
    id: "video",
    number: "04",
    name: "AI Video Editor",
    descriptor: "clips / cuts / sequencing",
    href: "https://github.com/AntiDynamic/video",
    color: "#c5e53c",
    index: 3,
  },
  {
    id: "browser",
    number: "05",
    name: "AI4Browser",
    descriptor: "browser layers / inspection / security",
    href: "https://github.com/AntiDynamic/browser4all",
    color: "#20bed0",
    index: 4,
  },
];
