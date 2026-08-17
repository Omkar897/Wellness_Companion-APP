import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MotionWrapper } from '../components/animations/MotionWrapper';
import { useSettingsStore } from '../store/settingsStore';
import { useUserStore } from '../store/userStore';
import { useJournalStore } from '../store/journalStore';
import { clearAllData, exportAllData } from '../services/storage/database';
import { examLabel } from '../utils/helpers';

export default function Settings() {
  const navigate = useNavigate();
  const { apiKey, demoMode, setApiKey, setDemoMode, reducedMotion, setReducedMotion } =
    useSettingsStore();
  const { profile, clearUser } = useUserStore();
  const { loadEntries } = useJournalStore();
  const [keyInput, setKeyInput] = useState(apiKey ?? '');
  const [keyStatus, setKeyStatus] = useState<'idle' | 'saved'>('idle');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  async function handleSaveKey() {
    await setApiKey(keyInput);
    setKeyStatus('saved');
    setTimeout(() => setKeyStatus('idle'), 2000);
  }

  async function handleClear() {
    clearAllData();
    clearUser();
    await setDemoMode(false);
    navigate('/onboarding');
  }

  async function handleExport() {
    const data = await exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wellness-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleToggleDemo() {
    await setDemoMode(!demoMode);
    if (!demoMode) {
      // When disabling demo, reload entries
      await loadEntries();
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-xl mx-auto">
      <MotionWrapper>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </MotionWrapper>

      {profile && (
        <MotionWrapper delay={0.05}>
          <Card>
            <h2 className="text-sm font-semibold text-white/70 mb-3">Profile</h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-600/40 border border-violet-500/30 flex items-center justify-center text-lg font-bold text-violet-300">
                {profile.name[0].toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium">{profile.name}</p>
                <p className="text-white/50 text-xs">{examLabel(profile.examType)}</p>
              </div>
            </div>
          </Card>
        </MotionWrapper>
      )}

      <MotionWrapper delay={0.1}>
        <Card>
          <h2 className="text-sm font-semibold text-white/70 mb-3">AI Integration</h2>
          <p className="text-xs text-white/40 mb-3 leading-relaxed">
            Enter your{' '}
            <a
              href="https://openrouter.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:underline"
            >
              OpenRouter
            </a>{' '}
            API key to enable full AI features. Without it, the app uses smart fallbacks.
          </p>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="sk-or-v1-..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="flex-1"
              aria-label="OpenRouter API key"
            />
            <Button variant="secondary" size="sm" onClick={handleSaveKey}>
              {keyStatus === 'saved' ? '✓ Saved' : 'Save'}
            </Button>
          </div>
        </Card>
      </MotionWrapper>

      <MotionWrapper delay={0.15}>
        <Card>
          <h2 className="text-sm font-semibold text-white/70 mb-3">Demo Mode</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Use sample student data</p>
              <p className="text-white/40 text-xs mt-0.5">
                Shows 7-day demo history without API keys
              </p>
            </div>
            <button
              role="switch"
              aria-checked={demoMode}
              onClick={handleToggleDemo}
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${demoMode ? 'bg-violet-600' : 'bg-white/20'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${demoMode ? 'translate-x-6' : ''}`}
              />
            </button>
          </div>
        </Card>
      </MotionWrapper>

      <MotionWrapper delay={0.2}>
        <Card>
          <h2 className="text-sm font-semibold text-white/70 mb-3">Accessibility</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Reduce motion</p>
              <p className="text-white/40 text-xs mt-0.5">Minimize animations throughout the app</p>
            </div>
            <button
              role="switch"
              aria-checked={reducedMotion}
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${reducedMotion ? 'bg-violet-600' : 'bg-white/20'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${reducedMotion ? 'translate-x-6' : ''}`}
              />
            </button>
          </div>
        </Card>
      </MotionWrapper>

      <MotionWrapper delay={0.25}>
        <Card>
          <h2 className="text-sm font-semibold text-white/70 mb-3">Data</h2>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" onClick={handleExport}>
              Export JSON
            </Button>
            <Button variant="danger" size="sm" onClick={() => setShowClearConfirm(true)}>
              Clear All Data
            </Button>
          </div>
          {showClearConfirm && (
            <div className="mt-3 p-3 rounded-xl bg-red-950/40 border border-red-500/30">
              <p className="text-red-300 text-sm mb-3">
                This will delete all your data. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={handleClear}>
                  Yes, Delete Everything
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      </MotionWrapper>
    </div>
  );
}
