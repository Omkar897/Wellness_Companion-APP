# WellnessAI

### AI-Powered Mental Wellness Companion for Competitive Exam Students

WellnessAI is an AI-powered mental wellness companion designed for students preparing for high-pressure competitive exams such as JEE, NEET, CAT, UPSC and similar exams.

Competitive exam preparation is not only a productivity problem. Students regularly deal with stress, anxiety, poor mock-test performance, peer comparison, burnout, lack of motivation and exam pressure.

WellnessAI focuses on that part of the student's experience.

The core idea is:

> **Log → Understand → Respond → Track**

A student can record how they feel, write about what is bothering them, or interact with the AI companion. The application analyzes emotional signals, identifies recurring triggers and provides personalized wellness suggestions.

---

## What it does

### Mood Tracking

Students can quickly record their current mood using a simple mood selector.

Mood history is used to understand changes in emotional state over time.

### Journaling

Students can write about their day, studies, exams, frustrations or anything affecting their mental state.

Journal entries provide unstructured context that can be analyzed by the AI.

### AI Emotion Analysis

Journal entries can be analyzed to identify:

- Emotions
- Possible triggers
- Stress severity
- Burnout indicators

The extracted information is converted into structured data so it can be used by the rest of the application.

### AI Wellness Companion

The companion uses the student's current emotional state together with historical patterns to generate a more contextual response.

Instead of only responding to the current message, the system can consider recurring emotions, triggers and previously observed patterns.

### Scenario-Based Wellness Quiz

The application includes an interactive scenario-based quiz.

This provides another way for students to express how they feel without requiring them to write a journal entry.

### Wellness Insights

Historical mood and journal information can be analyzed to identify patterns such as recurring emotions and triggers.

The goal is to make the application useful beyond a single conversation.

### Mindfulness and Grounding

The application provides exercises intended to help students calm down, reset and manage stressful moments.

### Safety Layer

Because the application deals with sensitive wellness information, AI responses are passed through a safety layer.

The application includes detection for crisis/self-harm signals and unsafe medical-advice patterns and can redirect users toward appropriate crisis support instead of continuing with a normal wellness response.

> WellnessAI is a wellness-support application and is not intended to diagnose, treat or replace professional mental-health care.

### Privacy-First Storage

Wellness information is sensitive.

The application uses encrypted local storage for user data rather than automatically storing the user's complete wellness history on a remote database.

The application also supports exporting wellness records as JSON.

### Demo Mode

The application includes demo data so the product can be explored without requiring an AI provider account.

This allows the product experience to be demonstrated without requiring users to configure AI infrastructure.

---

## Product Flow

```text
                 Student
                    |
          +---------+---------+
          |         |         |
        Mood     Journal     Quiz
          |         |         |
          +---------+---------+
                    |
              AI Analysis
                    |
        +-----------+-----------+
        |           |           |
     Emotion      Triggers    Severity
        |           |           |
        +-----------+-----------+
                    |
          Personalized Response
                    |
             Wellness Action
                    |
             Track Progress
                    |
          Longitudinal Insights
```

---

## Architecture

The application uses a feature-oriented React architecture.

```text
src/
├── app/
├── components/
├── features/
│   ├── companion/
│   ├── dashboard/
│   ├── insights/
│   ├── journal/
│   ├── mindfulness/
│   ├── mood/
│   ├── onboarding/
│   └── settings/
├── hooks/
├── services/
│   ├── llm/
│   └── storage/
├── store/
├── types/
├── utils/
└── ...
```

### AI Layer

AI functionality is separated into independent responsibilities:

```text
AI Services
│
├── Emotion Extraction
├── Wellness Response Generation
├── Pattern Analysis
├── Response Caching
└── Safety Guard
```

Separating these responsibilities makes the AI layer easier to test, replace and extend.

### Storage Layer

User wellness data is accessed through a storage abstraction rather than directly from UI components.

```text
UI
 ↓
Store
 ↓
Database Abstraction
 ↓
Encrypted Local Storage
```

This keeps persistence concerns separate from the application UI.

---

## Privacy

The application handles sensitive information such as journal entries, moods and emotional patterns.

The prototype therefore follows a local-first approach where possible.

Stored wellness information is encrypted using the Web Crypto API.

The goal is to minimize unnecessary collection of personal wellness data.

For production, AI provider credentials should remain server-side and should never be exposed to the browser.

---

## AI Provider

The application uses OpenRouter for AI inference.

AI provider credentials should be stored only as server-side environment variables.

The browser should communicate with the application's API layer rather than directly exposing the provider API key.

The application also supports demo/fallback behavior so that the core experience does not depend entirely on live AI availability.

---

## Security Considerations

Important security considerations for a production deployment include:

* Never exposing provider API keys in client-side JavaScript.
* Keeping AI provider credentials in server-side environment variables.
* Validating AI responses before using them in the application.
* Keeping sensitive wellness data encrypted.
* Applying safety checks to AI input and output.
* Adding rate limiting and abuse prevention at the API layer.
* Providing users with clear controls for their stored data.

---

## Tech Stack

* React
* TypeScript
* Vite
* Zustand
* Tailwind CSS
* OpenRouter
* Web Crypto API
* Vitest
* ESLint

---

## Running Locally

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Test

```bash
npm test
```

---

## Environment Variables

For live AI functionality, configure the required OpenRouter credential through the server-side environment.

The provider secret should use:

```text
OPENROUTER_API_KEY=your_key_here
```

Do **not** expose the provider credential using a `VITE_` client-side environment variable.

The application should remain usable through demo/fallback functionality when live AI is not configured.

---

## Deployment

The application is deployed using Vercel.

**Live Application:**
[https://wellness-companion-sepia.vercel.app/](https://wellness-companion-sepia.vercel.app/)

**GitHub Repository:**
[https://github.com/Omkar897/Wellness_Companion-APP](https://github.com/Omkar897/Wellness_Companion-APP)

---

## Future Direction

The next stage of WellnessAI would focus on making the wellness intelligence more longitudinal and personalized.

Potential improvements include:

* Server-side AI architecture
* Stronger stress/burnout signal modeling
* Intervention effectiveness tracking
* Personalized coping strategies
* Better longitudinal pattern detection
* Stronger crisis-safety architecture
* User-controlled data deletion/export
* Privacy controls
* Rate limiting and abuse prevention
* Model routing and cost optimization

The long-term product loop is:

```text
Student Activity
      ↓
Mood + Journal + Quiz Signals
      ↓
Emotion / Stress Understanding
      ↓
Longitudinal Pattern Detection
      ↓
Personalized Intervention
      ↓
Measure Whether It Helped
      ↓
Learn Individual Patterns
      ↓
Better Intervention
```

WellnessAI is intended to be a focused wellness companion for students under academic pressure rather than a generic mental-health chatbot.