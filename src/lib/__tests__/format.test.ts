import { describe, it, expect } from "vitest";
import { greeting, initials, relativeTime } from "../format";

describe("greeting", () => {
  it("greets in the morning", () => {
    expect(greeting("Akshay", 9)).toBe("Good morning, Akshay");
  });
  it("greets in the afternoon", () => {
    expect(greeting("Akshay", 14)).toBe("Good afternoon, Akshay");
  });
  it("greets in the evening", () => {
    expect(greeting("Akshay", 20)).toBe("Good evening, Akshay");
  });
});

describe("initials", () => {
  it("returns the first two characters", () => {
    expect(initials("Akshay")).toBe("AK");
  });
  it("falls back for empty names", () => {
    expect(initials("   ")).toBe("CR");
  });
});

describe("relativeTime", () => {
  it("handles undefined", () => {
    expect(relativeTime()).toBe("just now");
  });
  it("formats minutes", () => {
    const iso = new Date(Date.now() - 5 * 60000).toISOString();
    expect(relativeTime(iso)).toBe("5m ago");
  });
  it("formats hours", () => {
    const iso = new Date(Date.now() - 3 * 3600000).toISOString();
    expect(relativeTime(iso)).toBe("3h ago");
  });
});
