# 🛡️ DraftClub PRO — SaaS de Gestão para EA FC 26 Pro Clubs (5x5 & 11v11)

> **Experiência Mobile-First App-Like ("Jogueiros PRO" Dark Clean Edition)** para ligas competitivas de **EA Sports FC 26 Pro Clubs** (5x5 Rush/LPF e 11v11 Oficial), combinando **Agendamento Inteligente**, **Súmula por IA (Gemini Vision OCR)** com **Dupla Validação Anti-Fraude**, **Estúdio Criativo Híbrido (Canvas 4:5 + IA Roleplay)** e **ERP Financeiro de Premiações**.

---

## ✨ Principais Módulos e Diferenciais

### 1. 📅 Agendamento Inteligente ("Tinder de Horários")
- **Fim do caos nos grupos de WhatsApp:** cada jogador configura seus horários disponíveis na semana (`Seg` a `Dom`, das `19h` às `00h`) em chips clicáveis no Passaporte do Atleta.
- **Cruzamento Automático de Elencos:** o sistema cruza a disponibilidade do Time A e do Time B, destacando em verde os horários de **Match Ideal** (ex: *Terça-feira às 22:30 — 5/5 atletas disponíveis em ambos os times*).
- **Rodadas Flexíveis:** suporte total ao adiantamento de partidas fora da ordem numérica da rodada, com fluxo de proposta do Capitão A e confirmação em 1 clique pelo Capitão B.

### 2. 📝 Súmula Inteligente com IA (OCR) & Dupla Validação
- **Leitura Óptica via Gemini Vision (`gemini-2.5-flash` / `gemini-1.5-flash`):** o capitão faz upload do print pós-jogo do EA FC 26 e a IA extrai automaticamente o placar, os gols, as assistências, a nota da partida e o Craque do Jogo (MOTM).
- **Suporte a Convidados Avulsos:** botão rápido para adicionar jogadores convidados (`guest_name`) que completaram o time de última hora sem exigir cadastro prévio.
- **Dupla Validação (Capitão A ➔ Capitão B):**
  - O Capitão A lança a súmula com o print comprobatório (`pending_validation`).
  - O Capitão B recebe um alerta destacado no topo do painel para **✅ Validar Resultado** (atualizando instantaneamente pontos, saldo de gols, artilharia e assistências) ou **⚠️ Contestar para ADMs**.

### 3. ⚖️ Central de Incidentes, W.O. e Quedas (Regras Automatizadas)
- **Solicitação de W.O. por Atraso (> 15 min):** protocolo direto com exigência de print do lobby + relógio visível.
- **Verificador de Cancelamento Tardio (< 60 min):** trava automática que alerta sobre risco de W.O. caso um time tente adiar a partida faltando menos de 1 hora para o horário agendado.
- **Calculadora de Queda de Conexão:**
  - *Queda até os 20 minutos do 1º tempo:* orienta o reinício de partida completa (90 min) mantendo o placar e gols anteriores.
  - *Queda após os 20 minutos / Intervalo / 2º tempo:* orienta o reinício jogando apenas 1 tempo (45 min) somando o placar anterior.

### 4. 🎨 Estúdio Criativo Híbrido (Canvas 4:5 + IA Roleplay & Prompts 8K)
- **Gerador de Banners de Placar e Craque (Padrão Instagram `@atleticodapalhoca`):**
  - Renderização interativa em tempo real e exportação em alta resolução (**PNG 1080x1350 - proporção 4:5**) via HTML5 Canvas.
  - Exibe foto de fundo dos bonecos comemorando, overlay escuro inferior, escudos, placar central, lista de artilheiros (`⚽`) e garçons (`👟`), além de **Barra de Patrocinadores com destaque real e legível**.
- **IA Roleplay (Resenha de Pro Clubs):**
  - Gera *Notas de Repúdio*, *Entrevistas Pós-Jogo (Zona Mista)*, *Provocações Pré-Jogo* e *Anúncios de Contratação ("Here We Go")* prontos para copiar com 1 clique para o WhatsApp ou Instagram.
- **Prompt Builder de Personagem 8K:**
  - Combina automaticamente o DNA físico do boneco do jogador (`visual_traits`) + a descrição do uniforme e cores do clube (`kit_description`) em um Prompt Mestre fotográfico (Inglês e Português) estilo transmissão noturna EA FC 26.

### 5. 💰 ERP Financeiro & Painel Master Admin
- **Gestão de Inscrições (`tournament_finances`):** controle de caixa em tempo real (ex: *8 clubes x R$ 70 = R$ 560*) com toggle rápido de **Inscrição Paga / Pendente**.
- **Rateio Automático de Premiações:** painel que aponta em tempo real quem está levando os prêmios de **1º Lugar (R$ 300)**, **2º Lugar (R$ 120)**, **3º Lugar (R$ 80)**, **Artilheiro (R$ 30)** e **Garçom (R$ 30)**.
- **Tribunal de Auditoria:** inspeção de prints em tela cheia para forçar aprovação de súmulas contestadas ou julgar chamados de W.O.

### 6. 🧩 Prancheta Tática Híbrida (Modo 5x5 Rush/LPF & Modo 11v11)
- Alternância instantânea no Squad Builder entre **Modo 5x5** (5 titulares na arena + slot dedicado para o **6º Jogador Reserva**) e **Modo 11v11 Oficial** com 20 formações táticas do EA FC 26.

---

## 🔄 Arquitetura de IA com Rotação de Chaves (`lib/gemini.ts`)

O módulo de IA foi projetado para operar com **custo zero e alta disponibilidade**:
- Lê múltiplas chaves configuradas em `GEMINI_API_KEYS` (separadas por vírgula) com fallback para `GEMINI_API_KEY`.
- **Round-Robin com Failover Automático:** se uma chave retornar HTTP `429` (Quota Exceeded) ou `503`, o gerenciador alterna automaticamente para a próxima chave do pool e faz fallback entre `gemini-2.5-flash` e `gemini-1.5-flash` sem interromper a experiência do usuário.
- **Modo Dev Resiliente:** caso nenhuma chave esteja definida no `.env`, o sistema responde com mocks hiper-realistas do universo Pro Clubs.

---

## 🛠️ Stack Tecnológica

- **Framework:** Next.js 14+ (App Router, Server & Client Components)
- **Linguagem:** TypeScript 5 (Tipagem estrita sincronizada com o banco)
- **Estilização:** Tailwind CSS (Dark Clean UI `bg-slate-950`, destaques em `cyan-500` e `amber-500`, Mobile-First com Bottom Navigation Bar)
- **Banco de Dados, Auth & Storage:** Supabase (PostgreSQL, Row Level Security, Views Analíticas)
- **Inteligência Artificial:** Google Gemini API (`gemini-2.5-flash` / `gemini-1.5-flash`) com Key Rotation

---

## 🚀 Como Executar o Projeto Localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as variáveis de ambiente (`.env.local`):**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
   GEMINI_API_KEYS=chave_projeto_1,chave_projeto_2,chave_projeto_3
   ```

3. **Execute o schema SQL no Supabase:**
   - Abra o **SQL Editor** no painel do Supabase e execute o conteúdo completo de `supabase/schema.sql`.

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000` pelo navegador ou smartphone.

5. **Build de Produção:**
   ```bash
   npm run build
   ```

---

## 📁 Estrutura Principal do Projeto

- `app/page.tsx` — Hub Mobile-First da Liga Ativa (Jogos da Rodada swipeable, Tabela com G4 em Ciano, Top 3 Artilheiros e Garçons)
- `app/matches/page.tsx` — Tinder de Horários, Lançamento de Súmula com OCR IA, Convidado Avulso, Dupla Validação e Central de W.O./Quedas
- `app/studio/page.tsx` — Gerador de Banners 4:5 (`@atleticodapalhoca`), IA Roleplay e Prompt Builder de Personagem 8K
- `app/captain/page.tsx` — Gestão de Elenco, Prancheta 5x5 (5+1) / 11v11 e Identidade Visual/Patrocinadores do Clube
- `app/player/page.tsx` — Passaporte do Atleta com Configurador de Horários Disponíveis e DNA Visual do Boneco
- `app/admin/page.tsx` — ERP Financeiro de Campeonatos, Rateio de Premiações em Tempo Real e Auditoria de Súmulas/W.O.
- `app/api/ai-studio/route.ts` — API unificada de IA (`ocr_match_sheet`, `generate_roleplay`, `generate_character_prompt`)
- `lib/gemini.ts` — Motor Round-Robin de rotação de chaves Gemini com failover automático
- `supabase/schema.sql` & `types/database.ts` — Arquitetura SQL completa e tipagens TypeScript sincronizadas
