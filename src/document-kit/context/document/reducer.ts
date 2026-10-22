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
import { DocumentState, initialState } from "./type";

export default function reducer(
  state = initialState,
  action: Actions,
): DocumentState {
  switch (action.type) {
    case CLEAR:
      return initialState;

    case FETCH_DOCUMENT_SUCCESS:
      return {
        ...state,
        document: action.payload.document,
        fetchError: null,
      };

    case FETCH_DOCUMENT_ERROR:
      return {
        ...state,
        document: null,
        fetchError: action.payload.error,
      };

    case SET_OPEN_SIDE_PANEL:
      return {
        ...state,
        openSidePanel: action.payload.open,
      };

    case ADD_ATTACHMENT_VIEW:
      return {
        ...state,
        attachments: [...state.attachments, action.payload.attachment],
      };

    case SET_CURRENT_ATTACHMENT_VIEW: {
      return {
        ...state,
        currentAttachmentView: action.payload.view,
      };
    }

    case SET_SIZES: {
      return {
        ...state,
        sizes: action.payload.newSizes,
      };
    }

    default:
      return state;
  }
}
