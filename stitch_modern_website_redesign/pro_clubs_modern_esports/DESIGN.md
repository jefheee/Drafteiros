---
name: Pro Clubs Modern Esports
colors:
  surface: '#fbf8fc'
  surface-dim: '#dcd9dd'
  surface-bright: '#fbf8fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f2f7'
  surface-container: '#f0edf1'
  surface-container-high: '#eae7eb'
  surface-container-highest: '#e4e1e6'
  on-surface: '#1b1b1e'
  on-surface-variant: '#484555'
  inverse-surface: '#303033'
  inverse-on-surface: '#f3f0f4'
  outline: '#797587'
  outline-variant: '#c9c4d8'
  surface-tint: '#613de0'
  primary: '#5f3add'
  on-primary: '#ffffff'
  primary-container: '#7857f8'
  on-primary-container: '#fffbff'
  inverse-primary: '#cabeff'
  secondary: '#006e26'
  on-secondary: '#ffffff'
  secondary-container: '#70fb83'
  on-secondary-container: '#007328'
  tertiary: '#4648d4'
  on-tertiary: '#ffffff'
  tertiary-container: '#6063ee'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e6deff'
  primary-fixed-dim: '#cabeff'
  on-primary-fixed: '#1c0062'
  on-primary-fixed-variant: '#4918c8'
  secondary-fixed: '#73fe85'
  secondary-fixed-dim: '#54e16c'
  on-secondary-fixed: '#002106'
  on-secondary-fixed-variant: '#00531a'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#fbf8fc'
  on-background: '#1b1b1e'
  surface-variant: '#e4e1e6'
  canvas-bg: '#F5F6FA'
  surface-white: '#FFFFFF'
  status-emerald: '#10B981'
  emerald-tint: '#E8FAF0'
  violet-tint: '#F1EEFE'
  score-capsule: '#F3F4F6'
  border-subtle: '#E4E4E7'
  text-muted: '#71717A'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '800'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 19px
    fontWeight: '700'
    lineHeight: 25px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.02em
  score-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '800'
    lineHeight: 20px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-md: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.875rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style

The design system is engineered for competitive digital soccer and esports management platforms. It delivers an electric, frictionless, and premium gaming experience tailored to passionate esports managers, captains, and grassroots tournament competitors. The personality balances competitive intensity with refined administrative clarity—delivering real-time excitement through high-energy status accents while maintaining flawless data density and scannability.

The visual style merges **Modern Clean Fintech clarity with Vibrant Esports dynamics**:
- Crisp neutral canvas surfaces paired with luminous, high-energy purple-indigo primaries.
- Soft, hyper-legible card architectures framed with subtle translucent borders.
- Tactile, pill-shaped status badges, energetic live indicators, and high-contrast match score capsules.
- Airy spacing rhythms that turn complex tournament fixtures, standings, and rosters into glanceable mobile-first interfaces.

## Colors

The palette leverages an electric violet (`#7C5CFC`) as the primary brand anchor, supported by bright indigo tones and an energizing emerald green (`#38C958` / `#10B981`) for live match status, active seasons, and validation signals.

### Color Rules & Hierarchy:
- **Canvas & Surfaces:** The primary app backdrop is `#F5F6FA`, establishing soft separation against pure white (`#FFFFFF`) elevated cards and modular containers.
- **Accents & CTAs:** High-priority tournament actions (e.g., match sheet submission, automated validation) use `#7C5CFC` or vibrant emerald pills. Interactive secondary actions utilize soft tinted backgrounds (`#F1EEFE` or `#E8FAF0`) with saturated text labels.
- **Data & Text Contrast:** Headers and key team identities use rich dark charcoal `#18181B`. Secondary metadata, match details, and subtle time tags use neutral slate `#71717A`.
- **Score & Fixture Capsules:** Score badges and "VS" nodes sit inside soft neutral capsules (`#F3F4F6`) to maintain distinct visual weight without clashing with club crests.

## Typography

The type system blends the energetic geometry of **Plus Jakarta Sans** for titles, tournament headers, and match scores with the high-density legibility of **Inter** for administrative data, team names, rosters, and status pills.

### Typographic Hierarchy:
- **Headlines:** Use `Plus Jakarta Sans` in bold or extra-bold weights with tight negative letter spacing for authoritative tournament headlines and league names.
- **Body & Meta:** Use `Inter` at 12–15px to preserve crisp readability for player numbers, prize amounts, and round metadata.
- **Score & Badging:** Numbers inside match pills use `score-display` (`Plus Jakarta Sans` 800) for instant fixture legibility during fast navigation. Uppercase styling is reserved for short tags, abbreviations (e.g., `VS`, `G4`, `LPF`), and status pills.

## Layout & Spacing

The layout is built on a compact, mobile-first grid engineered for single-hand tournament operations while scaling elegantly to tablet and desktop dashboard views.

### Layout Principles:
- **Phone Canvas (< 640px):** Single-column stacked stream with `1rem` outer canvas padding. Action bars dock fixed to the viewport base with safe-area spacing. Match cards span full width minus margins with `0.875rem` vertical spacing between cards.
- **Tablet & Desktop (641px - 1200px+):** Fluid 12-column grid with a maximum content container of 1140px. Tournament fixtures stack into 2-column modules, with lateral columns dedicated to live standings and tournament bracket visualization.
- **Component Padding Rhythm:** Standard card padding is strictly uniform at `1rem` to `1.25rem`. Compact quick-action chips maintain an internal horizontal padding of `0.75rem` and vertical clearance of `0.5rem`.

## Elevation & Depth

Visual hierarchy uses a refined multi-layer surface philosophy, relying on tinted canvases, soft ambient shadows, and crisp hairline boundaries rather than heavy skeuomorphism.

### Depth Levels:
- **Base Level (Canvas):** Colored `#F5F6FA`. No shadow. Provides a clean backdrop for foreground modules.
- **Level 1 (Cards & Modules):** Pure `#FFFFFF` surface accompanied by a subtle hairline border (`1px solid #E4E4E7`) and an ambient, low-opacity drop shadow: `0 2px 8px -2px rgba(24, 24, 27, 0.04), 0 1px 3px -1px rgba(24, 24, 27, 0.02)`.
- **Level 2 (Active Pills & Filter Capsules):** Active segment states or elevated dropdown selectors feature a faint violet-tinted glow shadow: `0 4px 12px -2px rgba(124, 92, 252, 0.25)`.
- **Level 3 (Floating Bars & Navigation Dock):** The bottom persistent tab bar floats with `0 8px 24px -4px rgba(124, 92, 252, 0.35)`, using a luminous solid `#7C5CFC` body with white iconography.

## Shapes

The shape structure employs generous, friendly radii that evoke modern consumer apps and contemporary digital sports hubs.

### Geometry Hierarchy:
- **Cards & Primary Modules:** Employ `rounded-xl` (1.5rem / 24px) to create soft, comfortable containers for match fixtures and tournament summaries.
- **Inner Sub-containers:** Score wrappers, prize blocks, and roster segments use `rounded-lg` (1rem / 16px).
- **Interactive Badges, Scores & Pills:** Fully pill-shaped (`rounded-full` / 9999px) for match validation pills, round indicators, status dots, and bottom dock active tabs.
- **Team Crests & Avatars:** Wrapped inside soft circular capsules or shield-cut rounded squares with a subtle 1px border.

## Components

### Buttons & Action Bars
- **Primary Buttons:** High-energy violet (`#7C5CFC`) or vibrant emerald (`#38C958`) fill with pure white typography, bold weight, rounded-xl (1rem or full-pill), and a forward arrow glyph on the right edge.
- **Secondary / Action Cards:** Light tinted backgrounds (e.g., `#F1EEFE` or `#F4F4F5`) with bold colored icons and dark text labels.
- **Floating Match CTA:** Floating pill-button (`+ Súmula / Jogo`) with violet fill, white text, and icon prefix for fast validation.

### Match & Fixture Cards
- **Structure:** Pure white card with 20–24px rounded corners and subtle border. Divided into two zones: top fixture matchup and bottom metadata action footer separated by a subtle border or generous whitespace.
- **Header:** Displays match time or round number on the left (`Rodada #1`), paired with a pill badge on the right (`Súmula Validada` in emerald tint, or `Bater Horário` in lilac tint).
- **Matchup Display:** Symmetrical 3-column row:
  - Left: Home team crest (40x40px) + Bold team name with small "Mandante" label underneath.
  - Center: Rounded capsule containing either the final score (`3 - 1`) or fixture state (`VS`).
  - Right: Away team crest + Bold team name with small "Visitante" label underneath.
- **Footer:** Informational label (`Rodada #1 • 5v5`) accompanied by an interactive text link with chevron (`Ver Súmula / Arte 4:5 >`).

### Pills & Tournament Status Badges
- **Live / Validated Status:** Emerald background tint (`#E8FAF0`) with `#10B981` text, accompanied by an optional pulse green dot (`4px`).
- **Pending / Action Status:** Lilac background tint (`#F1EEFE`) with `#7C5CFC` text for actionable items.
- **Capsule Scores:** `#F3F4F6` background, 800 weight font, 12px vertical padding, 18px horizontal padding, pill-rounded.

### Segmented Tournament Navigation Tabs
- Pill-shaped switcher spanning full width. Active tab gets `#7C5CFC` fill with pure white text and icon; inactive tabs feature transparent backgrounds, subtle gray icons, and `#71717A` text.

### Bottom App Bar Dock
- Floating continuous pill container with `#7C5CFC` fill, centered or fixed along the lower safe area.
- Active item encased within a pure white pill indicator with purple iconography; secondary navigation items use semi-transparent white icons (`0.7` opacity).