# Pokédex

A small Next.js (App Router) app built on [PokéAPI](https://pokeapi.co), made
for learning Next.js. There is no database: all data comes from the API and is
cached by Next.js for 24 hours.

Live: https://pokedex-srp-ater.vercel.app

## Running it

```bash
npm install
npm run dev     # then open http://localhost:3000/pokemon
npm run build   # type-checks every file, handy before committing
npm test        # Vitest unit tests for the URL/variety logic (src/lib/variety.test.ts)
```

If a Tailwind class seems to do nothing in dev, hard-reload (Ctrl+Shift+R)
before debugging.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS. Data comes from PokéAPI, images
from the PokeAPI/sprites repository on GitHub (that host is allowed in
`next.config.ts` under `images.remotePatterns`).

## Deployment

Deployed on Vercel from the Github repository (root directory `./`, no
environment variables, since PokéAPI needs no key). Pushing to `main` deploys
automatically, which is Vercel's default for a Git-connected project.

## Pages

- `/`: landing page with a short intro and a button to the list.
- `/pokemon`: one row per species in Pokédex order, 20 per page (`?page=`). Each
  row shows the number, the default form's sprite, the name, the category and
  the type icons; the category and types are hidden below the `md` breakpoint.
  Invalid page numbers fall back to page 1, and pages past the end are a 404.
- `/pokemon/[slug]`: detail page. The slug is the species name; an ID such as
  `/pokemon/25` redirects to `/pokemon/pikachu`. Three optional parameters pick
  the variety: `?form=` (`mega`, `mega-x`, `gmax`, `zen`, ...), `?region=`
  (`alola`, `galar`, `hisui`, `paldea`) and `?gender=` (`female`; male is the
  default). A parameter that is left out means "same as the default variety". A
  combination that doesn't exist redirects to the plain page. The heading sits
  between the previous and next buttons ( +"DetailHeader"+ ), which link to the
  neighbouring species in Pokédex order and wrap around: the one before #1 is
  the last species, and the one after it is #1.

Every page has a header (`SiteHeader`, in the root layout) linking to `/` and
`/pokemon`. `global-error.tsx` doesn't show it on purpose, because it replaces
the whole layout.

## Layout of the code

- `src/app/`: besides the two pages, `layout.tsx` (header and title template),
  the landing page `page.tsx`, `not-found.tsx`, `error.tsx`, `global-error.tsx`
  and `pokemon/[slug]/loading.tsx`
- `src/app/pokemon/page.tsx`: the list page
- `src/app/pokemon/[slug]/page.tsx`: the detail page
- `src/components/`: `Button` (`Button` and `ButtonLink`), `Card`, `DetailHeader`, 
  `FormsCard`, `GenderBar`, `GenderSwitch`, `OverviewCard`, `PokemonTableSkeleton`,
  `SiteHeader`, `StatBar`, `StatsCard`, `StatusMessage`
- `src/lib/display.ts`: formatting, labels, bar scales, color classes
- `src/lib/pokeapi.ts`: API types, the shared fetch helper and fetchers, name helpers, the
  type lookup (form name to types)
- `src/lib/pokemon-detail.ts`: everything the detail page needs beyond the
  species: the selected variety's data, the other forms for the Forms card
  (`LIMITED_FORMS`, `FORM_LINKS`) and the gender-switch helpers
- `src/lib/sprites.ts`: image URL builders
- `src/lib/variety.ts`: `parseVariety`, `findVariety` and `buildVarietyQuery`,
  which translate between variety names (`meowstic-female-mega`) and URL
  parameters (`?form=mega&gender=female`); tested in `variety.test.ts`

## Decisions worth remembering

- **Species, not Pokémon.** `/pokemon-species` has one entry per species with
  the real Pokédex numbers. `/pokemon` lists every form (Megas start at #10001).
- **List rule.** Each row shows the species' default form only: its sprite, name,
  category and type icons. Every other form (Megas, Gigantamax, regional and
  gender variants, Rotom appliances, ...) appears only on the detail page, in
  the Forms card.
- **Types in the list.** Species data has no types; they belong to each form.
  `getTypeLookup` fetches all 18 type pages once (cached) and builds a map from
  form name to types, so the list needs no extra request per row.
- **URL parameters.** The detail page picks a variety with `?form=` (`mega`,
  `mega-x`, `gmax`, `zen`, ...), `?region=` (`alola`, `galar`, `hisui`,
  `paldea`) and `?gender=` (`female`). A parameter that is left out means "same
  as the default variety", so the default never appears in the URL.
  `parseVariety`, `findVariety` and `buildVarietyQuery` (`lib/variety.ts`)
  translate between variety names (`meowstic-female-mega`) and parameters
  (`?form=mega&gender=female`). A combination that doesn't exist redirects to
  the plain page, and every link on the page is built with `buildVarietyQuery`,
  so nothing builds a URL from a raw variety name.
- **Varieties vs. forms.** In PokéAPI a species has varieties (the Pokémon
  entries, with types, stats and so on), and each variety has forms
  (`pokemon-form`), which we only use for display names. They don't always share
  a name (the variety `koraidon` has the form `koraidon-apex-build`), so
  `getPokemonForm` returns `null` on a 404 and the label falls back to the
  species name.
- **Forms card.** It offers the other forms in the gender being viewed, labeled
  without the gender (the base form of Meowstic reads "Meowstic", its Mega "Mega
  Meowstic"). `LIMITED_FORMS` (in `pokemon-detail.ts`) lists species whose extra
  forms are cosmetic or in-game modes (Pikachu, Eevee, Koraidon, Miraidon): the
  card offers only the default form plus what is listed for them (Gigantamax).
  `FORM_LINKS` gives species with two base looks (Urshifu, Darmanitan, Toxtricity)
  their own list of links per selected form. Both tables use variety names, so they
  don't depend on the URL scheme.
- **Gender.** Species with separate gender varieties (Meowstic, Indeedee,
  Oinkologne, Basculegion) get a ♂/♀ switch under the artwork that links to the
  other gender's variety, so stats and abilities follow. It also shows on Megas,
  because a Mega's learnset comes from the base form's gender. Species where the
  female only looks different (`has_gender_differences`, e.g. Pikachu, Frillish)
  get a switch that only swaps the picture (`?gender=female`, default form only).
- **Images.** The big picture is the Pokémon HOME render, because the female
  pictures only exist there; the Forms card uses the official artwork. Some
  cosmetic forms have no HOME render, which is one more reason they aren't offered.
- **Learnsets (not built).** A Mega's learnset comes from the base form, so it
  depends on the gender being viewed.
- **Names.** English display names come from the species `names` and the form
  `names`. A form without an English name falls back to the species name.
- **Units.** The API gives height in decimetres and weight in hectograms. A
  weight of 0 is a placeholder in the data (Eternamax Eternatus).
- **Titles.** The root layout sets a title template (`%s | Pokédex`). The list
  page exports a static title, and the detail page a `generateMetadata` that
  uses the species' English name; unknown slugs keep the default title.
- **Loading states.** The detail page uses `[slug]/loading.tsx`. The list page
  doesn't: a `loading.tsx` doesn't show when only `?page=` changes, so the table
  sits in a `<Suspense>` keyed by page number, with `PokemonTableSkeleton` as the
  fallback.
- **Error handling.** `PokeApiError` carries the HTTP status, only a 404 from
  PokéAPI becomes a not-found page, and everything else goes to `error.tsx`.
- **Colors.** Tailwind grays in light/dark pairs: `50`/`950` for surfaces
  (cards, table rows, buttons), `100`/`900` for stripes and `200`/`800` for
  borders and hover. Everything button-shaped shares one style in
  `components/Button.tsx`.
- **Tailwind.** Class names must be complete literal strings. Values that are
  only known at runtime (bar widths) go through inline `style`.
- **Small screens.** Cards and page padding shrink below `md` (`p-4 md:p-8`,
  `px-4 md:px-8`), and the gender bar drops its fixed label widths there.
- **Tests.** The URL/variety logic is covered by Vitest (`npm test`). To check a
  species with unusual form names, add a `makeSpecies` line and put it in
  `speciesByName`; the round-trip test picks it up.

## To do

- Search on the list page (by name, driven by the URL like the pagination),
  then filters
- Learnsets
