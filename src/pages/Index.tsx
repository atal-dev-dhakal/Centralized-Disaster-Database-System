
import HeroSection from "@/components/HeroSection";
import LandingHighlights from "@/components/LandingHighlights";
import ResponseCTA from "@/components/ResponseCTA";
import MissingPersonForm from "@/components/MissingPersonForm";
import DamageReportForm from "@/components/DamageReportForm";
import FirstAidSection from "@/components/FirstAidSection";
import ExpertConsultationForm from "@/components/ExpertConsultationForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-[color:rgb(249,250,250)] text-[#1F2A2E]">
      <HeroSection />
      <LandingHighlights />
      <ResponseCTA />
      <div className="grid lg:grid-cols-[240px,1fr,360px] gap-6 px-4 sm:px-6 lg:px-8 pb-10">
        {/* Nav rail */}
        <aside className="sticky top-4 h-fit rounded-xl border border-[#e3e7e8] bg-white shadow-sm p-4 space-y-2 hidden lg:block">
          {[
            { id: "report-missing", label: "Missing Persons" },
            { id: "damage-report", label: "Damage & Hazards" },
            { id: "first-aid", label: "First-Aid" },
            { id: "expert-consultation", label: "Expert Desk" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-[#f1f3f4] font-medium text-sm"
            >
              {item.label}
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main className="space-y-10">
          <MissingPersonForm />
          <DamageReportForm />
          <FirstAidSection />
          <ExpertConsultationForm />
        </main>

        {/* Live feed placeholder */}
        <aside className="hidden lg:block sticky top-4 h-fit rounded-xl border border-[#e3e7e8] bg-white shadow-sm p-4 space-y-4">
          <h3 className="text-lg font-semibold">Live Feed</h3>
          <p className="text-sm text-[#4b5a62]">
            New reports, sorted by urgency. Filters and actions (verify, need help) can plug in here.
          </p>
          <div className="space-y-3">
            {["Landslide near Dhulikhel", "Missing child in Pokhara", "Bridge damage, Bharatpur"].map((item) => (
              <div key={item} className="rounded-lg border border-[#e3e7e8] p-3">
                <p className="text-sm font-semibold">{item}</p>
                <div className="mt-2 flex gap-2">
                  <button className="text-xs px-3 py-1 rounded-md bg-[color:#0D6A6A] text-white">Mark seen</button>
                  <button className="text-xs px-3 py-1 rounded-md border border-[color:#DC3545] text-[color:#DC3545]">Need help</button>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Index;
