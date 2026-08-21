import { describe, it, expect } from "vitest";
import { extractJSON } from "../parse";
import { parseModelJSON } from "../ai";
import { ideaSchema } from "../schemas";

describe("extractJSON", () => {
  it("parses raw JSON objects", () => {
    expect(extractJSON('{"a":1}')).toEqual({ a: 1 });
  });

  it("parses raw JSON arrays", () => {
    expect(extractJSON('[1,2]')).toEqual([1, 2]);
  });

  it("extracts from fenced code blocks", () => {
    const text = "Here you go:\n```json\n{\"a\":1}\n```";
    expect(extractJSON(text)).toEqual({ a: 1 });
  });

  it("extracts JSON from surrounding prose", () => {
    const text = 'Sure! [{"title":"x"}] hope that helps';
    expect(extractJSON(text)).toEqual([{ title: "x" }]);
  });

  it("picks the first valid JSON candidate", () => {
    const text = "prefix { not valid [1,2] and {\"b\":2}";
    expect(extractJSON(text)).toEqual([1, 2]);
  });

  it("throws when no JSON is present", () => {
    expect(() => extractJSON("no json here")).toThrow(/No JSON/);
  });

  it("throws on empty input", () => {
    expect(() => extractJSON("   ")).toThrow(/No JSON/);
  });
});

describe("parseModelJSON", () => {
  const schema = ideaSchema.array();

  it("validates a well-formed model response", () => {
    const out = parseModelJSON(
      schema,
      '[{"title":"t","viral":80,"demand":"High","difficulty":"Low","audience":"devs"}]'
    );
    expect(out[0].title).toBe("t");
    expect(out[0].viral).toBe(80);
  });

  it("handles key aliases, string percentages, and lowercase enums gracefully", () => {
    const out = parseModelJSON(
      schema,
      '[{"title":"Android Dev Mistakes","viralScore":"94%","demand":"high","difficulty":"easy","targetAudience":"Beginner devs"}]'
    );
    expect(out[0].title).toBe("Android Dev Mistakes");
    expect(out[0].viral).toBe(94);
    expect(out[0].demand).toBe("High");
    expect(out[0].difficulty).toBe("Low");
    expect(out[0].audience).toBe("Beginner devs");
  });

  it("throws a friendly error on completely empty/invalid shape", () => {
    expect(() => parseModelJSON(schema, '[{"wrong":123}]')).toThrow(/didn't match/i);
  });
});

