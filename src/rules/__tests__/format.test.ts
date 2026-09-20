import { describe, expect, it } from "vitest";
import { formatValidValues } from "../format";

describe("formatValidValues", () => {
  it("lists stepped values", () => {
    expect(formatValidValues([3, 6, 9, 12, 15])).toBe("3, 6, 9, 12, 15");
  });

  it("collapses a contiguous range", () => {
    expect(formatValidValues([5, 6, 7, 8, 9, 10])).toBe("5–10");
  });

  it("does not collapse very short ranges", () => {
    expect(formatValidValues([50])).toBe("50");
    expect(formatValidValues([1, 2])).toBe("1, 2");
    expect(formatValidValues([])).toBe("");
  });
});
