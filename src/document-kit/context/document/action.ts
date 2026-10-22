import { Dispatch } from "react";
import type { DocumentActionApi } from "../../config";
import type { DocumentCore as IDocument } from "../../models/DocumentBase";
import { UUID } from "crypto";

import {
  Actions,
  ADD_ATTACHMENT_VIEW,
  CLEAR,
  FETCH_DOCUMENT_ERROR,
  FETCH_DOCUMENT_SUCCESS,
  SET_CURRENT_ATTACHMENT_VIEW,
  SET_OPEN_SIDE_PANEL,
  SET_SIZES,
} from "./constant";
import { AttachmentView } from "./type";

function clear(dispatch: Dispatch<Actions>) {
  dispatch({ type: CLEAR });
}

async function fetchDocument(
  id: UUID,
  dispatch: Dispatch<Actions>,
  notifyError: (text: string) => void,
  api: Pick<DocumentActionApi, "getById" | "dismissRemind">,
) {
  try {
    const document = await api.getById(id);
    dispatch({ type: FETCH_DOCUMENT_SUCCESS, payload: { document } });
    // Auto-dismiss remind khi user mở document — fire-and-forget (lỗi không ảnh hưởng UX)
    api.dismissRemind(id).catch(() => undefined);
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 403) {
      dispatch({ type: FETCH_DOCUMENT_ERROR, payload: { error: "forbidden" } });
    } else if (status === 404) {
      dispatch({ type: FETCH_DOCUMENT_ERROR, payload: { error: "not_found" } });
    } else {
      dispatch({ type: FETCH_DOCUMENT_ERROR, payload: { error: "error" } });
      notifyError("Không thể tải tài liệu. Vui lòng thử lại.");
    }
  }
}

function updateDocument(document: IDocument, dispatch: Dispatch<Actions>) {
  dispatch({ type: FETCH_DOCUMENT_SUCCESS, payload: { document } });
}

function setOpenSidePanel(open: boolean, dispatch: Dispatch<Actions>) {
  dispatch({ type: SET_OPEN_SIDE_PANEL, payload: { open } });
}

function addAttachmentView(
  attachment: AttachmentView,
  dispatch: Dispatch<Actions>,
) {
  dispatch({ type: ADD_ATTACHMENT_VIEW, payload: { attachment } });
}

function setCurrentAttachmentView(
  view: AttachmentView | null,
  dispatch: Dispatch<Actions>,
) {
  dispatch({
    type: SET_CURRENT_ATTACHMENT_VIEW,
    payload: { view },
  });
}

function setSizes(newSizes: number[] | undefined, dispatch: Dispatch<Actions>) {
  dispatch({ type: SET_SIZES, payload: { newSizes } });
}

const action = {
  clear,
  fetchDocument,
  updateDocument,
  setOpenSidePanel,
  addAttachmentView,
  setCurrentAttachmentView,
  setSizes,
};

export default action;
