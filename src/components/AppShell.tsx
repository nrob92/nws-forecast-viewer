import { CloudSun, ExternalLink } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

export function AppShell() {
  return (
    <div className="min-h-svh bg-[#f7f8f4] text-[#17202a]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#17324d] focus:shadow-lg"
      >
        Skip to forecast workspace
      </a>
      <header className="border-b border-[#d9ded6] bg-white/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-[#17324d] text-white">
              <CloudSun aria-hidden="true" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#52616f]">
                Portfolio demo
              </p>
              <h1 className="text-xl font-semibold tracking-normal text-[#102033]">
                NWS Forecast Viewer
              </h1>
            </div>
          </div>
          <nav aria-label="Primary navigation" className="flex items-center gap-2 text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded-md px-3 py-2 font-medium transition ${
                  isActive
                    ? 'bg-[#e3eee9] text-[#0b5f5a]'
                    : 'text-[#44515e] hover:bg-[#eef1ec] hover:text-[#102033]'
                }`
              }
            >
              Workbench
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `rounded-md px-3 py-2 font-medium transition ${
                  isActive
                    ? 'bg-[#e3eee9] text-[#0b5f5a]'
                    : 'text-[#44515e] hover:bg-[#eef1ec] hover:text-[#102033]'
                }`
              }
            >
              About
            </NavLink>
            <a
              href="https://www.weather.gov/documentation/services-web-api"
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 font-medium text-[#44515e] hover:bg-[#eef1ec] hover:text-[#102033]"
              target="_blank"
              rel="noreferrer"
            >
              NWS API
              <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
            </a>
          </nav>
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
    </div>
  );
}
