import { describe, expect, it } from "vitest";
import { normalizeQuery, searchByName } from "./search";

describe("normalizeQuery", () => {
  it.each([
    ["Mr. Mime", "mr-mime"],
    ["mr mime", "mr-mime"],
    ["  Pikachu ", "pikachu"],
    ["Flabébé", "flabebe"],
    ["Farfetch'd", "farfetchd"],
    ["Type: Null", "type-null"],
    // The symbol is dropped; "nidoran" then matches both Nidorans.
    ["Nidoran♀", "nidoran"],
    ["", ""],
    ["   ", ""],
  ])("%j -> %j", (query, expected) => {
    expect(normalizeQuery(query)).toBe(expected);
  });
});

// Names as the species list gives them: slugs, not display names.
const items = [
  "pikachu",
  "raichu",
  "mr-mime",
  "mime-jr",
  "nidoran-f",
  "nidoran-m",
  "farfetchd",
].map((name) => ({ name }));

describe("searchByName", () => {
  it.each([
    ["pika", ["pikachu"]],
    ["chu", ["pikachu", "raichu"]],
    ["Mr. Mime", ["mr-mime"]],
    ["mime", ["mr-mime", "mime-jr"]],
    ["nidoran", ["nidoran-f", "nidoran-m"]],
    ["Farfetch'd", ["farfetchd"]],
    ["xyz", []],
  ])("%j", (query, expected) => {
    expect(searchByName(items, query).map((i) => i.name)).toEqual(expected);
  });

  it("returns everything for an empty query", () => {
    expect(searchByName(items, "").length).toBe(items.length);
  });
});
