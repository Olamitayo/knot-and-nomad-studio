import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addGarment,
  briefSchema,
  clothingTypes,
  consultationSummary,
  emptyBrief,
  garmentTotal,
  orderDatabasePayload,
  orderNotificationFields,
  overallTotal,
  stageError,
  updateGarment,
} from "../src/lib/custom-order.ts";
import { whatsappLink } from "../src/lib/site.ts";

function configured(type = "T-shirt") {
  const item = addGarment([], type)[0];
  return {
    ...item,
    primaryColor: "Cream",
    sizes: ["M", "L"],
    designIdea: "Travel & discovery",
    decorationMethod: "DTF",
    printPosition: "Front",
    quantitiesBySize: { M: 10, L: 15 },
    totalQuantity: 25,
  };
}
function validBrief() {
  return {
    ...emptyBrief(),
    items: [
      configured(),
      {
        ...configured("Jacket"),
        primaryColor: "Black",
        sizes: ["XL"],
        quantitiesBySize: { XL: 5 },
        totalQuantity: 5,
      },
    ],
    fullName: "Test Customer",
    email: "test@example.com",
    whatsapp: "+2348000000000",
    isFirstCustomOrder: true,
  };
}

test("one through five garments, sixth and duplicates rejected", () => {
  let items = [];
  for (const type of clothingTypes.slice(0, 5)) {
    items = addGarment(items, type);
    assert.ok(items.length <= 5);
  }
  assert.equal(items.length, 5);
  assert.equal(addGarment(items, clothingTypes[5]), items);
  assert.equal(addGarment(items, clothingTypes[0]), items);
  assert.equal(addGarment([], "invalid").length, 0);
});
test("edits and removal preserve independent garment data, files and totals", () => {
  const original = validBrief().items;
  const files = [{ name: "logo.png", url: "https://example.com/logo.png" }];
  const edited = updateGarment(original, original[0].id, {
    preferredColor: "Sand",
    designIdea: "A new story",
    referenceFiles: files,
  });
  assert.deepEqual(edited[1], original[1]);
  assert.deepEqual(edited.filter((item) => item.id !== original[1].id)[0].referenceFiles, files);
  assert.equal(original[0].preferredColor, "");
  assert.equal(garmentTotal(edited[0]), 25);
  assert.equal(overallTotal(edited), 30);
  const resized = updateGarment(edited, edited[0].id, { sizes: ["M"] });
  assert.deepEqual(resized[0].quantitiesBySize, { M: 10 });
  assert.equal(resized[0].totalQuantity, 10);
});
test("step validation rejects incomplete configuration and design", () => {
  const brief = validBrief();
  for (let stage = 0; stage < 3; stage++) assert.equal(stageError(brief, stage), "");
  brief.items[0].sizes = [];
  assert.match(stageError(brief, 0), /size/);
  brief.items[0].designIdea = "";
  assert.match(stageError(brief, 1), /concept/);
});
test("quantities reject zero, negative, fractional, missing and oversized values", () => {
  for (const invalid of [0, -1, 1.2, NaN, Infinity, 100001]) {
    const brief = validBrief();
    brief.items[0].quantitiesBySize.M = invalid;
    assert.equal(briefSchema.safeParse(brief).success, false);
    assert.match(stageError(brief, 2), /whole-number/);
  }
  const brief = validBrief();
  delete brief.items[0].quantitiesBySize.M;
  assert.equal(briefSchema.safeParse(brief).success, false);
});
test("server rejects duplicate IDs/types, invalid custom sizes, extra quantities and unsafe file URLs", () => {
  const mutations = [
    (brief) => brief.items.push(brief.items[0]),
    (brief) => (brief.items[1].id = brief.items[0].id),
    (brief) => brief.items[0].sizes.push("M"),
    (brief) => {
      brief.items[0].sizes = ["Custom"];
      brief.items[0].quantitiesBySize = { Custom: 1 };
    },
    (brief) => (brief.items[0].quantitiesBySize.XS = 3),
    (brief) => brief.items[0].referenceFiles.push({ name: "bad", url: "javascript:alert(1)" }),
  ];
  for (const mutate of mutations) {
    const brief = validBrief();
    mutate(brief);
    assert.equal(briefSchema.safeParse(brief).success, false);
  }
});
test("consultation is optional for first-time and returning customers; scheduled requests validated", () => {
  for (const first of [true, false]) {
    const brief = validBrief();
    brief.isFirstCustomOrder = first;
    assert.ok(briefSchema.safeParse(brief).success);
  }
  const brief = validBrief();
  brief.consultationRequested = true;
  assert.equal(briefSchema.safeParse(brief).success, false);
  Object.assign(brief, {
    consultationMethod: "WhatsApp call",
    consultationDate: "2099-01-01",
    consultationTime: "12:00",
  });
  assert.ok(briefSchema.safeParse(brief).success);
  brief.consultationDate = "2000-01-01";
  assert.equal(briefSchema.safeParse(brief).success, false);
  brief.consultationDate = "2099-02-30";
  assert.equal(briefSchema.safeParse(brief).success, false);
  brief.consultationRequested = false;
  brief.consultationDate = "2099-02-30";
  assert.ok(briefSchema.safeParse(brief).success);
});
test("WhatsApp summary contains individual garments and safely encoded questions", () => {
  const brief = validBrief();
  brief.consultationQuestions = "Logo & text? #旅行";
  const summary = consultationSummary(brief);
  assert.match(summary, /T-shirt — Cream — M: 10, L: 15 — quantity 25/);
  assert.match(summary, /Jacket — Black — XL: 5 — quantity 5/);
  const url = new URL(whatsappLink(summary));
  assert.equal(url.searchParams.get("text"), summary);
  assert.equal(url.hash, "");
  assert.equal(url.searchParams.size, 1);
});
test("multi-item database and notification payloads preserve all items and derive totals", () => {
  const brief = validBrief();
  brief.items[0].totalQuantity = 999;
  const parsed = briefSchema.parse(brief);
  const payload = orderDatabasePayload(parsed);
  assert.equal(payload.items[0].totalQuantity, 25);
  assert.equal(payload.quantity, 30);
  assert.equal(payload.items.length, 2);
  assert.equal(payload.clothing_type, "T-shirt, Jacket");
  assert.equal(payload.consultation_status, null);
  const fields = orderNotificationFields(parsed);
  assert.ok(
    fields.some(([label, value]) => label === "Garment 2 — Jacket: Garment total" && value === 5),
  );
  assert.ok(fields.some(([label, value]) => label === "Overall quantity" && value === 30));
});
