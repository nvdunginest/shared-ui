import React from "react";

import { WarningOutlined } from "@ant-design/icons";
import { Alert, Space } from "antd";

import { useDeviceType } from "./useDeviceType";

interface ResponsiveWrapperProps {
  desktop: React.ReactNode;
  mobile?: React.ReactNode;
}

const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({ desktop, mobile }) => {
  const device = useDeviceType();

  if (device === "xs" || device === "sm" || device === "md") {
    if (mobile) {
      return <>{mobile}</>;
    }
    return (
      <>
        {desktop}
        <Alert
          type="warning"
          message={
            <Space>
              <WarningOutlined />
              Giao diện này chưa được tối ưu cho thiết bị di động!
            </Space>
          }
          style={{ position: "fixed", bottom: 60, left: 0, right: 0, margin: 0, zIndex: 1000 }}
        />
      </>
    );
  }

  return <>{desktop}</>;
};

export default ResponsiveWrapper;
