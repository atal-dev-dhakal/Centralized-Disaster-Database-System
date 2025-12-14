import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { X, Home, Utensils, Stethoscope, Heart, Hammer, School, Construction } from "lucide-react";

interface RehabCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RehabCaseData) => void;
  damageReportId: string;
  damageReportTitle: string;
  initialLocation?: string;
  initialLatitude?: number;
  initialLongitude?: number;
}

export interface RehabCaseData {
  damage_report_id: string;
  needs: string[];
  priority: "low" | "medium" | "high";
  assigned_org: string;
  target_date: string;
  notes: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

const NEEDS_OPTIONS = [
  { id: "temp_shelter", icon: Home, translationKey: "needTempShelter" },
  { id: "food_support", icon: Utensils, translationKey: "needFoodSupport" },
  { id: "medical_followup", icon: Stethoscope, translationKey: "needMedicalFollowup" },
  { id: "psychosocial", icon: Heart, translationKey: "needPsychosocial" },
  { id: "house_repair", icon: Hammer, translationKey: "needHouseRepair" },
  { id: "school_restoration", icon: School, translationKey: "needSchoolRestoration" },
  { id: "road_repair", icon: Construction, translationKey: "needRoadRepair" },
];

const RehabCaseModal = ({
  isOpen,
  onClose,
  onSave,
  damageReportId,
  damageReportTitle,
  initialLocation = "",
  initialLatitude,
  initialLongitude,
}: RehabCaseModalProps) => {
  const { t } = useLanguage();

  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [assignedOrg, setAssignedOrg] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleNeed = (needId: string) => {
    setSelectedNeeds((prev) =>
      prev.includes(needId)
        ? prev.filter((n) => n !== needId)
        : [...prev, needId]
    );
  };

  const handleSubmit = async () => {
    if (selectedNeeds.length === 0) return;

    setIsSubmitting(true);
    try {
      await onSave({
        damage_report_id: damageReportId,
        needs: selectedNeeds,
        priority,
        assigned_org: assignedOrg,
        target_date: targetDate,
        notes,
        location: initialLocation,
        latitude: initialLatitude,
        longitude: initialLongitude,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-modal-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-dark">
              {t("createRehabCase")}
            </h2>
            <p className="text-sm text-slate-gray mt-1">
              {t("linkedDamageReport")}: {damageReportTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Needs Checklist */}
          <div>
            <label className="block text-sm font-semibold text-slate-dark mb-3">
              {t("rehabNeeds")} *
            </label>
            <div className="grid grid-cols-1 gap-2">
              {NEEDS_OPTIONS.map((need) => {
                const Icon = need.icon;
                const isSelected = selectedNeeds.includes(need.id);
                return (
                  <button
                    key={need.id}
                    type="button"
                    onClick={() => toggleNeed(need.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? "border-[#0D6A6A] bg-[#0D6A6A]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-[#0D6A6A] text-white" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`font-medium ${
                        isSelected ? "text-[#0D6A6A]" : "text-slate-gray"
                      }`}
                    >
                      {t(need.translationKey)}
                    </span>
                    {isSelected && (
                      <span className="ml-auto text-[#0D6A6A]">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-slate-dark mb-3">
              Priority
            </label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                    priority === p
                      ? p === "high"
                        ? "bg-red-500 text-white"
                        : p === "medium"
                        ? "bg-yellow-500 text-white"
                        : "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t(`priority${p.charAt(0).toUpperCase() + p.slice(1)}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Assigned Org */}
          <div>
            <label className="block text-sm font-semibold text-slate-dark mb-2">
              {t("assignedOrg")}
            </label>
            <Input
              type="text"
              value={assignedOrg}
              onChange={(e) => setAssignedOrg(e.target.value)}
              placeholder="e.g., Red Cross Nepal, Local Municipality"
              className="w-full"
            />
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-dark mb-2">
              {t("targetDate")}
            </label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-dark mb-2">
              {t("rehabNotes")}
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details about rehabilitation needs..."
              className="w-full min-h-[80px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedNeeds.length === 0 || isSubmitting}
            className="flex-1 bg-[#0D6A6A] hover:bg-[#0a5555] text-white"
          >
            {isSubmitting ? t("pleaseWait") : t("saveRehabCase")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RehabCaseModal;

