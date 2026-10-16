import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { AuthProvider } from '@/components/auth/auth-context';

export const metadata: Metadata = {
  title: 'DraftClub PRO • Gestão Inteligente de Ligas EA FC 26 (5x5 & 11v11)',
  description:
    'Plataforma Mobile-First para Ligas de EA FC 26 Pro Clubs: Tinder de Horários, Súmula com IA Gemini Vision OCR, Dupla Validação Anti-Fraude, Estúdio Criativo de Banners e ERP Financeiro.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-slate-950 text-slate-50 antialiased min-h-screen flex flex-col selection:bg-cyan-500 selection:text-slate-950">
        <AuthProvider>
          <Header />
          <div className="flex-1 pb-20 md:pb-6">{children}</div>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
