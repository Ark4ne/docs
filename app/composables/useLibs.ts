import type { ContentNavigationItem, PageCollectionItemBase, PageCollections } from '@nuxt/content'
import type { LibMeta } from '#shared/lib-meta'
import type { LibSource } from '~~/libs.config'

/** A page of any library: every library collection shares the same schema (content.config.ts). */
export interface LibPage extends PageCollectionItemBase {
  since?: string
  experimental?: boolean
  links?: { label: string, icon?: string, to: string, target?: string }[]
}

export interface Lib extends LibMeta {
  slug: string
  repository: string
  branch: string
  path: string
  /** Name of the page collection, also used by llms.txt and search. */
  collection: keyof PageCollections
  /** Its introduction: where links to the library lead (a link the prerender crawler can follow). */
  entry: string
  /** Its home page (`docs/site/index.md`), when the library writes one: where the landing cards lead. */
  home: string | null
  /** Latest stable version on Packagist, resolved at build time; null when Packagist cannot tell. */
  version: string | null
}

/** One Packagist request per package and process: `generate` renders every page with the same versions. */
const versions = new Map<string, Promise<string | null>>()

function packageVersion(name: string) {
  if (!versions.has(name)) {
    versions.set(name, $fetch<{ packages: Record<string, { version: string }[]> }>(`https://repo.packagist.org/p2/${name}.json`)
      .then(data => data.packages[name]?.find(release => /^v?\d+\.\d+\.\d+$/.test(release.version))?.version ?? null)
      .catch(() => null))
  }
  return versions.get(name)!
}

/**
 * Every library of this build with its lib.yml and latest version, in `order`. A library without a valid
 * lib.yml is skipped. Awaited by app.vue, so every page's payload carries all of it and a client-side
 * navigation never has to resolve a library (or its version) again.
 */
export function useLibs() {
  const libs = useRuntimeConfig().public.libs as Omit<LibSource, 'local'>[]

  return useAsyncData('libs', async () => {
    const found = await Promise.all(libs.map(async (source) => {
      const collection = source.slug.replaceAll('-', '_')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const meta = await queryCollection(`${collection}_meta` as any).first() as LibMeta | null
      if (!meta) return null
      const entry = await queryCollection(collection as keyof PageCollections)
        .where('path', 'LIKE', '%/introduction').select('path').first()
      const home = await queryCollection(collection as keyof PageCollections).path(`/${source.slug}`).select('path').first()
      return {
        ...meta,
        ...source,
        collection: collection as keyof PageCollections,
        entry: entry?.path ?? `/${source.slug}`,
        home: home?.path ?? null,
        version: await packageVersion(meta.package),
      }
    }))
    return found.filter((lib): lib is Lib => lib !== null).sort((a, b) => a.order - b.order)
  }, { default: () => [] as Lib[] })
}

/** The library of the current route, if any. */
export function useCurrentLib() {
  const route = useRoute()
  const { data: libs } = useLibs()
  return computed(() => libs.value.find(lib => lib.slug === route.params.lib))
}

const releasePages = ['upgrade', 'changelog']

/**
 * The navigation of a library: its own tree from docs/site, then a "Releases" group holding the pages the
 * portal renders from UPGRADE.md and CHANGELOG.md, so they sit at the same place in every library.
 */
export function useLibNavigation(lib: Ref<Lib | undefined>) {
  return useAsyncData(() => `navigation-${lib.value?.slug}`, async () => {
    if (!lib.value) return [] as ContentNavigationItem[]
    const tree = await queryCollectionNavigation(lib.value.collection, ['since', 'experimental'])
    // The home page (index.md) is the library's root, not a page of its documentation.
    const root = (tree.find(item => item.path === `/${lib.value!.slug}`)?.children ?? tree)
      .filter(item => item.path !== `/${lib.value!.slug}`)
    const isRelease = (item: ContentNavigationItem) => releasePages.includes(item.path.split('/').pop() ?? '')
    const releases = root.filter(isRelease)
      .sort((a, b) => releasePages.indexOf(a.path.split('/').pop()!) - releasePages.indexOf(b.path.split('/').pop()!))
      .map(item => ({ ...item, title: item.path.endsWith('/upgrade') ? 'Upgrade guide' : 'Changelog' }))

    return [
      ...root.filter(item => !isRelease(item)),
      ...(releases.length ? [{ title: 'Releases', path: `/${lib.value.slug}/releases`, children: releases }] : []),
    ]
  }, { watch: [lib], default: () => [] as ContentNavigationItem[] })
}
