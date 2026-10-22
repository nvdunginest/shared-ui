import { ReactNode } from "react";
import { colors } from "../../theme";
import { Badge } from "antd";
import styled from "styled-components";

const BADGE_MAX = 99;

export type ExpandingTabItem<K extends string> = {
  key: K;
  label: string;
  icon: ReactNode;
  /** Badge on the icon, hidden when 0 or missing. */
  count?: number;
};

type Props<K extends string> = {
  items: ExpandingTabItem<K>[];
  activeKey: K;
  onChange: (key: K) => void;
};

/**
 * Tab bar like the Mail tab bar on macOS: the selected tab grows to show its icon and name, the
 * others shrink to an icon-only 44px target. Only flex-grow changes, so the width animates. It
 * renders the bar only; the caller shows the content of the active tab.
 */
export default function ExpandingTabBar<K extends string>({
  items,
  activeKey,
  onChange,
}: Props<K>): JSX.Element {
  return (
    <TabBarStl>
      {items.map((item) => {
        const selected = item.key === activeKey;
        return (
          <TabItemStl
            key={item.key}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-label={item.label}
            title={item.label}
            className={selected ? "active" : ""}
            onClick={() => onChange(item.key)}
          >
            <Badge count={item.count ?? 0} overflowCount={BADGE_MAX} size="small" offset={[4, -2]}>
              <TabIconStl>{item.icon}</TabIconStl>
            </Badge>
            {selected && <TabLabelStl>{item.label}</TabLabelStl>}
          </TabItemStl>
        );
      })}
    </TabBarStl>
  );
}

const TabBarStl = styled.div.attrs({ role: "tablist" })`
  display: flex;
  flex: 0 0 auto;
  border-bottom: 1px solid ${colors.borderDivider};
`;

const TabItemStl = styled.button`
  flex: 0 0 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 4px;
  overflow: hidden;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: ${colors.textTertiary};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: flex-grow 0.25s ease;

  &.active {
    flex-grow: 1;
    color: ${colors.primary};
    border-bottom-color: ${colors.primary};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const TabIconStl = styled.span`
  display: flex;
  align-items: center;
  font-size: 17px;
`;

const TabLabelStl = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
