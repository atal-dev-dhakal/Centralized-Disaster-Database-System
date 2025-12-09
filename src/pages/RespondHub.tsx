import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import Layout from "@/components/layout/Layout";
import LocationPicker from "@/components/LocationPicker";
import { User, AlertTriangle, Upload, X, Clock, CheckCircle, ArrowLeft } from "lucide-react";

type ReportType = "missing" | "damage" | null;

const RespondHub = () => {
  const { session, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [selectedType, setSelectedType] = useState<ReportType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [recentReports, setRecentReports] = useState<any[]>([]);

  // Missing Person Form State
  const [missingForm, setMissingForm] = useState({
    name: "",
    lastSeen: "",
    contact: "",
    image: null as File | null,
    latitude: 27.7172,
    longitude: 85.3240,
  });

  // Damage Report Form State
  const [damageForm, setDamageForm] = useState({
    type: "landslide",
    description: "",
    hasCasualties: "no",
    latitude: 27.7172,
    longitude: 85.3240,
  });

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/auth");
    }
  }, [session, authLoading, navigate]);

  useEffect(() => {
    if (session) {
      fetchRecentReports();
    }
  }, [session]);

  const fetchRecentReports = async () => {
    try {
      const { data: missing } = await supabase
        .from("missing_persons")
        .select("id, name, created_at, status")
        .eq("reporter_id", session?.user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      const { data: damage } = await supabase
        .from("damage_reports")
        .select("id, location, created_at, verified")
        .eq("reporter_id", session?.user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      const combined = [
        ...(missing || []).map((r) => ({ ...r, type: "missing" })),
        ...(damage || []).map((r) => ({ ...r, type: "damage", name: r.location })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setRecentReports(combined.slice(0, 5));
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleImageUpload = async (file: File, folder: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from("disaster-images")
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("disaster-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleMissingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setIsSubmitting(true);

    try {
      let imageUrl = null;
      if (missingForm.image) {
        imageUrl = await handleImageUpload(missingForm.image, "missing-persons");
      }

      const { error } = await supabase.from("missing_persons").insert([
        {
          name: missingForm.name,
          last_seen_location: missingForm.lastSeen,
          reporter_contact: missingForm.contact,
          image_url: imageUrl,
          latitude: missingForm.latitude,
          longitude: missingForm.longitude,
          reporter_id: session.user.id,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Your missing person report has been sent to responders.",
      });

      setMissingForm({
        name: "",
        lastSeen: "",
        contact: "",
        image: null,
        latitude: 27.7172,
        longitude: 85.3240,
      });
      setImagePreview(null);
      setSelectedType(null);
      fetchRecentReports();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDamageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("damage_reports").insert([
        {
          location: damageForm.type,
          description: damageForm.description,
          has_casualties: damageForm.hasCasualties === "yes",
          latitude: damageForm.latitude,
          longitude: damageForm.longitude,
          reporter_id: session.user.id,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Your emergency report has been sent to the response team.",
      });

      setDamageForm({
        type: "landslide",
        description: "",
        hasCasualties: "no",
        latitude: 27.7172,
        longitude: 85.3240,
      });
      setSelectedType(null);
      fetchRecentReports();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-slate-gray">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6 sm:py-10 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-dark mb-2">
              {t("reportIncident")}
            </h1>
            <p className="text-sm sm:text-base text-slate-gray">
              {t("selectToReport")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Form Area */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              {/* Type Selector */}
              {!selectedType && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <button
                    onClick={() => setSelectedType("missing")}
                    className="card-base hover:shadow-lg transition-all duration-300 text-left group border-2 border-transparent hover:border-[#0D6A6A] p-5 sm:p-6"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-yellow-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <User className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-dark mb-2">
                      {t("missingPerson")}
                    </h3>
                    <p className="text-slate-gray text-sm">
                      {t("missingPersonDesc")}
                    </p>
                  </button>

                  <button
                    onClick={() => setSelectedType("damage")}
                    className="card-base hover:shadow-lg transition-all duration-300 text-left group border-2 border-transparent hover:border-[#DC3545] p-5 sm:p-6"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-[#DC3545]" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-dark mb-2">
                      {t("damageHazard")}
                    </h3>
                    <p className="text-slate-gray text-sm">
                      {t("damageHazardDesc")}
                    </p>
                  </button>
                </div>
              )}

              {/* Missing Person Form */}
              {selectedType === "missing" && (
                <div className="card-base p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-5 sm:mb-6">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedType(null)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-dark">
                        {t("missingPersonReport")}
                      </h2>
                    </div>
                  </div>

                  <form onSubmit={handleMissingSubmit} className="space-y-4 sm:space-y-5">
                    <div>
                      <Label className="text-slate-gray font-medium text-sm sm:text-base">
                        {t("fullNameMissing")}
                      </Label>
                      <Input
                        type="text"
                        placeholder="Enter full name"
                        value={missingForm.name}
                        onChange={(e) =>
                          setMissingForm({ ...missingForm, name: e.target.value })
                        }
                        className="input-field mt-1.5"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-slate-gray font-medium text-sm sm:text-base">
                        {t("lastSeenLocation")}
                      </Label>
                      <Input
                        type="text"
                        placeholder="Where were they last seen?"
                        value={missingForm.lastSeen}
                        onChange={(e) =>
                          setMissingForm({ ...missingForm, lastSeen: e.target.value })
                        }
                        className="input-field mt-1.5"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-slate-gray font-medium text-sm sm:text-base">
                        {t("contactNumber")}
                      </Label>
                      <Input
                        type="tel"
                        placeholder="Your phone number"
                        value={missingForm.contact}
                        onChange={(e) =>
                          setMissingForm({ ...missingForm, contact: e.target.value })
                        }
                        className="input-field mt-1.5"
                        required
                      />
                    </div>

                    {/* Photo Upload */}
                    <div>
                      <Label className="text-slate-gray font-medium text-sm sm:text-base">
                        {t("uploadPhoto")}
                      </Label>
                      <div className="mt-1.5">
                        {imagePreview ? (
                          <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreview(null);
                                setMissingForm({ ...missingForm, image: null });
                              }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-28 sm:h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#0D6A6A] transition-colors">
                            <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">
                              {t("clickToUpload")}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setMissingForm({ ...missingForm, image: file });
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setImagePreview(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Map Picker */}
                    <div>
                      <Label className="text-slate-gray font-medium text-sm sm:text-base">
                        {t("pinLocation")}
                      </Label>
                      <div className="mt-1.5 rounded-lg overflow-hidden border border-gray-200 h-48 sm:h-64">
                        <LocationPicker
                          onLocationSelected={(lat, lng) =>
                            setMissingForm({ ...missingForm, latitude: lat, longitude: lng })
                          }
                          initialLat={missingForm.latitude}
                          initialLng={missingForm.longitude}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-primary h-11 sm:h-12 text-sm sm:text-base"
                    >
                      {isSubmitting ? t("submitting") : t("submitMissingReport")}
                    </Button>
                  </form>
                </div>
              )}

              {/* Damage Report Form */}
              {selectedType === "damage" && (
                <div className="card-base p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-5 sm:mb-6">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedType(null)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-dark">
                        {t("damageHazardReport")}
                      </h2>
                    </div>
                  </div>

                  <form onSubmit={handleDamageSubmit} className="space-y-4 sm:space-y-5">
                    <div>
                      <Label className="text-slate-gray font-medium text-sm sm:text-base">
                        {t("incidentType")}
                      </Label>
                      <select
                        value={damageForm.type}
                        onChange={(e) =>
                          setDamageForm({ ...damageForm, type: e.target.value })
                        }
                        className="input-field mt-1.5"
                        required
                      >
                        <option value="landslide">{t("landslide")}</option>
                        <option value="flood">{t("flood")}</option>
                        <option value="fire">{t("fire")}</option>
                        <option value="earthquake">{t("earthquake")}</option>
                        <option value="other">{t("other")}</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-slate-gray font-medium text-sm sm:text-base">
                        {t("description")}
                      </Label>
                      <Textarea
                        placeholder={t("descriptionPlaceholder")}
                        value={damageForm.description}
                        onChange={(e) =>
                          setDamageForm({ ...damageForm, description: e.target.value })
                        }
                        className="input-field mt-1.5 min-h-[80px] sm:min-h-[100px]"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-slate-gray font-medium mb-3 block text-sm sm:text-base">
                        {t("areThereCasualties")}
                      </Label>
                      <RadioGroup
                        value={damageForm.hasCasualties}
                        onValueChange={(value) =>
                          setDamageForm({ ...damageForm, hasCasualties: value })
                        }
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="yes"
                            id="casualties-yes"
                            className="border-[#DC3545] text-[#DC3545]"
                          />
                          <Label htmlFor="casualties-yes" className="text-slate-dark">
                            {t("yes")}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="no"
                            id="casualties-no"
                            className="border-[#0D6A6A] text-[#0D6A6A]"
                          />
                          <Label htmlFor="casualties-no" className="text-slate-dark">
                            {t("no")}
                          </Label>
                        </div>
                      </RadioGroup>
                      {damageForm.hasCasualties === "yes" && (
                        <p className="text-sm text-[#DC3545] mt-2 font-medium">
                          {t("criticalPriority")}
                        </p>
                      )}
                    </div>

                    {/* Map Picker */}
                    <div>
                      <Label className="text-slate-gray font-medium text-sm sm:text-base">
                        {t("pinIncidentLocation")}
                      </Label>
                      <div className="mt-1.5 rounded-lg overflow-hidden border border-gray-200 h-48 sm:h-64">
                        <LocationPicker
                          onLocationSelected={(lat, lng) =>
                            setDamageForm({ ...damageForm, latitude: lat, longitude: lng })
                          }
                          initialLat={damageForm.latitude}
                          initialLng={damageForm.longitude}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-accent h-11 sm:h-12 text-sm sm:text-base"
                    >
                      {isSubmitting ? t("submitting") : t("sendEmergencyReport")}
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {/* Sidebar: Recent Reports */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="card-base p-5 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-slate-dark mb-4">
                  {t("yourRecentReports")}
                </h3>
                {recentReports.length === 0 ? (
                  <p className="text-slate-gray text-sm">
                    {t("noReportsYet")}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentReports.map((report) => (
                      <div
                        key={report.id}
                        className={`p-3 rounded-lg border-l-4 ${
                          report.type === "missing"
                            ? "border-l-yellow-500 bg-yellow-50"
                            : "border-l-red-500 bg-red-50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-dark text-sm truncate">
                              {report.name}
                            </p>
                            <p className="text-xs text-slate-gray">
                              {new Date(report.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {report.verified || report.status === "found" ? (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 ml-2" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-500 flex-shrink-0 ml-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RespondHub;
