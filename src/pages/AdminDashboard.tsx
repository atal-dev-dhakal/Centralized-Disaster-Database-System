import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import Layout from "@/components/layout/Layout";
import DispatchModal from "@/components/DispatchModal";
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
  Truck,
  Play,
} from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1IjoiYXRhbGRldmRoYWthbCIsImEiOiJjbWoxOWlsdDEwZmZxM2pxd2wxa3RqeGFsIn0.qHTeupEeSF4X_oCOydUScQ";

type ReportStatus = "pending" | "dispatched" | "in_progress" | "resolved";

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
  status: ReportStatus;
  dispatchedTeam?: string | null;
  dispatchNote?: string | null;
}

type AdminTab = "map" | "feed" | "gallery";

// Team name mapping for display
const getTeamDisplayName = (teamId: string, t: (key: string) => string): string => {
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

const AdminDashboard = () => {
  const { session, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [activeTab, setActiveTab] = useState<AdminTab>("feed");
  const [stats, setStats] = useState({
    activeReports: 0,
    criticalHazards: 0,
    verifiedCount: 0,
    dispatchedCount: 0,
  });
  const [reports, setReports] = useState<Report[]>([]);
  const [photos, setPhotos] = useState<{ url: string; title: string; location: string; time: string }[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  
  // Dispatch modal state
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedReportForDispatch, setSelectedReportForDispatch] = useState<Report | null>(null);

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
      // Small delay to ensure visibility is applied first
      setTimeout(() => {
        map.current?.resize();
      }, 50);
    }
  }, [activeTab]);

  // Re-initialize map if it failed initially
  useEffect(() => {
    if (activeTab === "map" && !map.current && mapContainer.current) {
      initMap();
    }
  }, [activeTab, initMap]);

  // Update markers when reports change - with dispatch status colors
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

      // Color based on status
      if (report.status === "resolved") {
        el.style.backgroundColor = "#22c55e"; // Green - resolved
      } else if (report.status === "in_progress") {
        el.style.backgroundColor = "#3b82f6"; // Blue - in progress
      } else if (report.status === "dispatched") {
        el.style.backgroundColor = "#8b5cf6"; // Purple - dispatched
      } else if (report.type === "missing") {
        el.style.backgroundColor = "#eab308"; // Yellow - missing person
      } else if (report.critical) {
        el.style.backgroundColor = "#DC3545"; // Red - critical
      } else {
        el.style.backgroundColor = "#f97316"; // Orange - pending damage
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

      const missingReports: Report[] = (missingData || []).map((r) => {
        // Determine status based on existing fields
        let status: ReportStatus = "pending";
        if (r.status === "found") {
          status = "resolved";
        } else if ((r as any).dispatch_status) {
          status = (r as any).dispatch_status as ReportStatus;
        }
        
        return {
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
          status,
          dispatchedTeam: (r as any).dispatched_team || null,
          dispatchNote: (r as any).dispatch_note || null,
        };
      });

      const damageReports: Report[] = (damageData || []).map((r) => {
        // Determine status based on existing fields
        let status: ReportStatus = "pending";
        if (r.verified) {
          status = "resolved";
        } else if ((r as any).dispatch_status) {
          status = (r as any).dispatch_status as ReportStatus;
        }
        
        return {
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
          status,
          dispatchedTeam: (r as any).dispatched_team || null,
          dispatchNote: (r as any).dispatch_note || null,
        };
      });

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

      const pending = allReports.filter((r) => r.status === "pending").length;
      const critical = damageReports.filter((r) => r.critical && r.status !== "resolved").length;
      const resolved = allReports.filter((r) => r.status === "resolved").length;
      const dispatched = allReports.filter((r) => r.status === "dispatched" || r.status === "in_progress").length;

      setStats({
        activeReports: pending,
        criticalHazards: critical,
        verifiedCount: resolved,
        dispatchedCount: dispatched,
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleDispatchClick = (report: Report) => {
    setSelectedReportForDispatch(report);
    setDispatchModalOpen(true);
  };

  const handleDispatch = async (team: string, note: string) => {
    if (!selectedReportForDispatch) return;

    try {
      const updateData = {
        dispatch_status: "dispatched",
        dispatched_team: team,
        dispatch_note: note || null,
      };

      if (selectedReportForDispatch.type === "missing") {
        await supabase
          .from("missing_persons")
          .update(updateData)
          .eq("id", selectedReportForDispatch.id);
      } else {
        await supabase
          .from("damage_reports")
          .update(updateData)
          .eq("id", selectedReportForDispatch.id);
      }

      toast({ 
        title: t("dispatchSuccess"), 
        description: `${getTeamDisplayName(team, t)} ${t("dispatched").toLowerCase()}` 
      });
      
      // Update local state immediately
      setReports(prev => prev.map(r => 
        r.id === selectedReportForDispatch.id 
          ? { ...r, status: "dispatched" as ReportStatus, dispatchedTeam: team, dispatchNote: note }
          : r
      ));
      
      // Also update stats
      setStats(prev => ({
        ...prev,
        activeReports: prev.activeReports - 1,
        dispatchedCount: prev.dispatchedCount + 1,
      }));

    } catch (error: any) {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
    }
  };

  const handleMarkInProgress = async (report: Report) => {
    try {
      const table = report.type === "missing" ? "missing_persons" : "damage_reports";
      await supabase
        .from(table)
        .update({ dispatch_status: "in_progress" })
        .eq("id", report.id);

      // Update local state
      setReports(prev => prev.map(r => 
        r.id === report.id ? { ...r, status: "in_progress" as ReportStatus } : r
      ));

      toast({ title: t("statusInProgress") });
    } catch (error: any) {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
    }
  };

  const handleMarkResolved = async (report: Report) => {
    try {
      if (report.type === "missing") {
        await supabase
          .from("missing_persons")
          .update({ status: "found", dispatch_status: "resolved" })
          .eq("id", report.id);
      } else {
        await supabase
          .from("damage_reports")
          .update({ verified: true, dispatch_status: "resolved" })
          .eq("id", report.id);
      }

      toast({ title: t("resolveSuccess") });
      
      // Update local state
      setReports(prev => prev.map(r => 
        r.id === report.id ? { ...r, status: "resolved" as ReportStatus, verified: true } : r
      ));
      
      setStats(prev => ({
        ...prev,
        dispatchedCount: prev.dispatchedCount - 1,
        verifiedCount: prev.verifiedCount + 1,
      }));

    } catch (error: any) {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
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

  const getStatusBadge = (report: Report) => {
    switch (report.status) {
      case "dispatched":
        return (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium flex items-center gap-1">
            <Truck className="w-3 h-3" />
            {t("statusDispatched")}
          </span>
        );
      case "in_progress":
        return (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium flex items-center gap-1">
            <Play className="w-3 h-3" />
            {t("statusInProgress")}
          </span>
        );
      case "resolved":
        return (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {t("statusResolved")}
          </span>
        );
      default:
        return report.critical ? (
          <span className="text-xs bg-red-100 text-[#DC3545] px-2 py-1 rounded font-medium">
            {t("critical")}
          </span>
        ) : (
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-medium">
            {t("statusPending")}
          </span>
        );
    }
  };

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const headers = ["Type", "Title", "Description", "Date", "Latitude", "Longitude", "Status", "Dispatched Team", "Critical"];
      const rows = reports.map((r) => [
        r.type,
        r.title,
        r.description || "",
        new Date(r.time).toISOString(),
        r.latitude,
        r.longitude,
        r.status,
        r.dispatchedTeam ? getTeamDisplayName(r.dispatchedTeam, t) : "",
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
            .dispatched { color: #7c3aed; }
            .in-progress { color: #3b82f6; }
            .resolved { color: #22c55e; }
          </style>
        </head>
        <body>
          <h1>SajhaSahayog Incident Reports</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <p>Total: ${reports.length} | Pending: ${stats.activeReports} | Dispatched: ${stats.dispatchedCount} | Resolved: ${stats.verifiedCount}</p>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th>Description</th>
                <th>Date</th>
                <th>Status</th>
                <th>Team</th>
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
                  <td class="${r.status === 'dispatched' ? 'dispatched' : r.status === 'in_progress' ? 'in-progress' : r.status === 'resolved' ? 'resolved' : ''} ${r.critical ? 'critical' : ''}">
                    ${r.status.charAt(0).toUpperCase() + r.status.slice(1).replace('_', ' ')}
                    ${r.critical && r.status === 'pending' ? ' (CRITICAL)' : ''}
                  </td>
                  <td>${r.dispatchedTeam ? getTeamDisplayName(r.dispatchedTeam, t) : '-'}</td>
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

      {/* Stats Row - now with 4 stats */}
      <div className="bg-white border-b border-gray-200 py-3 sm:py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold text-slate-dark">
                  {stats.activeReports}
                </p>
                <p className="text-[10px] sm:text-sm text-slate-gray truncate">{t("pending")}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Truck className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold text-purple-600">
                  {stats.dispatchedCount}
                </p>
                <p className="text-[10px] sm:text-sm text-slate-gray truncate">{t("dispatched")}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6 text-[#DC3545]" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold text-[#DC3545]">
                  {stats.criticalHazards}
                </p>
                <p className="text-[10px] sm:text-sm text-slate-gray truncate">{t("critical")}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold text-green-600">
                  {stats.verifiedCount}
                </p>
                <p className="text-[10px] sm:text-sm text-slate-gray truncate">{t("resolved")}</p>
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
      <div className="flex-1 overflow-hidden relative" style={{ height: "calc(100vh - 280px)" }}>
        {/* Map Tab - Always rendered but hidden when not active */}
        <div className={`absolute inset-0 ${activeTab === "map" ? "z-10" : "z-0 invisible"}`}>
          <div ref={mapContainer} className="w-full h-full" />

          {/* Map Legend - Updated with dispatch colors */}
          {activeTab === "map" && (
            <>
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm z-10">
                <p className="font-semibold text-slate-dark mb-2">{t("legend")}</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#DC3545]" />
                    <span className="text-slate-gray text-xs">{t("critical")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-slate-gray text-xs">{t("missingPerson")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-slate-gray text-xs">{t("dispatched")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-slate-gray text-xs">{t("inProgress")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-slate-gray text-xs">{t("resolved")}</span>
                  </div>
                </div>
              </div>

              {/* Report count */}
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 z-10">
                <p className="text-sm font-medium text-slate-dark">
                  {reports.length} reports on map
                </p>
              </div>
            </>
          )}
        </div>

        {/* Feed Tab */}
        {activeTab === "feed" && (
          <div className="h-full overflow-y-auto bg-[#F9FAFA] relative z-20">
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
                      report.status === "resolved"
                        ? "border-l-green-500"
                        : report.status === "in_progress"
                        ? "border-l-blue-500"
                        : report.status === "dispatched"
                        ? "border-l-purple-500"
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
                          {report.type === "missing" ? `${t("missingPerson")}: ` : ""}
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
                        {getStatusBadge(report)}
                      </div>
                    </div>

                    {report.description && (
                      <p className="text-sm text-slate-gray mb-3">
                        {report.description}
                      </p>
                    )}

                    {/* Show dispatched team info */}
                    {report.dispatchedTeam && report.status !== "resolved" && (
                      <div className="bg-purple-50 rounded-lg p-2 mb-3 text-sm">
                        <span className="text-purple-700 font-medium">
                          {t("dispatchedTo")}: {getTeamDisplayName(report.dispatchedTeam, t)}
                        </span>
                        {report.dispatchNote && (
                          <p className="text-purple-600 text-xs mt-1">{report.dispatchNote}</p>
                        )}
                      </div>
                    )}

                    {/* Action buttons based on status */}
                    <div className="flex flex-wrap gap-2">
                      {report.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleDispatchClick(report)}
                            className="bg-[#0D6A6A] hover:bg-[#0a5555] text-white text-xs"
                          >
                            <Truck className="w-3 h-3 mr-1" />
                            {t("dispatch")}
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
                        </>
                      )}

                      {report.status === "dispatched" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleMarkInProgress(report)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            {t("inProgress")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkResolved(report)}
                            className="text-xs text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {t("markResolved")}
                          </Button>
                        </>
                      )}

                      {report.status === "in_progress" && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkResolved(report)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t("markResolved")}
                        </Button>
                      )}

                      {report.status !== "pending" && (
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
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === "gallery" && (
          <div className="h-full overflow-y-auto bg-[#F9FAFA] relative z-20">
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

      {/* Dispatch Modal */}
      <DispatchModal
        isOpen={dispatchModalOpen}
        onClose={() => {
          setDispatchModalOpen(false);
          setSelectedReportForDispatch(null);
        }}
        onDispatch={handleDispatch}
        reportTitle={selectedReportForDispatch?.title || ""}
      />
    </Layout>
  );
};

export default AdminDashboard;
