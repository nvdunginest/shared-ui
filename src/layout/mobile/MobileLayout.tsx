import { FC, PropsWithChildren } from "react";

import { styled } from "styled-components";

import Navigation from "./Navigation";

type Props = PropsWithChildren;

const MobileLayout: FC<Props> = ({ children }: Props) => {
  return (
    <ContainerStl>
      <ContentStl>{children}</ContentStl>
      <FooterStl>
        <Navigation />
      </FooterStl>
    </ContainerStl>
  );
};

export default MobileLayout;

const ContainerStl = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  gap: 8px;
`;
const FooterStl = styled.div`
  width: 100%;
  height: 54px;
  flex-shrink: 0;
`;
const ContentStl = styled.div`
  width: 100%;
  flex-grow: 1;
  padding: 4px;
  overflow: hidden;
`;
