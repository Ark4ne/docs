# ark4ne documentation portal

One site for every ark4ne library. Each library keeps its pages in its own repository (`docs/site/`), next to
its code; this repository holds the theme, the shared components and the list of libraries, and builds them
into a single static site.

## How it works

- `libs.config.ts` lists the libraries: repository, branch, folder.
- `content.config.ts` creates two Nuxt Content collections per library, read from GitHub (or from a sibling
  checkout with `DOCS_SOURCE=local`): its pages (`docs/site/**`, plus `CHANGELOG.md` and `UPGRADE.md` from the
  repository root) and its identity (`docs/site/lib.yml`).
- The landing page, the library switcher, the accent colour, the compatibility table and the Packagist
  version all come from `lib.yml`: a release never requires a change here.
- A library without a `lib.yml` is not shown.
- `/llms.txt`, `/llms-full.txt` and `/raw/<page>.md` serve the documentation to agents.

## Commands

```bash
pnpm install
pnpm dev:example      # the starter in template/, to work on the theme
pnpm dev:local        # every library from its sibling checkout (../laravel-json-api, …)
pnpm dev              # every library from GitHub
pnpm check ../laravel-openapi-generator   # contract of one library
pnpm generate         # static site in .output/public
```

`DOCS_ONLY=slug-a,slug-b` restricts a run to some libraries.

## Adding a library

1. Copy `template/docs/site` into the library and fill it (the `ark4ne-docs` skill guides an agent through it).
2. Add the library to `libs.config.ts`.
3. In the library, call the `check-lib` workflow on pull requests and dispatch `lib-docs-updated` on its
   default branch (see `skills/ark4ne-docs/references/ci.md`).

## Deployment

GitHub Pages, by `.github/workflows/deploy.yml`, on a push here, on a `lib-docs-updated` dispatch from a
library, or by hand. The public URL is the `DOCS_URL` repository variable.
