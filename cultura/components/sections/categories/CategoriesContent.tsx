import Link from "next/link"
import { categories } from "@/lib/data"

type CategoryUI = {
  id: string
  label: string
  title: string
  description: string
  imageUrl?: string
  count?: number
}

const fallbackImages = [
  "https://images.unsplash.com/photo-1521337706264-a414f153a5e3?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1545239351-1141bd82e8a6f1f7?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1542317854-4874a9e6f1f7?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1520975682031-a3fbfdef0c0c?auto=format&fit=crop&w=1600&q=80",
]

const badgeGradients = [
  "from-[#a02237] to-[#f9a81c]", // crimson -> gold
  "from-[#3c2052] to-[#7e3362]", // deep purple -> plum
  "from-[#db2424] to-[#f9a81c]", // red -> gold
  "from-[#7e3362] to-[#a02237]", // plum -> crimson
  "from-[#3c2052] to-[#a02237]", // purple -> crimson
  "from-[#a02237] to-[#db2424]", // crimson -> red
]

export default function CategoriesPage() {
  const list = categories as unknown as CategoryUI[]

  return (
    <div className="w-full">
      {/* ===== HERO BANNER ===== */}
      <section className="relative overflow-hidden border-b border-[color:var(--border)]">
        <div className="absolute inset-0 bg-[color:var(--background)]" />

        {/* Glows (pink lower-left, gold higher-right) */}
        <div className="pointer-events-none absolute inset-0">
          {/* pink / red lower-left */}
          <div className="absolute -left-52 bottom-[-220px] h-[560px] w-[560px] rounded-full bg-[color:var(--primary)]/18 blur-3xl" />
          {/* gold higher-right */}
          <div className="absolute -right-52 top-[-220px] h-[560px] w-[560px] rounded-full bg-[color:var(--accent)]/22 blur-3xl" />
          {/* soft center haze */}
          <div className="absolute left-1/2 top-16 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-black/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-header text-5xl font-extrabold tracking-tight text-[color:var(--foreground)] md:text-6xl">
              Explore by <span className="text-heritage">Category</span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-[color:var(--muted-foreground)]">
              Dive deep into the cultures, traditions, and communities that make our world
              beautiful. Each category is a doorway to unique experiences.
            </p>
          </div>
        </div>
      </section>

      {/* ===== GRID (3 per row on lg) ===== */}
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {list.map((c, idx) => {
            const imageUrl = c.imageUrl ?? fallbackImages[idx % fallbackImages.length]
            const count = c.count ?? 120 + ((idx * 67) % 260)
            const badgeGradient = badgeGradients[idx % badgeGradients.length]

            return (
              <Link
                key={c.id}
                href={`/discover?cat=${encodeURIComponent(c.id)}`}
                className="
                  group relative overflow-hidden rounded-3xl
                  border border-[color:var(--border)]
                  bg-[color:var(--card)]
                  shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:border-[color:var(--primary)]
                  hover:shadow-[0_24px_55px_rgba(160,34,55,0.35)]
                  focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]
                "
              >
                {/* IMAGE HEADER */}
                <div className="relative h-56 w-full overflow-hidden bg-[color:var(--muted)]">
                  <img
                    src={imageUrl}
                    alt={c.label}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />

                  {/* transparent -> black gradient over image */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

                  {/* gradient badge (top-left) */}
                  <div className="absolute left-5 top-5">
                    <div
                      className={[
                        "rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-md",
                        "bg-gradient-to-br",
                        badgeGradient,
                      ].join(" ")}
                    >
                      {c.label}
                    </div>
                  </div>

                  
                </div>

                {/* BODY */}
                <div className="p-6">
                  <p className="text-[color:var(--muted-foreground)]">
                    {c.description}
                  </p>

                  <p
                    className="
                      mt-5 inline-flex items-center gap-2
                      text-sm font-semibold text-[color:var(--primary)]
                    "
                  >
                    Browse Events
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
