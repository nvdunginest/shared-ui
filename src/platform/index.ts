// Lightweight entry point (see package.json "exports"."./platform" and tsup.config.ts).
// Lets the host configure the shared axios builder at startup without importing the
// default barrel (`.`), which pulls in ckeditor5 and the PDF viewer.
// tsup `splitting` keeps axios.instance in one shared chunk, so this entry and the barrel
// resolve to the same singleton instance.
export { default as axiosBuilder, getBaseUrl } from "./axios.instance";
export type { InstanceFactory } from "./axios.instance";
