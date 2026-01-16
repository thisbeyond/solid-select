# Contributing to Solid Select

## Project Structure

This repository is set up as a **pnpm workspace**.

- **Root**: Contains the main library source code (`src`) and configuration.
- **`site`**: A separate workspace package for the documentation website and
  playground.

## Workspaces

We use pnpm workspaces to manage dependencies between the library and the
documentation site.

- The `site` package depends on the local version of the library using
  `workspace:*`.
- Dependencies are installed at the root `node_modules` where possible
  (hoisted), reducing disk space and installation time.

## Development

We use `mise` to manage tasks.

- **`mise run dev`**: Starts the library in watch mode.
- **`mise run dev:site`**: Starts the site in development mode (port 3000),
  utilizing the local library source.
- **`mise run build`**: Builds the library.
- **`mise run build:site`**: Builds the site.
- **`mise run test:e2e`**: Runs Playwright end-to-end tests against the site.
