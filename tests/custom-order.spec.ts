import { test, expect, type Page } from "@playwright/test";

async function start(page: Page) {
  await page.goto("/tests/fixtures/index.html");
  await page.getByRole("checkbox", { name: "T-shirt", exact: true }).check();
  await page.getByRole("checkbox", { name: "Jacket", exact: true }).check();
  for (const [type, color, selectedSizes] of [
    ["T-shirt", "Cream", ["M", "L"]],
    ["Jacket", "Black", ["XL"]],
  ] as const) {
    const card = page.getByRole("region", { name: `${type} configuration` });
    await card.getByLabel("Primary colour").selectOption(color);
    for (const size of selectedSizes)
      await card.getByRole("checkbox", { name: size, exact: true }).check();
  }
}
async function design(page: Page) {
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  const cards = page.locator("details");
  for (let i = 0; i < 2; i++) {
    await cards
      .nth(i)
      .getByLabel("Design concept")
      .fill(i === 0 ? "Travel & discovery" : "Mountain logo");
    await cards
      .nth(i)
      .getByLabel("Decoration method")
      .selectOption(i === 0 ? "DTF" : "Embroidery");
    await cards.nth(i).getByLabel("Print / embroidery position").selectOption("Front");
  }
  await cards
    .nth(0)
    .getByLabel("Reference files")
    .setInputFiles({
      name: "shirt.png",
      mimeType: "image/png",
      buffer: Buffer.from("test fixture"),
    });
  await expect(cards.nth(0).getByRole("link", { name: "shirt.png" })).toBeVisible();
  await expect(cards.nth(1).getByRole("link", { name: "shirt.png" })).toHaveCount(0);
  await expect(page.getByText("2 of 2 designs completed.")).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("T-shirt — M quantity").fill("10");
  await page.getByLabel("T-shirt — L quantity").fill("15");
  await page.getByLabel("Jacket — XL quantity").fill("5");
  await expect(page.getByText("Overall order quantity: 30")).toBeVisible();
}
async function review(page: Page) {
  await start(page);
  await design(page);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Review & contact" })).toBeFocused();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByText("We couldn’t send your brief.")).toHaveCount(0);
  await page.getByLabel("Customer name").fill("Test Customer");
  await page.getByLabel("Email (required)").fill("test@example.com");
  await page.getByLabel("WhatsApp number").fill("+2348000000000");
}
test("selection cap, keyboard control and removal preserve other data", async ({ page }) => {
  await start(page);
  for (const type of ["Trousers", "Native wear", "Set"])
    await page.getByRole("checkbox", { name: type, exact: true }).check();
  await expect(page.getByText("5 of 5 garments selected.")).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Other", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Remove Jacket", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "T-shirt configuration" }).getByLabel("Primary colour"),
  ).toHaveValue("Cream");
  const other = page.getByRole("checkbox", { name: "Other", exact: true });
  await other.focus();
  await page.keyboard.press("Space");
  await expect(other).toBeChecked();
  await expect(page.getByText("5 of 5 garments selected.")).toBeVisible();
});
test("back/continue retains fields, review is accurate, no premature failure, optional consultation and multi-item submit", async ({
  page,
}) => {
  await review(page);
  await page.screenshot({
    path: test.info().outputPath("review.png"),
    fullPage: true,
  });
  const articles = page.locator("article");
  await expect(articles.nth(0)).toContainText("Travel & discovery");
  await expect(articles.nth(0)).toContainText("M: 10, L: 15");
  await expect(articles.nth(0)).toContainText("shirt.png");
  await expect(articles.nth(1)).toContainText("Mountain logo");
  await expect(articles.nth(1)).not.toContainText("shirt.png");
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByLabel("T-shirt — M quantity")).toHaveValue("10");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByLabel("Customer name")).toHaveValue("Test Customer");
  await page.getByRole("radio", { name: "Yes", exact: true }).check();
  await expect(
    page.getByRole("button", { name: "Schedule a consultation", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Questions or assistance required").fill("Logo & print? #旅行");
  const href = await page
    .getByRole("link", { name: "Chat with a consultant now" })
    .getAttribute("href");
  const url = new URL(href!);
  expect(url.searchParams.get("text")).toContain("Logo & print? #旅行");
  expect(url.hash).toBe("");
  await page.getByRole("button", { name: "Continue without consultation", exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Review and send brief" }).click();
  await expect(page.getByRole("heading", { name: "Thank you." })).toBeVisible();
  const payloads = await page.evaluate(() => window.submittedBriefs);
  expect(payloads).toHaveLength(1);
  expect(payloads[0].items.map((item) => item.totalQuantity)).toEqual([25, 5]);
  expect(payloads[0].items[0].referenceFiles).toHaveLength(1);
  expect(payloads[0].items[1].referenceFiles).toHaveLength(0);
  expect(payloads[0].consultationRequested).toBe(false);
});
test("returning-customer scheduling validation and actual failure clears on correction and retry", async ({
  page,
}) => {
  await review(page);
  await page.getByRole("radio", { name: "No", exact: true }).check();
  await page.getByRole("button", { name: "Need help? Talk to a consultant" }).click();
  await page.getByRole("button", { name: "Schedule a consultation", exact: true }).click();
  await page.getByRole("button", { name: "Review and send brief" }).click();
  await expect(page.getByRole("alert")).toContainText("Choose a consultation");
  expect(await page.evaluate(() => window.submittedBriefs.length)).toBe(0);
  await page.getByLabel("Preferred consultation date").fill("2099-01-01");
  await page.getByLabel("Preferred consultation time").fill("12:00");
  await page.getByLabel("Contact method").selectOption("Video consultation");
  await page.evaluate(() => {
    window.failSubmission = true;
  });
  await page.getByRole("button", { name: "Review and send brief" }).click();
  await expect(page.getByRole("alert")).toContainText("We couldn’t send your brief.");
  await page.getByLabel("Customer name").fill("Test Customer Updated");
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.evaluate(() => {
    window.failSubmission = false;
  });
  await page.getByRole("button", { name: "Review and send brief" }).click();
  await expect(
    page.getByText("Consultation requested. We’ll confirm availability with you."),
  ).toBeVisible();
  const payloads = await page.evaluate(() => window.submittedBriefs);
  expect(payloads).toHaveLength(2);
  expect(payloads[1].consultationMethod).toBe("Video consultation");
});
