import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { AuthProvider } from '@/components/auth/auth-context';

export const metadata: Metadata = {
  title: 'DraftClub • Jogueiros PRO Edition (EA FC 26 5x5 & 11v11)',
  description:
    'Aplicativo de gestão de times e ligas de EA FC 26 Pro Clubs: Súmula por Foto (IA Vision OCR), Tinder de Horários, Banners Automáticos e Caixa do Time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#F5F6FA] dark:bg-zinc-950 text-[#18181B] dark:text-zinc-100 antialiased min-h-screen flex flex-col selection:bg-[#7C5CFC] selection:text-white transition-colors">
        <AuthProvider>
          <Header />
          <div className="flex-1 pb-28">{children}</div>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
