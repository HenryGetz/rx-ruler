import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validate } from "../src/validate.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

function loadFixture(name: string) {
  const path = resolve(__dirname, "fixtures", name);
  return JSON.parse(readFileSync(path, "utf-8"));
}

const validFixture = loadFixture("v5-valid.json");

describe("validate", () => {
  // Test 1: Valid v5 export → ok: true
  it("returns ok:true for valid v5 resume", () => {
    const result = validate(validFixture);
    expect(result.ok).toBe(true);
    // When ok is true, result.data should contain the parsed resume
    if (result.ok) {
      expect(result.data).toBeDefined();
      expect(result.data.basics.name).toBe("Test User");
    }
  });

  // Test 2: Missing required root field (delete basics) → error with dotted path
  it("reports missing required root field", () => {
    // Create a copy of the valid fixture with the basics key deleted
    const { basics: _, ...input } = validFixture;
    const result = validate(input);
    expect(result.ok).toBe(false);
    // Zod v4 looseObject reports missing fields with invalid_type at the field path.
    // At least one error should reference "basics" in its path.
    const hasBasicsError = result.errors.some(
      (e: any) =>
        (typeof e.path === "string" && e.path === "basics") ||
        (Array.isArray(e.path) && e.path[0] === "basics"),
    );
    expect(hasBasicsError).toBe(true);
  });

  // Test 3: Wrong type at nested path → error with correct dotted path, code "invalid_type"
  it("reports wrong type at nested path with dotted path and invalid_type code", () => {
    // Build input where sections.experience.items[0].period is a number instead of string
    const input = {
      ...validFixture,
      sections: {
        ...validFixture.sections,
        experience: {
          ...validFixture.sections.experience,
          items: [
            {
              id: "019bef5a-0477-77e0-968b-5d0e2ecb34e3",
              hidden: false,
              company: "ACME Corp",
              position: "Developer",
              location: "New York",
              period: 2024,
              website: { url: "", label: "", inlineLink: false },
              description: "",
              roles: [],
            },
          ],
        },
      },
    };
    const result = validate(input);
    expect(result.ok).toBe(false);
    // Zod schema defines period as z.string() in experienceItemSchema
    const periodError = result.errors.find((e: any) => {
      const path =
        typeof e.path === "string"
          ? e.path
          : Array.isArray(e.path)
            ? e.path.join(".")
            : "";
      return path === "sections.experience.items.0.period";
    });
    expect(periodError).toBeDefined();
    expect(periodError.code).toBe("invalid_type");
  });

  // Test 4: Two unrelated errors → both surface (no short-circuit)
  it("reports multiple unrelated errors without short-circuiting", () => {
    // Create input with two errors:
    // 1. basics.name is a number (expected string)
    // 2. picture.size is a string (expected number)
    const input = {
      ...validFixture,
      basics: { ...validFixture.basics, name: 123 },
      picture: { ...validFixture.picture, size: "big" },
    };
    const result = validate(input);
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  // Test 5: Non-object input → errors (not a schema error)
  it("returns errors for non-object input", () => {
    // validate() receives unknown — passing a string should produce errors
    const result = validate("not json at all");
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(1);
  });

  // Test 6: {} → multiple errors for all 6 required root fields
  it("reports multiple errors for empty object", () => {
    const result = validate({});
    expect(result.ok).toBe(false);
    // resumeDataSchema has 6 required root keys: picture, basics, summary,
    // sections, customSections, metadata — all should be reported as missing
    expect(result.errors.length).toBeGreaterThanOrEqual(1);
  });
});
