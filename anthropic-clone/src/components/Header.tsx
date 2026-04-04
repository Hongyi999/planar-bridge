'use client';

import { useState } from 'react';

const NAV_ITEMS = [
  { label: 'Claude', href: '/claude' },
  { label: 'API', href: '/api' },
  { label: 'Research', href: '/research' },
  { label: 'Company', href: '/company' },
  { label: 'News', href: '/news' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full" style={{ backgroundColor: 'var(--nav-bg)' }}>
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <svg width="32" height="20" viewBox="0 0 256 165" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M186.85 0H140.29L213.27 164.97H259.83L186.85 0Z" fill="#D4A574" transform="scale(0.99)" />
            <path d="M72.42 0L-0.56 164.97H46.78L59.47 134.03H132.72L145.41 164.97H192.75L119.77 0H72.42ZM74.23 100.37L96.1 47.6L117.97 100.37H74.23Z" fill="#D4A574" transform="scale(0.99)" />
          </svg>
          <span className="text-lg font-medium tracking-tight" style={{ color: 'var(--nav-text)' }}>
            Anthropic
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--nav-text)' }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden items-center gap-4 md:flex">
          <a
            href="/claude"
            className="rounded-full px-5 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--accent-tan)',
              color: 'var(--nav-bg)',
            }}
          >
            Try Claude
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--nav-text)' }}>
            {mobileOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 px-6 py-4 md:hidden" style={{ backgroundColor: 'var(--nav-bg)' }}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="block py-3 text-sm font-medium"
              style={{ color: 'var(--nav-text)' }}
            >
              {item.label}
            </a>
          ))}
          <a
            href="/claude"
            className="mt-3 block rounded-full px-5 py-2 text-center text-sm font-medium"
            style={{
              backgroundColor: 'var(--accent-tan)',
              color: 'var(--nav-bg)',
            }}
          >
            Try Claude
          </a>
        </div>
      )}
    </header>
  );
}
