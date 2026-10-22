import { FC, useEffect, useRef } from "react";
import { useAppContext } from '../../platform-kit';

import BrandedLoading from "./BrandedLoading";

// Later actions that finish quickly stay invisible; a longer wait gets the veil with the logo and a progress bar.
const SHOW_DELAY_MS = 200;

const Loading: FC = () => {
  const { state: appState } = useAppContext();
  const { loading } = appState;
  // The first load continues the startup screen, so it appears at once (no gap between the two layers);
  // once a load has finished, later ones are delayed so quick actions do not flash.
  const started = useRef(false);
  const finished = useRef(false);

  useEffect(() => {
    if (loading) started.current = true;
    else if (started.current) finished.current = true;
  }, [loading]);

  if (!loading) return null;
  return (
    <BrandedLoading
      variant={finished.current ? "veil" : "page"}
      delay={finished.current ? SHOW_DELAY_MS : 0}
      tip={`${appState.status}. Vui lòng đợi trong giây lát!`}
    />
  );
};

export default Loading;
