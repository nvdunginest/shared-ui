import { PropsWithChildren } from "react";
import { styled } from "styled-components";

type Props = {
  noMargin?: boolean;
} & PropsWithChildren;

export default function SectionView({
  children,
  noMargin = false,
}: Props): JSX.Element {
  return (
    <WrapperStl>
      <ContentStl $noMargin={noMargin}>{children}</ContentStl>
    </WrapperStl>
  );
}

const WrapperStl = styled.div`
  width: 100%;
  padding: 6px;
`;

const ContentStl = styled.div<{ $noMargin: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
`;
