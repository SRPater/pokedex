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

- `/pokemon`: one row per species in Pokédex order, 20 per page (`?page=`).
- `/pokemon/[slug]`: detail page. The slug is the species name; an ID such as
  `/pokemon/25` redirects to `/pokemon/pikachu`. `?form=<variety>` selects which
  form every card shows (default form when missing or unknown).

## Layout of the code

- `src/app/pokemon/page.tsx`: the list page
- `src/app/pokemon/[slug]/page.tsx`: the detail page
- `src/components/`: `Card`, `StatBar`, `GenderBar`, `OverviewCard`, `StatsCard`, `FormsCard`, `PokemonTableSkeleton`
- `src/lib/pokeapi.ts`: API types, the shared fetch helper and fetchers, name helpers, the list-form rule
- `src/lib/pokemon-detail.ts`: selected form and the other forms for the detail page
- `src/lib/display.ts`: formatting, labels, bar scales, color classes
- `src/lib/sprites.ts`: image URL builders

## Decisions worth remembering

- **Species, not Pokémon.** `/pokemon-species` has one entry per species with
  the real Pokédex numbers. `/pokemon` lists every form (Megas start at #10001).
- **List rule.** A row shows the default form plus gender and regional
  variants (see `KEPT_SUFFIXES` in `pokeapi.ts`). Everything else (Megas,
  Gigantamax, Primals, Rotom appliances, Origin/Therian forms, cosmetic forms,
  Totems) only appears on the detail page.
- **Gender.** A second sprite is shown only when the API has a separate variety
  (Meowstic). Species whose female differs only by sprite (Frillish, Unfezant)
  are not handled yet.
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

## To do

- `error.tsx` and a styled 404 page
- Female sprites for species like Frillish and Unfezant
- The list table looks empty on the right side
