import { PropsWithChildren, useEffect, useState } from "react";

import { useAppContext } from "../platform/contexts/AppContext";

import Forbidden from "./Forbidden";

type Props = PropsWithChildren & {
  roles: string[][];
  /** URL ảnh forbidden tùy chỉnh — truyền vào Forbidden component */
  forbiddenImage?: string;
};

export default function AclCheck({ roles, children, forbiddenImage }: Props) {
  const { state: appState } = useAppContext();
  const [active, setActive] = useState<boolean>(false);

  useEffect(() => {
    if (roles.length === 0) {
      setActive(true);
      return;
    }

    const userRoles = appState.userRoles.map((x) => x.role);

    for (let i = 0; i < roles.length; i++) {
      let ok = true;
      for (let j = 0; j < roles[i].length; j++) {
        if (!userRoles.includes(roles[i][j])) {
          ok = false;
          break;
        }
      }
      if (ok) {
        setActive(true);
        return;
      }
    }

    setActive(false);
  }, [appState.userRoles, roles]);

  return active ? <>{children}</> : <Forbidden image={forbiddenImage} />;
}
