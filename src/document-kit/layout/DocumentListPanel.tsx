import { FC } from "react";
import { useNavigate } from "react-router-dom";
import {
  BankOutlined,
  DoubleLeftOutlined,
  ExpandAltOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import styled from "styled-components";

import { colors, radii, shadows } from "../../theme";
import { ExpandingTabBar, FooterIconNav, getUiConfig } from "../../ui";
import GlobalCompanySelector from "../components/GlobalCompanySelector";
import { findCreateFeature, getFooterFeatures, useDocumentKit } from "../config";
import { useGlobalContext } from "../context/global/index";
import { useDocumentListContext } from "../context/list/index";
import TabTable from "../home/subs/TabTable";

import { useListPanelVisibility } from "./OutlookShell";

const DocumentListPanel: FC = () => {
  const { tabs, menu, features } = useDocumentKit();
  const { documentName } = getUiConfig();
  const createFeature = findCreateFeature(menu);
  const footerFeatures = getFooterFeatures(menu);
  const navigate = useNavigate();
  // Tab đang chọn + bộ lọc của từng tab nằm ở global state (DocumentListContext),
  // không còn gắn với route nữa, nên không bị mất khi điều hướng sang trang khác rồi quay lại.
  const { state: listState, setActiveTab } = useDocumentListContext();
  const { activeTab } = listState;
  const {
    globalState: { selectedCompanyId, waitingCounts },
  } = useGlobalContext();
  const waitingCount = selectedCompanyId
    ? waitingCounts[selectedCompanyId] ?? 0
    : 0;

  const { available: canCollapse, toggle } = useListPanelVisibility();
  const hideLabel = `Ẩn danh sách ${documentName}`;

  return (
    <ContainerStl>
      <HeaderStl>
        <CompanyRowStl>
          <CompanyHighlightStl>
            <BankOutlined style={{ fontSize: 16 }} />
            <CompanySelectWrapperStl>
              <GlobalCompanySelector compact />
            </CompanySelectWrapperStl>
          </CompanyHighlightStl>
          {canCollapse && (
            <Button
              icon={<DoubleLeftOutlined />}
              style={{ flex: "0 0 32px", width: 32 }}
              onClick={toggle}
              title={hideLabel}
              aria-label={hideLabel}
            />
          )}
        </CompanyRowStl>
        {features.createShortcut && (
          <ActionRowStl>
            {createFeature && (
              <Button
                type="primary"
                block
                icon={<PlusOutlined />}
                onClick={() => navigate(createFeature.path)}
              >
                {createFeature.label}
              </Button>
            )}
            <Button
              icon={<ExpandAltOutlined />}
              style={{ flex: "0 0 32px", width: 32 }}
              onClick={() => navigate("/list")}
              title="Mở danh sách mở rộng"
              aria-label="Mở danh sách mở rộng"
            />
          </ActionRowStl>
        )}
      </HeaderStl>
      <ExpandingTabBar
        items={tabs.map((t) => ({
          key: t.key,
          label: t.label,
          icon: t.icon,
          count: t.key === "waiting" ? waitingCount : 0,
        }))}
        activeKey={activeTab}
        onChange={setActiveTab}
      />
      <ListContentStl>
        <TabTable tabKey={activeTab} />
      </ListContentStl>
      <FooterIconNav features={footerFeatures} />
    </ContainerStl>
  );
};

export default DocumentListPanel;

const ContainerStl = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
  border-radius: ${radii.lg}px;
  background: ${colors.bgSurface};
  box-shadow: ${shadows.card};
`;

const HeaderStl = styled.div`
  width: 100%;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 8px 0;
`;

const CompanyRowStl = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ActionRowStl = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
`;

// Nổi bật để nhắc người dùng chọn đúng công ty trước khi thao tác
const CompanyHighlightStl = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  box-sizing: border-box;
  padding: 0 6px 0 10px;
  border: 1.5px solid ${colors.primaryBorder};
  border-radius: ${radii.md}px;
  background: ${colors.primaryBg};
  color: ${colors.primary};
`;

const CompanySelectWrapperStl = styled.div`
  flex: 1;
  min-width: 0;
`;

const ListContentStl = styled.div`
  width: 100%;
  flex: 1;
  overflow: hidden;
`;
