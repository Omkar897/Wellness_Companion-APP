import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { FloatingBackground } from '../animations/FloatingBackground';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col relative">
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
