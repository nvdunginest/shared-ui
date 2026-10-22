import { PropsWithChildren } from "react";
import { ConfigProvider } from "antd";

import { colors, fontFamily, fontSizes, radii, shadows } from "./tokens";

type Props = PropsWithChildren;

export function StyleProvider({ children }: Props) {
  return (
    <ConfigProvider
      theme={{
        // antd is shared with the host, so without this the host's tenant theme tokens
        // (ThemeContext) would merge into this app's theme.
        inherit: false,
        token: {
          fontSize: fontSizes.base,
          fontSizeSM: fontSizes.sm,
          fontSizeLG: fontSizes.lg,
          fontSizeXL: fontSizes.xl,
          fontSizeHeading1: fontSizes.heading1,
          fontSizeHeading2: fontSizes.heading2,
          fontSizeHeading3: fontSizes.heading3,
          fontSizeHeading4: fontSizes.heading4,
          fontSizeHeading5: fontSizes.heading5,
          fontFamily,
          colorPrimary: colors.primary,
          colorPrimaryHover: colors.primaryHover,
          colorPrimaryActive: colors.primaryActive,
          colorPrimaryBg: colors.primaryBg,
          colorPrimaryBorder: colors.primaryBorder,
          colorLink: colors.primary,
          colorLinkHover: colors.primaryHover,
          colorError: colors.danger,
          colorErrorBg: colors.dangerBg,
          colorBorder: colors.borderInput,
          colorBorderSecondary: colors.borderDivider,
          colorTextBase: colors.textHeading,
          colorText: colors.textBase,
          colorTextSecondary: colors.textSecondary,
          colorTextTertiary: colors.textTertiary,
          colorTextQuaternary: colors.textQuaternary,
          colorTextPlaceholder: colors.textQuaternary,
          borderRadius: radii.md,
          borderRadiusLG: radii.lg,
          borderRadiusSM: radii.sm,
          colorSplit: colors.borderDivider,
        },
        components: {
          Typography: {
            titleMarginBottom: 0,
            titleMarginTop: 0,
          },
          Table: {
            fontSize: fontSizes.base,
          },
          Modal: {
            fontSize: fontSizes.base,
            titleFontSize: fontSizes.heading2,
            controlHeight: 18,
            borderRadiusLG: radii.xl,
            boxShadow: shadows.modalLg,
          },
          Tabs: {
            margin: 1,
            paddingContentVertical: 0,
            paddingContentVerticalSM: 0,
            horizontalItemPaddingSM: "8px 8px",
            itemColor: colors.textTertiary,
            itemHoverColor: colors.primary,
            itemActiveColor: colors.primary,
            itemSelectedColor: colors.primary,
            inkBarColor: colors.primary,
          },
          Collapse: {
            headerPadding: 6,
            contentPadding: 6,
          },
          Drawer: {
            padding: 8,
            paddingLG: 8,
            paddingSM: 8,
          },
          Divider: {
            margin: 8,
            verticalMarginInline: 8,
            orientationMargin: 8,
            marginLG: 8,
          },
          Button: {
            borderRadius: radii.md,
            primaryShadow: "none",
            defaultBorderColor: colors.borderInput,
            defaultColor: colors.textBase,
          },
          Tag: {
            defaultBg: colors.bgSurface,
            defaultColor: colors.textBase,
            borderRadiusSM: radii.sm,
          },
          Pagination: {
            colorPrimary: colors.primary,
            colorPrimaryHover: colors.primaryHover,
            itemActiveBg: colors.primary,
          },
          Input: {
            borderRadius: radii.md,
            activeBorderColor: colors.primary,
            hoverBorderColor: colors.primary,
          },
          Select: {
            borderRadius: radii.md,
            optionSelectedBg: colors.primaryBg,
            optionSelectedColor: colors.primary,
          },
          Checkbox: {
            colorPrimary: colors.primary,
          },
          Card: {
            borderRadiusLG: radii.lg,
            boxShadowTertiary: shadows.card,
          },
          Descriptions: {
            labelBg: colors.bgMuted,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
