import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { useModuleFeedback } from "@ptht365/shared-ui/module-contract";

import { useSignalRContext } from ".";

// The "connection lost" notice appears only if the realtime link stays down this long.
const OFFLINE_NOTICE_DELAY_MS = 5000;

/**
 * SignalR Connection Manager Component
 * - Handles SignalR connection lifecycle
 * - Shows connection status to user
 * - Manages reconnection logic
 * - Independent of DocumentContext
 */
export default function SignalRConnector(): JSX.Element {
  const { message } = useModuleFeedback();
  // The effect below runs once (its dependency list is intentionally empty), so it reads the feedback API through a ref.
  const messageRef = useRef(message);
  messageRef.current = message;
  const { state, connect, setConnectionState, onConnectionStateChanged } =
    useSignalRContext();

  // Use ref to track if connection has been attempted
  const connectionAttempted = useRef(false);

  // 🔌 Connection management
  useEffect(() => {
    let isActive = true;
    let retryTimeout: NodeJS.Timeout;
    let offlineTimer: ReturnType<typeof setTimeout> | undefined;

    // Start connection
    const startConnection = async () => {
      if (!isActive) return;

      try {
        const success = await connect();

        if (!isActive) return; // Component unmounted during connect

        if (!success) {
          console.warn("[SignalRConnector] Connection failed, will retry...");
          // Retry after delay if still active
          if (isActive) {
            retryTimeout = setTimeout(startConnection, 5000);
          }
        }
      } catch (error) {
        console.error("[SignalRConnector] Connection error:", error);
        // Retry after delay if still active
        if (isActive) {
          retryTimeout = setTimeout(startConnection, 5000);
        }
      }
    };

    // Only start if not already attempted and not connected
    if (
      !connectionAttempted.current &&
      state.connectionState === signalR.HubConnectionState.Disconnected
    ) {
      connectionAttempted.current = true;
      startConnection();
    }

    // Setup connection state listener
    const unsubscribeStateChanged = onConnectionStateChanged(
      (connectionState) => {
        // Update local state
        setConnectionState(connectionState);

        // Show user feedback only when the realtime link stays down: short drops and the initial connect are silent.
        const keyMessage = "SIGNALR_CONNECTION_STATUS";

        if (connectionState === signalR.HubConnectionState.Connected) {
          if (offlineTimer) {
            clearTimeout(offlineTimer);
            offlineTimer = undefined;
          }
          messageRef.current.destroy(keyMessage);
          return;
        }

        if (!offlineTimer) {
          offlineTimer = setTimeout(() => {
            offlineTimer = undefined;
            messageRef.current.open({
              key: keyMessage,
              type: "warning",
              content: "Mất kết nối cập nhật tức thời, đang thử kết nối lại…",
              duration: 0,
            });
          }, OFFLINE_NOTICE_DELAY_MS);
        }
      }
    );

    // Cleanup
    return () => {
      isActive = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      unsubscribeStateChanged();
      if (offlineTimer) {
        clearTimeout(offlineTimer);
      }
      messageRef.current.destroy("SIGNALR_CONNECTION_STATUS");
      // Reset connection attempt flag on cleanup
      connectionAttempted.current = false;
    };
  }, []); // Remove state.connectionState from dependencies

  return <></>;
}
