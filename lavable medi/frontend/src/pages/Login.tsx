import { useState, useRef, useEffect } from "react";
import {
  Shield, Mail, Lock, User, Stethoscope, CheckCircle, XCircle, Phone, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/auth/AuthProvider";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  sanitizePhone, formatPhoneDisplay, validatePhone,
  validateEmail, validatePassword
} from "@/hooks/useFieldValidation";

// All 28 States and 8 UTs of India
const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
  "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh",
  "Maharashtra", " मणिपुर (Manipur)", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const accent = "#1DB88E";
const navy   = "#0D1B2A";

type FieldState = "empty" | "valid" | "invalid";

function FieldIcon({ state }: { state: FieldState }) {
  if (state === "valid")   return <CheckCircle className="h-4 w-4 shrink-0" style={{ color: accent }} />;
  if (state === "invalid") return <XCircle className="h-4 w-4 shrink-0 text-red-500" />;
  return null;
}

export default function Login() {
  const navigate = useNavigate();
  const { toast }  = useToast();
  const auth = useAuth();

  const [mainStep, setMainStep] = useState<"selection" | "auth">("selection");
  const [selectedState, setSelectedState] = useState("");
  
  const [role, setRole] = useState<"doctor" | "patient">("doctor");
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [loading, setLoading] = useState(false);

  // --- Phone State --------------------------------------------------------
  const [phoneRaw, setPhoneRaw] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [otpStep, setOtpStep] = useState<"enter_phone" | "verify_otp">("enter_phone");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpTimer, setOtpTimer] = useState(30);
  const [otpExpiry, setOtpExpiry] = useState(300);
  const [expectedOtp, setExpectedOtp] = useState("123456");

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- Email State --------------------------------------------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // --- Validation ---------------------------------------------------------
  const isDoctor = role === "doctor";
  const { validity: phoneValidity } = validatePhone(phoneRaw);
  const { validity: emailValidity, error: emailError } = validateEmail(email, role);
  const { valid: pwdValid } = validatePassword(password);
  
  const phoneValid = phoneValidity === "valid";
  const emailFormValid = emailValidity === "valid" && pwdValid;

  // --- Handlers: Phone ----------------------------------------------------
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (otpStep === "verify_otp") {
      timerId = setInterval(() => {
        setOtpTimer((prev) => Math.max(0, prev - 1));
        setOtpExpiry((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [otpStep]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneRaw(sanitizePhone(e.target.value));
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneTouched(true);
    if (!phoneValid) return;

    setOtpStep("verify_otp");
    setOtp(["", "", "", "", "", ""]);
    setOtpAttempts(0);
    setOtpTimer(30);
    setOtpExpiry(300);
    
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setExpectedOtp(generated);

    toast({
      title: "OTP Sent!",
      description: `Demo OTP: ${generated} for +91 ${formatPhoneDisplay(phoneRaw)}`,
      duration: 10000,
    });

    setTimeout(() => {
      otpRefs.current[0]?.focus();
    }, 100);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      verifyOtp(pasted);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(d => d !== "")) {
      verifyOtp(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = (code: string) => {
    if (otpExpiry === 0) {
      toast({ title: "OTP Expired", description: "Please request a new OTP.", variant: "destructive" });
      return;
    }
    if (otpAttempts >= 3) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (code === expectedOtp) {
        toast({ title: "OTP Verified!", description: "Successfully logged in." });
        localStorage.setItem("userRole", role);
        localStorage.setItem("userPhone", phoneRaw);
        
        if (role === "doctor") navigate("/doctor-dashboard");
        else navigate("/patient-dashboard");
        
      } else {
        const newAttempts = otpAttempts + 1;
        setOtpAttempts(newAttempts);
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
        
        if (newAttempts >= 3) {
          toast({ title: "Too many attempts", description: "Try again in 10 minutes.", variant: "destructive" });
        } else {
          toast({ title: "Invalid OTP", description: `You have ${3 - newAttempts} attempts left.`, variant: "destructive" });
        }
      }
    }, 800);
  };

  const handleResendOtp = () => {
    if (otpTimer > 0) return;
    setOtpTimer(30);
    setOtpExpiry(300);
    setOtpAttempts(0);
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setExpectedOtp(generated);
    toast({ title: "OTP Resent", description: `Demo OTP: ${generated}` });
  };

  // --- Handlers: Email ----------------------------------------------------
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    if (!emailFormValid) return;

    setLoading(true);
    try {
      await auth.login(email, password);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userPhone", phoneRaw);
      toast({ title: "Login successful" });
      navigate(role === "doctor" ? "/doctor-dashboard" : "/patient-dashboard");
    } catch {
      toast({ title: "Login failed", description: "Check your credentials.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fieldBorder = (validity: FieldState, touched: boolean) => {
    if (!touched || validity === "empty") return "#e5e7eb";
    return validity === "valid" ? accent : "#ef4444";
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen flex bg-[#F5F6F8]">
      {/* Desktop Branding (Hidden on mobile/tablet) */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 bg-gradient-to-br from-[#0D1B2A] to-[#1a2f47]">
        <div>
          <div className="flex items-center gap-2 mb-16">
            <Shield className="h-6 w-6" style={{ color: accent }} />
            <span className="text-xl font-bold text-white">MediVault</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-6">
            Your Health,<br /><span style={{ color: accent }}>Immutably</span><br />Secured.
          </h1>
          <p className="text-white/50 text-sm max-w-sm leading-relaxed">
            The next generation of clinical data integrity.
          </p>
        </div>
      </div>

      {/* Right form container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-full md:max-w-[480px] bg-white p-5 sm:p-8 rounded-[12px] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Shield className="h-8 w-8" style={{ color: accent }} />
            <span className="font-bold text-xl" style={{ color: navy }}>MediVault</span>
          </div>

          {/* STEP 1: SELECTION */}
          {mainStep === "selection" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-[24px] font-bold mb-1" style={{ color: navy }}>Select Portal</h2>
              <p className="text-muted-foreground text-[14px] mb-6">Choose your role and region to continue.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {(["doctor", "patient"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className="flex items-center justify-center gap-2 h-[52px] rounded-[8px] border-2 text-[16px] font-medium transition-all capitalize"
                    style={
                      role === r
                        ? { borderColor: accent, background: "rgba(29,184,142,0.06)", color: navy }
                        : { borderColor: "#e5e7eb", color: "#6b7280" }
                    }
                  >
                    {r === "doctor" ? <Stethoscope className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    {r === "doctor" ? "Doctor" : "Patient"}
                  </button>
                ))}
              </div>

              <div>
                <Label className="text-[14px] mb-1.5 block" style={{ color: navy }}>Select Region (State/UT)</Label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="w-full h-[52px] rounded-[8px] text-[16px]">
                    <SelectValue placeholder="Search or select your state..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => {
                    localStorage.setItem("userState", selectedState);
                    setMainStep("auth");
                  }}
                  disabled={!role || !selectedState}
                  className="w-full h-[52px] text-[16px] font-semibold text-white transition-all shadow-lg shadow-[#1DB88E]/20"
                  style={{
                    background: (!role || !selectedState) ? "#d1d5db" : accent,
                    borderRadius: "8px",
                  }}
                >
                  Proceed to Authenticate →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: AUTHENTICATION */}
          {mainStep === "auth" && (
            <div className="animate-in fade-in slide-in-from-right-2">
              <div className="mb-6">
                <button
                  onClick={() => setMainStep("selection")}
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-navy transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              </div>
              <h2 className="text-[24px] font-bold mb-1" style={{ color: navy }}>Welcome Back</h2>
              <p className="text-muted-foreground text-[14px] mb-6">Access your immutable medical dashboard.</p>

              {/* Login Method Tabs */}
              {otpStep === "enter_phone" && (
                <div className="flex bg-gray-100 rounded-[8px] p-1 mb-6">
                  <button
                    onClick={() => setLoginMethod("phone")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 h-10 rounded-[6px] text-[14px] font-medium transition-all",
                      loginMethod === "phone" ? "bg-white text-navy shadow-sm" : "text-gray-500 hover:text-navy"
                    )}
                  >
                    <Phone className="h-4 w-4" /> Phone
                  </button>
                  <button
                    onClick={() => setLoginMethod("email")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 h-10 rounded-[6px] text-[14px] font-medium transition-all",
                      loginMethod === "email" ? "bg-white text-navy shadow-sm" : "text-gray-500 hover:text-navy"
                    )}
                  >
                    <Mail className="h-4 w-4" /> Email
                  </button>
                </div>
              )}

          {/* PHONE LOGIN */}
          {loginMethod === "phone" && (
            <>
              {otpStep === "enter_phone" && (
                <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
                  <div>
                    <Label className="text-[14px]" style={{ color: navy }}>Enter your mobile number</Label>
                    <div className="flex gap-2 mt-1.5">
                      <div className="flex items-center gap-1.5 px-3 border rounded-[8px] text-[16px] font-semibold shrink-0 select-none bg-[#f9fafb] border-[#e5e7eb] h-[52px]" style={{ color: navy }}>
                        <Phone className="h-4 w-4 text-gray-400" /> +91
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
                          className="h-[52px] text-[16px] pl-4 pr-10"
                          style={{
                            borderRadius: "8px",
                            borderColor: fieldBorder(phoneValidity, phoneTouched),
                          }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                          {phoneTouched && <FieldIcon state={phoneValidity} />}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {phoneTouched && phoneValidity === "invalid" && (
                      <p className="text-[14px] text-red-500 mt-1 flex items-center gap-1">
                        <XCircle className="h-4 w-4" /> Enter valid 10-digit Indian mobile number
                      </p>
                  )}
                  
                  <div className="pt-2 flex justify-center">
                      <Button
                        type="submit"
                        disabled={!phoneValid || loading}
                        className="w-full md:w-[300px] h-[52px] text-[16px] font-semibold text-white transition-all mt-4"
                        style={{
                          background: phoneValid ? accent : "#d1d5db",
                          borderRadius: "8px",
                        }}
                      >
                        Send OTP →
                      </Button>
                  </div>

                  <div className="text-center mt-6">
                    <button
                      type="button"
                      onClick={() => setLoginMethod("email")}
                      className="text-[14px] text-gray-500 hover:text-gray-800 underline underline-offset-4 transition-colors"
                    >
                      Login with Email instead
                    </button>
                  </div>
                </form>
              )}

              {otpStep === "verify_otp" && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold text-[18px]" style={{ color: navy }}>Verification Code</h3>
                    <p className="text-[14px] text-gray-500">
                      OTP sent to <span className="font-bold" style={{ color: navy }}>+91 XXXXX {phoneRaw.slice(-5)}</span>
                    </p>
                  </div>

                  {/* Row of 6 inputs - scaled for mobile to prevent wrapping */}
                  <div className="flex flex-row justify-center gap-2 sm:gap-3 mx-auto" onPaste={handlePaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        ref={(el) => (otpRefs.current[i] = el)}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-[42px] h-[52px] sm:w-[56px] sm:h-[56px] text-center text-[20px] font-bold border-2 rounded-[8px] focus:outline-none focus:ring-2 bg-white"
                        style={{ borderColor: navy, color: navy, outlineColor: accent }}
                        disabled={otpAttempts >= 3 || loading || otpExpiry === 0}
                      />
                    ))}
                  </div>

                  <div className="text-center space-y-4 pt-2">
                    <p className="text-[14px] text-gray-500">
                      Expires in: <span className="font-bold font-mono text-[14px]">{formatTime(otpExpiry)}</span>
                    </p>

                    <div>
                      {otpTimer > 0 ? (
                        <p className="text-[14px] text-gray-400">Resend OTP in {otpTimer}s</p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={otpAttempts >= 3}
                          className="text-[16px] font-semibold transition-colors"
                          style={{ color: otpAttempts >= 3 ? "#d1d5db" : accent }}
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>

                    {otpAttempts >= 3 && (
                      <p className="text-[14px] font-semibold text-red-500 bg-red-50 py-3 px-4 rounded-[8px] border border-red-100">
                        Too many attempts. Try again in 10 minutes.
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setOtpStep("enter_phone");
                      setOtp(["", "", "", "", "", ""]);
                      setOtpAttempts(0);
                    }}
                    className="w-full text-gray-500 h-[52px] text-[16px]"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" /> Change number
                  </Button>
                </div>
              )}
            </>
          )}

          {/* EMAIL LOGIN */}
          {loginMethod === "email" && (
            <form onSubmit={handleEmailLogin} className="space-y-4" noValidate>
              <div>
                <Label className="text-[14px]" style={{ color: navy }}>{isDoctor ? "Institutional Email" : "Personal Email"}</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder={isDoctor ? "dr.sharma@aiims.in" : "rahul.mehta@gmail.com"}
                    className="h-[52px] text-[16px] pl-[44px] pr-[44px]"
                    style={{ borderRadius: "8px", borderColor: fieldBorder(emailValidity, emailTouched) }}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2">
                    {emailTouched && <FieldIcon state={emailValidity} />}
                  </span>
                </div>
                {emailTouched && emailValidity === "invalid" && (
                  <p className="text-[14px] text-red-500 mt-1 flex items-center gap-1"><XCircle className="h-4 w-4" /> Enter valid email</p>
                )}
              </div>

              <div>
                <Label className="text-[14px]" style={{ color: navy }}>{isDoctor ? "Security Key" : "Password"}</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setPasswordTouched(true)}
                    placeholder={isDoctor ? "Enter your NPI security key" : "Enter your password"}
                    className="h-[52px] text-[16px] pl-[44px]"
                    style={{
                      borderRadius: "8px",
                      borderColor: fieldBorder(password ? (pwdValid ? "valid" : "invalid") : "empty", passwordTouched),
                    }}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                  <Button
                    type="submit"
                    disabled={!emailFormValid || loading}
                    className="w-full md:w-[300px] h-[52px] text-[16px] font-semibold text-white transition-all"
                    style={{
                      background: emailFormValid ? `linear-gradient(135deg, ${navy}, #1a2f47)` : "#d1d5db",
                      borderRadius: "8px",
                    }}
                  >
                    {loading ? "Authenticating…" : "Authenticate Access →"}
                  </Button>
              </div>

              <div className="text-center mt-6">
                {/* Removed Back to phone login text link in favor of tabs */}
              </div>
            </form>
          )}

          </div>
        )}

        </div>
      </div>
    </div>
  );
}
