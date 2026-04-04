const FOOTER_LINKS = {
  Product: [
    { label: 'Claude', href: '/claude' },
    { label: 'Claude for Enterprise', href: '/claude/enterprise' },
    { label: 'API', href: '/api' },
    { label: 'Pricing', href: '/pricing' },
  ],
  Research: [
    { label: 'Overview', href: '/research' },
    { label: 'Papers', href: '/research/papers' },
    { label: 'Safety', href: '/research/safety' },
  ],
  Company: [
    { label: 'About', href: '/company' },
    { label: 'Careers', href: '/careers' },
    { label: 'News', href: '/news' },
    { label: 'Contact', href: '/contact' },
  ],
  Policies: [
    { label: 'Responsible Disclosure', href: '/responsible-disclosure' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Usage Policy', href: '/usage-policy' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t px-6 py-16 lg:px-10 lg:py-20" style={{ borderColor: 'var(--border)' }}>
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <svg width="24" height="15" viewBox="0 0 256 165" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M186.85 0H140.29L213.27 164.97H259.83L186.85 0Z" fill="#D4A574" transform="scale(0.99)" />
                <path d="M72.42 0L-0.56 164.97H46.78L59.47 134.03H132.72L145.41 164.97H192.75L119.77 0H72.42ZM74.23 100.37L96.1 47.6L117.97 100.37H74.23Z" fill="#D4A574" transform="scale(0.99)" />
              </svg>
              <span className="text-base font-medium">Anthropic</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              AI research and safety company working to build reliable, interpretable, and steerable AI systems.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold">{category}</h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm transition-opacity hover:opacity-70"
                      style={{ color: 'var(--muted)' }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            &copy; {new Date().getFullYear()} Anthropic PBC. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
              <a
                key={social}
                href="#"
                className="text-xs transition-opacity hover:opacity-70"
                style={{ color: 'var(--muted)' }}
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
