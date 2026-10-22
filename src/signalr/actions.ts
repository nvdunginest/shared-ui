import { Dispatch } from "react";
import * as signalR from "@microsoft/signalr";

import {
  INCREMENT_RECONNECT_ATTEMPTS,
  RESET_RECONNECT_ATTEMPTS,
  SET_CONNECTED,
  SET_CONNECTION_STATE,
  SignalRActions,
} from "./constants";
import GlobalDocumentNotificationConnector, {
  DocumentChangeNotification,
  WaitingCountChangedNotification,
} from "./signalr.connector";

// The singleton connector, created on first use: the hub URL is set by configureDocumentHub() at app start,
// which runs after this module is evaluated.
const getConnector = GlobalDocumentNotificationConnector;

// � Debounce mechanism to prevent rapid connect calls
let isConnecting = false;

// �🔌 Connection management actions
async function connect(dispatch: Dispatch<SignalRActions>): Promise<boolean> {
  // Prevent multiple simultaneous connect attempts
  if (isConnecting) {
    return getConnector().isConnected();
  }

  try {
    isConnecting = true;
    dispatch({ type: INCREMENT_RECONNECT_ATTEMPTS });

    const success = await getConnector().start();

    if (success) {
      dispatch({
        type: SET_CONNECTION_STATE,
        payload: { connectionState: signalR.HubConnectionState.Connected },
      });
      dispatch({ type: RESET_RECONNECT_ATTEMPTS });
      return true;
    } else {
      dispatch({
        type: SET_CONNECTION_STATE,
        payload: { connectionState: signalR.HubConnectionState.Disconnected },
      });
      console.error("[SignalRContext] Connection failed");
      return false;
    }
  } catch (error) {
    dispatch({
      type: SET_CONNECTION_STATE,
      payload: { connectionState: signalR.HubConnectionState.Disconnected },
    });
    console.error("[SignalRContext] Connection error:", error);
    return false;
  } finally {
    isConnecting = false;
  }
}

async function disconnect(dispatch: Dispatch<SignalRActions>): Promise<void> {
  try {
    await getConnector().stop();
    dispatch({
      type: SET_CONNECTION_STATE,
      payload: { connectionState: signalR.HubConnectionState.Disconnected },
    });
  } catch (error) {
    console.error("[SignalRContext] Disconnect error:", error);
  }
}

async function ping(): Promise<void> {
  try {
    await getConnector().ping();
  } catch (error) {
    console.error("[SignalRContext] Ping failed:", error);
  }
}

// 🔄 State management actions
function setConnectionState(
  state: signalR.HubConnectionState,
  dispatch: Dispatch<SignalRActions>
) {
  dispatch({
    type: SET_CONNECTION_STATE,
    payload: { connectionState: state },
  });
}

function setConnected(connected: boolean, dispatch: Dispatch<SignalRActions>) {
  dispatch({
    type: SET_CONNECTED,
    payload: { connected },
  });
}

function incrementReconnectAttempts(dispatch: Dispatch<SignalRActions>) {
  dispatch({ type: INCREMENT_RECONNECT_ATTEMPTS });
}

function resetReconnectAttempts(dispatch: Dispatch<SignalRActions>) {
  dispatch({ type: RESET_RECONNECT_ATTEMPTS });
}

// 🎧 Event subscription actions (these return unsubscribe functions)
function onDocumentChanged(
  handler: (notification: DocumentChangeNotification) => void
) {
  return getConnector().onDocumentChanged(handler);
}

function onWaitingCountChanged(
  handler: (notification: WaitingCountChangedNotification) => void
) {
  return getConnector().onWaitingCountChanged(handler);
}

function onReconnection(handler: () => Promise<void>) {
  return getConnector().onReconnection(handler);
}

function onConnectionStateChanged(
  handler: (state: signalR.HubConnectionState) => void
) {
  return getConnector().onConnectionStateChanged(handler);
}

// Export actions object
const signalRActions = {
  connect,
  disconnect,
  ping,
  setConnectionState,
  setConnected,
  incrementReconnectAttempts,
  resetReconnectAttempts,
  onDocumentChanged,
  onWaitingCountChanged,
  onReconnection,
  onConnectionStateChanged,
};

export default signalRActions;
