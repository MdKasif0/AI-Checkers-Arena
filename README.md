<div align="center">
  <h1>AI Checkers Arena</h1>
  <p><em>Watch the world's best AI models battle in International Checkers</em></p>
  
  <p>
    <a href="https://github.com/MdKasif0/AI-Checkers-Arena/actions"><img src="https://img.shields.io/github/actions/workflow/status/MdKasif0/AI-Checkers-Arena/deploy.yml?style=flat-square&color=D4AF37&labelColor=171717&logo=github" alt="Build Status" /></a>
    <a href="https://github.com/MdKasif0/AI-Checkers-Arena/blob/main/LICENSE"><img src="https://img.shields.io/github/license/MdKasif0/AI-Checkers-Arena?style=flat-square&color=D4AF37&labelColor=171717" alt="License" /></a>
    <img src="https://img.shields.io/badge/Next.js-15-171717?style=flat-square&logo=next.js&labelColor=0D0D0D" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-171717?style=flat-square&logo=typescript&labelColor=0D0D0D" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-171717?style=flat-square&logo=tailwindcss&labelColor=0D0D0D" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-Auth_&_DB-171717?style=flat-square&logo=supabase&labelColor=0D0D0D" alt="Supabase" />
    <img src="https://img.shields.io/badge/Netlify-Deployed-171717?style=flat-square&logo=netlify&labelColor=0D0D0D" alt="Netlify" />
    <a href="#contributing"><img src="https://img.shields.io/badge/PRs-Welcome-D4AF37?style=flat-square&labelColor=171717" alt="PRs Welcome" /></a>
  </p>
</div>

AI Checkers Arena is a live spectator platform where large language models compete head-to-head in full games of International Checkers. Powered by OpenRouter, this arena pits state-of-the-art models against each other in real-time. By utilizing a central game engine that strictly enforces rules and feeds identical, deterministic board states to both models, the platform guarantees a completely fair and transparent testing ground for AI reasoning and spatial logic.

> **Live Demo:** *Deployment link pending.*

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [How It Works: Fairness Principles](#how-it-works-fairness-principles)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License & Acknowledgments](#license--acknowledgments)

---

## Features

- **AI vs AI Battles:** Select from dozens of cutting-edge language models to face off autonomously.
- **Human vs AI:** Test your own skills against the models in interactive player matches.
- **Live Model Selector:** Dynamically load active models directly via the OpenRouter API.
- **Match History & Leaderboard:** Track win rates, illegal move penalties, and latency stats for every model.
- **Google Authentication:** Secure spectator and player sign-in powered by Supabase.
- **Dynamic Themes:** First-class Dark (charcoal) and Light (cream) theme support with persistent settings.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion |
| **Backend** | Next.js API Routes, Netlify Functions |
| **Database & Auth** | Supabase (PostgreSQL, GoTrue) |
| **AI Integration** | OpenRouter API |
| **Hosting** | Netlify |

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- A [Supabase](https://supabase.com/) project
- An [OpenRouter](https://openrouter.ai/) API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MdKasif0/AI-Checkers-Arena.git
   cd AI-Checkers-Arena
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   
   Populate `.env.local` with your credentials:

   | Variable | Description |
   |---|---|
   | `OPENROUTER_API_KEY` | Used by the backend to fetch AI moves. |
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (used by client & server). |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key for Supabase client initialization. |
   | `SUPABASE_SERVICE_ROLE_KEY` | Secret admin key for executing secure backend database queries. |

   *Note: For Google Sign-In to function locally, you must configure a Google OAuth Client in the Google Cloud Console and add the credentials to your Supabase project's Authentication settings.*

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` to view the application.

---

## How It Works: Fairness Principles

AI Checkers Arena is not merely a generic game demo—it is designed as a rigorous, deterministic testing environment for LLM spatial reasoning. 

To guarantee an absolute level playing field, the architecture adheres to strict fairness principles:
- **Engine-Controlled Board:** The AI models do not maintain their own board state. A centralized, deterministic game engine computes the legal moves and strictly enforces the rules.
- **Identical Prompts:** Both models receive the exact same structured text representation of the board, alongside identical system prompts and instructions.
- **Zero Hidden Information:** There is no hidden state or persistent memory given to the models beyond the standardized notation of the current board layout and the immediate legal moves available.
- **Illegal Move Penalties:** If an AI model hallucinates a move or attempts an illegal action, it is penalized and forced to retry. If it repeatedly fails, it forfeits the match.

---

## Roadmap

The following features are planned for future scope:
- **Tournament Mode:** Automated bracket generation and execution for massive multi-model championships.
- **Analysis Tooling:** Post-match review boards with step-by-step reasoning highlights and heatmap visualizations.
- **Data Export:** Download match histories and reasoning transcripts in JSON and PGN formats.

---

## Contributing

Contributions are welcome! If you're interested in improving the engine, adding new features, or fixing bugs, please follow these guidelines:

1. **Branch Naming:** Use descriptive prefixes (e.g., `feature/add-tournament-mode`, `fix/board-highlight-bug`).
2. **Pull Requests:** Keep PRs focused on a single logical change. Ensure all TypeScript strict checks and linting rules pass before requesting a review.
3. **Issues:** Before opening a PR for a major architectural change, please open an Issue to discuss the design.

---

## License & Acknowledgments

This project is licensed under the MIT License. See the `LICENSE` file for details.

- **[OpenRouter](https://openrouter.ai/)** for democratizing access to state-of-the-art AI models.
- **[Supabase](https://supabase.com/)** for seamless backend and authentication architecture.
- **[shadcn/ui](https://ui.shadcn.com/)** for the accessible, unstyled component foundations.
