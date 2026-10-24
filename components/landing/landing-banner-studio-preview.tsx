'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GlideSelect } from '@/components/react-bits/glide-select';
import { HoloCard } from '@/components/react-bits/holo-card';
import { PeekRating } from '@/components/react-bits/peek-rating';
import { StatusMark } from '@/components/react-bits/status-mark';
import { ClickSpark } from '@/components/react-bits/click-spark';
import {
  Layers,
  Sparkles,
  ArrowRight,
  Download,
  Share2,
  Trophy,
  Swords,
  Flame,
} from 'lucide-react';

export function LandingBannerStudioPreview() {
  const [activeTab, setActiveTab] = useState('matchday');

  const glideOptions = [
    { id: 'matchday', label: '1. Dia de Jogo', icon: <Swords className="w-3.5 h-3.5" /> },
    { id: 'result', label: '2. Placar Final', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'mvp', label: '3. Craque da Rodada', icon: <Flame className="w-3.5 h-3.5" /> },
  ];

  return (
    <section id="estudio-banners" className="py-20 lg:py-28 bg-[#0a0c10] border-y border-white/[0.08] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>ESTÚDIO DE REDES SOCIAIS • 1080 X 1350</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-tight">
            ESTÚDIO DE BANNERS 4:5{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-[#00E599]">
              INTEGRADO.
            </span>
          </h2>

          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto">
            Gere artes personalizadas no formato nativo do Instagram com os escudos dos times, fotos reais dos atletas e placares oficiais. Nunca mais dependa de designer ou templates genéricos do Canva.
          </p>
        </div>

        {/* GlideSelect do React Bits */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <GlideSelect
              options={glideOptions}
              activeId={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </div>

        {/* Card 4:5 com HoloCard do React Bits */}
        <div className="flex justify-center">
          <HoloCard
            glowColor="rgba(124, 92, 252, 0.4)"
            className="w-full max-w-sm sm:max-w-md aspect-[4/5] p-6 sm:p-8 flex flex-col justify-between shadow-2xl shadow-purple-500/10"
          >
            {/* Topo do Banner 4:5 */}
            <div className="flex items-center justify-between relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] sm:text-xs font-mono font-black uppercase text-zinc-200">
                <span className="w-2 h-2 rounded-full bg-[#00E599]" />
                <span>COPA PRO CLUBS • RODADA 4</span>
              </div>
              <StatusMark status="online" label="1080x1350" />
            </div>

            {/* Conteúdo Dinâmico por Aba */}
            <div className="my-auto py-4 relative z-10 text-center space-y-6">
              {activeTab === 'matchday' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="text-xs uppercase tracking-widest text-[#00E599] font-mono font-black">
                    HOJE • 22:30 (AO VIVO NO DISCORD)
                  </div>

                  <div className="flex items-center justify-around gap-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center font-black text-2xl text-emerald-400 shadow-xl">
                        FDP
                      </div>
                      <span className="font-display font-black text-xs sm:text-sm text-white">
                        FURIA DEL PLATA
                      </span>
                    </div>

                    <div className="text-2xl sm:text-3xl font-black font-display text-zinc-500">
                      VS
                    </div>

                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center font-black text-2xl text-amber-400 shadow-xl">
                        CAT
                      </div>
                      <span className="font-display font-black text-xs sm:text-sm text-white">
                        LA CATIMBA
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-zinc-300">
                    Transmissão oficial com narrador & estatísticas computadas ao vivo
                  </div>
                </div>
              )}

              {activeTab === 'result' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-[#00E599] text-xs font-mono font-black uppercase">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>FINAL DE PARTIDA</span>
                  </div>

                  <div className="flex items-center justify-around">
                    <div className="text-center">
                      <div className="font-black text-emerald-400 text-sm">FURIA</div>
                      <div className="text-5xl sm:text-6xl font-mono font-black text-white mt-1">4</div>
                    </div>

                    <div className="text-zinc-600 font-black text-2xl font-mono">:</div>

                    <div className="text-center">
                      <div className="font-black text-amber-400 text-sm">CATIMBA</div>
                      <div className="text-5xl sm:text-6xl font-mono font-black text-zinc-300 mt-1">1</div>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-400 font-mono space-y-1">
                    <div>Gols FDP: Jefhe (14', 38'), Miguel (59'), Teteu (81')</div>
                    <div>Gol CAT: Haalandinho (45')</div>
                  </div>
                </div>
              )}

              {activeTab === 'mvp' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-black uppercase">
                    <Flame className="w-3.5 h-3.5" />
                    <span>CRAQUE DA RODADA #4</span>
                  </div>

                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-20 h-20 rounded-full border-2 border-amber-400/60 p-1 bg-amber-500/10">
                      <img
                        src="/assets/archetypes/Meio-Campista/Maestro/Maestro.png"
                        alt="Craque"
                        className="w-full h-full object-contain filter drop-shadow-md"
                      />
                    </div>
                    <div className="font-display font-black text-lg sm:text-xl text-white">
                      JEFHERSON "JEFHE"
                    </div>
                    <div className="text-xs text-amber-400 font-mono font-bold uppercase tracking-wider">
                      FURIA DEL PLATA • MEIA (MEI)
                    </div>
                    <PeekRating initialValue={5} readonly />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                      <div className="text-lg font-mono font-black text-white">2</div>
                      <div className="text-[10px] text-zinc-400 uppercase font-bold">Gols</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                      <div className="text-lg font-mono font-black text-white">2</div>
                      <div className="text-[10px] text-zinc-400 uppercase font-bold">Assist</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30">
                      <div className="text-lg font-mono font-black text-amber-400">9.8</div>
                      <div className="text-[10px] text-amber-400 uppercase font-bold">Nota IA</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé do Banner */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 relative z-10">
              <span className="font-display font-black text-white tracking-wide">
                DRAFTCLUB.PRO
              </span>
              <span className="text-[11px] text-[#00E599] font-bold">
                Exportação Automática HD
              </span>
            </div>
          </HoloCard>
        </div>

        {/* Botão de Ação */}
        <div className="text-center pt-2">
          <ClickSpark sparkColor="#00E599">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              <Layers className="w-4 h-4 text-[#00E599]" />
              <span>Abrir Estúdio de Banners Completo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </ClickSpark>
        </div>
      </div>
    </section>
  );
}

export default LandingBannerStudioPreview;
