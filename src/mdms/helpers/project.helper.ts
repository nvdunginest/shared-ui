import type { UUID } from "crypto";

import type IProject from "../models/IProject";

export const UNKNOWN_LABEL = "Không xác định";

/** "DA001 — Dự án ABC" (AC3 US-01). */
export function formatProjectLabel(p: IProject): string {
  return `${p.projectCode} — ${p.projectName}`;
}

/** Copy sorted by project code ascending (AC3 US-01). */
export function sortByProjectCode(items: IProject[]): IProject[] {
  return [...items].sort((a, b) => a.projectCode.localeCompare(b.projectCode));
}

/** Label of the project or "Không xác định" when not found / catalog not loaded (AC4 US-05). */
export function getProjectDisplay(projects: IProject[], id?: UUID | string | null): string {
  const project = id ? projects.find((p) => p.id === id) : undefined;
  return project ? formatProjectLabel(project) : UNKNOWN_LABEL;
}
