<script setup lang="ts">
/** A card linking to another ark4ne library: `:lib-card{slug="openapi-writer"}`. */
const props = defineProps<{ slug: string }>()

const { data: libs } = useLibs()
const lib = computed(() => libs.value.find(item => item.slug === props.slug))
// Classes kept by the `@source inline` safelist in main.css.
const accent = computed(() => `text-${lib.value?.color}-500`)
</script>

<template>
  <UPageCard
    v-if="lib"
    :title="lib.name"
    :description="lib.tagline"
    :icon="lib.icon"
    :to="lib.entry"
    spotlight
    :ui="{ leadingIcon: accent }"
    class="not-prose"
  >
    <template #footer>
      <div class="flex flex-wrap items-center gap-2 text-xs text-muted">
        <UBadge v-if="lib.version" :label="lib.version" color="neutral" variant="outline" size="sm" />
        <code>{{ lib.package }}</code>
      </div>
    </template>
  </UPageCard>
</template>
