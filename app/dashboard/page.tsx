'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-context';
import { useLeagueStore } from '@/lib/data-store';
import { TEMPLATE_ASSETS } from '@/lib/assets-catalog';
import { FC26PlayerCard } from '@/components/players/fc26-player-card';
import { HoloCard } from '@/components/react-bits/holo-card';
import { FlipCard } from '@/components/react-bits/flip-card';
import { cn } from '@/lib/utils';
import {
  User,
  Shield,
  Calendar,
  Trophy,
  Sparkles,
  Search,
  CheckCircle2,
  Circle,
  ArrowRight,
  Copy,
  Check,
  Users,
  Plus,
} from 'lucide-react';

export default function DashboardPage() {
  const { session } = useAuth();
  const {
    tournament,
    teams,
    players,
    matches,
    standings,
    scorers,
    loading,
  } = useLeagueStore();

  const [copiedLink, setCopiedLink] = useState(false);

  const myPlayer = useMemo(() => {
    if (!session) return players[0] || null;
    return (
      players.find(
        (p) =>
          p.user_id === session.userId ||
          p.character_name?.toLowerCase() ===
            (session.characterName || '').toLowerCase()
      ) || null
    );
  }, [players, session]);

  const myTeam = useMemo(() => {
    if (!session && !myPlayer) return null;
    return (
      teams.find(
        (t) =>
          t.id === myPlayer?.team_id ||
          t.id === session?.teamId ||
          t.captain_id === session?.userId
      ) || null
    );
  }, [teams, myPlayer, session]);

  // Barra de Progresso ("Complete seu perfil")
  const completionSteps = useMemo(() => {
    const hasCharacter = Boolean(myPlayer?.character_name);
    const hasPhoto = Boolean(
      myPlayer?.avatar_face_url &&
        myPlayer.avatar_face_url !== TEMPLATE_ASSETS.avatarPlaceholder
    );
    const hasTeamOrClub = Boolean(myTeam || myPlayer?.team_id);

    return [
      {
        id: 'character',
        title: 'Ficha do Boneco',
        desc: hasCharacter
          ? `${myPlayer?.character_name} (${myPlayer?.primary_position})`
          : 'Cadastre posição, altura e perna boa',
        done: hasCharacter,
        href: hasCharacter ? '/player' : '/onboarding',
      },
      {
        id: 'photo',
        title: 'Foto no Card Pro',
        desc: hasPhoto
          ? 'Foto configurada no card'
          : 'Suba a foto do seu atleta no card',
        done: hasPhoto,
        href: '/player',
      },
      {
        id: 'team',
        title: 'Vínculo com Clube',
        desc: hasTeamOrClub
          ? `Vinculado ao ${myTeam?.name || 'Clube'}`
          : 'Entre com código ou crie um time',
        done: hasTeamOrClub,
        href: hasTeamOrClub ? '/captain' : '/onboarding',
      },
    ];
  }, [myPlayer, myTeam]);

  const completedCount = completionSteps.filter((s) => s.done).length;

  const handleCopyInviteUrl = () => {
    if (typeof window === 'undefined') return;
    const text = myTeam?.invite_code
      ? `Entre no nosso time "${myTeam.name}" no Drafteiros! Acesse ${window.location.origin} e use o código: ${myTeam.invite_code}`
      : `Crie sua conta e seu Card Pro no Drafteiros: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#F4F4F5] px-4 sm:px-6 py-6 pb-28">
      <main className="max-w-6xl mx-auto space-y-6">
        {/* TOPO SOCIAL */}
        <section className="p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#141414] border border-white/[0.12] flex items-center justify-center overflow-hidden shrink-0">
              {myPlayer?.avatar_face_url ? (
                <img
                  src={myPlayer.avatar_face_url}
                  alt={myPlayer.character_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-display font-bold text-xl text-white">
                  {(session?.characterName || session?.fullName || 'DC')
                    .substring(0, 2)
                    .toUpperCase()}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-display font-bold text-white">
                  {myPlayer?.character_name ||
                    session?.characterName ||
                    session?.fullName ||
                    'Bem-vindo ao Drafteiros'}
                </h1>
                {myPlayer?.primary_position && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-black text-[11px] font-bold">
                    {myPlayer.primary_position} • OVR {myPlayer.overall || 82}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#A1A1AA]">
                {myTeam ? (
                  <>
                    Clube atual: <strong className="text-white">{myTeam.name}</strong>
                    {myTeam.invite_code && (
                      <>
                        {' '}
                        • Código:{' '}
                        <span className="font-mono text-white">
                          {myTeam.invite_code}
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  'Agente Livre • Disponível para convites e Sala de Draft'
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyInviteUrl}
              className="h-10 px-4 rounded-full bg-[#141414] hover:bg-zinc-800 border border-white/[0.08] text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Convite Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Convidar Jogadores</span>
                </>
              )}
            </button>

            <Link
              href="/player"
              className="h-10 px-5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <span>Editar Card Pro</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* BARRA DE COMPLETUDE DO PERFIL */}
        <section className="p-5 sm:p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-display font-bold text-white">
                Complete seu perfil ({completedCount}/3)
              </h2>
              <p className="text-xs text-[#A1A1AA]">
                Deixe sua ficha pronta para as partidas oficiais e convocação.
              </p>
            </div>
            <div className="w-28 h-2 rounded-full bg-[#141414] overflow-hidden border border-white/[0.06]">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${(completedCount / 3) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {completionSteps.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="p-4 rounded-2xl bg-[#141414] border border-white/[0.08] hover:border-white/20 transition-all flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-[#A1A1AA] block">
                    {item.desc}
                  </span>
                </div>
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* ESTATÍSTICAS RÁPIDAS DO ATLETA (BASE ZERO INICIAL) */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Jogos Oficiais',
              value: myPlayer?.career_stats?.matches_played ?? 0,
            },
            {
              label: 'Gols Marcados',
              value: myPlayer?.career_stats?.goals ?? 0,
            },
            {
              label: 'Assistências',
              value: myPlayer?.career_stats?.assists ?? 0,
            },
            {
              label: 'MVPs (Craque)',
              value: myPlayer?.career_stats?.mvps ?? 0,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] text-center space-y-1"
            >
              <span className="text-2xl font-mono font-bold text-white block tabular-nums">
                {stat.value}
              </span>
              <span className="text-xs text-[#A1A1AA] block">{stat.label}</span>
            </div>
          ))}
        </section>

        {/* GRID PRINCIPAL: CARD PRO INTERATIVO + RESUMO DA COMUNIDADE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna Esquerda (4 cols): Card Pro com HoloCard + FlipCard */}
          <div className="lg:col-span-4 p-5 rounded-3xl bg-[#1A1A1E] border border-white/[0.08] flex flex-col items-center space-y-4">
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                Meu Card Pro
              </span>
              <span className="text-[11px] text-zinc-400">
                Clique para virar
              </span>
            </div>

            {myPlayer ? (
              <FlipCard
                className="w-full flex justify-center min-h-[380px]"
                front={
                  <HoloCard className="p-2 bg-[#0D0D0F] border-white/[0.08]">
                    <FC26PlayerCard
                      player={myPlayer}
                      team={myTeam || undefined}
                      size="md"
                    />
                  </HoloCard>
                }
                back={
                  <div className="w-[260px] h-[370px] rounded-3xl bg-[#141417] border border-white/[0.12] p-5 flex flex-col justify-between text-left">
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                        Passaporte do Atleta
                      </span>
                      <h3 className="text-lg font-display font-bold text-white uppercase">
                        {myPlayer.character_name}
                      </h3>
                      <div className="space-y-1.5 text-xs text-zinc-400">
                        <p>
                          Posição: <strong className="text-white">{myPlayer.primary_position}</strong>
                        </p>
                        <p>
                          Físico:{' '}
                          <strong className="text-white">
                            {myPlayer.height_cm || 178}cm / {myPlayer.weight_kg || 72}kg
                          </strong>
                        </p>
                        <p>
                          AcceleRATE:{' '}
                          <strong className="text-white">
                            {myPlayer.accelerate_type || 'Controlada'}
                          </strong>
                        </p>
                        <p>
                          Arquétipo:{' '}
                          <strong className="text-white">
                            {myPlayer.archetype || 'Finalizador'}
                          </strong>
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/player"
                      className="w-full h-10 rounded-xl bg-white text-black text-xs font-semibold flex items-center justify-center"
                    >
                      Customizar Atributos
                    </Link>
                  </div>
                }
              />
            ) : (
              <div className="py-12 px-4 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#141417] border border-white/[0.08] flex items-center justify-center mx-auto text-white">
                  <User className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">
                    Você ainda não cadastrou seu atleta
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Crie seu perfil para liberar seu Card de Atleta Pro.
                  </p>
                </div>
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-white text-black text-xs font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Agora</span>
                </Link>
              </div>
            )}
          </div>

          {/* Coluna Direita (8 cols): Atalhos Rápidos + Jogadores & Times Reais */}
          <div className="lg:col-span-8 space-y-6">
            {/* Atalhos Rápidos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  href: '/players',
                  label: 'Buscar',
                  desc: `${players.length} atletas • ${teams.length} times`,
                  icon: Search,
                },
                {
                  href: '/matches',
                  label: 'Partidas & IA',
                  desc: `${matches.length} jogos na agenda`,
                  icon: Calendar,
                },
                {
                  href: '/rankings',
                  label: 'Classificação',
                  desc: tournament?.name || 'Tabela & Artilharia',
                  icon: Trophy,
                },
                {
                  href: '/studio',
                  label: 'Banners',
                  desc: 'Story 9:16, 4:5 e 1:1',
                  icon: Sparkles,
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="p-4 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] hover:border-white/25 transition-all space-y-3"
                  >
                    <div className="w-9 h-9 rounded-2xl bg-[#141414] border border-white/[0.08] flex items-center justify-center text-white">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {card.label}
                      </span>
                      <span className="text-[11px] text-[#A1A1AA] block truncate">
                        {card.desc}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Últimos Atletas Cadastrados no Banco Real */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-display font-bold text-white">
                    Atletas Cadastrados ({players.length})
                  </h2>
                  <p className="text-xs text-[#A1A1AA]">
                    Jogadores reais registrados na comunidade
                  </p>
                </div>
                <Link
                  href="/players"
                  className="text-xs font-semibold text-white hover:underline inline-flex items-center gap-1"
                >
                  <span>Ver todos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="py-8 text-center text-xs text-[#A1A1AA]">
                  Sincronizando jogadores...
                </div>
              ) : players.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#141414]/60 border border-white/[0.06] text-center space-y-3">
                  <Users className="w-6 h-6 text-[#A1A1AA] mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">
                      O banco está limpo e pronto para os jogadores
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto">
                      Compartilhe o link do Drafteiros com os atletas da liga para eles criarem a conta e cadastrarem seus atletas.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyInviteUrl}
                      className="h-9 px-4 rounded-full bg-white text-black text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Link de Convite</span>
                    </button>
                    {!myPlayer && (
                      <Link
                        href="/onboarding"
                        className="h-9 px-4 rounded-full bg-[#141414] border border-white/[0.08] text-white text-xs font-semibold inline-flex items-center"
                      >
                        Cadastrar Meu Boneco
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.06]">
                  {players.slice(0, 6).map((p) => {
                    const pTeam = teams.find((t) => t.id === p.team_id);
                    return (
                      <div
                        key={p.id}
                        className="py-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-[#141414] border border-white/[0.08] overflow-hidden flex items-center justify-center shrink-0">
                            {p.avatar_face_url ? (
                              <img
                                src={p.avatar_face_url}
                                alt={p.character_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-bold text-white">
                                {(p.character_name || 'DC')
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white uppercase truncate">
                                {p.character_name}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-[#141414] border border-white/[0.08] text-[10px] font-mono font-bold text-zinc-300">
                                {p.primary_position} • {p.overall || 82}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#A1A1AA] block truncate">
                              {pTeam ? pTeam.name : 'Agente Livre'} •{' '}
                              {p.platform || 'PS5'}
                            </span>
                          </div>
                        </div>

                        <Link
                          href="/players"
                          className="h-8 px-3.5 rounded-xl bg-[#141414] hover:bg-zinc-800 border border-white/[0.08] text-white text-xs font-semibold inline-flex items-center shrink-0"
                        >
                          Ver Perfil
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Clubes Registrados */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-display font-bold text-white">
                    Times Registrados ({teams.length})
                  </h2>
                  <p className="text-xs text-[#A1A1AA]">
                    Clubes criados pelos capitães da liga
                  </p>
                </div>
                <Link
                  href="/captain"
                  className="text-xs font-semibold text-white hover:underline inline-flex items-center gap-1"
                >
                  <span>Painel do Clube</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {teams.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#141414]/60 border border-white/[0.06] text-center space-y-3">
                  <Shield className="w-6 h-6 text-[#A1A1AA] mx-auto" />
                  <p className="text-xs text-[#A1A1AA]">
                    Nenhum clube registrado ainda. Capitães podem criar seu time pelo Onboarding ou Painel do Clube.
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {standings.slice(0, 6).map((team) => (
                    <Link
                      key={team.team_id}
                      href="/captain"
                      className="p-3.5 rounded-2xl bg-[#141414] border border-white/[0.08] hover:border-white/20 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-black border border-white/[0.08] flex items-center justify-center shrink-0 overflow-hidden">
                          {team.logo_url ? (
                            <img
                              src={team.logo_url}
                              alt={team.team_name}
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <span className="text-xs font-mono font-bold text-white">
                              {team.short_name}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white block truncate">
                            {team.team_name}
                          </span>
                          <span className="text-[11px] text-[#A1A1AA] block">
                            {team.points} pts • {team.won}V {team.drawn}E {team.lost}D
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#A1A1AA] shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
