import { useMemo } from "react";
import { useSharedUsers } from "@ptht365/shared-ui/shared-users";
import { Select, SelectProps, Typography } from "antd";
import { UUID } from "crypto";
import styled from "styled-components";

import type { IDepartment, IPosition } from "../../mdms";
import { removeVietnameseTones } from "../../text-utils";
import {
  getPersonSearchText,
  getPositionHolderLabel,
  getPositionSubtitle,
  PersonAvatar,
  UNASSIGNED_HOLDER_LABEL,
} from "../../ui";
import { filterChainActiveDepartments } from "../helpers/selectOptions.helper";

type HolderOption = {
  value: UUID;
  /** Shown in the closed select: "Name — Position". */
  label: string;
  searchText: string;
  holderName: string;
  holderId: string;
  mail: string;
  positionName: string;
  departmentName: string;
  badge: string | null;
};

type Props = Omit<SelectProps<UUID>, "options" | "optionRender" | "filterOption" | "showSearch"> & {
  departments: IDepartment[];
  companyId?: UUID | null;
  /** false = the company is switched off, so nothing is offered. */
  companyActive?: boolean;
  /** Position that must not be offered (e.g. the current processor when transferring). */
  excludePositionId?: UUID | null;
  /** Extra mark on an option ("Có thể phê duyệt"); return null for none. */
  badgeOf?: (position: IPosition) => string | null;
  /** Hide positions nobody holds (default true: a document cannot be handed to nobody). */
  onlyAssigned?: boolean;
};

/**
 * "Chọn người (chức danh)": picks an org-chart position and so the person holding it.
 * Options are grouped by department; each shows the holder first, then "Position · Department".
 * To pick a plain user from the directory use `SelectUser` instead.
 */
export default function SelectPositionHolder({
  departments,
  companyId,
  companyActive = true,
  excludePositionId,
  badgeOf,
  onlyAssigned = true,
  placeholder = "Tìm theo tên, email, chức danh...",
  ...rest
}: Props): JSX.Element {
  const { users } = useSharedUsers();

  const groups = useMemo(
    () =>
      filterChainActiveDepartments(
        departments.filter((d) => !companyId || d.companyId === companyId),
        companyActive,
      )
        .map((dept) => ({
          label: dept.departmentName,
          options: dept.positions
            .filter((p) => p.isActive && p.id !== excludePositionId && (!onlyAssigned || p.userId !== null))
            .map((p): HolderOption => {
              const holder = p.userId ? users.find((u) => u.id === p.userId) : undefined;
              return {
                value: p.id,
                label: getPositionHolderLabel(holder?.displayName, p.positionName),
                searchText: getPersonSearchText(p.positionName, dept.departmentName, holder?.displayName, holder?.mail),
                holderName: holder?.displayName ?? UNASSIGNED_HOLDER_LABEL,
                holderId: p.userId ?? "",
                mail: holder?.mail ?? "",
                positionName: p.positionName,
                departmentName: dept.departmentName,
                badge: badgeOf?.(p) ?? null,
              };
            }),
        }))
        .filter((group) => group.options.length > 0),
    [departments, companyId, companyActive, excludePositionId, onlyAssigned, badgeOf, users],
  );

  return (
    <Select<UUID>
      style={{ width: "100%" }}
      allowClear
      {...rest}
      showSearch
      placeholder={placeholder}
      options={groups}
      filterOption={(input, option) => {
        const keyword = removeVietnameseTones(input).toLowerCase().trim();
        if (!keyword) return true;
        const o = option as Partial<HolderOption> | undefined;
        return removeVietnameseTones(`${o?.label ?? ""} ${o?.searchText ?? ""}`).toLowerCase().includes(keyword);
      }}
      optionRender={(option) => {
        const o = option.data as HolderOption;
        return (
          <RowStl>
            <PersonAvatar name={o.holderName} userId={o.holderId} />
            <TextStl>
              <Typography.Text strong ellipsis>
                {o.holderName}
              </Typography.Text>
              <Typography.Text ellipsis>{getPositionSubtitle(o.positionName, o.departmentName)}</Typography.Text>
              {o.mail && (
                <Typography.Text type="secondary" ellipsis>
                  {o.mail}
                </Typography.Text>
              )}
            </TextStl>
            {o.badge && <BadgeStl>{o.badge}</BadgeStl>}
          </RowStl>
        );
      }}
    />
  );
}

const RowStl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const TextStl = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  line-height: 1.35;
`;

const BadgeStl = styled.span`
  flex: 0 0 auto;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 12px;
  color: #3a7d1f;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
`;
