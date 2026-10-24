import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { AuthProvider } from '@/components/auth/auth-context';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-jakarta',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: 'DraftClub PRO • Plataforma Oficial de EA FC 26 Pro Clubs',
  description:
    'Sua liga de Pro Clubs sem discussão no WhatsApp. Súmula com IA Vision por foto, Estúdio de Banners 4:5 pro Instagram, Sala de Draft estilo NBA e Gestão Financeira transparente.',
  manifest: '/manifest.json',
  icons: {
    icon: '/assets/awards/1st-place.png',
    apple: '/assets/awards/1st-place.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#00E599',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`dark overflow-x-hidden max-w-[100vw] ${jakarta.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-[#0c0e12] text-[#f1f3f9] antialiased min-h-screen flex flex-col overflow-x-hidden max-w-[100vw] selection:bg-[#00E599] selection:text-zinc-950">
        <AuthProvider>
          <Header />
          <div className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
            {children}
          </div>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
