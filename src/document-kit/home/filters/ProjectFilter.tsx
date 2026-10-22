import { useEffect, useState } from "react";
import { FilterOutlined } from "@ant-design/icons";
import { useGlobalContext } from "../../context/global/index";
import { formatProjectLabel, sortByProjectCode } from "../../../mdms";
import type { IProject } from "../../../mdms";
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

const filterOption = (input: string, option: IProject) =>
  removeVietnameseTones(`${option.projectCode} ${option.projectName}`)
    .toLowerCase()
    .includes(removeVietnameseTones(input).toLowerCase());

/** Project filter — lists ALL projects incl. locked ones (AC3 US-06). */
export default function ProjectFilter({
  checkedKeysProp,
  setCheckedKeysProp,
}: Props): JSX.Element {
  const { projects } = useGlobalContext().globalState;

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
      sortByProjectCode(projects)
        .filter((p) => !keyword || filterOption(keyword, p))
        .map((p) => ({
          title: formatProjectLabel(p),
          key: p.id,
        }))
    );
  }, [projects, keyword]);

  useEffect(() => {
    setCheckedKeys(checkedKeysProp);
  }, [checkedKeysProp, open]);

  return (
    <Popover
      title={
        <TitleBar
          title="Lọc theo Dự án"
          onClose={() => setOpen(false)}
        />
      }
      content={
        <Flex vertical gap={8}>
          <Input.Search
            placeholder="Tìm kiếm dự án..."
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
        Dự án
      </Button>
    </Popover>
  );
}
