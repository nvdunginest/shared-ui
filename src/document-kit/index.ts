// Light entry (bundled into each app): the document list side of the document apps (company selector,
// list panel / screen / mobile list, filters, contexts), driven by <DocumentKitProvider config={...}>.
export {
  DocumentKitProvider,
  DocumentSectionsProvider,
  findCreateFeature,
  getFooterFeatures,
  useDocumentKit,
  useDocumentSections,
} from "./config";
export type {
  DocumentReadApi,
  DocumentSectionsConfig,
  DocumentActionApi,
  DocumentDetailConfig,
  DocumentStatusRules,
  DocumentKitConfig,
  DocumentQueryOptions,
  DocumentViewItemProps,
  ListDocument,
  TabConfig,
} from "./config";
export type { default as PaginationQueryResult } from "./models/PaginationQueryResult";
export { GlobalProvider, GlobalContext, useGlobalContext } from "./context/global/index";
export { default as GlobalLoader } from "./context/global/GlobalLoader";
export { default as WaitingCountsListenChanged } from "./context/global/WaitingCountsListenChanged";
export type { GlobalState, GlobalStore } from "./context/global/type";
export { DocumentListProvider, DocumentListContext, useDocumentListContext } from "./context/list/index";
export type { DocumentListState, DocumentListStore, TabFilterState, TabKey } from "./context/list/type";
export { default as GlobalCompanySelector } from "./components/GlobalCompanySelector";
export { default as ListHost, IndexScreen } from "./layout/ListHost";
export { default as OutlookShell, useListPanelVisibility, LIST_PANEL_WIDTH, LIST_PANEL_WIDTH_MEDIUM } from "./layout/OutlookShell";
export { default as DocumentListPanel } from "./layout/DocumentListPanel";
export { default as DocumentListMobile } from "./layout/DocumentListMobile";
export { default as DocumentListScreen } from "./layout/DocumentListScreen";
export { default as DocumentTable } from "./home/DocumentTable";

// ---- detail side: one document (Phase 5)
export type { DocumentBase, DocumentCore } from "./models/DocumentBase";
export type { default as IActivity } from "./models/IActivity";
export type { default as IAttachment } from "./models/IAttachment";
export type { default as IFollower } from "./models/IFollower";
export type { default as IParticipant } from "./models/IParticipant";
export type { default as IRemind } from "./models/IRemind";
export type { default as IActorSnapshot } from "./models/IActorSnapshot";
export { ActivityType } from "./models/ActivityType";
export type { ActivityRenderConfig } from "./helpers/activities.helper";
export { getActivityActorName, parseActorSnapshot } from "./helpers/activities.helper";
export { extractApiErrorMessage } from "./helpers/apiError.helper";
export { isSecretaryOfDocument } from "./helpers/secretary.helper";
export * from "./helpers/attachments.helper";
export * from "./helpers/selectOptions.helper";
export { default as activitiesController } from "./api/activities.controller";
export type { AddCommentModel, CommentObjectData } from "./api/activities.controller";
export type { AddAttachmentModel } from "./api/attachments.controller";
export type { AddFollowersModel } from "./api/followers.controller";
export { default as attachmentsController } from "./api/attachments.controller";
export { default as followersController } from "./api/followers.controller";
export { DocumentContext, DocumentProvider, DocumentListenChanged, useDocumentContext } from "./context/document/index";
export type { AttachmentView, DocumentState, DocumentStore, DocumentStoreOf, FetchError } from "./context/document/index";
export { default as ActionBarButton } from "./detail/actions/ActionBarButton";
export { default as AddAttachmentAction, CheckActor } from "./detail/actions/AddAttachmentAction";
export { default as AddFollowersAction } from "./detail/actions/AddFollowersAction";
export { default as RemoveFollowerAction } from "./detail/actions/RemoveFollowerAction";
export { DownloadAttachmentAction } from "./detail/actions/DownloadAttachmentAction";
export { OpenAttachmentAction } from "./detail/actions/OpenAttachmentAction";
export { RemoveAttachmentAction } from "./detail/actions/RemoveAttachmentAction";
export { default as ApproveAction } from "./detail/actions/ApproveAction";
export { default as RejectAction } from "./detail/actions/RejectAction";
export { default as TransferAction } from "./detail/actions/TransferAction";
export { default as GivebackAction } from "./detail/actions/GivebackAction";
export { default as CancelAction } from "./detail/actions/CancelAction";
export { default as ShareAction } from "./detail/actions/ShareAction";
export { default as CopyTitleAction } from "./detail/actions/CopyTitleAction";
export { default as DocumentAttachmentPreview } from "./components/DocumentAttachmentPreview";
export { default as AttachmentPreviewModal } from "./components/AttachmentPreviewModal";
export { default as SelectPositionHolder } from "./components/SelectPositionHolder";
export { default as AttachmentsSection } from "./detail/sections/AttachmentsSection";
export { default as SectionView } from "./detail/sections/SectionView";
export { default as ReferenceLinksSection } from "./detail/sections/ReferenceLinksSection";
export { default as DiscussionSection } from "./detail/sections/discussion/index";
export { extractMentions } from "./detail/sections/discussion/CommentAction";
export { default as HistorySection } from "./detail/sections/HistorySection";
