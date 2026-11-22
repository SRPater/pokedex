# Pokédex

A Pokédex web app built with Next.js (App Router) and [PokéAPI](https://pokeapi.co).
Browse, search and sort every species, then open a detail page with stats, type
matchups, alternate forms, shiny pictures and cries.

**Live demo:** https://pokedex.srpater.nl

## Features

- Paged species list with search and sorting by number or name
- Detail page per species with overview, base stats and type matchups
- Alternate forms (Mega, Gigantamax, regional, gender) selectable through the URL
- Evolution lines, with how each evolution happens (level, item, trade, ...), including branching chains and regional forms
- Shiny and female pictures, and the cry of each form
- Previous and next navigation in Pokédex order, and a "Random Pokémon" button
- Responsive layout with light and dark mode support

## Tech stack

- [Next.js](https://nextjs.org) (App Router) with React and TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- [Vitest](https://vitest.dev) for unit tests
- Data from PokéAPI, images from the PokeAPI/sprites repository on GitHub
- Deployed on [Vercel](https://vercel.com)

There is no database: all data comes from the API and is cached by Next.js for
24 hours.

## Getting Started

### Prerequisites

- Node.js 20.0 or newer
- npm

### Installation

```bash
git clone https://github.com/SRPater/pokedex.git
cd pokedex
npm install
```

### Running

```bash
npm run dev     # development server, then open http://localhost:3000/
npm run build   # production build; also type-checks every file
npm start       # serve the production build
npm run lint    # ESLint
npm test        # unit tests (Vitest)
```

No environment variables are needed, because PokéAPI requires no key.

## Routes

| Route             | Description                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `/`               | Landing page with a link to the list and a "Random Pokémon" button                        |
| `/pokemon`        | Species list, 20 per page                                                                 |
| `/pokemon/[slug]` | Detail page; the slug is the species name (`/pokemon/25` redirects to `/pokemon/pikachu`) |
| `/pokemon/random` | Redirects to a random species                                                             |

### List parameters (`/pokemon`)

| Parameter | Values                                       | Default  |
| --------- | -------------------------------------------- | -------- |
| `q`       | Search text (matches species name)           | none     |
| `sort`    | `number`, `number-desc`, `name`, `name-desc` | `number` |
| `page`    | Page number                                  | `1`      |

### Detail parameters (`/pokemon/[slug]`)

| Parameter | Values                              | Effect                                |
| --------- | ----------------------------------- | ------------------------------------- |
| `form`    | `mega`, `mega-x`, `gmax, `zen`, ... | Selects an alternate form             |
| `region`  | `alola`, `galar`, `hisui`, `paldea` | Selects a regional variant            |
| `gender`  | `female`                            | Selects the female variety or picture |
| `shiny`   | `true`                              | Shows the shiny picture               |

A parameter that is left out means "same as the default", and a combination that
doesn't exist redirects to the plain page.

## Project structure

```
src/
  app/
    page.tsx                  Landing page
    layout.tsx                Root layout, header, title template
    pokemon/page.tsx          List page
    pokemon/[slug]/page.tsx   Detail page
    pokemon/random/route.ts   Random redirect
  components/                 UI components (cards, buttons, switches, ...)
  lib/
    pokeapi.ts                API types, fetch helper, fetchers, name helpers
    pokemon-detail.ts         Everything the detail page needs beyond the species
    evolution.ts              Evolution chain to the paths shown in the Evolution card
    conditions.ts             The short lines that say how an evolution happens
    variety.ts                Variety names <-> URL parameters
    search.ts, sort.ts        Search and sorting for the list
    list-url.ts               The only place that builds list URLs
    type-matchups.ts          Combines type damage relations
    sprites.ts, display.ts    Image URLs, formatting and labels
```

## Design decisions

The main choices are summarized here. The reasoning behind them is in
[docs/DECISIONS.md](docs/DECISIONS.md).

- **Species, not Pokémon:** the list is built from `/pokemon-species`, which has one entry per species with the real Pokédex numbers.
- **Cached API responses:** every request is cached for 24 hours, since the data rarely changes.
- **Search and sort in our own code:** PokéAPI has no search or sort endpoint, so the list fetches all names once and filters, sorts and pages them itself.
- **State in the URL:** form, region, gender and shiny are query parameters, so every view is linkable and works without client state.
- **Unoptimized images:** images load straight from GitHub to stay within Vercel's free image transformation limit.
- **Errors:** only a 404 from PokéAPI becomes a not-found page; anything else goes to the error page.
- **Evolution paths, not a tree:** the chain is split into one row per path, and the page only shows the paths through the species and form on screen (Jolteon shows Eevee -> Jolteon, Alolan Raichu only the Alolan path).
- **Only current rules:** a stage shows the evolution entry marked as current, and only conditions that a current entry really uses are shown.

## Testing

```bash
npm test
```

The unit tests cover the URL and variety logic, search, sorting, list URLs, type
matchups, sprite URLs, evolution paths and evolution conditions.

## Deployment

The app is deployed on Vercel from this repository. Pushing to `main` deploys
automatically. No environment variables are required.

## Roadmap

- [x] Evolution lines on the detail page
- [ ] Filters on the list page (by type, by generation)
- [ ] Favorites, stored in the browser, with a favorites page
- [ ] Learnsets on the detail page

## Data and credits

- Pokémon data from [PokéAPI](https://pokeapi.co)
- Images and cries from the [PokéAPI/sprites](https://github.com/PokeAPI/sprites) repository

Pokémon and all related names and images are trademarks of Nintendo, Game Freak
and The Pokémon Company. This is an unofficial fan project made for learning
and is not affiliated with them.

## License

Released under the [MIT License](LICENSE).
