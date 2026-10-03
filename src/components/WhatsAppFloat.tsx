import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/site";

export function WhatsAppFloat() {
  const [show, setShow] = useState(false);
  const [suppressed, setSuppressed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 1500);
    const footer = document.querySelector("footer");
    let footerVisible = false;
    const isInteractiveTarget = (target: Element | null) =>
      target instanceof HTMLElement &&
      (target.matches("input, textarea, select, [contenteditable='true']") ||
        Boolean(target.closest("form, [role='dialog'], [data-mobile-menu]")));
    const syncSuppression = () => {
      setSuppressed(
        footerVisible ||
          document.body.dataset.mobileMenuOpen === "true" ||
          Boolean(document.querySelector("[role='dialog'][data-state='open']")) ||
          isInteractiveTarget(document.activeElement),
      );
    };
    const observer = footer
      ? new IntersectionObserver(
          ([entry]) => {
            footerVisible = entry.isIntersecting;
            syncSuppression();
          },
          { threshold: 0.05 },
        )
      : null;
    if (footer) observer?.observe(footer);

    const onFocusIn = () => syncSuppression();
    const onFocusOut = () => {
      requestAnimationFrame(syncSuppression);
    };
    const mutationObserver = new MutationObserver(syncSuppression);
    mutationObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-mobile-menu-open", "data-state"],
      childList: true,
      subtree: true,
    });
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      clearTimeout(t);
      observer?.disconnect();
      mutationObserver.disconnect();
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      aria-hidden={!show || suppressed}
      tabIndex={show && !suppressed ? 0 : -1}
      className={`whatsapp-float fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-[max(1rem,env(safe-area-inset-right))] z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-primary-foreground shadow-2xl ring-1 ring-accent/40 transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
        show && !suppressed
          ? "opacity-100 translate-y-0"
          : "pointer-events-none opacity-0 translate-y-4"
      }`}
    >
      <MessageCircle size={22} />
    </a>
  );
}
