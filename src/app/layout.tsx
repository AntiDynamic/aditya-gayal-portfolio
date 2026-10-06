import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import "lenis/dist/lenis.css";
import { SoundtrackProvider } from "@/components/soundtrack/soundtrack-player";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aditya Gayal — Strange Questions. Useful Systems.",
  description:
    "Aditya Gayal is a developer who loves exploring ideas through code, working with others, and turning unusual questions into useful systems.",
  openGraph: {
    title: "Aditya Gayal — Strange Questions. Useful Systems.",
    description: "Developer / builder / experimenter. Strange questions, shared work, useful systems.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body><SoundtrackProvider>{children}</SoundtrackProvider></body>
    </html>
  );
}
