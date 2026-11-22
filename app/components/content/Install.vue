<script setup lang="ts">
/**
 * The Composer command of the current library, from its lib.yml, so the package name is never mistyped:
 * `::install\n::` or `::install{dev}\n::`.
 */
const props = defineProps<{ dev?: boolean }>()
const lib = useCurrentLib()
const command = computed(() => `composer require ${props.dev ? '--dev ' : ''}${lib.value?.package}`)
</script>

<template>
  <ProsePre v-if="lib" language="bash" :code="command" filename="Terminal">
    <code><span class="line"><span>{{ command }}</span></span></code>
  </ProsePre>
</template>
