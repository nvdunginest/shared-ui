import { FC } from "react";

import { Col } from "antd";

import PropertyRenderContent from "./PropertyRenderContent";

const PropertyRender: FC<{
  icon: JSX.Element;
  label: JSX.Element | string;
  value: JSX.Element | string;
}> = ({ icon, label, value }) => {
  return (
    <Col xs={24} md={12} lg={8} xl={6}>
      <PropertyRenderContent icon={icon} label={label} value={value} />
    </Col>
  );
};

export default PropertyRender;
