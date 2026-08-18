import { useEffect } from "react";

import { UUID } from "crypto";
import { jwtDecode } from "jwt-decode";

import axiosBuilder from "../../axios.instance";
import userRolesController from "../../controllers/userRoles.controller";
import usersController from "../../controllers/users.controller";
import { UserRoles } from "../../helpers/userRoles.helper";

import { useAppContext } from "./AppProvider";
import { IFeature } from "./type";

const SOURCE = "Khởi động ứng dụng";

type Props = {
  appName: string;
  sideMenu: IFeature[];
  /** URL logo của ứng dụng. Hiển thị trên thanh điều hướng. */
  logoUrl?: string;
};

export default function AppLoader({ appName, sideMenu, logoUrl = "" }: Props): JSX.Element {
  const {
    setUserId,
    setUserRoles,
    setUsers,
    setLoading,
    setStatus,
    addLog,
    setAppName,
    setSideMenu,
    setLogoUrl,
  } = useAppContext();

  const init = async () => {
    setLoading(true);
    setStatus("Đang tải dữ liệu. Vui lòng đợi trong giây lát!");
    setAppName(appName);
    setSideMenu(sideMenu);
    setLogoUrl(logoUrl);

    try {
      const res = await Promise.all([
        userRolesController.getMyRoles(),
        userRolesController.checkAdmin(),
        usersController.getUsers(),
        axiosBuilder.getAccessToken(),
      ]);

      if (res[3] !== null) {
        const decoded = jwtDecode<{ oid: UUID }>(res[3] as string);
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
      setUsers(res[2]);
      addLog("success", SOURCE, "Tải dữ liệu thành công");
    } catch {
      addLog("error", SOURCE, "Gặp lỗi khi tải dữ liệu");
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
