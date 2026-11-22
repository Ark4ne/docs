<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageBreadcrumb } from '@nuxt/content/utils'

definePageMeta({
  layout: 'docs',
  // A page of a registered library left out of this build (DOCS_ONLY, or not published yet) leads to its
  // placeholder at /<slug>: a deep link from another library is not a dead link, and a library's CI, which
  // builds that library alone, does not fail on it. Real dead links are caught by `pnpm check`.
  middleware: (to) => {
    const { libs, registry } = useRuntimeConfig().public as unknown as { libs: { slug: string }[], registry: { slug: string }[] }
    const slug = String(to.params.lib)
    if (!libs.some(lib => lib.slug === slug) && registry.some(lib => lib.slug === slug)) {
      return navigateTo(`/${slug}`, { redirectCode: 302 })
    }
  },
})

const route = useRoute()
const lib = useCurrentLib()
const { data: navigation } = useLibNavigation(lib)

const { data: page } = await useAsyncData(route.path, async () =>
  lib.value ? await queryCollection(lib.value.collection).path(route.path).first() as LibPage | null : null,
)
// Same for a library in this build that has not published yet (no lib.yml on its default branch): a deep link
// from a library merged first leads to the placeholder, until the other one is merged too.
const { registry } = useRuntimeConfig().public as unknown as { registry: { slug: string }[] }
if (!lib.value && registry.some(item => item.slug === route.params.lib)) {
  await navigateTo(`/${String(route.params.lib)}`, { redirectCode: 302 })
}
else if (!lib.value || !page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: surround } = await useAsyncData(`${route.path}-surround`, () =>
  // The home page is the library's root, not the page before its introduction.
  queryCollectionItemSurroundings(lib.value!.collection, route.path, { fields: ['description'] })
    .where('path', '<>', `/${lib.value!.slug}`),
)

const section = computed(() => {
  const crumbs = findPageBreadcrumb(navigation.value as ContentNavigationItem[], route.path, { indexAsChild: true })
  return crumbs.at(-1)?.title
})

if (page.value && lib.value) {
  useSeoMeta({
    title: `${page.value.title} — ${lib.value.name}`,
    description: page.value.description || lib.value.tagline,
    ogTitle: `${page.value.title} — ${lib.value.name}`,
    ogDescription: page.value.description || lib.value.tagline,
  })
}

/** The file behind the page in the library's repository, so a fix is one click away. */
const editUrl = computed(() => {
  const file = page.value?.id.split('/').slice(1).join('/')
  return file ? `https://github.com/${lib.value!.repository}/edit/${lib.value!.branch}/${file}` : undefined
})

const toast = useToast()
async function copyMarkdown() {
  await navigator.clipboard.writeText(await $fetch<string>(`/raw${route.path}.md`, { responseType: 'text' }))
  toast.add({ title: 'Markdown copied', icon: 'i-lucide-check', color: 'success' })
}

const pageLinks = computed(() => [
  ...(page.value?.links ?? []),
  { label: 'Copy as Markdown', icon: 'i-lucide-copy', onClick: copyMarkdown },
  { label: 'View as Markdown', icon: 'i-lucide-file-text', to: `/raw${route.path}.md`, target: '_blank' },
])

const { data: libs } = useLibs()
const related = computed(() => libs.value.filter(item => lib.value?.related.includes(item.slug)))
</script>

<template>
  <UPage v-if="page && lib">
    <UPageHeader :title="page.title" :description="page.description" :headline="section">
      <template #links>
        <UBadge v-if="page.since" :label="`Since ${page.since}`" variant="subtle" icon="i-lucide-tag" />
        <UBadge v-if="page.experimental" label="Experimental" color="warning" variant="subtle" icon="i-lucide-flask-conical" />
        <UDropdownMenu :items="pageLinks" :content="{ align: 'end' }">
          <UButton label="Page" icon="i-lucide-ellipsis" color="neutral" variant="outline" size="sm" />
        </UDropdownMenu>
      </template>
    </UPageHeader>

    <UPageBody>
      <!-- CHANGELOG.md, rendered at /<slug>/changelog, reads as a timeline of releases. -->
      <LibChangelog v-if="page.path === `/${lib.slug}/changelog`" :page="page" />
      <ContentRenderer v-else :value="page" />
      <USeparator v-if="surround?.length" />
      <UContentSurround :surround="surround" />
    </UPageBody>

    <template v-if="page.body?.toc?.links?.length" #right>
      <UContentToc :links="page.body.toc.links" title="On this page" highlight highlight-variant="circuit">
        <template #bottom>
          <USeparator type="dashed" class="my-4" />
          <UPageLinks
            title="Library"
            :links="[
              { label: 'Edit this page', icon: 'i-lucide-pencil', to: editUrl, target: '_blank' },
              { label: 'Packagist', icon: 'i-lucide-package', to: `https://packagist.org/packages/${lib.package}`, target: '_blank' },
              ...lib.links.map(link => ({ ...link, target: '_blank' })),
            ]"
          />
          <template v-if="related.length">
            <USeparator type="dashed" class="my-4" />
            <UPageLinks
              title="Works with"
              :links="related.map(item => ({ label: item.name, icon: item.icon, to: item.home ?? item.entry }))"
            />
          </template>
        </template>
      </UContentToc>
    </template>
  </UPage>
</template>
