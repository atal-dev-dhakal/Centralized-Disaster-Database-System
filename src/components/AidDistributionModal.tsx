import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { X, Upload, Package } from "lucide-react";

interface AidDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AidLogData) => void;
  rehabCaseId?: string;
  defaultLocation?: string;
}

export interface AidLogData {
  rehab_case_id?: string;
  item_type: string;
  quantity: number;
  unit: string;
  delivered_by: string;
  delivered_to: string;
  location: string;
  ward: string;
  notes: string;
  proof_image_url?: string;
  proof_image_file?: File;
}

const ITEM_TYPES = [
  { id: "rice", translationKey: "itemRice" },
  { id: "water", translationKey: "itemWater" },
  { id: "tarpaulin", translationKey: "itemTarpaulin" },
  { id: "medicine", translationKey: "itemMedicine" },
  { id: "blankets", translationKey: "itemBlankets" },
  { id: "tents", translationKey: "itemTents" },
  { id: "clothing", translationKey: "itemClothing" },
  { id: "cash", translationKey: "itemCash" },
  { id: "other", translationKey: "itemOther" },
];

const UNITS = [
  { id: "kg", translationKey: "unitKg" },
  { id: "liters", translationKey: "unitLiters" },
  { id: "pieces", translationKey: "unitPieces" },
  { id: "packets", translationKey: "unitPackets" },
  { id: "rupees", translationKey: "unitRupees" },
];

const AidDistributionModal = ({
  isOpen,
  onClose,
  onSave,
  rehabCaseId,
  defaultLocation = "",
}: AidDistributionModalProps) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [itemType, setItemType] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState("pieces");
  const [deliveredBy, setDeliveredBy] = useState("");
  const [deliveredTo, setDeliveredTo] = useState("");
  const [location, setLocation] = useState(defaultLocation);
  const [ward, setWard] = useState("");
  const [notes, setNotes] = useState("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!itemType || !deliveredBy || !deliveredTo || quantity <= 0) return;

    setIsSubmitting(true);
    try {
      await onSave({
        rehab_case_id: rehabCaseId,
        item_type: itemType,
        quantity,
        unit,
        delivered_by: deliveredBy,
        delivered_to: deliveredTo,
        location,
        ward,
        notes,
        proof_image_file: proofImage || undefined,
      });
      
      // Reset form
      setItemType("");
      setQuantity(1);
      setUnit("pieces");
      setDeliveredBy("");
      setDeliveredTo("");
      setLocation(defaultLocation);
      setWard("");
      setNotes("");
      setProofImage(null);
      setProofPreview(null);
      
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0D6A6A]/10 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-[#0D6A6A]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-dark">
                {t("logAidDistribution")}
              </h2>
              <p className="text-sm text-slate-gray">
                {t("aidDistribution")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Item Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-dark mb-2">
              {t("itemType")} *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ITEM_TYPES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setItemType(item.id)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    itemType === item.id
                      ? "bg-[#0D6A6A] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t(item.translationKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-dark mb-2">
                {t("quantity")} *
              </label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min={1}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-dark mb-2">
                {t("unit")}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D6A6A]"
              >
                {UNITS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {t(u.translationKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Delivered By */}
          <div>
            <label className="block text-sm font-semibold text-slate-dark mb-2">
              {t("deliveredBy")} *
            </label>
            <Input
              type="text"
              value={deliveredBy}
              onChange={(e) => setDeliveredBy(e.target.value)}
              placeholder="e.g., Nepal Red Cross, Ward Office"
              className="w-full"
            />
          </div>

          {/* Delivered To */}
          <div>
            <label className="block text-sm font-semibold text-slate-dark mb-2">
              {t("deliveredTo")} *
            </label>
            <Input
              type="text"
              value={deliveredTo}
              onChange={(e) => setDeliveredTo(e.target.value)}
              placeholder="e.g., Ram Bahadur Household, Community Center"
              className="w-full"
            />
          </div>

          {/* Location & Ward */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-dark mb-2">
                Location
              </label>
              <Input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Sindhupalchok"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-dark mb-2">
                {t("ward")}
              </label>
              <Input
                type="text"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                placeholder="e.g., Ward 5"
                className="w-full"
              />
            </div>
          </div>

          {/* Proof Photo */}
          <div>
            <label className="block text-sm font-semibold text-slate-dark mb-2">
              {t("proofPhoto")}
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            {proofPreview ? (
              <div className="relative">
                <img
                  src={proofPreview}
                  alt="Proof"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setProofImage(null);
                    setProofPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center gap-2 hover:border-[#0D6A6A] transition-colors"
              >
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-500">{t("clickToUpload")}</span>
              </button>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-dark mb-2">
              {t("aidNotes")}
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              className="w-full min-h-[60px]"
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
            disabled={!itemType || !deliveredBy || !deliveredTo || quantity <= 0 || isSubmitting}
            className="flex-1 bg-[#0D6A6A] hover:bg-[#0a5555] text-white"
          >
            {isSubmitting ? t("pleaseWait") : t("saveAidLog")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AidDistributionModal;

