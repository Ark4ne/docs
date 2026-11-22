<script setup lang="ts">
/**
 * What you write, then what you get: the generator's input and the document it produces, a resource and its
 * JSON, etc. One card, stacked at full width: the input panel titled with `input` (a file name, a method), a
 * bar with an arrow and `output`, then the output panel.
 *
 * ::example{input="app/Http/Requests/StoreUser.php" output="requestBody"}
 * #input
 * ```php
 * ...
 * ```
 * #output
 * ```json
 * ...
 * ```
 * ::
 *
 * `side` puts the two panels next to each other from `lg` up, for short pairs only: the content column is
 * about 870px on a wide screen, so each side gets about 430px and longer lines wrap.
 */
withDefaults(defineProps<{ input?: string, output?: string, side?: boolean }>(), {
  input: 'Input',
  output: 'Output',
  side: false,
})
</script>

<template>
  <div class="example my-5 overflow-hidden rounded-md border border-default" :class="side && 'lg:grid lg:grid-cols-2'">
    <div class="flex min-w-0 flex-col">
      <div class="flex items-center gap-2 bg-elevated/50 px-4 py-2 text-muted">
        <UIcon name="i-lucide-file-code" class="size-4 shrink-0" />
        <span class="truncate font-mono text-xs">{{ input }}</span>
      </div>
      <div class="example-panel grow border-t border-default">
        <slot name="input" mdc-unwrap="p" />
      </div>
    </div>

    <div class="flex min-w-0 flex-col border-t border-default" :class="side && 'lg:border-t-0 lg:border-l'">
      <div class="flex items-center gap-2 bg-elevated/50 px-4 py-2 text-primary">
        <UIcon :name="side ? 'i-lucide-arrow-right' : 'i-lucide-arrow-down'" class="size-4 shrink-0" :class="side && 'max-lg:rotate-90'" />
        <span class="truncate font-mono text-xs">{{ output }}</span>
      </div>
      <div class="example-panel grow border-t border-default">
        <slot name="output" mdc-unwrap="p" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* The code blocks of the slots are panels of the card, not boxes inside it (as in HttpCall). */
.example :deep(pre) {
  border: 0;
  border-radius: 0;
  margin-block: 0;
}

/* The slot's block (the code block's wrapper, which carries its copy button) sits flush in the panel.
   Not `:has(> pre)`: the CSS minifier drops that selector. */
.example-panel > :deep(*) {
  margin-block: 0;
}

/* A side-by-side panel stretches to the taller one. */
.example-panel :deep(pre) {
  height: 100%;
}
</style>
