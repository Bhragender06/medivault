import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Shield, Upload, Lock, FileText, CheckCircle, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function IssueRecords() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
       setLoading(false);
       toast({ title: "Record Issued", description: "Document signed and broadcast to MV-HEALTH-MAINNET." });
       navigate("/doctor-dashboard");
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent uppercase tracking-wider mb-3">
            <Lock className="h-3 w-3" /> Secure Genesis
          </span>
          <h1 className="text-3xl font-bold">
            Issue Immutable<br />
            <span className="text-accent">Medical Record</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-lg">
            Publish a cryptographically signed document to the patient's blockchain vault. This action is permanent and creates a verifiable proof of clinical history.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            <div className="card-medical space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Patient Identifier (MV-ID)</Label>
                  <div className="relative mt-1.5">
                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="MV-XXXX-XXXX-XXXX" className="pl-10" />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">Ensure the MV-ID matches the physical patient credentials.</p>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Document Type</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select document category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lab">Lab Report</SelectItem>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="imaging">Imaging / Radiology</SelectItem>
                      <SelectItem value="discharge">Discharge Summary</SelectItem>
                      <SelectItem value="vaccination">Vaccination Certificate</SelectItem>
                      <SelectItem value="genetic">Genetic Data</SelectItem>
                      <SelectItem value="identity">Identity Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Clinical Documentation</Label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`mt-1.5 border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                    dragOver ? "border-accent bg-accent/5" : file ? "border-verified bg-verified/5" : "border-border hover:border-muted-foreground/40"
                  }`}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    accept=".pdf,.dcm,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                  />
                  {file ? (
                    <>
                      <CheckCircle className="h-8 w-8 text-verified mb-2" />
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm">
                        Drop patient records here or{" "}
                        <span className="text-accent font-medium underline">browse files</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, DICOM, or encrypted JPG (Max 25MB)</p>
                    </>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Observation Notes (Private Hash)</Label>
                <Textarea
                  placeholder="Enter clinical observations that will be hashed into the record block..."
                  className="mt-1.5 min-h-[120px]"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-verified" />
                <span>Hardware Signer Active: Ledger-S8</span>
              </div>
              <Button type="submit" size="lg" disabled={loading} className="gradient-hero text-primary-foreground">
                <FileText className="h-4 w-4 mr-2" /> {loading ? "Signing..." : "Sign & Issue to Blockchain"}
              </Button>
            </div>
          </form>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Immutable Chain */}
            <div className="gradient-accent rounded-xl p-5">
              <Shield className="h-6 w-6 text-accent-foreground/80 mb-3" />
              <h3 className="font-bold text-accent-foreground">Immutable Chain</h3>
              <p className="text-sm text-accent-foreground/70 mt-2">
                Records issued via MediVault utilize decentralized identifiers (DIDs). Once signed, the timestamp and hash cannot be altered or removed by any party.
              </p>
            </div>

            {/* Verification Preview */}
            <div className="card-medical">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">Verification Preview</p>
              <div className="bg-muted rounded-lg p-3 flex items-center justify-between mb-2">
                <span className="hash-text text-sm">RECORD_ID_HASH</span>
                <span className="badge-pending text-[10px]">PENDING</span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden mb-3">
                <div className="h-full w-1/3 gradient-accent rounded-full" />
              </div>
              <p className="text-xs text-muted-foreground">
                Upon submission, this document will be broadcast to the <strong className="text-foreground">MV-HEALTH-MAINNET</strong> for consensus validation.
              </p>
            </div>

            {/* Node Status */}
            <div className="gradient-hero rounded-xl p-5">
              <p className="text-[10px] uppercase tracking-widest text-primary-foreground/40 mb-1">Blockchain Terminal</p>
              <p className="text-sm font-semibold text-primary-foreground">Node Status: Active & Synced</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
