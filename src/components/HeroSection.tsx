
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, MapPin, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const stats = [
  { label: "Active responders", value: "2.4k+", icon: Users },
  { label: "Reports resolved", value: "18.2k", icon: Shield },
  { label: "Regions covered", value: "64", icon: MapPin },
];

const HeroSection = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleAuthClick = async () => {
    if (session) {
      try {
        await supabase.auth.signOut();
        toast({ title: "Signed out", description: "You are now logged out." });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      navigate("/auth");
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(13,106,106,0.22),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(220,53,69,0.18),transparent_32%),radial-gradient(circle_at_50%_70%,rgba(13,106,106,0.12),transparent_30%)]" />

      {/* Nav */}
      <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 pt-8">
        <div className="flex items-center gap-2">
          <div className="h-11 w-11 rounded-2xl bg-white shadow-md flex items-center justify-center text-primary font-bold">
            SS
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">SajhaSahayog</p>
            <p className="text-lg font-semibold text-slate-900">Response Hub</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
          <button onClick={() => scrollTo("report-missing")} className="hover:text-primary transition-colors">
            Missing
          </button>
          <button onClick={() => scrollTo("damage-report")} className="hover:text-primary transition-colors">
            Damage
          </button>
          <button onClick={() => scrollTo("first-aid")} className="hover:text-primary transition-colors">
            First Aid
          </button>
          <button onClick={() => scrollTo("expert-consultation")} className="hover:text-primary transition-colors">
            Experts
          </button>
        </div>
        <Button variant="outline" onClick={handleAuthClick} className="rounded-full">
          {session ? "Sign out" : "Sign in"}
        </Button>
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 sm:px-10 pt-16 pb-20">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur">
          Built in Nepal for Nepal
        </div>
        <h1 className="mt-6 max-w-4xl text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-slate-900">
          Help Nepal respond faster with calm, shared support.
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          Submit verified reports, track hotspots, and mobilize teams faster. Built for field responders, local authorities, and neighbors who step up first.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button className="px-6 py-6 text-base rounded-full shadow-md" onClick={() => scrollTo("report-missing")}>
            Report missing person
          </Button>
          <Button
            className="px-6 py-6 text-base rounded-full shadow-md"
            variant="secondary"
            onClick={() => scrollTo("damage-report")}
          >
            Report damage
          </Button>
          <Button
            variant="outline"
            className="px-6 py-6 text-base rounded-full border-primary text-primary hover:bg-primary/10"
            onClick={() => scrollTo("first-aid")}
          >
            Quick first-aid guide
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-12 grid gap-4 w-full max-w-4xl sm:grid-cols-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl bg-white/90 p-5 shadow-sm backdrop-blur border border-white/70 transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-semibold text-slate-900">{value}</p>
                  <p className="text-sm text-slate-500">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          variant="outline"
          size="icon"
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 rounded-full z-50 bg-white/90"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </section>
  );
};

export default HeroSection;
