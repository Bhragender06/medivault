// Shared field-validation helpers for phone and email

export const EMAIL_REGEX = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const INSTITUTIONAL_DOMAINS = [
  "@aiims.in",
  "@hospital.in",
  "@medanta.org",
  "@apollohospitals.com",
  "@fortishealthcare.com",
  "@manipalhospitals.com",
  "@narayanahealth.org",
];

// ── Phone ──────────────────────────────────────────────────────────────────

/** Strip everything except digits from the raw input */
export function sanitizePhone(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 10);
}

/** Format 10-digit string as "XXXXX XXXXX" */
export function formatPhoneDisplay(digits: string): string {
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

/** Storage format: "+91" + 10 digits, no spaces */
export function phoneToE164(digits: string): string {
  return `+91${digits}`;
}

export type PhoneValidity = "empty" | "valid" | "invalid";

export function validatePhone(digits: string): { validity: PhoneValidity; error: string } {
  if (!digits) return { validity: "empty", error: "" };
  if (digits.length < 10) return { validity: "invalid", error: "Phone must be 10 digits, starting with 6–9" };
  if (!/^[6-9]/.test(digits)) return { validity: "invalid", error: "Phone must start with 6, 7, 8, or 9" };
  return { validity: "valid", error: "" };
}

// ── Email ───────────────────────────────────────────────────────────────────

export type EmailValidity = "empty" | "valid" | "invalid";

export function validateEmail(
  email: string,
  role: "doctor" | "patient" | string
): { validity: EmailValidity; error: string; institutionalWarning: string } {
  if (!email.trim())
    return { validity: "empty", error: "", institutionalWarning: "" };

  if (!EMAIL_REGEX.test(email))
    return {
      validity: "invalid",
      error: "Enter a valid email (e.g., name@domain.com)",
      institutionalWarning: "",
    };

  // Doctor institutional domain warning (non-blocking)
  if (role === "doctor") {
    const isInstitutional = INSTITUTIONAL_DOMAINS.some((d) =>
      email.toLowerCase().endsWith(d)
    );
    if (!isInstitutional) {
      return {
        validity: "valid",
        error: "",
        institutionalWarning:
          "⚠️ This doesn't look like an institutional email. Make sure you're using your official hospital email.",
      };
    }
  }

  return { validity: "valid", error: "", institutionalWarning: "" };
}

// ── Password ────────────────────────────────────────────────────────────────

export function validatePassword(pwd: string): { valid: boolean; error: string } {
  if (!pwd) return { valid: false, error: "" };
  if (pwd.length < 8) return { valid: false, error: "Password must be at least 8 characters" };
  return { valid: true, error: "" };
}
