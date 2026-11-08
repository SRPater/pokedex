// Image URLs from PokéAPI's sprite repository. The host must stay in sync with
// `images.remotePatterns` in next.config.ts.
const SPRITES_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites";

/** Small pixel sprites, used in the list and the previous/next buttons. id is a Pokémon ID, forms included. */
export function getSpriteUrl(id: number): string {
  return `${SPRITES_BASE}/pokemon/${id}.png`;
}

/**
 * Large official artwork, used for the thumbnails in the Other Forms card.
 * `shiny` picks the shiny version.
 */
export function getArtworkUrl(
  id: number,
  { shiny = false }: { shiny?: boolean } = {},
): string {
  return `${SPRITES_BASE}/pokemon/other/official-artwork/${shiny ? "shiny/" : ""}${id}.png`;
}

/**
 * Large render (Pokémon HOME style), used for the big picture on the detail page.
 * `female` and `shiny` pick the other versions of the picture. Female pictures
 * exist only for species with `has_gender_differences`, and the female shiny
 * picture only where the female one does. Some cosmetic forms have no render.
 */
export function getRenderUrl(
  id: number,
  { female = false, shiny = false }: { female?: boolean; shiny?: boolean } = {},
): string {
  // The folder order matters: shiny/female/25.png, not female/shiny/25.png.
  const folder = `${shiny ? "shiny/" : ""}${female ? "female/" : ""}`;
  return `${SPRITES_BASE}/pokemon/other/home/${folder}${id}.png`;
}

/** Wide type icon in the Scarlet/Violet style; `id` is the type's ID. */
export function getTypeIconUrl(id: number): string {
  return `${SPRITES_BASE}/types/generation-ix/scarlet-violet/${id}.png`;
}

/** Small square type icon (60x60), Scarlet/Violet style, for compact places like the list. */
export function getSmallTypeIconUrl(id: number): string {
  return `${SPRITES_BASE}/types/generation-ix/scarlet-violet/small/${id}.png`;
}
