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
  <UHeader mode="slideover">
    <!--
      A breadcrumb: the portal stays a discreet way home, the current library is what the header is about.
      On the landing page there is no library yet, so the portal's name leads.
    -->
    <template #left>
      <nav aria-label="Library" class="flex min-w-0 items-center gap-1.5">
        <UTooltip text="All libraries">
          <ULink
            to="/"
            aria-label="ark4ne, all libraries"
            class="flex shrink-0 items-center gap-2 rounded-md text-muted transition-colors hover:text-highlighted"
          >
            <img src="/favicon.svg" alt="" :class="'size-5 opacity-80'">
            <span :class="'text-sm font-semibold text-highlighted'">ark4ne</span>
          </ULink>
        </UTooltip>

        <span class="text-dimmed select-none" aria-hidden="true">/</span>

        <UDropdownMenu :items="switcher" :content="{ align: 'start' }" :ui="{ content: 'w-80' }">
          <UButton
            :label="lib?.name ?? 'Libraries'"
            :icon="lib?.icon ?? 'i-lucide-library'"
            trailing-icon="i-lucide-chevrons-up-down"
            color="neutral"
            variant="ghost"
            :size="lib ? 'lg' : 'md'"
            class="min-w-0 -ms-1"
            :ui="{
              leadingIcon: lib ? 'text-primary' : 'text-muted',
              label: lib ? 'truncate font-semibold text-highlighted' : 'text-muted',
              trailingIcon: 'text-dimmed',
            }"
          />
        </UDropdownMenu>

        <UBadge v-if="lib?.version" :label="lib.version" variant="subtle" size="sm" class="hidden shrink-0 sm:inline-flex" />
      </nav>
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
