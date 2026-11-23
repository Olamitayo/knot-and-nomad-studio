import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Minus, Plus, RotateCcw } from "lucide-react";
import { studioLooks } from "./studioLooks";

export const railAssets = ["chalk-tee", "sage-jacket", "cocoa-polo"];
export function CinematicRail({ onExplore }: { onExplore: (index: number) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [returning, setReturning] = useState<number | null>(null);
  useEffect(() => {
    if (returning === null) return;
    const timer = window.setTimeout(() => setReturning(null), 1150);
    return () => window.clearTimeout(timer);
  }, [returning]);
  const [zoom, setZoom] = useState(false);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const returnToRail = () => {
    const last = selected;
    setReturning(last);
    setSelected(null);
    setZoom(false);
    if (last !== null) triggers.current[last]?.focus();
  };
  return (
    <div
      className={`cinema-rail ${selected !== null ? "is-inspecting" : ""} ${zoom ? "is-zoomed" : ""}`}
      data-artwork="showroom"
      onKeyDown={(event) => {
        if (event.key === "Escape") returnToRail();
      }}
    >
      <img
        className="cinema-room"
        src="/images/showroom/charcoal-studio.webp"
        alt=""
        width={1536}
        height={1024}
      />
      <div className="cinema-masthead">
        <span>KnotNomad / The studio collection</span>
        <span>Lagos · Made personal</span>
      </div>
      <h2 id="showroom-heading">Find your thread.</h2>
      <p className="cinema-instruction">Three expressions. One independent spirit.</p>
      <div className="cinema-spotlight" aria-hidden="true" />
      <div className="cinema-garments" aria-label="Choose a garment to inspect">
        {railAssets.map((asset, index) => (
          <button
            key={asset}
            ref={(node) => {
              triggers.current[index] = node;
            }}
            id={`studio-look-${index}`}
            className={`cinema-garment cinema-garment-${index} ${selected === index ? "is-selected" : ""}`}
            style={returning === index ? { pointerEvents: "none" } : undefined}
            onTransitionEnd={(event) => {
              if (
                event.target === event.currentTarget &&
                event.propertyName === "transform" &&
                returning === index
              )
                setReturning(null);
            }}
            aria-label={`Inspect ${studioLooks[index].name}`}
            aria-pressed={selected === index}
            onClick={() => {
              setSelected(index);
              setZoom(false);
            }}
          >
            <span className="cinema-floor-shadow" aria-hidden="true" />
            <img
              src={`/images/showroom/${asset}.webp`}
              alt={`${studioLooks[index].colour} ${studioLooks[index].name.toLowerCase()} on a black wooden hanger`}
              width={1122}
              height={1402}
              loading="lazy"
            />
            <span className="cinema-garment-label">
              <small>
                0{index + 1} / {studioLooks[index].colour}
              </small>
              <strong>{studioLooks[index].name}</strong>
              <ArrowUpRight size={17} />
            </span>
          </button>
        ))}
      </div>
      {selected !== null ? (
        <div className="cinema-inspector">
          <div aria-live="polite">
            <small>A closer look / {studioLooks[selected].colour}</small>
            <h3>{studioLooks[selected].name}</h3>
            <p>
              {
                [
                  "Soft cotton. An easy silhouette.",
                  "Everyday utility. Considered details.",
                  "Rich texture. A softer structure.",
                ][selected]
              }
            </p>
          </div>
          <div className="cinema-inspector-actions">
            <button type="button" onClick={() => setZoom(!zoom)} aria-pressed={zoom}>
              {zoom ? <Minus size={16} /> : <Plus size={16} />}{" "}
              {zoom ? "Full garment" : "Fabric detail"}
            </button>
            <button type="button" onClick={() => onExplore(selected)}>
              View inspiration <ArrowUpRight size={16} />
            </button>
            <button type="button" onClick={returnToRail}>
              <RotateCcw size={15} /> Return to rail
            </button>
          </div>
        </div>
      ) : (
        <div className="cinema-footer">
          <span>
            Choose a piece.
            <br />
            <strong>Make it your own.</strong>
          </span>
          <span>
            Click a garment to bring it closer <ArrowUpRight size={16} />
          </span>
        </div>
      )}
      <p className="cinema-note">
        Visual garment studies · Explore the original lookbook for editorial inspiration.
      </p>
    </div>
  );
}
