import iconInnerRaw from "@/assets/knot-nomad-icon.svg?raw";

const ICON_VIEWBOX = /viewBox="([^"]+)"/.exec(iconInnerRaw)![1];
const ICON_INNER = iconInnerRaw.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");

// Inline (not <img>) so `fill="currentColor"` picks up the surrounding text
// color — lets the same mark work on both light and dark backgrounds.
export function KnotIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox={ICON_VIEWBOX}
      className={className}
      fill="currentColor"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICON_INNER }}
    />
  );
}
