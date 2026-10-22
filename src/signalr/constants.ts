import * as signalR from "@microsoft/signalr";

// SignalR Action Constants
export const SET_CONNECTION_STATE = "SET_CONNECTION_STATE";
export const SET_CONNECTED = "SET_CONNECTED";
export const SET_LAST_CONNECTED_TIME = "SET_LAST_CONNECTED_TIME";
export const INCREMENT_RECONNECT_ATTEMPTS = "INCREMENT_RECONNECT_ATTEMPTS";
export const RESET_RECONNECT_ATTEMPTS = "RESET_RECONNECT_ATTEMPTS";

// Action Types
type SetConnectionStateAction = {
  type: typeof SET_CONNECTION_STATE;
  payload: {
    connectionState: signalR.HubConnectionState;
  };
};

type SetConnectedAction = {
  type: typeof SET_CONNECTED;
  payload: {
    connected: boolean;
  };
};

type SetLastConnectedTimeAction = {
  type: typeof SET_LAST_CONNECTED_TIME;
  payload: {
    lastConnectedTime: Date | null;
  };
};

type IncrementReconnectAttemptsAction = {
  type: typeof INCREMENT_RECONNECT_ATTEMPTS;
};

type ResetReconnectAttemptsAction = {
  type: typeof RESET_RECONNECT_ATTEMPTS;
};

export type SignalRActions =
  | SetConnectionStateAction
  | SetConnectedAction
  | SetLastConnectedTimeAction
  | IncrementReconnectAttemptsAction
  | ResetReconnectAttemptsAction;
