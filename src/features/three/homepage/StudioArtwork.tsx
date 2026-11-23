import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, MoveUpRight } from "lucide-react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { usePerformanceTier } from "../hooks/usePerformanceTier";
import { useWebGLSupport } from "../hooks/useWebGLSupport";
import { SceneErrorBoundary } from "../components/SceneErrorBoundary";
import { threeEnabled } from "../lib/sceneConfig";
import type { ArtworkKind } from "./studioLooks";
const Renderer = lazy(() => import("./StudioRenderer"));
const ignoreSelection = () => {};
export function StudioArtwork({
  kind,
  selected = null,
  onSelect = ignoreSelection,
}: {
  kind: ArtworkKind;
  selected?: number | null;
  onSelect?: (index: number) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [motion, setMotion] = useState(true);
  const [staticMode, setStaticMode] = useState(false);
  const [view, setView] = useState(0);
  const reduced = useReducedMotion();
  const tier = usePerformanceTier();
  const eligible =
    threeEnabled && reduced === false && tier !== null && tier !== "fallback" && !staticMode;
  const supported = useWebGLSupport(eligible && visible);
  const render = eligible && visible && supported === true && !failed;
  const loaded = useCallback(() => setReady(true), []);
  const error = useCallback(() => setFailed(true), []);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "80px",
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!render) {
      setReady(false);
      return;
    }
    if (ready) return;
    const timer = setTimeout(error, 15000);
    return () => clearTimeout(timer);
  }, [render, ready, error]);
  const poster = (
    <img
      className="studio-art-poster"
      src={
        kind === "knot" ? "/3d-fallbacks/knot-premium.webp" : "/3d-fallbacks/showroom-studio.png"
      }
      alt={
        kind === "knot"
          ? "A sculptural three-strand woven knot, lit against a charcoal studio"
          : "Four illustrated garments on two studio clothing racks"
      }
      width={kind === "knot" ? 603 : 1440}
      height={kind === "knot" ? 610 : 720}
      fetchPriority={kind === "knot" ? "high" : "auto"}
      loading={kind === "knot" ? "eager" : "lazy"}
    />
  );
  return (
    <div ref={root} className={`studio-art studio-art-${kind}`} data-artwork={kind}>
      <div className="studio-poster-layer" style={{ opacity: render && ready ? 0 : 1 }}>
        {poster}
      </div>
      {render && (
        <SceneErrorBoundary
          fallback={
            <div className="studio-art-error">
              {poster}
              <span>Explore the looks below.</span>
            </div>
          }
        >
          <Suspense fallback={null}>
            <div
              className="studio-art-canvas"
              aria-hidden="true"
              style={{ opacity: ready ? 1 : 0 }}
            >
              <Renderer
                kind={kind}
                motion={motion}
                view={view}
                selected={selected}
                onSelect={onSelect}
                onReady={loaded}
                onError={error}
                quality={tier === "high" ? "high" : "medium"}
              />
            </div>
          </Suspense>
        </SceneErrorBoundary>
      )}
      <div className="studio-art-tools">
        {render && ready && (
          <>
            {kind === "knot" ? (
              <button
                type="button"
                onClick={() => setMotion((value) => !value)}
                aria-label={motion ? "Pause knot motion" : "Resume knot motion"}
              >
                {motion ? <Pause size={13} /> : <Play size={13} />}
                <span>{motion ? "Pause" : "Play"}</span>
              </button>
            ) : (
              <>
                <button type="button" onClick={() => setView((value) => (value === 0 ? 0.16 : 0))}>
                  <MoveUpRight size={14} />
                  <span>{view === 0 ? "Side view" : "Front view"}</span>
                </button>
                <button type="button" onClick={() => setView(0)} aria-label="Reset showroom view">
                  <RotateCcw size={14} />
                </button>
              </>
            )}
          </>
        )}
        {threeEnabled && reduced === false && supported && !failed && (
          <button type="button" onClick={() => setStaticMode((value) => !value)}>
            {staticMode ? "Enable 3D" : "Still view"}
          </button>
        )}
      </div>
      {failed && (
        <p className="studio-art-status" role="status">
          Still view · You can explore every look below.
        </p>
      )}
    </div>
  );
}
