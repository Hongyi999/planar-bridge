const RESEARCH_ITEMS = [
  {
    tag: 'Interpretability',
    title: 'Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet',
    description: 'We applied dictionary learning to extract interpretable features from the middle layer of Claude 3 Sonnet, finding features that correspond to a diverse range of concepts.',
    date: 'May 2024',
  },
  {
    tag: 'Alignment',
    title: 'Constitutional AI: Harmlessness from AI Feedback',
    description: 'We propose a method for training AI assistants that are helpful, honest, and harmless, using AI-generated feedback to revise responses.',
    date: 'Dec 2022',
  },
  {
    tag: 'Safety',
    title: 'The Claude Model Card and Evaluations',
    description: 'A detailed look at the capabilities, limitations, and safety evaluations of our Claude model family, including benchmarks and red-teaming results.',
    date: 'Mar 2024',
  },
];

export function ResearchSection() {
  return (
    <section className="px-6 py-24 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest" style={{ color: 'var(--accent-tan)' }}>
              Research
            </p>
            <h2 className="mt-4 text-4xl font-normal leading-[1.15] tracking-tight sm:text-5xl">
              Advancing AI safety
            </h2>
          </div>
          <a
            href="/research"
            className="text-base font-medium underline underline-offset-4 transition-colors hover:opacity-70"
          >
            View all research
          </a>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {RESEARCH_ITEMS.map((item) => (
            <a
              key={item.title}
              href="/research"
              className="group flex flex-col rounded-2xl border p-8 transition-all hover:shadow-lg"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card-bg)' }}
            >
              <span
                className="mb-4 inline-block w-fit rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: '#f0ebe5', color: 'var(--muted)' }}
              >
                {item.tag}
              </span>
              <h3 className="text-xl font-normal leading-snug tracking-tight group-hover:underline">
                {item.title}
              </h3>
              <p className="mt-4 flex-1 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                {item.description}
              </p>
              <p className="mt-6 text-xs font-medium" style={{ color: 'var(--muted)' }}>
                {item.date}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
