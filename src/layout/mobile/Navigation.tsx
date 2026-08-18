import { FC, useMemo } from "react";

import { green } from "@ant-design/colors";
import { styled } from "styled-components";

import { useAppContext } from "../../platform/contexts/AppContext";

import { hasActive } from "./MoreButton";
import NavItem from "./NavItem";

const Navigation: FC = () => {
  const { state: appState } = useAppContext();

  const features = useMemo(
    () => appState.sideMenu.filter((f) => hasActive(f, appState.userRoles)),
    [appState.sideMenu, appState.userRoles]
  );

  return (
    <ContainerStl>
      <ContentStl>
        {features.slice(0, Math.min(2, features.length)).map((feature, idx) => (
          <NavItem key={idx} feature={feature} />
        ))}
      </ContentStl>

      <LogoStl $logoUrl={appState.logoUrl} />

      <ContentStl>
        {features.length <= 4 &&
          features.slice(2, 4).map((feature, idx) => (
            <NavItem key={idx + 2} feature={feature} />
          ))}
        {features.length > 4 && (
          <>
            {features.slice(2, 3).map((feature, idx) => (
              <NavItem key={idx + 2} feature={feature} />
            ))}
          </>
        )}
      </ContentStl>
    </ContainerStl>
  );
};

export default Navigation;

const ContainerStl = styled.div`
  width: 100%;
  height: 54px;
  background-color: ${green[9]};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  margin-bottom: 10px;
`;

const LogoStl = styled.div<{ $logoUrl: string }>`
  width: 56px;
  height: 56px;
  margin-top: -12px;
  background: white;
  border-radius: 50%;
  border: 1px solid white;
  box-shadow: 0 6px 14px;
  background-image: url(${({ $logoUrl }) => $logoUrl});
  background-size: 95%;
  background-repeat: no-repeat;
  background-position: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.25s;
  &:active { transform: scale(0.95); }
`;

const ContentStl = styled.div`
  display: flex;
  gap: 2px;
  flex: 1;
  justify-content: flex-start;
  align-items: center;
`;
