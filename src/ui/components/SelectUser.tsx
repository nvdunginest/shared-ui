import { useState } from "react";
import { removeVietnameseTones } from "../../utils";
import { ISharedUser, useSharedUsers } from "@ptht365/shared-ui/shared-users";
import { Select } from "antd";
import { UUID } from "crypto";

import UserInfo from "./UserInfo";

type UserOption = ISharedUser & {
  label: string;
  value: UUID;
};

type Props = {
  placeholder?: string;
  name?: string;
  mode?: "multiple";
  size?: "small" | "middle" | "large";
  width?: string;
  value?: UUID | UUID[];
  className?: string;
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
  className,
  onChange,
}: Props): JSX.Element {
  const { users } = useSharedUsers();
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
      className={className}
      style={{
        width: width,
      }}
      showSearch
      value={currentValue}
      size={size}
      mode={mode}
      placeholder={placeholder}
      onChange={handleChange}
      filterOption={filterOption}
      options={users.map((user): UserOption => {
        return {
          ...user,
          label: user.displayName,
          value: user.id as UUID,
        };
      })}
      optionRender={(option) =>
        option.value ? <UserInfo userId={option.value as UUID} /> : null
      }
      allowClear
    />
  );
}
