<script setup lang="ts">
/**
 * A library's root. With a home page (`docs/site/index.md`) it shows it: a hero built from lib.yml, the page's
 * own sections, then the libraries it works with. Without one it opens the introduction. A registered library
 * whose documentation is not in this build (not published yet, or left out by DOCS_ONLY) gets a page pointing
 * to its repository instead of a 404.
 */
const route = useRoute()
const lib = useCurrentLib()
const registry = useRuntimeConfig().public.registry as { slug: string, repository: string }[]
const pending = registry.find(item => item.slug === route.params.lib)

const { data: home } = await useAsyncData(`home-${route.params.lib}`, async () =>
  lib.value?.home ? await queryCollection(lib.value.collection).path(lib.value.home).first() as LibPage | null : null,
)

if (lib.value && !home.value) {
  await navigateTo(lib.value.entry, { redirectCode: 302, replace: true })
}
else if (!lib.value && !pending) {
  throw createError({ statusCode: 404, statusMessage: 'Library not found', fatal: true })
}

if (lib.value && home.value) {
  useSeoMeta({
    title: lib.value.name,
    description: home.value.description || lib.value.tagline,
    ogTitle: lib.value.name,
    ogDescription: home.value.description || lib.value.tagline,
  })
}

const { data: libs } = useLibs()
const related = computed(() => libs.value.filter(item => lib.value?.related.includes(item.slug)))

const heroLinks = computed(() => lib.value && [
  { label: 'Get started', to: lib.value.entry, trailingIcon: 'i-lucide-arrow-right', size: 'xl' as const },
  { label: 'GitHub', to: `https://github.com/${lib.value.repository}`, target: '_blank', icon: 'i-simple-icons-github', color: 'neutral' as const, variant: 'subtle' as const, size: 'xl' as const },
])
</script>

<template>
  <div v-if="lib && home">
    <!-- Built from lib.yml: every library's home opens the same way, only the accent changes. -->
    <UPageHero
      :title="lib.name"
      :description="lib.tagline"
      :links="heroLinks"
      :ui="{ container: 'pt-20 pb-8 sm:pt-28 sm:pb-10 lg:pt-32 lg:pb-12' }"
    >
      <template #headline>
        <span class="inline-flex items-center gap-2 text-primary">
          <UIcon :name="lib.icon" class="size-5" />
          <UBadge v-if="lib.version" :label="lib.version" variant="subtle" />
        </span>
      </template>
      <div class="mx-auto w-full max-w-xl">
        <Install />
      </div>
    </UPageHero>

    <UContainer class="home pb-16">
      <ContentRenderer :value="home" class="home-content" />
    </UContainer>

    <UPageSection v-if="related.length" title="Works with" :ui="{ container: 'pt-0 sm:pt-0 lg:pt-0' }">
      <UPageGrid>
        <LibCard v-for="item in related" :key="item.slug" :slug="item.slug" />
      </UPageGrid>
    </UPageSection>
  </div>

  <LibPending v-else-if="pending && !lib" :slug="pending.slug" :repository="pending.repository" />
</template>

<style scoped>
/*
 * The home page uses the whole container, unlike a documentation page: the feature cards sit on one row
 * (up to four), while text and code keep a readable measure, centred.
 */
.home-content > :deep(*) {
  max-width: 64rem;
  margin-inline: auto;
}
.home-content > :deep(h2 + p) {
  max-width: 48rem;
}
.home-content > :deep(.grid:not(.example)) {
  max-width: none;
}
@media (min-width: 64rem) {
  .home-content > :deep(.grid:not(.example)) {
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  }
}

/* Sections of the home page breathe more than those of a documentation page. */
.home :deep(h2) {
  margin-top: 4rem;
  text-align: center;
}
.home :deep(h2:first-child) {
  margin-top: 0;
}
.home :deep(h2 + p) {
  text-align: center;
  color: var(--ui-text-muted);
}
</style>
