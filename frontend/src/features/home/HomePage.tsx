import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProjectObjective } from './components/ProjectObjective';
import { ProblemSection } from './components/ProblemSection';
import { SolutionSection } from './components/SolutionSection';
import { HowItWorks } from './components/HowItWorks';
import { TargetAudience } from './components/TargetAudience';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';

export function HomePage() {
  return (
    <div className="home-page">
      <Header />
      <main>
        <Hero />
        <ProjectObjective />
        <ProblemSection />
        <SolutionSection />
        <HowItWorks />
        <TargetAudience />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
