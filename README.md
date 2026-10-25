# Drafteiros

Official platform for championship organization, **Live Draft**, **AI Match Reporting**, and **Squad Management**.

It solves the main problems of those who play and organize championships: scheduling match times without arguments on WhatsApp, submitting match reports by reading the match screenshot via artificial intelligence, generating official artwork for social media, and managing the standings and prize distribution.

---

## What the system does

- **Smart Schedule Matching:** Each player marks their free days and times. The system cross-references the schedules of both teams and instantly shows when a game is possible.
- **Match Report by Photo (AI):** The captain uploads a screenshot of the final game screen. The AI reads the score, goals, and assists in seconds. The opposing captain confirms the result, and the standings update instantly.
- **Banner Studio:** Quick creation of artwork for Instagram (9:16, 4:5, and 1:1 formats) with the score, goal scorers, athlete photos, official watermark, and team crests.
- **Draft and Transfer Market:** Squad building with NBA-style player picks, a live clock, and free agent signings.
- **Pro Athlete Card and Club Profile:** Complete player profile (attributes, archetypes, photos, and position) and team customization (crest, colors, and kits).
- **Financial Control & Treasury:** The organizer tracks who has already paid the registration fee and the division of cash prizes with transparency.

---

## How to run the project

### 1. Prerequisites
- Node.js 18 or higher installed.

### 2. Installation
```bash
# Clone the repository and access the folder
cd drafteiros

# Install packages
npm install
```

### 3. Configuration (.env.local)
Create the `.env.local` file in the root with the following keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEYS=your_gemini_key
```

### 4. Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser or mobile phone.

---

## Technologies Used

- **Next.js** (App Router, React, and TypeScript)
- **Tailwind CSS** (Sophisticated Dark Charcoal Theme)
- **Supabase** (PostgreSQL Database, Auth, and Storage)
- **Google Gemini Vision** (Reading match screenshots and attributes)
- **React Bits** (Particles, StrokeText, ScrollReveal, ClickSpark, and AnimatedContent)
