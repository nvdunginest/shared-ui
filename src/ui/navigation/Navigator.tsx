// App.tsx (hoặc Layout.tsx)
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { setNavigate } from "./navigation";

const Navigator: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return <></>;
};

export default Navigator;
