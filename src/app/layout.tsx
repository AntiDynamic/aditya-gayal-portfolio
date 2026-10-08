import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import "lenis/dist/lenis.css";
import { SoundtrackProvider } from "@/components/soundtrack/soundtrack-player";
import { siteUrl } from "@/lib/site-url";

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
  metadataBase: siteUrl,
  alternates: siteUrl ? { canonical: "/" } : undefined,
  title: "Aditya Gayal",
  description:
    "I like making things and figuring out why they don’t work yet.",
  openGraph: {
    title: "Aditya Gayal",
    description: "I like making things and figuring out why they don’t work yet.",
    type: "website",
    url: siteUrl,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body><a className="skip-content" href="#work">Skip to portfolio content</a><SoundtrackProvider>{children}</SoundtrackProvider></body>
    </html>
  );
}
