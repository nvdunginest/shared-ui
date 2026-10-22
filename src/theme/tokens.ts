// Design tokens extracted from docs/ui/new_ui.html (mock), shared by every document app.
// Consumed by StyleProvider.tsx (AntD ConfigProvider) and imported directly into
// styled-components files that need raw values (no styled-components ThemeProvider —
// project does not currently have one; keep it simple, avoid a second theming system).

export const colors = {
  // Primary — single color per PO decision 7.6.1, no secondary blue
  primary: "#C05621",
  primaryHover: "#A84820",
  primaryActive: "#A84820",
  primaryBg: "#FEF3EB", // light hover/selected background
  primaryBorder: "#FCDCB5", // chip/pill border on primary-tinted bg

  danger: "#D33333",
  dangerHover: "#A82626",
  dangerBg: "#FDEEEE",

  // Action bar tones: info (blue, e.g. Transfer) and warning (amber, e.g. Give back).
  // Warning is a light amber with dark text, so it stays distinct from the orange primary.
  info: "#096DD9",
  infoHover: "#0050B3",
  warning: "#FAAD14",
  warningHover: "#D48806",

  importantBorder: "#E8B33D", // "văn bản quan trọng" badge
  importantBg: "#FFF9E8",
  importantText: "#A87B0F",

  textHeading: "#262626",
  textBase: "#374151",
  textSecondary: "#595959",
  textTertiary: "#8c8c8c", // uppercase small labels, meta text
  textQuaternary: "#bfbfbf", // placeholder / disabled

  borderInput: "#d9d9d9",
  borderPanel: "#e8e8e8",
  borderDivider: "#f0f0f0",
  borderDividerLight: "#f5f5f5",

  bgPage: "#F5F5F5",
  bgSurface: "#fff",
  bgMuted: "#FAFAFA",
  bgChip: "#F3F4F6", // handler/follower pill background

  // Icon-only controls (e.g. footer nav) — replaces ad-hoc rgba(0,0,0,x) literals
  iconDefault: "rgba(0, 0, 0, 0.65)",
  iconHover: "rgba(0, 0, 0, 0.88)",
  iconHoverBg: "rgba(0, 0, 0, 0.06)",

  // Unread/reminder highlight for list rows — deliberately blue (distinct
  // from primary orange and from status/priority colors)
  remindBg: "#f0f7ff",
  remindBgHover: "#dbeeff",

  // Reused as-is from existing history/success styling — do not remap
  successBg: "#f6ffed",
  successBorder: "#52c41a",
  warnBg: "#fff7e6",
  warnBorder: "#ffa940",

  // Status tags — semantic pair (chip bg + text), single source of truth
  // consumed by documents.helper.ts. Do NOT reuse `primary` here — status
  // must read independently of the primary CTA color.
  statusDraftText: "#595959",
  statusDraftBg: "#F5F5F5",
  statusProcessingText: "#3A7D1F",
  statusProcessingBg: "#EEF8E6",
  statusApprovedText: "#946200",
  statusApprovedBg: "#FFF6DF",
  statusRejectedText: "#B02317",
  statusRejectedBg: "#FCEAE9",
  statusCanceledText: "#8C8C8C",
  statusCanceledBg: "#F5F5F5",

  // Priority tags — same chip-pair pattern
  priorityNormalText: "#595959",
  priorityNormalBg: "#F5F5F5",
  priorityHighText: "#B45C00",
  priorityHighBg: "#FFF1E0",
  priorityUrgentText: "#B02317",
  priorityUrgentBg: "#FCEAE9",
} as const;

export const radii = {
  sm: 4, // status/priority badge (NOT a pill)
  md: 6, // inputs, buttons, dropdown trigger
  lg: 8, // cards, panels, dropdown menu, modal filter chip
  xl: 12, // advanced-search modal container
  pill: 999, // avatars, follower/handler chips, tab count badge
} as const;

export const shadows = {
  // Single card-shadow value — previously two different literals
  // (0 1px 3px vs 0 4px 6px) were used interchangeably; this is the one.
  card: "0 1px 3px rgba(0,0,0,0.04)",
  dropdown: "0 12px 32px rgba(0,0,0,0.16)",
  popover: "0 8px 24px rgba(0,0,0,0.12)",
  modalSm: "0 24px 64px rgba(0,0,0,0.2)",
  modalLg: "0 24px 72px rgba(0,0,0,0.28)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

// AntD ConfigProvider font-size scale — single source of truth consumed by
// StyleProvider.tsx (was hardcoded numeric literals there before).
export const fontSizes = {
  base: 14,
  sm: 12,
  lg: 15,
  xl: 17,
  heading1: 16,
  heading2: 18,
  heading3: 22,
  heading4: 30,
  heading5: 46,
} as const;

// Avatar background by the Azure AD job title (see components/avatarColor.ts): the board
// chairman is orange, the CEO green, everyone else earth brown.
export const avatarColors = {
  chairman: "#D9730D",
  ceo: "#3A7D1F",
  default: "#8B5A2B",
} as const;

// Same list as the shell's FONT_STACK (shell-app frontend/shared/theme/brandTokens.ts): keep the two in sync.
export const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, " +
  "'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', " +
  "'Noto Color Emoji'";

export const labelTextStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: colors.textTertiary,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
};
