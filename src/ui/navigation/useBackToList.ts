import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Route state set when a screen is opened from the document list (list item, "Tạo mới").
export const FROM_LIST_STATE = { fromList: true } as const;

type LocationState = { fromList?: boolean } | null;

// Back to the document list ("/"). When this screen was opened from the list, pop one history
// entry (the list entry, so the device Back button keeps behaving and no duplicate entry is
// pushed); on a deep link there is no list entry before it, so replace the current one.
export function useBackToList(): () => void {
  const navigate = useNavigate();
  const state = useLocation().state as LocationState;
  const fromList = state?.fromList === true;

  return useCallback(() => {
    if (fromList) navigate(-1);
    else navigate("/", { replace: true });
  }, [fromList, navigate]);
}
