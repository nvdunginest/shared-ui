// navigation.ts
import { NavigateFunction } from "react-router-dom";

let navigate: NavigateFunction | null = null;

export function setNavigate(fn: NavigateFunction) {
  navigate = fn;
}

export function navigateTo(
  path: string,
  options?: { replace?: boolean; state?: unknown }
) {
  if (navigate) {
    navigate(path, options);
  } else {
    console.warn("Navigate function chưa được khởi tạo!");
  }
}
