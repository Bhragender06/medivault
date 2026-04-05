import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, CheckCircle, ChevronLeft, FileText, Share2,
  Search, Calendar, Clock, Lock, Copy, CopyCheck,
  X, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { sanitizePhone, formatPhoneDisplay } from "@/hooks/useFieldValidation";

// Mock data
const ALL_RECORDS = [
  { id: "1", name: "Complete Blood Count", date: "28 Mar 2026", type: "Lab Report" },
  { id: "2", name: "Chest X-Ray", date: "15 Feb 2026", type: "X-Ray" },
  { id: "3", name: "Consultation Summary", date: "10 Jan 2026", type: "Prescription" },
  { id: "4", name: "Lipid Profile", date: "05 Dec 2025", type: "Lab Report" },
];

const EXPIRY_OPTIONS = [
  { id: "24h", label: "24 hours" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "custom", label: "Custom date" },
];

const accent = "#1DB88E";
const navy = "#0D1B2A";

export default function ShareRecord() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const role = localStorage.getItem("userRole");

  // Step state
  const [step, setStep] = useState(1);
  const [sharing, setSharing] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Step 1: Records
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const allSelected = selectedRecords.length === ALL_RECORDS.length;

  // Step 2: Doctor info
  const [docPhone, setDocPhone] = useState("");
  const [docId, setDocId] = useState("");

  // Step 3: Permissions
  const [expiry, setExpiry] = useState("7d");
  const [customDate, setCustomDate] = useState("");
  const [allowAdd, setAllowAdd] = useState(false);

  // Validation
  const docPhoneValid = docPhone.length === 10 && /^[6-9]/.test(docPhone);
  const docIdValid = docId.toUpperCase().startsWith("MV-") && docId.length > 5;
  const isDocFilled = docPhoneValid || docIdValid;
  const isExpiryValid = expiry !== "custom" || customDate !== "";

  useEffect(() => {
    if (role === "doctor") {
      navigate("/doctor-dashboard", { replace: true });
    }
  }, [role, navigate]);

  const toggleSelectAll = () => {
    if (allSelected) setSelectedRecords([]);
    else setSelectedRecords(ALL_RECORDS.map(r => r.id));
  };

  const toggleRecord = (id: string) => {
    setSelectedRecords(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleShare = () => {
    setSharing(true);
    setTimeout(() => {
      setSharing(false);
      const link = `https://medivault.network/access/${Math.random().toString(36).substr(2, 10)}`;
      setShareLink(link);
      toast({
        title: "Access Granted",
        description: `Doctor will receive SMS on +91 ${formatPhoneDisplay(docPhone || "9876543210")}`,
      });
    }, 1500);
  };

  const handleCopy = () => {
    if (shareLink) navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied to clipboard" });
  };

  // Success Screen
  if (shareLink) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] p-4 sm:p-6 flex flex-col items-center justify-center">
        <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-[12px] text-center" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h2 className="text-[24px] font-bold mb-2" style={{ color: navy }}>Access Granted</h2>
          <p className="text-[14px] text-gray-500 mb-6">Doctor has been granted secure access to your selected records.</p>

          <div className="bg-gray-50 border border-gray-200 p-4 rounded-[8px] mb-8 text-left">
            <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wider mb-2">Secure Access Link</p>
            <div className="flex gap-2">
              <Input readOnly value={shareLink} className="font-mono text-[14px] bg-white h-[52px]" />
              <Button onClick={handleCopy} variant="outline" className="h-[52px] w-[52px] px-0 shrink-0 rounded-[8px]">
                {copied ? <CopyCheck className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-gray-500" />}
              </Button>
            </div>
            <p className="text-[12px] text-gray-400 mt-4 pt-4 border-t">SMS notification sent to +91 {formatPhoneDisplay(docPhone || "9876543210")}</p>
          </div>

          <Button
            onClick={() => navigate("/patient-dashboard")}
            className="w-full h-[52px] rounded-[8px] text-[16px] font-bold text-white transition-all"
            style={{ background: navy }}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6F8] p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
          className="flex items-center text-[14px] font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> {step > 1 ? "Back" : "Back to Dashboard"}
        </button>

        <div className="bg-white rounded-[12px] p-5 sm:p-8" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-[24px] sm:text-[28px] font-bold" style={{ color: navy }}>Share Records</h1>
              <p className="text-[14px] text-gray-500 mt-1">Grant secure verifying access to a doctor.</p>
            </div>
            <div className="p-3 rounded-[8px] hidden sm:block shrink-0" style={{ background: "rgba(29,184,142,0.1)" }}>
              <Share2 className="h-6 w-6" style={{ color: accent }} />
            </div>
          </div>

          {/* Stepper indicator */}
          <div className="flex items-center gap-2 mb-8 border-b pb-6">
            {[1, 2, 3, 4].map(s => (
              <React.Fragment key={s}>
                <div
                  className={`flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full text-[14px] font-bold transition-colors shrink-0 ${step >= s ? "text-white" : "bg-gray-100 text-gray-400"
                    }`}
                  style={{ background: step >= s ? (step === s ? accent : navy) : '' }}
                >
                  {step > s ? <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" /> : s}
                </div>
                {s < 4 && <div className={`h-1 flex-1 rounded-full ${step > s ? 'bg-navy' : 'bg-gray-100'}`} style={step > s ? { background: navy } : {}} />}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Select Records */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div>
                <h3 className="text-[18px] font-bold" style={{ color: navy }}>1. Select Records</h3>
                <p className="text-[14px] text-gray-500">Choose which documents to share.</p>
              </div>

              <div 
                className="p-5 border border-gray-200 rounded-[8px] bg-gray-50 flex items-center gap-3 cursor-pointer select-none active:bg-gray-100 transition-colors"
                onClick={toggleSelectAll}
              >
                <Checkbox id="selectAll" checked={allSelected} onCheckedChange={toggleSelectAll} className="h-5 w-5 pointer-events-none" />
                <Label htmlFor="selectAll" className="font-semibold text-[16px] cursor-pointer pointer-events-none">Select All Records ({ALL_RECORDS.length})</Label>
              </div>

              <div className="space-y-3">
                {ALL_RECORDS.map(record => (
                  <div 
                    key={record.id} 
                    className="p-4 sm:p-5 border border-gray-100 rounded-[8px] flex items-start gap-4 hover:border-teal-200 transition-colors cursor-pointer active:bg-gray-50 select-none" 
                    onClick={() => toggleRecord(record.id)}
                  >
                    <Checkbox id={`rec-${record.id}`} checked={selectedRecords.includes(record.id)} className="h-5 w-5 mt-0.5 pointer-events-none" />
                    <div className="flex-1 mt-[-2px]">
                      <Label htmlFor={`rec-${record.id}`} className="font-bold text-[16px] cursor-pointer pointer-events-none leading-tight" style={{ color: navy }}>{record.name}</Label>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1.5 text-[14px] text-gray-500">
                        <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 shrink-0" /> {record.date}</span>
                        <span className="flex items-center gap-1.5"><FileText className="h-4 w-4 shrink-0" /> {record.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={selectedRecords.length === 0}
                className="w-full h-[52px] mt-8 text-[16px] font-bold text-white rounded-[8px] transition-all"
                style={{ background: selectedRecords.length > 0 ? navy : "#d1d5db" }}
              >
                Continue →
              </Button>
            </div>
          )}

          {/* Step 2: Doctor Details */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h3 className="text-[18px] font-bold" style={{ color: navy }}>2. Doctor Details</h3>
                <p className="text-[14px] text-gray-500">Who are you sharing these records with?</p>
              </div>

              <div className="p-5 sm:p-6 border-2 border-dashed border-gray-200 rounded-[8px] bg-gray-50">
                <Label style={{ color: navy }} className="mb-2 block text-[14px] font-semibold">Doctor's Phone Number</Label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center gap-1.5 px-3 border rounded-[8px] text-[16px] font-semibold shrink-0 bg-white select-none h-[52px]" style={{ borderColor: "#e5e7eb", color: navy }}>
                    +91
                  </div>
                  <div className="relative flex-1">
                    <Input
                      type="tel"
                      inputMode="numeric"
                      value={formatPhoneDisplay(docPhone)}
                      onChange={(e) => { setDocPhone(sanitizePhone(e.target.value)); setDocId(""); }}
                      placeholder="98765 43210"
                      className="h-[52px] text-[16px] bg-white"
                      style={{ borderRadius: "8px" }}
                      maxLength={11}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 my-8 relative">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="px-2 bg-gray-50 text-[12px] uppercase font-bold text-gray-400 absolute left-1/2 -translate-x-1/2">OR</span>
                </div>

                <Label style={{ color: navy }} className="mb-2 block text-[14px] font-semibold">Doctor's MediVault ID</Label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    value={docId}
                    onChange={(e) => { setDocId(e.target.value); setDocPhone(""); }}
                    placeholder="MV-XXXXX-PR"
                    className="h-[52px] text-[16px] pl-12 uppercase bg-white"
                    style={{ borderRadius: "8px" }}
                  />
                </div>
              </div>

              <Button
                onClick={() => setStep(3)}
                disabled={!isDocFilled}
                className="w-full h-[52px] mt-8 text-[16px] font-bold text-white rounded-[8px] transition-all"
                style={{ background: isDocFilled ? navy : "#d1d5db" }}
              >
                Continue →
              </Button>
            </div>
          )}

          {/* Step 3: Expiry & Permissions */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div>
                <h3 className="text-[18px] font-bold" style={{ color: navy }}>3. Set Access Rules</h3>
                <p className="text-[14px] text-gray-500">Control how long they can view your records.</p>
              </div>

              <div>
                <Label style={{ color: navy }} className="mb-3 block font-semibold text-[16px]">Access Duration</Label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {EXPIRY_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setExpiry(opt.id)}
                      className="h-[52px] px-4 border text-[14px] font-bold rounded-[8px] transition-colors flex items-center justify-center sm:justify-start gap-2 active:bg-gray-50 select-none"
                      style={{
                        borderColor: expiry === opt.id ? accent : "#e5e7eb",
                        background: expiry === opt.id ? "rgba(29,184,142,0.05)" : "white",
                        color: expiry === opt.id ? navy : "#6b7280"
                      }}
                    >
                      <Clock className="h-5 w-5 hidden sm:block" style={{ color: expiry === opt.id ? accent : "#9ca3af" }} />
                      {opt.label}
                    </button>
                  ))}
                </div>

                {expiry === "custom" && (
                  <div className="animate-in fade-in slide-in-from-top-2 mt-4">
                    <Label className="text-[14px] text-gray-500 mb-2 block">Select expiry date</Label>
                    <Input
                      type="date"
                      value={customDate}
                      onChange={e => setCustomDate(e.target.value)}
                      className="h-[52px] text-[16px] px-4"
                      style={{ borderRadius: "8px" }}
                    />
                  </div>
                )}
              </div>

              <div 
                className="p-5 border border-gray-200 rounded-[8px] flex items-start gap-4 cursor-pointer active:bg-gray-50 select-none transition-colors" 
                onClick={() => setAllowAdd(!allowAdd)}
              >
                <Checkbox id="allowAdd" checked={allowAdd} className="h-5 w-5 mt-0.5 pointer-events-none" />
                <div>
                  <Label htmlFor="allowAdd" className="font-bold text-[16px] cursor-pointer pointer-events-none leading-tight" style={{ color: navy }}>
                    Allow appending new records
                  </Label>
                  <p className="text-[14px] text-gray-500 mt-1.5 leading-snug">
                    If checked, the doctor can securely upload test results and prescriptions directly to your vault.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setStep(4)}
                disabled={!isExpiryValid || (expiry === 'custom' && !customDate)}
                className="w-full h-[52px] mt-8 text-[16px] font-bold text-white rounded-[8px] transition-all"
                style={{ background: isExpiryValid && (expiry !== 'custom' || customDate) ? navy : "#d1d5db" }}
              >
                Review & Confirm →
              </Button>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div>
                <h3 className="text-[18px] font-bold" style={{ color: navy }}>4. Review Summary</h3>
                <p className="text-[14px] text-gray-500">Please review before granting cryptographic access.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-[12px] border border-gray-200 space-y-6">
                <div>
                  <p className="text-[12px] uppercase font-bold text-gray-500 tracking-wider mb-2">Sharing With</p>
                  <p className="font-bold text-[18px]" style={{ color: navy }}>
                    {docIdValid ? `Doctor ID: ${docId.toUpperCase()}` : `Doctor (+91 ${formatPhoneDisplay(docPhone)})`}
                  </p>
                </div>

                <div>
                  <p className="text-[12px] uppercase font-bold text-gray-500 tracking-wider mb-2">Access Expiry</p>
                  <p className="font-semibold text-[16px]" style={{ color: navy }}>
                    {EXPIRY_OPTIONS.find(o => o.id === expiry)?.label}
                    {expiry === "custom" && ` (${customDate})`}
                  </p>
                </div>

                <div>
                  <p className="text-[12px] uppercase font-bold text-gray-500 tracking-wider mb-2">Permissions</p>
                  <ul className="text-[15px] space-y-2 font-medium" style={{ color: navy }}>
                    <li className="flex items-center gap-2.5"><CheckCircle className="h-5 w-5 text-green-500 shrink-0" /> View {selectedRecords.length} selected records</li>
                    <li className="flex items-center gap-2.5 text-gray-600">
                      {allowAdd
                        ? <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                        : <X className="h-5 w-5 text-gray-400 shrink-0" />}
                      {allowAdd ? 'Append' : 'Cannot append'} new records to vault
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-yellow-50 text-yellow-800 rounded-[8px] border border-yellow-200">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="text-[14px] leading-snug font-medium">This will generate a temporary cryptographic key. You can revoke it anytime from your dashboard.</p>
              </div>

              <Button
                onClick={handleShare}
                disabled={sharing}
                className="w-full h-[52px] mt-8 text-white text-[16px] font-bold rounded-[8px] transition-all"
                style={{ background: accent }}
              >
                {sharing ? "Encrypting & Sharing…" : "Share Securely →"}
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
