import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useSettingsStore } from '../store/settingsStore';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

interface ProvidersProps {
  children: React.ReactNode;
}

function AppInitializer({ children }: ProvidersProps) {
  const { loadFromStorage } = useUserStore();
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    Promise.all([loadFromStorage(), loadSettings()]).catch((err) => {
      console.error('[AppInit] Failed to load stored data:', err);
    });
  }, [loadFromStorage, loadSettings]);

  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppInitializer>{children}</AppInitializer>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
