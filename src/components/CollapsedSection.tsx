import { PropsWithChildren, useEffect, useRef, useState } from "react";

import { green } from "@ant-design/colors";
import { DownCircleOutlined, UpCircleOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Typography } from "antd";
import styled from "styled-components";

type Props = PropsWithChildren & {
  title: string;
  icon: React.ReactNode;
  extra?: React.ReactNode;
};

export default function CollapsedSection({ title, icon, extra, children }: Props): JSX.Element {
  const [collapsed, setCollapsed] = useState(false);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [maxHeight, setMaxHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setMaxHeight(entry.target.scrollHeight + 8);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Card
      size="small"
      styles={{
        header: { backgroundColor: green[9], color: "white" },
        body: { padding: "4px" },
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
      extra={
        <Flex gap={4}>
          {collapsed ? null : extra}
          <Button
            type="default"
            size="small"
            icon={collapsed ? <DownCircleOutlined /> : <UpCircleOutlined />}
            onClick={() => setCollapsed((c) => !c)}
          />
        </Flex>
      }
    >
      <AnimatedContent
        $collapsed={collapsed}
        style={{ maxHeight: collapsed ? 0 : (maxHeight ?? undefined) }}
      >
        <MeasureHeight ref={measureRef}>
          <InnerFade $collapsed={collapsed}>{children}</InnerFade>
        </MeasureHeight>
      </AnimatedContent>
    </Card>
  );
}

const AnimatedContent = styled.div<{ $collapsed: boolean }>`
  overflow: hidden;
  transition: max-height 0.3s ease;
  padding: 4px 0;
`;

const InnerFade = styled.div<{ $collapsed: boolean }>`
  opacity: ${(p) => (p.$collapsed ? 0 : 1)};
  transition: opacity 0.25s ease;
`;

const MeasureHeight = styled.div`
  width: 100%;
  height: fit-content;
`;
