export function ClaudeSection() {
  return (
    <section className="px-6 py-24 lg:px-10 lg:py-32" style={{ backgroundColor: 'var(--foreground)' }}>
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-medium uppercase tracking-widest" style={{ color: 'var(--accent-tan)' }}>
              Our Product
            </p>
            <h2
              className="mt-4 text-4xl font-normal leading-[1.15] tracking-tight sm:text-5xl"
              style={{ color: 'var(--background)' }}
            >
              Meet Claude
            </h2>
            <p className="mt-6 text-lg leading-relaxed" style={{ color: '#a3a3a3' }}>
              Claude is our frontier AI assistant. It excels at thoughtful dialogue,
              content creation, complex reasoning, coding, and detailed analysis. Claude
              is designed to be helpful, harmless, and honest.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="/claude"
                className="inline-flex items-center rounded-full px-7 py-3 text-base font-medium transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: 'var(--accent-tan)',
                  color: 'var(--foreground)',
                }}
              >
                Try Claude
                <svg className="ml-2" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </a>
              <a
                href="/api"
                className="inline-flex items-center rounded-full border border-white/20 px-7 py-3 text-base font-medium transition-colors hover:bg-white/5"
                style={{ color: 'var(--background)' }}
              >
                Build with the API
              </a>
            </div>
          </div>

          {/* Chat preview mockup */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-white/10 p-8" style={{ backgroundColor: '#242424' }}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--accent-tan)' }}>
                  <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>C</span>
                </div>
                <span className="text-sm font-medium" style={{ color: '#a3a3a3' }}>Claude</span>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl p-4" style={{ backgroundColor: '#333' }}>
                  <p className="text-sm leading-relaxed" style={{ color: '#d4d4d4' }}>
                    How can I help you today? I can assist with writing, analysis,
                    coding, math, and much more.
                  </p>
                </div>
                <div className="ml-auto max-w-[80%] rounded-xl p-4" style={{ backgroundColor: 'var(--accent-tan)', color: 'var(--foreground)' }}>
                  <p className="text-sm leading-relaxed">
                    Help me understand the latest research on AI safety.
                  </p>
                </div>
                <div className="rounded-xl p-4" style={{ backgroundColor: '#333' }}>
                  <p className="text-sm leading-relaxed" style={{ color: '#d4d4d4' }}>
                    I&apos;d be happy to help! AI safety research focuses on ensuring AI
                    systems are aligned with human values and intentions...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
