import { test, expect } from "@playwright/test";
const url = "/tests/fixtures/homepage.html";

test("photo galleries switch shots and restore keyboard focus", async ({ page }) => {
  await page.goto(url);
  for (const name of ["The White Tee Edit", "The Blue Polo Edit", "Black Meets Burgundy"]) {
    const button = page.getByRole("button", { name: `View ${name}`, exact: true });
    await button.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name, exact: true })).toBeVisible();
    const thumbnails = dialog.getByRole("button", { name: /^Show / });
    await expect(thumbnails).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await thumbnails.nth(i).click();
      await expect(thumbnails.nth(i)).toHaveAttribute("aria-pressed", "true");
      const expected = await thumbnails.nth(i).locator("img").getAttribute("src");
      await expect(dialog.locator(".nomad-photo-main")).toHaveAttribute("src", expected!);
      await expect(dialog.locator(".nomad-photo-main")).toBeVisible();
      await expect
        .poll(() =>
          dialog.locator(".nomad-photo-main").evaluate((img: HTMLImageElement) => img.naturalWidth),
        )
        .toBeGreaterThan(0);
    }
    await page.keyboard.press("Escape");
    await expect(button).toBeFocused();
  }
});

test("photos work with reduced motion and layouts do not overflow", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(url);
  await expect(page.locator("canvas")).toHaveCount(0);
  for (const viewport of [
    { width: 375, height: 812 },
    { width: 812, height: 375 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.getByRole("button", { name: "View The White Tee Edit", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.keyboard.press("Escape");
  }
  await page.getByRole("link", { name: "Start a custom brief", exact: true }).click();
  await expect(page).toHaveURL(/\/custom-order$/);
});

test("photographic garments move forward, zoom and return to the rail", async ({ page }) => {
  await page.goto(url);
  for (const name of ["The everyday tee", "The utility layer", "The textured polo"]) {
    const garment = page.getByRole("button", { name: `Inspect ${name}`, exact: true });
    await garment.click();
    await expect(garment).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("button", { name: "Fabric detail", exact: true }).click();
    await expect(page.locator(".cinema-rail")).toHaveClass(/is-zoomed/);
    await page.getByRole("button", { name: "Full garment", exact: true }).click();
    await page.getByRole("button", { name: "View inspiration", exact: true }).click();
    await expect(page.getByRole("dialog").locator(".nomad-photo-main")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(garment).toBeFocused();
    await page.getByRole("button", { name: "Return to rail", exact: true }).click();
    await expect(garment).toHaveAttribute("aria-pressed", "false");
  }
});

test("carousel moves through looks and saved filter remains usable", async ({ page }) => {
  await page.goto(url);
  await page.getByRole("button", { name: "Next look", exact: true }).click();
  await expect(page.locator(".cinema-carousel-controls")).toContainText("The Blue Polo Edit");
  await page.getByRole("button", { name: "Save The Blue Polo Edit", exact: true }).click();
  await page.getByRole("button", { name: "Saved looks (1)", exact: true }).click();
  await expect(page.locator(".cinema-glass-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Unsave The Blue Polo Edit", exact: true }).click();
  await expect(page.getByText("Your edit starts here.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Outfit stories", exact: true }).click();
  await expect(page.locator(".cinema-card-garment").first()).toHaveAttribute("src", /lookbook/);
});

test("premium knot supports pause, still artwork and reduced motion", async ({ page }) => {
  test.skip(process.env.VITE_ENABLE_3D === "false");
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 });
    Object.defineProperty(navigator, "deviceMemory", { get: () => 8 });
  });
  await page.goto(url);
  await page.getByRole("button", { name: "Pause knot motion", exact: true }).click();
  await expect(page.getByRole("button", { name: "Resume knot motion", exact: true })).toBeVisible();
  const artwork = page.locator('[data-artwork="knot"]');
  await artwork.getByRole("button", { name: "Still view", exact: true }).click();
  await expect(artwork.locator("canvas")).toHaveCount(0);
  await expect(artwork.locator("img")).toHaveAttribute("src", "/3d-fallbacks/knot-premium.webp");
  await artwork.getByRole("button", { name: "Enable 3D", exact: true }).click();
  await expect(artwork.locator("canvas")).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(artwork.locator("canvas")).toHaveCount(0);
  await expect(artwork.locator("img")).toBeVisible();
});
