import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, MapPin, Building2, ThumbsUp, Copy, CheckCircle2, Sparkles, Filter, Check, TrendingUp, AlertTriangle, Cpu, ListFilter, X, Compass, ZoomIn, ZoomOut, Globe, ExternalLink, Clipboard, Cloud, Loader } from "lucide-react";
import { Issue, SeverityType, IssueStatusType } from "../types";
import { uploadReportToDrive } from "../lib/googleDrive";

interface CommunityDashboardProps {
  issues: Issue[];
  onConfirmIssue: (id: string) => void;
  onMarkDuplicate: (id: string) => void;
  onMarkResolved: (id: string) => void;
  onTriggerVerification: (issue: Issue) => void;
  user: any;
  accessToken: string | null;
  onLogin: () => void;
}

export default function CommunityDashboard({
  issues,
  onConfirmIssue,
  onMarkDuplicate,
  onMarkResolved,
  onTriggerVerification,
  user,
  accessToken,
  onLogin
}: CommunityDashboardProps) {
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Local state for tracking what has already been clicked in this browsing session to trigger custom green outlines / disabled status
  const [clickedConfirms, setClickedConfirms] = useState<Record<string, boolean>>({});
  const [clickedDuplicates, setClickedDuplicates] = useState<Record<string, boolean>>({});

  // Google Drive Export States
  const [isUploadingDrive, setIsUploadingDrive] = useState<Record<string, boolean>>({});
  const [uploadSuccessDrive, setUploadSuccessDrive] = useState<Record<string, string>>({});
  const [uploadErrorDrive, setUploadErrorDrive] = useState<Record<string, string>>({});

  const handleSaveReportToDrive = async (issue: Issue) => {
    if (!accessToken) {
      onLogin();
      return;
    }

    setIsUploadingDrive((prev) => ({ ...prev, [issue.id]: true }));
    setUploadSuccessDrive((prev) => ({ ...prev, [issue.id]: "" }));
    setUploadErrorDrive((prev) => ({ ...prev, [issue.id]: "" }));

    const formattedTitle = issue.short_title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const filename = `NagarSetu-Report-${issue.id}-${formattedTitle}.md`;

    const markdownContent = `# NAGARSETU AI — CITIZEN-MUNICIPAL LEDGER DOSSIER
**Bridge between citizens and civic resolution**

---

## 📋 CASE OVERVIEW
- **Incident ID:** ${issue.id}
- **Short Title:** ${issue.short_title}
- **Creation Date:** ${new Date(issue.createdAt).toLocaleString()}
- **Location Location:** ${issue.location}
- **Status:** ${issue.status}

---

## 🤖 GEMINI AI TRIAGE ASSESSMENT
- **Severity Rating:** ${issue.severity}
- **Computed Hazard Score:** ${issue.priority_score} / 100
- **Primary Issue Category:** ${issue.issue_type}
- **Routed Municipal Department:** ${issue.suggested_department}
- **AI Action Directive:** ${issue.recommended_action}

### ⚠️ Immediate Risk Evaluation:
> ${issue.risk_level || "Standard civil risk factor index."}

---

## 📝 CITIZEN COMPLAINT MEMO
- **Active Citizen Memo:**
${issue.user_note || "_No supplementary notes provided by citizen._"}

${issue.status === "Resolved" ? `
---

## 🛠️ RESOLUTION REPORT
- **Remediation Status:** Verified Resolved
- **Completion Date:** ${issue.resolvedAt ? new Date(issue.resolvedAt).toLocaleString() : "Approved"}
- **AI Verification Confidence:** ${issue.resolution_confidence || 90}%
- **Inspection Explanation:**
> ${issue.resolution_explanation || "Remediation visually approved by NagarSetu AI system."}
` : ''}

---
*This official record was compiled and archived via NagarSetu AI on behalf of active citizen communities.*
`;

    try {
      await uploadReportToDrive(accessToken, filename, markdownContent);
      setUploadSuccessDrive((prev) => ({ ...prev, [issue.id]: "Dossier backed up to Google Drive!" }));
      setTimeout(() => {
        setUploadSuccessDrive((prev) => ({ ...prev, [issue.id]: "" }));
      }, 4000);
    } catch (error: any) {
      console.error("Google Drive upload error:", error);
      setUploadErrorDrive((prev) => ({ ...prev, [issue.id]: "Failed to save file to Drive." }));
      setTimeout(() => {
        setUploadErrorDrive((prev) => ({ ...prev, [issue.id]: "" }));
      }, 4000);
    } finally {
      setIsUploadingDrive((prev) => ({ ...prev, [issue.id]: false }));
    }
  };

  // Map Modal States
  const [selectedMapIssue, setSelectedMapIssue] = useState<Issue | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(14);
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);

  // High-fidelity geographic coordinate calculator
  const getCoordinatesForIssue = (issue: Issue): { latitude: number; longitude: number } => {
    if (issue.latitude !== undefined && issue.longitude !== undefined) {
      return { latitude: issue.latitude, longitude: issue.longitude };
    }

    // Predefined high-fidelity coordinates for seed issues
    const seedCoords: Record<string, { latitude: number; longitude: number }> = {
      "civic-1": { latitude: 23.0754, longitude: 72.5276 }, // SG Highway Ahmedabad
      "civic-2": { latitude: 19.1234, longitude: 72.8361 }, // Shastri Nagar Mumbai
      "civic-3": { latitude: 18.5074, longitude: 73.8077 }, // Kothrud Pune
      "civic-4": { latitude: 21.1702, longitude: 72.8311 }, // VIP Road Surat
      "civic-5": { latitude: 22.3106, longitude: 73.1926 }, // Sayajibaug Vadodara
      "civic-6": { latitude: 12.9279, longitude: 77.6801 }, // Bellandur Bengaluru
      "civic-7": { latitude: 28.6219, longitude: 77.3582 }, // Noida Sector 62
      "civic-8": { latitude: 26.9239, longitude: 75.8267 }, // Hawa Mahal Jaipur
      "civic-9": { latitude: 22.7712, longitude: 75.8011 }, // Super Corridor Indore
      "civic-10": { latitude: 17.4483, longitude: 78.3498 }, // Gachibowli Hyderabad
    };

    if (seedCoords[issue.id]) {
      return seedCoords[issue.id];
    }

    // Deterministic fallback based on location text hashing
    let hash = 0;
    const str = issue.location || "";
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const lat = 8.4 + (Math.abs(hash % 26000) / 1000);
    const lng = 68.7 + (Math.abs((hash >> 3) % 28000) / 1000);
    return { 
      latitude: parseFloat(lat.toFixed(4)), 
      longitude: parseFloat(lng.toFixed(4)) 
    };
  };

  const handleCopyCoordinates = (lat: number, lng: number) => {
    const coordString = `${lat}, ${lng}`;
    try {
      navigator.clipboard.writeText(coordString);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
    } catch (e) {
      console.error("Clipboard copy denied: ", e);
    }
  };

  // Fetch unique categories
  const categories = ["All", ...Array.from(new Set(issues.map((i) => i.issue_type)))];

  // Filtering issues
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.short_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || issue.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || issue.issue_type === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getSeverityStyle = (sev: SeverityType) => {
    switch (sev) {
      case "Critical":
        return "bg-terracotta/10 text-terracotta border border-terracotta/20";
      case "High":
        return "bg-[#FAF0E6] text-[#A66249] border border-sand";
      case "Medium":
        return "bg-olive/10 text-olive border border-olive/20";
      default:
        return "bg-sand/30 text-olive/80 border border-sand/40";
    }
  };

  const getStatusStyle = (status: IssueStatusType) => {
    switch (status) {
      case "Resolved":
        return "bg-forest/10 text-forest border border-forest/20 font-bold";
      case "In Progress":
        return "bg-terracotta/10 text-terracotta border border-terracotta/20 font-bold";
      default:
        return "bg-sand/50 text-[#736652] border border-sand font-bold";
    }
  };

  const handleLocalConfirm = (id: string) => {
    if (clickedConfirms[id]) return;
    setClickedConfirms((prev) => ({ ...prev, [id]: true }));
    onConfirmIssue(id);
  };

  const handleLocalDuplicate = (id: string) => {
    if (clickedDuplicates[id]) return;
    setClickedDuplicates((prev) => ({ ...prev, [id]: true }));
    onMarkDuplicate(id);
  };

  // Stats calculations
  const totalReportsCount = issues.length;
  const activeUnresolvedCount = issues.filter(i => i.status !== "Resolved").length;
  const resolvedCount = issues.filter(i => i.status === "Resolved").length;
  const criticalCount = issues.filter(i => i.priority_score >= 75 && i.status !== "Resolved").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-warm-beige/30 min-h-screen">
      
      {/* Title & Headline Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-forest sm:text-3xl tracking-tight">
            Civic Ledger
          </h2>
          <p className="text-xs sm:text-sm text-[#706450] mt-1 font-medium">
            Real-time public incident catalog. Coordinate, approve, and verify local civic improvements.
          </p>
        </div>
        
        {/* Dynamic Live Indicator */}
        <div className="flex items-center space-x-2 rounded-full bg-cream border border-sand px-3 py-1.5 self-start font-mono text-[11px] font-bold text-olive">
          <Sparkles className="h-3.5 w-3.5 text-terracotta animate-pulse" />
          <span>Verified Reports: <span className="font-extrabold text-[#113224]">{totalReportsCount}</span></span>
        </div>
      </div>

      {/* NEW STATS CARDS ROW */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4 mb-10">
        
        {/* Card 1 */}
        <div className="card-glass p-5 bg-cream relative overflow-hidden group hover:border-[#143224]">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#143224]" />
          <div className="flex items-center justify-between mb-3 text-olive">
            <span className="text-[9px] uppercase font-mono font-bold tracking-widest">Total Reports</span>
            <ListFilter className="h-4 w-4 text-olive" />
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-forest leading-none">{totalReportsCount}</p>
          <div className="flex items-center justify-between mt-2.5 text-[9px] text-[#8C7C60] font-bold">
            <span>Verified Filings</span>
            <span className="text-forest">Live</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="card-glass p-5 bg-cream relative overflow-hidden group hover:border-terracotta">
          <div className="absolute top-0 left-0 w-full h-1 bg-terracotta" />
          <div className="flex items-center justify-between mb-3 text-olive">
            <span className="text-[9px] uppercase font-mono font-bold tracking-widest">Critical Safety</span>
            <AlertTriangle className="h-4 w-4 text-terracotta" />
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-terracotta leading-none">{criticalCount}</p>
          <div className="flex items-center justify-between mt-2.5 text-[9px] text-[#8C7C60] font-bold">
            <span>Priority Score &gt; 75</span>
            <span className="text-terracotta font-extrabold">Immediate Triage</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="card-glass p-5 bg-cream relative overflow-hidden group hover:border-olive">
          <div className="absolute top-0 left-0 w-full h-1 bg-olive" />
          <div className="flex items-center justify-between mb-3 text-olive">
            <span className="text-[9px] uppercase font-mono font-bold tracking-widest">Active Tickets</span>
            <Cpu className="h-4 w-4 text-olive" />
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-forest leading-none">{activeUnresolvedCount}</p>
          <div className="flex items-center justify-between mt-2.5 text-[9px] text-[#8C7C60] font-bold">
            <span>Being Remediation</span>
            <span className="text-olive">In Progress</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="card-glass p-5 bg-cream relative overflow-hidden group hover:border-forest">
          <div className="absolute top-0 left-0 w-full h-1 bg-forest" />
          <div className="flex items-center justify-between mb-3 text-olive">
            <span className="text-[9px] uppercase font-mono font-bold tracking-widest">Remediated</span>
            <CheckCircle2 className="h-4 w-4 text-forest animate-pulse" />
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-forest leading-none">{resolvedCount}</p>
          <div className="flex items-center justify-between mt-2.5 text-[9px] text-[#8C7C60] font-bold">
            <span>Audited Fixes Passed</span>
            <span className="text-forest font-extrabold">100% Solid</span>
          </div>
        </div>
      </div>

      {/* FILTER CONTROL SECTION */}
      <div className="card-glass p-5 bg-cream border border-sand shadow-xs mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="absolute top-3.5 left-4 h-4 w-4 text-olive/60" />
            <input
              type="text"
              placeholder="Search by keywords, streets, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl bg-warm-beige/30 pl-11 pr-4 py-3 text-xs border border-sand hover:border-olive/45 focus:border-forest/80 focus:bg-cream focus:outline-none focus:ring-1 focus:ring-forest/30 transition text-forest font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status filter buttons */}
            <div className="flex items-center space-x-1.5 bg-warm-beige/40 rounded-xl px-2.5 py-1.5 border border-sand">
              <Filter className="h-3 w-3 text-olive/70" />
              <button
                onClick={() => setStatusFilter("All")}
                className={`rounded-lg px-2.5 py-1 text-[10.5px] font-bold transition-all cursor-pointer ${
                  statusFilter === "All" ? "bg-forest text-cream shadow-xs" : "text-olive hover:text-forest"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("Reported")}
                className={`rounded-lg px-2.5 py-1 text-[10.5px] font-bold transition-all cursor-pointer ${
                  statusFilter === "Reported" ? "bg-forest text-cream shadow-xs" : "text-olive hover:text-forest"
                }`}
              >
                Reported
              </button>
              <button
                onClick={() => setStatusFilter("In Progress")}
                className={`rounded-lg px-2.5 py-1 text-[10.5px] font-bold transition-all cursor-pointer ${
                  statusFilter === "In Progress" ? "bg-forest text-cream shadow-xs" : "text-olive hover:text-forest"
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setStatusFilter("Resolved")}
                className={`rounded-lg px-2.5 py-1 text-[10.5px] font-bold transition-all cursor-pointer ${
                  statusFilter === "Resolved" ? "bg-forest text-cream shadow-xs" : "text-olive hover:text-forest"
                }`}
              >
                Resolved
              </button>
            </div>

            {/* Category dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl bg-warm-beige/40 border border-sand px-3 py-2.5 text-[11px] font-bold text-forest outline-none hover:bg-cream transition cursor-pointer"
            >
              <option disabled>Filter by Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ISSUES GRID */}
      {filteredIssues.length === 0 ? (
        <div className="rounded-3xl bg-cream p-20 text-center border border-sand shadow-xs flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-warm-beige flex items-center justify-center text-olive/40 mb-5 border border-sand">
            <Search className="h-7 w-7" />
          </div>
          <h3 className="font-extrabold text-forest text-xl tracking-tight">No Matching Citizen Records</h3>
          <p className="text-xs text-[#706450] mt-2 max-w-sm leading-relaxed font-medium">
            We couldn't locate any active reports meeting your filters. Try adjusting your search query, selecting different departments, or resetting filter tags.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("All");
              setCategoryFilter("All");
            }}
            className="mt-6 rounded-full bg-forest px-6 py-3 text-xs font-bold text-cream hover:bg-forest/90 transition shadow-xs cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
          {filteredIssues.map((issue) => {
            const hasConfirmed = clickedConfirms[issue.id];
            const hasDuplicated = clickedDuplicates[issue.id];
            const isResolved = issue.status === "Resolved";
            
            // Priority bar color helper
            const getPriorityBarColor = (score: number) => {
              if (score >= 80) return "bg-terracotta";
              if (score >= 50) return "bg-[#D4A343]";
              return "bg-olive";
            };

            const getPriorityBgColor = (score: number) => {
              if (score >= 80) return "bg-terracotta/5";
              if (score >= 50) return "bg-[#D4A343]/5";
              return "bg-olive/5";
            };

            const getPriorityTextColor = (score: number) => {
              if (score >= 80) return "text-terracotta";
              if (score >= 50) return "text-[#9E731B]";
              return "text-olive";
            };

            return (
              <div 
                key={issue.id} 
                className={`flex flex-col card-glass overflow-hidden transition-all duration-300 relative group bg-cream hover:border-olive/50 ${
                  isResolved ? "hover:border-forest/60 border-forest/20" : ""
                }`}
              >
                {/* Image & top badges block */}
                <div className="relative h-56 w-full bg-[#EDE6D8]/60 shrink-0 overflow-hidden">
                  <img
                    src={issue.image_url}
                    alt={issue.short_title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-102"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Status Overlay Badge */}
                  <div className="absolute top-4 left-4 z-10 select-none">
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={issue.status}
                        initial={{ opacity: 0, scale: 0.7, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.7, y: 6 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 320, 
                          damping: 22
                        }}
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold shadow-md backdrop-blur-md ${getStatusStyle(issue.status)}`}
                      >
                        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                        {issue.status}
                      </motion.span>
                    </AnimatePresence>
                  </div>

                  {/* Micro gradient background cover */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex items-end justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setSelectedMapIssue(issue);
                        setZoomLevel(14);
                        setCopiedCoords(false);
                      }}
                      className="rounded-full bg-[#FFFCF7]/95 border border-sand hover:bg-warm-beige p-2 text-terracotta hover:text-forest transition-all duration-200 shadow-md active:scale-95 cursor-pointer z-10 flex items-center justify-center group/mapbtn"
                      title={`Interactive Coordinates Map: ${issue.location}`}
                    >
                      <MapPin className="h-3.5 w-3.5 text-terracotta group-hover/mapbtn:scale-110 shrink-0" />
                    </button>
                    <span className="font-mono text-[9px] text-slate-200 bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded font-bold border border-white/10">
                      {new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Core description details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    
                    {/* Tags line */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-forest px-2.5 py-1 text-[9.5px] font-extrabold text-cream tracking-wide">
                        {issue.issue_type}
                      </span>
                      <span className={`rounded-md px-2.5 py-1 text-[9.5px] font-extrabold ${getSeverityStyle(issue.severity)}`}>
                        {issue.severity} Severity
                      </span>
                    </div>

                    {/* Headline Title */}
                    <h3 className="font-black text-forest text-lg leading-snug tracking-tight">
                      {issue.short_title}
                    </h3>

                    {/* Paragraph */}
                    <p className="text-xs text-[#6E6352] leading-relaxed line-clamp-3 font-medium">
                      {issue.description}
                    </p>

                    {/* Meta Section with suggested department */}
                    <div className="flex items-center space-x-2 text-xs text-[#6E6352] bg-warm-beige/40 px-3.5 py-2.5 rounded-xl border border-sand">
                      <Building2 className="h-4 w-4 text-olive shrink-0" />
                      <span className="truncate font-semibold text-[#6E6352]">Department Routing: <span className="font-black text-forest">{issue.suggested_department}</span></span>
                    </div>

                    {/* Priority Score Progress bar */}
                    <div className={`p-3.5 rounded-2xl border border-sand/40 ${getPriorityBgColor(issue.priority_score)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9.5px] uppercase font-mono font-bold text-olive">Hazard score rating</span>
                        <span className={`font-mono text-xs font-black ${getPriorityTextColor(issue.priority_score)}`}>
                          {issue.priority_score} / 100
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-sand/30 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${getPriorityBarColor(issue.priority_score)}`} 
                          style={{ width: `${issue.priority_score}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-[#7E7465] font-medium mt-1.5 leading-normal">
                        <span className="font-bold text-forest">Engine Risk Triage:</span> {issue.risk_level || "Standard civil risk factor index."}
                      </p>
                    </div>
                  </div>

                  {/* Resolution Comparison Info Block if Resolved */}
                  {isResolved && (
                    <div className="mt-4 rounded-2xl bg-forest/5 p-4 border border-sand space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono font-black text-forest tracking-wider flex items-center space-x-1.5">
                          <CheckCircle2 className="h-4 w-4 text-forest shrink-0" />
                          <span>AI RESOLUTION PASSED</span>
                        </span>
                        <span className="font-mono text-xs font-black text-forest bg-forest/15 px-2 py-0.5 rounded-md">
                          {issue.resolution_confidence || 90}% Confidence
                        </span>
                      </div>
                      <p className="text-xs text-[#6E6351] leading-relaxed italic">
                        "{issue.resolution_explanation || 'Remediation visually approved.'}"
                      </p>
                      
                      {/* Before / after visual micro thumbnails */}
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-sand">
                        <div>
                          <span className="text-[9px] font-mono text-[#8C7A5E] block uppercase font-bold mb-1">INCIDENT CASE</span>
                          <div className="h-14 w-full overflow-hidden rounded-lg bg-sand/20 border border-sand">
                            <img src={issue.image_url} alt="Before" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-forest block uppercase font-bold mb-1">CLEARED RESOLUTION</span>
                          <div className="h-14 w-full overflow-hidden rounded-lg bg-forest/5 border border-forest/15">
                            <img src={issue.after_image_url} alt="After" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BOTTOM ACTION BUTTONS BAR */}
                  <div className="mt-6 pt-4 border-t border-sand flex items-center justify-between gap-1.5">
                    
                    {/* Vote tools */}
                    <div className="flex items-center space-x-2">
                      {/* Confirm vote */}
                      <button
                        onClick={() => handleLocalConfirm(issue.id)}
                        disabled={hasConfirmed || isResolved}
                        className={`flex items-center space-x-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          hasConfirmed
                            ? "bg-forest text-cream font-black shadow-xs border border-forest"
                            : isResolved 
                              ? "opacity-40 cursor-not-allowed bg-sand/30 text-olive"
                              : "bg-cream text-olive hover:text-forest hover:bg-warm-beige border border-sand active:scale-95"
                        }`}
                        title="Consensus: confirm you saw this defect"
                      >
                        <ThumbsUp className={`h-3 w-3 ${hasConfirmed ? "fill-cream text-cream font-extrabold animate-bounce" : "text-olive/80"}`} />
                        <span>Confirm ({issue.confirmations})</span>
                      </button>

                      {/* Duplicate tagger */}
                      <button
                        onClick={() => handleLocalDuplicate(issue.id)}
                        disabled={hasDuplicated || isResolved}
                        className={`flex items-center space-x-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          hasDuplicated
                            ? "bg-terracotta/20 text-terracotta border border-terracotta/30"
                            : isResolved
                              ? "opacity-40 cursor-not-allowed bg-sand/30 text-olive"
                              : "bg-cream text-olive hover:text-[#9F482B] hover:bg-warm-beige border border-sand active:scale-95"
                        }`}
                        title="Consensus: mark duplicate entry"
                      >
                        <Copy className="h-3 w-3 text-olive/80" />
                        <span>Dupe ({issue.duplicate_flags})</span>
                      </button>
                    </div>

                    {/* Task Resolution launcher */}
                    {!isResolved && (
                      <div className="flex items-center space-x-1.5">
                        {/* Quick Manual Resolve */}
                        <button
                          onClick={() => onMarkResolved(issue.id)}
                          className="rounded-full border border-sand px-2.5 py-1.5 text-xs font-semibold text-olive hover:text-forest hover:bg-cream transition cursor-pointer"
                          title="Instant citizen resolve"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>

                        {/* Side-by-side verification redirect */}
                        <button
                          onClick={() => onTriggerVerification(issue)}
                          className="rounded-full bg-forest font-bold text-[11px] text-cream px-4 py-2 flex items-center space-x-1 hover:bg-forest/90 transition shadow-xs active:translate-y-px cursor-pointer"
                        >
                          <span>Verify Fix</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Google Drive Status & Backup Button */}
                  <div className="mt-4 pt-3.5 border-t border-dashed border-sand/80 flex flex-col space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-olive/70 font-semibold">
                      <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider">
                        <Cloud className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Google Drive Archive</span>
                      </span>
                      {uploadSuccessDrive[issue.id] && (
                        <span className="text-emerald-700 font-extrabold font-mono text-[9px] uppercase animate-fade-in">
                          {uploadSuccessDrive[issue.id]}
                        </span>
                      )}
                      {uploadErrorDrive[issue.id] && (
                        <span className="text-terracotta font-extrabold font-mono text-[9px] uppercase animate-fade-in">
                          {uploadErrorDrive[issue.id]}
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleSaveReportToDrive(issue)}
                      disabled={isUploadingDrive[issue.id]}
                      className="w-full bg-cream hover:bg-warm-beige border border-sand rounded-xl py-2 px-3 text-[10.5px] font-bold text-forest cursor-pointer transition flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      {isUploadingDrive[issue.id] ? (
                        <>
                          <Loader className="h-3 w-3 animate-spin text-forest" />
                          <span>Syncing Dossier...</span>
                        </>
                      ) : (
                        <>
                          <Cloud className="h-3 w-3 text-emerald-600 shrink-0" />
                          <span>{accessToken ? "Archive Dossier to Drive" : "Connect Drive & Backup"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* HIGH-FIDELITY MAP PLACEHOLDER MODAL */}
      {selectedMapIssue && (() => {
        const coords = getCoordinatesForIssue(selectedMapIssue);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setSelectedMapIssue(null)}>
            <div 
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-[#FFFCF7] border border-sand shadow-2xl animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-sand bg-cream flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-forest/5 rounded-full text-forest">
                    <Compass className="h-5 w-5 text-forest animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-forest text-base leading-snug">Geographic Coordinate System</h3>
                    <p className="text-[10px] uppercase font-mono tracking-wider font-semibold text-olive/80">Satellite & Vector Position Locator</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMapIssue(null)}
                  className="rounded-full bg-cream border border-sand p-2 hover:bg-warm-beige text-olive hover:text-forest transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                
                {/* Visual Map Canvas Container */}
                <div className="relative h-[280px] w-full rounded-2xl bg-[#E4ECD5] border border-sand overflow-hidden shadow-inner group/map">
                  
                  {/* Dynamic SVG Road/Water/Park Map Grid */}
                  <div className="absolute inset-0 transition-all duration-300">
                    <svg 
                      className="absolute inset-0 h-full w-full pointer-events-none" 
                      viewBox="0 0 400 300" 
                      style={{ 
                        transform: `scale(${zoomLevel / 14})`, 
                        transformOrigin: 'center', 
                        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' 
                      }}
                    >
                      {/* Landscape river */}
                      <path d="M-100,50 C 100,80 150,220 500,280" fill="none" stroke="#B9DDF2" strokeWidth="32" strokeLinecap="round" />
                      
                      {/* Local city canals */}
                      <path d="M220,-50 C 260,110 80,180 120,350" fill="none" stroke="#B9DDF2" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
                      
                      {/* Forest and Greenery reservations */}
                      <rect x="250" y="30" width="160" height="110" rx="20" fill="#CDDCB9" />
                      <circle cx="80" cy="210" r="70" fill="#CDDCB9" opacity="0.8" />
                      <rect x="-40" y="40" width="100" height="60" rx="12" fill="#CDDCB9" opacity="0.5" />

                      {/* Map grid alignment coordinates indicators */}
                      <g stroke="#DCE8CD" strokeWidth="1" strokeDasharray="6,6">
                        <line x1="-100" y1="50" x2="500" y2="50" />
                        <line x1="-100" y1="150" x2="500" y2="150" />
                        <line x1="-100" y1="250" x2="500" y2="250" />
                        <line x1="100" y1="-100" x2="100" y2="400" />
                        <line x1="200" y1="-100" x2="200" y2="400" />
                        <line x1="300" y1="-100" x2="300" y2="400" />
                      </g>

                      {/* National Expressways / Highways */}
                      <path d="M-50,150 L450,150" stroke="#FEEFC3" strokeWidth="14" strokeLinecap="round" />
                      <path d="M-50,150 L450,150" stroke="#E2733F" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                      
                      <path d="M200,-50 L200,350" stroke="#FEEFC3" strokeWidth="14" strokeLinecap="round" />
                      <path d="M200,-50 L200,350" stroke="#E2733F" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

                      {/* Standard Public roads mesh */}
                      <g stroke="#FFFFFF" strokeLinecap="round" opacity="0.95">
                        <line x1="-50" y1="80" x2="450" y2="80" strokeWidth="6" />
                        <line x1="-50" y1="220" x2="450" y2="220" strokeWidth="6" />
                        
                        <line x1="90" y1="-50" x2="90" y2="350" strokeWidth="6" />
                        <line x1="310" y1="-50" x2="310" y2="350" strokeWidth="6" />
                        
                        {/* Diagonals, blocks, circles */}
                        <line x1="-50" y1="-50" x2="350" y2="350" strokeWidth="5" />
                        <line x1="450" y1="-50" x2="50" y2="350" strokeWidth="5" />
                      </g>
                    </svg>
                  </div>

                  {/* Pulsing Target Overlay Badge right in the center */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[100%] z-20 flex flex-col items-center">
                    <div className="relative">
                      {/* Concentric ripples */}
                      <span className="absolute -inset-2.5 rounded-full bg-terracotta/30 animate-ping inline-flex" />
                      <span className="absolute -inset-5 rounded-full bg-terracotta/15 animate-pulse inline-flex" />
                      <MapPin className="h-10 w-10 text-terracotta drop-shadow-md relative shrink-0" />
                    </div>
                  </div>

                  {/* Dynamic Map HUD metadata card overlay */}
                  <div className="absolute bottom-4 left-4 font-mono text-[9px] font-bold text-cream bg-[#143224]/85 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 flex flex-col space-y-0.5">
                    <div className="flex items-center space-x-1">
                      <Globe className="h-3 w-3 text-terracotta shrink-0" />
                      <span className="uppercase text-slate-350">WGS-84 Datum System</span>
                    </div>
                    <span>Lat: {coords.latitude}° N</span>
                    <span>Lng: {coords.longitude}° E</span>
                  </div>

                  {/* Interactive zoom toolbox widget overlays */}
                  <div className="absolute bottom-4 right-4 flex flex-col space-y-1.5 bg-cream/90 backdrop-blur-xs p-1.5 rounded-xl border border-sand">
                    <button 
                      onClick={() => setZoomLevel(prev => Math.min(prev + 1, 22))}
                      disabled={zoomLevel >= 22}
                      className="p-1.5 bg-cream hover:bg-warm-beige rounded border border-sand text-forest hover:text-black transition cursor-pointer disabled:opacity-40 flex items-center justify-center"
                      title="Zoom In"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => setZoomLevel(prev => Math.max(prev - 1, 8))}
                      disabled={zoomLevel <= 8}
                      className="p-1.5 bg-cream hover:bg-warm-beige rounded border border-sand text-forest hover:text-black transition cursor-pointer disabled:opacity-40 flex items-center justify-center"
                      title="Zoom Out"
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Scale indicator legend overlay */}
                  <div className="absolute top-4 right-4 font-mono text-[8px] text-[#7E7465] font-black bg-[#FFFCF7]/90 backdrop-blur-xs border border-sand px-2 py-0.5 rounded">
                    Scale: {Math.round(5000 / (zoomLevel - 5))} meters
                  </div>
                </div>

                {/* Spatial analysis stats block */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-sand bg-cream p-4 space-y-1">
                    <span className="text-[10px] font-mono tracking-wide uppercase text-olive/80 font-semibold block">Incident Address Profile</span>
                    <p className="text-xs font-black text-forest leading-snug">{selectedMapIssue.location}</p>
                  </div>
                  
                  <div className="rounded-2xl border border-sand bg-cream p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-wide uppercase text-olive/80 font-semibold block">DMS GPS Coordinates</span>
                      <div className="font-mono text-xs font-extrabold text-[#706450] mt-1">
                        <span>{coords.latitude}° N, {coords.longitude}° E</span>
                      </div>
                    </div>
                    
                    {/* Copy coordinates and link */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-sand/40">
                      <button
                        onClick={() => handleCopyCoordinates(coords.latitude, coords.longitude)}
                        className="font-bold font-mono text-[9.5px] uppercase tracking-wider text-forest hover:text-black flex items-center space-x-1 transition cursor-pointer bg-transparent border-0"
                      >
                        <Copy className="h-3 w-3" />
                        <span>{copiedCoords ? "Copied DMS!" : "Copy DMS"}</span>
                      </button>
                      <span className="text-sand">|</span>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold font-mono text-[9.5px] uppercase tracking-wider text-terracotta hover:text-[#9F482B] flex items-center space-x-1 transition"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>External Link</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="px-6 py-4 border-t border-sand bg-cream/70 flex items-center justify-end space-x-2.5">
                <button
                  onClick={() => setSelectedMapIssue(null)}
                  className="rounded-full bg-forest font-bold text-cream px-6 py-2 hover:bg-forest/90 transition shadow-xs cursor-pointer text-xs uppercase tracking-wider"
                >
                  Return to Ledger
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
