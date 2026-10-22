import { useCallback, useEffect, useRef } from "react";
import {
  useSignalRContext,
  WaitingCountChangedNotification,
} from "../../../signalr";
import { UUID } from "crypto";

import { useDocumentKit } from "../../config";

import { useGlobalContext } from "./GlobalProvider";

// Debounce window để tránh spam API khi nhiều event WaitingCountChanged dồn dập
// (ví dụ nhiều hồ sơ được duyệt/chuyển liên tiếp trong thời gian ngắn).
const DEBOUNCE_MS = 800;

/**
 * 🔗 WaitingCountsListenChanged Bridge Component
 *
 * Bridge giữa SignalRContext và GlobalContext cho badge "Chưa xử lý":
 * - Lắng nghe event WaitingCountChanged (server bắn khi 1 hồ sơ thay đổi trạng thái
 *   làm ảnh hưởng tới waiting count của 1 công ty)
 * - Chỉ refetch nếu companyId trong notification nằm trong danh sách companies hiện tại
 * - Debounce nhẹ để tránh gọi API dồn dập khi nhiều event tới liên tiếp
 *
 * Usage: Mount bên trong SignalRProvider (cần useSignalRContext) và bên trong
 * GlobalProvider (cần useGlobalContext) — xem App.tsx.
 */
export default function WaitingCountsListenChanged(): JSX.Element {
  const { globalState, setWaitingCounts } = useGlobalContext();
  const { onWaitingCountChanged } = useSignalRContext();
  const { getWaitingCounts } = useDocumentKit();
  const getWaitingCountsRef = useRef(getWaitingCounts);

  const globalStateRef = useRef(globalState);
  globalStateRef.current = globalState;

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshWaitingCounts = useCallback(async () => {
    const { companies } = globalStateRef.current;

    if (companies.length === 0) {
      return;
    }

    try {
      const counts = await getWaitingCountsRef.current(companies.map((c) => c.id as UUID));
      setWaitingCounts(counts);
    } catch (error) {
      console.error(
        "[WaitingCountsListenChanged] Failed to refresh waiting counts:",
        error,
      );
    }
  }, [setWaitingCounts]);

  const handleWaitingCountChanged = useCallback(
    (notification: WaitingCountChangedNotification) => {
      const { companies } = globalStateRef.current;
      const isRelevant = companies.some(
        (c) => c.id === notification.companyId,
      );

      if (!isRelevant) {
        return;
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        refreshWaitingCounts();
      }, DEBOUNCE_MS);
    },
    [refreshWaitingCounts],
  );

  useEffect(() => {
    const unsubscribe = onWaitingCountChanged(handleWaitingCountChanged);

    return () => {
      unsubscribe();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [onWaitingCountChanged, handleWaitingCountChanged]);

  // This is a bridge component - it doesn't render anything
  return <></>;
}
