import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { useDocumentSections } from "../../config";
import type { DocumentBase, DocumentCore as IDocument } from "../../models/DocumentBase";
import { useModuleFeedback } from "@ptht365/shared-ui/module-contract";
import { UUID } from "crypto";

import action from "./action";
import reducer from "./reducer";
import { AttachmentView, defaultStore, DocumentStore, initialState } from "./type";

type Props = PropsWithChildren;

export const DocumentContext = createContext(defaultStore);

export const DocumentProvider: FC<Props> = ({ children }: Props) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { message } = useModuleFeedback();
  const detail = useDocumentSections();

  const clear = useCallback(() => action.clear(dispatch), [dispatch]);
  const fetchDocument = useCallback(
    (id: UUID) => action.fetchDocument(id, dispatch, (text) => message.error(text), detail.api),
    [dispatch, message, detail.api],
  );
  const updateDocument = useCallback(
    (document: IDocument) => action.updateDocument(document, dispatch),
    [dispatch],
  );
  const setOpenSidePanel = useCallback(
    (open: boolean) => action.setOpenSidePanel(open, dispatch),
    [dispatch],
  );
  const addAttachmentView = useCallback(
    (attachment: AttachmentView) => action.addAttachmentView(attachment, dispatch),
    [dispatch],
  );
  const setCurrentAttachmentView = useCallback(
    (view: AttachmentView | null) => action.setCurrentAttachmentView(view, dispatch),
    [dispatch],
  );
  const setSizes = useCallback(
    (newSizes: number[] | undefined) => action.setSizes(newSizes, dispatch),
    [dispatch],
  );

  const store: DocumentStore = useMemo(
    () => ({
      state,
      clear,
      fetchDocument,
      updateDocument,
      setOpenSidePanel,
      addAttachmentView,
      setCurrentAttachmentView,
      setSizes,
    }),
    [state, clear, fetchDocument, updateDocument, setOpenSidePanel, addAttachmentView, setCurrentAttachmentView, setSizes],
  );

  return (
    <DocumentContext.Provider value={store}>
      {children}
    </DocumentContext.Provider>
  );
};

/** The document store typed with the app's own document model: `useDocumentContext<IDocument>()`. */
export type DocumentStoreOf<T extends IDocument> = Omit<DocumentStore, "state" | "updateDocument"> & {
  state: Omit<DocumentStore["state"], "document"> & { document: T | null };
  updateDocument: (document: T) => void;
};

export const useDocumentContext = <T extends IDocument = DocumentBase>() =>
  useContext(DocumentContext) as unknown as DocumentStoreOf<T>;
