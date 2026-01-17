import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* soft background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-[-120px] h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-40 bottom-[-140px] h-[520px] w-[520px] rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:px-8 md:grid-cols-2">
        {/* ================= LEFT ================= */}
        <div className="max-w-xl">
          {/* Badge */}
          <div
            className="
              inline-flex items-center gap-2 rounded-full
              bg-secondary px-4 py-2
              text-sm font-medium text-primary
              border border-primary/40
            "
          >
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

          {/* CTAs */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/categories"
              className="
                inline-flex h-12 items-center justify-center rounded-xl
                bg-primary px-6 text-sm font-semibold text-primary-foreground
                shadow-sm transition hover:brightness-105 active:scale-[0.99]
              "
            >
              Explore events →
            </Link>

            <Link
              href="/login"
              className="
                inline-flex h-12 items-center justify-center rounded-xl
                border border-border bg-card px-6 text-sm font-semibold text-foreground
                transition hover:bg-muted
              "
            >
              Sign in to save + get updates 🔔
            </Link>
          </div>
        </div>
        {/* ================= RIGHT (illustration + join card) ================= */}
        <div className="relative mx-auto flex w-full max-w-[560px] flex-col items-center">
          {/* subtle warm glow behind illustration */}
          <div className="pointer-events-none absolute top-24 h-[340px] w-[340px] rounded-full bg-[color:var(--brand-accent)]/20 blur-3xl" />

          {/* Illustration */}
          <img
            src="/images/people-celebrating.svg"
            alt="People celebrating culture and community"
            className="relative w-full max-w-[520px] select-none"
            draggable={false}
          />

          {/* Join organizers button (below image) */}
          <Link
            href="/organizers"
            className="
              group mt-6 w-full max-w-[320px]
              rounded-2xl
              border border-primary/30
              bg-primary
              px-5 py-4
              text-primary-foreground
              shadow-md
              transition
              hover:-translate-y-0.5 hover:shadow-lg
              focus:outline-none
              focus:ring-2 focus:ring-[color:var(--ring)]
              focus:ring-offset-2 focus:ring-offset-background
            "
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">
                  Join organizers
                </p>
                <p className="mt-1 text-xs text-primary-foreground/80">
                  Help keep traditions alive
                </p>
              </div>

              <span
                className="
                  inline-flex h-9 w-9 items-center justify-center
                  rounded-xl
                  bg-accent
                  text-accent-foreground
                  transition-transform
                  group-hover:translate-x-0.5
                "
              >
                →
              </span>
            </div>
          </Link>
        </div>

        

        
      </div>
    </section>
  )
}
