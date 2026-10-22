import * as signalR from "@microsoft/signalr";

import {
  INCREMENT_RECONNECT_ATTEMPTS,
  RESET_RECONNECT_ATTEMPTS,
  SET_CONNECTED,
  SET_CONNECTION_STATE,
  SET_LAST_CONNECTED_TIME,
  SignalRActions,
} from "./constants";
import { SignalRState } from "./types";

const signalRReducer = (
  state: SignalRState,
  action: SignalRActions
): SignalRState => {
  switch (action.type) {
    case SET_CONNECTION_STATE:
      return {
        ...state,
        connectionState: action.payload.connectionState,
        connected:
          action.payload.connectionState ===
          signalR.HubConnectionState.Connected,
        ...(action.payload.connectionState ===
          signalR.HubConnectionState.Connected && {
          lastConnectedTime: new Date(),
          reconnectAttempts: 0,
        }),
      };

    case SET_CONNECTED:
      return {
        ...state,
        connected: action.payload.connected,
        ...(action.payload.connected && {
          lastConnectedTime: new Date(),
          reconnectAttempts: 0,
        }),
      };

    case SET_LAST_CONNECTED_TIME:
      return {
        ...state,
        lastConnectedTime: action.payload.lastConnectedTime,
      };

    case INCREMENT_RECONNECT_ATTEMPTS:
      return {
        ...state,
        reconnectAttempts: state.reconnectAttempts + 1,
      };

    case RESET_RECONNECT_ATTEMPTS:
      return {
        ...state,
        reconnectAttempts: 0,
      };

    default:
      return state;
  }
};

export default signalRReducer;
