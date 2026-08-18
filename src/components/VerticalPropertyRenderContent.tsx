import { FC } from "react";

import { styled } from "styled-components";

const VerticalPropertyRenderContent: FC<{
  icon: JSX.Element;
  label: JSX.Element | string;
  value: JSX.Element | string;
}> = ({ icon, label, value }) => {
  return (
    <WrapperStl>
      <FirstRowStl>
        <IconStl>{icon}</IconStl>
        <LabelStl>{label}</LabelStl>:
      </FirstRowStl>
      <SecondRowStl>
        <ValueStl>{value}</ValueStl>
      </SecondRowStl>
    </WrapperStl>
  );
};

export default VerticalPropertyRenderContent;

const WrapperStl = styled.div`
  display: flex;
  flex-direction: column;
`;
const IconStl = styled.div`
  margin-right: 2px;
  flex-shrink: 0;
`;
const LabelStl = styled.div`
  width: 100px;
  flex-shrink: 0;
`;
const ValueStl = styled.div`
  margin-left: 2px;
  flex-grow: 1;
`;
const FirstRowStl = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;
const SecondRowStl = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 4px;
  border-left: 2px solid #524aec;
`;
