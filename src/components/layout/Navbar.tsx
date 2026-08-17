import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserStore } from '../../store/userStore';
import { useSettingsStore } from '../../store/settingsStore';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  { path: '/journal', label: 'Journal', icon: '📝' },
  { path: '/insights', label: 'Insights', icon: '📊' },
  { path: '/companion', label: 'Companion', icon: '🤖' },
  { path: '/mindfulness', label: 'Mindfulness', icon: '🧘' },
];

export function Navbar() {
  const { profile } = useUserStore();
  const { demoMode } = useSettingsStore();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/10 px-2 py-2 md:relative md:border-t-0 md:border-b md:py-0"
      aria-label="Main navigation"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo (desktop) */}
        <div className="hidden md:flex items-center gap-3 px-4 py-3">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-sm" aria-hidden>✨</div>
          <span className="text-white font-semibold text-sm">WellnessAI</span>
          {demoMode && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300">Demo</span>
          )}
        </div>

        {/* Nav links */}
        <ul className="flex items-center gap-1 flex-1 justify-around md:justify-center md:gap-2 md:py-1.5" role="list">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex flex-col md:flex-row items-center gap-1 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'text-violet-300 bg-violet-600/20'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`
                }
                aria-current="page"
              >
                <span aria-hidden className="text-base md:text-sm">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Profile (desktop) */}
        {profile && (
          <div className="hidden md:flex items-center gap-2 px-4 py-3">
            <NavLink to="/settings" className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm">
              <motion.div
                className="w-7 h-7 rounded-full bg-violet-600/40 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300"
                whileHover={{ scale: 1.1 }}
              >
                {profile.name[0].toUpperCase()}
              </motion.div>
              <span>{profile.name}</span>
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}
