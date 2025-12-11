import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { X, Truck, Shield, Heart, Flame, Stethoscope, Search, HardHat, Users } from "lucide-react";

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatch: (team: string, note: string) => void;
  reportTitle: string;
}

const teams = [
  { id: "police", icon: Shield, color: "#1e3a8a" },
  { id: "army", icon: HardHat, color: "#166534" },
  { id: "redCross", icon: Heart, color: "#dc2626" },
  { id: "fireBrigade", icon: Flame, color: "#ea580c" },
  { id: "medical", icon: Stethoscope, color: "#0891b2" },
  { id: "rescue", icon: Search, color: "#7c3aed" },
  { id: "excavator", icon: Truck, color: "#ca8a04" },
  { id: "volunteers", icon: Users, color: "#0d9488" },
];

const DispatchModal = ({ isOpen, onClose, onDispatch, reportTitle }: DispatchModalProps) => {
  const { t } = useLanguage();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  const handleDispatch = () => {
    if (selectedTeam) {
      onDispatch(selectedTeam, note);
      setSelectedTeam(null);
      setNote("");
      onClose();
    }
  };

  const getTeamName = (teamId: string) => {
    const teamKeyMap: { [key: string]: string } = {
      police: "teamPolice",
      army: "teamArmy",
      redCross: "teamRedCross",
      fireBrigade: "teamFireBrigade",
      medical: "teamMedical",
      rescue: "teamRescue",
      excavator: "teamExcavator",
      volunteers: "teamVolunteers",
    };
    return t(teamKeyMap[teamId] || teamId);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0D6A6A] text-white p-4 sm:p-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold">{t("dispatchTeam")}</h2>
            <p className="text-sm text-white/80 mt-0.5 truncate max-w-[250px]">{reportTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto max-h-[60vh]">
          <p className="text-sm text-slate-600 mb-4">{t("selectTeam")}</p>

          {/* Team Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {teams.map((team) => {
              const Icon = team.icon;
              const isSelected = selectedTeam === team.id;
              return (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  className={`
                    p-3 sm:p-4 rounded-xl border-2 transition-all duration-200
                    flex flex-col items-center gap-2 text-center
                    ${isSelected 
                      ? "border-[#0D6A6A] bg-[#0D6A6A]/5 shadow-md" 
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }
                  `}
                >
                  <div 
                    className={`
                      w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                      transition-all duration-200
                      ${isSelected ? "scale-110" : ""}
                    `}
                    style={{ backgroundColor: `${team.color}20` }}
                  >
                    <Icon 
                      className="w-5 h-5 sm:w-6 sm:h-6" 
                      style={{ color: team.color }}
                    />
                  </div>
                  <span className={`
                    text-xs sm:text-sm font-medium
                    ${isSelected ? "text-[#0D6A6A]" : "text-slate-700"}
                  `}>
                    {getTeamName(team.id)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Note Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t("addNote")}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("notePlaceholder")}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0D6A6A]/30 focus:border-[#0D6A6A]"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 sm:p-5 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleDispatch}
            disabled={!selectedTeam}
            className="flex-1 bg-[#0D6A6A] hover:bg-[#0a5555] text-white disabled:opacity-50"
          >
            {t("confirmDispatch")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DispatchModal;

