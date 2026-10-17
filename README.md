# DraftClub

Plataforma para organização de ligas e campeonatos de **EA Sports FC Pro Clubs** (5x5 e 11v11).

Resolve os principais problemas de quem joga e organiza campeonatos: marcar horário de jogo sem discussão no WhatsApp, lançar súmula lendo o print da partida por IA, gerar artes para redes sociais e gerenciar a tabela e o dinheiro da premiação.

---

## O que o sistema faz

- **Combinação de Horários:** Cada jogador marca seus dias e horários livres. O sistema cruza os horários dos dois times e mostra na hora quando dá jogo.
- **Súmula por Foto:** O capitão envia o print da tela final do jogo. A IA lê placar, gols e assistências. O capitão adversário confirma o resultado e a tabela atualiza na hora.
- **Estúdio de Banners:** Criação rápida de artes para Instagram (formato 4:5) com placar, autores dos gols, fotos dos personagens e escudos dos clubes.
- **Draft e Mercado:** Montagem de elenco com escolha de jogadores (estilo draft da NBA) e contratações.
- **Perfis de Atleta e Clube:** Ficha completa do jogador (atributos, playstyles, fotos e posição) e personalização do time (escudo, cores e uniformes).
- **Controle Financeiro:** O organizador acompanha quem já pagou a taxa de inscrição e a divisão das premiações em dinheiro.

---

## Como rodar o projeto

### 1. Pré-requisitos
- Node.js 18 ou superior instalado.

### 2. Instalação
```bash
# Clone o repositório e acesse a pasta
cd draftclub

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

> **Dica:** Se você não tiver chaves no momento, o projeto possui dados de demonstração prontos para testes locais.

### 4. Executar
```bash
npm run dev
```
Abra [http://localhost:3000](http://localhost:3000) no seu navegador ou celular.

---

## Tecnologias Usadas

- **Next.js** (React e TypeScript)
- **Tailwind CSS** (Interface limpa, moderna e adaptada para celular)
- **Supabase** (Banco de dados e armazenamento de imagens)
- **Google Gemini** (Leitura dos prints de partidas e atributos)
