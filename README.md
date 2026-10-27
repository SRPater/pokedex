# Pokédex

A small Next.js (App Router) app built on [PokéAPI](https://pokeapi.co), made
for learning Next.js. There is no database: all data comes from the API and is
cached by Next.js for 24 hours.

## Running it

```bash
npm install
npm run dev     # then open http://localhost:3000/pokemon
npm run build   # type-checks every file, handy before committing
```


## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Data comes from PokéAPI, images
from the PokeAPI/sprites repository on GitHub (that host is allowed in
`next.config.ts` under `images.remotePatterns`).

## Pages

- `/`: landing page with a short intro and a button to the list.
- `/pokemon`: one row per species in Pokédex order, 20 per page (`?page=`).
- `/pokemon/[slug]`: detail page. The slug is the species name; an ID such as
  `/pokemon/25` redirects to `/pokemon/pikachu`. `?form=<variety>` selects which
  form every card shows (default form when missing or unknown). Previous/next
  buttons (sprite and number of the neighbouring species) wrap around: the one
  before #1 is the last species, and the one after it is #1.

Every page has a header (`SiteHeader`, in the root layout) linkin to `/` and
`/pokemon`, `global-error.tsx` doesn't show it on purpose, because it replaces
the whole layout.

## Layout of the code

- `src/app/pokemon/page.tsx`: the list page
- `src/app/pokemon/[slug]/page.tsx`: the detail page
- `src/components/`: `Card`, `Button` (`Button` and `ButtonLink`), `StatBar`,
  `GenderBar`, `OverviewCard`, `StatsCard`, `FormsCard`, `PokemonNav`,
  `PokemonTableSkeleton`, `SiteHeader`, `StatusMessage`
- `src/lib/pokeapi.ts`: API types, the shared fetch helper and fetchers, name helpers, the
  type lookup (form name to types)
- `src/lib/pokemon-detail.ts`: selected form and the other forms for the detail page
- `src/lib/display.ts`: formatting, labels, bar scales, color classes
- `src/lib/sprites.ts`: image URL builders

## Decisions worth remembering

- **Species, not Pokémon.** `/pokemon-species` has one entry per species with
  the real Pokédex numbers. `/pokemon` lists every form (Megas start at #10001).
- **List rule.** Each row shows the species' default form only: its sprite and
  types. Every other form (Megas, Gigantamax, regional and gender variants,
  Rotom appliances, ...) appears only on the detail page, in the Forms card.
- **Forms.** The selected form lives in the URL. The Forms card lists the other
  forms, one per distinct display name (male and female Mega Meowstic look the
  same).
- **Names.** English display names come from the species `names` and the form
  `names`. A form without an English name falls back to the species name.
- **Units.** The API gives height in decimetres and weight in hectograms. A
  weight of 0 is a placeholder in the data (Eternamax Eternatus).
- **Tailwind.** Class names must be complete literal strings. Values that are
  only known at runtime (bar widhts) go through inline `style`.
- **Loading states.** The detail page uses `[slug]/loading.tsx`. The list page
  doesn't: a `loading.tsx` doesn't show when only `?page=` changes, so the table
  sits in a `<Suspense>` keyed by page number, with `PokemonTableSkeleton` as the
  fallback.
- **Error handling.** `PokeApiError` carries the HTTP status, only a 404 from PokéAPI
  becomes a not-found page, and everything else goes to `error.tsx`.
- **Colour pairing.** We use `gray-[xxx]` colours from Tailwind for surfaces, stripes
  and borders. For surfaces we use `gray-50` for light mode and `gray-950` for dark
  mode. For stripes use `100` and `900` and for borders and hover use `200` and `800`.
- **Types in the list.** Species data has no types; they belong to each form.
  `getTypeLookup` fetches all 18 type pages once (cached) and builds a map from
  form name to types, so the list needs no extra request per row.
- **Colors.** Tailwind grays in light/dark pairs: `50`/`950` for surfaces
  (cards, table rows, buttons), `100`/`900` for stripes and `200`/`800` for
  borders and hover. Everything button-shaped shares one style in
  `components/Button.tsx`.

## To do

- Female sprites for species like Frillish and Unfezant
- The list table looks empty on the right side
