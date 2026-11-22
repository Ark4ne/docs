/**
 * Checks that a library honours the documentation contract, without building the portal.
 *
 *   node scripts/check-contract.ts <library checkout> [slug]
 *
 * Errors fail the run; warnings are printed. Run by the `check-lib` reusable workflow in every library.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join, relative, resolve } from 'node:path'
import mermaid from 'mermaid'
import { parse } from 'yaml'
import { libMetaSchema, requiredPages } from '../shared/lib-meta.ts'

const root = resolve(process.argv[2] ?? '.')
const slug = process.argv[3] ?? basename(root)
const site = join(root, 'docs/site')

const errors: string[] = []
const warnings: string[] = []

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

/** The URL the portal gives a file: numeric prefixes dropped, `index` standing for its folder. */
function routeOf(file: string): string {
  const segments = relative(site, file).replace(/\.md$/, '').split('/').map(part => part.replace(/^\d+\./, ''))
  if (segments.at(-1) === 'index') segments.pop()
  return ['', slug, ...segments].join('/').toLowerCase()
}

const phpWidth = 80

/**
 * Line numbers of the PHP code lines wider than `phpWidth`. A fence may be indented (in a list item or a
 * component slot): its indentation is not part of the code, so it is not counted.
 */
function longPhpLines(source: string): number[] {
  const found: number[] = []
  let fence: { marker: string, indent: number, php: boolean } | undefined
  for (const [index, line] of source.split('\n').entries()) {
    const opening = /^(\s*)(`{3,}|~{3,})\s*([\w-]*)/.exec(line)
    if (!fence) {
      if (opening) fence = { marker: opening[2], indent: opening[1].length, php: opening[3] === 'php' }
    }
    else if (line.trim().startsWith(fence.marker) && line.trim().replace(/[`~]/g, '') === '') {
      fence = undefined
    }
    else if (fence.php && line.slice(Math.min(fence.indent, line.length - line.trimStart().length)).length > phpWidth) {
      found.push(index + 1)
    }
  }
  return found
}

function frontmatter(source: string): Record<string, unknown> | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)
  return match ? (parse(match[1]) ?? {}) : null
}

if (!existsSync(site)) {
  console.error(`✖ ${relative(process.cwd(), site) || site} does not exist.`)
  process.exit(1)
}

// lib.yml
const libFile = join(site, 'lib.yml')
if (!existsSync(libFile)) {
  errors.push('docs/site/lib.yml is missing.')
}
else {
  const result = libMetaSchema.safeParse(parse(readFileSync(libFile, 'utf8')))
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push(`lib.yml: ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    }
  }
}

// Pages
const files = walk(site)
const pages = files.filter(file => file.endsWith('.md'))
const routes = new Set([
  ...pages.map(routeOf),
  ...(existsSync(join(root, 'CHANGELOG.md')) ? [`/${slug}/changelog`] : []),
  ...(existsSync(join(root, 'UPGRADE.md')) ? [`/${slug}/upgrade`] : []),
])

for (const name of requiredPages) {
  if (![...routes].some(route => route.endsWith(`/${name}`))) {
    errors.push(`A page named "${name}" is required (e.g. docs/site/1.getting-started/1.${name}.md).`)
  }
}
if (!existsSync(join(root, 'CHANGELOG.md'))) {
  warnings.push('CHANGELOG.md is missing at the repository root: no /changelog page.')
}

for (const file of pages) {
  const name = relative(root, file)
  const source = readFileSync(file, 'utf8')
  const meta = frontmatter(source)

  if (!meta?.title) errors.push(`${name}: front matter "title" is required.`)
  if (!meta?.description) errors.push(`${name}: front matter "description" is required.`)
  if (/^# /m.test(source.replace(/```[\s\S]*?```/g, ''))) {
    warnings.push(`${name}: a "# " heading duplicates the page title; start at "## ".`)
  }

  // The portal renders these at build time; one that does not parse would show as an error box.
  for (const match of source.matchAll(/^```mermaid\b[^\n]*\n([\s\S]*?)^```/gm)) {
    try {
      await mermaid.parse(match[1])
    }
    catch (error) {
      const line = source.slice(0, match.index).split('\n').length
      errors.push(`${name}:${line}: invalid Mermaid diagram: ${error instanceof Error ? error.message : error}`)
    }
  }

  // PHP fits the content column (and the panels of ::example and ::http-call) without scrolling.
  for (const line of longPhpLines(source)) {
    errors.push(`${name}:${line}: PHP line longer than ${phpWidth} columns; wrap it (one argument per line, chains before ->).`)
  }

  for (const [, target] of source.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|mailto:|#)/.test(target)) continue
    if (target.endsWith('.md') || target.startsWith('.')) {
      errors.push(`${name}: link "${target}" must be an absolute portal path such as /${slug}/guides/…`)
      continue
    }
    const path = target.split('#')[0].replace(/\/$/, '')
    if (path.startsWith(`/${slug}/`) && !routes.has(path)) {
      errors.push(`${name}: link "${target}" points to no page.`)
    }
  }
}

// Folders become navigation groups.
for (const dir of new Set(pages.map(file => resolve(file, '..')))) {
  if (dir !== site && !existsSync(join(dir, '.navigation.yml'))) {
    warnings.push(`${relative(root, dir)}: add a .navigation.yml with a title and an icon.`)
  }
}

for (const warning of warnings) console.warn(`⚠ ${warning}`)
for (const error of errors) console.error(`✖ ${error}`)
console.log(`${errors.length ? '✖' : '✔'} ${slug}: ${pages.length} pages, ${errors.length} errors, ${warnings.length} warnings.`)
process.exit(errors.length ? 1 : 0)
