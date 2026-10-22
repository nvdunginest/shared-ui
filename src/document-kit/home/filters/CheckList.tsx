import React, { useEffect, useState } from "react";
import { Checkbox, CheckboxChangeEvent, Flex } from "antd";

export type CheckListItem = {
  key: React.Key;
  title: React.ReactNode | string;
};

export type CheckListProps = {
  data: CheckListItem[];
  checkedKeys?: React.Key[];
  onCheck?: (checkedKeys: React.Key[]) => void;
};

export default function CheckList({
  data,
  checkedKeys,
  onCheck,
}: CheckListProps) {
  const [checkedKeysState, setCheckedKeysState] = useState<React.Key[]>(
    () => checkedKeys ?? []
  );

  const handleCheck = (e: CheckboxChangeEvent, key: React.Key) => {
    let newCheckedKeys: React.Key[] = [];
    if (e.target.checked) {
      newCheckedKeys = [...(checkedKeysState || []), key];
    } else {
      newCheckedKeys = (checkedKeysState || []).filter((k) => k !== key);
    }
    setCheckedKeysState(newCheckedKeys);
    if (onCheck) {
      onCheck(newCheckedKeys);
    }
  };

  useEffect(() => {
    const dataKeySet = new Set(data.map((item) => item.key));
    setCheckedKeysState((prev) => prev.filter((k) => dataKeySet.has(k)));
  }, [data]);

  useEffect(() => {
    if (typeof checkedKeys === "undefined") return;
    setCheckedKeysState(checkedKeys);
  }, [checkedKeys]);

  return (
    <Flex vertical gap={8}>
      {data.map((item) => (
        <Checkbox
          key={item.key}
          checked={checkedKeysState.includes(item.key)}
          onChange={(e) => handleCheck(e, item.key)}
        >
          {item.title}
        </Checkbox>
      ))}
    </Flex>
  );
}
