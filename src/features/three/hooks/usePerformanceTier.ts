import { useEffect, useState } from "react";
import type { PerformanceTier } from "../types/three";
type DeviceNavigator = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
// Conservative eligibility heuristic, not a GPU benchmark.
export function usePerformanceTier() {
  const [tier, setTier] = useState<PerformanceTier | null>(null);
  useEffect(() => {
    const device = navigator as DeviceNavigator;
    if (
      device.connection?.saveData ||
      (device.deviceMemory !== undefined && device.deviceMemory <= 2) ||
      (device.hardwareConcurrency > 0 && device.hardwareConcurrency <= 2)
    ) {
      setTier("fallback");
      return;
    }
    setTier(
      window.matchMedia("(pointer: fine)").matches && device.hardwareConcurrency >= 8
        ? "high"
        : "medium",
    );
  }, []);
  return tier;
}
