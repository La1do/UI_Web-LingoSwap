import { useTheme } from "../../../context/ThemeContext";

// ─── Types ───────────────────────────────────────────────────

export interface Match {
  id: string;
  name: string;
  avatarUrl?: string;
  language: string;
  duration: string;    // e.g. "12 min"
  matchedAt: string;   // e.g. "Today", "Yesterday"
  rating?: 1 | 2 | 3 | 4 | 5;
}

interface RecentMatchesProps {
  matches?: Match[];
  onRematch?: (match: Match) => void;
  onViewProfile?: (match: Match) => void;
}

// ─── Mock data ───────────────────────────────────────────────

const MOCK_MATCHES: Match[] = [
  { id: "1", name: "Hana Sato",  language: "Vietnamese", duration: "18 min", matchedAt: "Today",     rating: 5 },
  { id: "2", name: "Carlos R.",  language: "English",    duration: "9 min",  matchedAt: "Today",     rating: 4 },
  { id: "3", name: "Emma Liu",   language: "French",     duration: "24 min", matchedAt: "Yesterday", rating: 5 },
  { id: "4", name: "Yuki T.",    language: "Korean",     duration: "6 min",  matchedAt: "Yesterday", rating: 3 },
  { id: "5", name: "Minh Anh",   language: "English",    duration: "31 min", matchedAt: "Mon",       rating: 4 },
];

// ─── Star rating ─────────────────────────────────────────────

function Stars({ rating }: { rating?: number }) {
  if (!rating) return null;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className="w-3 h-3"
          fill={i <= rating ? "#f59e0b" : "none"}
          stroke={i <= rating ? "#f59e0b" : "#9ca3af"}
          strokeWidth={1.5}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────

export default function RecentMatches({
  matches = MOCK_MATCHES,
  onRematch,
  onViewProfile,
}: RecentMatchesProps) {
  const { theme } = useTheme();

  // Group by date
  const grouped = matches.reduce<Record<string, Match[]>>((acc, match) => {
    if (!acc[match.matchedAt]) acc[match.matchedAt] = [];
    acc[match.matchedAt].push(match);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold" style={{ color: theme.text.primary }}>
          Recent Matches
        </h2>
        <span className="text-xs" style={{ color: theme.text.placeholder }}>
          {matches.length} sessions
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="mb-3">
            {/* Date label */}
            <p className="text-[10px] font-semibold uppercase tracking-wider px-2 mb-1"
              style={{ color: theme.text.placeholder }}>
              {date}
            </p>

            <div className="flex flex-col gap-1">
              {items.map((match) => (
                <div key={match.id}
                  className="flex items-center gap-3 px-2 py-2.5 rounded-xl cursor-pointer group"
                  onMouseEnter={(e) => (e.currentTarget.style.background = theme.background.input)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  onClick={() => onViewProfile?.(match)}
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
                      <span className="text-[11px]" style={{ color: theme.text.accent }}>
                        {match.language}
                      </span>
                      <Stars rating={match.rating} />
                    </div>
                  </div>

                  {/* Rematch button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onRematch?.(match); }}
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
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
