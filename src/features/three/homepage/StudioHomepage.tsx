import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, ArrowRight } from "lucide-react";
import { StudioArtwork } from "./StudioArtwork";
import { PhotoShowroom } from "./PhotoShowroom";
import "./studio-home.css";
import "./cinematic-showroom.css";
import "./premium-hero.css";

export function StudioHomepage({ children }: { children?: ReactNode }) {
  return (
    <div className="nomad-home">
      <section className="nomad-hero premium-hero" aria-labelledby="nomad-heading">
        <div className="nomad-hero-top">
          <span>
            <i /> An independent spirit. A shared thread.
          </span>
          <span>
            Lagos, Nigeria <span className="nomad-coordinate">06°27′ N · 03°24′ E</span>
          </span>
        </div>
        <div className="nomad-hero-grid">
          <div className="nomad-hero-copy">
            <p className="nomad-eyebrow">The world of KnotNomad</p>
            <h1 id="nomad-heading">
              Rooted in craft.
              <br />
              <em>Free to roam.</em>
            </h1>
            <p className="nomad-hero-description">
              For the paths you take. The stories you carry.
              <br />
              Thoughtful apparel, made around you.
            </p>
            <div className="nomad-actions">
              <Link to="/custom-order" className="nomad-button">
                Start a custom brief <ArrowUpRight size={18} />
              </Link>
              <a href="#showroom" className="nomad-link">
                Step into the showroom <ArrowDown size={16} />
              </a>
            </div>
            <p className="nomad-tagline">Crafted to Travel. Made to Last.</p>
          </div>
          <div className="nomad-knot-wrap">
            <span className="nomad-art-edition">
              Object 001
              <br />
              The connecting thread
            </span>
            <StudioArtwork kind="knot" />
            <div className="nomad-art-note">
              <span>
                One thread.
                <br />
                Endless possibilities.
              </span>
              <span className="nomad-seal">
                KN
                <br />
                <small>STUDIO</small>
              </span>
            </div>
          </div>
        </div>
        <div className="nomad-hero-bottom">
          <span>Custom pieces · Team uniforms · Capsule collections</span>
          <a href="#showroom">
            Discover our world <ArrowDown size={13} />
          </a>
          <span>Designed with intention, always.</span>
        </div>
      </section>
      <div className="nomad-brand-strip">
        <span>Crafted to travel</span>
        <span aria-hidden="true">✳</span>
        <span>Made to last</span>
        <span aria-hidden="true">✳</span>
        <span>Rooted in motion</span>
        <span aria-hidden="true">✳</span>
        <span>Made personal</span>
      </div>
      <section className="nomad-showroom" id="showroom" aria-labelledby="showroom-heading">
        <PhotoShowroom />
      </section>
      {children}
      <section className="nomad-story">
        <div className="nomad-story-image">
          <img
            src="/images/lookbook/knot-nomad-lookbook-06.webp"
            alt="The texture and detail of a caramel cable-knit polo"
            loading="lazy"
            width={750}
            height={1000}
          />
          <span>Closer to the craft.</span>
        </div>
        <div className="nomad-story-copy">
          <p className="nomad-eyebrow">02 / A little more personal</p>
          <h2>
            Good clothes.
            <br />
            Better stories.
            <br />
            <em>Your own.</em>
          </h2>
          <p>
            A single piece or a shared identity. We work with individuals, creatives and teams to
            turn ideas into apparel with purpose.
          </p>
          <Link to="/custom-studio" className="nomad-link">
            Meet the custom studio <ArrowUpRight size={17} />
          </Link>
          <div className="nomad-story-detail">
            <span>01 — Share your idea</span>
            <span>02 — Shape the details</span>
            <span>03 — Make it yours</span>
          </div>
        </div>
      </section>
      <section className="nomad-editorial">
        <div className="nomad-section-heading">
          <div>
            <p className="nomad-eyebrow">03 / Out in the world</p>
            <h2>
              Life, <em>well worn.</em>
            </h2>
          </div>
          <Link to="/lookbook" className="nomad-link">
            The complete lookbook <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="nomad-editorial-grid">
          {[
            {
              src: "knot-nomad-lookbook-01.webp",
              title: "A slower kind of Sunday.",
              alt: "Lavender polo and grey tailored trousers",
            },
            {
              src: "knot-nomad-lookbook-03.webp",
              title: "A little room to wander.",
              alt: "Sage utility jacket in a lush garden",
            },
          ].map((item, index) => (
            <Link key={item.src} to="/lookbook">
              <div>
                <img
                  src={`/images/lookbook/${item.src}`}
                  alt={item.alt}
                  width={750}
                  height={1000}
                  loading="lazy"
                />
                <span>
                  Field notes / 0{index + 1}
                  <ArrowUpRight size={22} />
                </span>
              </div>
              <h3>{item.title}</h3>
            </Link>
          ))}
        </div>
      </section>
      <section className="nomad-invitation">
        <p className="nomad-eyebrow">An idea is a good place to start.</p>
        <h2>
          Let’s make
          <br />
          <em>something yours.</em>
        </h2>
        <Link to="/custom-order" className="nomad-button">
          Bring your idea to life <ArrowUpRight size={18} />
        </Link>
        <p>We’ll confirm the details, quote and timing before production.</p>
      </section>
    </div>
  );
}
