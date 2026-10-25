import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/auth-context';
import { LeagueDataProvider } from '@/lib/data-store';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { PwaRegisterAndGatekeeper } from '@/components/pwa-register';
import { ClickSpark } from '@/components/react-bits/click-spark';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0D0D0F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://drafteiros.vercel.app'),
  title: 'Drafteiros — Campeonatos, Draft e Gestão de Equipes',
  description:
    'Plataforma oficial de campeonatos, draft, súmula por IA e gestão de elencos.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Drafteiros',
  },
  openGraph: {
    title: 'Drafteiros — Campeonatos, Draft e Gestão de Equipes',
    description:
      'Plataforma oficial de campeonatos, draft, súmula por IA e gestão de elencos.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1376,
        height: 768,
        alt: 'Drafteiros',
      },
    ],
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${jakarta.variable} ${inter.variable} ${jetbrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased bg-[#0D0D0F] text-[#F4F4F5] min-h-screen flex flex-col selection:bg-white/20 selection:text-white">
        <AuthProvider>
          <LeagueDataProvider>
            <PwaRegisterAndGatekeeper>
              <ClickSpark sparkColor="#FFFFFF" sparkCount={8} sparkRadius={26}>
                <Header />
                <div className="flex-1 flex flex-col">{children}</div>
                <BottomNav />
              </ClickSpark>
            </PwaRegisterAndGatekeeper>
          </LeagueDataProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
