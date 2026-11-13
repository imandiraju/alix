# ALIX Brand Guidelines & Design System

> **Official Name:** ALIX  
> **Full Form:** Active Learning & Interactive Experience  
> **Primary Tagline:** Where Every Learner Participates.  
> **Brand Positioning:** A premium, modern, interactive classroom learning platform designed to transform traditional lectures into engaging, collaborative, and measurable learning experiences.

---

## 1. Brand Identity & Personality

ALIX is an integrated active-learning platform combining interactive assessments, classroom games, collaborative activities, peer instruction, and actionable learning analytics. It is designed to feel like an international, premium EdTech SaaS application — intelligent, engaging, streamlined, and accessible.

### Core Brand Attributes
- **Premium Technology:** High aesthetic standards, crisp typography, responsive micro-interactions.
- **Intelligence:** Data-informed insights, thoughtful pacing, pedagogical effectiveness.
- **Interaction:** Dynamic real-time synchronisation, collective engagement, active participation.
- **Engagement:** Gamification with pedagogical purpose, friendly rivalry, and team collaboration.
- **Simplicity:** Frictionless student onboarding (no account required for students via 6-digit PIN), intuitive instructor controls.
- **Accessibility:** WCAG 2.1 AA compliant color contrast, scalable typography, reduced-motion fallbacks.

---

## 2. Visual Identity & Logo System

### 2.1 The ALIX Symbol
The ALIX mark features a stylized geometric **"A"** constructed from two dynamic overlapping angled beams, anchored by a vibrant apex node. This symbol embodies:
1. Two entities converging in collaboration and interactive learning.
2. An upward arrow representing progress, insight, and achievement.
3. The geometric foundation of the letter "A".

### 2.2 Logo Variations
- **Primary Logo (`logo-primary.svg`):** Deep Indigo text (`#1E1B4B`) paired with an Electric Violet (`#7C3AED`) gradient-filled "A" symbol and cyan/violet accents. Ideal for light backgrounds (`#FFFFFF`, `#F8FAFC`).
- **Monochrome Logo (`logo-monochrome.svg`):** Single-color deep indigo (`#1E1B4B`) silhouette. Used in print, single-color embroidery, or constrained collateral.
- **White / Inverted Logo (`logo-white.svg`):** Pure white (`#FFFFFF`) version for dark mode, projector dark screens, and saturated backgrounds.
- **Logo with Tagline (`logo-with-tagline.svg`):** Includes "ACTIVE LEARNING & INTERACTIVE EXPERIENCE" in tracked geometric sans below the wordmark.
- **Favicon & App Icon (`favicon.svg`, `app-icon.svg`):** Isolated geometric "A" icon scaled for browser tabs (32×32) and application squares (512×512) with rounded squircle framing.

### 2.3 Logo Clear Space & Minimum Sizes
- **Clear Space:** Maintain minimum clear space equal to `0.5 × (height of the logo)` on all four sides.
- **Minimum Digital Size:**
  - Full wordmark: `120px` width
  - Icon only: `24px` width / height
- **Usage Violations (Don'ts):**
  - Do NOT distort, skew, stretch, or rotate the logo.
  - Do NOT substitute unapproved colors or low-contrast backgrounds.
  - Do NOT place the dark logo on saturated or dark backgrounds.
  - Do NOT refer to the application by any obsolete or third-party names.

---

## 3. Color Architecture & Design Tokens

ALIX uses an authoritative, modern palette anchored by Deep Indigo and Electric Violet, with energetic accents of Cyan and Coral.

### 3.1 Primary Brand Colors

| Swatch | Color Name | Hex Code | HSL | RGB | Role / Usage |
|:---:|---|---|---|---|---|
| ![#1E1B4B](https://via.placeholder.com/15/1E1B4B/000000?text=+) | **Deep Indigo** | `#1E1B4B` | `244°, 47%, 20%` | `30, 27, 75` | Primary brand anchor, dark headings, high-contrast UI chrome |
| ![#7C3AED](https://via.placeholder.com/15/7C3AED/000000?text=+) | **Electric Violet** | `#7C3AED` | `262°, 83%, 58%` | `124, 58, 237` | Vibrant brand signature, primary CTA, active states, key gradients |
| ![#06B6D4](https://via.placeholder.com/15/06B6D4/000000?text=+) | **Cyan Accent** | `#06B6D4` | `189°, 94%, 43%` | `6, 182, 212` | Supporting accent, real-time indicators, poll visualization, speed bonus |
| ![#F97316](https://via.placeholder.com/15/F97316/000000?text=+) | **Coral Accent** | `#F97316` | `25°, 95%, 53%` | `249, 115, 22` | Urgency countdowns, streak celebrations, secondary highlights |

### 3.2 Neutral Backgrounds & Canvas

| Color Name | Hex Code | Usage |
|---|---|---|
| **Canvas Pure** | `#FFFFFF` | Card surfaces, modals, clean input backgrounds |
| **Canvas Light** | `#F8FAFC` | Primary application background (clean off-white) |
| **Canvas Muted** | `#F1F5F9` | Secondary containers, table header fills, sidebar track |
| **Border Soft** | `#E2E8F0` | Structural dividers, subtle card borders |
| **Border Focus** | `#7C3AED` | Primary focus ring token |

### 3.3 Text Colors

| Token | Hex Code | Contrast on Light |
|---|---|---|
| `--color-text-primary` | `#0F172A` | 16.5:1 (AAA) |
| `--color-text-secondary` | `#475569` | 7.2:1 (AAA) |
| `--color-text-muted` | `#94A3B8` | 3.1:1 (Non-body/labels) |
| `--color-text-inverted` | `#FFFFFF` | Used on Indigo & Violet surfaces |

### 3.4 Semantic Signals

- **Success (`#10B981`):** Correct answers, positive scores, confirmed status.
- **Error (`#EF4444`):** Incorrect submissions, validation alerts, session termination.
- **Warning (`#F59E0B`):** Time expiry warnings, streak resets.
- **Info (`#3B82F6`):** General system notifications and tooltips.

---

## 4. Typography Scale & Hierarchy

- **Headings Font Family:** `Space Grotesk`, `Inter`, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif.
- **Body Font Family:** `Inter`, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
- **Monospace (PIN Codes, Timers, Code):** `JetBrains Mono`, `Fira Code`, monospace.

### Type Scale

| Style | Size | Line Height | Weight | Tracking | Usage |
|---|---|---|---|---|---|
| **Display 2XL** | `4.5rem` (72px) | `1.1` | 800 Bold | `-0.025em` | Hero titles, Projector pin code |
| **Display XL** | `3.75rem` (60px) | `1.15` | 800 Bold | `-0.025em` | Big countdown timer, Winner screen |
| **Heading 1** | `2.25rem` (36px) | `1.25` | 700 Bold | `-0.02em` | Dashboard primary page headers |
| **Heading 2** | `1.875rem` (30px) | `1.3` | 700 Bold | `-0.015em` | Modal titles, Section headers |
| **Heading 3** | `1.5rem` (24px) | `1.35` | 600 SemiBold | `-0.01em` | Question titles, Card group headings |
| **Body Large** | `1.125rem` (18px) | `1.5` | 400 / 500 | `normal` | Subheads, Question option choices |
| **Body Base** | `1.0rem` (16px) | `1.5` | 400 Regular | `normal` | General copy, inputs, table values |
| **Body Small** | `0.875rem` (14px) | `1.4` | 500 Medium | `normal` | Metadata, badges, caption labels |
| **PIN Code** | `2.5rem` (40px) | `1.0` | 700 Bold | `0.25em` | Game PIN digit boxes |

---

## 5. Spacing, Elevation & Radii

### 5.1 Spacing Scale
Built on an 8pt / 4pt grid system:
`4px` (xs), `8px` (sm), `12px` (md), `16px` (lg), `24px` (xl), `32px` (2xl), `48px` (3xl), `64px` (4xl).

### 5.2 Border Radii
- **`rounded-sm` (4px):** Checkboxes, tags, subtle badges.
- **`rounded-md` (8px):** Form inputs, secondary buttons, tooltips.
- **`rounded-lg` (12px):** Standard cards, option buttons, modals.
- **`rounded-xl` (16px):** Projector cards, hero containers.
- **`rounded-2xl` (24px):** Large game screen tiles, floating panels.
- **`rounded-full` (9999px):** Avatars, pill chips, status dots.

### 5.3 Elevation & Shadows
- **Level 1 (Subtle):** `0 1px 3px 0 rgba(30, 27, 75, 0.06), 0 1px 2px 0 rgba(30, 27, 75, 0.04)`
- **Level 2 (Cards):** `0 4px 6px -1px rgba(30, 27, 75, 0.08), 0 2px 4px -1px rgba(30, 27, 75, 0.04)`
- **Level 3 (Modals/Active):** `0 10px 15px -3px rgba(30, 27, 75, 0.12), 0 4px 6px -2px rgba(30, 27, 75, 0.06)`
- **Level 4 (Glow/Electric):** `0 0 20px 2px rgba(124, 58, 237, 0.35)`

---

## 6. Product Modules Architecture

The ALIX platform comprises six core pillars sharing unified design tokens and socket infrastructure:

| Module Name | Purpose | Visual Marker |
|---|---|---|
| **ALIX Play** | Live competitive quizzes, timed challenges, leaderboards | Violet / Coral theme |
| **ALIX Poll** | Live classroom opinion polling, instant sentiment distribution | Cyan / Indigo theme |
| **ALIX Think** | Concept checks, peer-instruction rounds, discussion prompts | Emerald / Violet theme |
| **ALIX Teams** | Collaborative group gameplay, shared team scores | Amber / Violet theme |
| **ALIX Insights** | Real-time mastery analytics, question performance, reports | Cyan / Slate theme |
| **ALIX Create** | Interactive authoring suite, question banks, AI generators | Violet / Indigo theme |

---

## 7. UI Copy & Editorial Consistency

Standard terminology across all user experiences:

| Context | Approved Copy | Avoid / Deprecated |
|---|---|---|
| Browser Page Title | `ALIX – Active Learning & Interactive Experience` | Quiz, Exam Portal |
| Teacher Dashboard Welcome | `Welcome to ALIX` | Dashboard, Admin Home |
| Student Join Page | `Join ALIX` | Student Login, Take Test |
| Active Live Session | `ALIX Live` | Game Room, Quiz Room |
| Activity Catalog | `My ALIX Activities` | My Quizzes, Test Bank |
| Learning Analytics | `ALIX Insights` | Scoreboard, Exam Results |
| Landing Headline | `Make Every Classroom Interactive.` | Online Quiz Maker |
| Landing Subtext | `Turn lectures into engaging experiences where every learner participates.` | Test your students |
| Game Passcode | `PIN` or `Session Code` | Room Secret, Quiz ID |

---

## 8. Screen Specific Guidance

### 8.1 Desktop Dashboard (Instructors)
- Spacious sidebar navigation referencing the 6 core modules with official SVG icons.
- Light off-white canvas with clean elevated white cards.
- Quick action pills to immediately launch "ALIX Live" or author in "ALIX Create".

### 8.2 Student Interface (Mobile / Tablet)
- Zero clutter: High contrast, oversized tap targets (minimum 54px touch targets).
- Distinct option colors:
  - Option A: Coral (`#F97316`)
  - Option B: Electric Violet (`#7C3AED`)
  - Option C: Cyan (`#06B6D4`)
  - Option D: Emerald (`#10B981`)
- Tactile feedback: animated ripple and spring scale on response selection.

### 8.3 Classroom Projector / Presentation Screen
- High-legibility view designed to be read from 10 meters distance in ambient light.
- Extra-large 6-digit session PIN and QR code preview.
- Smooth live participant counter and animated podium reveals.
