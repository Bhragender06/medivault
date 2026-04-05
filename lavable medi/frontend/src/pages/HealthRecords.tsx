
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FileText, Download, Share2, Eye, Upload, Pin, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const quickAccess = [
  { icon: FileText, title: "Vaccination Certificate", issuer: "Ministry of Health", date: "24 Oct 2023", verified: true, category: "Certificates" },
  { icon: FileText, title: "Annual Physical Result", issuer: "City General Hospital", date: "12 Jan 2024", verified: true, category: "All Documents" },
  { icon: FileText, title: "Comprehensive Blood Panel", issuer: "PathCare Diagnostics", date: "05 Feb 2024", verified: true, category: "Lab Reports" },
];

const categories = ["All Documents", "Prescriptions", "Lab Reports", "Identity", "Certificates"];

const documentsData = [
  { title: "Chronic Pain Management Plan", issuer: "St. Jude Medical Center", date: "18 Mar 2024", hash: "0x7a2...f892", verified: true, category: "Prescriptions" },
  { title: "Health Insurance Digital ID", issuer: "BlueShield National", date: "01 Jan 2024", hash: "0x1b4...e321", verified: true, category: "Identity" },
  { title: "MRI Brain Scan (Contrast)", issuer: "Advanced Radiology Hub", date: "15 Nov 2023", hash: "0x9d2...c774", verified: true, category: "Lab Reports" },
  { title: "Annual Cardiology Report 2023", issuer: "St. Mary's General Hospital", date: "14 Nov 2023", hash: "0x8c8...4974", verified: true, category: "Lab Reports" },
];

export default function HealthRecords() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("All Documents");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const filteredDocs = activeCategory === "All Documents" 
    ? documentsData 
    : documentsData.filter(d => d.category === activeCategory);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Patient Health Records</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and share your secure, blockchain-verified medical documentation.</p>
        </div>

        {/* Quick Access */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Quick Access</h2>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveCategory("All Documents")}>View All →</Button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {quickAccess.map((doc, i) => (
              <motion.div
                key={doc.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-medical border-l-4 border-l-accent cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedRecord(doc)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <doc.icon className="h-5 w-5 text-accent" />
                  </div>
                  <Pin className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{doc.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{doc.issuer}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{doc.date}</span>
                  <span className="badge-verified"><CheckCircle className="h-3 w-3" /> VERIFIED</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Document List */}
        <div className="space-y-3">
          {filteredDocs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
               No documents found in this category.
            </div>
          ) : (
             filteredDocs.map((doc, i) => (
               <motion.div
                 key={doc.title}
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: i * 0.05 }}
                 className="card-medical flex items-center gap-4"
               >
                 <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                   <FileText className="h-5 w-5 text-primary" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <h3 className="font-semibold text-sm">{doc.title}</h3>
                   <p className="text-xs text-muted-foreground">
                     Issued by {doc.issuer} • {doc.date}
                   </p>
                   <div className="flex items-center gap-2 mt-1">
                     <span className="badge-verified text-[10px]"><CheckCircle className="h-2.5 w-2.5" /> BLOCKCHAIN VERIFIED</span>
                     <span className="hash-text text-muted-foreground">{doc.hash}</span>
                   </div>
                 </div>
                 <div className="flex items-center gap-2 shrink-0">
                   <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(doc)}><Eye className="h-4 w-4 mr-1" /> View</Button>
                   <Button variant="ghost" size="sm" onClick={() => toast({ title: "Downloading", description: "Your file is downloading." })}><Download className="h-4 w-4 mr-1" /> Download</Button>
                   <Button variant="ghost" size="sm" onClick={() => navigate("/share")}><Share2 className="h-4 w-4 mr-1" /> Share</Button>
                 </div>
               </motion.div>
             ))
          )}
        </div>

        {/* Upload Button */}
        <div className="flex justify-end">
          <Button className="gradient-hero text-primary-foreground" onClick={() => navigate("/upload")}>
            <Upload className="h-4 w-4 mr-2" /> Upload Document
          </Button>
        </div>
      </div>
      
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Record</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted/50 rounded-lg border flex flex-col items-center justify-center h-48 space-y-4">
                  <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm font-semibold">{selectedRecord.title}</p>
                  <Button variant="outline" size="sm" onClick={() => toast({ title: "Opening Viewer", description: "Displaying record..." })}>
                    Open Full PDF Viewer <Eye className="ml-2 h-4 w-4" />
                  </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                  <div>
                    <span className="text-muted-foreground block text-xs">Issued By</span>
                    <span className="font-medium">{selectedRecord.issuer}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Date</span>
                    <span className="font-medium">{selectedRecord.date}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Category</span>
                    <span className="font-medium">{selectedRecord.category}</span>
                  </div>
              </div>
            </div>
          )}
          <DialogFooter>
             <Button variant="outline" onClick={() => setSelectedRecord(null)}>Close</Button>
             <Button onClick={() => toast({ title: "Shared", description: "Navigating to share prompt..." })}>Share</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
