import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Globe } from "lucide-react";

interface HeaderProps {
  variant?: "light" | "dark";
}

const Header = ({ variant = "light" }: HeaderProps) => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({ title: t("logout") });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "np" : "en");
  };

  const bgClass = variant === "dark" ? "bg-[#0D6A6A]" : "bg-white";
  const textClass = variant === "dark" ? "text-white" : "text-slate-dark";
  const borderClass = variant === "dark" ? "" : "border-b border-gray-100";

  return (
    <header className={`${bgClass} ${borderClass} sticky top-0 z-50`}>
      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className={`flex items-center gap-2 ${textClass}`}>
            <div className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 ${variant === "dark" ? "bg-white/20" : "bg-[#0D6A6A]"} rounded-lg`}>
              <Shield className={`w-4 h-4 sm:w-5 sm:h-5 ${variant === "dark" ? "text-white" : "text-white"}`} />
            </div>
            <span className="text-lg sm:text-xl font-bold">SajhaSahayog</span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                variant === "dark"
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-slate-dark"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{language === "en" ? "नेपाली" : "English"}</span>
              <span className="sm:hidden">{language === "en" ? "NP" : "EN"}</span>
            </button>

            {session ? (
              <>
                <span className={`hidden sm:inline text-sm ${variant === "dark" ? "text-white/80" : "text-slate-gray"}`}>
                  {t("welcome")}, {session.user.email?.split("@")[0]}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className={variant === "dark" ? "text-white hover:bg-white/10" : "text-[#DC3545] hover:bg-red-50"}
                >
                  {t("logout")}
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="btn-outline bg-transparent text-sm">
                  {t("login")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
