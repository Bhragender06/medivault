import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Shield, Download, Search, FileText, Upload, Key, Lock, ChevronLeft, ChevronRight, Filter, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const logs = [
  { timestamp: "2023-10-19 14:23:01", tz: "UTC-05:00", icon: FileText, action: "Record View", nodeId: "DR-ETH-9921", ip: "192.168.1.104", hash: "0x71C7656....", status: "verified" },
  { timestamp: "2023-10-19 14:15:22", tz: "UTC-05:00", icon: Upload, action: "Document Upload", nodeId: "SYS-AUTH-04", ip: "45.22.102.1", hash: "0x3A2B11...9...", status: "verified" },
  { timestamp: "2023-10-19 14:02:44", tz: "UTC-05:00", icon: Key, action: "Access Granted", nodeId: "PAT-Z882-L", ip: "108.12.19.244", hash: "Pending Propaga...", status: "pending" },
  { timestamp: "2023-10-19 13:58:10", tz: "UTC-05:00", icon: Lock, action: "Key Rotation", nodeId: "VAULT-MSTR", ip: "12.0.0.1", hash: "0xFFA21C...8...", status: "verified" },
];

export default function SecurityLogs() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLockoutOpen, setIsLockoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lockedOut, setLockedOut] = useState(false);

  const filteredLogs = logs.filter(l => 
    l.nodeId.toLowerCase().includes(search.toLowerCase()) || 
    l.action.toLowerCase().includes(search.toLowerCase()) || 
    l.hash.toLowerCase().includes(search.toLowerCase())
  );

  const handleAudit = () => {
     setLoading(true);
     toast({ title: "Audit Started", description: "Verifying blockchain ledger integrity..." });
     setTimeout(() => {
        setLoading(false);
        toast({ title: "Audit Complete", description: "All nodes cryptographically secure." });
     }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Platform</span><span>›</span><span>Security Center</span><span>›</span>
          <span className="text-foreground font-medium">Security Logs</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Immutable Audit Trail</h1>
            <p className="text-muted-foreground text-sm mt-1 max-w-lg">
              Real-time ledger of every interaction within the MediVault environment. All records are cryptographically hashed and anchored to the mainnet.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => toast({ title: "Exporting CSV", description: "Your download will begin shortly." })}><Download className="h-4 w-4 mr-2" /> Export CSV</Button>
            <Button className="gradient-hero text-primary-foreground" onClick={handleAudit} disabled={loading}>
              <Shield className="h-4 w-4 mr-2" /> {loading ? "Verifying..." : "Verify Full Chain"}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card-medical border-l-4 border-l-accent">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Events</p>
            <p className="text-3xl font-bold mt-1">1,284,092</p>
          </div>
          <div className="card-medical border-l-4 border-l-accent">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Verified Nodes</p>
            <p className="text-3xl font-bold mt-1">42</p>
          </div>
          <div className="card-medical">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Live Node Status</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="h-2.5 w-2.5 rounded-full bg-verified" />
              <span className="text-sm font-medium">Global Protocol: Operational</span>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Node ID, Action or Hash..." 
              className="pl-10" 
            />
          </div>
          <Button variant="outline" onClick={() => toast({ title: "Calendar", description: "Date picking disabled in demo." })}><Calendar className="h-4 w-4 mr-2" /> Oct 12 - Oct 19</Button>
          <Button variant="outline" onClick={() => toast({ title: "Filters", description: "Advanced filters coming soon." })}><Filter className="h-4 w-4 mr-2" /> Filters</Button>
        </div>

        {/* Table */}
        <div className="card-medical overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b">
                <th className="text-left pb-3 font-medium">Timestamp</th>
                <th className="text-left pb-3 font-medium">Action</th>
                <th className="text-left pb-3 font-medium">User/Node ID</th>
                <th className="text-left pb-3 font-medium">IP Address</th>
                <th className="text-left pb-3 font-medium">Blockchain Hash</th>
                <th className="text-right pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLogs.length === 0 ? (
                 <tr>
                   <td colSpan={6} className="py-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                      No logs found matching "{search}".
                   </td>
                 </tr>
              ) : (
                filteredLogs.map((log, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="py-4">
                    <p className="font-medium text-sm">{log.timestamp}</p>
                    <p className="text-xs text-muted-foreground hash-text">{log.tz}</p>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <log.icon className="h-4 w-4 text-muted-foreground" />
                      <span>{log.action}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="hash-text bg-muted px-2 py-1 rounded">{log.nodeId}</span>
                  </td>
                  <td className="py-4 text-muted-foreground">{log.ip}</td>
                  <td className="py-4">
                    <span className="hash-text text-muted-foreground">{log.hash}</span>
                  </td>
                  <td className="py-4 text-right">
                    <span className={log.status === "verified" ? "badge-verified" : "badge-pending"}>
                      {log.status === "verified" ? <Shield className="h-3 w-3" /> : null}
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Showing <strong>1-25</strong> of 1,284,092 logs</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-9 w-9"><ChevronLeft className="h-4 w-4" /></Button>
            {[1, 2, 3].map((p) => (
              <Button key={p} variant={page === p ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setPage(p)}>
                {p}
              </Button>
            ))}
            <span className="px-1 text-muted-foreground">...</span>
            <Button variant="outline" size="icon" className="h-9 w-9"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Health Check CTA */}
        <div className="gradient-accent rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent-foreground/10 flex items-center justify-center shrink-0">
              <Shield className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-accent-foreground">Network Health Check</h3>
              <p className="text-sm text-accent-foreground/70 max-w-md">
                Our automated chain integrity monitor continuously compares localized logs with the decentralized ledger. No discrepancies detected in the last 2,400 hours.
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleAudit} disabled={loading} className="border-accent-foreground/30 text-accent-foreground bg-accent-foreground/10 hover:bg-accent-foreground/20 shrink-0">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Run Manual Audit
          </Button>
        </div>

        {/* Emergency Lockout */}
        <div className="flex justify-start">
          <Button variant={lockedOut ? "outline" : "destructive"} className="gap-2" onClick={() => lockedOut ? toast({ title: "Unlocked", description: "Vault active." }) : setIsLockoutOpen(true)}>
            <Lock className="h-4 w-4" /> {lockedOut ? "Vault Locked (Click to Unlock)" : "Emergency Lockout"}
          </Button>
        </div>
      </div>

      <Dialog open={isLockoutOpen} onOpenChange={setIsLockoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2"><Lock className="h-5 w-5" /> Emergency Lockout</DialogTitle>
          </DialogHeader>
          <div className="py-4">
             <p className="font-semibold text-lg text-foreground mb-2">Are you sure you want to lock your vault?</p>
             <p className="text-sm text-muted-foreground mb-4">This action will immediately terminate all active sessions, invalidate all cryptographic keys, and prevent any doctor or institution from accessing your medical records.</p>
             <div className="bg-destructive/10 text-destructive p-3 rounded-lg border border-destructive/20 text-sm font-medium">
               Warning: In an emergency, first responders and hospitals will not be able to view your life-saving medical history.
             </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsLockoutOpen(false)}>Cancel</Button>
             <Button variant="destructive" onClick={() => {
                setLoading(true);
                setTimeout(() => {
                   setLoading(false);
                   setLockedOut(true);
                   setIsLockoutOpen(false);
                   toast({ title: "Vault Locked", description: "All external access has been terminated.", variant: "destructive" });
                }, 1000);
             }} disabled={loading}>{loading ? "Locking..." : "Execute Emergency Lockout"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
