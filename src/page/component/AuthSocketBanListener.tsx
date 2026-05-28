import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../context/I18nContext";
import { socketService } from "../../services/socket.service";
import BannedAccountModal from "./BannedAccountModal";

export default function AuthSocketBanListener() {
  const { user, clearSession } = useAuth();
  const { t } = useI18n();
  const [banMessage, setBanMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const handleBanned = () => {
      setBanMessage(t.auth.accountBannedRealtime);
    };

    socketService.connect();
    return socketService.onBanned(handleBanned);
  }, [t.auth.accountBannedRealtime, user]);

  const handleConfirm = () => {
    clearSession();
    window.location.href = "/login";
  };

  if (!banMessage) return null;

  return (
    <BannedAccountModal
      message={banMessage}
      onConfirm={handleConfirm}
    />
  );
}
