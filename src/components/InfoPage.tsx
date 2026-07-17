import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function InfoPage({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: { title: string; body: string }[];
}) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-24 lg:px-10 lg:py-32">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-4 font-display text-5xl lg:text-7xl">{title}</h1>
      <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">{intro}</p>
      <div className="mt-16 border-t border-border">
        {sections.map((section) => (
          <section
            key={section.title}
            className="grid gap-4 border-b border-border py-8 md:grid-cols-[14rem_1fr]"
          >
            <h2 className="font-display text-xl">{section.title}</h2>
            <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {section.body}
            </p>
          </section>
        ))}
      </div>
      <Link
        to="/contact"
        className="mt-10 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]"
      >
        Need help? Contact us <ArrowRight size={14} />
      </Link>
    </div>
  );
}
