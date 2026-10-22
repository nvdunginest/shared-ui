import { useEffect } from "react";
import { UserRoles } from "../../helpers/userRoles.helper";
import { axiosBuilder } from "@ptht365/shared-ui/platform";
import userRolesController from "../../controllers/userRoles.controller";
import { FETCHING_DATA } from "../../statusMessages";
import { UUID } from "crypto";
import { jwtDecode } from "jwt-decode";

import { useAppContext } from "./AppProvider";
import { IFeature } from "./type";

const SOURCE = "Khởi động ứng dụng";
const INIT_ERROR = "Gặp lỗi khi tải dữ liệu";
const INIT_SUCCESS = "Tải dữ liệu thành công";

type Props = {
  appName: string;
  sideMenu: IFeature[];
};

export default function AppLoader({ appName, sideMenu }: Props): JSX.Element {
  const {
    setUserId,
    setUserRoles,
    setLoading,
    setStatus,
    addLog,
    setAppName,
    setSideMenu,
  } = useAppContext();

  const init = async () => {
    setLoading(true);
    setStatus(FETCHING_DATA);
    setAppName(appName);
    setSideMenu(sideMenu);
    try {
      const res = await Promise.all([
        userRolesController.getMyRoles(),
        userRolesController.checkAdmin(),
        axiosBuilder.getAccessToken(),
      ]);

      if (res[2] !== null) {
        const decoded = jwtDecode<{ oid: UUID }>(res[2]);
        setUserId(decoded.oid);
      } else {
        setUserId(undefined);
      }

      const userRoles = res[0];
      if (res[1]) {
        userRoles.push({
          id: "00000000-0000-0000-0000-000000000000" as UUID,
          role: UserRoles.ADMIN_ROLE,
          tenantId: "00000000-0000-0000-0000-000000000000" as UUID,
          userId: "00000000-0000-0000-0000-000000000000" as UUID,
          createdTime: new Date(),
          updatedTime: new Date(),
        });
      }

      setUserRoles(userRoles);

      addLog("success", SOURCE, INIT_SUCCESS);
    } catch {
      addLog("error", SOURCE, INIT_ERROR);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
}
