import { useEffect, useRef } from "react";
import { UUID } from "crypto";

import type { IPrincipalScope } from "../../../mdms";
import { companiesController } from "../../../mdms";
import { departmentsController } from "../../../mdms";
import { projectsController } from "../../../mdms";
import { secretariesController } from "../../../mdms";
import { sectorsController } from "../../../mdms";
import { tiersController } from "../../../mdms";

import { useDocumentKit } from "../../config";

import { useGlobalContext } from "./GlobalProvider";

export default function GlobalLoader(): JSX.Element {
  const {
    globalState,
    setCompanies,
    setSelectedCompanyId,
    setMyDepartments,
    setSectors,
    setProjects,
    setDepartments,
    setTiers,
    setMyPrincipalScopes,
    setMyPrincipalPositionIds,
    setWaitingCounts,
  } = useGlobalContext();
  const { mdms, getWaitingCounts } = useDocumentKit();
  // The config is fixed for the lifetime of the app; keep the loader effects independent of its identity.
  const mdmsRef = useRef(mdms);
  const getWaitingCountsRef = useRef(getWaitingCounts);
  const initialSelectedCompanyIdRef = useRef(globalState.selectedCompanyId);

  useEffect(() => {
    // Independent calls run together; only the waiting counts need the company list.
    const loadCompanies = async () => {
      try {
        const companies = await companiesController.getCompanies();
        setCompanies(companies);

        const isSelectedCompanyValid = !!initialSelectedCompanyIdRef.current
          && companies.some((x) => x.id === initialSelectedCompanyIdRef.current);

        setSelectedCompanyId(
          isSelectedCompanyValid
            ? initialSelectedCompanyIdRef.current
            : companies[0]?.id,
        );
        return companies;
      } catch {
        setCompanies([]);
        setSelectedCompanyId(undefined);
        return [];
      }
    };

    const loadSectors = async () => {
      if (!mdmsRef.current.sectors) return;
      try {
        setSectors(await sectorsController.getSectors());
      } catch {
        setSectors([]);
      }
    };

    const loadProjects = async () => {
      try {
        setProjects(await projectsController.getProjects());
      } catch {
        setProjects([], true);
      }
    };

    // Badge "Chưa xử lý" theo công ty (GlobalCompanySelector) — lỗi ở đây KHÔNG được chặn
    // luồng chọn công ty, chỉ đơn giản là không hiển thị badge nào (BR-05).
    const loadWaitingCounts = async (companies: Awaited<ReturnType<typeof companiesController.getCompanies>>) => {
      try {
        if (companies.length > 0) {
          const counts = await getWaitingCountsRef.current(companies.map((c) => c.id));
          setWaitingCounts(counts);
        } else {
          setWaitingCounts({});
        }
      } catch {
        setWaitingCounts({});
      }
    };

    const init = async () => {
      void loadSectors();
      void loadProjects();
      const companies = await loadCompanies();
      void loadWaitingCounts(companies);
    };

    init();
  }, [
    setCompanies,
    setSelectedCompanyId,
    setSectors,
    setProjects,
    setWaitingCounts,
  ]);

  useEffect(() => {
    const initDepartments = async () => {
      if (!globalState.selectedCompanyId) {
        setMyDepartments([]);
        setDepartments([]);
        setTiers([]);
        return;
      }

      try {
        const res = await Promise.all([
          departmentsController.getMyDepartments(globalState.selectedCompanyId),
          departmentsController.getDepartments(globalState.selectedCompanyId),
          tiersController.getTiers(globalState.selectedCompanyId),
          mdmsRef.current.principalPositions === "scopes"
            ? secretariesController
                .getMyPrincipalPositionsDetail(globalState.selectedCompanyId)
                .catch(() => [])
            : secretariesController.getMyPrincipalPositions(globalState.selectedCompanyId),
        ]);
        setMyDepartments(res[0]);
        setDepartments(res[1]);
        setTiers(res[2]);
        if (mdmsRef.current.principalPositions === "scopes") setMyPrincipalScopes(res[3] as IPrincipalScope[]);
        else setMyPrincipalPositionIds(res[3] as UUID[]);
      } catch {
        setMyDepartments([]);
        setDepartments([]);
        setTiers([]);
        if (mdmsRef.current.principalPositions === "scopes") setMyPrincipalScopes([]);
        else setMyPrincipalPositionIds([]);
      }
    };

    initDepartments();
  }, [globalState.selectedCompanyId, setMyDepartments, setDepartments, setTiers, setMyPrincipalScopes, setMyPrincipalPositionIds]);

  return <></>;
}
