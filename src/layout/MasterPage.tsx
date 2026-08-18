import React, { FC, PropsWithChildren, useEffect, useState } from "react";

import { ArrowLeftOutlined, MenuFoldOutlined, ReloadOutlined } from "@ant-design/icons";
import { useAppContext } from "../platform/contexts/AppContext";
import { Button, Drawer, Tooltip, Typography } from "antd";
import { styled } from "styled-components";
import { useNavigate } from "react-router-dom";

import ResponsiveWrapper from "./ResponsiveWrapper";
import { useDeviceType } from "./useDeviceType";

import TitleBg from "../assets/title_bg.png";

type Props = PropsWithChildren & {
  title: string;
  isResponsive?: boolean;
  mobile?: React.ReactNode;
  extra?: React.ReactNode;
  headerActions?: React.ReactNode;
  onRefresh?: () => void;
};

const MasterPage: FC<Props> = function ({
  title,
  isResponsive = false,
  mobile,
  extra,
  headerActions,
  onRefresh,
  children,
}: Props) {
  const { setPageTitle, state } = useAppContext();
  const navigate = useNavigate();
  const deviceType = useDeviceType();
  const [showDrawer, setShowDrawer] = useState(false);
  const [showExtra, setShowExtra] = useState(false);

  useEffect(() => {
    setPageTitle(title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  useEffect(() => {
    if (deviceType === "xxl" || deviceType === "xl") {
      setShowDrawer(false);
      setShowExtra(true);
    } else {
      setShowDrawer(true);
      setShowExtra(false);
    }
  }, [deviceType]);

  return (
    <ContainerStl>
      <HeaderStl>
        <Tooltip title="Quay lại" placement="bottomLeft">
          <Button
            type="primary"
            shape="circle"
            size="small"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            danger
          />
        </Tooltip>
        <Tooltip title="Làm mới" placement="bottomRight">
          <Button
            type="default"
            shape="circle"
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => (onRefresh ? onRefresh() : navigate(0))}
          />
        </Tooltip>
        <TitleStl>
          <Typography.Title
            style={{
              width: "100%",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              color: "white",
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
          />
        )}
      </HeaderStl>
      <ContentStl>
        <MainStl>
          {isResponsive ? (
            children
          ) : (
            <ResponsiveWrapper mobile={mobile} desktop={children} />
          )}
        </MainStl>
        {extra && !showDrawer && showExtra && <ExtraStl>{extra}</ExtraStl>}
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
              <HalfCloseButtonStl onClick={() => setShowExtra(false)}>×</HalfCloseButtonStl>
            )}
          </>
        )}
      </ContentStl>
    </ContainerStl>
  );
};

export default MasterPage;
export const extraWidth = 440;

const ContainerStl = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 4px;
`;

const HeaderStl = styled.div`
  width: 100%;
  height: 36px;
  border-radius: 8px;
  background-image: url(${TitleBg});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  flex-shrink: 0;
  padding: 4px 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ContentStl = styled.div`
  width: 100%;
  flex-grow: 1;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  gap: 4px;
`;

const MainStl = styled.div`
  height: 100%;
  flex-grow: 1;
  overflow: hidden;
`;

const ExtraStl = styled.div`
  height: 100%;
  flex: 0 0 ${extraWidth}px;
  width: ${extraWidth}px;
  overflow: hidden;
`;

const TitleStl = styled.div`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HeaderActionsStl = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  margin-right: 4px;
`;

const DrawerStl = styled(Drawer)`
  .ant-drawer-body { padding: 4px; }
  .ant-drawer-header { height: 32px; }
`;

const HalfCloseButtonStl = styled.button`
  position: fixed;
  left: 0;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 96px;
  border-radius: 0 48px 48px 0;
  border: none;
  padding: 0;
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
  font-size: 22px;
  line-height: 96px;
  text-align: center;
  cursor: pointer;
  backdrop-filter: blur(4px);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
  z-index: 1100;
  outline: none;
  @media (min-width: 768px) { display: none; }
`;
