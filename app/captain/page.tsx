'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-context';
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
  Copy,
  Check,
  Plus,
} from 'lucide-react';

export default function CaptainDashboardPage() {
  const { session } = useAuth();
  const {
    teams,
    players,
    tournament,
    registrations,
    updateTeamInStore,
    createTeamInStore,
    updateRegistrationInStore,
  } = useLeagueStore();

  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<
    'roster' | 'kits_identity' | 'registration_finance'
  >('roster');

  const currentTeam = useMemo(() => {
    if (selectedTeamId) {
      const found = teams.find((t) => t.id === selectedTeamId);
      if (found) return found;
    }
    if (session) {
      const byCap = teams.find(
        (t) => t.captain_id === session.userId || t.id === session.teamId
      );
      if (byCap) return byCap;
    }
    return teams[0];
  }, [teams, selectedTeamId, session]);

  useEffect(() => {
    if (currentTeam && !selectedTeamId) {
      setSelectedTeamId(currentTeam.id);
    }
  }, [currentTeam, selectedTeamId]);

  const teamPlayers = useMemo(
    () =>
      currentTeam ? players.filter((p) => p.team_id === currentTeam.id) : [],
    [players, currentTeam]
  );

  const currentRegistration = useMemo(
    () => registrations.find((r) => r.team_id === currentTeam?.id),
    [registrations, currentTeam?.id]
  );

  const [teamName, setTeamName] = useState(currentTeam?.name || '');
  const [shortName, setShortName] = useState(currentTeam?.short_name || '');
  const [primaryColor, setPrimaryColor] = useState(
    currentTeam?.primary_color || '#FFFFFF'
  );
  const [secondaryColor, setSecondaryColor] = useState(
    currentTeam?.secondary_color || '#141414'
  );
  const [kitDescription, setKitDescription] = useState(
    currentTeam?.kit_description || ''
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

  // Criação rápida caso não exista nenhum clube ainda
  const [newClubName, setNewClubName] = useState('');
  const [newClubShort, setNewClubShort] = useState('');
  const [creatingClub, setCreatingClub] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  useEffect(() => {
    if (currentTeam) {
      setTeamName(currentTeam.name);
      setShortName(currentTeam.short_name || '');
      setPrimaryColor(currentTeam.primary_color || '#FFFFFF');
      setSecondaryColor(currentTeam.secondary_color || '#141414');
      setKitDescription(currentTeam.kit_description || '');
      setLogoUrl(currentTeam.logo_url || TEMPLATE_ASSETS.crestPlaceholder);
      setKitHomeUrl(currentTeam.kit_home_url || TEMPLATE_ASSETS.crestPlaceholder);
      setKitAwayUrl(currentTeam.kit_away_url || TEMPLATE_ASSETS.crestPlaceholder);
    }
  }, [currentTeam?.id]);

  const handleSelectTeam = (tId: string) => {
    setSelectedTeamId(tId);
  };

  const handleQuickCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName.trim()) return;
    setCreatingClub(true);
    try {
      const created = await createTeamInStore({
        name: newClubName.trim(),
        short_name: (
          newClubShort.trim() || newClubName.trim().substring(0, 3)
        ).toUpperCase(),
        captain_id: session?.userId || undefined,
      });
      if (created) {
        setSelectedTeamId(created.id);
        setNewClubName('');
        setNewClubShort('');
        setStatusMessage(
          `Clube "${created.name}" criado com sucesso! Código de convite: ${created.invite_code}`
        );
      }
    } finally {
      setCreatingClub(false);
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

    setStatusMessage('Imagem salva e sincronizada com o clube!');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSaveTeamIdentity = async () => {
    if (!currentTeam) return;
    await updateTeamInStore(currentTeam.id, {
      name: teamName,
      short_name: shortName,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      kit_description: kitDescription,
      logo_url: logoUrl,
      kit_home_url: kitHomeUrl,
      kit_away_url: kitAwayUrl,
    });
    setStatusMessage('Identidade visual e uniformes salvos com sucesso!');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const totalFee = Number(tournament.entry_fee || 0);
  const contributions: MemberContribution[] = useMemo(() => {
    if (
      currentRegistration?.member_contributions &&
      currentRegistration.member_contributions.length > 0
    ) {
      return currentRegistration.member_contributions;
    }
    const count = Math.max(teamPlayers.length, 1);
    const share = Number((totalFee / count).toFixed(2));
    return teamPlayers.map((p) => ({
      player_id: p.id,
      character_name: p.character_name || p.ea_Tag || p.name || 'ATLETA',
      full_name: p.full_name || p.character_name || p.name || 'Atleta',
      amount: share,
      paid: false,
      paid_to_captain: false,
      paid_at: null,
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
      notes: `Comprovante enviado pelo capitão.`,
    });

    setStatusMessage('Comprovante enviado para a administração da liga!');
    setTimeout(() => setStatusMessage(null), 5000);
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 py-5 pb-28 overflow-x-hidden">
      <main className="max-w-7xl mx-auto space-y-5">
        <WorkspaceNav />

        {statusMessage && (
          <div className="p-3.5 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {!currentTeam ? (
          <section className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] max-w-xl mx-auto space-y-5">
            <div className="space-y-1 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-white/[0.08] flex items-center justify-center mx-auto text-white mb-2">
                <Shield className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-display font-bold text-white">
                Cadastrar Meu Clube
              </h1>
              <p className="text-xs text-[#A1A1AA]">
                Crie seu time para gerar o código de convite e receber seus jogadores.
              </p>
            </div>

            <form onSubmit={handleQuickCreateClub} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 block">
                    Nome do Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={newClubName}
                    onChange={(e) => setNewClubName(e.target.value)}
                    placeholder="Ex: Real Palhoça FC"
                    className="w-full h-11 px-3.5 rounded-2xl bg-[#141414] border border-white/[0.08] text-sm text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 block">
                    Sigla (3 letras)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={newClubShort}
                    onChange={(e) => setNewClubShort(e.target.value.toUpperCase())}
                    placeholder="Ex: RPF"
                    className="w-full h-11 px-3.5 rounded-2xl bg-[#141414] border border-white/[0.08] text-sm font-mono font-bold text-white uppercase"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creatingClub}
                className="w-full h-11 rounded-2xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{creatingClub ? 'Criando Clube...' : 'Criar Clube e Gerar Código'}</span>
              </button>
            </form>
          </section>
        ) : (
          <>
            {/* CABEÇALHO DO CAPITÃO (JOGUEIROS STYLE COM CÓDIGO DE CONVITE) */}
            <section className="p-5 sm:p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={currentTeam.logo_url || TEMPLATE_ASSETS.crestPlaceholder}
                    alt={currentTeam.name}
                    className="w-14 h-14 object-contain shrink-0"
                  />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-white text-black text-[10px] font-bold uppercase">
                        Painel do Clube
                      </span>
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-[10px] font-semibold border',
                          currentTeam.is_approved
                            ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                            : 'bg-[#141414] border-white/[0.08] text-[#A1A1AA]'
                        )}
                      >
                        {currentTeam.is_approved
                          ? 'Equipe Confirmada na Liga'
                          : 'Em preparação'}
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-display font-bold text-white">
                      {currentTeam.name}
                    </h1>
                    <p className="text-xs text-[#A1A1AA]">
                      {teamPlayers.length} Atletas no Elenco • Código de Convite:{' '}
                      <strong className="font-mono text-white">
                        {currentTeam.invite_code || 'CLUBE26'}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const code = currentTeam.invite_code || 'CLUBE26';
                      navigator.clipboard.writeText(code);
                      setCopiedInvite(true);
                      setTimeout(() => setCopiedInvite(false), 2500);
                    }}
                    className="h-10 px-4 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    {copiedInvite ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Código Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Código ({currentTeam.invite_code || 'CLUBE26'})</span>
                      </>
                    )}
                  </button>

                  {teams.length > 1 && (
                    <select
                      value={selectedTeamId}
                      onChange={(e) => handleSelectTeam(e.target.value)}
                      className="h-10 px-3 rounded-xl bg-[#141414] border border-white/[0.08] text-xs font-semibold text-white"
                    >
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </section>

            {/* NAVEGAÇÃO DE ABAS DO CAPITÃO */}
            <div className="p-1.5 rounded-2xl bg-[#0A0A0A] border border-white/[0.08] grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('roster')}
                className={cn(
                  'py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5',
                  activeTab === 'roster'
                    ? 'bg-white text-black shadow-xs'
                    : 'text-[#A1A1AA] hover:text-white'
                )}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span className="truncate">Elenco ({teamPlayers.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('kits_identity')}
                className={cn(
                  'py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5',
                  activeTab === 'kits_identity'
                    ? 'bg-white text-black shadow-xs'
                    : 'text-[#A1A1AA] hover:text-white'
                )}
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span className="truncate">Escudo & Camisas</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('registration_finance')}
                className={cn(
                  'py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5',
                  activeTab === 'registration_finance'
                    ? 'bg-white text-black shadow-xs'
                    : 'text-[#A1A1AA] hover:text-white'
                )}
              >
                <Wallet className="w-4 h-4 shrink-0" />
                <span className="truncate">Rateio Inscrição</span>
              </button>
            </div>

            {/* ABA 1: ELENCO DO TIME */}
            {activeTab === 'roster' && (
              <section className="p-5 sm:p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <h2 className="text-base font-display font-bold text-white">
                      Elenco Oficial ({teamPlayers.length} atletas)
                    </h2>
                    <p className="text-xs text-[#A1A1AA]">
                      Jogadores que informaram o código{' '}
                      <strong className="text-white">{currentTeam.invite_code}</strong> ou foram escolhidos no Draft.
                    </p>
                  </div>

                  <Link
                    href="/draft-board"
                    className="h-9 px-4 rounded-full bg-white text-black text-xs font-semibold inline-flex items-center gap-1.5 shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sala de Draft</span>
                  </Link>
                </div>

                {teamPlayers.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#141414]/60 border border-white/[0.06] text-center space-y-2">
                    <p className="text-xs text-[#A1A1AA]">
                      Nenhum jogador vinculado a este clube ainda. Envie o código{' '}
                      <strong className="text-white">{currentTeam.invite_code}</strong> para seus atletas ou recrute na Sala de Draft.
                    </p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {teamPlayers.map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-2xl bg-[#141414] border border-white/[0.08] flex items-center gap-3"
                      >
                        <img
                          src={p.avatar_face_url || TEMPLATE_ASSETS.avatarPlaceholder}
                          alt={p.character_name}
                          className="w-12 h-12 rounded-2xl object-cover border border-white/10 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-display font-bold uppercase text-white truncate">
                              {p.character_name}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-black border border-white/[0.1] text-white font-mono text-[10px] font-bold">
                              {p.primary_position} • {p.overall || 82}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#A1A1AA] block truncate">
                            {p.full_name} • {p.height_cm || 178}cm / {p.weight_kg || 72}kg
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ABA 2: ESCUDO & UNIFORMES OFICIAIS */}
            {activeTab === 'kits_identity' && (
              <section className="p-5 sm:p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-5">
                <div>
                  <h2 className="text-base font-display font-bold text-white">
                    Identidade Visual & Uniformes
                  </h2>
                  <p className="text-xs text-[#A1A1AA]">
                    Suba o escudo PNG e as fotos dos uniformes 1 e 2 para aparecerem nas Cartas FC 26 e nos banners.
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.08] space-y-3 text-center">
                    <span className="text-xs font-semibold text-white block">
                      Escudo Oficial
                    </span>
                    <div className="w-24 h-24 mx-auto flex items-center justify-center">
                      <img
                        src={logoUrl || TEMPLATE_ASSETS.crestPlaceholder}
                        alt="Escudo"
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <label className="cursor-pointer w-full h-9 px-3 rounded-xl bg-white text-black text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir Escudo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadTeamAsset('crest', e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.08] space-y-3 text-center">
                    <span className="text-xs font-semibold text-white block">
                      Uniforme Titular (Home)
                    </span>
                    <div className="w-24 h-24 mx-auto flex items-center justify-center">
                      <img
                        src={kitHomeUrl || TEMPLATE_ASSETS.crestPlaceholder}
                        alt="Uniforme 1"
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <label className="cursor-pointer w-full h-9 px-3 rounded-xl bg-black border border-white/[0.12] text-white text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir Camisa 1</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadTeamAsset('kit_home', e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.08] space-y-3 text-center">
                    <span className="text-xs font-semibold text-white block">
                      Uniforme Reserva (Away)
                    </span>
                    <div className="w-24 h-24 mx-auto flex items-center justify-center">
                      <img
                        src={kitAwayUrl || TEMPLATE_ASSETS.crestPlaceholder}
                        alt="Uniforme 2"
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <label className="cursor-pointer w-full h-9 px-3 rounded-xl bg-black border border-white/[0.12] text-white text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir Camisa 2</span>
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
                    <label className="text-xs font-medium text-[#A1A1AA] block mb-1">
                      Nome do Clube
                    </label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#141414] border border-white/[0.08] text-xs font-semibold text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#A1A1AA] block mb-1">
                      Cor Primária
                    </label>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full h-10 rounded-xl cursor-pointer bg-[#141414] border border-white/[0.08]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#A1A1AA] block mb-1">
                      Cor Secundária
                    </label>
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-full h-10 rounded-xl cursor-pointer bg-[#141414] border border-white/[0.08]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveTeamIdentity}
                  className="w-full h-11 rounded-2xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvar Escudo, Camisas & Cores</span>
                </button>
              </section>
            )}

            {/* ABA 3: FINANCEIRO DA INSCRIÇÃO */}
            {activeTab === 'registration_finance' && (
              <section className="p-5 sm:p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-display font-bold text-white">
                      Rateio da Inscrição da Equipe (R${' '}
                      {totalFee.toFixed(2).replace('.', ',')})
                    </h2>
                    <p className="text-xs text-[#A1A1AA]">
                      Divisão entre os {contributions.length} membros do elenco.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/[0.08] text-right shrink-0">
                    <span className="text-[10px] uppercase text-[#A1A1AA] block">
                      Arrecadado pelo Capitão
                    </span>
                    <span className="text-base font-mono font-bold text-white">
                      R$ {collectedAmount.toFixed(2).replace('.', ',')} / R${' '}
                      {totalFee.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-[10px] text-[#A1A1AA] block">
                      {paidMembersCount} de {contributions.length} jogadores confirmados
                    </span>
                  </div>
                </div>

                {contributions.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[#141414]/60 border border-white/[0.06] text-center text-xs text-[#A1A1AA]">
                    Adicione jogadores ao elenco para calcular o rateio individual.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contributions.map((member) => (
                      <div
                        key={member.player_id}
                        className="p-3.5 rounded-2xl bg-[#141414] border border-white/[0.06] flex items-center justify-between gap-2"
                      >
                        <div>
                          <span className="text-xs font-display font-bold uppercase text-white block">
                            {member.character_name}
                          </span>
                          <span className="text-[11px] text-[#A1A1AA]">
                            Cota: R${' '}
                            {Number(member.amount).toFixed(2).replace('.', ',')}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleMemberPaid(member.player_id)}
                          className={cn(
                            'h-8 px-3.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0',
                            member.paid
                              ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                              : 'bg-black text-[#A1A1AA] border border-white/[0.1]'
                          )}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{member.paid ? 'Pago' : 'Marcar como Pago'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {currentRegistration && (
                  <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Comprovante de Inscrição da Equipe
                      </span>
                      <p className="text-[11px] text-[#A1A1AA]">
                        Envie o comprovante para liberação junto à administração da liga.
                      </p>
                    </div>

                    <label className="cursor-pointer h-10 px-4 rounded-xl bg-white text-black font-semibold text-xs flex items-center justify-center gap-2 shrink-0">
                      <Upload className="w-4 h-4" />
                      <span>Enviar Comprovante</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSendFullPaymentProof}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {currentRegistration?.payment_proof_url && (
                  <div className="flex items-center justify-between text-xs pt-2">
                    <span className="text-[#10B981] font-semibold flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4" />
                      Comprovante anexado
                    </span>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
