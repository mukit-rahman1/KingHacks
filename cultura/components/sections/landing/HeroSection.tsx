import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* soft background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-[-120px] h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-40 bottom-[-140px] h-[520px] w-[520px] rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2">
        {/* ================= LEFT ================= */}
        <div className="max-w-xl">
          {/* Badge */}
        <div className="
            inline-flex items-center gap-2
            rounded-full
            bg-secondary
            px-4 py-2
            text-sm font-medium
            text-primary
            border border-primary/40
            ">
            ✨ <span>Every culture has a story</span>
        </div>
          {/* Heading */}
          <h1 className="mt-8 font-header font-bold text-[3.2rem] leading-[1.05] text-foreground md:text-[4.3rem]">
            <span className="block">Where</span>
            <span className="block text-heritage">tradition</span>
            <span className="block">meets</span>
            <span className="relative inline-block text-accent">
              celebration
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            Discover events that honor heritage, amplify diverse voices,
            and create moments that matter.
          </p>

          {/* CTAs (basic, semantic) */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/categories"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Explore Events →
            </Link>

            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Sign up to receive notifications 🔔
            </Link>
          </div>
        </div>

        {/* ================= RIGHT (placeholders) ================= */}
        <div className="relative mx-auto h-[420px] w-full max-w-[560px] md:h-[520px]">
          {/* Large card */}
          <div className="absolute left-0 top-10 h-[240px] w-[380px] rounded-3xl bg-card shadow-md" />

          {/* Small cards */}
          <div className="absolute right-0 top-12 h-[150px] w-[200px] rounded-3xl bg-card shadow-md" />
          <div className="absolute bottom-10 left-10 h-[150px] w-[240px] rounded-3xl bg-card shadow-md" />
          <div className="absolute right-6 top-[260px] h-[150px] w-[220px] rounded-3xl bg-card shadow-md" />

          {/* Info pill */}
          <div className="absolute bottom-8 left-1/2 w-[220px] -translate-x-1/2 rounded-3xl bg-card p-4 shadow-md">
            <p className="text-sm font-semibold text-foreground">
              Join organizers
            </p>
            <p className="text-xs text-muted-foreground">
              Keeping traditions alive
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
