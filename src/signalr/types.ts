import * as signalR from "@microsoft/signalr";

// 📡 SignalR notification interface — định nghĩa gốc tại signalr.connector.ts,
// import + re-export tại đây để tránh khai báo trùng lặp lệch nhau.
import type {
  DocumentChangeNotification,
  WaitingCountChangedNotification,
} from "./signalr.connector";

export type { DocumentChangeNotification, WaitingCountChangedNotification };

// 🔄 SignalR connection state
export type SignalRState = {
  connectionState: signalR.HubConnectionState;
  connected: boolean;
  lastConnectedTime: Date | null;
  reconnectAttempts: number;
};

export const initialSignalRState: SignalRState = {
  connectionState: signalR.HubConnectionState.Disconnected,
  connected: false,
  lastConnectedTime: null,
  reconnectAttempts: 0,
};

// 🛠️ SignalR store interface
export type SignalRStore = {
  state: SignalRState;

  // Connection management
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  ping: () => Promise<void>;

  // State management
  setConnectionState: (state: signalR.HubConnectionState) => void;
  setConnected: (connected: boolean) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;

  // Event subscriptions
  onDocumentChanged: (
    handler: (notification: DocumentChangeNotification) => void
  ) => () => void;
  onWaitingCountChanged: (
    handler: (notification: WaitingCountChangedNotification) => void
  ) => () => void;
  onReconnection: (handler: () => Promise<void>) => () => void;
  onConnectionStateChanged: (
    handler: (state: signalR.HubConnectionState) => void
  ) => () => void;
};

export const defaultSignalRStore: SignalRStore = {
  state: initialSignalRState,
  connect: async () => false,
  disconnect: async () => {},
  ping: async () => {},
  setConnectionState: () => {},
  setConnected: () => {},
  incrementReconnectAttempts: () => {},
  resetReconnectAttempts: () => {},
  onDocumentChanged: () => () => {},
  onWaitingCountChanged: () => () => {},
  onReconnection: () => () => {},
  onConnectionStateChanged: () => () => {},
};
