<div align="center">

# 🎓 ALIX

### Active Learning & Interactive Experience

**Where Every Learner Participates.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socketdotio)](https://socket.io)
[![pnpm](https://img.shields.io/badge/pnpm-8-F69220?logo=pnpm)](https://pnpm.io)

</div>

---

**ALIX** is a premium, modern, interactive classroom learning platform designed to transform traditional lectures into engaging, collaborative and measurable learning experiences. Combining interactive assessments, classroom games, collaborative activities, peer instruction and learning analytics, ALIX ensures that every learner actively participates.

## ✨ Product Modules

| Module | Purpose & Capabilities |
|---|---|
| 🎮 **ALIX Play** | Live quizzes, timed competitions, multiplayer games and leaderboards |
| 📊 **ALIX Poll** | Live polls, opinion collection, classroom voting and response visualization |
| 💡 **ALIX Think** | Concept checks, critical-thinking exercises, debugging challenges and peer instruction |
| 👥 **ALIX Teams** | Team-based competitions, collaborative challenges and classroom activities |
| 📈 **ALIX Insights** | Student participation, question-wise performance, misconceptions and learning analytics |
| 🛠️ **ALIX Create** | Quiz creation, activity creation, question banks, imports and AI-assisted question generation |

## 🏗️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand, Framer Motion
- **Realtime:** Express, Socket.IO
- **State Management:** Zustand + React Query
- **Styling:** Tailwind CSS with custom ALIX design system
- **Monorepo:** pnpm workspaces
- **Build:** Vite (web), tsx (server)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18.0.0
- [pnpm](https://pnpm.io/) >= 8.0.0

### Install

```bash
# Clone the repository
git clone https://github.com/your-org/alix.git
cd alix

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
```

### Development

```bash
# Start all apps in parallel
pnpm dev

# Start only the web app
pnpm dev:web

# Start only the realtime server
pnpm dev:realtime
```

### Build

```bash
# Build all packages
pnpm build

# Build only the web app
pnpm build:web
```

## 📁 Project Structure

```
alix/
├── apps/
│   ├── web/                  # React SPA (Vite + Tailwind)
│   │   ├── src/
│   │   │   ├── components/   # Reusable UI components
│   │   │   ├── pages/        # Route page components
│   │   │   ├── App.tsx       # Router & layout
│   │   │   └── main.tsx      # Entry point
│   │   └── index.html
│   └── realtime/             # Socket.IO server (Express)
│       └── src/
│           ├── handlers/     # Socket event handlers
│           ├── engine/       # Game session & scoring logic
│           └── index.ts      # Server entry point
├── packages/
│   ├── shared/               # Shared TypeScript types & constants
│   ├── ui/                   # Design system & UI components
│   └── game-engine/          # Quiz game state machine & logic
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## 🎨 Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Indigo | `#6366F1` | Primary actions, CTAs |
| Violet | `#8B5CF6` | Accents, gradients |
| Cyan | `#06B6D4` | Information, highlights |
| Coral | `#F43F5E` | Alerts, game elements |

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for educators and learners everywhere.**

*ALIX – Where Every Learner Participates*

</div>
