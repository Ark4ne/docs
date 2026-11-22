<script setup lang="ts">
/**
 * A library's CHANGELOG.md as a timeline. The file keeps the Keep a Changelog format, one `## [version] - date`
 * per release: each becomes a version of the timeline, with its date beside it and its sections (Added,
 * Changed…) as its body. What comes before the first `##` is shown above, without the `# Changelog` title and
 * the first paragraph: Nuxt Content made them the page's title and description, already in its header.
 * A heading that does not read as a version still becomes an entry, titled with its text; an empty one
 * (an `[Unreleased]` waiting for its first change) is left out.
 */
type MinimarkNode = string | [string, Record<string, unknown>, ...MinimarkNode[]]

const props = defineProps<{ page: LibPage }>()

function text(node: MinimarkNode): string {
  return typeof node === 'string' ? node : node.slice(2).map(child => text(child as MinimarkNode)).join('')
}

const content = computed(() => {
  const nodes = (props.page.body as { value?: MinimarkNode[] } | undefined)?.value ?? []
  const part = (value: MinimarkNode[]) => ({ ...props.page, body: { ...props.page.body, value } }) as LibPage
  const isVersion = (node: MinimarkNode) => Array.isArray(node) && node[0] === 'h2'

  const first = nodes.findIndex(isVersion)
  const groups: MinimarkNode[][] = []
  for (const node of first === -1 ? [] : nodes.slice(first)) {
    if (isVersion(node)) groups.push([])
    if (node !== '\n') groups.at(-1)!.push(node)
  }
  const filled = groups.filter(group => group.length > 1)

  let latest = true
  const versions = filled.map((group) => {
    const heading = group[0] as [string, Record<string, unknown>, ...MinimarkNode[]]
    const label = text(heading).trim()
    // "[1.2.0] - 2026-11-18", "[v1.2.0] — 2026-11-18", "[Unreleased]"
    const match = /^\[?v?([^\]\s]+)\]?(?:\s*[-—–]\s*(\d{4}-\d{2}-\d{2}))?/.exec(label)
    const unreleased = /unreleased/i.test(label)
    const badge = unreleased
      ? { label: 'Unreleased', color: 'neutral' as const, variant: 'outline' as const }
      : latest && match?.[2] ? { label: 'Latest', color: 'primary' as const, variant: 'subtle' as const } : undefined
    if (!unreleased && match?.[2]) latest = false
    return {
      id: String(heading[1].id ?? ''),
      title: unreleased ? 'Unreleased' : match ? match[1] : label,
      date: match?.[2],
      badge,
      body: part(group.slice(1)),
    }
  })
  const head = nodes.slice(0, first === -1 ? nodes.length : first)
  const title = head.findIndex(node => Array.isArray(node) && node[0] === 'h1')
  const lead = head.findIndex(node => Array.isArray(node) && node[0] === 'p')
  const intro = head.filter((node, index) => index !== title && index !== lead && node !== '\n')
  return { intro: intro.length ? part(intro) : null, versions }
})

const date = (value: string) => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
</script>

<template>
  <div>
    <ContentRenderer v-if="content.intro" :value="content.intro" class="changelog-intro mb-10" />

    <UChangelogVersions :indicator="false">
      <UChangelogVersion
        v-for="version in content.versions"
        :id="version.id || undefined"
        :key="version.id || version.title"
        :title="version.title"
        :badge="undefined"
        class="changelog-version flex scroll-mt-[calc(var(--ui-header-height)+1rem)] items-start"
        :ui="{
          container: 'max-w-none ms-0 lg:ms-8 min-w-0 flex-1 lg:border-s lg:border-default lg:pl-8',
          title: 'font-mono text-2xl',
          indicator: 'sticky top-(--ui-header-height) pt-5 -mt-4 flex flex-col items-end gap-1.5',
        }"
      >
        <template #indicator>
          <UBadge v-if="version.badge" v-bind="version.badge" size="sm" />
          <span v-if="version.date" class="text-sm text-muted">{{ date(version.date) }}</span>
        </template>
        <template #date>
          <span class="flex items-center gap-2 lg:hidden">
            <UBadge v-if="version.badge" v-bind="version.badge" size="sm" />
            <span v-if="version.date" class="text-sm text-muted">{{ date(version.date) }}</span>
          </span>
        </template>
        <template #body>
          <ContentRenderer :value="version.body" class="changelog-body mt-4" />
        </template>
      </UChangelogVersion>
    </UChangelogVersions>
  </div>
</template>

<style scoped>
/* "Added", "Changed"…: small labels inside a version, not headings competing with the version number. */
.changelog-body :deep(h3) {
  margin-top: 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ui-primary);
}
.changelog-body > :deep(:first-child) {
  margin-top: 0;
}
.changelog-version + .changelog-version {
  border-top: 1px solid var(--ui-border);
  padding-top: 2rem;
}
</style>
