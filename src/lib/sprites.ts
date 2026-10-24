// Image URLs from PokéAPI's sprite repository. The host must stay in sync with
// `images.remotePatterns` in next.config.ts.
const SPRITES_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites";

/** Small pixel sprites, used in the list. `id` is a Pokémon ID, forms included. */
export function getSpriteUrl(id: number): string {
  return `${SPRITES_BASE}/pokemon/${id}.png`;
}

/** Large official artwork, used on the detail page. */
export function getArtworkUrl(id: number): string {
  return `${SPRITES_BASE}/pokemon/other/official-artwork/${id}.png`;
}

/** Wide type icon in the Scarlet/Violet style; `id` is the type's ID. */
export function getTypeIconUrl(id: number): string {
  return `${SPRITES_BASE}/types/generation-ix/scarlet-violet/${id}.png`;
}
