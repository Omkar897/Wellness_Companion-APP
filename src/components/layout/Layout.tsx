import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { FloatingBackground } from '../animations/FloatingBackground';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-violet-600 focus:text-white focus:text-sm focus:font-medium focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>
      <FloatingBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-24 md:pb-6" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
