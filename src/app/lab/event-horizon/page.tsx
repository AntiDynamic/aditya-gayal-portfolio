import type { Metadata } from "next";
import { EventHorizon } from "@/components/event-horizon/event-horizon";
import { ExperienceGate } from "@/components/room/experience-gate";
import { PortfolioContent } from "@/components/portfolio-content";
export const metadata: Metadata={title:"Event Horizon of a Question — Aditya Gayal",robots:{index:false,follow:false}};
export default function EventHorizonLab(){return <ExperienceGate blackHole={<EventHorizon bridge />}><PortfolioContent /></ExperienceGate>;}
