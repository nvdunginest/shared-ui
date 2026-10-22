import { createContext, FC, PropsWithChildren, useCallback, useContext, useMemo, useReducer, useRef } from "react";

import action from "./action";
import reducer from "./reducer";
import {
  defaultStore,
  DocumentListStore,
  initialState,
  TabFilterState,
  TabKey,
} from "./type";

type Props = PropsWithChildren;

export const DocumentListContext = createContext(defaultStore);

export const DocumentListProvider: FC<Props> = ({ children }: Props) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setActiveTab = useCallback(
    (tab: TabKey) => action.setActiveTab(tab, dispatch),
    [dispatch],
  );

  const setTabFilter = useCallback(
    (tab: TabKey, patch: Partial<TabFilterState>) => action.setTabFilter(tab, patch, dispatch),
    [dispatch],
  );

  const setPendingCompanySwitch = useCallback(
    (pending: boolean) => action.setPendingCompanySwitch(pending, dispatch),
    [dispatch],
  );

  // Lives as long as this provider, i.e. one entry into the module: leaving the module and coming back opens the first document again.
  const initialOpenDone = useRef(false);

  const store: DocumentListStore = useMemo(
    () => ({ state, setActiveTab, setTabFilter, setPendingCompanySwitch, initialOpenDone }),
    [state, setActiveTab, setTabFilter, setPendingCompanySwitch],
  );

  return (
    <DocumentListContext.Provider value={store}>
      {children}
    </DocumentListContext.Provider>
  );
};

export const useDocumentListContext = () => useContext(DocumentListContext);
