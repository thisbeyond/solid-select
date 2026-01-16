
import { describe, it, expect } from "vitest";
import { createOptions } from "./create-options";

describe("createOptions", () => {
  it("should not offer to create a duplicate option when input has trailing space", () => {
    const { options } = createOptions(["Apple", "Banana"], {
      createable: true,
      filterable: true,
      format: (value, type, meta) => {
        if (type === "label") {
          return `${meta.prefix || ""}${value}`;
        }
        return value as any;
      },
    });

    // Case 1: Exact match "Apple"
    const results1 = options("Apple");
    // Should pass filter and be present
    expect(results1.some((o) => o.text === "Apple")).toBe(true);
    // Should NOT offer to "Create Apple"
    expect(
      results1.some((o) => (o.label as string).includes("Create"))
    ).toBe(false);

    // Case 2: Trailing space "Apple "
    const results2 = options("Apple ");

    // If the bug exists:
    // 1. "Apple" is filtered out (because "Apple " != "Apple").
    // 2. createable sees no "Apple", so it adds "Create Apple".
    // 3. results2 contains "Create Apple".

    // Check if we have the "Create Apple" option
    // We Expect NOT to have it.
    const hasCreateOption = results2.some((o) =>
      (o.label as string).includes("Create")
    );

    expect(hasCreateOption).toBe(false);
  });
});
