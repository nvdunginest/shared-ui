import { useCallback, useEffect, useRef } from "react";
import { useDocumentKit } from "../../config";
import {
  DocumentChangeNotification,
  useSignalRContext,
} from "../../../signalr";
import { useModuleFeedback } from "@ptht365/shared-ui/module-contract";
import { UUID } from "crypto";

import { useDocumentContext } from "./index";

/**
 * 🔗 DocumentListenChanged Bridge Component
 *
 * This component acts as a bridge between SignalRContext and DocumentContext:
 * - Listens to DocumentChanged and Reconnected events from SignalRContext
 * - Fetches latest data from API and updates DocumentContext
 * - Implements smart timestamp comparison for efficient updates
 *
 * Key Responsibilities:
 * - Listen to DocumentChanged: Compare timestamps and update if newer
 * - Listen to Reconnected: Refresh current document after reconnection
 * - Fetch latest document data from API when needed
 * - Update DocumentContext with fresh data
 * - Provide clean separation between SignalR events and document state management
 *
 * Usage: Place this component inside DocumentProvider but outside specific document views
 */
export default function DocumentListenChanged(): JSX.Element {
  const { message } = useModuleFeedback();
  const { state, updateDocument } = useDocumentContext();
  const { onDocumentChanged, onReconnection } = useSignalRContext();
  const { detail } = useDocumentKit();
  const apiRef = useRef(detail.api);

  // Fetch and update document with latest data. The refresh is silent on success (the screen simply shows the new
  // data); only a failure is reported, once, with a stable key so repeated failures do not stack.
  const fetchAndUpdateDocument = useCallback(
    async (documentId: string) => {
      try {
        const latestDocument = await apiRef.current.getById(documentId as UUID);

        updateDocument(latestDocument);

        return latestDocument;
      } catch (error) {
        console.error(
          `[DocumentListenChanged] Failed to fetch document ${documentId}:`,
          error
        );
        message.open({
          key: "DOCUMENT_REFRESH_FAILED",
          type: "warning",
          content: "Chưa cập nhật được nội dung mới của tờ trình",
          duration: 3,
        });
        throw error;
      }
    },
    [updateDocument, message]
  );

  // 📡 Handle DocumentChanged events with timestamp comparison
  const handleDocumentChange = useCallback(
    async (notification: DocumentChangeNotification) => {
      // Only process if this is the currently viewed document
      if (!state.document || notification.documentId !== state.document.id) {
        return;
      }

      try {
        // 🕒 Compare timestamps to determine if update is needed
        const serverTime = new Date(notification.updatedTime);
        const currentDocumentTime = state.document.updatedTime
          ? new Date(state.document.updatedTime)
          : new Date(state.document.createdTime);

        // Only fetch if server version is newer
        if (serverTime > currentDocumentTime) {
          await fetchAndUpdateDocument(notification.documentId);
        }
      } catch (error) {
        console.error(
          "[DocumentListenChanged] Error handling DocumentChanged:",
          error
        );
      }
    },
    [state.document, fetchAndUpdateDocument]
  );

  // 🔗 Handle Reconnected events - always refresh current document
  const handleReconnection = useCallback(async () => {
    if (!state.document) {
      return;
    }

    try {
      await fetchAndUpdateDocument(state.document.id);
    } catch (error) {
      console.error(
        "[DocumentListenChanged] Error handling Reconnected:",
        error
      );
    }
  }, [state.document, fetchAndUpdateDocument]);

  // 🎧 Setup SignalR event listeners
  useEffect(() => {
    // Listen to DocumentChanged events
    const unsubscribeDocumentChanged = onDocumentChanged(handleDocumentChange);

    // Listen to Reconnected events
    const unsubscribeReconnection = onReconnection(handleReconnection);

    return () => {
      unsubscribeDocumentChanged();
      unsubscribeReconnection();
    };
  }, [
    onDocumentChanged,
    onReconnection,
    handleDocumentChange,
    handleReconnection,
  ]);

  // This is a bridge component - it doesn't render anything
  return <></>;
}
