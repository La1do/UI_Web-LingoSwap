import { Link, useNavigate } from "react-router-dom";
import PageShell from "../../layout/PageShell";
import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../context/I18nContext";

type PolicyVariant = "terms" | "privacy";

interface PolicyPageProps {
  variant: PolicyVariant;
}

export default function PolicyPage({ variant }: PolicyPageProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();
  const content = t.policy[variant];

  return (
    <PageShell controlsPosition="top-right">
      <main
        className="min-h-screen px-4 py-20 sm:px-6 lg:px-8"
        style={{
          background: theme.background.page,
          color: theme.text.primary,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
          @keyframes policyFadeUp {
            from { opacity: 0; transform: translateY(18px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .policy-reveal {
            animation: policyFadeUp 0.72s cubic-bezier(.16,1,.3,1) both;
          }
          .policy-reveal-2 { animation-delay: 0.08s; }
          .policy-reveal-3 { animation-delay: 0.16s; }
          .policy-action {
            transition: transform 0.28s cubic-bezier(.16,1,.3,1), opacity 0.28s ease, border-color 0.28s ease, background 0.28s ease;
          }
          .policy-action:hover {
            transform: translateY(-1px);
          }
        `}</style>

        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
          <div className="policy-reveal flex flex-col gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="policy-action w-fit rounded-full px-4 py-2 text-sm font-medium"
              style={{
                background: theme.background.card,
                border: `1px solid ${theme.border.default}`,
                color: theme.text.secondary,
              }}
            >
              {t.policy.back}
            </button>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: theme.text.accent }}>
                LingoSwap
              </p>
              <h1 className="text-3xl font-semibold sm:text-4xl" style={{ color: theme.text.primary }}>
                {content.title}
              </h1>
              <p className="max-w-2xl text-sm leading-6 sm:text-base" style={{ color: theme.text.secondary }}>
                {content.subtitle}
              </p>
              <p className="text-xs" style={{ color: theme.text.placeholder }}>
                {content.updated}
              </p>
            </div>
          </div>

          <section
            className="policy-reveal policy-reveal-2 overflow-hidden rounded-2xl"
            style={{
              background: theme.background.card,
              border: `1px solid ${theme.border.default}`,
              boxShadow: theme.shadow.card,
            }}
          >
            {content.sections.map((section, index) => (
              <article
                key={section.title}
                className="grid gap-3 px-5 py-5 sm:grid-cols-[minmax(0,0.36fr)_minmax(0,0.64fr)] sm:gap-6 sm:px-7"
                style={{
                  borderTop: index === 0 ? "none" : `1px solid ${theme.border.default}`,
                }}
              >
                <h2 className="text-base font-semibold" style={{ color: theme.text.primary }}>
                  {section.title}
                </h2>
                <p className="text-sm leading-7" style={{ color: theme.text.secondary }}>
                  {section.body}
                </p>
              </article>
            ))}
          </section>

          <div className="policy-reveal policy-reveal-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/register"
              className="policy-action inline-flex w-fit items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold"
              style={{
                background: theme.button.bg,
                color: theme.button.text,
              }}
            >
              {t.policy.backToRegister}
            </Link>
            <Link
              to={variant === "terms" ? "/privacy" : "/terms"}
              className="policy-action inline-flex w-fit items-center justify-center rounded-lg px-5 py-3 text-sm font-medium"
              style={{
                background: theme.background.input,
                border: `1px solid ${theme.border.default}`,
                color: theme.text.accent,
              }}
            >
              {variant === "terms" ? t.auth.privacyLink : t.auth.termsLink}
            </Link>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
