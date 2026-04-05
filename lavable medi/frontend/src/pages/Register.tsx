import { useState } from "react";
import {
  Shield, Mail, Lock, User, ArrowRight, Eye, EyeOff,
  Stethoscope, Building2, MapPin, Calendar, Droplets,
  ChevronRight, CheckCircle, XCircle, Phone, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/auth/AuthProvider";
import {
  sanitizePhone, formatPhoneDisplay, phoneToE164, validatePhone,
  validateEmail, validatePassword
} from "@/hooks/useFieldValidation";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman & Nicobar Islands","Chandigarh","Dadra & Nagar Haveli","Daman & Diu",
  "Delhi","Jammu & Kashmir","Ladakh","Lakshadweep","Puducherry",
];
const SPECIALIZATIONS = [
  "General Physician","Cardiologist","Neurologist","Orthopedic","Dermatologist",
  "Pediatrician","Gynecologist","Psychiatrist","Ophthalmologist","ENT Specialist",
  "Other"
];
const BLOOD_GROUPS = ["A+","A-","B+","B-","O+","O-","AB+","AB-","Unknown"];
const GENDERS      = ["Male","Female","Other","Prefer not to say"];

const accent = "#1DB88E";
const navy   = "#0D1B2A";

type FieldValidity = "empty" | "valid" | "invalid";

function FieldIcon({ state }: { state: FieldValidity }) {
  if (state === "valid")   return <CheckCircle className="h-4 w-4 shrink-0" style={{ color: accent }} />;
  if (state === "invalid") return <XCircle className="h-4 w-4 shrink-0 text-red-500" />;
  return null;
}

function fieldBorderColor(validity: FieldValidity, touched: boolean) {
  if (!touched || validity === "empty") return "#e5e7eb";
  return validity === "valid" ? accent : "#ef4444";
}

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = useAuth();

  const [role, setRole]   = useState<"doctor" | "patient">("doctor");
  const [step, setStep]   = useState(1);
  const [loading, setLoading] = useState(false);

  // Password visibility
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Field values ──────────────────────────────────
  const [fullName,    setFullName]    = useState("");
  const [phoneRaw,    setPhoneRaw]    = useState("");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [confirmPwd,  setConfirmPwd]  = useState("");
  const [city,        setCity]        = useState("");
  const [state,       setState]       = useState("");
  // Doctor specific
  const [license,     setLicense]     = useState("");
  const [specialization, setSpec]     = useState("");
  const [hospital,    setHospital]    = useState("");
  // Patient specific
  const [dob,         setDob]         = useState("");
  const [gender,      setGender]      = useState("");
  const [bloodGroup,  setBloodGroup]  = useState("");
  const [emergName,   setEmergName]   = useState("");
  const [emergPhone,  setEmergPhone]  = useState("");

  // ── Touched state ─────────────────────────────────
  const [fullNameTouched, setFullNameTouched] = useState(false);
  const [phoneTouched,    setPhoneTouched]    = useState(false);
  const [emailTouched,    setEmailTouched]    = useState(false);
  const [pwdTouched,      setPwdTouched]      = useState(false);
  const [confirmTouched,  setConfirmTouched]  = useState(false);
  const [emergPhoneTouched, setEmergPhoneTouched] = useState(false);

  const isDoctor = role === "doctor";

  // ── Derived validation ────────────────────────────
  const { validity: phoneValidity, error: phoneError } = validatePhone(phoneRaw);
  const { validity: emailValidity, error: emailError, institutionalWarning } = validateEmail(email, role);
  const { valid: pwdValid, error: pwdError } = validatePassword(password);
  const confirmValid = confirmPwd === password && pwdValid;
  const { validity: emergPhoneValidity, error: emergPhoneError } = validatePhone(emergPhone);

  const isEmailValidOrEmpty = email.trim() === "" || emailValidity === "valid";
  const isEmergPhoneValidOrEmpty = emergPhone.trim() === "" || emergPhoneValidity === "valid";

  const step1Valid =
    fullName.trim().length >= 2 &&
    phoneValidity === "valid" &&
    isEmailValidOrEmpty &&
    (isDoctor
      ? license.trim().length > 0 && specialization !== ""
      : dob !== "" && gender !== "");

  const step2Valid =
    city.trim().length > 0 &&
    state !== "" &&
    pwdValid && confirmValid &&
    (isDoctor
      ? hospital.trim().length > 0
      : bloodGroup !== "" && isEmergPhoneValidOrEmpty);

  const pwdStrength = password.length === 0 ? 0 : Math.min(4, Math.floor(password.length / 3));
  const pwdStrengthLabel = ["", "Weak", "Fair", "Good", "Strong"][pwdStrength];
  const pwdStrengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", accent][pwdStrength];

  // ── Handlers ──────────────────────────────────────
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => setPhoneRaw(sanitizePhone(e.target.value));
  const handleEmergPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmergPhone(sanitizePhone(e.target.value));

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setFullNameTouched(true);
    setPhoneTouched(true);
    setEmailTouched(true);
    if (!step1Valid) return;
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdTouched(true);
    setConfirmTouched(true);
    if (!step2Valid) return;

    setLoading(true);
    try {
      await auth.register({
        email,
        password,
        full_name: fullName,
        phone: phoneToE164(phoneRaw),
        role,
      });
      localStorage.setItem("userRole", role);
      localStorage.setItem("userPhone", phoneRaw);
      localStorage.setItem("userName", fullName);
      toast({ title: "Registered successfully!", description: "Welcome to MediVault." });
      navigate(role === "doctor" ? "/doctor-dashboard" : "/patient-dashboard");
    } catch {
      toast({ title: "Registration failed", description: "Please check your details.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F5F6F8]">
      {/* ── Left branding ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12 bg-gradient-to-br from-[#0D1B2A] to-[#1a2f47]">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 rounded-[12px] flex items-center justify-center bg-[#1DB88E]/20">
              <Shield className="h-5 w-5" style={{ color: accent }} />
            </div>
            <div>
              <p className="font-bold text-white">MediVault</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">Immutable Medical Dossier</p>
            </div>
          </div>
          <h1 className="text-[32px] font-bold text-white mb-4 leading-snug">
            Join the decentralized<br />health network.
          </h1>
          <p className="text-white/50 text-[14px] leading-relaxed mb-8">
            Create your digital identity on the blockchain. Your data integrity starts here.
          </p>
          <div className="space-y-4">
            {["End-to-end encrypted records","Tamper-proof audit trail","Instant cross-hospital access"].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 bg-[#1DB88E]/20">
                  <ChevronRight className="h-3 w-3" style={{ color: accent }} />
                </div>
                <span className="text-[14px] text-white/70">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form area ────────────────────────────── */}
      <div className="flex-1 flex items-start sm:items-center justify-center p-4 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-[800px] bg-white rounded-[12px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 sm:p-8 mt-4 sm:mt-0">
          
          {/* Mobile Logo Header */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Shield className="h-8 w-8" style={{ color: accent }} />
            <span className="font-bold text-[20px]" style={{ color: navy }}>MediVault</span>
          </div>
          
          {/* Role selector Top Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {(["doctor","patient"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  if (step === 1) {
                    setRole(r);
                    setPhoneTouched(false);
                    setEmailTouched(false);
                  }
                }}
                disabled={step > 1}
                className="flex items-center justify-center gap-2 h-[52px] rounded-[8px] border-2 text-[16px] font-medium transition-all capitalize disabled:opacity-50"
                style={
                  role === r
                    ? { borderColor: accent, background: "rgba(29,184,142,0.06)", color: navy }
                    : { borderColor: "#e5e7eb", color: "#6b7280", cursor: step > 1 ? "not-allowed" : "pointer" }
                }
              >
                {r === "doctor" ? <Stethoscope className="h-5 w-5" /> : <User className="h-5 w-5" />}
                {r === "doctor" ? "Doctor" : "Patient"}
              </button>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[14px] font-bold uppercase tracking-wider" style={{ color: navy }}>Step {step} of 2</span>
              <span className="text-[14px] text-gray-500 font-medium">{step === 1 ? "Basic Info" : "Final Details"}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${step * 50}%`, background: accent }}
              />
            </div>
          </div>

          <h2 className="text-[24px] sm:text-[28px] font-bold mb-1" style={{ color: navy }}>
            {step === 1 ? "Create Account" : "Final Details"}
          </h2>
          <p className="text-gray-500 text-[14px] mb-8">Register your identity on the ledger.</p>

          {/* ════════════ STEP 1 ════════════ */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Full name */}
                <div>
                  <Label className="text-[14px]" style={{ color: navy }}>Full Name</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onBlur={() => setFullNameTouched(true)}
                      placeholder={isDoctor ? "Dr. Priya Sharma" : "Rahul Mehta"}
                      className="pl-11 h-[52px] text-[16px]"
                      style={{
                        borderRadius: "8px",
                        borderColor: fieldBorderColor(fullName.trim().length >= 2 ? "valid" : fullName.length === 0 ? "empty" : "invalid", fullNameTouched)
                      }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2">
                      {fullNameTouched && <FieldIcon state={fullName.trim().length >= 2 ? "valid" : "invalid"} />}
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <Label className="text-[14px]" style={{ color: navy }}>Phone Number <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2 mt-1.5">
                    <div
                      className="flex items-center justify-center gap-1.5 px-3 border rounded-[8px] text-[16px] font-semibold shrink-0 select-none bg-gray-50"
                      style={{ borderColor: "#e5e7eb", color: navy, minWidth: "72px", height: "52px" }}
                    >
                      <Phone className="h-4 w-4 text-gray-400" />+91
                    </div>
                    <div className="relative flex-1">
                      <Input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={formatPhoneDisplay(phoneRaw)}
                        onChange={handlePhoneChange}
                        onBlur={() => setPhoneTouched(true)}
                        placeholder="98765 43210"
                        maxLength={11}
                        className="h-[52px] text-[16px] pr-10"
                        style={{
                          borderRadius: "8px",
                          borderColor: fieldBorderColor(phoneValidity, phoneTouched),
                        }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {phoneTouched && <FieldIcon state={phoneValidity} />}
                      </span>
                    </div>
                  </div>
                  {phoneTouched && phoneValidity === "invalid" && (
                    <p className="text-[14px] text-red-500 mt-1 flex items-center gap-1">
                      <XCircle className="h-4 w-4" /> {phoneError}
                    </p>
                  )}
                </div>

                {/* Email (Optional) */}
                <div>
                  <Label className="text-[14px]" style={{ color: navy }}>Email (optional)</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setEmailTouched(true)}
                      placeholder={isDoctor ? "dr.priya@hospital.in" : "rahul@gmail.com"}
                      className="pl-11 pr-10 h-[52px] text-[16px]"
                      style={{
                        borderRadius: "8px",
                        borderColor: fieldBorderColor(email === "" ? "empty" : emailValidity, emailTouched),
                      }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2">
                      {emailTouched && email !== "" && <FieldIcon state={emailValidity} />}
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-500 mt-1.5">
                    You can login with just your phone number
                  </p>
                  {emailTouched && emailValidity === "invalid" && email !== "" && (
                    <p className="text-[14px] text-red-500 mt-1 flex items-center gap-1"><XCircle className="h-4 w-4" /> {emailError}</p>
                  )}
                </div>

                {/* Doctor specific */}
                {isDoctor && (
                  <>
                    <div>
                      <Label className="text-[14px]" style={{ color: navy }}>Medical License Number <span className="text-red-500">*</span></Label>
                      <div className="relative mt-1.5">
                        <Activity className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          required value={license} onChange={(e) => setLicense(e.target.value)}
                          placeholder="MH-2024-XXXXX" className="pl-11 h-[52px] text-[16px]" style={{ borderRadius: "8px" }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Patient specific */}
                {!isDoctor && (
                  <>
                    <div>
                      <Label className="text-[14px]" style={{ color: navy }}>Date of Birth <span className="text-red-500">*</span></Label>
                      <div className="relative mt-1.5">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input required type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                          className="pl-11 h-[52px] text-[16px]" style={{ borderRadius: "8px" }} />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Spanning full width drop down */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isDoctor && (
                   <div>
                     <Label className="text-[14px]" style={{ color: navy }}>Clinical Specialization <span className="text-red-500">*</span></Label>
                     <Select value={specialization} onValueChange={setSpec}>
                       <SelectTrigger className="mt-1.5 h-[52px] text-[16px]" style={{ borderRadius: "8px" }}>
                         <SelectValue placeholder="Select Specialization" />
                       </SelectTrigger>
                       <SelectContent>{SPECIALIZATIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                     </Select>
                   </div>
                )}
                {!isDoctor && (
                   <div>
                     <Label className="text-[14px]" style={{ color: navy }}>Gender <span className="text-red-500">*</span></Label>
                     <Select value={gender} onValueChange={setGender}>
                       <SelectTrigger className="mt-1.5 h-[52px] text-[16px]" style={{ borderRadius: "8px" }}>
                         <SelectValue placeholder="Select gender" />
                       </SelectTrigger>
                       <SelectContent>{GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                     </Select>
                   </div>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={!step1Valid}
                  className="w-full md:w-[280px] h-[52px] text-[16px] font-semibold text-white transition-all"
                  style={{
                    background: step1Valid ? navy : "#d1d5db",
                    borderRadius: "8px",
                  }}
                >
                  Continue <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </form>
          )}

          {/* ════════════ STEP 2 ════════════ */}
          {step === 2 && (
            <form onSubmit={handleRegister} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {isDoctor && (
                  <div className="md:col-span-2">
                    <Label className="text-[14px]" style={{ color: navy }}>Hospital or Clinic Name <span className="text-red-500">*</span></Label>
                    <div className="relative mt-1.5">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        required value={hospital} onChange={(e) => setHospital(e.target.value)}
                        placeholder="City Care Clinic" className="pl-11 h-[52px] text-[16px]" style={{ borderRadius: "8px" }}
                      />
                    </div>
                  </div>
                )}

                {!isDoctor && (
                  <div>
                    <Label className="text-[14px]" style={{ color: navy }}>Blood Group <span className="text-red-500">*</span></Label>
                    <Select value={bloodGroup} onValueChange={setBloodGroup}>
                      <SelectTrigger className="mt-1.5 h-[52px] text-[16px]" style={{ borderRadius: "8px" }}>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        {BLOOD_GROUPS.map((b) => (
                          <SelectItem key={b} value={b}>
                            <span className="flex items-center gap-1.5">
                              <Droplets className="h-4 w-4 text-red-500" />{b}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* City + State */}
                <div>
                  <Label className="text-[14px]" style={{ color: navy }}>City <span className="text-red-500">*</span></Label>
                  <div className="relative mt-1.5">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input required value={city} onChange={(e) => setCity(e.target.value)}
                      placeholder={isDoctor ? "Mumbai" : "Delhi"} className="pl-11 h-[52px] text-[16px]" style={{ borderRadius: "8px" }} />
                  </div>
                </div>
                
                <div>
                  <Label className="text-[14px]" style={{ color: navy }}>State <span className="text-red-500">*</span></Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger className="mt-1.5 h-[52px] text-[16px]" style={{ borderRadius: "8px" }}>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {!isDoctor && (
                  <>
                    <div>
                        <Label className="text-[14px]" style={{ color: navy }}>Emergency Contact Name</Label>
                        <div className="relative mt-1.5">
                            <Input value={emergName} onChange={(e) => setEmergName(e.target.value)}
                            placeholder="Suresh Mehta" className="h-[52px] text-[16px]" style={{ borderRadius: "8px" }} />
                        </div>
                    </div>
                    <div>
                      <Label className="text-[14px]" style={{ color: navy }}>Emergency Phone</Label>
                      <div className="flex gap-2 mt-1.5">
                        <div
                          className="flex items-center justify-center gap-1.5 px-3 border rounded-[8px] text-[16px] font-semibold shrink-0 select-none bg-gray-50 h-[52px]"
                          style={{ borderColor: "#e5e7eb", color: navy }}
                        >
                          +91
                        </div>
                        <div className="relative flex-1">
                          <Input
                            type="tel"
                            inputMode="numeric"
                            value={formatPhoneDisplay(emergPhone)}
                            onChange={handleEmergPhoneChange}
                            onBlur={() => setEmergPhoneTouched(true)}
                            placeholder="98765 43210"
                            maxLength={11}
                            className="h-[52px] text-[16px] pr-10"
                            style={{
                              borderRadius: "8px",
                              borderColor: fieldBorderColor(emergPhone === "" ? "empty" : emergPhoneValidity, emergPhoneTouched),
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Password / Security Key */}
                <div>
                  <Label className="text-[14px]" style={{ color: navy }}>
                    {isDoctor ? "Create Security Key" : "Create Password"} <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setPwdTouched(true)}
                      placeholder="Min 8 characters"
                      className="pl-11 pr-12 h-[52px] text-[16px]"
                      style={{
                        borderRadius: "8px",
                        borderColor: fieldBorderColor(
                          password ? (pwdValid ? "valid" : "invalid") : "empty",
                          pwdTouched
                        ),
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-2"
                    >
                      {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1.5">
                        {[1,2,3,4].map((n) => (
                          <div
                            key={n}
                            className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{ background: pwdStrength >= n ? pwdStrengthColor : "#e5e7eb" }}
                          />
                        ))}
                      </div>
                      <p className="text-[12px] font-medium" style={{ color: pwdStrengthColor }}>{pwdStrengthLabel}</p>
                    </div>
                  )}
                  {pwdTouched && password && !pwdValid && (
                    <p className="text-[14px] text-red-500 mt-1 flex items-center gap-1">
                      <XCircle className="h-4 w-4" /> {pwdError}
                    </p>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <Label className="text-[14px]" style={{ color: navy }}>
                    Confirm {isDoctor ? "Security Key" : "Password"} <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPwd}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                      onBlur={() => setConfirmTouched(true)}
                      placeholder="Re-enter to confirm"
                      className="pl-11 pr-12 h-[52px] text-[16px]"
                      style={{
                        borderRadius: "8px",
                        borderColor: fieldBorderColor(
                          confirmPwd ? (confirmValid ? "valid" : "invalid") : "empty",
                          confirmTouched
                        ),
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-2"
                    >
                      {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {confirmTouched && confirmPwd && !confirmValid && (
                    <p className="text-[14px] text-red-500 mt-1 flex items-center gap-1">
                      <XCircle className="h-4 w-4" /> {isDoctor ? "Security keys do not match" : "Passwords do not match"}
                    </p>
                  )}
                  {confirmTouched && confirmValid && (
                    <p className="text-[14px] mt-1 flex items-center gap-1" style={{ color: accent }}>
                      <CheckCircle className="h-4 w-4" /> Match confirmed
                    </p>
                  )}
                </div>

              </div>

              <div className="flex flex-col-reverse md:flex-row gap-4 pt-6 mt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-full md:w-[140px] h-[52px] text-[16px] font-semibold"
                  style={{ borderRadius: "8px" }}
                >
                  ← Back
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !step2Valid}
                  className="w-full md:flex-1 h-[52px] text-[16px] font-bold text-white transition-all"
                  style={{
                    background: step2Valid ? accent : "#d1d5db",
                    borderRadius: "8px",
                    cursor: step2Valid ? "pointer" : "not-allowed"
                  }}
                >
                  {loading ? "Registering…" : "Register on Ledger →"}
                </Button>
              </div>
            </form>
          )}

          <p className="text-center text-[14px] text-gray-500 mt-8">
            Already have an account?{" "}
            <button onClick={() => navigate("/login")} className="font-bold hover:underline transition-colors" style={{ color: accent }}>
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
