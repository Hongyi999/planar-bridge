export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-32 lg:px-10 lg:pb-36 lg:pt-44">
      <div className="mx-auto max-w-[1400px]">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-normal leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            AI research and products that put safety at the frontier
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed" style={{ color: 'var(--muted)' }}>
            We build reliable, interpretable, and steerable AI systems. Our research
            is focused on developing AI that is safe, beneficial, and understandable.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="/claude"
              className="inline-flex items-center rounded-full px-7 py-3 text-base font-medium transition-colors"
              style={{
                backgroundColor: 'var(--foreground)',
                color: 'var(--background)',
              }}
            >
              Meet Claude
              <svg className="ml-2" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </a>
            <a
              href="/research"
              className="inline-flex items-center rounded-full border px-7 py-3 text-base font-medium transition-colors hover:bg-black/5"
              style={{ borderColor: 'var(--border)' }}
            >
              Read our research
            </a>
          </div>
        </div>
      </div>

      {/* Decorative gradient orb */}
      <div
        className="pointer-events-none absolute -right-32 top-16 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--accent-tan), transparent 70%)' }}
      />
    </section>
  );
}
