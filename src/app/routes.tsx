import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { useUserStore } from '../store/userStore';

const Dashboard    = lazy(() => import('../pages/Dashboard'));
const Journal      = lazy(() => import('../pages/Journal'));
const Insights     = lazy(() => import('../pages/Insights'));
const Companion    = lazy(() => import('../pages/Companion'));
const Mindfulness  = lazy(() => import('../pages/Mindfulness'));
const Onboarding   = lazy(() => import('../pages/Onboarding'));
const Settings     = lazy(() => import('../pages/Settings'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

function RequireProfile({ children }: { children: React.ReactNode }) {
  const { profile } = useUserStore();
  return profile ? <>{children}</> : <Navigate to="/onboarding" replace />;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<Layout />}>
          <Route path="/" element={<RequireProfile><Dashboard /></RequireProfile>} />
          <Route path="/journal" element={<RequireProfile><Journal /></RequireProfile>} />
          <Route path="/insights" element={<RequireProfile><Insights /></RequireProfile>} />
          <Route path="/companion" element={<RequireProfile><Companion /></RequireProfile>} />
          <Route path="/mindfulness" element={<RequireProfile><Mindfulness /></RequireProfile>} />
          <Route path="/settings" element={<RequireProfile><Settings /></RequireProfile>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
