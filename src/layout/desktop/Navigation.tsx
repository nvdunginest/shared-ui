import { FC } from "react";

import { orange } from "@ant-design/colors";
import { styled } from "styled-components";

import { useAppContext } from "../../platform/contexts/AppContext";

import NavBg from "../../assets/nav_background.png";

import AppInfo from "./AppInfo";
import NavItem from "./NavItem";

type Props = {
  /** Phiên bản app — truyền từ micro-app */
  appVersion: string;
};

const Navigation: FC<Props> = ({ appVersion }) => {
  const { state: appState } = useAppContext();

  return (
    <ContainerStl>
      <HeaderStl>
        <AppInfo appVersion={appVersion} />
      </HeaderStl>
      <ContentStl>
        {appState.sideMenu.map((m, i) => (
          <NavItem key={i} feature={m} />
        ))}
      </ContentStl>
    </ContainerStl>
  );
};

export default Navigation;

const ContainerStl = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  background-image: url(${NavBg});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;
const HeaderStl = styled.div`
  width: 100%;
  flex: 0 0 45px;
  display: flex;
  flex-direction: column;
`;
const ContentStl = styled.div`
  width: 100%;
  padding: 4px;
  flex-grow: 1;
  overflow-x: hidden;
  overflow-y: overlay;
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: inherit; }
  &::-webkit-scrollbar-thumb {
    background: ${orange[7]};
    opacity: 0.7;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover { opacity: 1; }
`;
