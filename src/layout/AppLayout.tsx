import { FC, PropsWithChildren } from "react";

import DesktopLayout from "./desktop/DesktopLayout";
import MobileLayout from "./mobile/MobileLayout";
import ResponsiveWrapper from "./ResponsiveWrapper";

type Props = PropsWithChildren & {
  /** Phiên bản app — lấy từ package.json của micro-app */
  appVersion: string;
};

const AppLayout: FC<Props> = ({ children, appVersion }: Props) => {
  return (
    <ResponsiveWrapper
      desktop={<DesktopLayout appVersion={appVersion}>{children}</DesktopLayout>}
      mobile={<MobileLayout>{children}</MobileLayout>}
    />
  );
};

export default AppLayout;
