import { useEffect, useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../context/I18nContext";
import type { BlacklistKeyword, BlacklistKeywordCreator } from "../../../services/admin.service";

interface BlacklistKeywordListProps {
  keywords: BlacklistKeyword[];
  total: number;
  page: number;
  limit: number;
  search: string;
  onSearchChange: (search: string) => void;
  onPageChange: (page: number) => void;
  onAdd: (keyword: string) => Promise<boolean>;
  onDelete: (keyword: BlacklistKeyword) => Promise<boolean>;
  isAdding: boolean;
  deletingId: string | null;
}

function isCreatorObject(createdBy: BlacklistKeyword["createdBy"]): createdBy is BlacklistKeywordCreator {
  return typeof createdBy === "object" && createdBy !== null;
}

export default function BlacklistKeywordList({
  keywords,
  total,
  page,
  limit,
  search,
  onSearchChange,
  onPageChange,
  onAdd,
  onDelete,
  isAdding,
  deletingId,
}: BlacklistKeywordListProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [draftSearch, setDraftSearch] = useState(search);
  const [draftKeyword, setDraftKeyword] = useState("");
  const [inputError, setInputError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<BlacklistKeyword | null>(null);

  useEffect(() => {
    setDraftSearch(search);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  const creatorName = (keyword: BlacklistKeyword) => {
    if (!isCreatorObject(keyword.createdBy)) return keyword.createdBy || t.admin.blacklistKeywords.unknownCreator;
    return keyword.createdBy.profile?.fullName || keyword.createdBy.email || t.admin.blacklistKeywords.unknownCreator;
  };

  const creatorEmail = (keyword: BlacklistKeyword) => {
    if (!isCreatorObject(keyword.createdBy)) return t.admin.blacklistKeywords.emptyValue;
    return keyword.createdBy.email || t.admin.blacklistKeywords.emptyValue;
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchChange(draftSearch.trim());
  };

  const handleAddSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = draftKeyword.trim();

    if (!keyword) {
      setInputError(t.admin.blacklistKeywords.emptyKeyword);
      return;
    }

    setInputError("");
    const ok = await onAdd(keyword);
    if (ok) setDraftKeyword("");
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-start lg:justify-between">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full lg:max-w-md">
            <input
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              placeholder={t.admin.blacklistKeywords.searchPlaceholder}
              className="flex-1 rounded-xl px-4 py-2 text-sm outline-none"
              style={{
                background: theme.background.input,
                color: theme.text.primary,
                border: `1px solid ${theme.border.default}`,
              }}
              onFocus={(e) => (e.target.style.borderColor = theme.border.focused)}
              onBlur={(e) => (e.target.style.borderColor = theme.border.default)}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ background: theme.button.bg, color: theme.button.text }}
            >
              {t.admin.blacklistKeywords.search}
            </button>
          </form>

          <form onSubmit={handleAddSubmit} className="flex flex-col gap-1 w-full lg:max-w-md">
            <div className="flex gap-2">
              <input
                value={draftKeyword}
                onChange={(e) => {
                  setDraftKeyword(e.target.value);
                  if (inputError) setInputError("");
                }}
                placeholder={t.admin.blacklistKeywords.addPlaceholder}
                className="flex-1 rounded-xl px-4 py-2 text-sm outline-none"
                style={{
                  background: theme.background.input,
                  color: theme.text.primary,
                  border: `1px solid ${inputError ? theme.border.error : theme.border.default}`,
                }}
                onFocus={(e) => (e.target.style.borderColor = theme.border.focused)}
                onBlur={(e) => (e.target.style.borderColor = inputError ? theme.border.error : theme.border.default)}
              />
              <button
                type="submit"
                disabled={isAdding}
                className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: theme.text.success, color: theme.button.text }}
              >
                {isAdding ? t.admin.processing : t.admin.blacklistKeywords.add}
              </button>
            </div>
            {inputError && (
              <p className="text-xs" style={{ color: theme.text.error }}>
                {inputError}
              </p>
            )}
          </form>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium" style={{ color: theme.text.secondary }}>
            {t.admin.blacklistKeywords.total.replace("{n}", String(total))}
          </p>
          <p className="text-xs" style={{ color: theme.text.placeholder }}>
            {t.admin.blacklistKeywords.pageInfo
              .replace("{page}", String(page))
              .replace("{total}", String(totalPages))}
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${theme.border.default}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: theme.background.input }}>
                {[
                  t.admin.blacklistKeywords.keyword,
                  t.admin.blacklistKeywords.createdBy,
                  t.admin.blacklistKeywords.email,
                  t.admin.blacklistKeywords.status,
                  t.admin.blacklistKeywords.createdAt,
                  t.admin.blacklistKeywords.actions,
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: theme.text.placeholder }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keywords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs" style={{ color: theme.text.placeholder }}>
                    {t.admin.blacklistKeywords.noKeywords}
                  </td>
                </tr>
              ) : (
                keywords.map((keyword, index) => (
                  <tr
                    key={keyword._id}
                    style={{ background: index % 2 === 0 ? theme.background.card : theme.background.page }}
                  >
                    <td className="px-4 py-3">
                      <span className="font-semibold" style={{ color: theme.text.primary }}>
                        {keyword.keyword}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: theme.text.secondary }}>
                        {creatorName(keyword)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: theme.text.placeholder }}>
                        {creatorEmail(keyword)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          background: keyword.isActive ? `${theme.text.success}20` : theme.background.input,
                          color: keyword.isActive ? theme.text.success : theme.text.placeholder,
                        }}
                      >
                        {keyword.isActive ? t.admin.blacklistKeywords.active : t.admin.blacklistKeywords.inactive}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: theme.text.placeholder }}>
                        {new Date(keyword.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setConfirmDelete(keyword)}
                        disabled={deletingId !== null}
                        className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: `${theme.text.error}18`, color: theme.text.error }}
                      >
                        {deletingId === keyword._id ? t.admin.processing : t.admin.blacklistKeywords.delete}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={!canGoPrevious}
            className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: theme.background.input,
              color: theme.text.secondary,
              border: `1px solid ${theme.border.default}`,
            }}
          >
            {t.admin.blacklistKeywords.previous}
          </button>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={!canGoNext}
            className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: theme.background.input,
              color: theme.text.secondary,
              border: `1px solid ${theme.border.default}`,
            }}
          >
            {t.admin.blacklistKeywords.next}
          </button>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: theme.overlay.default }}>
          <div
            className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: theme.background.card, border: `1px solid ${theme.border.default}` }}
          >
            <h3 className="text-base font-semibold" style={{ color: theme.text.primary }}>
              {t.admin.blacklistKeywords.deleteTitle}
            </h3>
            <p className="text-sm" style={{ color: theme.text.secondary }}>
              {t.admin.blacklistKeywords.deleteDescription.replace("{keyword}", confirmDelete.keyword)}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                disabled={deletingId !== null}
                className="flex-1 py-2 rounded-xl text-sm font-medium hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: theme.background.input, color: theme.text.secondary }}
              >
                {t.admin.blacklistKeywords.cancel}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const ok = await onDelete(confirmDelete);
                  if (ok) setConfirmDelete(null);
                }}
                disabled={deletingId !== null}
                className="flex-1 py-2 rounded-xl text-sm font-semibold hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: theme.text.error, color: theme.button.text }}
              >
                {deletingId === confirmDelete._id ? t.admin.processing : t.admin.blacklistKeywords.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
