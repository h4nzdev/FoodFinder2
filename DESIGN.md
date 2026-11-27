# FoodFinder — Stitch Design System (`DESIGN.md`)

## 1. Visual Direction & Design Paradigm
- **Style**: **Tactile Neumorphism (Soft UI)** paired with high-contrast culinary clarity.
- **Color Rule (60-30-10)**:
  - **60% Soft Alabaster & Lavender-White Canvas** (`#EFEBF7` background, `#F7F5FC` raised surface, `#FFFFFF` specular light source, `#D5CCE8` ambient shadow).
  - **30% Deep Royal Purple** (`#2D1654` primary ink/surface, `#43237A` interactive purple, `#513B73` secondary text).
  - **10% Warm Culinary Amber Gold (Recommended 3rd Color)** (`#F59E0B` primary accent, `#D97706` deep amber, `#FEF3C7` soft amber tint) — used strictly for high-value focal points: Verified Menu badges, active destination beacons, OSRM route highlights, and primary call-to-action icons.

## 2. Design Tokens

| Token | Value | Role |
| :--- | :--- | :--- |
| `--color-background` | `#EFEBF7` | 60% Neumorphic base canvas |
| `--color-surface` | `#F7F5FC` | Raised neumorphic card & control surface |
| `--color-surface-pure` | `#FFFFFF` | Specular highlight & elevated inner cards |
| `--color-primary` | `#2D1654` | 30% Deep Royal Purple (headings, primary buttons, route line) |
| `--color-primary-mid` | `#43237A` | Interactive dark purple hover & secondary surface |
| `--color-secondary` | `#513B73` | Body copy & restaurant metadata |
| `--color-muted` | `#8472A0` | Muted captions, index numerals, and placeholders |
| `--color-accent` | `#F59E0B` | 10% Warm Amber Gold focal accent |
| `--color-accent-deep` | `#B45309` | Accessible amber-gold label contrast on light surfaces |
| `--color-accent-soft` | `#FEF3C7` | Soft amber badge background |
| `--neu-raised` | `7px 7px 16px #D5CCE8, -7px -7px 16px #FFFFFF` | Standard extruded neumorphic card |
| `--neu-raised-sm` | `4px 4px 9px #D5CCE8, -4px -4px 9px #FFFFFF` | Tactile neumorphic button / chip |
| `--neu-inset` | `inset 4px 4px 8px #D5CCE8, inset -4px -4px 8px #FFFFFF` | Recessed search input & segmented track |

## 3. Typography
- **Headlines & Prices**: `'Playfair Display'`, `'Fraunces'`, serif (`600`–`700` weight, `-0.02em` tracking).
- **Body, Navigation & Controls**: `'DM Sans'`, sans-serif (`400`–`700` weight).

## 4. Component Architecture & Accessibility
- **Semantic Structure**: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`.
- **Focus & Contrast**: Visible `2px solid var(--color-accent)` / `var(--color-primary)` focus rings (`:focus-visible`) and WCAG AA/AAA text contrast (`#2D1654` on `#EFEBF7` = 11.8:1).
- **Responsive Degradation**: Desktop split-screen discovery (`490px` tactile sidebar + interactive map) transitions into a map-first mobile layout with a floating neumorphic bottom sheet (<768px).
