import { useAppContext } from "../../platform/contexts/AppContext";
import { Typography } from "antd";
import styled from "styled-components";

import ServiceVersion from "../ServiceVersion";
import TeamsAppVersion from "../TeamsAppVersion";

type Props = {
  /** Phiên bản app — lấy từ package.json của micro-app (import pkg from './package.json') */
  appVersion: string;
};

const AppInfo: React.FC<Props> = ({ appVersion }) => {
  const { state: appState } = useAppContext();

  return (
    <ContainerStl>
      {appState.logoUrl && (
        <SiderStl>
          <img src={appState.logoUrl} alt="App Logo" style={{ width: "100%" }} />
        </SiderStl>
      )}
      <ContentStl>
        <Typography.Title level={2} style={{ textTransform: "uppercase", color: "white" }}>
          {appState.appName}
        </Typography.Title>
        <FooterStl>
          <TeamsAppVersion version={appVersion} />
          <ServiceVersion />
        </FooterStl>
      </ContentStl>
    </ContainerStl>
  );
};

export default AppInfo;

const ContainerStl = styled.div`
  width: 100%;
  padding: 8px 8px 2px 8px;
  display: flex;
  justify-content: center;
`;
const SiderStl = styled.div`
  width: 45px;
  height: 100%;
  flex-shrink: 0;
  padding: 2px;
  margin-right: 8px;
`;
const ContentStl = styled.div`
  height: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;
const FooterStl = styled.div`
  flex: 0 0;
  padding: 2px;
  display: flex;
  gap: 8px;
`;
