import React from 'react';
import { Header } from '../components/home/Header';
import { Hero } from '../components/home/Hero';
import { ProjectObjective } from '../components/home/ProjectObjective';
import { ProblemSection } from '../components/home/ProblemSection';
import { SolutionSection } from '../components/home/SolutionSection';
import { HowItWorks } from '../components/home/HowItWorks';
import { TargetAudience } from '../components/home/TargetAudience';
import { FinalCTA } from '../components/home/FinalCTA';
import { Footer } from '../components/home/Footer';

export const HomePage: React.FC = () => {
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
};
