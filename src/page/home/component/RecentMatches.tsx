import { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import { useApi } from "../../../hook/useApi";
import { userService } from "../../../services/user.service";

// ─── API response types ───────────────────────────────────────

interface ApiMatch {
  _id: string;
  status: string;
  durationSeconds: number;
  conversationId: string;
  partner: {
    _id: string;
    username?: string;
    profile: {
      fullName: string;
      avatar?: string;
      language?: string;
    };
  };
  rating?: 1 | 2 | 3 | 4 | 5;
  language?: string;
}

// ─── Internal display type ────────────────────────────────────

interface Match {
  id: string;
  partnerId: string;
  name: string;
  avatarUrl?: string;
  language?: string;
  duration: string;
  rating?: 1 | 2 | 3 | 4 | 5;
}

// ─── Helpers ─────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function mapApiMatch(m: ApiMatch): Match {
  return {
    id: m._id,
    partnerId: m.partner._id,
    name: m.partner.profile.fullName || m.partner.username || "Unknown",
    avatarUrl: m.partner.profile.avatar !== "default_avatar.png" ? m.partner.profile.avatar : undefined,
    language: m.language || m.partner.profile.language,
    duration: formatDuration(m.durationSeconds),
    rating: m.rating,
  };
}

// ─── Star rating ─────────────────────────────────────────────

function Stars({ rating }: { rating?: number }) {
  const { theme } = useTheme();
  if (!rating) return null;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className="w-3 h-3"
          fill={i <= rating ? theme.star : "none"}
          stroke={i <= rating ? theme.star : theme.starEmpty}
          strokeWidth={1.5}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────

interface RecentMatchesProps {
  onRematch?: (partnerId: string) => void;
  onViewProfile?: (partnerId: string) => void;
}

// ─── Main component ──────────────────────────────────────────

export default function RecentMatches({ onRematch, onViewProfile }: RecentMatchesProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { execute, isLoading } = useApi<ApiMatch[]>();
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    execute(userService.getMatchHistory()).then((data) => {
      if (data) setMatches(data.map(mapApiMatch));
    });
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold" style={{ color: theme.text.primary }}>
          Recent Matches
        </h2>
        {!isLoading && (
          <span className="text-xs" style={{ color: theme.text.placeholder }}>
            {matches.length} sessions
          </span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {isLoading ? (
          <p className="text-xs text-center py-6" style={{ color: theme.text.placeholder }}>
            {t.home.loading}
          </p>
        ) : matches.length === 0 ? (
          <p className="text-xs text-center py-6" style={{ color: theme.text.placeholder }}>
            No recent matches
          </p>
        ) : (
          matches.map((match) => (
            <div key={match.id}
              className="flex items-center gap-3 px-2 py-2.5 rounded-xl cursor-pointer group mb-1"
              onMouseEnter={(e) => (e.currentTarget.style.background = theme.background.input)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={() => onViewProfile?.(match.partnerId)}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                {match.avatarUrl ? (
                  <img src={match.avatarUrl} alt={match.name}
                    className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{ background: theme.button.bg, color: theme.button.text }}>
                    {match.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate" style={{ color: theme.text.primary }}>
                    {match.name}
                  </p>
                  <span className="text-[10px] shrink-0" style={{ color: theme.text.placeholder }}>
                    {match.duration}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {match.language && (
                    <span className="text-[11px]" style={{ color: theme.text.accent }}>
                      {match.language}
                    </span>
                  )}
                  <Stars rating={match.rating} />
                </div>
              </div>

              {/* Rematch button */}
              <button
                onClick={(e) => { e.stopPropagation(); onRematch?.(match.partnerId); }}
                className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-opacity shrink-0"
                style={{ background: theme.button.bg, color: theme.button.text }}
                aria-label={`Rematch with ${match.name}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
