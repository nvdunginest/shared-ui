import { FC, PropsWithChildren } from "react";

import { styled } from "styled-components";

import Navigation from "./Navigation";

type Props = PropsWithChildren & {
  /** Phiên bản app — truyền từ micro-app (import pkg from './package.json') */
  appVersion: string;
};

const DesktopLayout: FC<Props> = ({ children, appVersion }: Props) => {
  return (
    <ContainerStl>
      <SiderStl>
        <Navigation appVersion={appVersion} />
      </SiderStl>
      <ContentStl>{children}</ContentStl>
    </ContainerStl>
  );
};

export default DesktopLayout;

const ContainerStl = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  padding: 4px;
  gap: 4px;
`;
const SiderStl = styled.div`
  width: 280px;
  height: 100%;
  flex-shrink: 0;
`;
const ContentStl = styled.div`
  height: 100%;
  flex-grow: 1;
  overflow: hidden;
`;
