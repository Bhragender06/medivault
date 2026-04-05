import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, Users, FileText, Lock, ShieldCheck, BarChart2,
  Network, Shield, Settings, HelpCircle, Plus, CheckCircle, User,
  ClipboardList, MoreHorizontal, Calendar, Eye, Activity, Clock, Menu, X,
  Bell, ChevronDown, LogOut, UserCircle, Check, AlertCircle, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/auth/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// --- CONSTANTS ---
const ACCENT = "#1DB88E";
const NAVY = "#0D1B2A";

const SIDEBAR_ITEMS = [
  { icon: Home, label: "Dashboard", active: true },
  { icon: Users, label: "My Patients" },
  { icon: FileText, label: "Health Records" },
  { icon: Lock, label: "Vault Access" },
  { icon: ShieldCheck, label: "Verification Logs" },
  { icon: BarChart2, label: "Analytics Hub" },
  { icon: Network, label: "Partner Network" },
  { icon: Shield, label: "Security Settings" },
  { icon: Settings, label: "Settings" },
  { icon: HelpCircle, label: "Support" },
];

const MOBILE_TABS = [
  { icon: Home, label: "Home", active: true },
  { icon: Users, label: "Patients" },
  { icon: FileText, label: "Records" },
  { icon: Settings, label: "Settings" },
  { icon: MoreHorizontal, label: "More" },
];

const DEMO_STATS = [
  { label: "Total Patients", val: "142", icon: Users },
  { label: "Records Verified Today", val: "28", icon: ShieldCheck },
  { label: "Pending Access Requests", val: "5", icon: Clock },
  { label: "Partner Hospitals", val: "12", icon: Network },
];

const DEMO_SCHEDULE = [
  { time: "09:00 AM", patient: "Aarav Sharma", type: "Follow-up", status: "completed" },
  { time: "10:30 AM", patient: "Priya Patel", type: "Consultation", status: "current" },
  { time: "11:15 AM", patient: "Rohan Gupta", type: "Test Review", status: "upcoming" },
  { time: "02:00 PM", patient: "Ananya Desai", type: "Follow-up", status: "upcoming" },
];

const DEMO_ACTIVITY = [
  { name: "Meera Reddy", record: "Blood Test Report", date: "28 Mar 2026", status: "Verified" },
  { name: "Karan Singh", record: "MRI Scan", date: "28 Mar 2026", status: "Pending" },
  { name: "Sneha Joshi", record: "Prescription", date: "27 Mar 2026", status: "Verified" },
  { name: "Vikram Malhotra", record: "X-Ray Report", date: "26 Mar 2026", status: "Rejected" },
];

// --- COMPONENTS ---

const NavItem = ({ icon: Icon, label, active, isCollapsed, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 group",
      active ? "bg-[#1DB88E] text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
    )}
  >
    <Icon className={cn("shrink-0", isCollapsed ? "h-6 w-6 mx-auto" : "h-5 w-5")} />
    {!isCollapsed && <span className="font-medium text-[15px] truncate">{label}</span>}
    {active && !isCollapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />}
  </button>
);

const ActivityBadge = ({ status }: { status: string }) => {
  const styles: any = {
    Verified: "bg-green-100 text-green-700",
    Pending: "bg-amber-100 text-amber-700",
    Rejected: "bg-red-100 text-red-700",
  };
  const icons: any = {
    Verified: <Check className="h-3 w-3" />,
    Pending: null,
    Rejected: <X className="h-3 w-3" />,
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit", styles[status] || "bg-gray-100 text-gray-700")}>
      {icons[status]}
      {status.toUpperCase()}
    </span>
  );
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isVerifyRecordOpen, setIsVerifyRecordOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [isPartnerReqOpen, setIsPartnerReqOpen] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Simulate API load
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Role protection rule
  useEffect(() => {
    const role = localStorage.getItem("userRole") || user?.role;
    if (role === "patient") {
       navigate("/patient-dashboard", { replace: true });
    }
  }, [user, navigate]);

  if (user?.role === "patient") return null;

  const userName = user?.full_name || "Dr. Julian Vance";
  const doctorId = "MV-99281-PR";
  const todayStr = new Intl.DateTimeFormat('en-GB', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  }).format(new Date());

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Sidebar - Desktop/Tablet */}
      <aside 
        className={cn(
          "hidden md:flex flex-col bg-[#0D1B2A] transition-all duration-300 fixed left-0 top-0 h-full z-40",
          isSidebarExpanded ? "w-[240px]" : "w-[80px]"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <Shield className="h-8 w-8 text-[#1DB88E] shrink-0" />
          {isSidebarExpanded && <span className="ml-3 font-bold text-xl text-white tracking-tight">MediVault</span>}
        </div>

        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          {SIDEBAR_ITEMS.map((item, i) => (
            <NavItem 
              key={i} 
              {...item} 
              isCollapsed={!isSidebarExpanded} 
              onClick={() => {
                const paths: Record<string, string> = {
                  "Dashboard": "/doctor-dashboard",
                  "My Patients": "/admin-registrations",
                  "Health Records": "/records",
                  "Vault Access": "/consent",
                  "Verification Logs": "/security-logs",
                  "Analytics Hub": "/issue-records",
                  "Partner Network": "/partners",
                  "Security Settings": "/security-logs",
                  "Settings": "/settings",
                  "Support": "/support"
                };
                if (paths[item.label]) {
                  if (item.label === "Support") toast({ title: "Coming Soon", description: "Support portal is under maintenance."});
                  else navigate(paths[item.label]);
                } else {
                  toast({ title: "Coming Soon", description: `${item.label} is currently unavailable.` });
                }
              }}
            />
          ))}
        </div>

        <div 
          className="p-4 border-t border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-white/20">
              <AvatarImage src="" />
              <AvatarFallback className="bg-[#1DB88E] text-white font-bold">{userName.substring(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            {isSidebarExpanded && (
              <div className="overflow-hidden">
                <p className="text-white text-sm font-bold truncate">{userName}</p>
                <p className="text-gray-400 text-[11px] truncate">{doctorId}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        "md:ml-[80px]",
        isSidebarExpanded ? "md:ml-[240px]" : "md:ml-[80px]"
      )}>
        
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
             <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-navy hover:bg-gray-50 rounded-lg">
                <Menu className="h-6 w-6" />
             </button>
             <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 md:hidden" style={{ color: ACCENT }} />
                <span className="font-bold text-lg md:hidden" style={{ color: NAVY }}>MediVault</span>
             </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-full relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-gray-50 rounded-full transition-colors">
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-gray-200">
                    <AvatarFallback className="bg-navy text-white text-xs">{userName.substring(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1">
                <DropdownMenuLabel>
                  <p className="font-bold text-navy">{userName}</p>
                  <p className="text-xs text-gray-500">{doctorId}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <UserCircle className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-700">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          <div className="space-y-8">
            
            {/* Greeting */}
            <section className="space-y-1">
              {loading ? (
                <>
                  <Skeleton className="h-9 w-48" />
                  <Skeleton className="h-5 w-64" />
                </>
              ) : (
                <>
                  <h1 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">
                    <span className="sm:hidden">Hi {userName.split(' ')[0]} 👋</span>
                    <span className="hidden sm:inline">Good morning, {userName.split(' ')[0]} 👋</span>
                  </h1>
                  <p className="text-sm font-medium text-gray-500">You have 3 appointments today.</p>
                </>
              )}
            </section>

            {/* Stats Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {loading ? (
                Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[120px] rounded-2xl" />)
              ) : (
                DEMO_STATS.map((s, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{s.label}</p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-3xl font-black" style={{ color: ACCENT }}>{s.val}</h3>
                      <div className="p-2 rounded-xl bg-[#1DB88E]/10">
                        <s.icon className="h-6 w-6" style={{ color: ACCENT }} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                { label: "New Patient", icon: Plus, action: () => setIsAddPatientOpen(true) },
                { label: "Verify Record", icon: CheckCircle, action: () => setIsVerifyRecordOpen(true) },
                { label: "Recent Logs", icon: ClipboardList, action: () => navigate("/security-logs") },
                { label: "More Actions", icon: MoreHorizontal, action: () => {
                  toast({ title: "More Actions", description: "Expanded action menu coming soon." });
                } },
              ].map((btn, i) => (
                <Button 
                  key={i} 
                  onClick={btn.action}
                  className="h-14 sm:h-16 bg-[#1DB88E] hover:bg-[#19a57f] text-white rounded-xl shadow-lg shadow-[#1DB88E]/20 flex items-center justify-center gap-3 text-base font-bold transition-all active:scale-95"
                >
                  <btn.icon className="h-5 w-5" />
                  {btn.label}
                </Button>
              ))}
            </section>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Daily Schedule */}
              <section className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col p-6">
                <div className="flex items-center justify-between mb-8">
                   <div>
                      <h3 className="text-xl font-bold text-navy">Daily Schedule</h3>
                      <div className="mt-1 flex items-center gap-2">
                         <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-md uppercase tracking-wider">Today</span>
                         <span className="text-[12px] text-gray-400">{todayStr.split(',')[1]}</span>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-black text-[#1DB88E] bg-[#1DB88E]/10 px-2 py-1 rounded-lg">8 APPTS</p>
                   </div>
                </div>

                <div className="space-y-6 flex-1">
                  {loading ? (
                    Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                  ) : (
                    DEMO_SCHEDULE.map((s, i) => (
                      <div key={i} onClick={() => setSelectedAppointment(s)} className="group flex items-start gap-4 cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
                        <div className="flex flex-col items-center">
                           <div className={cn(
                             "w-3 h-3 rounded-full border-2 bg-white z-10",
                             s.status === 'completed' ? "border-green-500" : s.status === 'current' ? "border-[#1DB88E]" : "border-gray-200"
                           )} />
                           {i !== DEMO_SCHEDULE.length - 1 && <div className="w-[2px] h-12 bg-gray-100 -mt-1" />}
                        </div>
                        <div className="flex-1 min-w-0 -mt-0.5">
                           <div className="flex items-center justify-between">
                              <p className="text-sm font-bold text-navy leading-none">{s.time}</p>
                              {s.status === 'current' && <span className="text-[10px] font-black text-[#1DB88E] animate-pulse">● NOW</span>}
                           </div>
                           <p className="text-[15px] font-medium text-gray-700 mt-1 truncate">{s.patient}</p>
                           <p className="text-[12px] text-gray-400 mt-0.5">{s.type}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Button variant="ghost" onClick={() => toast({ title: "Full Schedule", description: "Schedule module loading..." })} className="w-full mt-8 h-12 text-[#1DB88E] font-bold hover:bg-[#1DB88E]/5 border border-[#1DB88E]/20 rounded-xl">
                  View Full Schedule →
                </Button>
              </section>

              {/* Activity & Partner Banner */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Partner Requests Banner */}
                <section className="bg-navy rounded-2xl p-6 sm:p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 transform translate-x-8 -translate-y-8 group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform opacity-10">
                    <Network className="h-32 w-32 text-white" />
                  </div>
                  
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                       <span className="text-[11px] font-black tracking-[0.2em] text-[#1DB88E]">NETWORK STATUS: ACTIVE & VERIFIED</span>
                    </div>
                    <div className="max-w-md">
                      <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">You have 3 pending partner network requests</h3>
                      <p className="text-gray-400 text-sm mt-2">Review and approve hospitals requesting specialized record access for shared governance.</p>
                    </div>
                    <Button onClick={() => setIsPartnerReqOpen(true)} className="bg-[#1DB88E] hover:bg-[#19a57f] text-white px-8 h-12 rounded-xl font-bold mt-2 shadow-lg shadow-[#1DB88E]/20">
                      Review Requests
                    </Button>
                  </div>
                </section>

                {/* Patient Activity */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-navy">Recent Patient Activity</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Last 10 records managed</p>
                    </div>
                    <Button variant="link" onClick={() => navigate("/records")} className="text-[#1DB88E] font-bold p-0 h-auto">View All</Button>
                  </div>
                  
                  {/* Desktop Table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50/50">
                        <tr className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                          <th className="px-6 py-4">Patient Name</th>
                          <th className="px-6 py-4">Record Type</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {loading ? (
                          Array(4).fill(0).map((_, i) => (
                            <tr key={i}><td colSpan={5} className="px-6 py-4"><Skeleton className="h-8 w-full" /></td></tr>
                          ))
                        ) : (
                          DEMO_ACTIVITY.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                <p className="text-sm font-bold text-navy">{row.name}</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm text-gray-600">{row.record}</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm text-gray-500">{row.date}</p>
                              </td>
                              <td className="px-6 py-4">
                                <ActivityBadge status={row.status} />
                              </td>
                              <td className="px-6 py-4 text-right">
                                <Button onClick={() => setSelectedActivity(row)} variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-[#1DB88E]/10 group-hover:bg-[#1DB88E]/10">
                                  <Eye className="h-5 w-5 text-navy group-hover:text-[#1DB88E]" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile List View */}
                  <div className="sm:hidden p-4 space-y-4">
                    {loading ? (
                       Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-[140px] rounded-xl" />)
                    ) : (
                      DEMO_ACTIVITY.map((row, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3">
                           <div className="flex justify-between items-start">
                              <p className="font-bold text-navy">{row.name}</p>
                              <ActivityBadge status={row.status} />
                           </div>
                           <div>
                              <p className="text-sm text-gray-600">{row.record}</p>
                              <p className="text-xs text-gray-400 mt-1">{row.date}</p>
                           </div>
                           <Button onClick={() => setSelectedActivity(row)} className="w-full bg-white border border-gray-200 text-navy font-bold hover:bg-gray-50 h-10 rounded-lg">
                              View Record
                           </Button>
                        </div>
                      ))
                    )}
                  </div>
                </section>

              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[280px] bg-navy shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
             <div className="p-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                   <Shield className="h-8 w-8 text-[#1DB88E]" />
                   <span className="font-bold text-xl text-white">MediVault</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg">
                   <X className="h-6 w-6" />
                </button>
             </div>
             <div className="flex-1 overflow-y-auto py-6">
                {SIDEBAR_ITEMS.map((item, i) => (
                   <button
                     key={i}
                     onClick={() => {
                        setMobileMenuOpen(false);
                        const paths: Record<string, string> = {
                          "Dashboard": "/doctor-dashboard",
                          "My Patients": "/admin-registrations",
                          "Health Records": "/records",
                          "Vault Access": "/consent",
                          "Verification Logs": "/security-logs",
                          "Analytics Hub": "/issue-records",
                          "Partner Network": "/partners",
                          "Security Settings": "/security-logs",
                          "Settings": "/settings",
                          "Support": "/support"
                        };
                        if (paths[item.label]) {
                          if (item.label === "Support") toast({ title: "Coming Soon", description: "Support portal is under maintenance."});
                          else navigate(paths[item.label]);
                        } else {
                          toast({ title: "Coming Soon", description: `${item.label} is currently unavailable.` });
                        }
                     }}
                     className={cn(
                       "w-full flex items-center gap-4 px-8 py-4 text-white/60 hover:text-white hover:bg-white/5 transition-all text-lg font-medium border-l-4",
                       item.active ? "border-[#1DB88E] text-white bg-white/5" : "border-transparent"
                     )}
                   >
                     <item.icon className="h-6 w-6" />
                     {item.label}
                   </button>
                ))}
             </div>
             <div className="p-6 border-t border-white/5 bg-white/5">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-[#1DB88E]/20">
                     <AvatarFallback className="bg-[#1DB88E] text-white font-black">{userName.substring(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-bold leading-tight">{userName}</p>
                    <p className="text-white/40 text-xs mt-0.5">{doctorId}</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-2 z-40 pb-[max(env(safe-area-inset-bottom),12px)] shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        {MOBILE_TABS.map((tab, i) => (
          <button 
            key={i} 
            className={cn(
              "flex flex-col items-center justify-center min-w-[64px] py-1 transition-all rounded-xl",
              tab.active ? "text-[#1DB88E]" : "text-gray-400 hover:text-navy"
            )}
            onClick={() => tab.label === "More" ? setMobileMenuOpen(true) : {}}
          >
            <tab.icon className={cn("h-6 w-6 mb-1", tab.active ? "stroke-[2.5px]" : "stroke-2")} />
            <span className="text-[10px] font-black uppercase tracking-tight">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ALL MODALS */}
      {/* 1. Add New Patient */}
      <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <p className="text-sm text-gray-500">Register a new patient to your clinical network.</p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input placeholder="+91 9XXXX XXXXX" />
            </div>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="Patient's Full Name" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPatientOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setActionLoading(true);
              setTimeout(() => {
                setActionLoading(false);
                setIsAddPatientOpen(false);
                toast({ title: "Patient Added", description: "New patient registered successfully." });
              }, 1000);
            }} disabled={actionLoading}>
              {actionLoading ? "Processing..." : "Add Patient"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Verify Record */}
      <Dialog open={isVerifyRecordOpen} onOpenChange={setIsVerifyRecordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Blockchain Record</DialogTitle>
            <p className="text-sm text-gray-500">Enter Hash ID to verify integrity.</p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Record Hash ID</Label>
              <Input placeholder="0x..." />
            </div>
            <div className="relative flex justify-center py-2">
               <span className="bg-white px-2 text-xs text-gray-500 z-10">OR</span>
               <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 -z-10" />
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:border-[#1DB88E] transition-colors cursor-pointer">
              <FileText className="h-8 w-8 mb-2" />
              <p className="text-sm font-medium">Upload File to Verify</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVerifyRecordOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setActionLoading(true);
              setTimeout(() => {
                setActionLoading(false);
                setIsVerifyRecordOpen(false);
                toast({ title: "VERIFIED", description: "Record matches blockchain hash exactly." });
              }, 1500);
            }} disabled={actionLoading}>
              {actionLoading ? "Verifying..." : "Verify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Appointment Profile Modal */}
      <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                 <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-navy text-white text-xl">{selectedAppointment.patient.substring(0,2)}</AvatarFallback>
                 </Avatar>
                 <div>
                    <h4 className="text-lg font-bold text-navy">{selectedAppointment.patient}</h4>
                    <p className="text-sm text-gray-500">{selectedAppointment.type} • {selectedAppointment.time}</p>
                 </div>
              </div>
              <div className="flex flex-col gap-2">
                 <Button variant="outline" className="justify-start"><Phone className="mr-2 h-4 w-4" /> Call Patient</Button>
                 <Button variant="outline" onClick={() => { setSelectedAppointment(null); navigate("/records") }} className="justify-start"><FileText className="mr-2 h-4 w-4" /> View Records</Button>
                 <Button className="justify-start bg-[#1DB88E] text-white hover:bg-[#19a57f]" onClick={() => {
                    toast({ title: "Marked Complete", description: "Appointment status updated." });
                    setSelectedAppointment(null);
                 }}><CheckCircle className="mr-2 h-4 w-4" /> Mark Complete</Button>
                 <Button variant="destructive" className="justify-start flex mt-4" onClick={() => {
                    toast({ title: "Appointment Cancelled", variant: "destructive" });
                    setSelectedAppointment(null);
                 }}><X className="mr-2 h-4 w-4" /> Cancel Appointment</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 4. Activity/Record Detail Modal */}
      <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Overview</DialogTitle>
          </DialogHeader>
          {selectedActivity && (
            <div className="space-y-4 py-2">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <p className="text-xs text-gray-400">Patient</p>
                   <p className="font-semibold text-navy">{selectedActivity.name}</p>
                 </div>
                 <div>
                   <p className="text-xs text-gray-400">Date</p>
                   <p className="font-semibold text-navy">{selectedActivity.date}</p>
                 </div>
                 <div>
                   <p className="text-xs text-gray-400">Record Type</p>
                   <p className="font-semibold text-navy">{selectedActivity.record}</p>
                 </div>
                 <div>
                   <p className="text-xs text-gray-400">Status</p>
                   <p className="font-semibold text-navy">{selectedActivity.status}</p>
                 </div>
               </div>
               <div className="p-3 bg-gray-50 rounded-lg mt-4 break-all text-xs font-mono border text-gray-500">
                  Hash: 0x71C7656ec7ab88b098defb751B7401B5f6d8976F
               </div>
            </div>
          )}
          <DialogFooter>
             <Button variant="outline" onClick={() => setSelectedActivity(null)}>Close</Button>
             <Button>Download Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. Partner Requests Modal */}
      <Dialog open={isPartnerReqOpen} onOpenChange={setIsPartnerReqOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partner Network Requests</DialogTitle>
            <p className="text-sm text-gray-500">Organizations requesting access to your clinical records.</p>
          </DialogHeader>
          <div className="space-y-4 py-4">
             {["Apollo Hospitals", "Max Healthcare", "AIIMS Delhi"].map((h) => (
                <div key={h} className="flex items-center justify-between p-3 border rounded-lg">
                   <div>
                      <p className="font-semibold text-sm">{h}</p>
                      <p className="text-xs text-gray-400">Requested Data Access</p>
                   </div>
                   <div className="flex gap-2">
                     <Button variant="outline" size="sm" onClick={() => toast({ title: "Rejected", description: `${h} request rejected.` })}>Reject</Button>
                     <Button size="sm" className="bg-[#1DB88E]" onClick={() => toast({ title: "Approved", description: `${h} added to network.` })}>Approve</Button>
                   </div>
                </div>
             ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
