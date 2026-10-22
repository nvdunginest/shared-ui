import { useEffect, useState } from "react";
import { FilterOutlined } from "@ant-design/icons";
import { TitleBar } from "../../../ui";
import { POPOVER_CONTENT_WIDTH } from "../../../theme";
import { Button, Flex, Popover } from "antd";

import { useDocumentKit } from "../../config";

import CheckList, { CheckListItem, CheckListProps } from "./CheckList";
import FilterFooter from "./FilterFooter";

type Props = {
  checkedKeysProp: number[];
  setCheckedKeysProp: (keys: number[]) => void;
};

export default function StatusFilter({
  checkedKeysProp,
  setCheckedKeysProp,
}: Props): JSX.Element {
  const { statuses } = useDocumentKit();
  const [checkedKeys, setCheckedKeys] = useState<number[]>([]);
  const [data, setData] = useState<CheckListItem[]>([]);

  const [open, setOpen] = useState(false);
  const handleOpenChange = () => {
    setOpen((prev) => !prev);
  };

  const onCheck: CheckListProps["onCheck"] = (checkedKeysValue) => {
    setCheckedKeys(checkedKeysValue as number[]);
  };

  const handleApply = () => {
    setCheckedKeysProp(checkedKeys);
    setOpen(false);
  };

  const handleReset = () => {
    setCheckedKeys([]);
  };

  useEffect(() => {
    setData(
      statuses.map((s) => ({
        title: s.text,
        key: s.status,
      }))
    );
  }, [statuses]);

  useEffect(() => {
    setCheckedKeys(checkedKeysProp);
  }, [checkedKeysProp]);

  return (
    <Popover
      title={
        <TitleBar title="Lọc theo Trạng thái" onClose={() => setOpen(false)} />
      }
      content={
        <Flex vertical gap={8}>
          <div
            style={{
              height: "300px",
              overflowY: "auto",
              width: POPOVER_CONTENT_WIDTH,
              overflowX: "hidden",
            }}
          >
            <CheckList
              data={data}
              checkedKeys={checkedKeys}
              onCheck={onCheck}
            />
          </div>
          <FilterFooter onApply={handleApply} onReset={handleReset} />
        </Flex>
      }
      open={open}
      onOpenChange={handleOpenChange}
      trigger="click"
    >
      <Button
        icon={<FilterOutlined />}
        type={checkedKeysProp.length > 0 ? "primary" : "default"}
        size="small"
      >
        Trạng thái
      </Button>
    </Popover>
  );
}
