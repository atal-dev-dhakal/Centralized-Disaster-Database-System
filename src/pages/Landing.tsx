import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, Shield, Users } from "lucide-react";

const Landing = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D6A6A]/5 via-transparent to-[#0D6A6A]/10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-dark leading-tight mb-4 sm:mb-6">
              {t("heroTitle")}
            </h1>
            
            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl text-slate-gray mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
              {t("heroSubtitle")}
            </p>
            
            {/* Primary CTA */}
            <Link to="/auth">
              <Button className="btn-primary text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 h-auto">
                {t("loginSignup")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1: Precise Location */}
            <div className="card-base text-center hover:shadow-md transition-shadow duration-300 p-6 sm:p-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#0D6A6A]/10 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-5">
                <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-[#0D6A6A]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-dark mb-2 sm:mb-3">
                {t("preciseLocation")}
              </h3>
              <p className="text-sm sm:text-base text-slate-gray leading-relaxed">
                {t("preciseLocationDesc")}
              </p>
            </div>

            {/* Card 2: Verified Data */}
            <div className="card-base text-center hover:shadow-md transition-shadow duration-300 p-6 sm:p-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#0D6A6A]/10 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-5">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-[#0D6A6A]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-dark mb-2 sm:mb-3">
                {t("verifiedData")}
              </h3>
              <p className="text-sm sm:text-base text-slate-gray leading-relaxed">
                {t("verifiedDataDesc")}
              </p>
            </div>

            {/* Card 3: Community Powered */}
            <div className="card-base text-center hover:shadow-md transition-shadow duration-300 p-6 sm:p-8 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#0D6A6A]/10 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-5">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-[#0D6A6A]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-dark mb-2 sm:mb-3">
                {t("communityPowered")}
              </h3>
              <p className="text-sm sm:text-base text-slate-gray leading-relaxed">
                {t("communityPoweredDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Landing;
