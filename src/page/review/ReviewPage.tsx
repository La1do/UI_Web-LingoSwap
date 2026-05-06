import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useI18n } from "../../context/I18nContext";
import { useApi } from "../../hook/useApi";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/user.service";
import type { MeResponse } from "../../context/AuthContext";
import StreakCelebration from "./component/StreakCelebration";
import ReportModal from "./component/ReportModal";

// ─── Types ───────────────────────────────────────────────────
interface PublicProfile {
  _id: string;
  email: string;
  profile: { fullName: string; avatar: string };
  role: string;
}

// ─── Star Rating ─────────────────────────────────────────────
function StarRating({ value, onChange, size = "lg" }: {
  value: number; onChange: (v: number) => void; size?: "sm" | "lg";
}) {
  const { theme } = useTheme();
  const [hovered, setHovered] = useState(0);
  const dim = size === "lg" ? "w-10 h-10" : "w-6 h-6";
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)}
          className={`${dim} transition-transform hover:scale-110`} aria-label={`${i} star`}>
          <svg viewBox="0 0 24 24" className="w-full h-full"
            fill={(hovered || value) >= i ? theme.star : "none"}
            stroke={(hovered || value) >= i ? theme.star : theme.starEmpty} strokeWidth={1.5}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

// ─── Partner Card ─────────────────────────────────────────────
function PartnerCard({ partner, onAddFriend, onReport }: {
  partner: PublicProfile | null;
  onAddFriend: () => void;
  onReport: () => void;
}) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { execute: sendRequest, isLoading: sending } = useApi();
  const { execute: checkStatus } = useApi<{ status: string; friendshipId: string | null }>();
  const [sent, setSent] = useState(false);
  const [friendStatus, setFriendStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!partner) return;
    checkStatus(userService.checkFriendStatus(partner._id)).then((res) => {
      if (res) setFriendStatus(res.status);
    });
  }, [partner?._id]);

  if (!partner) return null;

  const avatarUrl = partner.profile.avatar !== "default_avatar.png" ? partner.profile.avatar : undefined;

  const handleAdd = async () => {
    const result = await sendRequest(userService.sendFriendRequest(partner._id));
    if (result !== null) {
      setSent(true);
      onAddFriend();
    }
  };

  const showAddButton = !sent && friendStatus === "none";

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl"
      style={{ background: theme.background.input, border: `1px solid ${theme.border.default}` }}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={partner.profile.fullName}
          className="w-14 h-14 rounded-full object-cover shrink-0"
          style={{ border: `2px solid ${theme.button.bg}` }} />
      ) : (
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
          style={{ background: theme.button.bg, color: theme.button.text }}>
          {partner.profile.fullName.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate" style={{ color: theme.text.primary }}>
          {partner.profile.fullName}
        </p>
        <p className="text-xs truncate" style={{ color: theme.text.placeholder }}>
          {partner.email}
        </p>
      </div>
      {showAddButton && (
        <button
          onClick={handleAdd}
          disabled={sending}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ background: theme.button.bg, color: theme.button.text }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          {sending ? "..." : t.home.sendRequest}
        </button>
      )}
      {/* Report button */}
      <button
        onClick={onReport}
        className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity shrink-0"
        style={{ background: `${theme.text.error}15`, color: theme.text.error }}
        title={t.report.button}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
      </button>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function ReviewPage() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { execute: fetchProfile } = useApi<PublicProfile>();
  const { execute: submitReview, isLoading: submitting } = useApi();
  const { execute: fetchMe } = useApi<MeResponse>();
  const { setUserFromMe } = useAuth();

  const sessionId = searchParams.get("session");
  const partnerId = searchParams.get("partner");
  const duration = searchParams.get("duration") ?? "0";

  const [partner, setPartner] = useState<PublicProfile | null>(null);
  const [overallRating, setOverallRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [newStreak, setNewStreak] = useState<number | null>(null);
  const [newCalendar, setNewCalendar] = useState<Record<string, number> | null>(null);
  const [showReport, setShowReport] = useState(false);

  // Fetch partner profile
  useEffect(() => {
    if (!partnerId) return;
    fetchProfile(userService.getPublicProfile(partnerId)).then((data) => {
      if (data) setPartner(data);
    });
  }, [partnerId]);

  const handleSubmit = async () => {
    if (!sessionId || overallRating === 0) return;
    setSubmitError("");
    const result = await submitReview(userService.reviewMatch(sessionId, {
      rating: overallRating,
      comment: comment.trim() || undefined,
    }));
    if (result !== null) {
      const me = await fetchMe(userService.getMe());
      if (me) {
        setUserFromMe(me);
        setNewStreak(me.stats?.streak ?? 0);
        setNewCalendar(me.stats?.learningCalendar ?? {});
      }
      setSubmitted(true);
    } else {
      setSubmitError(t.review.errorSubmit);
    }
  };

  const handleSkip = async () => {
    const me = await fetchMe(userService.getMe());
    if (me) {
      setUserFromMe(me);
      const streak = me.stats?.streak ?? 0;
      if (streak > 0) {
        setNewStreak(streak);
        setNewCalendar(me.stats?.learningCalendar ?? {});
        setSubmitted(true);
        return;
      }
    }
    navigate("/home");
  };

  const formatDuration = () => {
    const secs = Number(duration);
    return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  };

  // ─── Show streak celebration ──────────────────────────────
  if (submitted) {
    if (newStreak !== null && newStreak > 0) {
      return (
        <StreakCelebration
          streak={newStreak}
          calendar={newCalendar ?? undefined}
          onContinue={() => navigate("/home")}
        />
      );
    }
    // Streak = 0 → success screen thường
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: theme.background.page, fontFamily: "'DM Sans', sans-serif" }}>
        <div className="flex flex-col items-center gap-5 text-center max-w-sm">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
            style={{ background: `${theme.text.success}18`, border: `2px solid ${theme.text.success}` }}>
            ✓
          </div>
          <h2 className="text-2xl font-semibold" style={{ color: theme.text.primary }}>{t.review.successTitle}</h2>
          <p className="text-sm" style={{ color: theme.text.secondary }}>{t.review.successDesc}</p>
          <button onClick={() => navigate("/home")}
            className="mt-2 px-8 py-3 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ background: theme.button.bg, color: theme.button.text }}>
            {t.review.backHome}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: theme.background.page, fontFamily: "'DM Sans', sans-serif" }}>
      <div className="w-full max-w-lg rounded-2xl p-8 flex flex-col gap-6"
        style={{ background: theme.background.card, border: `1px solid ${theme.border.default}`, boxShadow: theme.shadow.card }}>

        {/* Header */}
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-2xl font-semibold" style={{ color: theme.text.primary }}>{t.review.title}</h1>
          <p className="text-sm" style={{ color: theme.text.secondary }}>{t.review.subtitle}</p>
          {Number(duration) > 0 && (
            <span className="text-xs mt-1 px-3 py-1 rounded-full self-center"
              style={{ background: theme.background.input, color: theme.text.placeholder }}>
              ⏱ {formatDuration()}
            </span>
          )}
        </div>

        {/* Partner card */}
        <PartnerCard partner={partner} onAddFriend={() => {}} onReport={() => setShowReport(true)} />

        <div className="h-px w-full" style={{ background: theme.border.default }} />

        {/* Overall rating */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>{t.review.overallLabel}</p>
          <StarRating value={overallRating} onChange={setOverallRating} />
        </div>

        <div className="h-px w-full" style={{ background: theme.border.default }} />

        {/* Comment */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium" style={{ color: theme.text.secondary }}>{t.review.commentLabel}</p>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder={t.review.commentPlaceholder} rows={3}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
            style={{ background: theme.background.input, color: theme.text.primary, border: `1px solid ${theme.border.default}` }}
            onFocus={(e) => (e.target.style.borderColor = theme.border.focused)}
            onBlur={(e) => (e.target.style.borderColor = theme.border.default)} />
        </div>

        {/* Error */}
        {submitError && (
          <p className="text-xs text-center" style={{ color: theme.text.error }}>{submitError}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={handleSkip}
            className="flex-1 py-3 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ background: theme.background.input, color: theme.text.secondary, border: `1px solid ${theme.border.default}` }}>
            {t.review.skip}
          </button>
          <button onClick={handleSubmit} disabled={overallRating === 0 || submitting}
            className="flex-1 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: theme.button.bg, color: theme.button.text }}>
            {submitting ? "..." : t.review.submit}
          </button>
        </div>
      </div>
    </div>

    {/* Report modal */}
    {showReport && partner && (
      <ReportModal
        reportedUserId={partner._id}
        reportedUserName={partner.profile.fullName}
        matchSessionId={sessionId}
        onClose={() => setShowReport(false)}
      />
    )}
    </>
  );
}
