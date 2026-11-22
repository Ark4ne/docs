---
name: ark4ne-docs
description: Write, restructure or update the user documentation of an ark4ne library (laravel-json-api, openapi-writer, laravel-openapi-generator, laravel-api-revisions…) for the ark4ne documentation portal. Use when creating a library's docs/site/ folder, documenting a new or changed public feature, editing lib.yml, designing a library's navigation, migrating old documentation, or wiring the docs checks into a library's CI. Not for docs/architecture.md (internals) nor the agent skills shipped in skills/.
---

# ark4ne documentation

Every ark4ne library documents itself in **its own repository**, in `docs/site/`. The portal
(`github.com/Ark4ne/docs`) only owns the theme, the shared components and the list of libraries; it pulls each
library's pages at build time and renders them with one design system.

```
<library>/
├── docs/site/
│   ├── lib.yml                     identity: name, package, tagline, icon, colour, compatibility
│   ├── 1.getting-started/
│   │   ├── .navigation.yml         group title and icon
│   │   ├── 1.introduction.md       required
│   │   └── 2.installation.md       required
│   └── <your sections>/…           free: designed for this library
├── CHANGELOG.md                    rendered as /<slug>/changelog — never copy it into docs/site
└── UPGRADE.md                      rendered as /<slug>/upgrade — never copy it into docs/site
```

## The contract, in short

Read `references/contract.md` before writing; `pnpm check` in the portal enforces it.

- **Shared**: the layout, the components, `lib.yml`, the *Getting started* group with `introduction` and
  `installation`, and the *Releases* group the portal builds from `UPGRADE.md` and `CHANGELOG.md`.
- **Free**: every other section, its title, order and depth. Two libraries are used differently, so their
  menus differ: design the navigation from what *this* library's users do, not from another library.
- Every page has a `title` and a `description` in front matter, and no `# ` heading (the title is rendered).
- Links between pages are absolute portal paths: `/laravel-openapi-generator/guides/responses`. A link to
  another library is just as plain: `/openapi-writer/schemas`.
- Everything is in English.

## Workflow

### Creating a library's documentation

1. **Read the library** before writing a line: `README.md`, `composer.json`, `CHANGELOG.md`, `UPGRADE.md`,
   `config/`, the consumer agent skill in `skills/<library>/` (the most complete map of the public API),
   `docs/architecture.md` (for extension points only) and the feature tests and their fixtures (the best
   examples you will find).
2. **Design the navigation** (see `references/writing.md`): list what a user comes to do, group it into
   sections, order them from first use to advanced. Show the proposed tree to the user and wait for their
   agreement before writing pages.
3. **Start from the template**: copy `template/docs/site` from the portal, then delete what does not apply.
   Fill `lib.yml` (`references/contract.md`).
4. **Write the pages**, getting started first. Use the components of `references/components.md`; take code
   from the tests and fixtures, never invent an API — check every class, method and option name in `src/`.
5. **Check and preview** (below) until the check passes and every page renders.
6. **Wire the CI** (`references/ci.md`) and register the library in the portal's `libs.config.ts` if it is not
   already there.
7. **Add the rule to the library's CLAUDE.md**: every public change updates `docs/site/` in the same change.

### Documenting a change

A feature, an option or a behaviour change updates `docs/site/` **in the same pull request** as the code:

- find the page(s) that describe the area; update them rather than adding a page per feature;
- a new public capability gets a `:since{v="x.y"}` badge (or `since:` in front matter for a whole page);
- the change still goes in `CHANGELOG.md`, and in `UPGRADE.md` when it breaks something: the portal renders
  both, so never duplicate them in a page;
- the portal itself almost never changes: only for a new library or a change of theme.

## Check and preview

From a checkout of the portal next to the library (`../docs` beside `../<library>`):

```bash
pnpm install
pnpm check ../<library>                                # contract: lib.yml, pages, front matter, links, diagrams, PHP width
DOCS_SOURCE=local DOCS_ONLY=<slug> pnpm dev            # live preview with the real theme
DOCS_SOURCE=local DOCS_ONLY=<slug> pnpm generate       # what CI runs: every page must prerender
```

Look at the pages in a browser (light and dark) before calling the work done.

## References

- `references/contract.md` — files, `lib.yml`, front matter, navigation, links.
- `references/components.md` — the components available in Markdown and when to use them.
- `references/writing.md` — page types, designing a navigation, style rules.
- `references/ci.md` — the workflows to add to a library.
