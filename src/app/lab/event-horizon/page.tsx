import type { Metadata } from "next";
import { EventHorizon } from "@/components/event-horizon/event-horizon";
export const metadata: Metadata={title:"Event Horizon of a Question — Aditya Gayal",robots:{index:false,follow:false}};
export default function EventHorizonLab(){return <EventHorizon />;}
