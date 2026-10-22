// Light entry (bundled into each app): SignalR document hub connector, provider and toast connector.
export { configureDocumentHub, default as GlobalDocumentNotificationConnector } from "./signalr.connector";
export { default as SignalRConnector } from "./SignalRConnector";
export { SignalRProvider, useSignalRContext } from "./SignalRProvider";
export type {
  DocumentChangeNotification,
  SignalRState,
  SignalRStore,
  WaitingCountChangedNotification,
} from "./types";
