import { useState, useRef, useEffect, ChangeEvent, DragEvent } from "react";
import { Upload, ArrowLeft, Wand2, CheckCircle2, ShieldAlert, Sparkles, Image as ImageIcon, CheckCircle, HelpCircle } from "lucide-react";
import { Issue, ResolutionStatusType } from "../types";

interface ResolutionVerificationPageProps {
  selectedIssue: Issue | null;
  issues: Issue[];
  onSetSelectedIssue: (issue: Issue | null) => void;
  onSetTab: (tab: string) => void;
  onUpdateIssueResolution: (id: string, resolutionDetails: {
    after_image_url: string;
    resolution_confidence: number;
    resolution_status: ResolutionStatusType;
    resolution_explanation: string;
    resolution_next_action: string;
  }) => void;
}

export default function ResolutionVerificationPage({
  selectedIssue,
  issues,
  onSetSelectedIssue,
  onSetTab,
  onUpdateIssueResolution
}: ResolutionVerificationPageProps) {
  const [afterImageBase64, setAfterImageBase64] = useState<string>("");
  const [repairNote, setRepairNote] = useState("");
  
  // States
  const [isDragActive, setIsDragActive] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [warningMsg, setWarningMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill preset for After Photo demo if they are testing without real camera
  const loadDemoAfterPhoto = () => {
    // Elegant clean street / clean lawn stock images to simulate resolved repairs
    const repairedImages: Record<string, string> = {
      "civic-1": "https://images.unsplash.com/photo-1594913785162-e6785b49eed9?auto=format&fit=crop&q=80&w=600", // patched road asphalt
      "civic-2": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600", // clean street layout / drain fixed
      "civic-3": "https://images.unsplash.com/photo-1533626904905-cd52fa1a41e7?auto=format&fit=crop&q=80&w=600", // clean park
      "civic-4": "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&q=80&w=600"  // lit street / repaired lights
    };

    const id = selectedIssue ? selectedIssue.id : "default";
    const selectedImg = repairedImages[id] || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600"; // clean tiles pavement
    setAfterImageBase64(selectedImg);
    setRepairNote("The work was finished this morning. Waste removed, segment fully patched and swept clean. Looks perfect!");
  };

  // If issue pre-selected, clear previous verification displays
  useEffect(() => {
    setVerificationResult(null);
    setAfterImageBase64("");
    setRepairNote("");
    setErrorMsg("");
    setWarningMsg("");
  }, [selectedIssue]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readImageFile(file);
  };

  const readImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setAfterImageBase64(reader.result as string);
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

  // Run side-by-side comparison on server
  const handleVerify = async () => {
    if (!selectedIssue) {
      setErrorMsg("Please select a reported issue to verify first.");
      return;
    }
    if (!afterImageBase64) {
      setErrorMsg("Please upload an after-repair image showing the resolved state.");
      return;
    }

    setIsVerifying(true);
    setErrorMsg("");
    setWarningMsg("");

    try {
      const response = await fetch("/api/verify-resolution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issue_id: selectedIssue.id,
          original_image_url: selectedIssue.image_url,
          after_image: afterImageBase64,
          repair_note: repairNote
        })
      });

      if (!response.ok) {
        throw new Error("Side-by-side verification failed. Back-end returned error.");
      }

      const result = await response.json();
      if (result.warning) {
        setWarningMsg(result.warning);
      }

      setVerificationResult(result);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Error validating resolution: " + (err.message || "Unknown error"));
    } finally {
      setIsVerifying(false);
    }
  };

  // Save the resolution state on parent/server
  const handleConfirmAddVerif = () => {
    if (!selectedIssue || !verificationResult) return;

    const confidenceVal = Number(verificationResult.resolution_confidence) || 0;
    const isAutoResolved = confidenceVal >= 80;
    const finalResolutionStatus = isAutoResolved ? "Resolved" : verificationResult.resolution_status;

    onUpdateIssueResolution(selectedIssue.id, {
      after_image_url: afterImageBase64,
      resolution_confidence: confidenceVal,
      resolution_status: finalResolutionStatus as any,
      resolution_explanation: verificationResult.explanation,
      resolution_next_action: verificationResult.next_action
    });

    onSetSelectedIssue(null);
    setVerificationResult(null);
    onSetTab("dashboard");
  };

  const getStatusColor = (status: string = "") => {
    const s = status.toLowerCase();
    if (s === "resolved") return "bg-forest/10 text-forest border border-forest/20";
    if (s === "partially resolved") return "bg-terracotta/10 text-terracotta border border-terracotta/20";
    return "bg-sand/40 text-olive";
  };

  // Get list of issues that are not resolved yet for lookup dropdown
  const openIssues = issues.filter(i => i.status !== "Resolved");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 bg-warm-beige/30 min-h-screen">
      
      {/* Return button */}
      <button
        onClick={() => {
          onSetSelectedIssue(null);
          onSetTab("dashboard");
        }}
        className="flex items-center space-x-1.5 text-xs font-bold text-olive hover:text-forest transition mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Civic Ledger</span>
      </button>

      {/* Header */}
      <div className="mb-8 pb-4 border-b border-sand">
        <h2 className="text-2xl font-black text-forest sm:text-3xl tracking-tight">
          {verificationResult ? "Resolution Audit Verdict" : "Verify a Civic Fix"}
        </h2>
        <p className="text-xs sm:text-sm text-[#706450] mt-1 font-medium">
          {verificationResult
            ? "Gemini compared before and after imagery. Evaluate confidence levels and audit findings below."
            : "Upload an image of the completed repair. The Resolution agent automatically audits and verifies the patch."}
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-2xl bg-terracotta/10 border border-terracotta/30 p-4 font-bold text-xs text-terracotta">
          {errorMsg}
        </div>
      )}

      {warningMsg && (
        <div className="mb-6 rounded-2xl bg-terracotta/5 p-4 font-mono text-[10px] text-[#A66249] border border-sand">
          <span className="font-extrabold block mb-0.5 uppercase">⚠️ Simulation Fallback Alert</span>
          {warningMsg}
        </div>
      )}

      {/* LOADING SPINNER */}
      {isVerifying && (
        <div className="card-glass p-12 bg-cream border border-sand text-center flex flex-col items-center justify-center space-y-6">
          <div className="relative h-16 w-16 flex items-center justify-center">
            <div className="absolute h-full w-full rounded-full border-4 border-sand/30 border-t-terracotta animate-spin" />
            <Sparkles className="h-6 w-6 text-terracotta animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-forest text-base">Analyzing Remediation State...</h3>
            <p className="text-[11px] text-[#7E7465] mt-1 max-w-sm leading-relaxed mx-auto">
              Gemini is evaluating pixels of the original defect photo alongside your repair photo, scanning for remnant hazards or structural changes.
            </p>
          </div>
        </div>
      )}

      {/* VERIFICATION REPORT PANEL */}
      {!isVerifying && verificationResult && selectedIssue && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-cream rounded-[32px] p-8 border-2 border-forest/25 shadow-xl space-y-6 relative overflow-hidden">
            
            {/* Header with Gemini Icon */}
            <div className="flex items-center justify-between pb-4 border-b border-sand">
              <div className="flex items-center space-x-2.5">
                <span className="p-2 bg-forest/5 rounded-full text-forest">
                  <CheckCircle className="h-5.5 w-5.5 text-forest" />
                </span>
                <div>
                  <h3 className="text-forest font-black text-lg">AI Resolution Verification Report</h3>
                  <span className="block text-[10px] font-mono tracking-wider uppercase text-olive font-bold">Side-by-Side Diagnostic Audit</span>
                </div>
              </div>
              <span className="rounded-full bg-forest px-3 py-1 font-mono text-[9px] font-black tracking-widest text-cream uppercase flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-terracotta" />
                <span>Gemini Audited</span>
              </span>
            </div>

            {/* Visual comparison dual block */}
            <div>
              <span className="font-mono text-[9px] font-black text-[#8C7A5E] block uppercase tracking-widest mb-3">Before vs. After Comparison</span>
              <div className="grid gap-6 grid-cols-2">
                
                {/* Before Column */}
                <div className="space-y-2 text-center">
                  <span className="text-[10px] font-mono font-black text-terracotta uppercase tracking-wider block">1. Before (Incident photo)</span>
                  <div className="h-48 sm:h-56 rounded-2xl overflow-hidden bg-sand/20 border border-sand relative shadow-md">
                    <img 
                      src={selectedIssue.image_url} 
                      alt="Original defect" 
                      className="absolute inset-0 h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* After Column */}
                <div className="space-y-2 text-center">
                  <span className="text-[10px] font-mono font-black text-forest uppercase font-black tracking-wider block">2. After (Repaired Work)</span>
                  <div className="h-48 sm:h-56 rounded-2xl overflow-hidden bg-forest/5 border border-forest/15 relative shadow-md">
                    <img 
                      src={afterImageBase64} 
                      alt="After fix" 
                      className="absolute inset-0 h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Auto-update Alert Banner if confidence is above 80 */}
            {verificationResult.resolution_confidence >= 80 && (
              <div className="p-4 bg-forest/5 border border-forest/30 rounded-2xl flex items-start space-x-3 text-forest animate-pulse">
                <CheckCircle2 className="h-5.5 w-5.5 text-forest shrink-0" />
                <div className="text-xs">
                  <span className="font-black uppercase block tracking-wider font-mono text-[9px]">State Machine Automation Trigger</span>
                  <p className="mt-0.5 text-olive font-semibold leading-relaxed">
                    <span className="font-bold text-forest">Auto-Resolved Active:</span> Because Gemini's structural verification confidence is <span className="font-extrabold">{verificationResult.resolution_confidence}%</span> (exceeding the 80% programmatic threshold), this ticket is registered as <span className="font-extrabold text-forest uppercase">Auto-Resolved</span> and is instantly committed as a verified closeout on the Civic Ledger.
                  </p>
                </div>
              </div>
            )}

            {/* Verdict metrics */}
            <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-sand/65">
              
              {/* Verdict Level */}
              <div className="rounded-2xl bg-warm-beige/35 p-4 border border-sand/65 flex flex-col justify-center">
                <span className="font-mono text-[9px] uppercase font-bold text-[#8C7A5E] block mb-1">Visual Verdict Status</span>
                <div className="flex items-center space-x-2">
                  <span className={`rounded-md px-3 py-1 text-[10px] font-black uppercase ${getStatusColor(verificationResult.resolution_confidence >= 80 ? "Resolved" : verificationResult.resolution_status)}`}>
                    {verificationResult.resolution_confidence >= 80 ? "Resolved" : verificationResult.resolution_status}
                  </span>
                  <span className="text-[10px] text-[#8C7A5E] font-bold">Audit Terminated</span>
                </div>
              </div>

              {/* Confidence Score */}
              <div className="rounded-2xl bg-warm-beige/35 p-4 border border-sand/65">
                <span className="font-mono text-[9px] uppercase font-bold text-[#8C7A5E] block mb-1">Resolution Confidence Score</span>
                <div className="flex items-center justify-between">
                  <div className="w-full bg-sand/30 rounded-full h-2 overflow-hidden mr-3">
                    <div 
                      className="h-full bg-forest rounded-full" 
                      style={{ width: `${verificationResult.resolution_confidence}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs font-black text-forest shrink-0">
                    {verificationResult.resolution_confidence}%
                  </span>
                </div>
              </div>

            </div>

            {/* AI Explanation block */}
            <div className="space-y-2 pt-1">
              <span className="font-mono text-[9px] font-black text-[#8C7A5E] block uppercase tracking-widest">AI Audit Log Findings</span>
              <p className="text-xs text-[#6E6352] leading-relaxed bg-warm-beige/25 p-4 rounded-xl border border-sand/50 font-semibold">
                {verificationResult.explanation}
              </p>
            </div>

            {/* Next Action recommendation */}
            <div className="flex items-start space-x-3 bg-forest/5 p-4 rounded-2xl border border-sand text-forest text-xs">
              <CheckCircle2 className="h-5 w-5 text-forest shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold uppercase tracking-widest block font-mono text-[9px] text-forest">Closeout Directive</span>
                <p className="mt-0.5 leading-normal text-olive"><span className="font-bold text-forest">Recommended action:</span> {verificationResult.next_action}</p>
              </div>
            </div>

          </div>

          {/* Accept / Discard Resolution */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4 border-t border-sand">
            <button
              onClick={() => setVerificationResult(null)}
              className="w-full sm:w-auto font-bold text-olive bg-cream border border-sand rounded-full px-5 py-2.5 hover:bg-warm-beige transition text-xs cursor-pointer"
            >
              Recalibrate / Swap image
            </button>
            <button
              onClick={handleConfirmAddVerif}
              className="w-full sm:w-auto font-bold text-cream bg-forest hover:bg-forest/90 rounded-full px-6 py-2.5 transition-all shadow-xs flex items-center justify-center space-x-1.5 text-xs cursor-pointer"
            >
              <CheckCircle className="h-4.5 w-4.5 text-cream" />
              <span>Approve and Commit to Ledger</span>
            </button>
          </div>

        </div>
      )}


      {/* MANUAL CASE SELECTION & TARGET AREA */}
      {!isVerifying && !verificationResult && (
        <div className="space-y-6">
          
          {/* Preset trigger block */}
          {(!selectedIssue || openIssues.length > 0) && (
            <div className="bg-cream rounded-3xl p-5 border border-sand shadow-sm space-y-3">
              <label className="text-xs font-black text-forest uppercase tracking-widest block">1. Select Target Issue Ticket</label>
              
              {selectedIssue ? (
                /* Selected ticket recap bar */
                <div className="flex items-center justify-between p-3.5 bg-warm-beige/35 rounded-2xl border border-sand/70">
                  <div className="flex items-center space-x-3 truncate">
                    <div className="h-11 w-11 overflow-hidden bg-sand/10 rounded-lg shrink-0 border border-sand">
                      <img src={selectedIssue.image_url} alt="Defect" className="h-[100%] w-[100%] object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h4 className="font-black text-forest text-sm truncate">{selectedIssue.short_title}</h4>
                      <p className="text-[10px] text-olive font-medium truncate">{selectedIssue.location} | {selectedIssue.issue_type}</p>
                    </div>
                  </div>
                  
                  {/* swap dropdown selection trigger */}
                  {openIssues.length > 1 && (
                    <select
                      onChange={(e) => {
                        const target = openIssues.find(i => i.id === e.target.value);
                        if (target) onSetSelectedIssue(target);
                      }}
                      className="rounded-xl bg-cream border border-sand px-3 py-1.5 text-xs text-forest font-bold outline-none hover:bg-warm-beige transition cursor-pointer"
                    >
                      <option>Swap issue</option>
                      {openIssues.map(issue => (
                        <option key={issue.id} value={issue.id}>{issue.short_title.split(" ")[0]}... ({issue.issue_type})</option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                /* Choose State */
                <div>
                  {openIssues.length === 0 ? (
                    <div className="rounded-2xl p-6 bg-forest/5 text-forest text-xs text-center border border-sand">
                      <ShieldAlert className="h-6 w-6 text-forest mx-auto mb-2" />
                      We do not have any unresolved municipal issues reported! Neighborhood is completely flawless. Go report an issue first.
                    </div>
                  ) : (
                    <select
                      value={selectedIssue ? selectedIssue.id : ""}
                      onChange={(e) => {
                        const target = openIssues.find(i => i.id === e.target.value);
                        if (target) onSetSelectedIssue(target);
                      }}
                      className="w-full rounded-xl bg-warm-beige/30 border border-sand px-4 py-3.5 text-xs text-forest font-bold outline-none hover:bg-cream transition duration-200 cursor-pointer"
                    >
                      <option value="">-- Choose an active report to resolve --</option>
                      {openIssues.map(issue => (
                        <option key={issue.id} value={issue.id}>
                          {issue.issue_type}: {issue.short_title} ({issue.location})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          )}

          {/* MAIN UPLOAD PORTAL */}
          {selectedIssue ? (
            <div className="space-y-6 animate-fade-in animate-duration-100">
              
              {/* ADVANCED VERIFICATION PRESET INJECTOR BLOCK */}
              <div className="bg-forest rounded-[32px] p-6 text-cream border border-sand/30 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-terracotta text-cream px-4 py-1 rounded-bl-2xl font-mono text-[10px] font-bold tracking-widest uppercase">
                  Developer Sandbox
                </div>
                <div className="flex items-center space-x-2.5 mb-2.5">
                  <Sparkles className="h-5 w-5 text-terracotta animate-pulse shrink-0" />
                  <span className="font-extrabold text-sm tracking-tight text-cream">Resolution Demo Preset Assist</span>
                </div>
                <p className="text-xs text-[#B2CBBF] leading-relaxed mb-5 font-medium max-w-2xl">
                  Simulate photographing the finished physical repair by clicking below. This instantly grabs a perfectly cleared aftermath visual corresponding to the <b>{selectedIssue.issue_type}</b> ticket to trigger pixel-checking models.
                </p>
                <button
                  onClick={loadDemoAfterPhoto}
                  className="rounded-full bg-terracotta hover:bg-terracotta/90 font-bold text-xs text-cream px-6 py-3 transition shadow active:scale-[0.98] cursor-pointer"
                >
                  Inject Matching Resolved Photo ✨
                </button>
              </div>

              {/* Side-by-Side uploads box */}
              <div className="grid gap-6 md:grid-cols-2">
                
                {/* Before: Display read-only static */}
                <div className="card-glass p-5 bg-cream border border-sand space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[9px] font-bold text-olive block uppercase tracking-widest mb-2.5">Incident Photo (Before)</span>
                    <div className="relative h-48 w-full rounded-2xl bg-warm-beige/30 border border-sand overflow-hidden">
                      <img 
                        src={selectedIssue.image_url} 
                        alt="Before" 
                        className="absolute inset-0 h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  <div className="pt-3.5 border-t border-sand text-xs space-y-2">
                    <span className="font-bold text-forest block uppercase font-mono text-[9px]">Reported Incident Proximity</span>
                    <p className="text-[#6E6352] font-semibold mt-0.5">{selectedIssue.location}</p>
                    <p className="text-olive italic font-semibold">"{selectedIssue.description}"</p>
                  </div>
                </div>

                {/* After: Interactive drag-and-drop attachment */}
                <div className="card-glass p-5 bg-cream border border-sand space-y-4">
                  <div>
                    <span className="font-mono text-[9px] font-bold text-olive block uppercase tracking-widest mb-2.5">Repair Verification Photo (After)</span>
                    
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative flex h-48 flex-col items-center justify-center text-center cursor-pointer rounded-2xl border-2 border-dashed transition duration-300 overflow-hidden ${
                        isDragActive 
                          ? "border-terracotta bg-terracotta/5" 
                          : afterImageBase64 
                            ? "border-sand bg-warm-beige/25" 
                            : "border-sand hover:border-olive/60 bg-warm-beige/10"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {afterImageBase64 ? (
                        <>
                          <img 
                            src={afterImageBase64} 
                            alt="After Photo Preview" 
                            className="absolute inset-0 h-full w-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-forest/80 opacity-0 hover:opacity-100 flex flex-col items-center justify-center text-cream transition space-y-1 font-bold font-mono text-xs cursor-pointer">
                            <ImageIcon className="h-5 w-5 text-terracotta" />
                            <span>Replace photo</span>
                          </div>
                        </>
                      ) : (
                        <div className="p-4 flex flex-col items-center text-olive">
                          <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-full bg-cream border border-sand text-terracotta">
                            <Upload className="h-5 w-5" />
                          </div>
                          <span className="text-xs font-black text-forest">Attach aftermath fix photo</span>
                          <span className="text-[10px] text-olive/60 mt-1 font-bold">drag and drop files or browse</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* repair explanation text */}
                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-olive uppercase block text-[9.5px]">Repair audit notes (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Cleared site debris, patched defect with asphalt aggregate cement mix..."
                      value={repairNote}
                      onChange={(e) => setRepairNote(e.target.value)}
                      className="w-full rounded-xl bg-warm-beige/30 border border-sand px-3 py-2 hover:border-olive focus:border-forest focus:bg-cream focus:outline-none transition resize-none text-forest font-medium"
                    />
                  </div>
                </div>

              </div>

              {/* Verify trigger */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleVerify}
                  className="w-full sm:w-auto font-black text-cream bg-forest hover:bg-forest/90 rounded-full px-8 py-3.5 flex items-center justify-center space-x-2 transition-all shadow-xs active:translate-y-px cursor-pointer text-xs uppercase"
                >
                  <Wand2 className="h-4.5 w-4.5 text-terracotta animate-pulse" />
                  <span>Verify Fix with Gemini</span>
                </button>
              </div>

            </div>
          ) : (
            /* Choose placeholder block */
            openIssues.length > 0 && (
              <div className="card-glass p-12 text-center text-olive bg-cream border border-sand flex flex-col items-center">
                <HelpCircle className="h-9 w-9 text-olive/40 mb-3" />
                <h4 className="font-bold text-forest text-sm">No Active Verification Target</h4>
                <p className="text-[11px] text-olive/60 mt-1 max-w-sm leading-relaxed">
                  Please choose one of the available reported issues from the dropdown selector above or visit the Civic Ledger to select progress tickets directly.
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
