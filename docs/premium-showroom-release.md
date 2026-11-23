# Premium home and showroom release

The homepage introduces a woven 3D knot, a photographic garment rail with inspection and fabric detail, and editorial lookbook cards. Garments use photographic depth layers; they are visual studies, not rotatable product models. Existing product and custom-order flows are retained.

Production enables the hero through `VITE_ENABLE_3D=true` in `.env.production`. Reduced-motion preferences, low-performance devices and WebGL failures receive still artwork. The user can pause motion or choose still artwork.

## Validation

- Production Vite build and ESLint.
- Desktop/mobile browser coverage of garment selection, fabric detail, galleries, carousel, reduced motion, mobile navigation and custom orders.
- Custom-order unit coverage.

## Deployment and rollback

Build with `pnpm build`, then deploy the generated Cloudflare configuration with `wrangler deploy --config dist/server/wrangler.json --keep-vars`. Preserve existing runtime variables and secrets. No database migration is required.

To disable only the 3D hero, set `VITE_ENABLE_3D=false`, rebuild and deploy. For a full rollback, the preceding production Worker version is `5afbaec3-3f4c-419b-a07e-e617ec1e018e`.
