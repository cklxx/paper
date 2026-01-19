import BackdropCanvas from "../components/BackdropCanvas";
import FeatureGrid from "../components/home/FeatureGrid";
import Hero from "../components/home/Hero";
import SystemOnline from "../components/home/SystemOnline";
import Timeline from "../components/home/Timeline";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col relative">
      <BackdropCanvas />
      <Hero />
      <Timeline />
      <FeatureGrid />
      <SystemOnline />
    </main>
  );
}
