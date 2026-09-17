const industries = [
  'Manufacturing',
  'Retail & E-commerce',
  'Healthcare',
  'Construction',
  'Hospitality',
  'Logistics',
];

export function TrustStrip() {
  return (
    <section className="border-border bg-background border-y">
      <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6">
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
          Trusted by leading businesses worldwide
        </p>
        <div className="text-muted-foreground/70 mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-semibold tracking-wide uppercase">
          {industries.map((industry) => (
            <span key={industry}>{industry}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
