"use client";
import { createContext, useContext, type MutableRefObject } from "react";
export type HeroBinding = {
  motion: MutableRefObject<{ progress: number; velocity: number }>;
  visible: MutableRefObject<boolean>;
  bounds: MutableRefObject<{
    left: number;
    top: number;
    width: number;
    height: number;
  }>;
  selected: MutableRefObject<number>;
};
export type WorldRuntime = {
  hero: HeroBinding | null;
  invalidate: (() => void) | null;
  passage: number;
};
export const WorldContext = createContext<{
  runtime: MutableRefObject<WorldRuntime>;
  ready: boolean;
  bindHero: (binding: HeroBinding | null) => void;
  wake: () => void;
} | null>(null);
export const useWorld = () => useContext(WorldContext);
