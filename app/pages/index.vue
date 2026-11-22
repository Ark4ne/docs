<script setup lang="ts">
const { data: libs } = useLibs()

useSeoMeta({
  title: 'Laravel and PHP libraries',
  description: 'JSON:API resources, OpenAPI documents and API revisions for Laravel, documented in one place.',
})
</script>

<template>
  <div>
    <UPageHero
      title="Libraries for well-described Laravel APIs"
      description="JSON:API resources, OpenAPI documents generated from your code, and API revisions — designed to work together, documented in one place."
      :links="[
        { label: 'Browse the libraries', to: '#libraries', icon: 'i-lucide-arrow-down', size: 'xl' },
        { label: 'GitHub', to: useAppConfig().github, target: '_blank', icon: 'i-simple-icons-github', color: 'neutral', variant: 'subtle', size: 'xl' },
      ]"
    />

    <UPageSection id="libraries" title="Libraries">
      <UPageGrid>
        <LibCard v-for="lib in libs" :key="lib.slug" :slug="lib.slug" />
      </UPageGrid>
    </UPageSection>
  </div>
</template>
