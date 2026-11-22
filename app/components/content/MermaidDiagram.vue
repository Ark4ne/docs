<script setup lang="ts">
/**
 * A Mermaid diagram, already rendered to SVG at build time by `modules/mermaid.ts`. Authors never write
 * this component: they write a ```mermaid code block, optionally with a caption: ```mermaid [Request flow].
 */
defineProps<{ svg?: string, caption?: string, error?: string, code?: string }>()
</script>

<template>
  <figure class="mermaid-diagram my-5 overflow-x-auto rounded-(--ui-radius) border border-default bg-default p-4">
    <!-- eslint-disable-next-line vue/no-v-html -- SVG produced by Mermaid from the library's own pages -->
    <div v-if="svg" class="flex justify-center" v-html="svg" />
    <div v-else class="flex flex-col gap-2 text-sm">
      <span class="flex items-center gap-1 font-semibold text-error">
        <UIcon name="i-lucide-triangle-alert" />Invalid Mermaid diagram
      </span>
      <pre class="m-0 whitespace-pre-wrap text-xs text-muted">{{ error }}</pre>
      <pre class="m-0 text-xs">{{ code }}</pre>
    </div>
    <figcaption v-if="caption" class="mt-3 text-center text-xs text-muted">
      {{ caption }}
    </figcaption>
  </figure>
</template>
