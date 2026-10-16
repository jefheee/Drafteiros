'use client';

import React from 'react';
import { useSquad } from '@/components/builder/squad-context';
import { getEAStatColor, cn } from '@/lib/utils';
import { X, UserPlus } from 'lucide-react';

export function Pitch() {
  const {
    gameMode,
    slots,
    assignments,
    sixthManReserve,
    selectedBenchPlayer,
    assignPlayerToSlot,
    removePlayerFromSlot,
  } = useSquad();

  return (
    <div className="w-full max-w-[560px] mx-auto space-y-3">
      {/* Gramado Tático (5v5 Rush Arena ou 11v11 Oficial) */}
      <div
        className={cn(
          'relative w-full aspect-[3/4] rounded-2xl p-4 sm:p-6 border select-none overflow-hidden transition-colors',
          gameMode === '5v5'
            ? 'bg-[#081c19] border-cyan-500/40 shadow-lg'
            : 'bg-[#0b1d12] border-slate-800'
        )}
      >
        {/* Selo de Modo no Topo do Campo */}
        <div className="absolute top-2.5 right-3 z-20 px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-slate-800 text-[10px] font-mono font-bold text-cyan-400">
          {gameMode === '5v5' ? '⚡ ARENA 5x5 RUSH (5 + 1)' : '🏟️ CAMPO OFICIAL 11v11'}
        </div>

        {/* Linhas Táticas Minimalistas em Branco Sólido Fosco */}
        <div className="relative w-full h-full border border-white/25 rounded-lg pointer-events-none flex flex-col justify-between">
          {/* Grande e Pequena Área Superior */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[16%] border-b border-x border-white/25 rounded-b-sm">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 border-b border-x border-white/25" />
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/40" />
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-10 h-5 border-b border-white/25 rounded-b-full" />
          </div>

          {/* Linha Central e Círculo do Meio de Campo */}
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/25 -translate-y-1/2 flex items-center justify-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-white/25 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
            </div>
          </div>

          {/* Grande e Pequena Área Inferior */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[16%] border-t border-x border-white/25 rounded-t-sm">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 border-t border-x border-white/25" />
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/40" />
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-5 border-t border-white/25 rounded-t-full" />
          </div>

          {/* Cantos */}
          <div className="absolute top-0 left-0 w-3 h-3 border-b border-r border-white/25 rounded-br-full" />
          <div className="absolute top-0 right-0 w-3 h-3 border-b border-l border-white/25 rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-t border-r border-white/25 rounded-tr-full" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-t border-l border-white/25 rounded-tl-full" />
        </div>

        {/* Slots dos Atletas Titulares */}
        <div className="absolute inset-0 p-3 sm:p-5 pointer-events-auto">
          {slots.map((slot) => {
            const assigned = assignments[slot.slotId];
            const isSlotActive = !!selectedBenchPlayer;
            const statColor = assigned ? getEAStatColor(assigned.overall_score || 75) : null;

            return (
              <div
                key={slot.slotId}
                style={{
                  left: `${slot.xPercent}%`,
                  top: `${slot.yPercent}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={() =>
                  selectedBenchPlayer && assignPlayerToSlot(slot.slotId, selectedBenchPlayer)
                }
                className={cn(
                  'absolute flex flex-col items-center group cursor-pointer transition-transform duration-150',
                  isSlotActive && !assigned && 'scale-105'
                )}
              >
                {assigned ? (
                  /* Card do Atleta Escalado */
                  <div className="relative flex flex-col items-center">
                    <div
                      className={cn(
                        'w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex flex-col items-center justify-center border bg-slate-950 border-slate-800 transition-transform group-hover:scale-105 shadow-md',
                        statColor?.border || 'border-slate-800'
                      )}
                    >
                      <span
                        className={cn(
                          'text-xs font-bold font-mono leading-none',
                          statColor?.text
                        )}
                      >
                        {assigned.overall_score > 0 ? assigned.overall_score : '82'}
                      </span>
                      <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-tight mt-0.5">
                        {slot.positionCode}
                      </span>

                      {/* Botão Remover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePlayerFromSlot(slot.slotId);
                        }}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-900 hover:bg-rose-950 border border-slate-700 text-slate-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    {/* Nome do Atleta */}
                    <div className="mt-1 px-2 py-0.5 rounded-md bg-slate-950/95 border border-slate-800 text-[9px] font-bold text-slate-100 whitespace-nowrap max-w-[85px] sm:max-w-[95px] truncate">
                      {assigned.name}
                    </div>
                  </div>
                ) : (
                  /* Slot Vazio */
                  <div className="flex flex-col items-center justify-center">
                    <div
                      className={cn(
                        'w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-dashed flex items-center justify-center transition-all',
                        isSlotActive
                          ? 'border-cyan-400 bg-cyan-950/70 text-cyan-300 scale-105'
                          : 'border-white/30 bg-slate-950/75 text-slate-300 hover:border-cyan-400'
                      )}
                    >
                      <span className="text-[10px] font-extrabold tracking-wider">
                        {slot.positionCode}
                      </span>
                    </div>
                    <span className="text-[8px] font-semibold text-slate-300 bg-slate-950/90 px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap border border-slate-800">
                      {slot.displayName}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Slot Especial do 6º Jogador (1 Reserva Oficial da Liga 5x5) */}
      {gameMode === '5v5' && (
        <div
          onClick={() =>
            selectedBenchPlayer && assignPlayerToSlot('reserve_6th', selectedBenchPlayer)
          }
          className={cn(
            'p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer',
            selectedBenchPlayer
              ? 'bg-cyan-950/30 border-cyan-500/60'
              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">
              6º
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-100 block">
                6º Jogador — Reserva Imediato (Regra 5x5: 5 Titulares + 1 Reserva)
              </span>
              <span className="text-[11px] text-slate-400">
                {sixthManReserve
                  ? `Escalado no banco: ${sixthManReserve.name} (${sixthManReserve.archetype})`
                  : 'Selecione um atleta da lista e toque aqui para defini-lo como o 6º jogador'}
              </span>
            </div>
          </div>

          {sixthManReserve ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removePlayerFromSlot('reserve_6th');
              }}
              className="min-h-[36px] px-3 py-1 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold"
            >
              Remover
            </button>
          ) : (
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
              <UserPlus className="w-4 h-4" /> Vaga Aberta
            </span>
          )}
        </div>
      )}
    </div>
  );
}
