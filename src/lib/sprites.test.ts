import { describe, expect, it } from "vitest";
import { getArtworkUrl, getRenderUrl } from "./sprites";

const BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home";

describe("getRenderUrl", () => {
  it.each([
    [{}, `${BASE}/25.png`],
    [{ female: true }, `${BASE}/female/25.png`],
    [{ shiny: true }, `${BASE}/shiny/25.png`],
    [{ shiny: true, female: true }, `${BASE}/shiny/female/25.png`],
  ])("%j", (options, expected) => {
    expect(getRenderUrl(25, options)).toBe(expected);
  });

  it("works without options", () => {
    expect(getRenderUrl(25)).toBe(`${BASE}/25.png`);
  });
});

const ARTWORK =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

describe("getArtworkUrl", () => {
  it.each([
    [{}, `${ARTWORK}/25.png`],
    [{ shiny: true }, `${ARTWORK}/shiny/25.png`],
  ])("%j", (options, expected) => {
    expect(getArtworkUrl(25, options)).toBe(expected);
  });
});
