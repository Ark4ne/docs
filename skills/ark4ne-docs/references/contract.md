# Contract

What the portal relies on. `node scripts/check-contract.ts <library> [slug]` (or `pnpm check`) verifies it.

## Files

| Path (in the library) | Role |
|---|---|
| `docs/site/lib.yml` | Identity of the library. Without it the library is not shown. |
| `docs/site/**/*.md` | Pages. |
| `docs/site/**/.navigation.yml` | Title and icon of the folder's navigation group. |
| `CHANGELOG.md` | Rendered as `/<slug>/changelog`, in the *Releases* group. |
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
- `index.md` in a folder is the folder's own page.
- **Required**: a page named `introduction` and one named `installation`, in a first group titled
  *Getting started*. `/<slug>` opens the introduction.
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
- Never `./page.md` or a relative path: files are numbered, URLs are not.
- Images: put them under `public/` of the portal only if shared; otherwise prefer a code block or a Mermaid
  diagram (see `components.md`).

## Code

PHP code lines are at most 80 columns, not counting the indentation of the fence itself. The check fails
on a longer line, with its line number. How to wrap: `components.md`.

## Diagrams

A ` ```mermaid ` code block is rendered to SVG when the portal builds (Mermaid v13, no JavaScript in the
page). The check fails on a diagram that does not parse, with its line and column.
