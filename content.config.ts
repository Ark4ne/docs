import { existsSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import type { CollectionSource } from '@nuxt/content'
import { collectionName, enabledLibs, example, type LibSource } from './libs.config'
import { libMetaSchema } from './shared/lib-meta'

const localRoot = resolve(process.env.DOCS_LOCAL_ROOT ?? '..')
const preferLocal = process.env.DOCS_SOURCE === 'local'

/** Where a library's files are read from: its sibling checkout in local mode, GitHub otherwise. */
function origin(lib: LibSource): Pick<CollectionSource, 'cwd' | 'repository'> {
  if (lib === example) {
    return { cwd: resolve(lib.local) }
  }
  const local = resolve(localRoot, lib.local)
  console.log(`docs: ${lib.slug} source: ${preferLocal ? 'local' : 'github'}${preferLocal && existsSync(local) ? ` (${local})` : ''}`)
  if (preferLocal && existsSync(local)) {
    return { cwd: local }
  }
  return { repository: { url: `https://github.com/${lib.repository}`, branch: lib.branch } }
}

const pageSchema = z.object({
  /** Raw Markdown, served at /raw/<path>.md and in llms-full.txt. */
  rawbody: z.string(),
  /** First version the page applies to, shown as a badge next to the title. */
  since: z.string().optional(),
  /** Marks a page whose feature is experimental. */
  experimental: z.boolean().optional(),
  links: z.array(z.object({
    label: z.string(),
    icon: z.string().optional(),
    to: z.string(),
    target: z.string().optional(),
  })).optional(),
})

/**
 * One file of the library, `file` relative to its repository root.
 *
 * In dev, Nuxt Content watches a local source from the part of `include` before the first `*`, recursively.
 * Without a glob that is the root of the checkout, `vendor/` and `.git/` included: tens of thousands of
 * watchers, EMFILE, and a `dev:local` that hangs. So a local file is read from its own folder, and every
 * other entry of that folder is excluded, which keeps the watcher on this one file.
 */
function singleFile(from: ReturnType<typeof origin>, file: string, prefix?: string): CollectionSource {
  if (!from.cwd) {
    return { ...from, include: file, prefix }
  }
  const name = basename(file)
  return { cwd: resolve(from.cwd, dirname(file)), include: name, exclude: [`!(${name})`, '*/**'], prefix }
}

function collectionsFor(lib: LibSource) {
  const from = origin(lib)
  const name = collectionName(lib.slug)

  return {
    [name]: defineCollection({
      type: 'page',
      source: [
        { ...from, include: `${lib.path}/**/*.{md,yml}`, exclude: [`${lib.path}/lib.yml`], prefix: `/${lib.slug}` },
        // Single sources of truth kept at the repository root.
        singleFile(from, 'CHANGELOG.md', `/${lib.slug}`),
        singleFile(from, 'UPGRADE.md', `/${lib.slug}`),
      ],
      schema: pageSchema,
    }),
    [`${name}_meta`]: defineCollection({
      type: 'data',
      source: singleFile(from, `${lib.path}/lib.yml`),
      schema: libMetaSchema,
    }),
  }
}

export default defineContentConfig({
  collections: Object.assign({}, ...enabledLibs().map(collectionsFor)),
})
