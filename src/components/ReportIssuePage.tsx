import { useState, useRef, ChangeEvent, DragEvent, useEffect } from "react";
import { Upload, MapPin, Eye, Wand2, ShieldAlert, CheckCircle, ArrowLeft, Send, Sparkles, Building2, Cloud } from "lucide-react";
import { Issue, SeverityType } from "../types";
import DrivePickerModal from "./DrivePickerModal";

// Quick demo templates forSatisfying physical evaluation clicks
const DEMO_TEMPLATES = [
  {
    title: "Sewer Overflow",
    note: "Dark, foul-smelling swamp water is bubbling up through the road drain cover. It is creeping onto the sidewalk and smells awful.",
    location: "522 West Maple Avenue, near the Bakery",
    img: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Dangerous Pothole",
    note: "Huge deep hole right in the center of the road bike lane! It looks to be about 6 inches deep, easily enough to throw a biker off.",
    location: "Crosswalk of 4th St & Boulevard Ave",
    img: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Construction Debris Dumping",
    note: "A pile of discarded drywalls, rusted iron nails, and plastic roofing tiles left behind overnight in the local sidewalk planter box.",
    location: "812 Pine Dr, outside the Community Park",
    img: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600"
  }
];

interface ReportIssuePageProps {
  onAddIssue: (issueData: Omit<Issue, "id" | "confirmations" | "duplicate_flags" | "createdAt" | "status">) => void;
  onSetTab: (tab: string) => void;
  user: any;
  accessToken: string | null;
  onLogin: () => void;
}

export default function ReportIssuePage({ onAddIssue, onSetTab, user, accessToken, onLogin }: ReportIssuePageProps) {
  const [imageBase64, setImageBase64] = useState<string>("");
  const [location, setLocation] = useState("");
  const [userNote, setUserNote] = useState("");
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
  
  // UI States
  const [isDragActive, setIsDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [warningMsg, setWarningMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic progress loader ticks
  const agentSteps = [
    "Intake Agent: Loading spatial assets and files...",
    "Classification Agent: Grouping geographic geometries...",
    "Severity Agent: Formulating priority matrix indexes...",
    "Routing Agent: Computing destination municipal department...",
    "Duplicate Agent: Running duplicate NLP comparison hashes..."
  ];

  // Rotate simulator steps during loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setActiveStep((prev) => {
          if (prev < agentSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 1600);
    } else {
      setActiveStep(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // File processors
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readImageFile(file);
  };

  const readImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      readImageFile(e.dataTransfer.files[0]);
    }
  };

  const loadDemoTemplate = (tpl: typeof DEMO_TEMPLATES[0]) => {
    setLocation(tpl.location);
    setUserNote(tpl.note);
    setImageBase64(tpl.img);
    setErrorMsg("");
    setWarningMsg("");
  };

  // Submit report to server for analysis
  const handleAnalyze = async () => {
    if (!imageBase64) {
      setErrorMsg("Please upload or choose an image representing the issue.");
      return;
    }
    if (!location.trim()) {
      setErrorMsg("Please provide an approximate location.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg("");
    setWarningMsg("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          image_base64: imageBase64,
          location: location,
          user_note: userNote
        })
      });

      if (!response.ok) {
        let serverError = "Analysis failed. The server returned an error.";
        try {
          const errPayload = await response.json();
          if (errPayload && errPayload.error) {
            serverError = errPayload.error;
          }
        } catch (_) {}
        throw new Error(serverError);
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (e: any) {
      setErrorMsg(e.message || "An unexpected network error occurred while analyzing the report.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmSubmit = () => {
    if (!analysisResult) return;

    onAddIssue({
      short_title: analysisResult.short_title,
      description: analysisResult.description,
      issue_type: analysisResult.issue_type,
      severity: analysisResult.severity as SeverityType,
      risk_level: analysisResult.risk_level,
      suggested_department: analysisResult.suggested_department,
      priority_score: analysisResult.priority_score,
      recommended_action: analysisResult.recommended_action,
      image_url: imageBase64,
      location: location,
      duplicate_keywords: analysisResult.duplicate_keywords || [],
      user_note: userNote
    });

    onSetTab("dashboard");
  };

  const getSeverityBadgeClass = (sev: string = "") => {
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 bg-warm-beige/30 min-h-screen">
      
      {/* Title block */}
      <div className="mb-8 pb-4 border-b border-sand">
        <h2 className="text-2xl font-black text-forest sm:text-3xl tracking-tight">
          Report an Issue
        </h2>
        <p className="text-xs sm:text-sm text-[#706450] mt-1 font-medium">
          Upload a physical photo of local damage, input proximity coordinates, and receive AI-backed classification.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-2xl bg-terracotta/10 border border-terracotta/30 p-4 shrink-0 flex items-start space-x-3 text-terracotta text-xs md:text-sm">
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
          <span className="font-bold">{errorMsg}</span>
        </div>
      )}

      {/* PIPELINE SIMULATION LOADING LAYER */}
      {isAnalyzing && (
        <div className="card-glass p-8 bg-cream border border-sand text-center space-y-6 animate-fade-in my-8">
          <div className="flex justify-center">
            {/* Elegant warm rotating visual */}
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="absolute h-full w-full rounded-full border-4 border-sand/30 border-t-terracotta animate-spin" />
              <Sparkles className="h-6 w-6 text-terracotta animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-black text-forest text-lg">Gemini Triage Active</h3>
            <p className="text-xs text-[#706450] max-w-md mx-auto leading-relaxed">
              Analyzing image pixel metadata, structural hazard patterns, safety routing variables, and local duplicate records...
            </p>
          </div>

          {/* Stepper details */}
          <div className="max-w-md mx-auto text-left space-y-3 pt-4 border-t border-sand/50">
            {agentSteps.map((step, idx) => {
              const isPassed = idx < activeStep;
              const isCurrent = idx === activeStep;
              return (
                <div key={idx} className="flex items-center space-x-3 text-xs">
                  <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center font-mono text-[9px] font-bold ${
                    isPassed 
                      ? "bg-forest border-forest text-cream font-black" 
                      : isCurrent 
                        ? "bg-terracotta/10 border-terracotta text-terracotta animate-pulse" 
                        : "bg-cream border-sand text-olive/40"
                  }`}>
                    {isPassed ? "✓" : idx + 1}
                  </div>
                  <span className={`font-semibold ${isPassed ? "text-forest line-through opacity-60" : isCurrent ? "text-terracotta font-black" : "text-olive/50"}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RETRIEVED ANALYSIS RESULT CARD */}
      {analysisResult && !isAnalyzing && (
        <div className="card-glass p-8 bg-cream border-2 border-forest/20 rounded-3xl space-y-8 animate-fade-in my-8 shadow-xl relative overflow-hidden">
          
          {/* Subtle elegant corner accent */}
          <div className="absolute top-0 right-0 bg-forest text-cream px-4 py-1 rounded-bl-2xl font-mono text-[9px] font-black tracking-widest uppercase flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-terracotta" />
            <span>Generated by Gemini</span>
          </div>

          {/* Header */}
          <div className="pb-4 border-b border-sand/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 bg-forest/5 rounded-full text-forest">
                <CheckCircle className="h-5.5 w-5.5 text-forest" />
              </span>
              <div>
                <h3 className="text-forest font-black text-lg">Intelligent AI Triage Verdict</h3>
                <span className="block text-[10px] font-mono tracking-wider uppercase text-olive font-bold">Real-time Multi-agent Assessment</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mr-24">
              <span className={`rounded-full px-3 py-1 font-mono text-[10px] font-black uppercase border shadow-2xs ${getSeverityBadgeClass(analysisResult.severity)}`}>
                {analysisResult.severity} severity
              </span>
              <span className="rounded-full bg-forest/5 border border-forest/10 px-3 py-1 font-mono text-[10px] font-black uppercase text-forest">
                {analysisResult.issue_type}
              </span>
            </div>
          </div>

          {/* Content Details */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Left preview thumbnail */}
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase text-[#8C7A5E] tracking-widest block">Original Field Photo Attachment</span>
              <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-sand bg-warm-beige bg-stone-100 shadow-inner">
                <img 
                  src={imageBase64} 
                  alt="Incident source" 
                  className="h-full w-full object-cover" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-4 left-4 right-4 font-mono text-[9.5px] font-bold text-cream bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center space-x-1.5">
                  <MapPin className="h-3.5 w-3.5 text-terracotta shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              </div>
            </div>

            {/* Right analysis list */}
            <div className="space-y-4">
              
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-[#8C7A5E] tracking-widest block">AI-Generated Title</span>
                <h4 className="font-extrabold text-forest text-base leading-snug">{analysisResult.short_title}</h4>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-[#8C7A5E] tracking-widest block">Core Issue Profile</span>
                <p className="text-xs text-[#6E6352] leading-relaxed font-semibold">{analysisResult.description}</p>
              </div>

              {/* Priority Hazard Bar */}
              <div className="p-4 rounded-2xl bg-terracotta/5 border border-terracotta/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] uppercase font-mono font-bold text-terracotta">Computed Priority Score</span>
                  <span className="font-mono text-xs font-black text-terracotta">
                    {analysisResult.priority_score} / 100
                  </span>
                </div>
                <div className="h-1.5 w-full bg-sand/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-terracotta transition-all duration-300"
                    style={{ width: `${analysisResult.priority_score}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] font-black text-olive/60 uppercase font-mono">
                  <span>Standard Repair</span>
                  <span>Safety Hazard</span>
                </div>
              </div>

              {/* Risk Level section */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 space-y-1">
                <span className="text-[9px] uppercase font-mono font-bold text-amber-700 tracking-widest block">Immediate Risk Assessment</span>
                <p className="text-xs text-amber-800 font-semibold leading-relaxed">
                  {analysisResult.risk_level || "No secondary road level hazard computed yet."}
                </p>
              </div>

              {/* Mapped Authority Group and Action Routing */}
              <div className="flex items-start space-x-3 rounded-2xl bg-forest/5 p-4 border border-sand">
                <Building2 className="h-5 w-5 text-forest shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] uppercase font-mono font-bold text-[#8C7A5E] tracking-widest">Routed Department Authority</span>
                  <h4 className="text-xs font-black text-forest mt-0.5">{analysisResult.suggested_department}</h4>
                  <p className="text-[10.5px] text-[#6E6352] mt-1 leading-normal">
                    <span className="font-bold text-forest">Action directive:</span> {analysisResult.recommended_action}
                  </p>
                </div>
              </div>

              {/* Comparison Tags */}
              {analysisResult.duplicate_keywords && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-[#8C7A5E] uppercase tracking-wider mr-1">Comparison tags:</span>
                  {analysisResult.duplicate_keywords.map((word: string, i: number) => (
                    <span 
                      key={i} 
                      className="rounded bg-warm-beige border border-sand/60 px-2 py-0.5 font-mono text-[9px] font-bold text-olive uppercase"
                    >
                      #{word}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Discard & Submit actions footer */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3.5 pt-6 border-t border-sand">
            <button
              onClick={() => {
                setAnalysisResult(null);
                setWarningMsg("");
              }}
              className="w-full sm:w-auto font-bold text-olive bg-cream border border-sand rounded-full px-6 py-2.5 hover:bg-warm-beige transition cursor-pointer text-xs"
            >
              Discard and Re-upload
            </button>
            <button
              onClick={handleConfirmSubmit}
              className="w-full sm:w-auto font-bold text-cream bg-forest rounded-full px-6 py-2.5 flex items-center justify-center space-x-2 hover:bg-forest/90 transition shadow-xs active:translate-y-px cursor-pointer text-xs animate-pulse"
            >
              <Send className="h-3.5 w-3.5 text-cream" />
              <span>Publish to Community Ledger</span>
            </button>
          </div>
        </div>
      )}

      {/* INPUT FORM (ONLY SHOWN IF NOT LOADING & NOT RESULT SHOWN) */}
      {!isAnalyzing && !analysisResult && (
        <div className="space-y-6">
          
          {/* LUXURIOUS QUICK DEMO DIAGNOSTIC BLOCK */}
          <div className="bg-forest rounded-[32px] p-6 text-cream border border-sand/30 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-terracotta text-cream px-4 py-1 rounded-bl-2xl font-mono text-[10px] font-bold tracking-widest uppercase">
              Developer Sandbox
            </div>
            <div className="flex items-center space-x-2.5 mb-2.5">
              <Sparkles className="h-5 w-5 text-terracotta animate-pulse shrink-0" />
              <span className="font-extrabold text-sm tracking-tight text-cream">Hackathon Evaluator Quick Assist</span>
            </div>
            <p className="text-xs text-[#B2CBBF] leading-relaxed mb-5 font-medium max-w-2xl">
              Skip capturing physical photos by tapping a preset below. This will inject high-res mock imagery and notes representing civic defects to test the Gemini pipeline immediately.
            </p>
            <div className="grid gap-3.5 sm:grid-cols-3">
              {DEMO_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => loadDemoTemplate(tpl)}
                  className="flex flex-col text-left rounded-2xl bg-cream/10 hover:bg-cream/15 p-4 transition border border-cream/10 active:scale-[0.98] cursor-pointer group"
                >
                  <span className="text-xs font-extrabold text-cream group-hover:text-terracotta transition">{tpl.title}</span>
                  <span className="text-[10px] text-[#A2C1B4] line-clamp-1 mt-1 leading-snug font-medium">{tpl.location}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic input card */}
          <div className="grid gap-6 md:grid-cols-5 card-glass p-6 sm:p-8 bg-cream border border-sand">
            
            {/* File drag-drop upload zone */}
            <div className="md:col-span-2 space-y-3.5">
              <label className="text-xs font-black text-forest uppercase tracking-widest block">1. Photo Attachment</label>
              
              <div className="flex flex-col space-y-2">
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex h-56 flex-col items-center justify-center text-center cursor-pointer rounded-2xl border-2 border-dashed transition duration-300 overflow-hidden ${
                    isDragActive 
                      ? "border-terracotta bg-terracotta/5" 
                      : imageBase64 
                        ? "border-sand bg-warm-beige/30" 
                        : "border-sand/80 hover:border-olive/60 bg-warm-beige/20"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {imageBase64 ? (
                    <>
                      <img 
                        src={imageBase64} 
                        alt="Uploaded source" 
                        className="absolute inset-0 h-full w-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-forest/80 opacity-0 hover:opacity-100 flex flex-col items-center justify-center text-cream transition duration-300 font-bold font-mono text-xs text-center space-y-1 px-4">
                        <Eye className="h-5 w-5 text-terracotta" />
                        <span>Replace photo</span>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 flex flex-col items-center text-olive">
                      <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-full bg-cream border border-sand text-terracotta">
                        <Upload className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-extrabold text-[#113224]">Drag & drop photo here</span>
                      <span className="text-[10px] text-olive/60 mt-1 font-bold">or click to browse local files</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrivePickerOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-cream hover:bg-warm-beige border border-sand rounded-xl py-2.5 px-4 text-xs font-bold text-[#113224] cursor-pointer transition active:scale-[0.98]"
                >
                  <Cloud className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Browse from Google Drive</span>
                </button>
              </div>
            </div>

            {/* Proximity / metadata content input fields */}
            <div className="md:col-span-3 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-forest uppercase tracking-widest flex items-center space-x-1.5">
                  <MapPin className="h-4 w-4 text-terracotta shrink-0" />
                  <span>2. Proximity Coordinates / Street Location</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 104 Main Street, next to West Public Gates"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl bg-warm-beige/30 px-3.5 py-3 text-xs border border-sand hover:border-olive/50 focus:border-forest focus:bg-cream focus:outline-none focus:ring-1 focus:ring-forest/30 transition text-forest font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#113224] uppercase tracking-widest block">
                  3. Active Citizen Memo (Optional)
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide additional visual context... e.g. 'This creates a high vehicle skid hazard during rain' or 'Local rodents are beginning to gather.'"
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  className="w-full rounded-xl bg-warm-beige/30 px-3.5 py-3 text-xs border border-sand hover:border-olive/50 focus:border-forest focus:bg-cream focus:outline-none focus:ring-1 focus:ring-forest/30 transition resize-none text-forest font-medium"
                />
              </div>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleAnalyze}
              className="w-full sm:w-auto font-black text-cream bg-forest rounded-full px-8 py-3.5 flex items-center justify-center space-x-2.5 hover:bg-forest/90 transition shadow-md shadow-forest/10 cursor-pointer active:translate-y-px text-xs uppercase tracking-wider"
            >
              <Wand2 className="h-4.5 w-4.5 text-terracotta animate-pulse" />
              <span>Analyze with Gemini Triage</span>
            </button>
          </div>
        </div>
      )}

      {/* Google Drive file-picker modal */}
      <DrivePickerModal
        isOpen={isDrivePickerOpen}
        onClose={() => setIsDrivePickerOpen(false)}
        accessToken={accessToken}
        onSelectImage={(base64) => setImageBase64(base64)}
        onLogin={onLogin}
      />
    </div>
  );
}
