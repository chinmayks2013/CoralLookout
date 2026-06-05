import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { Mission } from "@/components/home/Mission";
import { BusinessTeaser } from "@/components/home/BusinessTeaser";
import { HackathonPitch } from "@/components/hackathon/HackathonPitch";
import { HackathonDemoPath } from "@/components/hackathon/HackathonDemoPath";
import { HackathonStack } from "@/components/hackathon/HackathonStack";
import { isHackathonMode } from "@/lib/hackathon/config";

export default function Home() {
  const hackathon = isHackathonMode();

  return (
    <>
      <Hero />
      {hackathon ? (
        <>
          <HackathonPitch />
          <HackathonDemoPath />
          <HackathonStack />
        </>
      ) : null}
      <Features />
      <Mission />
      {!hackathon && <BusinessTeaser />}
    </>
  );
}
