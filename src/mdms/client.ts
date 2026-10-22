import type { AxiosInstance } from "axios";

import { axiosBuilder } from "@ptht365/shared-ui/platform";

let baseUrl: string | null = null;
let instance: AxiosInstance | null = null;

/**
 * Sets the base URL of the dta-mdms API. Each app calls it once before the first mdms request
 * (it knows its own environment variable); the auth-wired instance is created on first use.
 */
export function configureMdms(options: { baseUrl: string }): void {
  baseUrl = options.baseUrl;
  instance = null;
}

export async function getDtaMdmsInstance(): Promise<AxiosInstance> {
  if (instance) return instance;
  if (baseUrl === null) throw new Error("mdms: configureMdms({ baseUrl }) was not called");
  // The host's auth factory wires in token injection and refresh (see ./platform axiosBuilder).
  const created = axiosBuilder.createInstance(baseUrl);
  instance = created;
  return created;
}
