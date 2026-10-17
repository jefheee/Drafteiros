import type { Metadata } from 'next';
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
  title: 'DraftClub PRO • Tactical Obsidian & Pitch Edition (EA FC 26)',
  description:
    'Plataforma E-sports de EA FC 26 Pro Clubs: Cartas FC 26 Ultimate Team, Tabela & Mata-Mata, Súmula IA Vision, Estúdio 4:5 e Sala de Draft.',
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
      <body className="bg-[#F5F6FA] dark:bg-[#0c0e12] text-[#18181B] dark:text-[#f1f3f9] antialiased min-h-screen flex flex-col overflow-x-hidden max-w-[100vw] selection:bg-[#7C5CFC] selection:text-white transition-colors">
        <AuthProvider>
          <Header />
          <div className="flex-1 w-full max-w-[100vw] overflow-x-hidden pb-28 lg:pb-12">
            {children}
          </div>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
