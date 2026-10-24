'use client';

import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export function LandingTestimonials() {
  const testimonials = [
    {
      name: 'Elite Pro Style',
      role: 'Administrador de Liga • 32 Equipes',
      avatar: '/assets/archetypes/Defensor/Chefia/Chefia.png',
      quote:
        'Antes do DraftClub, passávamos a madrugada de domingo somando notas e gols em planilhas que travavam. Hoje, os capitães mandam a foto e a IA computa tudo em 15 segundos. Minha vida mudou.',
      verified: 'Liga Ativa há 3 Temporadas',
    },
    {
      name: 'Alan "Tugi"',
      role: 'Capitão da Vorpal Esports',
      avatar: '/assets/archetypes/Atacante/Bruxo/Bruxo.png',
      quote:
        'A sala de draft estilo NBA foi o momento mais marcante do nosso campeonato. Parecia uma transmissão oficial! E os banners 4:5 pro Instagram deram um salto absurdo no nosso engajamento.',
      verified: 'Campeão da Temporada 2',
    },
    {
      name: 'Legionários Team',
      role: 'Gestor de Elenco • 14 Atletas',
      avatar: '/assets/archetypes/Meio-Campista/Maestro/Maestro.png',
      quote:
        'O cruzamento inteligente de horários acabou 100% com discussões de W.O. Os dois capitães marcam quando podem jogar e o app crava a data ideal. Sem mimimi no WhatsApp.',
      verified: 'Mais de 120 Partidas Disputadas',
    },
    {
      name: 'Kaioo Ferras',
      role: 'Atacante (ST) • Artilheiro da Liga',
      avatar: '/assets/archetypes/Goleiro/Muralha/Muralha.png',
      quote:
        'Ter a minha própria Carta FC 26 com OVR, PlayStyles e notas de cada jogo dá uma sensação surreal de jogador profissional. Compartilho meus cards nos stories toda semana!',
      verified: 'Média de Nota 9.1',
    },
  ];

  return (
    <section id="depoimentos" className="py-20 lg:py-28 relative max-w-7xl mx-auto px-4 sm:px-6">
      <div className="space-y-14">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>OPINIÃO DE QUEM JOGA E ORGANIZA</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-tight">
            MAS PREFERIMOS DEIXAR{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-[#00E599]">
              ELES FALAREM.
            </span>
          </h2>

          <p className="text-zinc-400 text-base sm:text-lg">
            Mais de 1.200 clubes e dezenas de ligas já abandonaram as velhas planilhas de WhatsApp.
          </p>
        </div>

        {/* Grid de Depoimentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((test, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-[#14171f] border border-white/[0.08] hover:border-amber-500/30 p-6 flex flex-col justify-between space-y-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/50 group"
            >
              <div className="space-y-4">
                {/* 5 Estrelas */}
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed italic">
                  "{test.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-white/15 bg-white/5 overflow-hidden shrink-0 p-1">
                    <img
                      src={test.avatar}
                      alt={test.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{test.name}</h4>
                    <p className="text-[11px] text-zinc-400 truncate">{test.role}</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{test.verified}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LandingTestimonials;
