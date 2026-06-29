import { MapPin, ArrowRight, ShieldCheck, Sparkles, Server, CheckCircle, Activity, ArrowUpRight, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import { Issue } from "../types";

interface LandingPageProps {
  onSetTab: (tab: string) => void;
  issues: Issue[];
}

const AIPreviewCard = () => (
  <div className="card-glass p-6 text-left relative overflow-hidden border border-sand bg-cream max-w-sm sm:max-w-md mx-auto shadow-md">
    <div className="absolute top-0 right-0 bg-terracotta text-cream px-3 py-1 rounded-bl-2xl font-mono text-[9px] font-black tracking-widest uppercase">
      Gemini Engine
    </div>
    
    <div className="flex items-center space-x-3 mb-5">
      <div className="p-2.5 bg-forest/5 rounded-xl text-forest border border-sand/45">
        <MapPin className="h-5 w-5" />
      </div>
      <div>
        <div className="flex items-center space-x-1.5 mb-0.5">
          <span className="text-[10px] font-mono font-bold text-olive tracking-widest uppercase">ACTIVE RE-TRIAGE // #4081</span>
          <span className="h-2 w-2 rounded-full bg-terracotta animate-ping" />
        </div>
        <h3 className="text-forest font-black text-base">Main Street Asphalt Fault</h3>
      </div>
    </div>
    
    <div className="space-y-3">
      {/* Category Tag */}
      <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-warm-beige rounded-xl border border-sand/40">
        <span className="font-bold text-olive">Identified Category:</span>
        <span className="font-mono bg-forest text-cream font-black text-[10px] uppercase px-2 py-0.5 rounded-md">
          Pothole
        </span>
      </div>

      {/* Suggested Department Routing */}
      <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-warm-beige rounded-xl border border-sand/40">
        <span className="font-bold text-olive">Automated Routing:</span>
        <span className="font-mono text-forest font-bold text-[10.5px]">
          Roads & Highways Administration
        </span>
      </div>
      
      {/* Risk Analysis & Priority Score */}
      <div className="p-3.5 bg-terracotta/5 rounded-2xl border border-terracotta/10">
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-bold text-terracotta text-[9px] uppercase font-mono tracking-widest">Priority Score</span>
          <span className="font-mono font-extrabold text-[#9F482B] text-xs">87 / 100</span>
        </div>
        <div className="h-1.5 bg-sand/30 rounded-full overflow-hidden">
          <div className="h-full bg-terracotta rounded-full" style={{ width: "87%" }}></div>
        </div>
        <p className="text-[9.5px] text-[#8C7B65] mt-2 leading-relaxed">
          <span className="font-bold text-terracotta">Safety Risk:</span> Vehicle wheel damage risk and high-speed tire hazard.
        </p>
      </div>

      {/* Dual Image Resolution Confidence */}
      <div className="p-3.5 bg-forest/5 rounded-2xl border border-sand flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-4.5 w-4.5 text-forest shrink-0" />
          <span className="font-bold text-forest text-xs">AI Resolution Audit</span>
        </div>
        <span className="font-mono text-[10px] font-black bg-forest/10 text-forest px-2.5 py-0.5 rounded-lg border border-forest/20">
          94% Confidence
        </span>
      </div>
    </div>
  </div>
);

export default function LandingPage({ onSetTab, issues }: LandingPageProps) {
  // Count stats
  const total = issues.length;
  const activeUnresolved = issues.filter(i => i.status !== "Resolved").length;
  const resolved = issues.filter(i => i.status === "Resolved").length;
  
  // Calculate total confirmation votes
  const engagement = issues.reduce((acc, current) => acc + current.confirmations + current.duplicate_flags, 0);

  return (
    <div className="relative overflow-hidden bg-warm-beige py-12 md:py-20">
      {/* Elegant background circles */}
      <div className="absolute top-10 right-10 -z-10 h-[500px] w-[500px] rounded-full bg-sand/30 blur-3xl opacity-60" />
      <div className="absolute bottom-10 left-10 -z-10 h-96 w-96 rounded-full bg-olive/10 blur-3xl opacity-40" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Banner Announcement */}
        <div className="flex justify-center animate-fade-in">
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-cream px-3.5 py-1.5 text-[11px] font-bold text-olive border border-sand/60 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-terracotta" />
            <span>NagarSetu AI — AI-powered bridge between citizens and civic resolution</span>
          </span>
        </div>

        {/* Hero Section */}
        <div className="mt-8 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight text-forest sm:text-5xl md:text-6xl animate-fade-in">
            <span className="block font-black leading-tight tracking-tight">Smarter Streets.</span>
            <span className="block text-terracotta mt-1 tracking-tight font-black pb-1">
              Faster Resolutions.
            </span>
          </h1>
          <p className="mt-6 text-sm md:text-base text-[#6E6352] leading-relaxed max-w-2xl mx-auto font-medium">
            Report civic issues with photos, let Gemini analyze severity and routing, and track community-verified resolution through one transparent civic dashboard.
          </p>

          {/* Primary & Secondary Pill Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <button
              onClick={() => onSetTab("report")}
              className="group flex w-full sm:w-auto items-center justify-center space-x-2 rounded-full bg-forest hover:bg-forest/90 text-cream font-bold px-8 py-3.5 shadow-md shadow-forest/10 transition-all hover:-translate-y-0.5 cursor-pointer text-sm"
            >
              <span>Report an Issue</span>
              <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => onSetTab("dashboard")}
              className="flex w-full sm:w-auto items-center justify-center space-x-2 rounded-full bg-cream hover:bg-warm-beige text-forest font-bold px-8 py-3.5 border border-sand shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer text-sm"
            >
              <span>View Civic Ledger</span>
              <ArrowUpRight className="h-4.5 w-4.5 text-olive" />
            </button>
          </div>
        </div>

        {/* Product Preview Mockup Section */}
        <div className="mt-16 text-center">
          <p className="text-[10px] font-mono font-bold tracking-widest text-olive uppercase mb-6">INTELLIGENT TRIAGE INTERFACE PREVIEW</p>
          <div className="relative max-w-3xl mx-auto p-4 sm:p-8 rounded-[32px] bg-gradient-to-br from-sand/40 to-sand/20 border border-sand/70 backdrop-blur-xs">
            <AIPreviewCard />
          </div>
        </div>

        {/* Live Metrics Hub */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-sand/40">
            <div className="flex items-center space-x-2">
              <Activity className="h-4.5 w-4.5 text-[#A6977D]" />
              <span className="font-mono text-[10px] font-black tracking-widest text-olive uppercase">ACTIVE CITY STATISTICS</span>
            </div>
            <span className="flex h-2 w-2 rounded-full bg-terracotta animate-pulse" />
          </div>
          
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {/* Total Reports */}
            <div className="card-glass p-6 text-left relative overflow-hidden bg-cream border border-sand hover:border-olive/30">
              <p className="font-mono text-4xl font-black text-forest leading-none">{total}</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-olive font-extrabold mt-3">Verified Reports</p>
              <div className="h-1 w-10 bg-forest rounded-full mt-3" />
            </div>
            
            {/* Under Remediation */}
            <div className="card-glass p-6 text-left relative overflow-hidden bg-cream border border-sand hover:border-olive/30">
              <p className="font-mono text-4xl font-black text-terracotta leading-none">{activeUnresolved}</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-olive font-extrabold mt-3">Under Remediation</p>
              <div className="h-1 w-10 bg-terracotta rounded-full mt-3" />
            </div>

            {/* AI-Verified Resolutions */}
            <div className="card-glass p-6 text-left relative overflow-hidden bg-cream border border-sand hover:border-olive/30">
              <p className="font-mono text-4xl font-black text-olive leading-none">{resolved}</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-olive font-extrabold mt-3">AI-Verified Resolutions</p>
              <div className="h-1 w-10 bg-olive rounded-full mt-3" />
            </div>

            {/* Citizen attestations */}
            <div className="card-glass p-6 text-left relative overflow-hidden bg-cream border border-sand hover:border-olive/30">
              <p className="font-mono text-4xl font-black text-[#8C7A5E] leading-none">{engagement}</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-olive font-extrabold mt-3 font-semibold">Citizen Validations</p>
              <div className="h-1 w-10 bg-[#8C7A5E] rounded-full mt-3" />
            </div>
          </div>
        </div>

        {/* REDESIGNED HOW IT WORKS PIPELINE */}
        <div className="mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-black text-forest text-2xl tracking-tight sm:text-3xl">
              How NagarSetu AI Accelerates Upkeep
            </h2>
            <p className="text-[#6E6352] text-xs sm:text-sm mt-3 font-medium">
              We process reports using a real-time smart triage and auditing protocol, cutting administrative lag to zero.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Step 1 */}
            <div className="flex flex-col card-glass p-7 bg-cream border-sand hover:border-olive">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-forest/5 text-forest mb-5 border border-sand">
                <MessageSquare className="h-5 w-5" />
              </div>
              <span className="font-mono text-[9px] font-bold tracking-widest text-[#A8987E] uppercase mb-1">01 / CITIZEN INTAKE</span>
              <h3 className="font-bold text-forest text-base">Snap & Submit</h3>
              <p className="text-xs text-[#6E6352] mt-2 leading-relaxed">
                Upload a mobile picture on-site. Gemini parses the image instantly, cataloging details, hazards, severity, and responsible public work domains automatically.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col card-glass p-7 bg-cream border-sand hover:border-terracotta">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta/5 text-terracotta mb-5 border border-sand">
                <AlertCircle className="h-5 w-5" />
              </div>
              <span className="font-mono text-[9px] font-bold tracking-widest text-[#A8987E] uppercase mb-1">02 / PUBLIC DEDUPLICATION</span>
              <h3 className="font-bold text-[#9F482B] text-base">Consensus Vetting</h3>
              <p className="text-xs text-[#6E6352] mt-2 leading-relaxed">
                Neighbors view the report, confirming active state or marking exact adjacent duplicates using geographical signatures to prevent redundant work dispatches.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col card-glass p-7 bg-cream border-sand hover:border-olive">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-olive/10 text-olive mb-5 border border-sand">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="font-mono text-[9px] font-bold tracking-widest text-[#A8987E] uppercase mb-1">03 / VERIFIED REMEDIATION</span>
              <h3 className="font-bold text-olive text-base">Dual-Image Audit</h3>
              <p className="text-xs text-[#6E6352] mt-2 leading-relaxed">
                Municipal workers solve the issue and upload a resolved photo. Dual-image confidence analysis compares the repair, closing tickets in the public ledger without manually routed site audits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
