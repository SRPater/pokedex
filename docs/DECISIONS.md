# Design decisions

Why the app is built the way it is. The short version is in the
[README](../README.md#design-decisions); this document holds the reasoning.

## Data

### Species, not Pokémon

The list uses `/pokemon-species`, which has one entry per species with the real
Pokédex numbers. `/pokemon` lists every form instead (Megas start at #10001),
which would put forms in the list as if they were separate Pokémon.

### Varieties and forms

In PokéAPI a species has varieties (the `pokemon` entries, with types, stats and
so on), and each variety has forms (`pokemon-form`). The app uses forms only for
display names. They don't always share a name (the variety `koraidon` has the
form `koraidon-apex-build`), so `getPokemonForm` returns `null` on a 404 and the
label falls back to the species name.

### Caching

All responses are cached for 24 hours (`REVALIDATE_SECONDS` in `pokeapi.ts`).
The data almost never changes, and PokéAPI asks clients to cache locally.

### Names and units

- English display names come from the species `names` and the form `names`. A
  form without an English name falls back to the species name.
- The API gives height in decimetres and weight in hectograms. A weight of 0 is
  a placeholder in the data (Eternamax Eternatus), not a real weight.

## List page

### One row per species

Each row shows the species' default form only: sprite, name, category and type
icons. Every other form (Megas, Gigantamax, region and gender variants, Rotom
appliances, ...) appears only on the detail page, in the Forms card. This keeps
the list in real Pokédex order without duplicates.

### Types without a request per row

Species data has no types; they belong to each form. `getTypeLookup` fetches the
18 type pages once (cached) and builds a map from form name to types, so the list
needs no extra request per row.

### Search and sort in our own code

PokéAPI has no search or sort endpoint, so the list fetches every species name
(one cached request), then filters (`searchByName`, on the slugs), sorts
(`sortSpecies`) and slices out the page itself. Only number and name can be
sorted, because the category and types aren't in the list of names.

`listHref` is the only place that builds list URLs and leaves out the defaults.
The search box and the sort dropdown are one client component (`ListControls`),
because each needs the other's value when it changes the URL.

### Loading state

`loading.tsx` doesn't show when only `?page=` changes, so the list page doesn't
use it. The table sits in a `<Suspense>` keyed by page number, with
`PokemonTableSkeleton` as the fallback. The detail page does use `[slug]/loading.tsx`.

### Random Pokémon

`/pokemon/random` is a route handler that reads the species count (the same
cached request `getNeighbours` uses) and redirects to a random number, so new
generations are picked up without code changes. It is a plain link, so it works
without JavaScript. The landing page's `ButtonLink` passes `prefetch={false}`, so
the pick is made on each click and not reused from a prefetch.

## Detail page

### State in the URL

The detail page picks a variety with `?form=`, `?region=` and `?gender=`. A
parameter that is left out means "same as the default variety", so the default
never appears in the URL. `parseVariety`, `findVariety` and `buildVarietyQuery`
(`lib/variety.ts`) translate between variety names (`meowstic-female-mega`) and
parameters (`?form=mega&gender=female`).

A combination that doesn't exist redirects to the plain page. Every link on the
page is built with `buildVarietyQuery`, so nothing builds a URL from a raw
variety name. Every view is linkable and needs no client state.

### Forms card

The card offers the other forms in the gender being viewed, labeled without the
gender (the base form of Meowstic reads "Meowstic", its Mega "Mega Meowstic").

- `LIMITED_FORMS` lists species whose extra forms are cosmetic or in-game modes
  (Pikachu, Eevee, Koraidon, Miraidon). The card offers only the default form
  plus what is listed for them (Gigantamax).
- `FORM_LINKS` gives species with two base looks (Urshifu, Darmanitan,
  Toxtricity) their own list of links per selected form.

Both tables use variety names, so they don't depend on the URL scheme.

### Type matchups

The card shows what the selected form is weak to (x4, then x2), resists (x1/4,
then x1/2) and is immune to, so it follows the form, region and gender in the URL.

- `getDamageFrom` reads the `damage_relations` of each of the form's types from
  the same type pages `getTypeLookup` fetches, so they come from the cache.
- `combineMatchups` multiplies the factors type by type. They are only 0, 0.5
  and 2, so the products are exact, and an immunity (0) stays 0, so it beats a
  weakness.
- Neutral (x1) is left out, including a weakness cancelled by a resistance.
  Immunities show no multiplier, because the heading says it.
- The wide type icon is used from `md` up and the small one below, both in the
  markup with CSS picking one.
- An icon needs the type's ID, which is its position in `TYPE_NAMES` plus one
  (`getTypeId`, which throws for an unknown name).

### Gender

- Species with separate gender varieties (Meowstic, Indeedee, Oinkologne,
  Basculegion) get a ♂/♀ switch under the artwork that links to the other
  gender's variety, so stats and abilities follow. It also shows on Megas,
  because a Mega's learnset comes from the base form's gender.
- Species where the female only looks different (`has_gender_differences`, e.g.
  Pikachu, Frillish) get a switch that only swaps the picture (`?gender=female`,
  default form only).

### Shiny

`?shiny=true` shows the shiny pictures; the default (normal) is left out of the
URL. `ShinyToggle` is a vertical switch styled like `GenderSwitch`, placed to the
right of the big picture (the picture itself stays centered). Like the gender
switch, the unselected side is a link, not client state.

- The page builds the toggle's link from the incoming parameters, so form, region
  and gender survive a toggle.
- In the other direction, `keepShiny` in `[slug]/page.tsx` adds `?shiny=true` to
  the gender switch and Forms card links, so switching gender or form keeps shiny on.
- The HOME render has the shiny pictures in `shiny/` and `shiny/female/` (the
  folder order matters), and the female shiny picture exists only where the
  female one does. The Forms card uses the shiny official artwork.

### Cries

The cry belongs to each variety (`pokemon/[name]`, field `cries.latest`, an `.ogg`
file on raw.githubusercontent.com), so every form plays its own. `legacy` is null
for many Pokémon, so only `latest` is used, and the button is hidden when a form
has no cry.

`CryButton` is a client component that creates a new `Audio` on each click, so
nothing downloads until someone asks and the sound always matches the form on
screen. The button shows only the emoji (`aria-hidden`); the label is `sr-only`
and also the `title` tooltip.

### Evolution card

The card shows how the species evolves: one row per path through the evolution
chain, each stage a small sprite (it follows the shiny toggle) with its name,
linked to its own page. The stage on screen is not a link, which is how it is
marked. Rows sit in two columns from `lg` up with a thin line between them, and a
single row is centered. A species that doesn't evolve gets no card.

On small screens a row never wraps. The sprite size is one value per row (`--s`, in
`EvolutionCard`) that follows the screen width, from 56px up to 96px, so three stages
and two arrows always fit. The arrow is an item of its own, as high as the sprite, so it
stays centered on it and can't overlap it. Long names and conditions wrap inside their
stage and don't widen it. There is one rule for every screen size and no breakpoint per
phone. Stacking the paths vertically was rejected because Eevee's eight rows would make
the card very tall, and scrolling sideways hides half of a three-stage row.

**From chain to rows** (`lib/evolution.ts`). `getEvolutionPathsForPage` does these
steps in order, and each one is a small tested function:

- The chain is a tree (Eevee has eight branches) and is the same for the whole
  family. `getEvolutionPaths` turns it into one list of stages per path, and
  `getPathsThrough` keeps the paths through the species on screen (Jolteon shows
  Eevee → Jolteon, Eevee shows all eight).
- A stage can have several entries (`evolution_details`): one per game where the
  rules changed, or alternatives. `getCurrentDetails` keeps the ones marked
  `is_default`. Leafeon has six entries and one is current; regional alternatives
  are all marked, so they all stay.
- Regional forms: an entry's `required_pokemon_form` and `evolved_pokemon_form` say
  which form it goes from and to, and `null` means the default form.
  `getFormPaths` makes one path per combination that exists and only joins steps
  whose forms fit together (Obstagoon only follows Galarian Linoone). `region` is
  not used for this: it is a condition ("In Alola"), because Alolan Raichu evolves
  from a normal Pikachu, while Alolan Ninetales comes from Alolan Vulpix and has
  none.
- `getPathsForForm` keeps the paths that contain the form on screen (Raichu: the
  normal path, Alolan Raichu: the Alolan one, Pikachu: both). A form that is on no
  path (Mega Raichu X) shows the species' own chain. The fallback uses the species
  name and not the default variety's, because a form is named after the species
  when the API leaves it `null`, while the variety on screen can be named
  differently.
- `collapseUnknownForms` turns a form that isn't a variety of its species into the
  species' own form and merges the paths that become the same. This gives Alcremie
  one path instead of 63: its entries lead to cosmetic forms without a page or a
  picture. Only species that have a form of their own are fetched for this.
- `fillFormIds` gives regional forms their own Pokémon ID for the sprite (Alolan
  Raichu is 10100). A species' own form uses the ID in the chain's URL, which is
  its default form's ID.
- Names, conditions and links are added last, and only for the stages that are
  shown. Links are built like the Forms card's (`buildVarietyQuery`), and the page
  adds `?shiny`.

### Evolution conditions

Under each name (not the first stage's) a short list says how that stage is
reached, one condition per line and as short as possible: "Level 16", "Thunder
Stone", "Trade for Shelmet". `getConditions` (`lib/conditions.ts`) builds it.

- The lines go under the evolved stage and not on the arrows, because there is no
  room between the sprites.
- A level-up always starts with "Level up" or its level. Without it, "Holding
  Razor Fang" and "Nighttime" (Gliscor) would read as if holding the item at
  night were enough.
- English names of items, moves, species and locations come from the API, with the
  same `findEnglish` helper as the other names. Each distinct one is fetched once
  for the shown entries (cached), and a missing name shows the raw one, so a
  condition is never hidden.
- Some triggers have fixed lines written by hand, because the API only has their
  names. "Spin" is the whole condition: Alcremie's 63 entries are merged, so the
  other fields of the one that is left (a Sweet, a time of day) would be wrong for
  the others. The other fixed triggers are followed by the entry's other fields
  (Kingambit: "Defeat 3 leader Bisharp", "Holding Leader's Crest"). `use-move`
  (Annihilape) is a level-up after using the move; the two style triggers (Wyrdeer,
  Overqwil) are not.
- A chance ("99% chance") comes from `condition_expression.percentage_chance`.
  It tells Wurmple's, Maushold's and Dudunsparce's entries apart. The formula
  itself is not shown.
- The natures of Toxel → Toxtricity are too many to list under a sprite, so the
  line only names the form ("Amped nature", "Low Key nature") and the full list is
  a tooltip. A tooltip only shows on hover, so it is not there on a phone.
- Fields that no current entry uses are left out: beauty, affection and the Moss or
  Ice Rock. This was checked against PokéAPI's `pokemon_evolution.csv` for rows with
  `is_default` set to 1. When a current entry starts to use one, add the field and
  a line for it.

### Titles

The root layout sets a title template (`%s | Pokédex`). The list page exports a
static title, and the detail page a `generateMetadata` that uses the species'
English name; unknown slugs keep the default title.

## Images

The big picture is the Pokémon HOME render, because the female pictures only
exist there; the Forms card uses the official artwork, and the Evolution card the
small sprites (`getSpriteUrl`, which also has a shiny version). Some cosmetic
forms have no HOME render, which is one more reason they aren't offered.

All images are `unoptimized` (`images.unoptimized` in `next.config.ts`), so the
browser loads them straight from GitHub instead of through `/_next/image`. Every
image that goes through the optimizer counts as a Vercel image transformation
(the free plan allows 5,000 per billing period), and a burst of traffic on the
new domain used that up in one day. The cost is no WebP/AVIF conversion, so images
are a bit heavier.

## Errors

`PokeApiError` carries the HTTP status. Only a 404 from PokéAPI becomes a
not-found page, because that is the only status that means "no such Pokémon".
Everything else is a real failure and goes to `error.tsx`. `global-error.tsx`
doesn't show the site header on purpose, because it replaces the whole layout.

## Styling

- **Colors:** Tailwind grays in light/dark pairs: `50`/`950` for surfaces (cards,
  table rows, buttons), `100`/`900` for stripes and `200`/`800` for borders and
  hover. Everything button-shaped shares one style in `components/Button.tsx`.
- **Tailwind:** class names must be complete literal strings, so values that are
  only known at runtime (bar widths) go through inline `style`.
- **Small screens:** cards and page padding shrink below `md` (`p-4 md:p-8`,
  `px-4 md:px-8`), and the gender bar drops its fixed label widths there. The Type
  Matchups headings and column gaps are smaller below `md`, so "Immune To" stays on one
  line at 320px. The Evolution card scales its sprites instead (see Evolution card).

## Tests

The URL/variety, search, sort, list-URL, type-matchup, type-ID, sprite-URL,
evolution-path and evolution-condition logic is covered by Vitest (`npm test`).
To check a species with unusual form names, add a `makeSpecies` line and put it
in `speciesByName`; the round-trip test picks it up.

## Not built yet

- **Learnsets:** a Mega's learnset comes from the base form, so it depends on the
  gender being viewed.
