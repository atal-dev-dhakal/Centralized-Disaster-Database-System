
import { Button } from "@/components/ui/button";

const FirstAidSection = () => {
  const handleReadMore = () => {
    window.open("https://www.redcross.org.uk/first-aid/learn-first-aid/videos", "_blank");
  };

  return (
    <section id="first-aid" className="min-h-screen bg-slate-900 text-white py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col gap-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Stay calm, act fast</p>
          <h2 className="text-4xl font-bold">First-aid playsbook</h2>
          <p className="text-slate-200 max-w-3xl mx-auto">
            Quick cues for the most common emergencies while responders are en route. Keep yourself safe first, then stabilize.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: "Head injuries", content: "Keep the person still, watch breathing, do not remove helmets, and call emergency services immediately." },
            { title: "Fractures", content: "Immobilize the area above and below the injury, avoid straightening, and apply cold packs wrapped in cloth." },
            { title: "Bleeding", content: "Gloves on if possible. Apply firm pressure with clean cloth, elevate if safe, and do not remove soaked dressings—layer more." },
            { title: "Crush injuries", content: "Call emergency services and do not lift heavy debris alone. Provide reassurance and monitor breathing until help arrives." }
          ].map((info) => (
            <div key={info.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h3 className="text-xl font-semibold mb-3">{info.title}</h3>
              <p className="text-slate-200 mb-4">{info.content}</p>
              <Button variant="secondary" onClick={handleReadMore} className="rounded-full">
                Watch quick video
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FirstAidSection;
