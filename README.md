# Recurly

A subscription tracker for iOS and Android — see what you're paying for, what renews next, and what it costs you each month.

Built with Expo Router and NativeWind. Repo: [`Ali747711/native-finance`](https://github.com/Ali747711/native-finance).

## Stack

| Layer | Choice |
| --- | --- |
| Runtime | Expo SDK 54, React Native 0.81, React 19 |
| Navigation | Expo Router 6 (file-based) |
| Styling | NativeWind 5 (preview) + Tailwind 4 |
| Fonts | Plus Jakarta Sans (6 weights, bundled) |
| Dates | Day.js |
| Language | TypeScript (strict) |

New Architecture, the React Compiler, and typed routes are all enabled in `app.json` — so `href` values are typechecked against the real route tree, and a typo in a link is a build error rather than an unmatched-route screen.

## Getting started

```bash
npm install
npx expo start
```

Then open in Expo Go, an iOS simulator, or an Android emulator. `npm run ios` / `npm run android` / `npm run web` jump straight to a target.

## Project structure

```
app/                    routes (file-based)
components/             shared UI
constants/              data, theme tokens, icon + image maps
lib/utils.ts            formatting helpers
assets/fonts/           Plus Jakarta Sans
global.css              Tailwind theme + semantic component classes
type.d.ts               ambient app types (global, no imports needed)
```

## Routes

Parenthesised folders are Expo Router [route groups](https://docs.expo.dev/router/basics/notation/) — they organise files without adding a URL segment, which is why `(tabs)/index.tsx` serves `/`.

| URL | File |
| --- | --- |
| `/` | `app/(tabs)/index.tsx` |
| `/subscription` | `app/(tabs)/subscription/index.tsx` |
| `/subscription/[id]` | `app/(tabs)/subscription/[id].tsx` |
| `/insights` | `app/(tabs)/insights.tsx` |
| `/settings` | `app/(tabs)/settings.tsx` |
| `/sign-in` | `app/(auth)/sign-in.tsx` |
| `/sign-up` | `app/(auth)/sign-up.tsx` |
| `/onboarding` | `app/onboarding.tsx` |

Three layouts drive the shell: the root `Stack` loads fonts and holds the splash screen until they resolve; `(tabs)/_layout.tsx` renders a floating pill tab bar built from the `tabs` array in `constants/data.ts`; `(tabs)/subscription/_layout.tsx` is a nested `Stack` so detail pages push *inside* the tab instead of registering as tabs of their own.

## Design system

Tokens live in **two places on purpose**, and they must be kept in sync:

- `global.css` `@theme` — drives NativeWind utility classes (`bg-background`, `text-accent`, `p-5`)
- `constants/theme.ts` — the same values as JS, for props that can't take a className (`tabBarStyle`, `Math.max` insets)

`global.css` also defines semantic component classes under `@layer components` — `home-*`, `sub-*`, `upcoming-*`, `auth-*`, `tabs-*`, `modal-*`, `category-chip-*`. Screens compose these rather than repeating long utility strings.

Fonts are loaded in the root layout and exposed as `font-sans`, `font-sans-light`, `font-sans-medium`, `font-sans-semibold`, `font-sans-bold`, `font-sans-extrabold`.

## Utilities

`lib/utils.ts`:

- `formatCurrency(value, currency = "USD")` — U.S.-style money, always two decimals. Wrapped in try-catch because Hermes ships a partial `Intl`; falls back to hand-rolled grouping so a price label can never crash a screen.
- `formatSubscriptionDateTime(value?)` — `MM/DD/YYYY`, or `"Not provided"` for missing/invalid input.
- `formatStatusLabel(value?)` — capitalises a status, or `"Unknown"`.

## Status

| Area | State |
| --- | --- |
| Home — balance, upcoming carousel, expandable subscription list | Built |
| Tab bar, fonts, theme tokens, routing shell | Built |
| Subscriptions, Insights, Settings | Placeholder screens |
| Onboarding, Sign in, Sign up | Placeholder screens |
| Data | Static fixtures in `constants/data.ts` — no backend yet |
| Tests | None configured |

## Scripts

| Command | Does |
| --- | --- |
| `npm start` | Start the dev server |
| `npm run ios` / `android` / `web` | Start on a specific target |
| `npm run lint` | ESLint via `expo lint` |
| `npx tsc --noEmit` | Typecheck |
