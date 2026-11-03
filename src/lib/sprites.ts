// Image URLs from PokéAPI's sprite repository. The host must stay in sync with
// `images.remotePatterns` in next.config.ts.
const SPRITES_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites";

/** Small pixel sprites, used in the list and the previous/next buttons. id is a Pokémon ID, forms included. */
export function getSpriteUrl(id: number): string {
  return `${SPRITES_BASE}/pokemon/${id}.png`;
}

/** Large official artwork, used for the thumbnails in the Other Forms card. */
export function getArtworkUrl(id: number): string {
  return `${SPRITES_BASE}/pokemon/other/official-artwork/${id}.png`;
}

/**
 * Large render (Pokémon HOME style), used for the big picture on the detail page.
 * It's the only style with female pictures (`female` = true), which exist only
 * for species with `has_gender_differences`. Some cosmetic forms have no render.
 */
export function getRenderUrl(id: number, female = false): string {
  return `${SPRITES_BASE}/pokemon/other/home/${female ? "female/" : ""}${id}.png`;
}

/** Wide type icon in the Scarlet/Violet style; `id` is the type's ID. */
export function getTypeIconUrl(id: number): string {
  return `${SPRITES_BASE}/types/generation-ix/scarlet-violet/${id}.png`;
}

/** Small square type icon (60x60), Scarlet/Violet style, for compact places like the list. */
export function getSmallTypeIconUrl(id: number): string {
  return `${SPRITES_BASE}/types/generation-ix/scarlet-violet/small/${id}.png`;
}
