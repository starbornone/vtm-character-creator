# Getting started

## Prerequisites

Use Node.js 24 or later with npm and a modern browser. Run commands from the repository root, which contains `package.json` and `package-lock.json`.

## Install and run

```sh
npm ci
npm run dev
```

Open the **Local** URL printed by Vite. The dev server defaults to port `5173` and can use a different port if it is busy. The page should show the **Vampire: The Masquerade Character Creator** heading and a Fifth Edition development notice. Stop the server with Ctrl+C.

If npm reports a missing `package.json`, return to the repository root. For a registry or network error during `npm ci`, check access to the npm registry and retry. If your browser cannot connect, check that Vite is running and use its printed URL.

## Verify the production build

```sh
npm run build
npm run preview
```

The build runs TypeScript and writes the static site to `dist/`. Open the preview’s printed **Local** URL to check the same starter screen. Rebuild after editing source files. Use `npm run typecheck` when you only need the TypeScript check.

See the [overview](overview.md) for first-release scope and [Development](development.md) for contributor checks.
