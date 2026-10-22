import { TabKey } from "../../context/list/type";
import { useDocumentKit } from "../../config";
import DocumentTable from "../DocumentTable";

/** The list of one scope tab (all / waiting / mine / following), wired from the app's tab configuration. */
export default function TabTable({ tabKey }: { tabKey: TabKey }): JSX.Element | null {
  const { tabs } = useDocumentKit();
  const tab = tabs.find((t) => t.key === tabKey) ?? tabs[0];
  if (!tab) return null;
  return (
    <DocumentTable
      tabKey={tab.key}
      apiMethod={tab.apiMethod}
      viewItemComponent={tab.viewItemComponent}
      hasStatusFilter={tab.hasStatusFilter}
      hasDepartmentFilter={tab.hasDepartmentFilter}
      hasSectorFilter={tab.hasSectorFilter}
      hasProjectFilter={tab.hasProjectFilter}
    />
  );
}
