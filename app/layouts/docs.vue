<script setup lang="ts">
const lib = useCurrentLib()
const { data: navigation } = useLibNavigation(lib)
</script>

<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside>
          <!-- Mounted once the tree is loaded, and anew per library: it opens the active group on mount only. -->
          <UContentNavigation v-if="navigation.length" :key="lib?.slug" :navigation="navigation" highlight />
        </UPageAside>
      </template>
      <slot />
    </UPage>
  </UContainer>
</template>
