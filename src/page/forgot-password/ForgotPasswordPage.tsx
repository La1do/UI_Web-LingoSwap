import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../context/I18nContext";
import PageShell from "../../layout/PageShell";
import EmailStep from "./component/EmailStep";
import OtpPasswordStep from "./component/OtpPasswordStep";

type Step = "email" | "otp" | "success";

export default function ForgotPasswordPage() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("success");
  const [email, setEmail] = useState("");

  return (
    <PageShell controlsPosition="top-right">
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: theme.background.page, fontFamily: "'DM Sans', sans-serif" }}
      >
        <div
          className="w-full max-w-md relative"
          style={{
            background: theme.background.card,
            borderRadius: "1.25rem",
            border: `1px solid ${theme.border.default}`,
            boxShadow: `${theme.shadow.card}, ${theme.shadow.glow}`,
            padding: "2.75rem 2.5rem",
          }}
        >
          {/* Top accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-2/3 rounded-full"
            style={{ background: `linear-gradient(90deg, transparent, ${theme.button.bg}, transparent)` }} />

          {step !== "success" && (
            <div className="mb-8">
              <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: theme.text.accent }}>
                {step === "email" ? t.forgotPassword.subtitle : email}
              </p>
              <h1 className="text-3xl font-semibold" style={{ color: theme.text.primary }}>
                {t.forgotPassword.title}
              </h1>
            </div>
          )}

          {/* Step indicator */}
          {step !== "success" && (
            <div className="flex gap-2 mb-6">
              {(["email", "otp"] as const).map((s, i) => (
                <div key={s} className="flex-1 h-1 rounded-full transition-all"
                  style={{ background: step === s || (step === "otp" && i === 0) ? theme.button.bg : theme.border.default }} />
              ))}
            </div>
          )}

          {/* Steps */}
          {step === "email" && (
            <EmailStep onSuccess={(e) => { setEmail(e); setStep("otp"); }} />
          )}

          {step === "otp" && (
            <OtpPasswordStep email={email} onSuccess={() => setStep("success")} />
          )}

          {step === "success" && (
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                style={{ background: `${theme.text.success}18`, border: `1px solid ${theme.text.success}` }}>
                ✓
              </div>
              <h2 className="text-2xl font-semibold" style={{ color: theme.text.primary }}>
                {t.forgotPassword.success}
              </h2>
              <p className="text-sm" style={{ color: theme.text.secondary }}>
                {t.forgotPassword.successDesc}
              </p>
              <button onClick={() => navigate("/")}
                className="mt-2 text-sm font-medium hover:opacity-80 transition-opacity"
                style={{ color: theme.text.accent }}>
                {t.forgotPassword.backToLogin}
              </button>
            </div>
          )}

          {/* Back link */}
          {step === "email" && (
            <p className="text-center text-sm mt-6" style={{ color: theme.text.secondary }}>
              <button onClick={() => navigate("/")} className="hover:opacity-80 transition-opacity"
                style={{ color: theme.text.accent }}>
                {t.forgotPassword.backToLogin}
              </button>
            </p>
          )}
        </div>
      </div>
    </PageShell>
  );
}
