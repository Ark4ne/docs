<script setup lang="ts">
// A library's root opens its introduction. A registered library whose documentation is not in this build (not
// published yet, or left out by DOCS_ONLY) gets a page pointing to its repository instead of a 404.
const route = useRoute()
const lib = useCurrentLib()
const registry = useRuntimeConfig().public.registry as { slug: string, repository: string }[]
const pending = registry.find(item => item.slug === route.params.lib)

if (lib.value) {
  await navigateTo(lib.value.entry, { redirectCode: 302, replace: true })
}
else if (!pending) {
  throw createError({ statusCode: 404, statusMessage: 'Library not found', fatal: true })
}

useSeoMeta({ title: pending?.slug, robots: 'noindex' })

const links = pending && [
  { label: 'Read it on GitHub', to: `https://github.com/${pending.repository}#readme`, target: '_blank', icon: 'i-simple-icons-github', size: 'xl' as const },
  { label: 'All libraries', to: '/', color: 'neutral' as const, variant: 'subtle' as const, size: 'xl' as const },
]
</script>

<template>
  <UContainer v-if="pending">
    <UPageHero
      :title="pending.slug"
      description="The documentation of this library is on its way. Its README covers it in the meantime."
      :links="links"
    />
  </UContainer>
</template>
