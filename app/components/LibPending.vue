<script setup lang="ts">
/**
 * A registered library whose documentation is not in this build (not published yet, or left out by
 * DOCS_ONLY): a page pointing to its repository, so a link to it from another library is never a dead link.
 */
const props = defineProps<{ slug: string, repository: string }>()

useSeoMeta({ title: props.slug, robots: 'noindex' })

const links = [
  { label: 'Read it on GitHub', to: `https://github.com/${props.repository}#readme`, target: '_blank', icon: 'i-simple-icons-github', size: 'xl' as const },
  { label: 'All libraries', to: '/', color: 'neutral' as const, variant: 'subtle' as const, size: 'xl' as const },
]
</script>

<template>
  <UContainer>
    <UPageHero
      :title="slug"
      description="The documentation of this library is on its way. Its README covers it in the meantime."
      :links="links"
    />
  </UContainer>
</template>
