import { useEffect, useState } from "react";
import { FilterOutlined } from "@ant-design/icons";
import { useGlobalContext } from "../../context/global/index";
import type { IDepartment } from "../../../mdms";
import { TitleBar } from "../../../ui";
import { POPOVER_CONTENT_WIDTH } from "../../../theme";
import { Button, Flex, Popover, Tree, TreeDataNode, TreeProps } from "antd";

import FilterFooter from "./FilterFooter";

const renderChildren = (
  department: IDepartment,
  departments: IDepartment[]
): TreeDataNode[] => {
  const children = departments.filter((d) => d.parentId === department.id);
  return children.map((child) => ({
    title: child.departmentName,
    key: child.id,
    children: renderChildren(child, departments),
  }));
};

type Props = {
  checkedKeysProp: string[];
  setCheckedKeysProp: (keys: string[]) => void;
};

export default function DepartmentFilter({
  checkedKeysProp,
  setCheckedKeysProp,
}: Props): JSX.Element {
  const { departments, selectedCompanyId } = useGlobalContext().globalState;

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  const [open, setOpen] = useState(false);
  const handleOpenChange = () => {
    setOpen((prev) => !prev);
  };

  const onExpand: TreeProps["onExpand"] = (expandedKeysValue) => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const onCheck: TreeProps["onCheck"] = (checkedKeysValue) => {
    setCheckedKeys(checkedKeysValue as string[]);
  };

  const onSelect: TreeProps["onSelect"] = (selectedKeysValue, _info) => {
    setSelectedKeys(selectedKeysValue);
  };

  const handleApply = () => {
    setCheckedKeysProp(checkedKeys);
    setOpen(false);
  };

  const handleReset = () => {
    setCheckedKeys([]);
  };

  useEffect(() => {
    setTreeData(
      departments
        .filter(d => d.companyId === selectedCompanyId)
        .filter((d) => !d.parentId)
        .map((d) => ({
          title: d.departmentName,
          key: d.id,
          children: renderChildren(d, departments),
        }))
    );
  }, [departments, selectedCompanyId]);

  useEffect(() => {
    setCheckedKeys(checkedKeysProp);
  }, [checkedKeysProp, open]);

  return (
    <Popover
      title={
        <TitleBar
          title="Lọc theo Phòng ban/Đơn vị"
          onClose={() => setOpen(false)}
        />
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
            <Tree
              checkable
              onExpand={onExpand}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              onCheck={onCheck}
              checkedKeys={checkedKeys}
              onSelect={onSelect}
              selectedKeys={selectedKeys}
              treeData={treeData}
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
        Phòng ban/Đơn vị
      </Button>
    </Popover>
  );
}
