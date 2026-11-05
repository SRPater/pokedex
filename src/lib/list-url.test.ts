import { describe, expect, it } from "vitest";
import { listHref } from "./list-url";

describe("listHref", () => {
  it.each([
    ["", "number", 1, "/pokemon"],
    ["", "number", 2, "/pokemon?page=2"],
    ["pika", "number", 1, "/pokemon?q=pika"],
    ["mr. mime", "number", 1, "/pokemon?q=mr.+mime"],
    ["a", "name", 3, "/pokemon?q=a&sort=name&page=3"],
    ["", "name-desc", 1, "/pokemon?sort=name-desc"],
  ] as const)("%j / %s / %i -> %s", (query, sort, page, expected) => {
    expect(listHref({ query, sort, page })).toBe(expected);
  });
});
