# Contract

What the portal relies on. `node scripts/check-contract.ts <library> [slug]` (or `pnpm check`) verifies it.

## Files

| Path (in the library) | Role |
|---|---|
| `docs/site/lib.yml` | Identity of the library. Without it the library is not shown. |
| `docs/site/index.md` | Optional home page, at `/<slug>` (see *Home page*). |
| `docs/site/**/*.md` | Pages. |
| `docs/site/**/.navigation.yml` | Title and icon of the folder's navigation group. |
| `CHANGELOG.md` | Rendered as `/<slug>/changelog`, in the *Releases* group, as a timeline: keep the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format, one `## [1.2.0] - 2026-11-18` per release (the date goes beside it, the newest is marked *Latest*) and `### Added`, `### Changed`… inside. `# Changelog` and its first paragraph become the page title and description; an empty `## [Unreleased]` is not shown. |
| `UPGRADE.md` | Rendered as `/<slug>/upgrade` (*Upgrade guide*), in the *Releases* group. |

The `slug` is the repository name (`laravel-openapi-generator`); it is set in the portal's `libs.config.ts`.

## lib.yml

```yaml
name: Laravel OpenAPI Generator            # display name
package: ark4ne/laravel-openapi-generator  # Composer name; the version badge is read from Packagist
tagline: Generates OpenAPI 3.0, 3.1 and 3.2 documents from a Laravel application.   # ≤ 160 chars
icon: i-lucide-file-json                   # any Iconify icon, i-<collection>-<name>
color: emerald                             # accent: red orange amber yellow lime green emerald teal cyan
                                           # sky blue indigo violet purple fuchsia pink rose
order: 30                                  # position on the landing page, ascending
compatibility:                             # rendered by ::compatibility, newest first
  - { version: '1.x', php: '^8.3', laravel: '^13.0', status: active }     # active | security | eol
  - { version: '0.6', php: '^8.1', laravel: '^10.0 || ^11.0', status: eol }
related: [openapi-writer, laravel-json-api]   # slugs; shown as "Works with" on every page
links:                                     # extra links in the page aside (optional)
  - { label: Discussions, to: 'https://github.com/Ark4ne/laravel-openapi-generator/discussions', icon: i-lucide-messages-square }
```

Pick a colour no other library uses. Keep `compatibility` in step with `composer.json`.

## Pages

- File names: `<order>.<name>.md`; the number orders the navigation and disappears from the URL
  (`2.guides/3.responses.md` → `/<slug>/guides/responses`). Folders follow the same rule.
- `index.md` in a folder is the folder's own page; `docs/site/index.md` is the home page (below).
- **Required**: a page named `introduction` and one named `installation`, in a first group titled
  *Getting started*. Without a home page, `/<slug>` opens the introduction.
- Front matter:

  ```yaml
  ---
  title: Responses                       # required; rendered as the page heading
  description: How responses are read from resources, return types and attributes.   # required
  since: '1.2'                           # optional: first version with this page's feature
  experimental: true                     # optional
  navigation:                            # optional: override the menu entry
    title: Responses
    icon: i-lucide-reply
  links:                                 # optional: buttons under the title
    - { label: Source, icon: i-simple-icons-github, to: 'https://github.com/…', target: _blank }
  ---
  ```

- Body headings start at `##`. `##` and `###` build the "On this page" outline and the search index.

## Home page

`docs/site/index.md` is optional. When it exists, `/<slug>` shows it instead of opening the introduction, and
the library cards and the library switcher of the portal lead to it; *Get started* and the docs' links lead
to the docs.

- The portal draws the hero from `lib.yml`: version (linked to the changelog), name, tagline, *Get started*
  (the introduction), GitHub and a copyable `composer require`. It ends the page with a call to action and
  the libraries of `related`. The page writes only the sections in between: do not repeat the name, the
  tagline, the install command or a "get started" section.
- Front matter: `title` and `description`, as every page (the description is the page's meta description).
- A demo (`::example`, `::http-call` or `::code-group`) written before the first `##` goes into the hero,
  beside the name: the one example that shows what the library does. Keep it short (about 20 lines in all).
- Each `##` starts a numbered section, laid out by what it holds; every other section sits on a tinted band,
  and the sections below the fold rise into view on scroll.
  - With a demo (`::example`, `::http-call`, `::code-group`): the heading, its paragraph and any `::tip` or
    `::note` on the left, the demo on the right. Keep that text short: two lines and a tip at most.
  - With `::card-group`: heading and subtitle centred, the cards on one row (two to four).
  - Otherwise (compatibility): centred.
- Components: `::card-group` / `::card`, `::example`, `::http-call`, `::code-group`, `::compatibility`,
  `::install`, `::lib-card`, `::note`, `::tip`. The check fails on any other.
- It is not in the sidebar nor in previous/next; the sidebar shows an *Overview* link back to it.
- The check also verifies the `to="…"` of cards, like any link.

## .navigation.yml

```yaml
title: Customisation
icon: i-lucide-puzzle
```

Every folder needs one; without it the group shows the folder name.

## Links

- Between pages: absolute portal paths, `/<slug>/<section>/<page>` (`#anchor` allowed). The check fails on a
  link to a page that does not exist in the library.
- To another library: `/<other-slug>/…`, or `:lib-card{slug="openapi-writer"}` for a card.
  Such a link is checked only in the full portal build: when your library is built alone (`DOCS_ONLY`, as in
  CI), or while the other library's documentation is not merged on its default branch yet, it leads to that
  library's placeholder page. Copy the URL from the live page, or the merged pages, of the other library.
- Never `./page.md` or a relative path: files are numbered, URLs are not.
- Images: put them under `public/` of the portal only if shared; otherwise prefer a code block or a Mermaid
  diagram (see `components.md`).

## Code

PHP code lines are at most 80 columns, not counting the indentation of the fence itself. The check fails
on a longer line, with its line number. How to wrap: `components.md`.

## Diagrams

A ` ```mermaid ` code block is rendered to SVG when the portal builds (Mermaid v13, no JavaScript in the
page). The check fails on a diagram that does not parse, with its line and column.
