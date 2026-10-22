import type { DocumentCore as IDocument } from "../../models/DocumentBase";
import { UUID } from "crypto";

export type AttachmentView = {
  attachmentId: UUID;
  filename: string;
  extension: string;
  uri: string;
};

export type FetchError = "forbidden" | "not_found" | "error";

export type DocumentState = {
  document: IDocument | null;
  fetchError: FetchError | null;
  openSidePanel: boolean;
  currentAttachmentView: AttachmentView | null;
  attachments: AttachmentView[];
  sizes: number[] | undefined;
};

export const initialState: DocumentState = {
  document: null,
  fetchError: null,
  openSidePanel: false,
  currentAttachmentView: null,
  attachments: [],
  sizes: undefined,
};

export type DocumentStore = {
  state: DocumentState;
  clear: () => void;
  fetchDocument: (id: UUID) => void;
  updateDocument: (document: IDocument) => void;
  setOpenSidePanel: (open: boolean) => void;
  addAttachmentView: (attachment: AttachmentView) => void;
  setCurrentAttachmentView: (view: AttachmentView | null) => void;
  setSizes: (newSizes: number[] | undefined) => void;
};

export const defaultStore: DocumentStore = {
  state: initialState,
  clear: () => {},
  fetchDocument: () => {},
  updateDocument: () => {},
  setOpenSidePanel: () => {},
  addAttachmentView: () => {},
  setCurrentAttachmentView: () => {},
  setSizes: () => {},
};
