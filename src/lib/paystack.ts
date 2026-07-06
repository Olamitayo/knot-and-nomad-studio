// Loads Paystack's Inline.js on demand (only when a customer actually reaches
// checkout) and opens the hosted card-collection popup. Card details are
// entered directly into Paystack's iframe — they never touch our server.
declare global {
  interface Window {
    PaystackPop?: { setup: (opts: Record<string, unknown>) => { openIframe: () => void } };
  }
}

let loadPromise: Promise<void> | null = null;

function loadPaystackScript(): Promise<void> {
  if (window.PaystackPop) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Paystack checkout. Check your connection and try again."));
    document.head.appendChild(script);
  });
  return loadPromise;
}

export async function openPaystackCheckout(opts: {
  email: string;
  amountNgn: number;
  reference: string;
  onSuccess: () => void;
  onClose: () => void;
}): Promise<void> {
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error("Card payment isn't configured yet.");
  }

  await loadPaystackScript();

  if (!window.PaystackPop) {
    throw new Error("Could not load Paystack checkout. Check your connection and try again.");
  }

  const handler = window.PaystackPop.setup({
    key: publicKey,
    email: opts.email,
    amount: Math.round(opts.amountNgn * 100), // Paystack expects kobo
    currency: "NGN",
    ref: opts.reference,
    callback: () => opts.onSuccess(),
    onClose: () => opts.onClose(),
  });
  handler.openIframe();
}
