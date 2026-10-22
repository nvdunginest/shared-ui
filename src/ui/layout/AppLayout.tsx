import { FC, PropsWithChildren } from "react";
import { styled } from "styled-components";

type Props = PropsWithChildren;

const AppLayout: FC<Props> = ({ children }: Props) => {
  return <ContainerStl>{children}</ContainerStl>;
};

export default AppLayout;

const ContainerStl = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;

  overflow: hidden;
  padding: 4px;
`;
