import { useEffect, useMemo, useState } from "react";
import { CheckOutlined, SearchOutlined, SwapOutlined } from "@ant-design/icons";
import { useDocumentListContext } from "../context/list/index";
import { useGlobalContext } from '../context/global/index';
import { colors, radii, shadows, spacing } from "../../theme";
import { removeVietnameseTones } from "../../text-utils";
import { Badge, Empty, Input, Modal, Select } from "antd";
import { UUID } from "crypto";
import { styled } from "styled-components";

type Props = {
  // Ẩn nhãn "Chọn công ty:" và hiển thị dạng info + nút "Chuyển công ty" (mở
  // pick-up modal) thay vì dropdown — dùng khi đặt trong không gian hẹp
  // (panel danh sách bên trái của OutlookShell), khác với header rộng mặc định.
  compact?: boolean;
};

// Số hồ sơ "Chưa xử lý" tối đa hiển thị trước khi rút gọn thành "99+" (BR-03,
// docs/backlog/unprocessed-count-badge.md).
const WAITING_COUNT_OVERFLOW = 99;

export default function GlobalCompanySelector({ compact = false }: Props): JSX.Element | null {
  const {
    globalState: { companies, selectedCompanyId, waitingCounts },
    setSelectedCompanyId,
  } = useGlobalContext();
  const { setPendingCompanySwitch } = useDocumentListContext();

  useEffect(() => {
    // Empty list = still loading (or failed): GlobalLoader clears the selection itself when the list comes back
    // empty. Clearing it here would drop the remembered company while loading and refetch everything once it returns.
    if (companies.length === 0) return;

    const isSelectedCompanyValid = !!selectedCompanyId
      && companies.some((company) => company.id === selectedCompanyId);

    if (!isSelectedCompanyValid) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId, setSelectedCompanyId]);

  const handleSelect = (value: UUID) => {
    // Chỉ selector compact (gắn trong DocumentListPanel) mới điều khiển việc
    // tự mở tờ trình đầu tiên của danh sách mới sau khi đổi công ty.
    if (compact) {
      setPendingCompanySwitch(true);
    }
    setSelectedCompanyId(value);
  };

  if (compact) {
    return (
      <CompanySwitcher
        companies={companies}
        selectedCompanyId={selectedCompanyId}
        waitingCounts={waitingCounts}
        onSelect={handleSelect}
      />
    );
  }

  const options = companies.map((company) => ({
    value: company.id,
    label: `${company.companyCode} - ${company.companyName}`,
  }));

  return (
    <ContainerStl>
      <LabelTextStl>Chọn công ty:</LabelTextStl>
      <Select
        size="small"
        style={{ width: 250 }}
        value={selectedCompanyId}
        onChange={(value) => handleSelect(value as UUID)}
        options={options}
        optionRender={(option) => (
          <OptionRowStl>
            <span>{option.label}</span>
            <WaitingCountBadge count={waitingCounts[option.value as string] ?? 0} />
          </OptionRowStl>
        )}
      />
    </ContainerStl>
  );
}

type Company = { id: UUID; companyCode: string; companyName: string };

type SwitcherProps = {
  companies: Company[];
  selectedCompanyId: UUID | undefined;
  waitingCounts: Record<string, number>;
  onSelect: (value: UUID) => void;
};

// Badge số hồ sơ "Chưa xử lý" của 1 công ty — ẩn hẳn khi count = 0 (BR-02), rút gọn
// thành "99+" khi vượt ngưỡng (BR-03).
function WaitingCountBadge({ count }: { count: number }): JSX.Element | null {
  if (!count || count <= 0) return null;
  return <Badge count={count} overflowCount={WAITING_COUNT_OVERFLOW} size="small" />;
}

// Hiển thị thông tin công ty hiện tại (dạng text, không phải input) kèm nút
// "Chuyển công ty" mở pick-up modal — thay cho dropdown, tránh đổi nhầm công
// ty khi chỉ lướt qua danh sách như Select trước đây.
function CompanySwitcher({ companies, selectedCompanyId, waitingCounts, onSelect }: SwitcherProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = companies.find((c) => c.id === selectedCompanyId);
  const selectedWaitingCount = selected ? waitingCounts[selected.id] ?? 0 : 0;

  const filtered = useMemo(() => {
    const normalized = removeVietnameseTones(search).toLowerCase().trim();
    if (!normalized) return companies;

    return companies.filter((c) =>
      removeVietnameseTones(`${c.companyCode} ${c.companyName}`)
        .toLowerCase()
        .includes(normalized)
    );
  }, [companies, search]);

  const handleOpen = () => {
    setSearch("");
    setOpen(true);
  };

  const handlePick = (company: Company) => {
    onSelect(company.id);
    setOpen(false);
  };

  return (
    <>
      <ContainerStl>
        <CompanyNameStl title={selected ? `${selected.companyCode} - ${selected.companyName}` : undefined}>
          {selected ? `${selected.companyCode} - ${selected.companyName}` : "Chưa chọn công ty"}
        </CompanyNameStl>
        <WaitingCountBadge count={selectedWaitingCount} />
        <SwitchButtonStl type="button" title="Chuyển công ty" onClick={handleOpen}>
          <SwapOutlined style={{ fontSize: 14 }} />
        </SwitchButtonStl>
      </ContainerStl>

      <Modal
        title="Chuyển công ty"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        closeIcon={false}
      >
        <Input
          autoFocus
          allowClear
          prefix={<SearchOutlined style={{ color: colors.textQuaternary }} />}
          placeholder="Tìm theo mã hoặc tên công ty..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ListStl>
          {filtered.length === 0 && (
            <Empty description="Không tìm thấy công ty" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
          {filtered.map((company) => (
            <ListItemStl
              key={company.id}
              $selected={company.id === selectedCompanyId}
              onClick={() => handlePick(company)}
            >
              <ListItemTextStl>
                <ListItemCodeStl>{company.companyCode}</ListItemCodeStl>
                <ListItemNameStl>{company.companyName}</ListItemNameStl>
              </ListItemTextStl>
              <ListItemTrailingStl>
                <WaitingCountBadge count={waitingCounts[company.id] ?? 0} />
                {company.id === selectedCompanyId && <CheckOutlined style={{ color: colors.primary }} />}
              </ListItemTrailingStl>
            </ListItemStl>
          ))}
        </ListStl>
      </Modal>
    </>
  );
}

const ContainerStl = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm}px;
  min-width: 0;
`;

const LabelTextStl = styled.span`
  color: ${colors.textSecondary};
  font-size: 12px;
`;

const OptionRowStl = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.sm}px;
`;

const CompanyNameStl = styled.span`
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SwitchButtonStl = styled.button`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${colors.primaryBorder};
  border-radius: ${radii.sm}px;
  background: ${colors.bgSurface};
  color: ${colors.primary};
  cursor: pointer;

  &:hover {
    background: ${colors.primaryBg};
  }
`;

const ListStl = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs}px;
  max-height: 320px;
  overflow-y: auto;
  margin-top: ${spacing.sm}px;
`;

const ListItemStl = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.sm}px;
  padding: ${spacing.sm}px ${spacing.md}px;
  border-radius: ${radii.md}px;
  border: 1px solid ${({ $selected }) => ($selected ? colors.primaryBorder : "transparent")};
  background: ${({ $selected }) => ($selected ? colors.primaryBg : colors.bgSurface)};
  cursor: pointer;
  box-shadow: ${({ $selected }) => ($selected ? shadows.card : "none")};

  &:hover {
    background: ${({ $selected }) => ($selected ? colors.primaryBg : colors.bgMuted)};
  }
`;

const ListItemTextStl = styled.div`
  display: flex;
  flex-direction: column;
`;

const ListItemTrailingStl = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: ${spacing.sm}px;
`;

const ListItemCodeStl = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${colors.textTertiary};
`;

const ListItemNameStl = styled.span`
  font-size: 14px;
  color: ${colors.textHeading};
`;
