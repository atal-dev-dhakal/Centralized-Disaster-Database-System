import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield } from "lucide-react";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#1F2A2E] text-white py-6 sm:py-8">
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
            <Link to="#" className="hover:text-white transition-colors">
              {t("privacy")}
            </Link>
            <Link to="#" className="hover:text-white transition-colors">
              {t("contactSupport")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
