import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Mail, Lock } from "lucide-react";

const Footer = () => {
  const { t, language } = useLanguage();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const privacyContent = {
    en: {
      title: "Privacy Policy",
      text: "SajhaSahayog is committed to protecting your personal information. All data collected through our platform is used solely for disaster response coordination and is never shared with third parties without consent. Location data is encrypted and only accessible to verified responders and administrators.",
    },
    np: {
      title: "गोपनीयता नीति",
      text: "सझासहयोग तपाईंको व्यक्तिगत जानकारी सुरक्षित राख्न प्रतिबद्ध छ। हाम्रो प्लेटफर्म मार्फत संकलित सबै डाटा आपदा प्रतिक्रिया समन्वयको लागि मात्र प्रयोग गरिन्छ र सहमति बिना तेस्रो पक्षहरूसँग साझा गरिँदैन।",
    },
  };

  const contactContent = {
    en: {
      title: "Contact Support",
      text: "For technical assistance, report issues, or general inquiries about the SajhaSahayog platform, reach out to our support team. We typically respond within 24 hours.",
      email: "support@sajhasahayog.org.np",
      emergency: "For emergencies, please use the reporting feature directly.",
    },
    np: {
      title: "सम्पर्क सहायता",
      text: "प्राविधिक सहायता, समस्या रिपोर्ट, वा सझासहयोग प्लेटफर्मको बारेमा सामान्य सोधपुछको लागि, हाम्रो सहायता टोलीलाई सम्पर्क गर्नुहोस्। हामी सामान्यतया २४ घण्टा भित्र जवाफ दिन्छौं।",
      email: "support@sajhasahayog.org.np",
      emergency: "आपतकालीन अवस्थाको लागि, कृपया रिपोर्टिङ सुविधा प्रत्यक्ष प्रयोग गर्नुहोस्।",
    },
  };

  return (
    <footer className="bg-[#1F2A2E] text-white py-6 sm:py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-[#0D6A6A] rounded">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <span className="text-xs sm:text-sm text-gray-400">
              {t("copyright")}
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400">
            {/* Privacy Link */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowPrivacy(true)}
                onMouseLeave={() => setShowPrivacy(false)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                {t("privacy")}
              </button>

              {/* Privacy Popup */}
              <div
                className={`absolute bottom-full right-0 mb-3 w-72 sm:w-80 bg-white text-slate-dark rounded-xl shadow-2xl p-5 transition-all duration-300 ease-out ${
                  showPrivacy
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-2 pointer-events-none"
                }`}
              >
                {/* Arrow */}
                <div className="absolute bottom-0 right-4 translate-y-full">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white" />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-[#0D6A6A]/10 rounded-lg flex items-center justify-center">
                    <Lock className="w-4 h-4 text-[#0D6A6A]" />
                  </div>
                  <h4 className="font-bold text-base">
                    {privacyContent[language].title}
                  </h4>
                </div>
                <p className="text-sm text-slate-gray leading-relaxed">
                  {privacyContent[language].text}
                </p>
              </div>
            </div>

            {/* Contact Support Link */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowContact(true)}
                onMouseLeave={() => setShowContact(false)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                {t("contactSupport")}
              </button>

              {/* Contact Popup */}
              <div
                className={`absolute bottom-full right-0 mb-3 w-72 sm:w-80 bg-white text-slate-dark rounded-xl shadow-2xl p-5 transition-all duration-300 ease-out ${
                  showContact
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-2 pointer-events-none"
                }`}
              >
                {/* Arrow */}
                <div className="absolute bottom-0 right-4 translate-y-full">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white" />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-[#0D6A6A]/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-[#0D6A6A]" />
                  </div>
                  <h4 className="font-bold text-base">
                    {contactContent[language].title}
                  </h4>
                </div>
                <p className="text-sm text-slate-gray leading-relaxed mb-3">
                  {contactContent[language].text}
                </p>
                <a
                  href={`mailto:${contactContent[language].email}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#0D6A6A] hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  {contactContent[language].email}
                </a>
                <p className="text-xs text-gray-400 mt-3 italic">
                  {contactContent[language].emergency}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
