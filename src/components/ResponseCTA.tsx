import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, HeartPulse } from "lucide-react";

const steps = [
  { title: "1) Submit", detail: "Log missing people, damages, or SOS with photos and pinned coordinates." },
  { title: "2) Verify", detail: "Admins validate and cluster reports to avoid duplicates and misinformation." },
  { title: "3) Act", detail: "Dispatch responders, share public-safe updates, and track follow-ups." },
];

const ResponseCTA = () => (
  <section className="py-14 px-6 sm:px-10">
    <div className="mx-auto max-w-6xl rounded-3xl bg-slate-900 text-white overflow-hidden shadow-xl">
      <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <div className="p-10 flex flex-col justify-center gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold tracking-wide">
            <HeartPulse className="h-4 w-4" />
            Ready in minutes, calm in chaos
          </div>
          <h3 className="text-3xl sm:text-4xl font-bold leading-tight">Guide every response from a single command lane.</h3>
          <p className="text-slate-200">
            ReliefLink blends community speed with operator clarity. Keep the intake simple for the public, the dashboards sharp for admins, and the map always actionable.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-full px-6 py-6" onClick={() => document.getElementById("report-missing")?.scrollIntoView({ behavior: "smooth" })}>
              Start a report
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="border-white/50 text-white hover:bg-white/10 rounded-full px-6 py-6"
              onClick={() => document.getElementById("damage-report")?.scrollIntoView({ behavior: "smooth" })}
            >
              View damage flow
            </Button>
          </div>
        </div>
        <div className="bg-gradient-to-br from-primary/10 via-white/5 to-secondary/10 p-10 flex flex-col gap-4">
          {steps.map(({ title, detail }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-sm font-semibold text-primary flex items-center gap-2">
                <Compass className="h-4 w-4" />
                {title}
              </p>
              <p className="text-base leading-relaxed text-white mt-2">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default ResponseCTA;

