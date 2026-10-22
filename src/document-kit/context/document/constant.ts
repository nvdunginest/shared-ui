
import type { DocumentCore as IDocument } from "../../models/DocumentBase";

import { AttachmentView } from "./type";

export const FETCH_DOCUMENT_SUCCESS = "FETCH_DOCUMENT_SUCCESS";
type FetchDocumentSuccessAction = {
  type: typeof FETCH_DOCUMENT_SUCCESS;
  payload: {
    document: IDocument;
  };
};

export const SET_OPEN_SIDE_PANEL = "SET_OPEN_SIDE_PANEL";
type SetOpenSidePanelAction = {
  type: typeof SET_OPEN_SIDE_PANEL;
  payload: {
    open: boolean;
  };
};

export const CLEAR = "CLEAR";
type ClearAction = {
  type: typeof CLEAR;
};

export const ADD_ATTACHMENT_VIEW = "ADD_ATTACHMENT_VIEW";
type AddAttachmentViewAction = {
  type: typeof ADD_ATTACHMENT_VIEW;
  payload: {
    attachment: AttachmentView;
  };
};

export const SET_CURRENT_ATTACHMENT_VIEW = "SET_CURRENT_ATTACHMENT_VIEW";
type SetCurrentAttachmentViewAction = {
  type: typeof SET_CURRENT_ATTACHMENT_VIEW;
  payload: {
    view: AttachmentView | null;
  };
};

export const SET_SIZES = "SET_SIZES";
type SetSizesAction = {
  type: typeof SET_SIZES;
  payload: {
    newSizes: number[] | undefined;
  };
};

export const FETCH_DOCUMENT_ERROR = "FETCH_DOCUMENT_ERROR";
type FetchDocumentErrorAction = {
  type: typeof FETCH_DOCUMENT_ERROR;
  payload: {
    error: import("./type").FetchError;
  };
};

export type Actions =
  | FetchDocumentSuccessAction
  | FetchDocumentErrorAction
  | SetOpenSidePanelAction
  | AddAttachmentViewAction
  | SetCurrentAttachmentViewAction
  | SetSizesAction
  | ClearAction;
