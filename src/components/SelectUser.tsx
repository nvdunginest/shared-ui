import { useState } from "react";

import { UUID } from "crypto";

import { Select } from "antd";

import { useAppContext } from "../platform/contexts/AppContext";
import IUser from "../platform/models/IUser";
import { removeVietnameseTones } from "../utils";

import UserInfo from "./UserInfo";

type UserOption = IUser & {
  label: string;
  value: UUID;
};

type Props = {
  placeholder?: string;
  mode?: "multiple";
  size?: "small" | "middle" | "large";
  width?: string;
  value?: UUID | UUID[];
  onFocus?: () => void;
  onChange?: (
    value: UUID | UUID[] | undefined,
    option: UserOption | UserOption[] | undefined
  ) => void;
};

const filterOption = (input: string, option?: UserOption) => {
  if (option === undefined) return false;
  if (
    removeVietnameseTones(option?.label ?? "")
      .toLowerCase()
      .includes(removeVietnameseTones(input).toLowerCase())
  )
    return true;
  if (option.mail.toUpperCase().includes(input.toUpperCase())) return true;
  return false;
};

export default function SelectUser({
  size = "small",
  placeholder = "Chọn nhân sự",
  mode,
  width = "100%",
  value,
  onChange,
}: Props): JSX.Element {
  const { users } = useAppContext().state;
  const [innerValue, setInnerValue] = useState<UUID | UUID[] | undefined>(undefined);
  const currentValue = value !== undefined ? value : innerValue;

  const handleChange = (
    nextValue: UUID | UUID[] | undefined,
    option: UserOption | UserOption[] | undefined
  ) => {
    if (value === undefined) setInnerValue(nextValue);
    if (onChange) onChange(nextValue, option);
  };

  return (
    <Select
      style={{ width }}
      showSearch
      value={currentValue}
      size={size}
      mode={mode}
      placeholder={placeholder}
      onChange={handleChange}
      filterOption={filterOption}
      options={users.map((user): UserOption => ({
        ...user,
        label: user.displayName,
        value: user.id,
      }))}
      optionRender={(option) =>
        option.value ? <UserInfo userId={option.value as UUID} /> : null
      }
      allowClear
    />
  );
}
