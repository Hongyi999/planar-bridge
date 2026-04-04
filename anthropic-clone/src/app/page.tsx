import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ClaudeSection } from '@/components/ClaudeSection';
import { ResearchSection } from '@/components/ResearchSection';
import { SafetySection } from '@/components/SafetySection';
import { NewsSection } from '@/components/NewsSection';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ClaudeSection />
        <ResearchSection />
        <SafetySection />
        <NewsSection />
      </main>
      <Footer />
    </>
  );
}
