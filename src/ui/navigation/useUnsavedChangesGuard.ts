import { useCallback, useEffect, useRef } from "react";
import { type BlockerFunction, useBlocker } from "react-router-dom";
import { useModuleFeedback } from "@ptht365/shared-ui/module-contract";

const LEAVE_TITLE = "Rời khỏi trang này?";
const LEAVE_CONTENT = "Nội dung bạn đã soạn chưa được lưu. Nếu rời đi, các thay đổi sẽ bị mất.";

/**
 * Warns before the user loses unsaved work on a screen: closing or reloading the tab (browser
 * dialog) and any navigation inside this module, including the browser Back button (confirm
 * dialog). Needs a data router (createHashRouter in App.tsx).
 *
 * The page calls `markDirty()` when the user changes something and `markClean()` right before it
 * navigates away on purpose (after a successful save). Navigation of the shell itself (its menu,
 * header, side bar) is outside this module and is not covered.
 */
export function useUnsavedChangesGuard(): { markDirty: () => void; markClean: () => void } {
  const { modal } = useModuleFeedback();
  const dirtyRef = useRef(false);
  const markDirty = useCallback(() => {
    dirtyRef.current = true;
  }, []);
  const markClean = useCallback(() => {
    dirtyRef.current = false;
  }, []);

  const shouldBlock = useCallback<BlockerFunction>(
    ({ currentLocation, nextLocation }) =>
      dirtyRef.current && currentLocation.pathname !== nextLocation.pathname,
    [],
  );
  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    if (blocker.state !== "blocked") return;
    modal.confirm({
      title: LEAVE_TITLE,
      content: LEAVE_CONTENT,
      okText: "Rời đi",
      cancelText: "Ở lại",
      okButtonProps: { danger: true },
      onOk: () => blocker.proceed(),
      onCancel: () => blocker.reset(),
    });
    // blocker.state is the trigger; the blocker object changes identity on every router update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocker.state]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      // Required by some browsers to show the native dialog.
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  return { markDirty, markClean };
}
