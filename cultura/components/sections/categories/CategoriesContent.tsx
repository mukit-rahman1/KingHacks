import Link from "next/link"
import { categories } from "@/lib/data"

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="font-header text-4xl font-extrabold mt-5 tracking-tight text-[color:var(--foreground)]">
          Categories
        </h1>
        <p className="mt-2 max-w-xl text-[color:var(--muted-foreground)]">
          Browse by culture, interest, or theme — find spaces that feel like home.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/discover?cat=${encodeURIComponent(c.id)}`}
            className="
              group relative overflow-hidden
              rounded-2xl border border-[color:var(--border)]
              bg-[color:var(--card)]
              p-6 shadow-sm transition
              hover:-translate-y-0.5 hover:shadow-md
            "
          >
            {/* Soft accent glow */}
            <div
              className="
                pointer-events-none absolute -right-24 -top-24 h-56 w-56
                rounded-full bg-[color:var(--brand-accent)]/10 blur-2xl
              "
            />

            {/* Pill */}
            <div
              className="
                relative mb-3 w-fit rounded-full
                border border-[color:var(--border)]
                bg-[color:var(--secondary)]
                px-3 py-1 text-sm font-semibold
                text-[color:var(--secondary-foreground)]
              "
            >
              {c.label}
            </div>

            {/* Title */}
            <h3 className="relative font-header text-xl font-bold text-[color:var(--foreground)]">
              {c.title}
            </h3>

            {/* Description */}
            <p className="relative mt-2 text-[color:var(--muted-foreground)]">
              {c.description}
            </p>

            {/* CTA */}
            <p
              className="
                relative mt-5 inline-flex items-center gap-1
                text-sm font-semibold text-[color:var(--primary)]
              "
            >
              View events
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
