import { useEffect, useState } from "react";
export function useWebGLSupport(check: boolean) {
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => {
    if (!check) return;
    const canvas = document.createElement("canvas");
    try {
      const gl = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
      setSupported(Boolean(gl));
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      setSupported(false);
    }
  }, [check]);
  return supported;
}
