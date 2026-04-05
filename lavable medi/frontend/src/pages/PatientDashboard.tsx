import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, Folder, Link, Hospital, Pill, Activity, Calendar as CalendarIcon, 
  Bell, Settings, HelpCircle, Share2, Upload, ClipboardList, Search, Eye, X,
  FileText, Shield, ShieldCheck, CheckCircle, Clock, Menu, User, MoreHorizontal, Plus,
  ChevronDown, LogOut, UserCircle, AlertTriangle, ShieldAlert, Download
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- CONSTANTS ---
const ACCENT = "#1DB88E";
const NAVY = "#0D1B2A";

const SIDEBAR_ITEMS = [
  { icon: Home, label: "Home", active: true },
  { icon: Folder, label: "My Records" },
  { icon: Link, label: "Shared Access" },
  { icon: Hospital, label: "My Doctors" },
  { icon: Pill, label: "Prescriptions" },
  { icon: Activity, label: "Lab Reports" },
  { icon: CalendarIcon, label: "Appointments" },
  { icon: Bell, label: "Notifications" },
  { icon: Settings, label: "Settings" },
  { icon: HelpCircle, label: "Support" },
];

const MOBILE_TABS = [
  { icon: Home, label: "Home", active: true },
  { icon: Folder, label: "Records", active: false },
  { icon: Link, label: "Shared", active: false },
  { icon: CalendarIcon, label: "Appointments", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const DEMO_RECORDS = [
  { id: 1, name: "Complete Blood Count", date: "28 Mar 2026", doctor: "Dr. Julian Vance", hospital: "Apollo Hospitals", type: "Lab Report", verified: true },
  { id: 2, name: "Chest X-Ray", date: "15 Feb 2026", doctor: "Dr. Priya Sharma", hospital: "City Care Clinic", type: "Radiology", verified: true },
  { id: 3, name: "Consultation Summary", date: "10 Jan 2026", doctor: "Dr. Rohan Gupta", hospital: "AIIMS Delhi", type: "Prescription", verified: true },
];

const DEMO_SHARED = [
  { id: 1, doctor: "Dr. Advait Singh", spec: "General Physician", granted: "25 March 2026", expires: "5 April 2026", initials: "AS" },
  { id: 2, doctor: "Dr. Anjali Verma", spec: "Cardiologist", granted: "20 March 2026", expires: "15 April 2026", initials: "AV" },
];

const DEMO_APPOINTMENTS = [
  { id: 1, doctor: "Dr. Advait Singh", spec: "General Physician", datetime: "31 March 2026, 10:30 AM", hospital: "Apollo Hospitals", active: true },
  { id: 2, doctor: "Dr. Julian Vance", spec: "Dermatologist", datetime: "5 April 2026, 02:00 PM", hospital: "City Health Clinic", active: false },
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

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal States
  const [isFindDoctorOpen, setIsFindDoctorOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [revokeDoctorId, setRevokeDoctorId] = useState<number | null>(null);
  const [sharedDoctorsList, setSharedDoctorsList] = useState(DEMO_SHARED);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Role protection rule
  useEffect(() => {
    const role = localStorage.getItem("userRole") || user?.role;
    if (role === "doctor") {
       navigate("/doctor-dashboard", { replace: true });
    }
  }, [user, navigate]);

  if (user?.role === "doctor") return null;

  const userName = user?.full_name || "Rahul Mehta";
  const patientId = "MV-99281-PR";
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
                  "Home": "/patient-dashboard",
                  "My Records": "/records",
                  "Shared Access": "/share",
                  "My Doctors": "/patient-dashboard",
                  "Prescriptions": "/records",
                  "Lab Reports": "/records",
                  "Appointments": "/patient-dashboard",
                  "Notifications": "/patient-dashboard",
                  "Settings": "/settings",
                  "Support": "/support"
                };
                if (paths[item.label]) {
                  if (["Support", "Notifications", "Appointments", "My Doctors"].includes(item.label)) {
                    toast({ title: "Coming Soon", description: `${item.label} module is rolling out shortly.` });
                  } else {
                    navigate(paths[item.label]);
                  }
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
              <AvatarFallback className="bg-[#1DB88E] text-white font-bold">{userName.substring(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            {isSidebarExpanded && (
              <div className="overflow-hidden">
                <p className="text-white text-sm font-bold truncate">{userName}</p>
                <p className="text-gray-400 text-[11px] truncate">{patientId}</p>
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
                  <p className="text-xs text-gray-500">{patientId}</p>
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
                  <p className="text-sm font-medium text-gray-500">Your records are secure and verified.</p>
                </>
              )}
            </section>

            {/* Health Summary Stats Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {loading ? (
                Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[120px] rounded-2xl" />)
              ) : (
                [
                  { label: "Total Records", val: "24", icon: Folder },
                  { label: "Shared With", val: "2 Doctors", icon: Link },
                  { label: "Last Verified", val: "28 Mar", icon: ShieldCheck },
                  { label: "Next Appt", val: "31 Mar", icon: CalendarIcon },
                ].map((s, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{s.label}</p>
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
                { label: "Share Record", icon: Share2, action: () => navigate("/share") },
                { label: "Upload Document", icon: Upload, action: () => navigate("/upload") },
                { label: "View History", icon: ClipboardList, action: () => navigate("/records") },
                { label: "Find Doctor", icon: Search, action: () => setIsFindDoctorOpen(true) },
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
              
              {/* My Recent Records & Shared Access */}
              <div className="lg:col-span-2 space-y-8">

                 {/* Recent Records */}
                 <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                   <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                     <div>
                       <h3 className="text-lg font-bold text-navy">My Recent Records</h3>
                     </div>
                     <Button variant="link" onClick={() => navigate("/records")} className="text-[#1DB88E] font-bold p-0 h-auto">View All</Button>
                   </div>

                   {/* Desktop Table */}
                   <div className="hidden sm:block overflow-x-auto">
                     <table className="w-full text-left">
                       <thead className="bg-gray-50/50">
                         <tr className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                           <th className="px-6 py-4">Record Name</th>
                           <th className="px-6 py-4">Type</th>
                           <th className="px-6 py-4">Date</th>
                           <th className="px-6 py-4">Status</th>
                           <th className="px-6 py-4 text-right">Action</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                         {loading ? (
                           Array(3).fill(0).map((_, i) => (
                             <tr key={i}><td colSpan={5} className="px-6 py-4"><Skeleton className="h-8 w-full" /></td></tr>
                           ))
                         ) : (
                           DEMO_RECORDS.map((row, i) => (
                             <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                               <td className="px-6 py-4">
                                 <div>
                                   <p className="text-sm font-bold text-navy">{row.name}</p>
                                   <p className="text-xs text-gray-400 mt-0.5">{row.hospital}</p>
                                 </div>
                               </td>
                               <td className="px-6 py-4 text-sm text-gray-500">{row.type}</td>
                               <td className="px-6 py-4 text-sm text-gray-500">{row.date}</td>
                               <td className="px-6 py-4">
                                 <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 w-fit">
                                    <CheckCircle className="h-3.5 w-3.5" /> VERIFIED
                                 </span>
                               </td>
                               <td className="px-6 py-4 text-right">
                                 <Button onClick={() => setSelectedRecord(row)} variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-[#1DB88E]/10 group-hover:bg-[#1DB88E]/10">
                                   <Eye className="h-4 w-4 text-navy group-hover:text-[#1DB88E]" />
                                 </Button>
                               </td>
                             </tr>
                           ))
                         )}
                       </tbody>
                     </table>
                   </div>

                   {/* Mobile Cards */}
                   <div className="sm:hidden p-4 space-y-4">
                     {loading ? (
                        Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
                     ) : (
                       DEMO_RECORDS.map((row, i) => (
                         <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3 relative overflow-hidden">
                            <div className="flex items-start justify-between relative z-10">
                               <div className="flex gap-3">
                                  <div className="p-2 bg-white rounded-lg shadow-sm">
                                     <FileText className="h-5 w-5" style={{ color: ACCENT }} />
                                  </div>
                                  <div>
                                     <p className="font-bold text-navy leading-tight">{row.name}</p>
                                     <p className="text-xs text-gray-400 mt-1">{row.date} • {row.doctor}</p>
                                  </div>
                               </div>
                               <span className="text-[10px] font-bold text-[#1DB88E] flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" /> VERIFIED
                               </span>
                            </div>
                            <div className="flex gap-2 relative z-10">
                               <Button onClick={() => setSelectedRecord(row)} className="flex-1 bg-white border border-gray-100 text-navy font-bold h-10 rounded-lg text-xs">View</Button>
                               <Button onClick={() => navigate("/share")} className="flex-1 bg-[#1DB88E]/10 text-[#1DB88E] border border-[#1DB88E]/20 font-bold h-10 rounded-lg text-xs">Share</Button>
                            </div>
                         </div>
                       ))
                     )}
                   </div>
                 </section>

                 {/* Shared Access */}
                 <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                   <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                     <div>
                       <h3 className="text-lg font-bold text-navy">Who can see your records</h3>
                     </div>
                   </div>
                   
                   <div className="p-6 space-y-4">
                     {loading ? (
                       Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
                     ) : (
                       sharedDoctorsList.map((doc, i) => (
                         <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:border-[#1DB88E]/30 transition-colors">
                           <div className="flex items-center gap-4">
                             <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-2 ring-gray-100">
                               <AvatarFallback className="bg-[#1DB88E] text-white font-black">{doc.initials}</AvatarFallback>
                             </Avatar>
                             <div>
                               <p className="font-bold text-navy text-[15px] cursor-pointer hover:underline" onClick={() => toast({ title: "Doctor Profile", description: "Profile view coming soon." })}>{doc.doctor}</p>
                               <p className="text-xs text-gray-500">{doc.spec}</p>
                             </div>
                           </div>
                           <div className="flex flex-col sm:items-end">
                              <p className="text-[11px] text-gray-400">Granted: {doc.granted}</p>
                              <p className="text-[11px] text-red-400 font-medium">Expires: {doc.expires}</p>
                           </div>
                           <Button onClick={() => setRevokeDoctorId(doc.id)} variant="outline" className="h-10 rounded-xl border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold text-xs px-6">
                             Revoke Access
                           </Button>
                         </div>
                       ))
                     )}
                   </div>
                 </section>

              </div>

              {/* Sidebar Content (Upcoming Appointments & Emergency) */}
              <div className="lg:col-span-1 space-y-8">
                 
                 {/* Upcoming Appointments */}
                 <section className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col p-6">
                   <h3 className="text-lg font-bold text-navy mb-6">Upcoming Appointments</h3>
                   <div className="space-y-6">
                     {loading ? (
                       Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
                     ) : (
                       DEMO_APPOINTMENTS.map((appt, i) => (
                         <div key={i} className={cn(
                           "p-5 rounded-2xl border-l-4 space-y-4",
                           appt.active ? "bg-[#1DB88E]/5 border-[#1DB88E]" : "bg-gray-50 border-gray-200"
                         )}>
                            <div>
                               <p className="font-bold text-navy">{appt.doctor}</p>
                               <p className="text-xs text-gray-500 mt-1">{appt.spec}</p>
                            </div>
                            <div className="space-y-2">
                               <div className="flex items-center gap-2 text-xs font-bold text-navy">
                                  <Clock className="h-4 w-4 text-[#1DB88E]" /> {appt.datetime}
                               </div>
                               <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                  <Hospital className="h-4 w-4" /> {appt.hospital}
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <Button onClick={() => toast({ title: "Reschedule", description: "Navigating to calendar..." })} variant="outline" className="flex-1 h-9 rounded-lg text-[10px] font-bold">Reschedule</Button>
                               <Button onClick={() => toast({ title: "Appointment Cancelled", variant: "destructive" })} variant="outline" className="flex-1 h-9 rounded-lg text-[10px] font-bold text-red-500 border-red-50 hover:bg-red-50">Cancel</Button>
                            </div>
                         </div>
                       ))
                     )}
                   </div>
                   <Button onClick={() => toast({ title: "Book Appointment", description: "Booking module coming soon." })} className="w-full mt-6 h-12 bg-white border border-[#1DB88E]/30 text-[#1DB88E] font-bold hover:bg-[#1DB88E]/5 rounded-xl">
                      Book Appointment
                   </Button>
                 </section>

                 {/* Emergency Access Card */}
                 <section className="bg-orange-50/50 border border-orange-200 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 transform group-hover:scale-110 transition-transform opacity-10">
                       <ShieldAlert className="h-24 w-24 text-orange-600" />
                    </div>
                    <div className="relative z-10 space-y-3">
                       <div className="flex items-center gap-2 text-orange-600">
                          <AlertTriangle className="h-5 w-5 fill-orange-600/20" />
                          <h4 className="font-black text-xs uppercase tracking-widest">Emergency Access</h4>
                       </div>
                       <p className="text-navy font-bold text-lg leading-tight">Share all records immediately with any doctor in an emergency</p>
                       <p className="text-gray-500 text-xs">Access granted through this button expires automatically in 24 hours.</p>
                       <Button onClick={() => {
                          toast({ title: "Emergency Access Granted", description: "Medical personnel can temporarily access your records for 24h." });
                       }} className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl mt-2 transition-transform active:scale-95 shadow-lg shadow-orange-600/20">
                          Grant Emergency Access
                       </Button>
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
                          "Home": "/patient-dashboard",
                          "My Records": "/records",
                          "Shared Access": "/share",
                          "My Doctors": "/patient-dashboard",
                          "Prescriptions": "/records",
                          "Lab Reports": "/records",
                          "Appointments": "/patient-dashboard",
                          "Notifications": "/patient-dashboard",
                          "Settings": "/settings",
                          "Support": "/support"
                        };
                        if (paths[item.label]) {
                          if (["Support", "Notifications", "Appointments", "My Doctors"].includes(item.label)) {
                            toast({ title: "Coming Soon", description: `${item.label} module is rolling out shortly.` });
                          } else {
                            navigate(paths[item.label]);
                          }
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
                    <p className="text-white/40 text-xs mt-0.5">{patientId}</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-2 z-40 pb-[max(env(safe-area-inset-bottom),12px)] shadow-[0_-8_-30px_rgba(0,0,0,0.08)]">
        {MOBILE_TABS.map((tab, i) => (
          <button 
            key={i} 
            className={cn(
              "flex flex-col items-center justify-center min-w-[64px] py-1 transition-all rounded-xl",
              tab.active ? "text-[#1DB88E]" : "text-gray-400 hover:text-navy"
            )}
            onClick={() => tab.label === "Settings" ? navigate("/settings") : {}}
          >
            <tab.icon className={cn("h-6 w-6 mb-1", tab.active ? "stroke-[2.5px]" : "stroke-2")} />
            <span className="text-[10px] font-black uppercase tracking-tight">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ALL MODALS */}
      {/* 1. Find Doctor */}
      <Dialog open={isFindDoctorOpen} onOpenChange={setIsFindDoctorOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Find Doctor</DialogTitle>
            <p className="text-sm text-gray-500">Search the MediVault network.</p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Doctor Name (Optional)</Label>
              <Input placeholder="e.g. Dr. Sharma" />
            </div>
            <div className="space-y-2">
              <Label>Specialization</Label>
              <Select defaultValue="general">
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Physician</SelectItem>
                  <SelectItem value="cardio">Cardiologist</SelectItem>
                  <SelectItem value="derma">Dermatologist</SelectItem>
                  <SelectItem value="neuro">Neurologist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
               <Label>State</Label>
               <Input placeholder="Filled from login..." defaultValue={localStorage.getItem("userState") || ""} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFindDoctorOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setActionLoading(true);
              setTimeout(() => {
                setActionLoading(false);
                setIsFindDoctorOpen(false);
                toast({ title: "Search Completed", description: "Found 12 matching doctors in your state. Redirecting..." });
              }, 1000);
            }} disabled={actionLoading}>
              {actionLoading ? "Searching..." : "Search"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Record Viewer */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Overview</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 py-2">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <p className="text-xs text-gray-400">Record Name</p>
                   <p className="font-semibold text-navy">{selectedRecord.name}</p>
                 </div>
                 <div>
                   <p className="text-xs text-gray-400">Date</p>
                   <p className="font-semibold text-navy">{selectedRecord.date}</p>
                 </div>
                 <div>
                   <p className="text-xs text-gray-400">Type</p>
                   <p className="font-semibold text-navy">{selectedRecord.type}</p>
                 </div>
                 <div>
                   <p className="text-xs text-gray-400">Issued By</p>
                   <p className="font-semibold text-navy">{selectedRecord.doctor}</p>
                 </div>
               </div>
               <div className="p-3 bg-gray-50 rounded-lg mt-4 break-all text-xs font-mono border flex items-center justify-between text-gray-500 group cursor-pointer hover:bg-gray-100" onClick={() => {
                 navigator.clipboard.writeText("0x71C7656ec7ab88b098defb751B7401B5f6d8976F");
                 toast({ title: "Copied!", description: "Hash copied to clipboard."});
               }}>
                  <span>Hash: 0x71C7656ec7ab88b098...976F</span>
                  <span className="text-xs font-bold text-[#1DB88E] opacity-0 group-hover:opacity-100 transition-opacity">Copy</span>
               </div>
            </div>
          )}
          <DialogFooter className="gap-2">
             <Button variant="outline" onClick={() => setSelectedRecord(null)}>Close</Button>
             <Button onClick={() => {
                toast({ title: "Downloading", description: "File download started..." });
             }}><Download className="h-4 w-4 mr-2" /> Download Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Revoke Access Confirm */}
      <Dialog open={!!revokeDoctorId} onOpenChange={(open) => !open && setRevokeDoctorId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Access</DialogTitle>
          </DialogHeader>
          <div className="py-4">
             <p>Are you sure you want to remove Dr. {(sharedDoctorsList.find(d => d.id === revokeDoctorId)?.doctor || "Unknown").replace("Dr. ", "")}'s access to your medical records?</p>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setRevokeDoctorId(null)}>Cancel</Button>
             <Button variant="destructive" onClick={() => {
                setActionLoading(true);
                setTimeout(() => {
                   setSharedDoctorsList(prev => prev.filter(d => d.id !== revokeDoctorId));
                   setRevokeDoctorId(null);
                   setActionLoading(false);
                   toast({ title: "Access Revoked", description: "The doctor can no longer view your records." });
                }, 800);
             }} disabled={actionLoading}>
                {actionLoading ? "Revoking..." : "Yes, Revoke"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
