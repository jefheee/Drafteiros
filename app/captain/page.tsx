
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLeagueStore, uploadMediaToStorage } from '@/lib/data-store';
import { TEMPLATE_ASSETS } from '@/lib/assets-catalog';
import { MemberContribution } from '@/types/database';
import { WorkspaceNav } from '@/components/layout/workspace-nav';
import { cn } from '@/lib/utils';
import {
  Shield,
  Users,
  Wallet,
  Upload,
  CheckCircle2,
  FileCheck2,
  UserPlus,
} from 'lucide-react';

export default function CaptainDashboardPage() {
  const {
    teams,
    players,
    tournament,
    registrations,
    updateTeamInStore,
    updateRegistrationInStore,
  } = useLeagueStore();

  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    teams[0]?.id || 'b3333333-3333-3333-3333-333333333333'
  );
  const [activeTab, setActiveTab] = useState<
    'roster' | 'kits_identity' | 'registration_finance'
  >('registration_finance');

  const currentTeam = useMemo(
    () => teams.find((t) => t.id === selectedTeamId) || teams[0],
    [teams, selectedTeamId]
  );

  const teamPlayers = useMemo(
    () => players.filter((p) => p.team_id === currentTeam?.id),
    [players, currentTeam?.id]
  );

  const currentRegistration = useMemo(
    () =>
      registrations.find((r) => r.team_id === currentTeam?.id) || registrations[0],
    [registrations, currentTeam?.id]
  );

  const [teamName, setTeamName] = useState(currentTeam?.name || 'Furia del Plata');
  const [primaryColor, setPrimaryColor] = useState(
    currentTeam?.primary_color || '#38BDF8'
  );
  const [secondaryColor, setSecondaryColor] = useState(
    currentTeam?.secondary_color || '#FFFFFF'
  );
  const [kitDescription, setKitDescription] = useState(
    currentTeam?.kit_description ||
    'Uniforme listrado azul celeste e branco sem patrocinadores, escudo bordado no peito'
  );
  const [logoUrl, setLogoUrl] = useState(
    currentTeam?.logo_url || TEMPLATE_ASSETS.crestPlaceholder
  );
  const [kitHomeUrl, setKitHomeUrl] = useState(
    currentTeam?.kit_home_url || TEMPLATE_ASSETS.crestPlaceholder
  );
  const [kitAwayUrl, setKitAwayUrl] = useState(
    currentTeam?.kit_away_url || TEMPLATE_ASSETS.crestPlaceholder
  );

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSelectTeam = (tId: string) => {
    setSelectedTeamId(tId);
    const t = teams.find((item) => item.id === tId);
    if (t) {
      setTeamName(t.name);
      setPrimaryColor(t.primary_color || '#38BDF8');
      setSecondaryColor(t.secondary_color || '#FFFFFF');
      setKitDescription(t.kit_description || '');
      setLogoUrl(t.logo_url || TEMPLATE_ASSETS.crestPlaceholder);
      setKitHomeUrl(t.kit_home_url || TEMPLATE_ASSETS.crestPlaceholder);
      setKitAwayUrl(t.kit_away_url || TEMPLATE_ASSETS.crestPlaceholder);
    }
  };

  const handleUploadTeamAsset = async (
    assetType: 'crest' | 'kit_home' | 'kit_away',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !currentTeam) return;

    const url = await uploadMediaToStorage(
      'team-media',
      `${currentTeam.id}/${assetType}`,
      file
    );

    if (assetType === 'crest') {
      setLogoUrl(url);
      await updateTeamInStore(currentTeam.id, { logo_url: url });
    } else if (assetType === 'kit_home') {
      setKitHomeUrl(url);
      await updateTeamInStore(currentTeam.id, { kit_home_url: url });
    } else {
      setKitAwayUrl(url);
      await updateTeamInStore(currentTeam.id, { kit_away_url: url });
    }

    setStatusMessage(
      '✅ Imagem salva no Supabase Storage (team-media) e sincronizada com o Estúdio 4:5 e Cartas FC 26!'
    );
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSaveTeamIdentity = async () => {
    if (!currentTeam) return;
    await updateTeamInStore(currentTeam.id, {
      name: teamName,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      kit_description: kitDescription,
      logo_url: logoUrl,
      kit_home_url: kitHomeUrl,
      kit_away_url: kitAwayUrl,
    });
    setStatusMessage(
      '✅ Identidade visual e uniformes oficiais salvos com sucesso!'
    );
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const totalFee = Number(tournament.entry_fee || 70);
  const contributions: MemberContribution[] = useMemo(() => {
    if (
      currentRegistration?.member_contributions &&
      currentRegistration.member_contributions.length > 0
    ) {
      return currentRegistration.member_contributions.map((c) => ({
        ...c,
        paid: c.paid ?? c.paid_to_captain ?? true,
      }));
    }
    const count = Math.max(teamPlayers.length, 1);
    const share = Number((totalFee / count).toFixed(2));
    return teamPlayers.map((p) => ({
      player_id: p.id,
      character_name: p.character_name || p.ea_Tag || p.name || 'ATLETA',
      full_name: p.full_name || p.character_name || p.name || 'Atleta',
      amount: share,
      paid: true,
      paid_to_captain: true,
      paid_at: new Date().toISOString(),
    }));
  }, [currentRegistration, teamPlayers, totalFee]);

  const paidMembersCount = contributions.filter(
    (c) => c.paid ?? c.paid_to_captain
  ).length;
  const collectedAmount = contributions
    .filter((c) => c.paid ?? c.paid_to_captain)
    .reduce((acc, item) => acc + Number(item.amount || 0), 0);

  const toggleMemberPaid = async (playerId: string) => {
    if (!currentRegistration) return;
    const updated = contributions.map((c) => {
      if (c.player_id !== playerId) return c;
      const nextPaid = !(c.paid ?? c.paid_to_captain);
      return {
        ...c,
        paid: nextPaid,
        paid_to_captain: nextPaid,
        paid_at: nextPaid ? new Date().toISOString() : null,
      };
    });
    await updateRegistrationInStore(currentRegistration.id, {
      member_contributions: updated,
    });
  };

  const handleSendFullPaymentProof = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !currentRegistration) return;

    const proofUrl = await uploadMediaToStorage(
      'team-media',
      `registrations/${currentRegistration.team_id}`,
      file
    );

    await updateRegistrationInStore(currentRegistration.id, {
      payment_status: 'paid_by_captain',
      payment_proof_url: proofUrl,
      notes: `Pagamento integral de R$ ${totalFee.toFixed(
        2
      )} enviado pelo capitão para liberação da equipe.`,
    });

    setStatusMessage(
      '✅ Comprovante do pagamento integral enviado ao Responsável do Campeonato!'
    );
    setTimeout(() => setStatusMessage(null), 5000);
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-[#0c0e12] text-zinc-900 dark:text-[#f1f3f9] px-3 sm:px-6 py-4 pb-28 overflow-x-hidden">
      <main className="max-w-7xl mx-auto space-y-5">
        {/* SUB-NAVEGAÇÃO RÁPIDA DO PILAR 5 (MEU ESPAÇO) */}
        <WorkspaceNav />

        {/* CABEÇALHO DO CAPITÃO */}
        <section className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#161920] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Escudo limpo sem caixa quadrada pesada */}
              <img
                src={currentTeam?.logo_url || TEMPLATE_ASSETS.crestPlaceholder}
                alt={currentTeam?.name || 'Escudo do Clube'}
                className="w-14 h-14 object-contain drop-shadow-lg shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    TEMPLATE_ASSETS.crestPlaceholder;
                }}
              />

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#7C5CFC]/15 text-[#7C5CFC] text-[10px] font-extrabold uppercase">
                    Painel do Capitão
                  </span>
                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold',
                      currentTeam?.is_approved
                        ? 'bg-[#38C958]/15 text-[#38C958]'
                        : 'bg-amber-500/15 text-amber-400'
                    )}
                  >
                    {currentTeam?.is_approved
                      ? '✅ Equipe Liberada na Liga'
                      : '⏳ Aguardando Liberação do Admin'}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-display font-black text-zinc-900 dark:text-white">
                  {currentTeam?.name}
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {teamPlayers.length} Atletas no Elenco • Código de Convite:{' '}
                  <strong className="text-[#7C5CFC]">FURIA26</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedTeamId}
                onChange={(e) => handleSelectTeam(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[#F5F6FA] dark:bg-[#1c2029] border border-zinc-200 dark:border-white/10 text-xs font-extrabold"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {statusMessage && (
            <div className="p-3 rounded-2xl bg-[#38C958]/15 border border-[#38C958]/40 text-[#38C958] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
        </section>

        {/* NAVEGAÇÃO DE ABAS DO CAPITÃO */}
        <div className="p-1.5 rounded-2xl bg-white dark:bg-[#161920] border border-zinc-200/80 dark:border-white/[0.07] shadow-xs grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('registration_finance')}
            className={cn(
              'py-2.5 px-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'registration_finance'
                ? 'bg-gradient-to-r from-[#7C5CFC] to-[#5b3fd9] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            )}
          >
            <Wallet className="w-4 h-4 shrink-0" />
            <span className="truncate">Rateio Inscrição</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={cn(
              'py-2.5 px-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'roster'
                ? 'bg-gradient-to-r from-[#7C5CFC] to-[#5b3fd9] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            )}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="truncate">Elenco ({teamPlayers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kits_identity')}
            className={cn(
              'py-2.5 px-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'kits_identity'
                ? 'bg-gradient-to-r from-[#7C5CFC] to-[#5b3fd9] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            )}
          >
            <Shield className="w-4 h-4 shrink-0" />
            <span className="truncate">Escudo & Camisas</span>
          </button>
        </div>

        {/* ABA 1: FINANCEIRO DA INSCRIÇÃO */}
        {activeTab === 'registration_finance' && (
          <section className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#161920] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C5CFC] block">
                  Fluxo Oficial: Jogadores ➔ Capitão ➔ Responsável da Liga
                </span>
                <h2 className="text-base font-display font-extrabold text-zinc-900 dark:text-white">
                  Rateio da Inscrição da Equipe (R$ {totalFee.toFixed(2).replace('.', ',')})
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Divisão automática entre os {contributions.length} membros do elenco (R${' '}
                  {(totalFee / Math.max(contributions.length, 1))
                    .toFixed(2)
                    .replace('.', ',')}{' '}
                  por jogador).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-[#1c2029] text-right shrink-0">
                <span className="text-[10px] font-extrabold uppercase text-zinc-400 block">
                  Arrecadado pelo Capitão
                </span>
                <span className="text-base font-mono font-black text-[#38C958]">
                  R$ {collectedAmount.toFixed(2).replace('.', ',')} / R${' '}
                  {totalFee.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-[10px] text-zinc-400 block">
                  {paidMembersCount} de {contributions.length} jogadores quitaram
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {contributions.map((member) => (
                <div
                  key={member.player_id}
                  className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-[#1c2029] border border-zinc-200/60 dark:border-white/[0.06] flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="text-xs font-display font-black uppercase text-zinc-900 dark:text-white block">
                      {member.character_name}
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Nome Real: {member.full_name} • Cota: R${' '}
                      {Number(member.amount).toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleMemberPaid(member.player_id)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0',
                      member.paid
                        ? 'bg-[#38C958] text-white shadow-xs'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    )}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{member.paid ? 'Cota Paga ao Capitão' : 'Marcar como Pago'}</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-[#7C5CFC]/10 border border-[#7C5CFC]/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold text-[#7C5CFC] block">
                    Repasse Integral da Equipe ao Responsável do Campeonato
                  </span>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Status atual perante a Liga:{' '}
                    <strong>
                      {currentRegistration?.payment_status === 'approved'
                        ? '✅ Recebimento Integral Confirmado & Equipe Liberada'
                        : currentRegistration?.payment_status === 'paid_by_captain'
                          ? '📤 Comprovante Enviado (Aguardando Confirmação do Admin)'
                          : '⏳ Aguardando Envio do Comprovante Integral'}
                    </strong>
                  </p>
                </div>

                <label className="cursor-pointer py-3 px-4 rounded-2xl bg-gradient-to-r from-[#7C5CFC] to-[#5b3fd9] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm shrink-0">
                  <Upload className="w-4 h-4" />
                  <span>
                    📤 Enviar Comprovante Integral (R$ {totalFee.toFixed(2).replace('.', ',')})
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSendFullPaymentProof}
                    className="hidden"
                  />
                </label>
              </div>

              {currentRegistration?.payment_proof_url && (
                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#7C5CFC]/20">
                  <span className="text-[#38C958] font-bold flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4" />
                    Comprovante anexado no banco para auditoria do Admin
                  </span>
                  <Link href="/admin" className="font-extrabold text-[#7C5CFC] underline">
                    Ver na Tesouraria da Liga →
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ABA 2: ELENCO DO TIME */}
        {activeTab === 'roster' && (
          <section className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#161920] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-display font-extrabold">
                  Elenco Oficial ({teamPlayers.length} / {tournament.max_roster_size || 6} vagas)
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Personagens cadastrados com fotos de rosto/corpo e AcceleRATE
                </p>
              </div>

              <Link
                href="/draft-board"
                className="px-3.5 py-2 rounded-2xl bg-[#7C5CFC] text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Ir para Sala de Draft
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {teamPlayers.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-[#1c2029] border border-zinc-200/60 dark:border-white/[0.06] flex items-center gap-3"
                >
                  <img
                    src={p.avatar_face_url || TEMPLATE_ASSETS.avatarPlaceholder}
                    alt={p.character_name}
                    className="w-12 h-12 rounded-2xl object-cover border border-white/10 shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        TEMPLATE_ASSETS.avatarPlaceholder;
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-display font-black uppercase text-zinc-900 dark:text-white truncate">
                        {p.character_name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#7C5CFC]/15 text-[#7C5CFC] font-mono text-[10px] font-black">
                        {p.primary_position} • {p.overall}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block truncate">
                      Atleta: {p.full_name} • {p.height_cm || 178}cm / {p.weight_kg || 72}kg
                    </span>
                    <span className="text-[10px] text-[#38C958] font-extrabold block">
                      ⚡ {p.accelerate_type || 'Controlada'} • {p.archetype}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ABA 3: ESCUDO & UNIFORMES OFICIAIS */}
        {activeTab === 'kits_identity' && (
          <section className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#161920] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-display font-extrabold">
                Identidade Visual & Uniformes (Supabase Storage)
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Suba o escudo PNG transparente e as fotos dos uniformes 1 e 2. Eles serão usados automaticamente nas Cartas FC 26 e no Placar 4:5.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-[#F5F6FA] dark:bg-[#1c2029] border border-zinc-200/60 dark:border-white/10 space-y-2.5 text-center">
                <span className="text-xs font-extrabold block">🛡️ Escudo Oficial (PNG)</span>
                <div className="w-24 h-24 mx-auto flex items-center justify-center">
                  <img
                    src={logoUrl || TEMPLATE_ASSETS.crestPlaceholder}
                    alt="Escudo"
                    className="w-20 h-20 object-contain drop-shadow-lg"
                    onError={(e) => {
                      e.currentTarget.src = TEMPLATE_ASSETS.crestPlaceholder;
                    }}
                  />
                </div>
                <label className="cursor-pointer w-full py-2 px-3 rounded-xl bg-[#7C5CFC] text-white text-[11px] font-bold flex items-center justify-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  Subir Escudo PNG
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadTeamAsset('crest', e)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5F6FA] dark:bg-[#1c2029] border border-zinc-200/60 dark:border-white/10 space-y-2.5 text-center">
                <span className="text-xs font-extrabold block">👕 Uniforme Titular (Home)</span>
                <div className="w-24 h-24 mx-auto flex items-center justify-center">
                  <img
                    src={kitHomeUrl || TEMPLATE_ASSETS.crestPlaceholder}
                    alt="Uniforme 1"
                    className="w-20 h-20 object-contain drop-shadow-lg"
                    onError={(e) => {
                      e.currentTarget.src = TEMPLATE_ASSETS.crestPlaceholder;
                    }}
                  />
                </div>
                <label className="cursor-pointer w-full py-2 px-3 rounded-xl bg-[#38C958] text-white text-[11px] font-bold flex items-center justify-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  Subir Camisa 1
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadTeamAsset('kit_home', e)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5F6FA] dark:bg-[#1c2029] border border-zinc-200/60 dark:border-white/10 space-y-2.5 text-center">
                <span className="text-xs font-extrabold block">🎽 Uniforme Reserva (Away)</span>
                <div className="w-24 h-24 mx-auto flex items-center justify-center">
                  <img
                    src={kitAwayUrl || TEMPLATE_ASSETS.crestPlaceholder}
                    alt="Uniforme 2"
                    className="w-20 h-20 object-contain drop-shadow-lg"
                    onError={(e) => {
                      e.currentTarget.src = TEMPLATE_ASSETS.crestPlaceholder;
                    }}
                  />
                </div>
                <label className="cursor-pointer w-full py-2 px-3 rounded-xl bg-zinc-800 text-white text-[11px] font-bold flex items-center justify-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  Subir Camisa 2
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadTeamAsset('kit_away', e)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">
                  Nome do Clube
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-[#F5F6FA] dark:bg-[#1c2029] border border-zinc-200 dark:border-white/10 text-xs font-extrabold"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">
                  Cor Primária (Faixa Placar 4:5)
                </label>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full h-9 rounded-xl cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">
                  Cor Secundária
                </label>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full h-9 rounded-xl cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">
                Descrição Visual do Uniforme para o Gemini 2.5 Flash
              </label>
              <input
                type="text"
                value={kitDescription}
                onChange={(e) => setKitDescription(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-[#F5F6FA] dark:bg-[#1c2029] border border-zinc-200 dark:border-white/10 text-xs font-semibold"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveTeamIdentity}
              className="w-full py-3 rounded-2xl bg-[#38C958] hover:bg-[#2fb34d] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Salvar Escudo, Camisas & Cores do Clube
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
