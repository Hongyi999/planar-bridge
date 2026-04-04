export function SafetySection() {
  return (
    <section className="px-6 py-24 lg:px-10 lg:py-32" style={{ backgroundColor: '#f0ebe5' }}>
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest" style={{ color: 'var(--accent-tan)' }}>
              Safety
            </p>
            <h2 className="mt-4 text-4xl font-normal leading-[1.15] tracking-tight sm:text-5xl">
              Safety is our core priority
            </h2>
            <p className="mt-6 text-lg leading-relaxed" style={{ color: 'var(--muted)' }}>
              We believe the responsible development and maintenance of advanced AI
              holds the potential to be profoundly beneficial for humanity. We also
              believe that AI safety requires dedicated research and careful thought
              about the societal impacts of our work.
            </p>
            <a
              href="/company"
              className="mt-8 inline-flex items-center text-base font-medium underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              Learn about our approach
              <svg className="ml-2" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { number: '400+', label: 'Safety research papers published' },
              { number: '5B+', label: 'Parameters in safety evaluations' },
              { number: '100+', label: 'Red team members testing our models' },
              { number: '24/7', label: 'Continuous monitoring of deployed systems' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card-bg)' }}>
                <p className="text-3xl font-normal tracking-tight" style={{ color: 'var(--accent-tan)' }}>
                  {stat.number}
                </p>
                <p className="mt-2 text-sm leading-snug" style={{ color: 'var(--muted)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
