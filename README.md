# WellnessAI — AI Mental Wellness Companion for Exam Students

> A personalized, privacy-first mental wellness app built for students preparing for high-stakes competitive exams (JEE, NEET, CAT, UPSC, GATE, CUET, and more). Powered by multi-model AI via OpenRouter.

---

## What It Does

Competitive exam preparation in India is one of the highest-stress environments a student can be in. WellnessAI gives students a private, judgment-free space to process their emotions daily — and responds with AI analysis that is specific to *their* exam, *their* triggers, and *their* history. Not generic advice. Not platitudes.

**Core capabilities:**

- **AI Emotion Analysis** — Llama 3.3 70B extracts emotions, triggers, severity (1–10), and burnout risk from free-text journal entries
- **Personalized Wellness Responses** — Gemma 3 27B generates exam-aware coping strategies and mindfulness exercises. Banned phrases include "Take breaks", "You've got this", "Stay positive" — the AI is forced to reference the student's specific exam and stated triggers
- **Gamified Scenario Quiz** — 4 one-at-a-time scenarios with spring-physics animations reveal emotional patterns without requiring the student to write anything
- **Mood Pulse** — One-tap mood logging with instant AI feedback
- **Weekly Pattern Analysis** — Nemotron 253B identifies weekly stress patterns and generates structured recommendations
- **Crisis Detection** — Every input and output is scanned for self-harm signals. Crisis resources (iCall: 9152987821, Vandrevala: 1860-2662-345) are surfaced immediately
- **Exam Countdown** — Personalised dashboard with days-to-exam, mood ring, and trend tracking
- **Mindfulness Exercises** — Breathing, grounding, and body-scan exercises
- **Demo Mode** — Full 7-day realistic demo with a JEE student's journal data, no API key required

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 6 + Vite 8 |
| Styling | TailwindCSS v4 (`@tailwindcss/vite`) |
| Animations | Framer Motion 12 (spring physics, `AnimatePresence`, `useReducedMotion`) |
| State | Zustand 5 (3 stores: user, journal, settings) |
| Validation | Zod v4 (`zod/v4` sub-path) |
| Forms | React Hook Form v7 |
| Charts | Recharts |
| Routing | React Router v7 |
| AI | OpenRouter API (3 models) |
| Storage | AES-GCM encrypted localStorage (Web Crypto API) |
| Testing | Vitest 4 + Testing Library (101 tests) |
| Linting | ESLint flat config + Prettier |
| Deployment | Vercel |

### AI Models

| Task | Model |
|------|-------|
| Emotion extraction | `meta-llama/llama-3.3-70b-instruct` |
| Wellness responses | `google/gemma-3-27b-it` |
| Weekly pattern analysis | `nvidia/llama-3.1-nemotron-ultra-253b-v1:free` |

---

## Project Structure

```
src/
├── app/              # Router, providers, error boundary
├── components/
│   ├── animations/   # FloatingBackground, MotionWrapper, PageTransition
│   ├── charts/       # MoodTimeline, EmotionHeatmap (Recharts)
│   ├── journal/      # JournalEditor, AIResponseCard, GamifiedQuiz, InsightCard
│   ├── layout/       # Navbar (SVG icons), Layout
│   ├── mood/         # MoodRing, MoodSelector, EmotionBadge
│   └── ui/           # Button, Card, Input, Modal, ErrorBoundary
├── hooks/            # useAI, useMood, useLocalStorage, useReducedMotion
├── mock/             # Demo user profile + 7-day realistic journal data
├── pages/            # Dashboard, Journal, Insights, Companion, Mindfulness, Onboarding, Settings
├── services/
│   ├── analytics/    # moodEngine (timeline, stats, frequency, trends)
│   ├── llm/          # emotionExtractor, wellnessAgent, patternAnalyzer, safetyGuard, responseCache
│   └── storage/      # encryptedStorage (AES-GCM), database
├── store/            # userStore, journalStore, settingsStore (Zustand)
├── tests/            # 101 tests across 6 files
├── types/            # emotion, journal, user, ai
└── utils/            # helpers, constants, crypto, validators
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- An [OpenRouter](https://openrouter.ai) API key (free tier works)

### Local Setup

```bash
# Clone the repo
git clone https://github.com/Omkar897/Wellness_Companion.git
cd Wellness_Companion

# Install dependencies
npm install

# Set your API key
echo "VITE_OPENROUTER_KEY=sk-or-v1-your-key-here" > .env.local

# Start development server
npm run dev
```

Open **https://wellness-companion-sepia.vercel.app/**

> No API key? Use **Demo Mode** on the Settings page to explore with realistic sample data.

---

## Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build (tsc + vite)
npm run lint         # ESLint with zero-warning policy
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Prettier format all src files
npm test             # Run 101 Vitest tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
npm run preview      # Preview production build
```

---

## Deployment (Vercel)

1. Import `Omkar897/Wellness_Companion` from GitHub on [vercel.com](https://vercel.com)
2. Vercel auto-detects Vite — no build config needed
3. Add one environment variable:

   | Name | Value |
   |------|-------|
   | `VITE_OPENROUTER_KEY` | your OpenRouter API key |

4. Deploy

---

## Security & Privacy

- **All journal data is stored locally** in the user's browser — nothing is sent to any backend server
- **AES-GCM encryption** is applied to all localStorage entries using a per-device key generated via the Web Crypto API
- **API key** is stored encrypted in localStorage or injected via environment variable — never hardcoded
- **Crisis detection** runs on every AI input and output before display
- **No tracking, no analytics, no external data collection**

---

## Test Coverage

101 tests across 6 test suites:

| Suite | Tests | Coverage |
|-------|-------|---------|
| `emotion.test.ts` | 13 | Keyword detection, trigger extraction, severity boundary clamping |
| `journalFlow.test.ts` | 19 | Mood timeline, stats aggregation, trend detection, emotion frequency |
| `helpers.test.ts` | 23 | `daysUntilExam`, `formatRelativeTime`, `severityToLabel/Color`, `generateId`, `clamp` |
| `validators.test.ts` | 19 | UserProfile schema, JournalEntry schema, ApiKey schema |
| `safetyGuard.test.ts` | 14 | Crisis pattern detection, safe phrase pass-through, Indian helpline numbers |
| `storage.test.ts` | 13 | Encryption key uniqueness, base64 validity, storage key collision detection |

```bash
npm test
# ✓ 101/101 tests passing
```

---

## Key Design Decisions

**Why not a backend?** Privacy-first design. Students journaling about mental health need to know their data cannot be accessed by anyone. A backend-less architecture with client-side encryption achieves this.

**Why multiple AI models?** Each model has a different strength — Llama 3.3 70B excels at structured extraction, Gemma 3 27B at empathetic long-form generation, Nemotron at analytical reasoning over patterns.

**Why ban generic phrases in AI prompts?** Early testing showed AI responses defaulted to "Take breaks" and "Believe in yourself" — phrases that students preparing for JEE/NEET have heard a thousand times and that carry zero actionable weight. The system prompt explicitly bans these and requires the model to reference the student's specific exam, triggers, and history.

---

## License

MIT

