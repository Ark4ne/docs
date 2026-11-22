<script setup lang="ts">
// Awaited so the server renders each library with its own accent, without a flash.
const { data: libs } = await useLibs()
const lib = useCurrentLib()
const appConfig = useAppConfig()


// One design system, one accent per library.
watchEffect(() => {
  appConfig.ui.colors.primary = lib.value?.color ?? 'indigo'
})

useHead({ meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }] })
useSeoMeta({ titleTemplate: title => (title ? `${title} · ark4ne` : 'ark4ne'), ogSiteName: 'ark4ne' })

const { data: navigation } = useAsyncData('search-navigation', async () => {
  const trees = await Promise.all(libs.value.map(async item => ({
    title: item.name,
    path: `/${item.slug}`,
    icon: item.icon,
    children: (await queryCollectionNavigation(item.collection)).flatMap(node => node.children ?? [node]),
  })))
  return trees
}, { server: false, watch: [libs], default: () => [] })

const { data: files } = useLazyAsyncData('search-sections', async () => {
  const sections = await Promise.all(libs.value.map(item => queryCollectionSearchSections(item.collection)))
  return sections.flat()
}, { server: false, watch: [libs], default: () => [] })

/**
 * On a library's pages the search covers that library only; the footer of the palette widens it to every
 * library. The scope goes back to the library whenever the reader moves to another one.
 */
const searchAll = ref(false)
watch(() => lib.value?.slug, () => {
  searchAll.value = false
})
const scope = computed(() => (searchAll.value ? undefined : lib.value))

/** Switches the scope and gives the focus back to the search field, so the reader keeps typing. */
async function setSearchAll(value: boolean) {
  searchAll.value = value
  await nextTick()
  document.querySelector<HTMLInputElement>('[role="dialog"] input')?.focus()
}

const inScope = (path: string) => !scope.value || path === `/${scope.value.slug}` || path.startsWith(`/${scope.value.slug}/`)
const scopedFiles = computed(() => files.value.filter(file => inScope(file.id)))
const scopedNavigation = computed(() => navigation.value.filter(tree => inScope(tree.path)))

const groups = computed(() => [{
  id: 'libraries',
  label: 'Libraries',
  items: libs.value.map(item => ({ label: item.name, icon: item.icon, to: item.entry, suffix: item.tagline })),
}])

</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />
    <AppHeader />
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
    <AppFooter />
    <ClientOnly>
      <LazyUContentSearch
        :files="scopedFiles"
        :navigation="scopedNavigation"
        :groups="groups"
        :fuse="{ resultLimit: 42 }"
        :placeholder="scope ? `Search ${scope.name}…` : 'Search all libraries…'"
      >
        <template v-if="lib" #footer>
          <div class="flex items-center justify-between gap-2 text-xs text-muted">
            <span class="flex items-center gap-1.5">
              <UIcon :name="scope ? scope.icon : 'i-lucide-library'" class="size-4 shrink-0" />
              {{ scope ? `In ${scope.name}` : 'In every library' }}
            </span>
            <UButton
              size="xs"
              color="neutral"
              variant="ghost"
              :label="scope ? 'Search all libraries' : `Only ${lib.name}`"
              @click="setSearchAll(!searchAll)"
            />
          </div>
        </template>
        <template v-if="scope" #empty="{ searchTerm }">
          <div class="flex flex-col items-center gap-2 py-6 text-sm text-muted">
            <span>No result for “{{ searchTerm }}” in {{ scope.name }}.</span>
            <UButton size="xs" color="neutral" variant="subtle" label="Search all libraries" @click="setSearchAll(true)" />
          </div>
        </template>
      </LazyUContentSearch>
    </ClientOnly>
  </UApp>
</template>
