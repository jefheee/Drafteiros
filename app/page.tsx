'use client';

import React from 'react';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingMarquee } from '@/components/landing/landing-marquee';
import { LandingComparison } from '@/components/landing/landing-comparison';
import { LandingTargetAudience } from '@/components/landing/landing-target-audience';
import { LandingFeatures } from '@/components/landing/landing-features';
import { LandingBannerStudioPreview } from '@/components/landing/landing-banner-studio-preview';
import { LandingTestimonials } from '@/components/landing/landing-testimonials';
import { LandingFaq } from '@/components/landing/landing-faq';
import { LandingCta } from '@/components/landing/landing-cta';
import { LandingFooter } from '@/components/landing/landing-footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0c0e12] text-[#f1f3f9] selection:bg-[#00E599] selection:text-zinc-950 flex flex-col overflow-x-hidden">
      {/* 1. Header / Navbar com Login e PWA */}
      <LandingNavbar />

      <main className="flex-1 w-full flex flex-col">
        {/* 2. Hero Section com Grid Motion do React Bits */}
        <LandingHero />

        {/* 3. Ticker Bar Infinito */}
        <LandingMarquee />

        {/* 4. Como Funciona: O Problema vs A Solução */}
        <LandingComparison />

        {/* 5. Para Quem Ele É Feito (Público-Alvo) */}
        <LandingTargetAudience />

        {/* 6. A Infraestrutura Completa da Competição */}
        <LandingFeatures />

        {/* 7. Estúdio de Banners 4:5 Integrado (Showcase Interativo) */}
        <LandingBannerStudioPreview />

        {/* 8. Depoimentos Reais da Comunidade */}
        <LandingTestimonials />

        {/* 9. Perguntas Frequentes (FAQ) */}
        <LandingFaq />

        {/* 10. Call to Action Final */}
        <LandingCta />
      </main>

      {/* 11. Rodapé Untitled UI */}
      <LandingFooter />
    </div>
  );
}
