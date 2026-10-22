import { CloseOutlined } from "@ant-design/icons";
import { TabFilterState } from "../context/list/index";
import { useGlobalContext } from "../context/global/index";
import { Tag } from "antd";
import styled from "styled-components";

import { getProjectDisplay } from "../../mdms";
import { colors, radii } from "../../theme";
import { useDocumentKit } from "../config";

type ActiveFilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};

type Props = {
  filters: TabFilterState;
  onChange: (patch: Partial<TabFilterState>) => void;
  // Single line that scrolls sideways instead of wrapping (narrow list keeps it to one row).
  singleLine?: boolean;
};

/**
 * Pure summary of currently applied structured filters (status/sector/department).
 * Reused both inside AdvancedSearchModal ("ĐANG LỌC" row) and collapsed under the
 * search bar in the list panel header — same component, same removal behavior
 * (calls setTabFilter through onChange, no new API/param shape).
 */
export default function ActiveFilterChips({ filters, onChange, singleLine = false }: Props): JSX.Element | null {
  const { departments, sectors, projects } = useGlobalContext().globalState;
  const { statuses } = useDocumentKit();

  const chips: ActiveFilterChip[] = [
    ...filters.statuses.map((status): ActiveFilterChip => ({
      key: `status-${status}`,
      label: statuses.find((s) => s.status === status)?.text ?? String(status),
      onRemove: () =>
        onChange({
          statuses: filters.statuses.filter((s) => s !== status),
          page: 1,
        }),
    })),
    ...filters.sectorIds.map((id): ActiveFilterChip => ({
      key: `sector-${id}`,
      label: sectors.find((s) => s.id === id)?.sectorName ?? id,
      onRemove: () =>
        onChange({
          sectorIds: filters.sectorIds.filter((s) => s !== id),
          page: 1,
        }),
    })),
    ...filters.departmentIds.map((id): ActiveFilterChip => ({
      key: `department-${id}`,
      label: departments.find((d) => d.id === id)?.departmentName ?? id,
      onRemove: () =>
        onChange({
          departmentIds: filters.departmentIds.filter((d) => d !== id),
          page: 1,
        }),
    })),
    ...filters.projectIds.map((id): ActiveFilterChip => ({
      key: `project-${id}`,
      label: getProjectDisplay(projects, id),
      onRemove: () =>
        onChange({
          projectIds: filters.projectIds.filter((p) => p !== id),
          page: 1,
        }),
    })),
  ];

  if (chips.length === 0) return null;

  return (
    <ChipsRowStl $singleLine={singleLine}>
      {chips.map((chip) => (
        <Tag
          key={chip.key}
          closeIcon={<CloseOutlined style={{ fontSize: 10 }} />}
          onClose={chip.onRemove}
          style={{
            borderRadius: radii.pill,
            background: colors.primaryBg,
            borderColor: colors.primaryBorder,
            color: colors.primary,
            margin: 0,
          }}
        >
          {chip.label}
        </Tag>
      ))}
    </ChipsRowStl>
  );
}

const ChipsRowStl = styled.div<{ $singleLine: boolean }>`
  display: flex;
  flex-wrap: ${({ $singleLine }) => ($singleLine ? "nowrap" : "wrap")};
  gap: 6px;
  ${({ $singleLine }) =>
    $singleLine
      ? `
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
    > * { flex-shrink: 0; }
  `
      : ""}
`;
