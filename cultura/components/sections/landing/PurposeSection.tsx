export function PurposeSection() {
  return (
    <section className="relative overflow-hidden bg-[#1e0f14]">
      {/* Background gradient wash */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-[-120px] h-[420px] w-[420px] rounded-full bg-[#a02237]/10 blur-3xl" />
        <div className="absolute right-[-200px] bottom-[-160px] h-[520px] w-[520px] rounded-full bg-[#f9a81c]/1 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-24">
        {/* Top content */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Left headline */}
          <div>
            <p className="text-sm font-semibold tracking-wide text-[#f9a81c]">
              Our Purpose
            </p>

            <h2 className="mt-4 font-header text-5xl font-extrabold leading-tight text-[#fff2e1]">
              Stories deserve{" "}
              <span className="text-[#a02237]">stages</span>,<br />
              not{" "}
              <span className="text-[#f9a81c]">shadows</span>.
            </h2>
          </div>

          {/* Right copy */}
          <div className="space-y-6 text-[#fff2e1]/80">
            <p>
              The best cultural events often happen in our own
              neighborhoods—yet we only hear about them after they end.
            </p>
            <p>
              We’re here to change that. To give every tradition, every
              celebration, every community gathering the visibility it
              deserves.
            </p>
          </div>
        </div>

        {/* Value cards */}
        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#db2424] to-[#f9a81c] text-white">
              ♥
            </div>
            <h3 className="font-header text-xl font-bold text-[#fff2e1]">
              Heritage First
            </h3>
            <p className="mt-2 text-sm text-[#fff2e1]/70">
              We center the stories that mainstream platforms overlook.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#7e3362] to-[#f9a81c] text-white">
              👥
            </div>
            <h3 className="font-header text-xl font-bold text-[#fff2e1]">
              Community Driven
            </h3>
            <p className="mt-2 text-sm text-[#fff2e1]/70">
              Built by and for the communities we serve.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#a02237] to-[#f9a81c] text-white ">
              🌐
            </div>
            <h3 className="font-header text-xl font-bold text-[#fff2e1]">
              All Backgrounds
            </h3>
            <p className="mt-2 text-sm text-[#fff2e1]/70">
              Every culture, every voice, every celebration belongs here.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
