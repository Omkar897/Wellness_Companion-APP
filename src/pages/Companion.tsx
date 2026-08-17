import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmotionBadge } from '../components/mood/EmotionBadge';
import { MotionWrapper } from '../components/animations/MotionWrapper';
import { callOpenRouter } from '../services/llm/openrouter';
import { checkInputSafety, checkResponseSafety } from '../services/llm/safetyGuard';
import { useUserStore } from '../store/userStore';
import { useSettingsStore } from '../store/settingsStore';
import { useMood } from '../hooks/useMood';
import { AI_MODELS } from '../utils/constants';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotions?: string[];
}

export default function Companion() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { profile, context } = useUserStore();
  const { apiKey, demoMode } = useSettingsStore();
  const { stats, latestEntry } = useMood();

  useEffect(() => {
    // Greeting message
    const greeting = profile
      ? `Hi ${profile.name}! I'm your AI wellness companion. I know you're preparing for ${profile.examType}. ${
          latestEntry
            ? `I can see your recent stress level was ${latestEntry.severity}/10 with ${latestEntry.emotions.slice(0, 2).join(' and ')} emotions.`
            : ''
        } What's on your mind today?`
      : "Hi! I'm your AI wellness companion. What's on your mind today?";

    setMessages([
      {
        id: '0',
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      },
    ]);
  }, [profile, latestEntry]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function buildSystemPrompt(): string {
    const parts = [
      `You are a compassionate AI wellness companion for ${profile?.name ?? 'a student'} preparing for ${profile?.examType ?? 'their exam'}.`,
      `Always be empathetic, personalized, and supportive. Never give generic advice.`,
    ];

    if (context) {
      parts.push(
        `Context: Dominant emotions: ${context.dominantEmotions.join(', ')}. Known triggers: ${context.commonTriggers.join(', ')}.`,
      );
    }

    if (stats.averageSeverity > 0) {
      parts.push(`Current average stress: ${stats.averageSeverity}/10. Trend: ${stats.trend}.`);
    }

    parts.push(
      `Keep responses concise (2-4 sentences) unless asked for detail. If you detect crisis signals, provide crisis resources immediately.`,
    );

    return parts.join(' ');
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const safety = checkInputSafety(input);
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    if (!safety.safe && safety.crisisMessage) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + '-crisis',
          role: 'assistant',
          content: safety.crisisMessage!,
          timestamp: new Date(),
        },
      ]);
      return;
    }

    setLoading(true);

    if (demoMode || !apiKey) {
      await new Promise((r) => setTimeout(r, 1200));
      const demoResponses = [
        `I understand that exam pressure can feel overwhelming sometimes. Based on what I know about your patterns, ${context?.commonTriggers[0] ? `${context.commonTriggers[0]} tends to trigger more stress for you.` : 'you tend to recover well when you focus on specific goals.'} What specific part feels hardest right now?`,
        `That's a really valid feeling. Many ${profile?.examType ?? 'exam'} students go through this. Remember that ${stats.trend === 'improving' ? "your recent trend shows improvement — you're moving in the right direction" : "progress isn't always linear and setbacks are part of the process"}. What would help most right now?`,
        `I hear you. Let's break this down. Would it help to try a quick breathing exercise, or would you prefer to talk through what's specifically bothering you today?`,
      ];
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: demoResponses[Math.floor(Math.random() * demoResponses.length)],
          timestamp: new Date(),
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const conversationHistory = messages.slice(-8).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const raw = await callOpenRouter(
        {
          model: AI_MODELS.WELLNESS_AGENT,
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            ...conversationHistory,
            { role: 'user', content: input },
          ],
          temperature: 0.75,
          max_tokens: 400,
        },
        apiKey,
      );

      const responseSafety = checkResponseSafety(raw);
      const content =
        !responseSafety.safe && responseSafety.crisisDetected
          ? (responseSafety.crisisMessage ?? raw)
          : raw;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + '-err',
          role: 'assistant',
          content:
            "I'm having trouble connecting right now. Please check your API key in settings, or switch to demo mode.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto h-full">
      <MotionWrapper>
        <h1 className="text-2xl font-bold text-white">AI Companion</h1>
        <p className="text-white/50 text-sm mt-1">Context-aware conversations powered by Gemma 3</p>
      </MotionWrapper>

      {/* Context banner */}
      {context && (
        <MotionWrapper delay={0.05}>
          <div className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-xs text-white/40 overflow-x-auto">
            <span className="shrink-0">Context:</span>
            {context.dominantEmotions.slice(0, 3).map((e) => (
              <EmotionBadge key={e} emotion={e} size="sm" animate={false} />
            ))}
          </div>
        </MotionWrapper>
      )}

      {/* Chat messages */}
      <Card className="flex flex-col gap-3 min-h-[400px] max-h-[500px] overflow-y-auto py-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-violet-600/40 text-white border border-violet-500/30 rounded-br-sm'
                    : 'glass text-white/80 rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="glass px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-violet-400"
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ duration: 0.7, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </Card>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type a message... (Enter to send)"
          disabled={loading}
          aria-label="Message to AI companion"
          className="flex-1 px-4 py-3 glass rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500 border border-transparent transition-all"
        />
        <Button
          variant="primary"
          onClick={sendMessage}
          disabled={!input.trim()}
          loading={loading}
          aria-label="Send message"
        >
          ↑
        </Button>
      </div>
    </div>
  );
}
