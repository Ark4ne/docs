<script setup lang="ts">
/**
 * The portal's landing page. Every library on it comes from its lib.yml (name, tagline, icon, colour, version,
 * related libraries): nothing about a library is written here.
 */
const { data: libs } = useLibs()
/** Resolved, not a string: <component :is> does not resolve a component by name. */
const ULink = resolveComponent('ULink')

useSeoMeta({
  title: 'Laravel and PHP libraries',
  description: 'JSON:API resources, OpenAPI documents and API revisions for Laravel, documented in one place.',
})

/** Classes of a library's own accent; kept by the `@source inline` safelists of main.css. */
function accent(color: string) {
  return {
    text: `text-${color}-500`,
    tile: `bg-${color}-500/10`,
    border: `hover:border-${color}-500/50`,
    glow: `from-${color}-500/15`,
  }
}

const byslug = computed(() => new Map(libs.value.map(lib => [lib.slug, lib])))

const features = [
  { icon: 'i-lucide-search', title: 'One search', description: 'Search the library you are reading, or every library at once, from any page with ⌘K.' },
  { icon: 'i-lucide-file-text', title: 'Every page as Markdown', description: 'Copy a page as Markdown, or open its source, to paste it into a chat or a prompt.' },
  { icon: 'i-lucide-bot', title: 'llms.txt', description: 'An index and the full text of every library for language models and coding agents.', to: '/llms.txt' },
  { icon: 'i-lucide-git-branch', title: 'Written next to the code', description: 'Each library keeps its documentation in its own repository, checked with every change.' },
]
</script>

<template>
  <div>
    <section class="relative isolate overflow-hidden border-b border-default">
      <div class="hero-grid absolute inset-0 -z-10" aria-hidden="true" />
      <div class="hero-glow absolute inset-x-0 top-0 -z-10 h-[36rem]" aria-hidden="true" />

      <UContainer class="grid items-center gap-14 py-20 sm:py-28 lg:grid-cols-2 lg:gap-16 lg:py-32">
        <div class="flex flex-col items-center text-center lg:items-start lg:text-left">
          <h1 class="hero-title text-5xl font-bold tracking-tight text-balance sm:text-6xl">
            <!-- A non-breaking hyphen: the title never breaks inside "well-described". -->
            Libraries for well‑described Laravel APIs
          </h1>
          <p class="mt-6 max-w-xl text-lg text-balance text-muted sm:text-xl">
            JSON:API resources, OpenAPI documents generated from your code, and API revisions — designed to work
            together, documented in one place.
          </p>
          <div class="mt-10 flex flex-wrap justify-center gap-3 lg:justify-start">
            <UButton label="Browse the libraries" to="#libraries" trailing-icon="i-lucide-arrow-down" size="xl" />
            <UButton label="GitHub" :to="useAppConfig().github" target="_blank" icon="i-simple-icons-github" color="neutral" variant="outline" size="xl" />
          </div>
        </div>

        <!-- The libraries as tiles, each in its own colour; the second column is offset for rhythm. -->
        <div class="grid grid-cols-2 gap-4 sm:gap-5">
          <ULink
            v-for="(lib, index) in libs"
            :key="lib.slug"
            :to="lib.home ?? lib.entry"
            class="group relative overflow-hidden rounded-xl border border-default bg-default/80 p-5 backdrop-blur transition duration-200 hover:-translate-y-1"
            :class="[accent(lib.color).border, index % 2 === 1 && 'sm:translate-y-8 sm:hover:translate-y-7']"
          >
            <div class="absolute inset-0 -z-10 bg-linear-to-br to-transparent to-60%" :class="accent(lib.color).glow" aria-hidden="true" />
            <span class="flex size-11 items-center justify-center rounded-lg" :class="[accent(lib.color).tile, accent(lib.color).text]">
              <UIcon :name="lib.icon" class="size-6" />
            </span>
            <p class="mt-4 font-semibold text-highlighted">
              {{ lib.name }}
            </p>
            <p v-if="lib.version" class="mt-1 font-mono text-xs text-muted">
              {{ lib.version }}
            </p>
          </ULink>
        </div>
      </UContainer>
    </section>

    <section id="libraries" class="scroll-mt-(--ui-header-height) py-16 sm:py-24">
      <UContainer>
        <div class="mx-auto mb-12 max-w-2xl text-center">
          <span class="font-mono text-sm font-semibold tracking-widest text-primary">01</span>
          <h2 class="mt-3 text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
            The libraries
          </h2>
          <p class="mt-4 text-lg text-muted">
            Each one stands alone, and each one knows the others.
          </p>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <ULink
            v-for="lib in libs"
            :key="lib.slug"
            :to="lib.home ?? lib.entry"
            class="group relative isolate flex flex-col overflow-hidden rounded-xl border border-default bg-default p-6 transition duration-200 hover:-translate-y-0.5 sm:p-8"
            :class="accent(lib.color).border"
          >
            <div class="absolute inset-x-0 top-0 -z-10 h-40 bg-linear-to-b to-transparent" :class="accent(lib.color).glow" aria-hidden="true" />
            <div class="flex items-start justify-between gap-4">
              <span class="flex size-12 shrink-0 items-center justify-center rounded-lg" :class="[accent(lib.color).tile, accent(lib.color).text]">
                <UIcon :name="lib.icon" class="size-6" />
              </span>
              <UBadge v-if="lib.version" :label="lib.version" color="neutral" variant="outline" />
            </div>
            <h3 class="mt-6 text-xl font-semibold text-highlighted">
              {{ lib.name }}
            </h3>
            <p class="mt-2 grow text-muted">
              {{ lib.tagline }}
            </p>
            <div class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-default pt-4 text-sm">
              <code class="text-xs text-muted">{{ lib.package }}</code>
              <span v-if="lib.related.length" class="flex items-center gap-2 text-xs text-muted">
                Works with
                <UTooltip v-for="slug in lib.related.filter(slug => byslug.has(slug))" :key="slug" :text="byslug.get(slug)!.name">
                  <UIcon :name="byslug.get(slug)!.icon" class="size-4" :class="accent(byslug.get(slug)!.color).text" />
                </UTooltip>
              </span>
            </div>
          </ULink>
        </div>
      </UContainer>
    </section>

    <section class="border-y border-default bg-elevated/50 py-16 sm:py-24">
      <UContainer>
        <div class="mx-auto mb-12 max-w-2xl text-center">
          <span class="font-mono text-sm font-semibold tracking-widest text-primary">02</span>
          <h2 class="mt-3 text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
            Documentation for people and agents
          </h2>
          <p class="mt-4 text-lg text-muted">
            The same pages, read in a browser or handed to a model.
          </p>
        </div>

        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <component
            :is="feature.to ? ULink : 'div'"
            v-for="feature in features"
            :key="feature.title"
            :to="feature.to"
            :target="feature.to ? '_blank' : undefined"
            class="rounded-xl border border-default bg-default p-6 transition duration-200"
            :class="feature.to && 'hover:-translate-y-0.5 hover:border-primary/50'"
          >
            <span class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UIcon :name="feature.icon" class="size-5" />
            </span>
            <p class="mt-4 font-semibold text-highlighted">
              {{ feature.title }}
            </p>
            <p class="mt-2 text-sm text-muted">
              {{ feature.description }}
            </p>
          </component>
        </div>
      </UContainer>
    </section>
  </div>
</template>
