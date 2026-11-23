import { test, expect } from "@playwright/test";

test("mobile menu fills the screen and supports navigation, close and resize", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/tests/fixtures/navigation.html");
  const open = page.getByRole("button", { name: "Open navigation" });
  const menu = page.getByRole("navigation", { name: "Mobile navigation" });
  await open.click();
  await expect(menu).toBeVisible();
  const bounds = await page.locator("[data-mobile-menu]").boundingBox();
  expect(bounds!.height).toBeGreaterThan(700);
  expect(bounds!.y).toBe(80);
  await expect(menu.getByRole("link", { name: "WhatsApp us" })).toBeInViewport();
  await menu.getByRole("link", { name: "Lookbook", exact: false }).click();
  await expect(page).toHaveURL(/\/lookbook$/);
  await expect(menu).toBeHidden();
  await open.click();
  await page.getByRole("button", { name: "Close navigation" }).click();
  await expect(menu).toBeHidden();
  await open.click();
  await page.keyboard.press("Escape");
  await expect(open).toBeFocused();
  await open.click();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(menu).toBeHidden();
  await expect(page.locator("body")).not.toHaveAttribute("data-mobile-menu-open");
});
