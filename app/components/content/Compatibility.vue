<script setup lang="ts">
/** The support table of the current library, read from its lib.yml: `::compatibility\n::`. */
const lib = useCurrentLib()

const status = {
  active: { label: 'Active', color: 'success' },
  security: { label: 'Security fixes', color: 'warning' },
  eol: { label: 'End of life', color: 'neutral' },
} as const
const hasLaravel = computed(() => lib.value?.compatibility.some(row => row.laravel))
</script>

<template>
  <ProseTable v-if="lib">
    <ProseThead>
      <ProseTr>
        <ProseTh>Version</ProseTh>
        <ProseTh>PHP</ProseTh>
        <ProseTh v-if="hasLaravel">
          Laravel
        </ProseTh>
        <ProseTh>Status</ProseTh>
      </ProseTr>
    </ProseThead>
    <ProseTbody>
      <ProseTr v-for="row in lib.compatibility" :key="row.version">
        <ProseTd><strong>{{ row.version }}</strong></ProseTd>
        <ProseTd><code>{{ row.php }}</code></ProseTd>
        <ProseTd v-if="hasLaravel">
          <code v-if="row.laravel">{{ row.laravel }}</code><span v-else>—</span>
        </ProseTd>
        <ProseTd>
          <UBadge :label="status[row.status].label" :color="status[row.status].color" variant="subtle" size="sm" />
        </ProseTd>
      </ProseTr>
    </ProseTbody>
  </ProseTable>
</template>
