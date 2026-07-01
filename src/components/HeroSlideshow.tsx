import { useEffect, useState } from "react";

interface Props {
  images: { src: string; alt: string }[];
  intervalMs?: number;
}

export function HeroSlideshow({ images, intervalMs = 5000 }: Props) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % images.length), intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);
  return (
    <>
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img.src}
          alt={img.alt}
          width={1920}
          height={1080}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1800ms] ease-in-out ${idx === i ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Slide ${idx + 1}`}
            onClick={() => setI(idx)}
            className={`h-[2px] transition-all duration-500 ${idx === i ? "w-10 bg-accent" : "w-6 bg-foreground/40 hover:bg-foreground/70"}`}
          />
        ))}
      </div>
    </>
  );
}
