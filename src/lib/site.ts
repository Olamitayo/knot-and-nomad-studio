// Edit these values to update brand contact details across the entire site.
export const SITE = {
  name: "Knot & Nomad",
  tagline: "Rooted in Motion",
  email: "hello@knotnomad.com",
  // Replace with your full WhatsApp number (digits only, with country code).
  whatsappNumber: "2348129894036",
  whatsappMessage: "Hi Knot & Nomad, I'd like to discuss a custom apparel idea.",
  socials: {
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    facebook: "https://facebook.com/",
  },
};

export const whatsappLink = (msg?: string) =>
  `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(msg ?? SITE.whatsappMessage)}`;
