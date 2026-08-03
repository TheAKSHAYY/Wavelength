import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, signToken, verifyToken } from "../auth.js";

describe("password hashing", () => {
  it("verifies the correct password", () => {
    const stored = hashPassword("correct horse battery staple");
    expect(stored).toContain(":");
    expect(verifyPassword("correct horse battery staple", stored)).toBe(true);
  });

  it("rejects a wrong password", () => {
    const stored = hashPassword("correct horse battery staple");
    expect(verifyPassword("wrong password", stored)).toBe(false);
  });

  it("rejects a malformed stored hash", () => {
    expect(verifyPassword("anything", "not-a-real-hash")).toBe(false);
  });
});

describe("JWT signing", () => {
  it("round-trips a signed token", () => {
    const token = signToken({ id: "u1", email: "a@example.com", name: "A" });
    const payload = verifyToken(token);
    expect(payload?.sub).toBe("u1");
    expect(payload?.email).toBe("a@example.com");
    expect(payload?.name).toBe("A");
  });

  it("rejects garbage tokens", () => {
    expect(verifyToken("not.a.jwt")).toBeNull();
    expect(verifyToken("")).toBeNull();
  });
});
