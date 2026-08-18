import { PropsWithChildren } from "react";

import { green } from "@ant-design/colors";
import { Card, Flex, Typography } from "antd";

type Props = PropsWithChildren & {
  title: string;
  icon: React.ReactNode;
  extra?: React.ReactNode;
};

export default function Section({ title, icon, extra, children }: Props): JSX.Element {
  return (
    <Card
      size="small"
      style={{ width: "100%", height: "100%" }}
      styles={{
        header: { backgroundColor: green[9], color: "white" },
        body: {
          padding: "4px",
          width: "100%",
          height: "calc(100% - 36px)",
          overflow: "hidden",
        },
      }}
      title={
        <Flex gap={4} style={{ width: "100%" }}>
          {icon}
          <Typography.Text
            style={{
              flex: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              width: "100%",
              textOverflow: "ellipsis",
              color: "white",
            }}
          >
            {title}
          </Typography.Text>
        </Flex>
      }
      extra={<Flex gap={4}>{extra}</Flex>}
    >
      {children}
    </Card>
  );
}
