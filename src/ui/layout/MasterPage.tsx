import React, { createContext, FC, PropsWithChildren, useContext, useEffect, useState } from "react";
import { LeftOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { containerMaxWidth, containerMinWidth } from "@ptht365/shared-ui/module-contract";
import { useAppContext } from '../../platform-kit';
import { colors, radii, shadows, spacing } from "../../theme";
import { Button, Drawer, Typography } from "antd";
import { styled } from "styled-components";

import CollapsedPanelStrip from "./CollapsedPanelStrip";

import { readPanelFlag, writePanelFlag } from "./panelPersistence";
import ResponsiveWrapper from "./ResponsiveWrapper";
import { useDeviceType } from "./useDeviceType";

type Props = PropsWithChildren & {
  title: string;
  isResponsive?: boolean;
  mobile?: React.ReactNode;
  extra?: React.ReactNode;
  headerActions?: React.ReactNode;
  /** Khi truyền, hiện nút quay lại (mũi tên) đứng trước tiêu đề trong header. */
  onBack?: () => void;
  /** Tooltip / nhãn trợ năng của nút quay lại. */
  backLabel?: string;
  /** Ẩn hẳn thanh header gradient mặc định — dùng khi trang tự vẽ header riêng
   * (vd Document Detail). Nút bật/tắt panel `extra` vẫn dùng được qua
   * `useMasterPageExtra()` để trang tự đặt vào header riêng của mình. */
  hideHeader?: boolean;
  /** Custom full-width header drawn above both the main pane and the `extra` panel. */
  header?: React.ReactNode;
  /** Nhãn hiển thị dọc trên dải thu gọn của panel `extra` khi bị ẩn (desktop) —
   * mặc định "MỞ RỘNG" nếu không truyền. */
  extraCollapsedLabel?: string;
  /** When set, the open/closed choice of the inline `extra` panel is remembered under this key. */
  extraStorageKey?: string;
};

// Cho phép trang con (children) tự vẽ nút bật/tắt panel `extra` trong header
// riêng của nó khi `hideHeader` = true, thay vì luôn phụ thuộc HeaderStl mặc định.
type MasterPageExtraCtx = {
  hasExtra: boolean;
  showExtra: boolean;
  toggleExtra: () => void;
  setShowExtra: (show: boolean) => void;
};
const MasterPageExtraContext = createContext<MasterPageExtraCtx>({
  hasExtra: false,
  showExtra: false,
  toggleExtra: () => {},
  setShowExtra: () => {},
});
export const useMasterPageExtra = () => useContext(MasterPageExtraContext);

const MasterPage: FC<Props> = function ({
  title,
  isResponsive = false,
  mobile,
  extra,
  headerActions,
  onBack,
  backLabel = "Quay lại",
  hideHeader = false,
  header,
  extraCollapsedLabel = "MỞ RỘNG",
  extraStorageKey,
  children,
}: Props) {
  const { setPageTitle, state } = useAppContext();

  const deviceType = useDeviceType();
  // Medium frames get a narrower panel so the document keeps its room.
  const panelWidth = deviceType === "lg" ? EXTRA_WIDTH_MEDIUM : extraWidth;
  const [showDrawer, setShowDrawer] = useState(false);
  const [showExtra, setShowExtraState] = useState(false);
  // Only the inline panel remembers its state; the mobile drawer always starts closed.
  const setShowExtra = (show: boolean) => {
    setShowExtraState(show);
    if (extraStorageKey && deviceType !== "xs") writePanelFlag(extraStorageKey, show);
  };

  useEffect(() => {
    setPageTitle(title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  useEffect(() => {
    // Medium (tablet) and wide frames show the panel inline; only narrow (mobile) frames use a drawer.
    if (deviceType !== "xs") {
      setShowDrawer(false);
      setShowExtraState((extraStorageKey ? readPanelFlag(extraStorageKey) : null) ?? true);
    } else {
      setShowDrawer(true);
      setShowExtraState(false);
    }
  }, [deviceType]);

  return (
    <MasterPageExtraContext.Provider
      value={{ hasExtra: !!extra, showExtra, toggleExtra: () => setShowExtra(!showExtra), setShowExtra }}
    >
      <ContainerStl>
        {!hideHeader && (
          <HeaderStl>
            {onBack && (
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={onBack}
                title={backLabel}
                aria-label={backLabel}
                style={{ flexShrink: 0 }}
              />
            )}
            <TitleStl>
              <Typography.Title
                style={{
                  width: "100%",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  color: colors.textHeading,
                }}
                level={2}
              >
                {state.pageTitle}
              </Typography.Title>
            </TitleStl>
            {headerActions && <HeaderActionsStl>{headerActions}</HeaderActionsStl>}

            {extra && (
              <Button
                size="small"
                type={showExtra ? "primary" : "default"}
                icon={<MenuFoldOutlined />}
                onClick={() => setShowExtra(!showExtra)}
              ></Button>
            )}
          </HeaderStl>
        )}
        {header}
        <ContentStl>
          <MainStl>
            {isResponsive ? (
              children
            ) : (
              <ResponsiveWrapper mobile={mobile} desktop={children} />
            )}
          </MainStl>
          {extra && !showDrawer && (
            <>
              {/* Luôn giữ `extra` mounted (chỉ ẩn/hiện bằng CSS) khi ở chế độ
                  inline (desktop) — tránh unmount làm mất state/dữ liệu đã
                  tải của Thảo luận/Lịch sử mỗi lần thu gọn/mở panel. */}
              <CollapsedExtraStl style={{ display: showExtra ? "none" : "flex" }}>
                <CollapsedPanelStrip
                  icon={<LeftOutlined style={{ fontSize: 12 }} />}
                  label={extraCollapsedLabel}
                  title="Hiện thông tin, thảo luận, lịch sử"
                  onClick={() => setShowExtra(true)}
                />
              </CollapsedExtraStl>
              <ExtraStl $width={panelWidth} style={{ display: showExtra ? "block" : "none" }}>{extra}</ExtraStl>
            </>
          )}
          {extra && showDrawer && (
            <>
              <DrawerStl
                width={extraWidth + 8}
                open={showExtra}
                onClose={() => setShowExtra(false)}
                styles={{ header: { display: "none" } }}
              >
                {extra}
              </DrawerStl>
              {showExtra && (
                <HalfCloseButtonStl onClick={() => setShowExtra(false)}>
                  ×
                </HalfCloseButtonStl>
              )}
            </>
          )}
        </ContentStl>
      </ContainerStl>
    </MasterPageExtraContext.Provider>
  );
};

export default MasterPage;

export const extraWidth = 400;
const EXTRA_WIDTH_MEDIUM = 340;

const ContainerStl = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;

  overflow: hidden;
  gap: ${spacing.xs}px;
`;

const HeaderStl = styled.div`
  width: 100%;
  min-height: 48px;
  border-radius: ${radii.lg}px;
  background: ${colors.bgSurface};
  box-shadow: ${shadows.card};

  flex-shrink: 0;
  box-sizing: border-box;
  padding: ${spacing.xs}px 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${spacing.sm}px;

  /* Narrow frames: the actions drop to their own row instead of squeezing the title to nothing. */
  ${containerMaxWidth("medium")} {
    flex-wrap: wrap;
  }
`;

const ContentStl = styled.div`
  width: 100%;
  flex-grow: 1;
  overflow: hidden;

  display: flex;
  flex-direction: row;
  gap: ${spacing.xs}px;
`;

const MainStl = styled.div`
  height: 100%;
  flex-grow: 1;
  min-width: 0;
  overflow: hidden;
`;

const ExtraStl = styled.div<{ $width: number }>`
  height: 100%;
  flex: 0 0 ${({ $width }) => $width}px;
  width: ${({ $width }) => $width}px;
  overflow: hidden;
`;

const EXTRA_COLLAPSED_WIDTH = 34;

// Dải thu gọn cho panel `extra` (khớp dải thu gọn của panel danh sách bên
// trái trong OutlookShell) — thay vì biến mất hẳn khi `showExtra=false`.
// Chỉ còn là wrapper định kích thước — phần visual (nền/bo góc/icon/label) đã
// tách sang CollapsedPanelStrip dùng chung với OutlookShell.
const CollapsedExtraStl = styled.div`
  height: 100%;
  flex: 0 0 ${EXTRA_COLLAPSED_WIDTH}px;
  width: ${EXTRA_COLLAPSED_WIDTH}px;
  overflow: hidden;
`;

const TitleStl = styled.div`
  flex: 1;
  min-width: 0;

  ${containerMaxWidth("medium")} {
    min-width: 140px;
  }
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HeaderActionsStl = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  margin-right: 4px;

  ${containerMaxWidth("medium")} {
    margin-left: auto;
  }
`;

const DrawerStl = styled(Drawer)`
  .ant-drawer-body {
    padding: 4px;
  }
  .ant-drawer-header {
    height: 32px;
  }
`;

const HalfCloseButtonStl = styled.button`
  /* absolute inside the module root (the root contains it), never fixed to the window */
  position: absolute;
  left: 0;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 48px; // 40 * 1.2
  height: 96px; // 80 * 1.2
  border-radius: 0 48px 48px 0;
  border: none;
  padding: 0;
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
  font-size: 22px; // tăng nhẹ cho cân đối
  line-height: 96px;
  text-align: center;
  cursor: pointer;
  backdrop-filter: blur(4px);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
  z-index: 1100;
  outline: none;

  /* shown on narrow frames only (was: window narrower than 768) */
  ${containerMinWidth("medium")} {
    display: none;
  }
`;
