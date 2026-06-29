import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts";
import { ShieldCheck, Flame, FolderGit, CheckSquare, Trash, ArrowDownWideNarrow, Building2, Users, CheckCircle2, AlertTriangle, Cpu, TrendingUp } from "lucide-react";
import { Issue } from "../types";

interface AdminDashboardProps {
  issues: Issue[];
  onSetTab: (tab: string) => void;
  onConfirmIssue: (id: string) => void;
}

export default function AdminDashboard({ issues, onSetTab, onConfirmIssue }: AdminDashboardProps) {
  // 1. Statistics computation
  const total = issues.length;
  const critical = issues.filter((i) => i.priority_score > 75 && i.status !== "Resolved").length;
  const verified = issues.filter((i) => i.confirmations >= 1).length;
  const resolved = issues.filter((i) => i.status === "Resolved").length;
  const duplicates = issues.reduce((acc, current) => acc + current.duplicate_flags, 0);

  // 2. Category Aggregation
  const categoryCounts = issues.reduce((acc, issue) => {
    acc[issue.issue_type] = (acc[issue.issue_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // 3. Department Aggregation
  const deptCounts = issues.reduce((acc, issue) => {
    acc[issue.suggested_department] = (acc[issue.suggested_department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deptData = Object.entries(deptCounts).map(([name, value]) => ({
    name: name.replace("Department", "Dept").replace("Administration", "Admin").replace("Division", "Div"),
    value,
  }));

  // 4. Urgent Issues sorted by descending Priority score
  const urgentIssues = [...issues]
    .filter((issue) => issue.status !== "Resolved")
    .sort((a, b) => b.priority_score - a.priority_score);

  // Muted, high-end warm-modern colors for premium visual identity
  const COLORS = ["#143224", "#D46A43", "#63735D", "#8C7A5E", "#A66249", "#7D8C7A"];

  const getSeverityStyle = (sev: string = "") => {
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12 bg-warm-beige/30 min-h-screen">
      
      {/* Page Header */}
      <div className="border-b border-sand/60 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-forest sm:text-3xl tracking-tight flex items-center gap-2">
            Operations Console
          </h2>
          <p className="text-xs sm:text-sm text-[#706450] mt-1 font-medium">
            Perform administrative civic triage, dispatch municipal workload, and verify automated pixel audits.
          </p>
        </div>
        <div className="flex items-center space-x-2 rounded-full bg-cream border border-sand px-3 py-1.5 self-start font-mono text-[11px] font-bold text-olive">
          <Cpu className="h-3.5 w-3.5 text-terracotta animate-pulse" />
          <span>System Status: <span className="text-forest font-black">Authorized</span></span>
        </div>
      </div>

      {/* ==================== 1. OVERVIEW SECTION ==================== */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-forest" />
          <h3 className="font-black text-forest text-sm uppercase tracking-widest">Section 01 // Overview</h3>
        </div>

        {/* METRICS ROW */}
        <div className="grid gap-5 grid-cols-2 lg:grid-cols-5">
          {/* Total logs */}
          <div className="card-glass p-5 bg-cream relative overflow-hidden group hover:border-forest">
            <div className="absolute top-0 left-0 w-full h-1 bg-forest" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-[#8C7A5E]">Total Filings</span>
              <FolderGit className="h-4 w-4 text-forest" />
            </div>
            <p className="text-3xl font-black text-forest font-mono leading-none">{total}</p>
            <div className="mt-2 text-[9px] text-olive font-bold flex justify-between">
              <span>All incidentslogged</span>
              <span className="text-forest">Syncok</span>
            </div>
          </div>

          {/* Critical */}
          <div className="card-glass p-5 bg-cream relative overflow-hidden group hover:border-terracotta">
            <div className="absolute top-0 left-0 w-full h-1 bg-terracotta animate-pulse" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-[#8C7A5E]">Critical Priority</span>
              <Flame className="h-4 w-4 text-[B93815] animate-pulse" />
            </div>
            <p className="text-3xl font-black text-terracotta font-mono leading-none">{critical}</p>
            <div className="mt-2 text-[9px] text-[#8C7C60] font-bold flex justify-between">
              <span>Immediate dispatch</span>
              <span className="text-terracotta">Urgent</span>
            </div>
          </div>

          {/* Consensus */}
          <div className="card-glass p-5 bg-cream relative overflow-hidden group hover:border-[#8C7A5E]">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#8C7A5E]" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-[#8C7A5E]">Verified Reports</span>
              <ShieldCheck className="h-4 w-4 text-[#8C7A5E]" />
            </div>
            <p className="text-3xl font-black text-forest font-mono leading-none">{verified}</p>
            <div className="mt-2 text-[9px] text-[#8C7C60] font-bold flex justify-between">
              <span>Neighbor approved</span>
              <span className="text-olive">Verified</span>
            </div>
          </div>

          {/* Remediated */}
          <div className="card-glass p-5 bg-cream relative overflow-hidden group hover:border-olive">
            <div className="absolute top-0 left-0 w-full h-1 bg-olive" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-[#8C7A5E]">AI-Verified Resolutions</span>
              <CheckSquare className="h-4 w-4 text-olive" />
            </div>
            <p className="text-3xl font-black text-forest font-mono leading-none">{resolved}</p>
            <div className="mt-2 text-[9px] text-olive font-bold flex justify-between">
              <span>Dual-image success</span>
              <span className="text-olive">100% Solid</span>
            </div>
          </div>

          {/* Duplicates */}
          <div className="card-glass p-5 bg-cream relative overflow-hidden group hover:border-[#6E6352]">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#6E6352]" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-[#8C7A5E]">Duplicate Flags</span>
              <Trash className="h-4 w-4 text-[#6E6352]" />
            </div>
            <p className="text-3xl font-black text-forest font-mono leading-none">{duplicates}</p>
            <div className="mt-2 text-[9px] text-olive font-bold flex justify-between">
              <span>Clustered items</span>
              <span className="text-olive">Saved Overhead</span>
            </div>
          </div>
        </div>

        {/* CHARTS CONTAINER */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Issue Categories (Pie Chart) */}
          <div className="card-glass p-6 bg-cream border border-sand">
            <div>
              <h3 className="font-extrabold text-[#113224] text-base">Top Issue Categories</h3>
              <p className="text-[10.5px] text-[#8C7A5E] font-medium">Proportional classification breakdown of community hazards</p>
            </div>
            
            {categoryData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-olive/60">No category log details available.</div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 h-64 mt-4">
                <div className="w-40 h-40 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FFFCF7', 
                          borderColor: '#E9E1D2', 
                          borderRadius: '12px',
                          fontFamily: 'JetBrains Mono',
                          fontSize: '11px' 
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend details */}
                <div className="flex-1 space-y-2 w-full max-h-56 overflow-y-auto pr-1 no-scrollbar">
                  {categoryData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-[#6E6352] font-semibold text-[11px] truncate">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-forest bg-warm-beige px-2 py-0.5 rounded-md text-[10.5px] border border-sand/40">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Department Workloads (Bar Chart) */}
          <div className="card-glass p-6 bg-cream border border-sand">
            <div>
              <h3 className="font-extrabold text-[#113224] text-base">Department Routing</h3>
              <p className="text-[10.5px] text-[#8C7A5E] font-medium mb-4">Urgent files allocated per municipal sector</p>
            </div>

            {deptData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-olive/60">No workloads assigned.</div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fill: "#8C7A5E", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#8C7A5E", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      cursor={{ fill: "transparent" }}
                      contentStyle={{ 
                        backgroundColor: '#FFFCF7', 
                        borderColor: '#E9E1D2', 
                        borderRadius: '12px',
                        fontFamily: 'JetBrains Mono',
                        fontSize: '11px' 
                      }} 
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {deptData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==================== 2. URGENT ISSUES SECTION ==================== */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-terracotta" />
          <h3 className="font-black text-terracotta text-sm uppercase tracking-widest">Section 02 // Urgent Issues</h3>
        </div>

        <div className="card-glass overflow-hidden border border-sand bg-cream">
          {/* Table header menu */}
          <div className="p-6 border-b border-sand bg-warm-beige/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5">
            <div>
              <h3 className="font-extrabold text-forest text-base flex items-center space-x-2">
                <ArrowDownWideNarrow className="h-4.5 w-4.5 text-olive shrink-0" />
                <span>Critical Backlog Queue</span>
              </h3>
              <p className="text-[10.5px] text-[#8C7A5E] font-medium mt-1">Unresolved listings sorted automatically by Gemini priorities</p>
            </div>
            <span className="font-mono text-[10px] font-bold text-olive bg-sand/30 border border-sand px-3 py-1 rounded-full">
              Buffer load: {urgentIssues.length} entries
            </span>
          </div>

          {/* Backlog Table */}
          {urgentIssues.length === 0 ? (
            <div className="p-16 text-center text-sm font-bold text-olive bg-cream">
              🎉 All active reports resolved. Public spaces are fully functional!
            </div>
          ) : (
            <div className="overflow-x-auto bg-cream">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-warm-beige/40 border-b border-sand font-mono text-[9px] font-black tracking-widest text-olive uppercase">
                    <th className="py-4 px-6 w-32">Priority Rating</th>
                    <th className="py-4 px-6">Incident Title & Geo-Coordinates</th>
                    <th className="py-4 px-6 w-48">Classification Tag</th>
                    <th className="py-4 px-6">Assigned Sector</th>
                    <th className="py-4 px-6 w-24 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/50">
                  {urgentIssues.map((issue) => {
                    const getMeterColor = (score: number) => {
                      if (score >= 80) return "bg-terracotta";
                      if (score >= 50) return "bg-[#D4A343]";
                      return "bg-olive";
                    };

                    return (
                      <tr key={issue.id} className="hover:bg-warm-beige/10 transition">
                        {/* Score and Micro Meter */}
                        <td className="py-5 px-6">
                          <div className="flex flex-col space-y-1">
                            <span className="font-mono text-xs font-black text-forest bg-warm-beige border border-sand/40 rounded-md px-1.5 py-0.5 w-fit">
                              {issue.priority_score} / 100
                            </span>
                            <div className="h-1 w-16 bg-sand/30 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${getMeterColor(issue.priority_score)}`} style={{ width: `${issue.priority_score}%` }} />
                            </div>
                          </div>
                        </td>

                        {/* Title and Geo meta */}
                        <td className="py-5 px-6">
                          <div>
                            <h4 className="font-bold text-forest text-sm leading-snug">{issue.short_title}</h4>
                            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-olive mt-1.5 font-bold">
                              <span className="text-[#8C7C60]">{issue.location}</span>
                              <span className="text-sand">•</span>
                              <span className="text-[#8C7A5E] bg-sand/20 px-1.5 py-0.5 rounded border border-sand/30">{issue.confirmations} validations</span>
                            </div>
                          </div>
                        </td>

                        {/* Tags */}
                        <td className="py-5 px-6">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded bg-forest px-2 py-0.5 font-mono text-[9px] font-black text-cream uppercase tracking-wider">
                              {issue.issue_type}
                            </span>
                            <span className={`rounded px-2 py-0.5 font-mono text-[9px] font-black uppercase ${getSeverityStyle(issue.severity)}`}>
                              {issue.severity}
                            </span>
                          </div>
                        </td>

                        {/* Mapped Department */}
                        <td className="py-5 px-6">
                          <div className="flex items-center space-x-1.5 font-mono text-xs font-bold text-forest">
                            <Building2 className="h-3.5 w-3.5 text-olive shrink-0" />
                            <span className="truncate max-w-[170px]" title={issue.suggested_department}>
                              {issue.suggested_department}
                            </span>
                          </div>
                        </td>

                        {/* Audit Action Button */}
                        <td className="py-5 px-6 text-right">
                          <button
                            onClick={() => onSetTab("dashboard")}
                            className="rounded-full bg-forest hover:bg-forest/90 font-bold text-xs text-cream px-4 py-2 transition shadow-xs active:translate-y-px cursor-pointer"
                          >
                            Audit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ==================== 3. DEPARTMENT ROUTING SECTION ==================== */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-olive" />
          <h3 className="font-black text-olive text-sm uppercase tracking-widest">Section 3 // Department Routing</h3>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {Object.entries(deptCounts).map(([dept, count], idx) => (
            <div key={dept} className="card-glass p-5 bg-cream border border-sand">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-forest/5 rounded-lg text-forest border border-sand">
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="font-mono text-[10px] font-black bg-forest text-cream px-2 py-0.5 rounded-full">
                  Queue: {count}
                </span>
              </div>
              <h4 className="font-bold text-forest text-sm truncate" title={dept}>
                {dept}
              </h4>
              <p className="text-[10px] uppercase font-mono tracking-widest text-[#8C7A5E] mt-1">Autonomous dispatch target</p>
              
              <div className="h-1 bg-sand/30 rounded-full mt-4 overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    backgroundColor: COLORS[(idx + 2) % COLORS.length],
                    width: `${Math.min(100, (count / (total || 1)) * 100)}%` 
                  }} 
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 4. RESOLUTION VERIFICATION SECTION ==================== */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-forest" />
          <h3 className="font-black text-forest text-sm uppercase tracking-widest">Section 4 // Resolution Verification</h3>
        </div>

        <div className="card-glass p-6 bg-cream border border-sand grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h4 className="font-extrabold text-forest text-lg">Dual-Image Resolution Security</h4>
            <p className="text-xs text-[#6E6352] leading-relaxed">
              We leverage computer vision comparison to verify civic repairs autonomously. Citizen-uploaded post-resolution pictures are scanned against original incident reports to calculate pixel structural consistency.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-forest/5 rounded-xl border border-sand">
                <p className="font-mono text-xl font-black text-forest">{resolved}</p>
                <span className="text-[10px] font-bold text-olive block mt-0.5">Visually Audited Resolves</span>
              </div>
              <div className="p-3 bg-terracotta/5 rounded-xl border border-sand">
                <p className="font-mono text-xl font-black text-terracotta">94.8%</p>
                <span className="text-[10px] font-bold text-olive block mt-0.5">Average Confidence Core</span>
              </div>
            </div>
          </div>

          {/* Verification visual simulator mockup */}
          <div className="p-4 bg-warm-beige/30 rounded-2xl border border-sand divide-y divide-sand">
            <div className="flex items-center justify-between pb-3">
              <span className="font-mono text-[9px] font-bold text-[#8C7A5E] tracking-widest uppercase">AUDIT COMPLETED // #INCID_3</span>
              <span className="flex items-center gap-1 font-mono text-[10px] font-black text-forest bg-forest/10 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Approved
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div>
                <span className="text-[8.5px] font-mono text-olive block uppercase font-bold mb-1">State: Active Hazard</span>
                <div className="h-16 w-full rounded-lg bg-sand/30 border border-sand overflow-hidden flex items-center justify-center font-mono text-[9px] text-[#8C7A5E]">
                  Pre-Remediation
                </div>
              </div>
              <div>
                <span className="text-[8.5px] font-mono text-forest block uppercase font-bold mb-1">State: Solved Field</span>
                <div className="h-16 w-full rounded-lg bg-forest/5 border border-forest/20 overflow-hidden flex items-center justify-center font-mono text-[9px] text-forest font-bold">
                  Post-Remediation
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 5. COMMUNITY SIGNALS SECTION ==================== */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-terracotta" />
          <h3 className="font-black text-terracotta text-sm uppercase tracking-widest">Section 5 // Community Signals</h3>
        </div>

        <div className="card-glass p-6 bg-cream border border-sand">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-sand">
            <div className="flex items-center space-x-2">
              <Users className="h-4.5 w-4.5 text-olive" />
              <span className="font-extrabold text-forest text-sm">Citizen Attestations & Consensus Signals</span>
            </div>
            <span className="text-xs font-mono text-olive font-bold">Real-time Public Vetting Matrix</span>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {/* Signal Block 1 */}
            <div className="p-4 bg-warm-beige/25 rounded-2xl border border-sand/60">
              <span className="text-[9px] uppercase font-mono font-bold text-olive tracking-wider block mb-1">Affirmation Index</span>
              <p className="text-2xl font-black text-forest font-mono">{issues.reduce((acc, curr) => acc + curr.confirmations, 0)}</p>
              <p className="text-[10px] text-[#8C7C60] mt-1leading-relaxed font-semibold">
                Total community confirmation signatures endorsing reported filings.
              </p>
            </div>

            {/* Signal Block 2 */}
            <div className="p-4 bg-warm-beige/25 rounded-2xl border border-sand/60">
              <span className="text-[9px] uppercase font-mono font-bold text-olive tracking-wider block mb-1">Deduplication Cluster Rate</span>
              <p className="text-2xl font-black text-terracotta font-mono">{issues.reduce((acc, curr) => acc + curr.duplicate_flags, 0)}</p>
              <p className="text-[10px] text-[#8C7C60] mt-1 leading-relaxed font-semibold">
                Geographic reports flagged as nearby duplicate duplicates by neighbors.
              </p>
            </div>

            {/* Signal Block 3 */}
            <div className="p-4 bg-warm-beige/25 rounded-2xl border border-sand/60">
              <span className="text-[9px] uppercase font-mono font-bold text-olive tracking-wider block mb-1">Consensus Accuracy</span>
              <p className="text-2xl font-black text-forest font-mono">99.1%</p>
              <p className="text-[10px] text-[#8C7C60] mt-1 leading-relaxed font-semibold">
                Accuracy score computed between collective human votes and AI routing.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
