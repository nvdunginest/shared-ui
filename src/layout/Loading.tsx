import { FC } from "react";

import { Spin } from "antd";

import { useAppContext } from "../platform/contexts/AppContext";

const Loading: FC = () => {
  const { state: appState } = useAppContext();

  return (
    <Spin
      fullscreen
      spinning={appState.loading}
      tip={`${appState.status}. Vui lòng đợi trong giây lát!`}
    />
  );
};

export default Loading;
