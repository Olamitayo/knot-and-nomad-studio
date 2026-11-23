export const studioLooks = [
  {
    id: "everyday",
    name: "The everyday tee",
    category: "01 / Essentials",
    colour: "Chalk",
    hex: "#e8dfca",
    kind: "tee",
    image: "/images/lookbook/lookbook-07-white-tee-front.webp",
    alt: "White tee styled with relaxed black trousers",
    description:
      "An easy starting point. Explore the white-tee edit, or work with the studio on your own take on an everyday essential.",
  },
  {
    id: "utility",
    name: "The utility layer",
    category: "02 / Layers",
    colour: "Sage",
    hex: "#87937d",
    kind: "jacket",
    image: "/images/lookbook/knot-nomad-lookbook-03.webp",
    alt: "Sage utility jacket photographed in a tropical garden",
    description:
      "A study in pockets, proportion and movement. Bring your idea for a considered outer layer to the studio.",
  },
  {
    id: "texture",
    name: "The textured polo",
    category: "03 / Texture",
    colour: "Cacao",
    hex: "#956644",
    kind: "knit",
    image: "/images/lookbook/knot-nomad-lookbook-06.webp",
    alt: "Close-up of a caramel cable-knit polo",
    description:
      "Warm tones and tactile details. Discover our editorial inspiration for a wardrobe with a little more character.",
  },
  {
    id: "weekend",
    name: "The relaxed polo",
    category: "04 / Ease",
    colour: "Lavender",
    hex: "#aaa1b5",
    kind: "polo",
    image: "/images/lookbook/knot-nomad-lookbook-01.webp",
    alt: "Lavender knit polo with grey tailored trousers",
    description:
      "Soft colour, an open collar and a relaxed silhouette. An invitation to imagine a piece that feels like you.",
  },
] as const;
export type StudioLook = (typeof studioLooks)[number];
export type ArtworkKind = "knot" | "showroom";
export type ArtworkProps = {
  kind: ArtworkKind;
  motion: boolean;
  view: number;
  selected: number | null;
  onSelect: (index: number) => void;
  onReady: () => void;
  onError: () => void;
  quality: "high" | "medium";
};
