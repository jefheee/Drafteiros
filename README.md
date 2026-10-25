# Drafteiros

Plataforma oficial para organização de campeonatos, **Draft ao vivo**, **Súmula por IA** e **Gestão de Elencos**.

Resolve os principais problemas de quem joga e organiza campeonatos: marcar horário de jogo sem discussão no WhatsApp, lançar súmula lendo o print da partida por inteligência artificial, gerar artes oficiais para redes sociais e gerenciar a tabela e o rateio de premiações.

---

## O que o sistema faz

- **Combinação Inteligente de Horários:** Cada jogador marca seus dias e horários livres. O sistema cruza os horários dos dois times e mostra na hora quando dá jogo.
- **Súmula por Foto (IA):** O capitão envia o print da tela final do jogo. A IA lê placar, gols e assistências em segundos. O capitão adversário confirma o resultado e a tabela atualiza instantaneamente.
- **Estúdio de Banners:** Criação rápida de artes para Instagram (formatos 9:16, 4:5 e 1:1) com placar, autores dos gols, fotos dos atletas, marca d'água oficial e escudos das equipes.
- **Draft e Mercado de Transferências:** Montagem de elenco com escolha de jogadores estilo draft da NBA, relógio ao vivo e contratação de agentes livres.
- **Card de Atleta Pro e Perfil de Clube:** Ficha completa do jogador (atributos, arquétipos, fotos e posição) e personalização da equipe (escudo, cores e uniformes).
- **Controle Financeiro & Tesouraria:** O organizador acompanha quem já pagou a taxa de inscrição e a divisão das premiações em dinheiro com transparência.

---

## Como rodar o projeto

### 1. Pré-requisitos
- Node.js 18 ou superior instalado.

### 2. Instalação
```bash
# Clone o repositório e acesse a pasta
cd drafteiros

# Instale os pacotes
npm install
```

### 3. Configuração (.env.local)
Crie o arquivo `.env.local` na raiz com as chaves:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_supabase
GEMINI_API_KEYS=sua_chave_gemini
```

### 4. Executar
```bash
npm run dev
```
Abra [http://localhost:3000](http://localhost:3000) no seu navegador ou celular.

---

## Tecnologias Usadas

- **Next.js** (App Router, React e TypeScript)
- **Tailwind CSS** (Tema Dark Charcoal sofisticado)
- **Supabase** (Banco de dados PostgreSQL, Auth e Storage)
- **Google Gemini Vision** (Leitura dos prints de partidas e atributos)
- **React Bits** (Particles, StrokeText, ScrollReveal, ClickSpark e AnimatedContent)
