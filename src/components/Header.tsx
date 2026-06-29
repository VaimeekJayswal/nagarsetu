import { MapPin, BarChart3, Users, Rocket, AlertTriangle, Sparkles, LogOut, Cloud } from "lucide-react";

interface HeaderProps {
  currentTab: string;
  onSetTab: (tab: string) => void;
  activeCount: number;
  user: any;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
}

const NagarSetuLogoIcon = () => (
  <svg viewBox="0 0 100 100" className="h-10 w-10 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Simple beautiful circular background with soft cream/sand */}
    <circle cx="50" cy="50" r="46" fill="#F4EFE6" stroke="#E9E1D2" strokeWidth="2" />
    
    {/* Bridge Arch (the 'Setu' connection) in deep forest green */}
    <path 
      d="M26 64 Q 50 36 74 64" 
      stroke="#143224" 
      strokeWidth="4" 
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Bridge Deck/roadway representing the bridge deck connection */}
    <path 
      d="M22 66 H78" 
      stroke="#63735D" 
      strokeWidth="2.5" 
      strokeLinecap="round"
    />
    
    {/* Location Pin overlapping the center of the bridge */}
    <path 
      d="M50 18C41.7 18 35 24.7 35 33C35 44.2 50 56 50 56C50 56 65 44.2 65 33C65 24.7 58.3 18 50 18Z" 
      stroke="#143224" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="#FFFCF7" 
    />
    
    {/* Pulse / Heartbeat line inside the pin */}
    <path 
      d="M41 33H44.5L47.5 25L51.5 41L54.5 31L56 33H59" 
      stroke="#D46A43" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    
    {/* Subtle AI spark detail (star/sparkle) at the top right */}
    <path 
      d="M69 19L70.2 21.5L72.7 22.7L70.2 23.9L69 26.4L67.8 23.9L65.3 22.7L67.8 21.5L69 19Z" 
      fill="#D46A43" 
    />
    
    {/* Central connection point node in the middle of the bridge deck */}
    <circle cx="50" cy="56" r="3.5" fill="#D46A43" stroke="#FFFCF7" strokeWidth="1" />
  </svg>
);

export default function Header({ currentTab, onSetTab, activeCount, user, onLogin, onLogout, isLoggingIn }: HeaderProps) {
  const navItems = [
    { id: "landing", label: "Home", icon: Rocket },
    { id: "report", label: "Report Issue", icon: MapPin },
    { id: "dashboard", label: "Civic Ledger", icon: Users },
    { id: "admin", label: "Admin Console", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sand/80 bg-warm-beige/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <button
          onClick={() => onSetTab("landing")}
          className="flex items-center space-x-3 transition active:scale-98 text-left cursor-pointer group"
        >
          <div className="transform transition-transform duration-300 group-hover:scale-105">
            <NagarSetuLogoIcon />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-forest text-lg tracking-tight">NagarSetu</span>
              <span className="rounded-md bg-forest px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-cream uppercase flex items-center gap-0.5">
                AI <Sparkles className="h-2 w-2 text-terracotta" />
              </span>
            </div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#7E7465] font-bold">Citizen-Municipal Bridge</p>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || (item.id === "report" && currentTab === "verification");
            return (
              <button
                key={item.id}
                onClick={() => onSetTab(item.id)}
                className={`relative flex items-center space-x-1.5 py-2 text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "text-forest border-b-2 border-forest"
                    : "text-olive hover:text-forest"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-forest" : "text-olive/75"}`} />
                <span>{item.label}</span>
                {item.id === "dashboard" && activeCount > 0 && (
                  <span className="ml-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-terracotta/10 border border-terracotta/25 px-1 text-[9px] font-extrabold text-terracotta animate-pulse">
                    {activeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Desktop Google Drive Auth Widget */}
        <div className="hidden md:flex items-center space-x-3 pl-4 border-l border-sand/60">
          {user ? (
            <div className="flex items-center space-x-2.5 animate-fade-in">
              <div className="text-right">
                <span className="block text-xs font-black text-forest leading-none">{user.displayName || "Citizen"}</span>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 uppercase font-mono mt-0.5">
                  <Cloud className="h-2.5 w-2.5 text-emerald-600 animate-pulse" />
                  Drive Active
                </span>
              </div>
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="h-8 w-8 rounded-full border border-sand shadow-xs" referrerPolicy="no-referrer" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-forest text-cream flex items-center justify-center font-bold text-xs">{user.displayName ? user.displayName[0] : "C"}</div>
              )}
              <button
                onClick={onLogout}
                title="Disconnect Google Drive"
                className="p-1.5 hover:bg-terracotta/10 text-olive hover:text-terracotta rounded-lg transition cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              disabled={isLoggingIn}
              className="relative inline-flex items-center justify-center space-x-2 bg-cream hover:bg-warm-beige border border-sand rounded-full px-4 py-1.5 transition active:scale-98 text-xs font-bold text-forest cursor-pointer shadow-xs"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4 w-4">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{isLoggingIn ? "Connecting..." : "Connect Drive"}</span>
            </button>
          )}
        </div>

        {/* Mobile Mini Info */}
        <div className="flex items-center space-x-2 md:hidden">
          {user ? (
            <button
              onClick={onLogout}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-cream border border-sand cursor-pointer"
              title="Sign Out"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="h-7 w-7 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <Cloud className="h-4 w-4 text-emerald-600" />
              )}
            </button>
          ) : (
            <button
              onClick={onLogin}
              disabled={isLoggingIn}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-cream border border-sand text-forest cursor-pointer"
              title="Connect Google Drive"
            >
              <Cloud className="h-4 w-4 text-slate-400" />
            </button>
          )}
          {activeCount > 0 && (
            <button
              onClick={() => onSetTab("dashboard")}
              className="flex items-center space-x-1 rounded-full bg-terracotta/5 px-2 py-1 text-xs font-bold text-terracotta border border-terracotta/20 cursor-pointer animate-pulse"
            >
              <span>{activeCount}</span>
            </button>
          )}
          <button
            onClick={() => onSetTab("report")}
            className="flex items-center justify-center rounded-full bg-forest px-3 py-1.5 text-xs font-bold text-cream shadow-xs hover:bg-forest/90 transition cursor-pointer"
          >
            Report
          </button>
        </div>
      </div>

      {/* Mobile Nav Bar Footer (Simple tap-bar for tiny screens) */}
      <div className="flex md:hidden border-t border-sand/50 bg-warm-beige px-2 py-1 justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id || (item.id === "report" && currentTab === "verification");
          return (
            <button
              key={item.id}
              onClick={() => onSetTab(item.id)}
              className={`flex flex-col items-center space-y-0.5 rounded-lg py-1 px-3 text-[10px] font-semibold transition cursor-pointer ${
                isActive ? "text-forest font-bold" : "text-olive/75 hover:text-forest"
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              <span>{item.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
