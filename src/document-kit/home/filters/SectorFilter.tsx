import { useEffect, useState } from "react";
import { FilterOutlined } from "@ant-design/icons";
import { useGlobalContext } from "../../context/global/index";
import type { ISector } from "../../../mdms";
import { TitleBar } from "../../../ui";
import { POPOVER_CONTENT_WIDTH } from "../../../theme";
import { removeVietnameseTones } from "../../../text-utils";
import { Button, Flex, Input, Popover } from "antd";

import CheckList, { CheckListItem, CheckListProps } from "./CheckList";
import FilterFooter from "./FilterFooter";

type Props = {
  checkedKeysProp: string[];
  setCheckedKeysProp: (keys: string[]) => void;
};

const filterOption = (input: string, option: ISector) => {
  if (
    removeVietnameseTones(option.sectorName)
      .toLowerCase()
      .includes(removeVietnameseTones(input).toLowerCase())
  )
    return true;

  return false;
};

export default function SectorFilter({
  checkedKeysProp,
  setCheckedKeysProp,
}: Props): JSX.Element {
  const { sectors } = useGlobalContext().globalState;

  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [data, setData] = useState<CheckListItem[]>([]);
  const [keyword, setKeyword] = useState<string | undefined>();

  const [open, setOpen] = useState(false);
  const handleOpenChange = () => {
    setOpen((prev) => !prev);
  };

  const onCheck: CheckListProps["onCheck"] = (checkedKeysValue) => {
    setCheckedKeys(checkedKeysValue as string[]);
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
      sectors
        .filter((c) => !keyword || filterOption(keyword, c))
        .map((c) => ({
          title: `${c.sectorName}`,
          key: c.id,
        }))
    );
  }, [sectors, keyword]);

  useEffect(() => {
    setCheckedKeys(checkedKeysProp);
  }, [checkedKeysProp, open]);

  return (
    <Popover
      title={
        <TitleBar
          title="Lọc theo Hoạt động"
          onClose={() => setOpen(false)}
        />
      }
      content={
        <Flex vertical gap={8}>
          <Input.Search
            placeholder="Tìm kiếm hoạt động..."
            size="small"
            onChange={(e) => {
              setKeyword(e.currentTarget?.value);
            }}
          />
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
        Hoạt động
      </Button>
    </Popover>
  );
}
