'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-context';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingFeatures } from '@/components/landing/landing-features';
import { LandingFaq } from '@/components/landing/landing-faq';
import { LandingCta } from '@/components/landing/landing-cta';
import { LandingFooter } from '@/components/landing/landing-footer';
import {
  isStandalonePwa,
  MobilePwaInstallScreen,
} from '@/components/pwa-register';

export default function LandingPage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isMobileBrowser, setIsMobileBrowser] = useState(false);

  useEffect(() => {
    setMounted(true);

    const standalone = isStandalonePwa();
    if (standalone) {
      if (!loading) {
        if (session) {
          router.replace(session.onboardingCompleted ? '/dashboard' : '/onboarding');
        } else {
          router.replace('/login');
        }
      }
      return;
    }

    const checkMobile = () => {
      setIsMobileBrowser(window.innerWidth < 768 && !isStandalonePwa());
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [session, loading, router]);

  if (mounted && isMobileBrowser) {
    return <MobilePwaInstallScreen />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <LandingNavbar />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingFaq />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
