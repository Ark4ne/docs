<script setup lang="ts">
const { data: libs } = useLibs()
const lib = useCurrentLib()
const navigation = useLibNavigation(lib).data

const switcher = computed(() => [libs.value.map(item => ({
  label: item.name,
  description: item.tagline,
  icon: item.icon,
  to: item.entry,
  active: item.slug === lib.value?.slug,
}))])

const repository = computed(() => lib.value ? `https://github.com/${lib.value.repository}` : useAppConfig().github)
</script>

<template>
  <UHeader :to="lib?.entry ?? '/'" mode="slideover">
    <template #title>
      <span class="flex items-center gap-2">
        <img src="/favicon.svg" alt="" class="size-6">
        <span class="font-semibold">ark4ne</span>
      </span>
    </template>

    <template #default>
      <UDropdownMenu :items="switcher" :content="{ align: 'start' }" :ui="{ content: 'w-80' }">
        <UButton
          :label="lib?.name ?? 'Libraries'"
          :icon="lib?.icon ?? 'i-lucide-library'"
          trailing-icon="i-lucide-chevrons-up-down"
          color="neutral"
          variant="ghost"
        />
      </UDropdownMenu>
      <UBadge v-if="lib?.version" :label="lib.version" variant="subtle" size="sm" />
    </template>

    <template #right>
      <UContentSearchButton :collapsed="false" class="hidden lg:flex" />
      <UContentSearchButton class="lg:hidden" />
      <UColorModeButton />
      <UButton :to="repository" target="_blank" icon="i-simple-icons-github" color="neutral" variant="ghost" aria-label="GitHub" />
    </template>

    <template #body>
      <!-- Mounted once the tree is loaded, and anew per library: it opens the active group on mount only. -->
      <UContentNavigation v-if="lib && navigation.length" :key="lib.slug" :navigation="navigation" highlight />
      <UNavigationMenu
        v-else-if="!lib"
        orientation="vertical"
        :items="libs.map(item => ({ label: item.name, icon: item.icon, to: item.entry }))"
      />
    </template>
  </UHeader>
</template>
