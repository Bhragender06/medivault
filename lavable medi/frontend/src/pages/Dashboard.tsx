import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Users, Shield, Clock, MoreHorizontal, ChevronRight, CheckCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const quickActions = [
  { icon: Users, label: "New Patient", color: "bg-primary" },
  { icon: Shield, label: "Verify Record", color: "bg-accent" },
  { icon: Clock, label: "Recent Logs", color: "bg-primary" },
  { icon: MoreHorizontal, label: "More Actions", color: "bg-muted" },
];

const schedule = [
  { time: "09:00", period: "AM", name: "Sarah Jenkins", type: "Annual Physical", urgent: false },
  { time: "10:30", period: "AM", name: "Marcus Thorne", type: "Post-Op Checkup", urgent: true },
  { time: "11:15", period: "AM", name: "Elena Rodriguez", type: "Blood Work Review", urgent: false },
];

const ledgerLogs = [
  { hash: "0x7f2...8e91", patient: "James Wilson", action: "Immunization Record", status: "verified", time: "2m ago" },
  { hash: "0x4a1...c312", patient: "Linda Chen", action: "Lab Results", status: "verified", time: "14m ago" },
  { hash: "0x9b8...ff01", patient: "Robert T.", action: "Prescription Entry", status: "pending", time: "41m ago" },
];

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Doctor's Overview</h1>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-medical flex flex-col items-center gap-3 py-6 hover:shadow-elevated cursor-pointer"
            >
              <div className={`h-12 w-12 rounded-full ${action.color} flex items-center justify-center`}>
                <action.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Schedule */}
          <div className="lg:col-span-2 card-medical">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Daily Schedule</h2>
              <span className="badge-verified">8 Appts</span>
            </div>
            <div className="space-y-4">
              {schedule.map((item) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div className={`w-1 h-12 rounded-full ${item.urgent ? "bg-accent" : "bg-border"}`} />
                  <div className="text-right w-12">
                    <p className={`text-sm font-semibold ${item.urgent ? "text-accent" : ""}`}>{item.time}</p>
                    <p className="text-xs text-muted-foreground">{item.period}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-xs uppercase tracking-wider text-muted-foreground">
              View Full Waitlist
            </Button>
          </div>

          {/* Stats */}
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="gradient-hero rounded-xl p-5">
                <p className="text-xs text-primary-foreground/60 uppercase tracking-wider mb-1">Verified Today</p>
                <p className="text-4xl font-bold text-primary-foreground">142</p>
              </div>
              <div className="card-medical">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sync Health</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-verified" />
                  <span className="text-2xl font-bold">99.9%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Node Latency: 12ms</p>
              </div>
            </div>

            {/* Ledger Logs */}
            <div className="card-medical">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Immutable Ledger Logs</h2>
                <Button variant="ghost" size="sm" className="text-xs">View Ledger</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                      <th className="text-left pb-3 font-medium">Reference Hash</th>
                      <th className="text-left pb-3 font-medium">Patient</th>
                      <th className="text-left pb-3 font-medium">Action</th>
                      <th className="text-left pb-3 font-medium">Status</th>
                      <th className="text-right pb-3 font-medium">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ledgerLogs.map((log) => (
                      <tr key={log.hash}>
                        <td className="py-3 hash-text text-muted-foreground">{log.hash}</td>
                        <td className="py-3 font-medium">{log.patient}</td>
                        <td className="py-3 text-muted-foreground">{log.action}</td>
                        <td className="py-3">
                          <span className={log.status === "verified" ? "badge-verified" : "badge-pending"}>
                            {log.status === "verified" ? <Lock className="h-3 w-3" /> : null}
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 text-right text-muted-foreground">{log.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
