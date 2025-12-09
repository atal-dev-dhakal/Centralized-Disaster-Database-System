import { Activity, AlertTriangle, Globe, Headset, LayoutDashboard, Sparkles } from "lucide-react";

const items = [
  {
    title: "Unified incident board",
    description: "Track missing people, damage, and aid requests in one shared view for operators and admins.",
    icon: LayoutDashboard,
  },
  {
    title: "Map-first awareness",
    description: "See clusters, last-seen points, and verified hotspots so teams can prioritize fast.",
    icon: Globe,
  },
  {
    title: "Field-friendly intake",
    description: "Fast, photo-ready forms with geo tagging for responders and community volunteers.",
    icon: AlertTriangle,
  },
  {
    title: "Expert line",
    description: "Route medical or structural questions to experts and keep responses searchable.",
    icon: Headset,
  },
  {
    title: "Signal boosting",
    description: "Share public-safe updates while keeping sensitive data with authorized operators.",
    icon: Activity,
  },
  {
    title: "Calm UX in chaos",
    description: "Readable typography, guided steps, and subtle animations to reduce cognitive load.",
    icon: Sparkles,
  },
];

const LandingHighlights = () => (
  <section className="bg-white/80 backdrop-blur py-16 px-6 sm:px-10">
    <div className="mx-auto max-w-6xl">
      <div className="mb-10 flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Built for coordination</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Everything teams need in a single calm hub.</h2>
        <p className="text-slate-600 max-w-3xl">
          ReliefLink keeps operators, admins, and neighbors on the same page: share context-rich reports, map hotspots, and surface the right next step.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ title, description, icon: Icon }) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/60 p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">{description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default LandingHighlights;

