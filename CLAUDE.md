# CLAUDE.md

The ark4ne documentation portal: one Nuxt site (Nuxt 4, Nuxt Content 3, Nuxt UI 4) rendering the documentation
that each ark4ne library keeps in its own repository (`docs/site/`). Read `README.md` first.

## Rules

- **Library content never lives here.** Pages, `lib.yml`, changelog and upgrade guide belong to the library.
  This repository holds the theme (`app/`), shared components (`app/components/content/`), the library list
  (`libs.config.ts`), the contract (`shared/lib-meta.ts`, `scripts/check-contract.ts`) and the starter
  (`template/`).
- A library's identity (name, colour, compatibility…) comes from its `lib.yml`; never hard-code it in `app/`.
- The design system is shared: a library only chooses its accent colour. Layout, typography and components
  are the same for all.
- Every change to the contract, a component or the template is reflected in the `ark4ne-docs` skill
  (`skills/ark4ne-docs/`), which is what library maintainers and their agents follow.
- Everything is in English.

## Commands

```bash
pnpm dev:example     # the starter only: work on the theme
pnpm dev:local       # sibling checkouts of the libraries
pnpm check <path>    # contract of one library
pnpm typecheck
pnpm generate        # static site; fails on any page that does not prerender
```
