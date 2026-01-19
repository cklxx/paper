import BackdropCanvas from "../components/BackdropCanvas";
import Hero from "../components/home/Hero";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col relative">
      <BackdropCanvas />
      <Hero />
    </main>
  );
}
