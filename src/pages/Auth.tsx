import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import Layout from "@/components/layout/Layout";
import { Shield, User } from "lucide-react";

type AuthMode = "login" | "signup";
type UserRole = "user" | "admin";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<UserRole>("user");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        
        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/respond");
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              role: role,
            },
          },
        });
        if (error) throw error;
        
        toast({
          title: "Account created",
          description: "You can now log in with your credentials.",
        });
        setMode("login");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 sm:py-12 px-4">
        <div className="w-full max-w-md">
          {/* Auth Card */}
          <div className="card-base shadow-lg p-6 sm:p-8">
            {/* Mode Tabs */}
            <div className="flex mb-6 sm:mb-8 border-b border-gray-200">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 pb-3 sm:pb-4 text-center font-semibold text-sm sm:text-base transition-colors ${
                  mode === "login"
                    ? "text-[#0D6A6A] border-b-2 border-[#0D6A6A]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {t("logIn")}
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 pb-3 sm:pb-4 text-center font-semibold text-sm sm:text-base transition-colors ${
                  mode === "signup"
                    ? "text-[#0D6A6A] border-b-2 border-[#0D6A6A]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {t("createAccount")}
              </button>
            </div>

            {/* Role Selection */}
            <div className="mb-5 sm:mb-6">
              <p className="text-sm text-slate-gray mb-2 sm:mb-3 font-medium">{t("iAmA")}</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg border-2 transition-all text-sm sm:text-base ${
                    role === "user"
                      ? "border-[#0D6A6A] bg-[#0D6A6A]/5 text-[#0D6A6A]"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium">{t("user")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg border-2 transition-all text-sm sm:text-base ${
                    role === "admin"
                      ? "border-[#0D6A6A] bg-[#0D6A6A]/5 text-[#0D6A6A]"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium">{t("administrator")}</span>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-slate-gray mb-1.5">
                    {t("fullName")}
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-gray mb-1.5">
                  {t("emailAddress")}
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-gray mb-1.5">
                  {t("password")}
                </label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary h-11 sm:h-12 text-sm sm:text-base mt-6"
              >
                {isLoading
                  ? t("pleaseWait")
                  : mode === "login"
                  ? t("enterPortal")
                  : t("createAccount")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
