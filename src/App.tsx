import { useState, useEffect } from "react";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import ReportIssuePage from "./components/ReportIssuePage";
import CommunityDashboard from "./components/CommunityDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ResolutionVerificationPage from "./components/ResolutionVerificationPage";
import { Issue, ResolutionStatusType } from "./types";
import { initAuth, googleSignIn, logout } from "./lib/firebaseAuth";
import { User } from "firebase/auth";

// Safety storage wrapper preventing SecurityError in restrictive sandboxed context/iframes
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage read denied by sandbox/browser rules (SecurityError). Falling back to dynamic memory context.", e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage write query denied by sandbox context.", e);
    }
  }
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("landing");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Google Drive Authentication States
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
      }
    } catch (e) {
      console.error("Authentication error inside App.tsx:", e);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setAccessToken(null);
    } catch (e) {
      console.error("Sign out error inside App.tsx:", e);
    }
  };

  // Synchronise issues with Express Backend API, falling back to safeStorage
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch("/api/issues");
        if (response.ok) {
          const apiIssues = await response.json();
          setIssues(apiIssues);
          // Keep safeStorage updated as fallback
          safeStorage.setItem("nagarsetu_issues", JSON.stringify(apiIssues));
        } else {
          throw new Error("Express response not OK");
        }
      } catch (error) {
        console.warn("Express backend offline or unreachable. Reading localStorage fallback... ", error);
        const cached = safeStorage.getItem("nagarsetu_issues");
        if (cached) {
          try {
            setIssues(JSON.parse(cached));
          } catch (e) {
            console.error("Malformed storage parse error: ", e);
          }
        } else {
          // If completely blank, initialize with high-fidelity seed templates
          const defaultSeed: Issue[] = [
            {
              id: "civic-1",
              short_title: "Severe Post-Monsoon Potholes on SG Highway",
              description: "Multiple deep potholes and cracked asphalt have surfaced after heavy monsoon downpours on the SG Highway service road near Gota flyover. This creates significant bottlenecks and serious risks for two-wheelers during peak traffic hours.",
              issue_type: "Pothole",
              severity: "High",
              risk_level: "High vehicle damage and two-wheeler skidding hazard.",
              suggested_department: "Roads & Buildings Department, AMC",
              priority_score: 82,
              recommended_action: "Dispatch the heavy cold-mix repair team to apply quick-hardening bituminous material and install precautionary cones.",
              duplicate_keywords: ["pothole", "sg highway", "gota", "monsoon damage", "caved asphalt"],
              location: "SG Highway service road near Gota Flyover, Gota Ward, West Zone, Ahmedabad, Gujarat",
              user_note: "Two people on a scooty fell down here yesterday. Extremely dangerous at night because of water pooling.",
              image_url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600",
              status: "Resolved",
              confirmations: 24,
              duplicate_flags: 0,
              createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
              after_image_url: "https://images.unsplash.com/photo-1594913785162-e6785b49eed9?auto=format&fit=crop&q=80&w=600",
              resolution_confidence: 96,
              resolution_status: "Resolved",
              resolution_explanation: "The post-repair audit photo confirms the completion of the bituminous road patchwork. The deep cavity has been packaged, leveled, and rolled smooth, matching the surrounding SG highway service pavement. Lane is safe for immediate vehicular traffic.",
              resolution_next_action: "Close ticket. Monitor Gota flyover drainage system to prevent water retention and future erosion.",
              resolvedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
            },
            {
              id: "civic-2",
              short_title: "Overflowing Stormwater Nala on Link Road",
              description: "An open stormwater drainage nala near Shastri Nagar is completely choked with heavy plastic waste, causing toxic, foul black sewage water to overflow onto the busy Link Road sidewalk. Pedestrians are forced to step onto the main traffic lane.",
              issue_type: "Drainage Overflow",
              severity: "Critical",
              risk_level: "Pedestrian hazard, severe sanitary issues, and high disease transmission risk.",
              suggested_department: "Storm Water Drains Department, BMC",
              priority_score: 94,
              recommended_action: "Deploy hydro-vacuum de-silting machines immediately to clear solid blockages and spray disinfectant.",
              duplicate_keywords: ["drainage nala", "link road", "sewage overflow", "choked", "stink"],
              location: "Opposite Shastri Nagar, Link Road, K-West Ward, Andheri West, Mumbai, Maharashtra",
              user_note: "The stink is unbearable and polluted black water is entering the adjacent shops. Urgently need de-silting machines!",
              image_url: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=600",
              status: "In Progress",
              confirmations: 68,
              duplicate_flags: 1,
              createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
            },
            {
              id: "civic-3",
              short_title: "Overflowing Garbage Pile Near Society Main Gate",
              description: "A large pile of unsegregated domestic trash, dry waste, and plastic bags has been dumped right outside the entrance gate of Orchid Residency. Stray cattle are pulling waste apart, blockading the entryway, and causing pest issues.",
              issue_type: "Garbage",
              severity: "Medium",
              risk_level: "Rodent infestation hazard, public nuisance, and blockaded residential entry.",
              suggested_department: "Solid Waste Management Department, PMC",
              priority_score: 64,
              recommended_action: "Examine CCTV footage to identify illegal dumpers, deploy a compaction truck for cleanup, and install signboards.",
              duplicate_keywords: ["garbage waste", "trash block", "society gate", "cow fodder", "smell"],
              location: "Outside Orchid Residency Gate No. 2, Kothrud, Ward 12, Zone 3, Pune, Maharashtra",
              user_note: "Swachh Bharat collection vehicles are not stopping here regularly. The stench spreads directly into our living rooms.",
              image_url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600",
              status: "Resolved",
              confirmations: 18,
              duplicate_flags: 0,
              createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
              after_image_url: "https://images.unsplash.com/photo-1533626904905-cd52fa1a41e7?auto=format&fit=crop&q=80&w=600",
              resolution_confidence: 98,
              resolution_status: "Resolved",
              resolution_explanation: "PMC municipal dumper trucks have cleared 100% of the solid waste. The ground was swept clean and white bleaching powder disinfectant was scattered to neutralize odor. A permanent high-capacity garbage container was also installed.",
              resolution_next_action: "Coordinate with Kothrud resident welfare association to report persistent littering. Close case.",
              resolvedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
            },
            {
              id: "civic-4",
              short_title: "Defective LED Streetlights on VIP Road Curve",
              description: "Three consecutive high-mast LED streetlight fixtures are completely dark at the bypass curve on VIP Road. This has turned the dark curve into a major accident-prone zone during twilight and night hours.",
              issue_type: "Broken Streetlight",
              severity: "High",
              risk_level: "High risk of blind-spot night collisions and pedestrian hit-and-runs.",
              suggested_department: "Light & Electrical Department, SMC",
              priority_score: 78,
              recommended_action: "Deploy a motorized cherry-picker crane truck to replace burnt LED bulbs and test the photocell automatic controller.",
              duplicate_keywords: ["broken light", "vip road", "no streetlights", "dark curve", "electric failure"],
              location: "VIP Road Bypass Curve, Athwa Zone, Surat, Gujarat",
              user_note: "VIP road has fast-moving trucks. Without streetlights, crossing this junction in the night is near-impossible.",
              image_url: "https://images.unsplash.com/photo-1509024644558-2f56ce76c090?auto=format&fit=crop&q=80&w=600",
              status: "Reported",
              confirmations: 35,
              duplicate_flags: 0,
              createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
            },
            {
              id: "civic-5",
              short_title: "Main Drinking Water Pipeline Rupture",
              description: "A primary potable water distribution main pipe running under Sayajibaug Road has ruptured. Thousands of liters of high-pressure clean drinking water is spraying out, causing severe road flooding and drop in residential water pressure.",
              issue_type: "Water Leakage",
              severity: "Critical",
              risk_level: "Sub-surface soil erosion under asphalt, severe clean water waste, and road flooding.",
              suggested_department: "Water Supply Project Division, VMC",
              priority_score: 89,
              recommended_action: "Isolate the main trunk supply valve immediately. Excavate the roadbed and weld the damaged municipal steel pipe sleeve.",
              duplicate_keywords: ["water leakage", "burst pipe", "sayajibaug", "flooded road", "no water pressure"],
              location: "Sayajibaug Road near Kala Ghoda Circle, Sayajigunj, Ward No. 11, Vadodara, Gujarat",
              user_note: "Water is bubbling up in fountains. Entire road is under 4 inches of water. Severe municipal waste during supply hours!",
              image_url: "https://images.unsplash.com/photo-1542013936693-8848e574047e?auto=format&fit=crop&q=80&w=600",
              status: "Resolved",
              confirmations: 42,
              duplicate_flags: 0,
              createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
              after_image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600",
              resolution_confidence: 95,
              resolution_status: "Resolved",
              resolution_explanation: "VMC water plumbing engineers successfully isolated the section, excavated the road, and welded the ruptured sleeve on the 1000mm pipeline. Sand filling and concrete stabilization has been completed on the trench. Fresh drinking water pressure is fully restored.",
              resolution_next_action: "Approve engineering invoice. Coordinate with road department for asphalt re-sheeting of the dug section.",
              resolvedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
            },
            {
              id: "civic-6",
              short_title: "Broken Bellandur Footpath Interlocking Tiles",
              description: "The pedestrian sidewalk interlocking granite blocks on Outer Ring Road (ORR) near Bellandur are completely shattered, loose, and crumbling. Senior citizens and tech park employees are tripping on these uneven bricks, and waterlogging has gathered underneath the broken gaps.",
              issue_type: "Damaged Footpath",
              severity: "Medium",
              risk_level: "Pedestrian injuries, slips on wet mud, and forced walking on heavy ORR highway traffic belt.",
              suggested_department: "Infrastructure & Engineering Wing, BBMP",
              priority_score: 62,
              recommended_action: "Clear shattered brick debris, level the sub-grade sand cushion, and install new heavy-duty cement interlocking tiles.",
              duplicate_keywords: ["broken walk", "bellandur", "outer ring road", "footpath tiles", "crumbly pavers"],
              location: "Outer Ring Road sidewalk near Bellandur Eco-Space, Mahadevapura Zone, Ward 150, Bengaluru, Karnataka",
              user_note: "BBMP laid these tiles just 6 months ago. High-density commercial foot traffic and motorbike parking has ruined the base sand bed.",
              image_url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600",
              status: "In Progress",
              confirmations: 21,
              duplicate_flags: 0,
              createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
            },
            {
              id: "civic-7",
              short_title: "Malfunctioning Traffic Signal Junction at Noida Sector 62",
              description: "The core transit traffic light signals at Noida Sector 62 crossroads are completely dead, flashing blank for the last 24 hours. There is extreme gridlock with cars, buses, and auto-rickshaws blocking all directions of the busy intersection.",
              issue_type: "Traffic Lights",
              severity: "High",
              risk_level: "High vehicle collision hazard at high speeds, and severe regional traffic choke.",
              suggested_department: "S&T Department, Noida Authority / UP Traffic Police",
              priority_score: 85,
              recommended_action: "Deploy Noida traffic signal maintenance engineers to repair the main junction controller card and request manual traffic warden management.",
              duplicate_keywords: ["traffic light", "noida sector 62", "dead signal", "jammed intersection", "no lights"],
              location: "Principal Crossroad Intersection, Sector 62, Noida, Delhi NCR",
              user_note: "Traffic is absolutely clogged and people are driving on the wrong side. Need traffic police to manually manage this immediately!",
              image_url: "https://images.unsplash.com/photo-1510931264641-fc914ba1647e?auto=format&fit=crop&q=80&w=600",
              status: "Reported",
              confirmations: 55,
              duplicate_flags: 0,
              createdAt: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
            },
            {
              id: "civic-8",
              short_title: "Overflowing Public Dustbins at Hawa Mahal Road",
              description: "The smart public garbage trash bins near Hawa Mahal historical site are overflowing with plastic water bottles, disposable plates, and food scraps. The trash is spilling onto the tourist walkway, creating an unhygienic scene and attracting stray dogs.",
              issue_type: "Garbage",
              severity: "Medium",
              risk_level: "Environmental pollution at UNESCO/Heritage zone, aesthetic deterioration, and vector breeding.",
              suggested_department: "Heritage Swachh Cell, JMC Heritage",
              priority_score: 52,
              recommended_action: "Dispatch an urgent waste collection dumper, clean the pavement area, and adjust garbage collection frequency to twice daily.",
              duplicate_keywords: ["overloaded dustbin", "hawa mahal", "garbage heap", "litter", "food wastes"],
              location: "Main Heritage Boulevard outside entry point, Hawa Mahal, Jaipur, Rajasthan",
              user_note: "This is a prime heritage site and tourists are walking past overflowing waste piles. Needs trash collector pickup.",
              image_url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=600",
              status: "Reported",
              confirmations: 2,
              duplicate_flags: 0,
              createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
            },
            {
              id: "civic-9",
              short_title: "Underground Road Cave-in Near Metro Construction",
              description: "A massive, deep road cave-in measuring 8 feet wide and 5 feet deep has opened up right next to the boundary wall of the under-construction Metro flyover corridor. The surrounding earth is cracking, threatening to collapse under heavy vehicles.",
              issue_type: "Road Cave-in",
              severity: "Critical",
              risk_level: "Extreme structural risk of metro alignment column shifting, and immediate risk of vehicles falling in.",
              suggested_department: "Metro Rail Corporation & IMC Building Cell",
              priority_score: 95,
              recommended_action: "Cordon off the entire lane with solid metal barricades, divert heavy busses, and perform deep slurry grouting to seal the cavity.",
              duplicate_keywords: ["cave in", "sinkhole", "metro construction", "broken road", "deep trench"],
              location: "Super Corridor Road near metro station pillar 14, Super Corridor Zone No. 7, Indore, Madhya Pradesh",
              user_note: "I saw the ground sink right in front of my car. We barricaded it with some tree branches for now.",
              image_url: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&q=80&w=600",
              status: "Reported",
              confirmations: 6,
              duplicate_flags: 0,
              createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
            },
            {
              id: "civic-10",
              short_title: "Dumped Concrete Sleeper Rubble Blocking Gachibowli Lane",
              description: "A commercial lorry has dumped a massive mound of waste plaster, concrete blocks, rusted steel rebars, and dry cement bags right on the corner of Gachibowli lane. This forces two-wheelers to squeeze around a sharp blind turn.",
              issue_type: "Construction Debris",
              severity: "Medium",
              risk_level: "Extreme risk of motorcycle slide and traffic congestion on blind corner.",
              suggested_department: "Enforcement Wing (Anti-Littering Squad), GHMC",
              priority_score: 55,
              recommended_action: "Deploy heavy loaders to clear the blocked public lane. Trace lorry tracking GPS to initiate financial penalties.",
              duplicate_keywords: ["debris", "construction waste", "blocking lane", "gachibowli", "dumped concrete"],
              location: "DLF Road turn, Serilingampally Zone, Gachibowli, Hyderabad, Telangana",
              user_note: "Rogue construction contractors dumped this rubble overnight instead of using the debris recycling plant.",
              image_url: "https://images.unsplash.com/photo-1517649763962-0c623066013B?auto=format&fit=crop&q=80&w=600",
              status: "Reported",
              confirmations: 12,
              duplicate_flags: 4,
              createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
            }
          ];
          setIssues(defaultSeed);
          safeStorage.setItem("nagarsetu_issues", JSON.stringify(defaultSeed));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssues();
  }, []);

  // Post dynamic state helper to API / LocalState
  const saveIssuesState = (newIssues: Issue[]) => {
    setIssues(newIssues);
    safeStorage.setItem("nagarsetu_issues", JSON.stringify(newIssues));
  };

  // 1. Report Issue
  const handleAddIssue = async (issueData: Omit<Issue, "id" | "confirmations" | "duplicate_flags" | "createdAt" | "status">) => {
    let lat = issueData.latitude;
    let lng = issueData.longitude;
    
    if (lat === undefined || lng === undefined) {
      let hash = 0;
      const str = issueData.location || "";
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      lat = parseFloat((8.4 + (Math.abs(hash % 26000) / 1000)).toFixed(4));
      lng = parseFloat((68.7 + (Math.abs((hash >> 3) % 28000) / 1000)).toFixed(4));
    }

    const freshIssue: Omit<Issue, "id"> = {
      ...issueData,
      latitude: lat,
      longitude: lng,
      status: "Reported",
      confirmations: 0,
      duplicate_flags: 0,
      createdAt: new Date().toISOString()
    };

    // Optimistic local state update and database POST
    try {
      const response = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(freshIssue)
      });
      if (response.ok) {
        const saved = await response.json();
        saveIssuesState([saved, ...issues]);
      } else {
        throw new Error("API post failure");
      }
    } catch (e) {
      console.warn("Backend unsynchronised. Committing report to localStorage buffer:", e);
      // Local Fallback commit
      const localSaved: Issue = {
        id: `civic-local-${Date.now()}`,
        ...freshIssue
      };
      saveIssuesState([localSaved, ...issues]);
    }
  };

  // 2. Conform Issue (Upvote consensus)
  const handleConfirmIssue = async (id: string) => {
    // Optimistic UI updates
    const updated = issues.map((issue) => {
      if (issue.id === id) {
        return { ...issue, confirmations: issue.confirmations + 1 };
      }
      return issue;
    });
    saveIssuesState(updated);

    try {
      await fetch(`/api/issues/${id}/confirm`, { method: "POST" });
    } catch (e) {
      console.warn("Optimistic confirm API lagged fallback succeeded", e);
    }
  };

  // 3. Mark Duplicate (Upvote duplicates)
  const handleMarkDuplicate = async (id: string) => {
    const updated = issues.map((issue) => {
      if (issue.id === id) {
        return { ...issue, duplicate_flags: issue.duplicate_flags + 1 };
      }
      return issue;
    });
    saveIssuesState(updated);

    try {
      await fetch(`/api/issues/${id}/duplicate`, { method: "POST" });
    } catch (e) {
      console.warn("Optimistic duplicate API lagged fallback succeeded", e);
    }
  };

  // 4. Mark Resolved instantly
  const handleMarkResolved = async (id: string) => {
    const updated = issues.map((issue) => {
      if (issue.id === id) {
        return { 
          ...issue, 
          status: "Resolved" as const,
          resolvedAt: new Date().toISOString() 
        };
      }
      return issue;
    });
    saveIssuesState(updated);

    try {
      await fetch(`/api/issues/${id}/resolve`, { method: "POST" });
    } catch (e) {
      console.warn("Manual resolve API lag fallback succeeded", e);
    }
  };

  // 5. Update Issue Resolution Side-by-Side (after Gemini verification)
  const handleUpdateIssueResolution = async (
    id: string, 
    details: {
      after_image_url: string;
      resolution_confidence: number;
      resolution_status: ResolutionStatusType;
      resolution_explanation: string;
      resolution_next_action: string;
    }
  ) => {
    const updated = issues.map((issue) => {
      if (issue.id === id) {
        return {
          ...issue,
          status: details.resolution_status === "Resolved" ? ("Resolved" as const) : ("In Progress" as const),
          after_image_url: details.after_image_url,
          resolution_confidence: details.resolution_confidence,
          resolution_status: details.resolution_status,
          resolution_explanation: details.resolution_explanation,
          resolution_next_action: details.resolution_next_action,
          resolvedAt: new Date().toISOString()
        };
      }
      return issue;
    });
    saveIssuesState(updated);

    // Patch remote server
    try {
      await fetch(`/api/issues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: details.resolution_status === "Resolved" ? "Resolved" : "In Progress",
          after_image_url: details.after_image_url,
          resolution_confidence: details.resolution_confidence,
          resolution_status: details.resolution_status,
          resolution_explanation: details.resolution_explanation,
          resolution_next_action: details.resolution_next_action,
          resolvedAt: new Date().toISOString()
        })
      });
    } catch (e) {
      console.warn("Optimistic verification synch delayed:", e);
    }
  };

  // 6. Direct routing trigger from Community Board to Verification Tab
  const handleTriggerVerification = (issue: Issue) => {
    setSelectedIssue(issue);
    setCurrentTab("verification");
  };

  // Get active issues count
  const activeCount = issues.filter(i => i.status !== "Resolved").length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Header bar */}
      <Header 
        currentTab={currentTab} 
        onSetTab={setCurrentTab} 
        activeCount={activeCount} 
        user={user}
        onLogin={handleGoogleLogin}
        onLogout={handleGoogleLogout}
        isLoggingIn={isLoggingIn}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {isLoading ? (
          <div className="flex h-96 flex-col items-center justify-center space-y-3">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
            <p className="font-mono text-xs text-slate-400">Restoring civic records...</p>
          </div>
        ) : (
          <div className="animate-fade-in duration-300">
            {currentTab === "landing" && (
              <LandingPage 
                onSetTab={setCurrentTab} 
                issues={issues} 
              />
            )}
            
            {currentTab === "report" && (
              <ReportIssuePage 
                onAddIssue={handleAddIssue} 
                onSetTab={setCurrentTab} 
                user={user}
                accessToken={accessToken}
                onLogin={handleGoogleLogin}
              />
            )}
            
            {currentTab === "dashboard" && (
              <CommunityDashboard 
                issues={issues}
                onConfirmIssue={handleConfirmIssue}
                onMarkDuplicate={handleMarkDuplicate}
                onMarkResolved={handleMarkResolved}
                onTriggerVerification={handleTriggerVerification}
                user={user}
                accessToken={accessToken}
                onLogin={handleGoogleLogin}
              />
            )}

            {currentTab === "admin" && (
              <AdminDashboard 
                issues={issues}
                onSetTab={setCurrentTab}
                onConfirmIssue={handleConfirmIssue}
              />
            )}

            {currentTab === "verification" && (
              <ResolutionVerificationPage 
                selectedIssue={selectedIssue}
                issues={issues}
                onSetSelectedIssue={setSelectedIssue}
                onSetTab={setCurrentTab}
                onUpdateIssueResolution={handleUpdateIssueResolution}
              />
            )}
          </div>
        )}
      </main>

      {/* Simple decorative footer */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        <p>© 2026 NagarSetu AI • AI-Powered Bridge to Civic Resolution • Generated in AI Studio</p>
      </footer>
    </div>
  );
}
