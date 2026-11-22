<script setup lang="ts">
const lib = useCurrentLib()
const { data: navigation } = useLibNavigation(lib)
</script>

<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside>
          <template v-if="lib?.home" #top>
            <ULink :to="lib.home" class="flex items-center gap-1.5 text-sm text-muted hover:text-highlighted">
              <UIcon name="i-lucide-house" class="size-4" />Overview
            </ULink>
          </template>
          <!-- Mounted once the tree is loaded, and anew per library: it opens the active group on mount only. -->
          <UContentNavigation v-if="navigation.length" :key="lib?.slug" :navigation="navigation" highlight />
        </UPageAside>
      </template>
      <slot />
    </UPage>
  </UContainer>
</template>
