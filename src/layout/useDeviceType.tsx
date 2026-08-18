import { useEffect, useState } from "react";

type DeviceType = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

export const useDeviceType = (): DeviceType => {
  const getDeviceType = (width: number): DeviceType => {
    if (width >= breakpoints.xxl) return "xxl";
    if (width >= breakpoints.xl) return "xl";
    if (width >= breakpoints.lg) return "lg";
    if (width >= breakpoints.md) return "md";
    if (width >= breakpoints.sm) return "sm";
    return "xs";
  };

  const [deviceType, setDeviceType] = useState<DeviceType>(() =>
    getDeviceType(window.innerWidth)
  );

  useEffect(() => {
    const handleResize = () => setDeviceType(getDeviceType(window.innerWidth));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return deviceType;
};
