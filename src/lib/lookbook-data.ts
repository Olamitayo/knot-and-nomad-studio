export type CollectionSlug = "white-tee" | "blue-polo" | "black-burgundy";

export type Shot = {
  id: string;
  collection: CollectionSlug;
  src: string;
  alt: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  width: number;
  height: number;
  objectPosition: string;
};

export type LookCollection = {
  slug: CollectionSlug;
  number: string;
  title: string;
  tagline: string;
  description: string;
  coverId: string;
};

export const collections: LookCollection[] = [
  {
    slug: "white-tee",
    number: "01",
    title: "The White Tee Edit",
    tagline: "Crisp white tee, relaxed black trousers",
    description:
      "Everyday essentials styled with a crisp white tee, relaxed black trousers and a leather bag, seen standing, seated and on the move.",
    coverId: "07",
  },
  {
    slug: "blue-polo",
    number: "02",
    title: "The Blue Polo Edit",
    tagline: "Deep blue polo, soft white tailoring",
    description:
      "A deep blue polo with ivory wide-leg trousers and a tan backpack, from refined casual to off-duty.",
    coverId: "12",
  },
  {
    slug: "black-burgundy",
    number: "03",
    title: "Black Meets Burgundy",
    tagline: "Black tee, burgundy wide-leg trousers",
    description:
      "A tonal black tee against burgundy volume, a strong and understated studio contrast.",
    coverId: "06",
  },
];

export const getCollection = (slug: string) => collections.find((c) => c.slug === slug);
export const getCollectionShots = (slug: string) => shots.filter((s) => s.collection === slug);

export const shots: Shot[] = [
  {
    id: "01",
    collection: "white-tee",
    src: encodeURI("/images/lookbook/IMG-KNTNMD 001.png"),
    alt: "Black male model posing in a white tee and relaxed black trousers while taking a selfie.",
    title: "White Tee, Unscripted",
    category: "Everyday Essential",
    description: "Simple utility styling with a crisp white tee and a relaxed trouser silhouette.",
    tags: ["Essential", "Minimal", "Tailored"],
    width: 896,
    height: 1755,
    objectPosition: "center bottom",
  },
  {
    id: "02",
    collection: "blue-polo",
    src: encodeURI("/images/lookbook/ChatGPT Image Sep 24, 2026 at 06_52_40 PM (1).png"),
    alt: "Black male model in a deep blue polo with ivory wide-leg trousers and a backpack.",
    title: "Blue Polo in Motion",
    category: "Refined Casual",
    description:
      "A deep blue polo paired with soft white tailoring for a polished everyday statement.",
    tags: ["Polo", "Neutral", "Layered"],
    width: 878,
    height: 1792,
    objectPosition: "center bottom",
  },
  {
    id: "03",
    collection: "black-burgundy",
    src: encodeURI("/images/lookbook/9af53bb7-6899-4e34-bc0a-be192c069e03.png"),
    alt: "Black male model in a black tee and burgundy wide-leg trousers taking a selfie portrait.",
    title: "Black Meets Burgundy",
    category: "Studio Contrast",
    description: "A tonal black tee with burgundy volume creating a strong, understated contrast.",
    tags: ["Tee", "Monochrome", "Statement"],
    width: 878,
    height: 1791,
    objectPosition: "center bottom",
  },
  {
    id: "04",
    collection: "white-tee",
    src: "/images/lookbook/lookbook-04-white-tee-standing.webp",
    alt: "Model standing in a white T-shirt, relaxed black trousers and black shoes, carrying a brown leather bag.",
    title: "Ready to Carry",
    category: "Travel Edit",
    description: "A white tee and relaxed black trousers styled with a leather carryall.",
    tags: ["Essential", "Tee", "Travel"],
    width: 897,
    height: 1754,
    objectPosition: "center bottom",
  },
  {
    id: "05",
    collection: "black-burgundy",
    src: "/images/lookbook/lookbook-05-black-tee-burgundy-seated.webp",
    alt: "Model seated in a black T-shirt and burgundy trousers against a light studio backdrop.",
    title: "Burgundy, at Ease",
    category: "Studio Portrait",
    description: "A relaxed seated portrait pairing a black tee with burgundy trousers.",
    tags: ["Tee", "Burgundy", "Studio"],
    width: 1024,
    height: 1536,
    objectPosition: "center bottom",
  },
  {
    id: "06",
    collection: "black-burgundy",
    src: "/images/lookbook/lookbook-06-black-tee-burgundy-standing.webp",
    alt: "Model standing in a black T-shirt and burgundy trousers.",
    title: "Burgundy in Full",
    category: "Studio Contrast",
    description: "A full-length view of a black tee styled with burgundy trousers.",
    tags: ["Tee", "Burgundy", "Tailored"],
    width: 878,
    height: 1792,
    objectPosition: "center bottom",
  },
  {
    id: "07",
    collection: "white-tee",
    src: "/images/lookbook/lookbook-07-white-tee-front.webp",
    alt: "Model facing forward in a white T-shirt and relaxed black trousers, carrying a brown leather bag.",
    title: "Clean Lines in White",
    category: "Everyday Essential",
    description: "A front-facing look at a white tee and relaxed black trouser pairing.",
    tags: ["Essential", "Tee", "Minimal"],
    width: 896,
    height: 1755,
    objectPosition: "center bottom",
  },
  {
    id: "08",
    collection: "white-tee",
    src: "/images/lookbook/lookbook-08-white-tee-seated.webp",
    alt: "Model seated in a white T-shirt and relaxed black trousers with a brown leather bag.",
    title: "The Off-Duty Edit",
    category: "Everyday Essential",
    description: "A seated portrait in a white tee and relaxed black trousers.",
    tags: ["Essential", "Tee", "Studio"],
    width: 1024,
    height: 1536,
    objectPosition: "center bottom",
  },
  {
    id: "09",
    collection: "blue-polo",
    src: "/images/lookbook/lookbook-09-blue-polo-seated.webp",
    alt: "Model seated in a blue polo and white trousers with a tan backpack.",
    title: "Blue, at Ease",
    category: "Refined Casual",
    description: "A blue polo and white trousers styled with a tan backpack.",
    tags: ["Polo", "Casual", "Travel"],
    width: 1024,
    height: 1536,
    objectPosition: "center bottom",
  },
  {
    id: "10",
    collection: "blue-polo",
    src: "/images/lookbook/lookbook-10-blue-polo-standing.webp",
    alt: "Model standing in a blue polo and white trousers with a tan backpack.",
    title: "The Everyday Polo",
    category: "Refined Casual",
    description: "A full-length blue polo look with white trousers and a tan backpack.",
    tags: ["Polo", "Casual", "Travel"],
    width: 878,
    height: 1792,
    objectPosition: "center bottom",
  },
  {
    id: "11",
    collection: "black-burgundy",
    src: "/images/lookbook/lookbook-11-black-tee-burgundy-walking.webp",
    alt: "Model walking in a black T-shirt and burgundy trousers.",
    title: "A Step in Burgundy",
    category: "Studio Contrast",
    description: "A walking portrait featuring a black tee and burgundy trousers.",
    tags: ["Tee", "Burgundy", "Motion"],
    width: 878,
    height: 1792,
    objectPosition: "center bottom",
  },
  {
    id: "12",
    collection: "blue-polo",
    src: "/images/lookbook/lookbook-12-blue-polo-front.webp",
    alt: "Model facing forward in a blue polo and white trousers with a tan backpack.",
    title: "Blue, Considered",
    category: "Refined Casual",
    description: "A front-facing view of a blue polo paired with white trousers.",
    tags: ["Polo", "Casual", "Tailored"],
    width: 878,
    height: 1791,
    objectPosition: "center bottom",
  },
];
