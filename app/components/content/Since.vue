<script setup lang="ts">
/** Inline badge for a feature added after the first major release: `:since{v="1.2"}`. */
defineProps<{ v: string }>()
</script>

<template>
  <UBadge :label="`Since ${v}`" variant="subtle" size="sm" icon="i-lucide-tag" class="align-middle" />
</template>
