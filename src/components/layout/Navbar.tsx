import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserStore } from '../../store/userStore';
import { useSettingsStore } from '../../store/settingsStore';

// SVG icon components — no emojis
function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconJournal() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="4" y="2" width="12" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7 7h6M7 10h6M7 13h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconInsights() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3 15l4-5 4 3 4-7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="17" cy="6" r="1.5" fill="currentColor" />
    </svg>
  );
}
function IconCompanion() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 17c0-3.314 2.686-5 6-5s6 1.686 6 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconMindfulness() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', Icon: IconDashboard },
  { path: '/journal', label: 'Journal', Icon: IconJournal },
  { path: '/insights', label: 'Insights', Icon: IconInsights },
  { path: '/companion', label: 'Companion', Icon: IconCompanion },
  { path: '/mindfulness', label: 'Mindfulness', Icon: IconMindfulness },
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
          <div
            className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center"
            aria-hidden
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z" fill="white" />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm">WellnessAI</span>
          {demoMode && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300">
              Demo
            </span>
          )}
        </div>

        {/* Nav links */}
        <ul
          className="flex items-center gap-1 flex-1 justify-around md:justify-center md:gap-2 md:py-1.5"
          role="list"
        >
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex flex-col md:flex-row items-center gap-1 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'text-violet-300 bg-violet-600/20'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`
                }
                aria-current="page"
              >
                <item.Icon />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Profile (desktop) */}
        {profile && (
          <div className="hidden md:flex items-center gap-2 px-4 py-3">
            <NavLink
              to="/settings"
              className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm"
            >
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


