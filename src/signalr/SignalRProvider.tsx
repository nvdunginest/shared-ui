import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";

import signalRActions from "./actions";
import signalRReducer from "./reducer";
import {
  defaultSignalRStore,
  initialSignalRState,
  SignalRStore,
} from "./types";

type Props = PropsWithChildren;

export const SignalRContext = createContext(defaultSignalRStore);

export const SignalRProvider: FC<Props> = ({ children }: Props) => {
  const [state, dispatch] = useReducer(signalRReducer, initialSignalRState);

  const store: SignalRStore = {
    state,

    // Connection management
    connect: () => signalRActions.connect(dispatch),
    disconnect: () => signalRActions.disconnect(dispatch),
    ping: signalRActions.ping,

    // State management
    setConnectionState: (connectionState) =>
      signalRActions.setConnectionState(connectionState, dispatch),
    setConnected: (connected) =>
      signalRActions.setConnected(connected, dispatch),
    incrementReconnectAttempts: () =>
      signalRActions.incrementReconnectAttempts(dispatch),
    resetReconnectAttempts: () =>
      signalRActions.resetReconnectAttempts(dispatch),

    // Event subscriptions (these return unsubscribe functions)
    onDocumentChanged: signalRActions.onDocumentChanged,
    onWaitingCountChanged: signalRActions.onWaitingCountChanged,
    onReconnection: signalRActions.onReconnection,
    onConnectionStateChanged: signalRActions.onConnectionStateChanged,
  };

  return (
    <SignalRContext.Provider value={store}>{children}</SignalRContext.Provider>
  );
};

// Custom hook to use SignalR context
export const useSignalRContext = (): SignalRStore => {
  const context = useContext(SignalRContext);
  if (context === defaultSignalRStore) {
    throw new Error("useSignalRContext must be used within a SignalRProvider");
  }
  return context;
};
