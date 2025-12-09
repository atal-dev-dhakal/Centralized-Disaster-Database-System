import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import Layout from "@/components/layout/Layout";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Map as MapIcon,
  List,
  Image as ImageIcon,
  Download,
  X,
} from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHNxZ2JnenUwMXBoMmtvNnJqZjZ4MG85In0.r4XJMi1Hmf2ADT8LBBiSPQ";

interface Report {
  id: string;
  type: "missing" | "damage";
  title: string;
  description?: string;
  time: string;
  latitude: number;
  longitude: number;
  verified: boolean;
  critical: boolean;
  imageUrl?: string | null;
}

type AdminTab = "map" | "feed" | "gallery";

const AdminDashboard = () => {
  const { session, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [activeTab, setActiveTab] = useState<AdminTab>("feed");
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [stats, setStats] = useState({
    activeReports: 0,
    criticalHazards: 0,
    verifiedCount: 0,
  });
  const [reports, setReports] = useState<Report[]>([]);
  const [photos, setPhotos] = useState<{ url: string; title: string; location: string; time: string }[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/auth");
    }
  }, [session, authLoading, navigate]);

  useEffect(() => {
    if (session) {
      fetchAllReports();
    }
  }, [session]);

  // Initialize Map - with delay to ensure container is ready
  const initMap = useCallback(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [85.324, 27.7172],
        zoom: 7,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.current.on("load", () => {
        setMapReady(true);
        console.log("Map loaded successfully");
      });

      map.current.on("error", (e) => {
        console.error("Map error:", e);
      });
    } catch (error) {
      console.error("Failed to initialize map:", error);
    }
  }, []);

  useEffect(() => {
    // Delay map init to ensure DOM is ready
    const timer = setTimeout(() => {
      initMap();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initMap]);

  // Resize map when tab changes to map
  useEffect(() => {
    if (activeTab === "map" && map.current) {
      setTimeout(() => {
        map.current?.resize();
      }, 100);
    }
  }, [activeTab]);

  // Update markers when reports change
  useEffect(() => {
    if (!map.current || !mapReady) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    reports.forEach((report) => {
      const el = document.createElement("div");
      el.className = "custom-marker";
      el.style.cssText = `
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      `;

      if (report.verified) {
        el.style.backgroundColor = "#22c55e";
      } else if (report.type === "missing") {
        el.style.backgroundColor = "#eab308";
      } else {
        el.style.backgroundColor = "#DC3545";
      }

      const marker = new mapboxgl.Marker(el)
        .setLngLat([report.longitude, report.latitude])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [reports, mapReady]);

  const fetchAllReports = async () => {
    try {
      console.log("Fetching reports...");
      
      const { data: missingData, error: missingError } = await supabase
        .from("missing_persons")
        .select("*")
        .order("created_at", { ascending: false });

      if (missingError) {
        console.error("Missing persons fetch error:", missingError);
      }

      const { data: damageData, error: damageError } = await supabase
        .from("damage_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (damageError) {
        console.error("Damage reports fetch error:", damageError);
      }

      console.log("Missing data:", missingData);
      console.log("Damage data:", damageData);

      const missingReports: Report[] = (missingData || []).map((r) => ({
        id: r.id,
        type: "missing" as const,
        title: r.name,
        description: r.last_seen_location,
        time: r.created_at,
        latitude: r.latitude || 27.7172,
        longitude: r.longitude || 85.324,
        verified: r.status === "found",
        critical: false,
        imageUrl: r.image_url,
      }));

      const damageReports: Report[] = (damageData || []).map((r) => ({
        id: r.id,
        type: "damage" as const,
        title: r.location,
        description: r.description,
        time: r.created_at,
        latitude: r.latitude || 27.7172,
        longitude: r.longitude || 85.324,
        verified: r.verified || false,
        critical: r.has_casualties || false,
        imageUrl: r.image_url,
      }));

      const allReports = [...missingReports, ...damageReports].sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      );

      console.log("All reports:", allReports);
      setReports(allReports);

      // Extract photos
      const allPhotos = allReports
        .filter((r) => r.imageUrl)
        .map((r) => ({
          url: r.imageUrl!,
          title: r.title,
          location: r.description || "",
          time: r.time,
        }));
      console.log("Photos found:", allPhotos);
      setPhotos(allPhotos);

      const active = allReports.filter((r) => !r.verified).length;
      const critical = damageReports.filter((r) => r.critical && !r.verified).length;
      const verified = allReports.filter((r) => r.verified).length;

      setStats({
        activeReports: active,
        criticalHazards: critical,
        verifiedCount: verified,
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleVerify = async (report: Report) => {
    try {
      if (report.type === "missing") {
        await supabase
          .from("missing_persons")
          .update({ status: "found" })
          .eq("id", report.id);
      } else {
        await supabase
          .from("damage_reports")
          .update({ verified: true })
          .eq("id", report.id);
      }

      toast({ title: "Report verified", description: "Status updated successfully." });
      fetchAllReports();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);

    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} mins ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const headers = ["Type", "Title", "Description", "Date", "Latitude", "Longitude", "Verified", "Critical"];
      const rows = reports.map((r) => [
        r.type,
        r.title,
        r.description || "",
        new Date(r.time).toISOString(),
        r.latitude,
        r.longitude,
        r.verified ? "Yes" : "No",
        r.critical ? "Yes" : "No",
      ]);

      const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `sajhasahayog-reports-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();

      toast({ title: "Export successful", description: "CSV file downloaded." });
    } catch (error) {
      toast({ title: "Export failed", description: "Could not generate CSV.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = () => {
    setIsExporting(true);
    try {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>SajhaSahayog Reports</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #0D6A6A; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #0D6A6A; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .critical { color: #DC3545; font-weight: bold; }
            .verified { color: #22c55e; }
          </style>
        </head>
        <body>
          <h1>SajhaSahayog Incident Reports</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <p>Total Reports: ${reports.length} | Active: ${stats.activeReports} | Critical: ${stats.criticalHazards} | Verified: ${stats.verifiedCount}</p>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th>Description</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${reports
                .map(
                  (r) => `
                <tr>
                  <td>${r.type === "missing" ? "Missing Person" : "Damage/Hazard"}</td>
                  <td>${r.title}</td>
                  <td>${r.description || "-"}</td>
                  <td>${new Date(r.time).toLocaleDateString()}</td>
                  <td class="${r.critical ? "critical" : ""} ${r.verified ? "verified" : ""}">
                    ${r.critical ? "CRITICAL" : ""} ${r.verified ? "Verified" : "Pending"}
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
        </html>
      `;

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }

      toast({ title: "Export ready", description: "Print dialog opened." });
    } catch (error) {
      toast({ title: "Export failed", description: "Could not generate PDF.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  if (authLoading) {
    return (
      <Layout headerVariant="dark">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-slate-gray">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout headerVariant="dark" showFooter={false}>
      {/* Title Bar */}
      <div className="bg-[#1F2A2E] text-white py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-lg sm:text-xl font-bold">{t("adminCommandCenter")}</h1>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={exportToCSV}
              disabled={isExporting}
              className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm"
            >
              <Download className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{t("exportCSV")}</span>
              <span className="sm:hidden">CSV</span>
            </Button>
            <Button
              size="sm"
              onClick={exportToPDF}
              disabled={isExporting}
              className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm"
            >
              <Download className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{t("exportPDF")}</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="bg-white border-b border-gray-200 py-3 sm:py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-slate-dark">
                  {stats.activeReports}
                </p>
                <p className="text-xs sm:text-sm text-slate-gray truncate">{t("activeReports")}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-[#DC3545]" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-[#DC3545]">
                  {stats.criticalHazards}
                </p>
                <p className="text-xs sm:text-sm text-slate-gray truncate">{t("criticalHazards")}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {stats.verifiedCount}
                </p>
                <p className="text-xs sm:text-sm text-slate-gray truncate">{t("verifiedResolved")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - visible on all screen sizes */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex">
          <button
            onClick={() => setActiveTab("feed")}
            className={`flex-1 lg:flex-none lg:px-8 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === "feed"
                ? "text-[#0D6A6A] border-b-2 border-[#0D6A6A]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <List className="w-4 h-4" />
            {t("feed")}
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`flex-1 lg:flex-none lg:px-8 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === "map"
                ? "text-[#0D6A6A] border-b-2 border-[#0D6A6A]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MapIcon className="w-4 h-4" />
            {t("map")}
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`flex-1 lg:flex-none lg:px-8 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === "gallery"
                ? "text-[#0D6A6A] border-b-2 border-[#0D6A6A]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            {t("gallery")} ({photos.length})
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden" style={{ height: "calc(100vh - 240px)" }}>
        {/* Feed Tab */}
        {activeTab === "feed" && (
          <div className="h-full overflow-y-auto bg-[#F9FAFA]">
            <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <List className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-slate-gray">{t("noReportsYetAdmin")}</p>
                </div>
              ) : (
                reports.map((report) => (
                  <div
                    key={report.id}
                    className={`bg-white rounded-lg shadow-sm p-4 sm:p-5 border-l-4 ${
                      report.verified
                        ? "border-l-green-500"
                        : report.critical
                        ? "border-l-red-500"
                        : report.type === "missing"
                        ? "border-l-yellow-500"
                        : "border-l-orange-500"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-dark text-base truncate">
                          {report.type === "missing" ? "Missing: " : "Hazard: "}
                          {report.title}
                        </p>
                        <p className="text-xs text-slate-gray mt-1">
                          {formatTime(report.time)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {report.imageUrl && (
                          <button
                            onClick={() => setSelectedPhoto(report.imageUrl!)}
                            className="w-10 h-10 rounded overflow-hidden flex-shrink-0 border border-gray-200"
                          >
                            <img src={report.imageUrl} alt="" className="w-full h-full object-cover" />
                          </button>
                        )}
                        {report.critical && !report.verified && (
                          <span className="text-xs bg-red-100 text-[#DC3545] px-2 py-1 rounded font-medium flex-shrink-0">
                            {t("critical")}
                          </span>
                        )}
                      </div>
                    </div>

                    {report.description && (
                      <p className="text-sm text-slate-gray mb-3">
                        {report.description}
                      </p>
                    )}

                    {!report.verified && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleVerify(report)}
                          className="bg-[#0D6A6A] hover:bg-[#0a5555] text-white text-xs"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t("verify")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActiveTab("map");
                            setTimeout(() => {
                              if (map.current) {
                                map.current.flyTo({
                                  center: [report.longitude, report.latitude],
                                  zoom: 14,
                                });
                              }
                            }, 200);
                          }}
                          className="text-xs"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {t("viewOnMap")}
                        </Button>
                      </div>
                    )}

                    {report.verified && (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {t("verified")}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Map Tab */}
        {activeTab === "map" && (
          <div className="h-full relative">
            <div ref={mapContainer} className="absolute inset-0" />

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm z-10">
              <p className="font-semibold text-slate-dark mb-2">{t("legend")}</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#DC3545]" />
                  <span className="text-slate-gray text-xs">{t("damageUnverified")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-slate-gray text-xs">{t("missingPerson")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-slate-gray text-xs">{t("verifiedResolved")}</span>
                </div>
              </div>
            </div>

            {/* Report count */}
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 z-10">
              <p className="text-sm font-medium text-slate-dark">
                {reports.length} reports on map
              </p>
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === "gallery" && (
          <div className="h-full overflow-y-auto bg-[#F9FAFA]">
            <div className="max-w-6xl mx-auto p-4 sm:p-6">
              {photos.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-slate-gray">{t("noPhotosYet")}</p>
                  <p className="text-sm text-gray-400 mt-2">Photos from reports will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPhoto(photo.url)}
                      className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity shadow-sm"
                    >
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log("Image load error:", photo.url);
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23999' font-size='12'%3ENo image%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={selectedPhoto}
              alt="Evidence"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg mx-auto"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Photo Navigation */}
            {photos.length > 1 && (
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 rounded-lg p-2 max-w-full overflow-x-auto">
                {photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhoto(photo.url);
                    }}
                    className={`w-12 h-12 rounded overflow-hidden border-2 flex-shrink-0 ${
                      selectedPhoto === photo.url ? "border-white" : "border-transparent"
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;
