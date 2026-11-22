/**
 * The libraries this portal documents.
 *
 * This is the only place to edit when a library joins the portal. Everything else (pages, navigation,
 * landing card, compatibility, accent colour) comes from the library's own repository:
 *
 *   docs/site/lib.yml      identity of the library (see the `ark4ne-docs` skill)
 *   docs/site/**\/*.md     its pages and navigation
 *   CHANGELOG.md           rendered as /<slug>/changelog
 *   UPGRADE.md             rendered as /<slug>/upgrade
 */
export interface LibSource {
  /** URL segment, also the collection name once dashes become underscores. */
  slug: string
  /** GitHub `owner/name`. */
  repository: string
  branch: string
  /** Folder holding the pages, relative to the repository root. */
  path: string
  /** Sibling checkout used when `DOCS_SOURCE=local`, relative to `DOCS_LOCAL_ROOT` (default `..`). */
  local: string
}

export const libs: LibSource[] = [
  { slug: 'laravel-json-api', repository: 'Ark4ne/laravel-json-api', branch: 'master', path: 'docs/site', local: 'laravel-json-api' },
  { slug: 'openapi-writer', repository: 'Ark4ne/openapi-writer', branch: 'main', path: 'docs/site', local: 'openapi-writer' },
  { slug: 'laravel-openapi-generator', repository: 'Ark4ne/laravel-openapi-generator', branch: 'master', path: 'docs/site', local: 'laravel-openapi-generator' },
  { slug: 'laravel-api-revisions', repository: 'Ark4ne/laravel-api-revisions', branch: 'main', path: 'docs/site', local: '../api/api-revisions' },
]

/** The starter a library copies; rendered as `/example` when `DOCS_EXAMPLE=1`, to work on the theme. */
export const example: LibSource = {
  slug: 'example',
  repository: 'Ark4ne/docs',
  branch: 'main',
  path: 'docs/site',
  /** Relative to this repository. */
  local: 'template',
}

export function collectionName(slug: string): string {
  return slug.replaceAll('-', '_')
}

/** Libraries built into this run: all of them, or `DOCS_ONLY=a,b`, plus the starter with `DOCS_EXAMPLE=1`. */
export function enabledLibs(env: Record<string, string | undefined> = process.env): LibSource[] {
  const only = env.DOCS_ONLY?.split(',').filter(Boolean)
  return [
    ...libs.filter(lib => !only || only.includes(lib.slug)),
    ...(env.DOCS_EXAMPLE === '1' ? [example] : []),
  ]
}
