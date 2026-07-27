import * as React from "react";
import { Img, Link } from "@react-email/components";

export function EmailBrandLogo() {
  return (
    <Link href="https://knotnomad.com" aria-label="KnotNomad home">
      <Img
        src="https://knotnomad.com/brand/knotnomad-logo-primary.png"
        width="196"
        height="90"
        alt="KnotNomad"
        style={{ display: "block", margin: "0 0 28px" }}
      />
    </Link>
  );
}
