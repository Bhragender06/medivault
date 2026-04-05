import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, UploadCloud, Search, CheckCircle, XCircle, ChevronLeft,
  FileText, Calendar, AlignLeft, Phone, X, Lock,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/auth/AuthProvider";
import { sanitizePhone, formatPhoneDisplay, validatePhone } from "@/hooks/useFieldValidation";

const RECORD_TYPES = [
  "Lab Report", "Prescription", "X-Ray", "MRI Scan", "Blood Test",
  "Discharge Summary", "Vaccination", "ECG Report", "Pathology Report", "Other"
];

const accent = "#1DB88E";
const navy = "#0D1B2A";

export default function UploadRecord() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const role = localStorage.getItem("userRole");
  const isDoctor = role === "doctor";

  // State
  const [phoneRaw, setPhoneRaw] = useState("");
  const [patientFound, setPatientFound] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const [recordType, setRecordType] = useState("");
  const [recordDate, setRecordDate] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const { validity: phoneValidity, error: phoneError } = validatePhone(phoneRaw);
  const phoneValid = phoneValidity === "valid";

  // Handlers
  const handlePhoneSearch = () => {
    setPhoneTouched(true);
    if (!phoneValid) return;
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      if (phoneRaw === "9876543210") {
        setPatientFound("Rahul Mehta");
      } else {
        setPatientFound("Priya Patel");
      }
    }, 800);
  };

  const clearSearch = () => {
    setPatientFound(null);
    setPhoneRaw("");
    setPhoneTouched(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max 10MB allowed.", variant: "destructive" });
        return;
      }
      setFile(selected);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max 10MB allowed.", variant: "destructive" });
        return;
      }
      setFile(dropped);
    }
  };

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      const hash = `MV-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      setUploadSuccess(hash);
      toast({
        title: "Record permanently stored",
        description: `Hash: ${hash}`,
      });
    }, 1500);
  };

  const canUpload = file && recordType && recordDate && (!isDoctor || patientFound);

  if (uploadSuccess) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] p-4 sm:p-6 flex flex-col items-center justify-center">
        <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-[12px] text-center" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h2 className="text-[24px] font-bold mb-2" style={{ color: navy }}>Upload Successful</h2>
          <p className="text-[14px] text-gray-500 mb-6">The medical record has been permanently stored on the decentralized ledger.</p>

          <div className="bg-gray-50 border border-gray-200 p-4 rounded-[8px] mb-8">
            <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wider mb-1">Blockchain Hash ID</p>
            <p className="font-mono text-[14px] font-bold truncate select-all" style={{ color: navy }}>{uploadSuccess}</p>
          </div>

          <div className="flex flex-col-reverse md:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(isDoctor ? "/doctor-dashboard" : "/patient-dashboard")}
              className="w-full md:flex-1 h-[52px] rounded-[8px] text-[16px] font-semibold"
            >
              Back Home
            </Button>
            <Button
              onClick={() => {
                setUploadSuccess(null);
                setFile(null);
                setNotes("");
              }}
              className="w-full md:flex-1 h-[52px] rounded-[8px] text-[16px] font-semibold text-white transition-all"
              style={{ background: accent }}
            >
              Upload Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6F8] p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(isDoctor ? "/doctor-dashboard" : "/patient-dashboard")}
          className="flex items-center text-[14px] font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-[12px] p-5 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-[24px] sm:text-[28px] font-bold" style={{ color: navy }}>Upload Medical Record</h1>
              <p className="text-[14px] text-gray-500 mt-1">Securely add documents to the digital vault.</p>
            </div>
            <div className="p-3 rounded-[8px] hidden sm:block shrink-0" style={{ background: "rgba(29,184,142,0.1)" }}>
              <Shield className="h-6 w-6" style={{ color: accent }} />
            </div>
          </div>

          {/* DOCTOR: Patient Search Step */}
          {isDoctor && !patientFound && (
            <div className="mb-8 p-5 rounded-[8px] border-2 border-dashed border-gray-200 bg-gray-50">
              <h3 className="font-bold text-[16px] mb-1" style={{ color: navy }}>1. Find Patient</h3>
              <p className="text-[14px] text-gray-500 mb-4">Enter the patient's phone number to locate their vault.</p>

              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex gap-2 w-full md:flex-1">
                  <div
                    className="flex items-center justify-center gap-1.5 px-3 border rounded-[8px] text-[16px] font-semibold shrink-0 select-none bg-white h-[52px]"
                    style={{ borderColor: "#e5e7eb", color: navy }}
                  >
                    +91
                  </div>
                  <div className="relative flex-1">
                    <Input
                      type="tel"
                      inputMode="numeric"
                      value={formatPhoneDisplay(phoneRaw)}
                      onChange={(e) => setPhoneRaw(sanitizePhone(e.target.value))}
                      placeholder="98765 43210"
                      className="h-[52px] text-[16px] pl-4 pr-4"
                      style={{ borderRadius: "8px", borderColor: phoneTouched && !phoneValid ? "#ef4444" : "#e5e7eb" }}
                      maxLength={11}
                    />
                  </div>
                </div>
                <Button
                  onClick={handlePhoneSearch}
                  disabled={!phoneValid || searching}
                  className="w-full md:w-auto h-[52px] px-8 rounded-[8px] text-white text-[16px] font-semibold shrink-0"
                  style={{ background: phoneValid ? navy : "#d1d5db" }}
                >
                  {searching ? <div className="h-5 w-5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Search className="h-5 w-5 mr-2" />}
                  {!searching && "Search Blockchain"}
                </Button>
              </div>
              {phoneRaw.length > 0 && !phoneValid && (
                <p className="text-[14px] text-red-500 mt-2 flex items-center"><XCircle className="h-4 w-4 mr-1" /> {phoneError}</p>
              )}
            </div>
          )}

          {/* Patient Found Card */}
          {isDoctor && patientFound && (
            <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-[16px] text-green-900 leading-tight">{patientFound}</p>
                  <p className="text-[12px] text-green-700 font-medium mt-0.5">Verified Patient • +91 {formatPhoneDisplay(phoneRaw)}</p>
                </div>
              </div>
              <Button onClick={clearSearch} variant="outline" className="w-full sm:w-auto h-[44px] sm:h-8 text-[14px] sm:text-xs font-semibold text-green-700 bg-white border-green-200">
                Change Patient
              </Button>
            </div>
          )}

          {/* Upload Form */}
          {(!isDoctor || patientFound) && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-[14px]" style={{ color: navy }}>Record Type</Label>
                  <div className="relative mt-1.5">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Select value={recordType} onValueChange={setRecordType}>
                      <SelectTrigger className="pl-12 h-[52px] text-[16px]" style={{ borderRadius: "8px" }}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[240px]">
                        {RECORD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-[14px]" style={{ color: navy }}>Date of Record</Label>
                  <div className="relative mt-1.5">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="date"
                      value={recordDate}
                      onChange={e => setRecordDate(e.target.value)}
                      className="pl-12 h-[52px] text-[16px]"
                      style={{ borderRadius: "8px" }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-[14px]" style={{ color: navy }}>Additional Notes (Optional)</Label>
                <div className="relative mt-1.5">
                  <AlignLeft className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Enter any additional details about this record..."
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none resize-none transition-colors text-[16px]"
                    style={{ borderRadius: "8px", minHeight: "120px" }}
                  />
                </div>
              </div>

              <div>
                <Label className="text-[14px]" style={{ color: navy }}>File Upload (Max 10MB)</Label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="mt-1.5 border-2 border-dashed rounded-[12px] p-8 text-center transition-colors hover:bg-gray-50 cursor-pointer"
                  style={{ borderColor: file ? accent : "#e5e7eb", background: file ? "rgba(29,184,142,0.02)" : "" }}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <input type="file" id="file-upload" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />

                  {file ? (
                    <div className="flex flex-col items-center">
                      <FileText className="h-10 w-10 mb-3" style={{ color: accent }} />
                      <p className="font-bold text-[16px] text-gray-900">{file.name}</p>
                      <p className="text-[14px] text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="mt-4 text-[14px] text-red-500 hover:text-red-700 font-bold p-2 active:bg-red-50 rounded-[4px]">Remove File</button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-gray-500">
                      <UploadCloud className="h-12 w-12 mb-4 text-gray-400" />
                      <p className="font-bold text-[16px] text-gray-700">Tap or drag file to upload</p>
                      <p className="text-[14px] text-gray-400 mt-1">Supports PDF, JPG, PNG</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[14px] font-medium text-gray-500">
                  <Lock className="h-4 w-4 shrink-0" /> End-to-end encrypted
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={!canUpload || uploading}
                  className="w-full md:w-auto h-[52px] px-8 text-[16px] font-bold text-white transition-all rounded-[8px]"
                  style={{ background: canUpload ? accent : "#d1d5db" }}
                >
                  {uploading ? "Encrypting & Storing…" : isDoctor ? "Upload to Vault →" : "Upload to My Vault →"}
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
