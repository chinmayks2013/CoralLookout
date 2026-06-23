import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { Mission } from "@/components/home/Mission";
import { LeadershipSpotlight } from "@/components/home/LeadershipSpotlight";
import { BusinessTeaser } from "@/components/home/BusinessTeaser";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Mission />
      <LeadershipSpotlight />
      <BusinessTeaser />
    </>
  );
}
