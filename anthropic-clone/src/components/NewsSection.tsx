const NEWS_ITEMS = [
  {
    category: 'Product',
    title: 'Introducing Claude 3.5 Sonnet',
    description: 'Our most intelligent model yet, setting new industry benchmarks across reasoning, knowledge, and coding.',
    date: 'Jun 2024',
  },
  {
    category: 'Company',
    title: 'Anthropic raises Series D funding',
    description: 'New funding to support our mission of building safe, beneficial AI systems and expanding our research capabilities.',
    date: 'Mar 2024',
  },
  {
    category: 'Policy',
    title: 'Our Responsible Scaling Policy',
    description: 'A framework for responsibly scaling AI systems while managing potential risks at each capability level.',
    date: 'Sep 2023',
  },
  {
    category: 'Research',
    title: 'Challenges in AI Safety',
    description: 'An overview of the key technical and governance challenges in developing safe and reliable AI systems.',
    date: 'Jan 2024',
  },
];

export function NewsSection() {
  return (
    <section className="px-6 py-24 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest" style={{ color: 'var(--accent-tan)' }}>
              Latest
            </p>
            <h2 className="mt-4 text-4xl font-normal leading-[1.15] tracking-tight sm:text-5xl">
              News &amp; updates
            </h2>
          </div>
          <a
            href="/news"
            className="text-base font-medium underline underline-offset-4 transition-colors hover:opacity-70"
          >
            View all news
          </a>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {NEWS_ITEMS.map((item) => (
            <a
              key={item.title}
              href="/news"
              className="group flex flex-col rounded-2xl border p-6 transition-all hover:shadow-lg"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card-bg)' }}
            >
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--accent-tan)' }}>
                {item.category}
              </span>
              <h3 className="mt-3 text-lg font-normal leading-snug tracking-tight group-hover:underline">
                {item.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                {item.description}
              </p>
              <p className="mt-4 text-xs font-medium" style={{ color: 'var(--muted)' }}>
                {item.date}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
