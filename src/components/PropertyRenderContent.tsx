import { FC } from "react";

import { styled } from "styled-components";

const PropertyRenderContent: FC<{
  icon: JSX.Element;
  label: JSX.Element | string;
  value: JSX.Element | string;
}> = ({ icon, label, value }) => {
  return (
    <WrapperStl>
      <IconStl>{icon}</IconStl>
      <LabelStl>{label}</LabelStl>:<ValueStl>{value}</ValueStl>
    </WrapperStl>
  );
};

export default PropertyRenderContent;

const WrapperStl = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
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
