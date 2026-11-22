<script setup lang="ts">
/**
 * A library's root: its home page when it writes one (`docs/site/index.md`), its introduction otherwise. A
 * registered library whose documentation is not in this build (not published yet, or left out by DOCS_ONLY)
 * gets a page pointing to its repository instead of a 404.
 */
const route = useRoute()
const lib = useCurrentLib()
const registry = useRuntimeConfig().public.registry as { slug: string, repository: string }[]
const pending = registry.find(item => item.slug === route.params.lib)

const { data: home } = await useAsyncData(`home-${route.params.lib}`, async () => {
  if (!lib.value?.home) return null
  const [page, changelog] = await Promise.all([
    queryCollection(lib.value.collection).path(lib.value.home).first() as Promise<LibPage | null>,
    queryCollection(lib.value.collection).path(`/${lib.value.slug}/changelog`).select('path').first(),
  ])
  return page && { page, changelog: changelog?.path ?? null }
})

if (lib.value && !home.value) {
  await navigateTo(lib.value.entry, { redirectCode: 302, replace: true })
}
else if (!lib.value && !pending) {
  throw createError({ statusCode: 404, statusMessage: 'Library not found', fatal: true })
}

if (lib.value && home.value) {
  useSeoMeta({
    title: lib.value.name,
    description: home.value.page.description || lib.value.tagline,
    ogTitle: lib.value.name,
    ogDescription: home.value.page.description || lib.value.tagline,
  })
}
</script>

<template>
  <LibHome v-if="lib && home" :lib="lib" :page="home.page" :changelog="home.changelog" />
  <LibPending v-else-if="pending && !lib" :slug="pending.slug" :repository="pending.repository" />
</template>
