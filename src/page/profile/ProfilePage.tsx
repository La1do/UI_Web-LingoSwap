import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../context/I18nContext";
import PageShell from "../../layout/PageShell";
import ProfileCard from "./component/ProfileCard";
import ProfileForm from "./component/ProfileForm";
import SettingsForm from "./component/SettingsForm";
import ChangePasswordForm from "./component/ChangePasswordForm";

export default function ProfilePage() {
  const { theme } = useTheme();
  const { t, locale } = useI18n();
  const navigate = useNavigate();

  return (
    <PageShell controlsPosition="top-right">
      <div
        className="min-h-screen px-4 py-8"
        style={{ background: theme.background.page, fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="max-w-2xl mx-auto flex flex-col gap-6">

          {/* Back */}
          <button
            onClick={() => navigate("/home")}
            className="self-start text-sm hover:opacity-70 transition-opacity"
            style={{ color: theme.text.accent }}
          >
            {t.profile.backToHome}
          </button>

          {/* Page title */}
          <h1 className="text-2xl font-semibold" style={{ color: theme.text.primary }}>
            {t.profile.title}
          </h1>

          {/* Profile card — avatar + name + stats */}
          <ProfileCard />

          {/* Edit profile form */}
          <section
            className="rounded-2xl p-6 flex flex-col gap-5"
            style={{ background: theme.background.card, border: `1px solid ${theme.border.default}` }}
          >
            <h2 className="text-base font-semibold" style={{ color: theme.text.primary }}>
              {t.profile.editProfile}
            </h2>
            <ProfileForm />
          </section>

          {/* Settings */}
          <section
            className="rounded-2xl p-6 flex flex-col gap-5"
            style={{ background: theme.background.card, border: `1px solid ${theme.border.default}` }}
          >
            <h2 className="text-base font-semibold" style={{ color: theme.text.primary }}>
              {locale === "vi" ? "Cài đặt chung" : "General settings"}
            </h2>
            <SettingsForm />
          </section>

          {/* Change password */}
          <section
            className="rounded-2xl p-6 flex flex-col gap-5"
            style={{ background: theme.background.card, border: `1px solid ${theme.border.default}` }}
          >
            <h2 className="text-base font-semibold" style={{ color: theme.text.primary }}>
              {t.profile.changePassword}
            </h2>
            <ChangePasswordForm />
          </section>

        </div>
      </div>
    </PageShell>
  );
}
