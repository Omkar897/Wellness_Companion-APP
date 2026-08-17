import type { JournalEntry } from '../types/journal';
import type { WeeklyInsight } from '../types/journal';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const demoJournals: JournalEntry[] = [
  {
    id: 'demo-j-1',
    timestamp: daysAgo(0),
    input: "Had mock test today. Got 180/360. I know what went wrong — thermodynamics. Feeling anxious but also motivated to fix it.",
    mode: 'journal',
    emotions: ['anxiety', 'motivation', 'self_doubt'],
    triggers: ['mock test results', 'specific topic weakness'],
    severity: 6,
    burnoutRisk: 'medium',
    aiResponse: "Your ability to identify exactly what went wrong shows real analytical strength. Many students panic after a mock test — you're already ahead by pinpointing thermodynamics as the gap.",
    copingStrategies: [
      "Spend 45 minutes tomorrow morning reviewing only the specific thermodynamics concepts you missed — not the whole chapter",
      "Before your next mock, write down 3 things you're confident about",
      "Track your improvement: compare this score with your score 2 weeks ago",
    ],
    mindfulnessExercise: "4-7-8 breathing: Inhale for 4, hold for 7, exhale for 8. This activates your parasympathetic nervous system before sleep.",
  },
  {
    id: 'demo-j-2',
    timestamp: daysAgo(1),
    input: "Couldn't sleep last night thinking about JEE. Kept comparing myself to Rahul who's already done with organic chemistry revision twice.",
    mode: 'journal',
    emotions: ['anxiety', 'comparison', 'insomnia', 'self_doubt'],
    triggers: ['comparison with peers', 'late night overthinking', 'sleep disruption'],
    severity: 8,
    burnoutRisk: 'high',
    aiResponse: "Comparison with peers is one of the most common JEE stress triggers I see. Rahul's pace is Rahul's — your retention and understanding matter more than revision count.",
    copingStrategies: [
      "Set a 'no-study-content' phone rule after 10 PM",
      "Write a 2-minute gratitude journal entry before bed instead of reviewing peers' progress",
      "Schedule your organic chemistry revision for this week — having a plan reduces night anxiety",
    ],
    mindfulnessExercise: "Progressive muscle relaxation: Tense each muscle group for 5 seconds then release, starting from your toes up to your forehead.",
  },
  {
    id: 'demo-j-3',
    timestamp: daysAgo(2),
    input: "Actually had a good day. Completed integration chapter fully. Feeling confident.",
    mode: 'pulse',
    emotions: ['confidence', 'satisfaction', 'focus'],
    triggers: [],
    severity: 2,
    burnoutRisk: 'low',
    aiResponse: "This is the Arjun who will crack JEE. Completing integration fully is a significant milestone. Keep this momentum — note exactly what made today work.",
    copingStrategies: [
      "Document your study method from today — replicate it tomorrow",
      "Reward yourself with 30 minutes of something you enjoy tonight",
    ],
    mindfulnessExercise: "Mindful appreciation: Sit quietly for 2 minutes and notice 3 things you did well today.",
  },
  {
    id: 'demo-j-4',
    timestamp: daysAgo(3),
    input: "Physics is destroying me. Rotational dynamics questions make no sense. Spent 3 hours and solved only 2 problems correctly.",
    mode: 'journal',
    emotions: ['frustration', 'overwhelm', 'confusion'],
    triggers: ['specific topic difficulty', 'low productivity', 'time pressure'],
    severity: 7,
    burnoutRisk: 'medium',
    aiResponse: "Three hours on rotational dynamics and only 2 correct problems — that's not failure, that's identifying a conceptual gap before the exam does. This is exactly the right time to find this.",
    copingStrategies: [
      "Switch to video explanations for rotational dynamics instead of textbook — visual concepts click faster for this topic",
      "Solve 5 easy problems first to rebuild confidence, then attempt hard ones",
      "Take a 20-minute break with a short walk before returning to this chapter",
    ],
    mindfulnessExercise: "Box breathing: Inhale 4 counts, hold 4, exhale 4, hold 4. Do 3 rounds to reset focus.",
  },
  {
    id: 'demo-j-5',
    timestamp: daysAgo(5),
    input: "Quiz scenario: Lower mock score. I felt like avoiding the paper and distracting myself.",
    mode: 'quiz',
    emotions: ['avoidance', 'disappointment'],
    triggers: ['mock test results'],
    severity: 5,
    burnoutRisk: 'medium',
    aiResponse: "Avoidance after a disappointing score is a very human response. The instinct to protect yourself from further disappointment makes sense. But you reached out here — that shows self-awareness.",
    copingStrategies: [
      "Look at the paper only for 10 minutes — just to categorize mistakes as 'silly errors' vs 'conceptual gaps'",
      "Focus revision on only the conceptual gaps this week",
    ],
    mindfulnessExercise: "Grounding technique: Name 5 things you can see, 4 you can touch, 3 you can hear. This breaks the avoidance spiral.",
  },
  {
    id: 'demo-j-6',
    timestamp: daysAgo(6),
    input: "Good day for chemistry. Cleared 3 chapters of physical chemistry. Feeling okay.",
    mode: 'pulse',
    emotions: ['calm', 'satisfaction'],
    triggers: [],
    severity: 3,
    burnoutRisk: 'low',
    aiResponse: "Clearing 3 physical chemistry chapters in a day is excellent progress. Physical chemistry is JEE's hidden scorer — your preparation here will pay off.",
    copingStrategies: [
      "Do a quick 20-question revision test on these 3 chapters tomorrow morning",
      "Note the completion in a tracker — visible progress reduces anxiety",
    ],
    mindfulnessExercise: "Gratitude breathing: With each exhale, think of one thing that went well today.",
  },
  {
    id: 'demo-j-7',
    timestamp: daysAgo(7),
    input: "Family pressure is building. Parents keep asking about my rank prediction. I feel suffocated.",
    mode: 'journal',
    emotions: ['pressure', 'suffocation', 'anxiety', 'irritability'],
    triggers: ['family pressure', 'rank anxiety', 'external expectations'],
    severity: 7,
    burnoutRisk: 'medium',
    aiResponse: "Family pressure on top of exam stress is a double burden. Your parents' questions come from care, even when it doesn't feel that way. Having a conversation about boundaries can reduce this significantly.",
    copingStrategies: [
      "Set a weekly 'update time' with your parents — 10 minutes on Sunday. Outside that, redirect questions to that slot",
      "Share a specific milestone you achieved this week with them — redirect from rank to progress",
      "Write down what you're worried about separately from what your parents are worried about — they're often different things",
    ],
    mindfulnessExercise: "Body scan: Sit still for 3 minutes and notice where you're holding tension. Consciously breathe into that area and release.",
  },
];

export const demoWeeklyInsight: WeeklyInsight = {
  id: 'demo-insight-1',
  generatedAt: new Date().toISOString(),
  periodStart: daysAgo(7),
  periodEnd: daysAgo(0),
  patterns: [
    "Your anxiety peaks after mock tests and late at night — not during active study sessions",
    "Comparison with peers is a primary stress trigger, appearing in 3 of 7 entries",
    "You recover faster when you can identify a specific gap (e.g., thermodynamics) vs feeling generally overwhelmed",
    "Good days correlate with topic completion milestones, not performance scores",
  ],
  recurringTriggers: ['mock test results', 'comparison with peers', 'late night overthinking', 'family pressure'],
  recommendations: [
    "Implement a 10 PM study cutoff — your highest-anxiety entries are all late-night",
    "Keep a 'completed topics' tracker visible — it anchors your progress when comparison hits",
    "Schedule mock test reviews for mornings, not evenings — your analysis is clearer then",
    "One dedicated 'progress conversation' with parents per week reduces daily pressure",
  ],
  progressNote: "This week showed your full range — from 2/10 stress on your best day to 8/10 on your worst. What stands out is your ability to identify root causes. That metacognitive skill is exactly what separates top JEE scorers.",
  emotionData: demoJournals.map((j) => ({
    emotions: j.emotions,
    triggers: j.triggers,
    severity: j.severity,
    burnoutRisk: j.burnoutRisk,
    confidence: 0.88,
  })),
};
