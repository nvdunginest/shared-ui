import { UUID } from "crypto";

type ActivatableItem = {
  id: UUID;
  isActive: boolean;
};

/**
 * Giữ lại: (1) toàn bộ item isActive = true, (2) item có id === currentValue dù inactive
 * (giá trị đang gán cho hồ sơ hiện tại — không được ẩn, không được để trống ngoài ý muốn user).
 * currentValue = undefined/null (trường hợp Create, chưa có hồ sơ) ⇒ hành vi rút gọn thành
 * "chỉ giữ item active", tương đương lọc thuần cho US-01/US-03.
 */
function filterActiveWithCurrent<T extends ActivatableItem>(
  items: T[],
  currentValue?: UUID | null,
): T[] {
  return items.filter((item) => item.isActive || item.id === currentValue);
}

type DepartmentNode = ActivatableItem & {
  parentId?: UUID | null;
};

/**
 * Master-data mode B (selectable): "active" means the WHOLE chain — department + every ancestor +
 * company. Returns the departments whose own flag AND all ancestors' flags are active, and only when
 * the company is active. An ancestor absent from `all` does not block (cannot be verified client-side;
 * the backend is authoritative). Purely UX — the backend re-validates.
 */
function filterChainActiveDepartments<T extends DepartmentNode>(
  all: T[],
  companyActive = true,
): T[] {
  if (!companyActive) return [];

  const byId = new Map(all.map((d) => [d.id, d]));
  const cache = new Map<UUID, boolean>();

  const isChainActive = (dept: T, visiting: Set<UUID>): boolean => {
    const cached = cache.get(dept.id);
    if (cached !== undefined) return cached;
    if (visiting.has(dept.id)) return false;
    visiting.add(dept.id);

    let result = dept.isActive;
    if (result && dept.parentId) {
      const parent = byId.get(dept.parentId);
      if (parent) result = isChainActive(parent, visiting);
    }
    cache.set(dept.id, result);
    return result;
  };

  return all.filter((d) => isChainActive(d, new Set<UUID>()));
}

/**
 * Selectable departments for a dropdown: candidates whose whole chain is active (computed against
 * `all`), plus the CURRENT value even when now locked (edit keeps the document's existing value).
 */
function filterSelectableDepartments<T extends DepartmentNode>(
  candidates: T[],
  all: T[],
  currentValue?: UUID | null,
  companyActive = true,
): T[] {
  const activeIds = new Set(filterChainActiveDepartments(all, companyActive).map((d) => d.id));
  return candidates.filter((d) => activeIds.has(d.id) || d.id === currentValue);
}

/** Tier is selectable when it is active and its company is active; the CURRENT value is always kept. */
function filterSelectableTiers<T extends ActivatableItem>(
  items: T[],
  currentValue?: UUID | null,
  companyActive = true,
): T[] {
  return items.filter((item) => item.id === currentValue || (companyActive && item.isActive));
}

const selectOptionsHelper = {
  filterActiveWithCurrent,
  filterChainActiveDepartments,
  filterSelectableDepartments,
  filterSelectableTiers,
};

export default selectOptionsHelper;
export {
  filterActiveWithCurrent,
  filterChainActiveDepartments,
  filterSelectableDepartments,
  filterSelectableTiers,
};
export type { ActivatableItem };
