import { ExperienceGate } from "@/components/room/experience-gate";
import { EventHorizon } from "@/components/event-horizon/event-horizon";
import { PortfolioContent } from "@/components/portfolio-content";

export default function Home() {
  return <ExperienceGate blackHole={<EventHorizon bridge />}><PortfolioContent /></ExperienceGate>;
}
