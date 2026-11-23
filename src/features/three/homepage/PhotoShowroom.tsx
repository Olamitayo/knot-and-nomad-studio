import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowLeft, ArrowRight, Heart } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { collections, getCollectionShots, type LookCollection } from "@/lib/lookbook-data";
import { CinematicRail, railAssets } from "./CinematicRail";
import { studioLooks } from "./studioLooks";

type GallerySelection = Omit<LookCollection, "slug"> & { slug: string };

export function PhotoShowroom() {
  const [selected, setSelected] = useState<GallerySelection | null>(null);
  const [filter, setFilter] = useState("Studio edits");
  const [saved, setSaved] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [front, setFront] = useState(0);
  const pointerStart = useRef<number | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  // Use existing alternate shots, without inventing unseen angles.
  const gallery = (slug: string) => {
    const existing = getCollectionShots(slug).filter((shot) => shot.src.endsWith(".webp"));
    if (existing.length) return existing;
    const look = studioLooks.find((item) => item.id === slug);
    return look
      ? [
          {
            id: look.id,
            src: look.image,
            alt: look.alt,
            title: look.name,
            width: 750,
            height: 1000,
          },
        ]
      : [];
  };
  const selectGarment = (index: number) => {
    const look = studioLooks[index];
    trigger.current = document.getElementById(`studio-look-${index}`) as HTMLButtonElement;

    setActive(0);
    setSelected(
      index === 0
        ? collections[0]
        : {
            slug: look.id,
            title: look.name,
            description: look.description,
            number: String(index + 1),
            tagline: look.colour,
            coverId: look.id,
          },
    );
  };
  const images = selected ? gallery(selected.slug) : [];
  const shot = images[active];
  return (
    <>
      <CinematicRail onExplore={selectGarment} />
      <section className="cinema-editorial" aria-label="Discover the lookbook">
        <img
          className="cinema-editorial-backdrop"
          src="/images/lookbook/lookbook-11-black-tee-burgundy-walking.webp"
          alt=""
          loading="lazy"
        />
        <div className="cinema-editorial-top">
          <p>Out in the world.</p>
          <h2>Wear your own story.</h2>
          <span>The KnotNomad edit</span>
        </div>
        <div className="cinema-tabs" aria-label="Filter the lookbook">
          {["Studio edits", "Saved looks", "Outfit stories"].map((label) => (
            <button
              type="button"
              key={label}
              aria-pressed={filter === label}
              onClick={() => setFilter(label)}
            >
              {label}
              {label === "Saved looks" ? ` (${saved.length})` : ""}
            </button>
          ))}
        </div>
        {filter === "Saved looks" && saved.length === 0 && (
          <p className="cinema-empty">Your edit starts here. Save a look using its heart button.</p>
        )}
        <div
          className={`nomad-photo-grid cinema-glass-grid ${filter === "Outfit stories" ? "show-outfits" : ""} ${filter === "Saved looks" ? "is-saved-grid" : "is-carousel"}`}
          onPointerDown={(event) => {
            pointerStart.current = event.clientX;
          }}
          onPointerUp={(event) => {
            if (
              pointerStart.current !== null &&
              Math.abs(event.clientX - pointerStart.current) > 50
            )
              setFront((value) => (value + (event.clientX < pointerStart.current! ? 1 : 2)) % 3);
            pointerStart.current = null;
          }}
        >
          {collections
            .filter((collection) => filter !== "Saved looks" || saved.includes(collection.slug))
            .map((collection) => {
              const images = gallery(collection.slug);
              const cover = images.find((image) => image.id === collection.coverId) ?? images[0];
              const collectionIndex = collections.indexOf(collection);
              return (
                <article
                  className="cinema-glass-card"
                  key={collection.slug}
                  data-position={(collectionIndex - front + 3) % 3}
                >
                  <button
                    type="button"
                    className="cinema-save"
                    aria-label={`${saved.includes(collection.slug) ? "Unsave" : "Save"} ${collection.title}`}
                    aria-pressed={saved.includes(collection.slug)}
                    onClick={() =>
                      setSaved((items) =>
                        items.includes(collection.slug)
                          ? items.filter((item) => item !== collection.slug)
                          : [...items, collection.slug],
                      )
                    }
                  >
                    <Heart
                      size={21}
                      fill={saved.includes(collection.slug) ? "currentColor" : "none"}
                    />
                  </button>
                  <button
                    key={collection.slug}
                    type="button"
                    className="nomad-photo-card"
                    aria-label={`View ${collection.title}`}
                    onClick={(event) => {
                      trigger.current = event.currentTarget;
                      setActive(images.findIndex((image) => image.id === cover.id));
                      setSelected(collection);
                    }}
                  >
                    <img
                      className="cinema-card-garment"
                      src={
                        filter === "Outfit stories"
                          ? cover.src
                          : `/images/showroom/${[railAssets[0], "navy-polo", "black-tee"][collectionIndex]}.webp`
                      }
                      alt={
                        filter !== "Outfit stories"
                          ? [
                              "White cotton tee on a black hanger",
                              "Navy blue polo garment study",
                              "Black cotton tee garment study",
                            ][collectionIndex]
                          : cover.alt
                      }
                      width={cover.width}
                      height={cover.height}
                      loading="lazy"
                    />
                    <span>
                      {collection.number} / {images.length} views <ArrowUpRight size={18} />
                    </span>
                    <h3>{collection.title}</h3>
                    <p>{collection.tagline}</p>
                  </button>
                </article>
              );
            })}
        </div>
        {filter !== "Saved looks" && (
          <div className="cinema-carousel-controls">
            <button
              type="button"
              aria-label="Previous look"
              onClick={() => setFront((value) => (value + 2) % 3)}
            >
              <ArrowLeft size={19} />
            </button>
            <span aria-live="polite">
              0{front + 1} / 03 · {collections[front].title}
            </span>
            <button
              type="button"
              aria-label="Next look"
              onClick={() => setFront((value) => (value + 1) % 3)}
            >
              <ArrowRight size={19} />
            </button>
          </div>
        )}
        <p className="cinema-editorial-note">
          Personal style, in good company.{" "}
          <Link to="/lookbook">
            Explore the full lookbook <ArrowUpRight size={15} />
          </Link>
        </p>
      </section>
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
          }
        }}
      >
        <DialogContent
          className="nomad-look-dialog nomad-photo-dialog"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            trigger.current?.focus();
          }}
        >
          {selected && shot && (
            <>
              <div className="nomad-photo-viewer">
                <img
                  className="nomad-photo-main"
                  src={shot.src}
                  alt={shot.alt}
                  width={shot.width}
                  height={shot.height}
                />
                <p aria-live="polite">
                  {shot.title} · {active + 1} / {images.length}
                </p>
                <div className="nomad-photo-thumbs" aria-label="Choose a photo">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      aria-label={`Show ${image.title}`}
                      aria-pressed={active === index}
                      onClick={() => setActive(index)}
                    >
                      <img
                        src={image.src}
                        alt=""
                        width={image.width}
                        height={image.height}
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="nomad-dialog-copy">
                <p className="nomad-eyebrow">The lookbook / {images.length} views</p>
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>{selected.description}</DialogDescription>
                <p className="nomad-dialog-note">
                  Garment visuals are studio interpretations. These original photographs show
                  editorial inspiration, not an exact product match.
                </p>
                <Link to="/lookbook" className="nomad-button">
                  Explore the lookbook <ArrowUpRight size={16} />
                </Link>
                <Link to="/custom-order" className="nomad-link">
                  Create something inspired by this <ArrowUpRight size={15} />
                </Link>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
