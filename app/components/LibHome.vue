<script setup lang="ts">
/**
 * The home page of a library (`docs/site/index.md`): a hero built from lib.yml, the page's own sections, a call
 * to action, then the libraries it works with.
 *
 * The page's Markdown is cut at each `##` into numbered sections, laid out by what they hold: a section with a
 * demo (`::example`, `::http-call`, `::code-group`) puts its text beside it, the others are centred. Every
 * other section sits on a tinted band, so the page reads as a sequence rather than one long column. A demo
 * written before the first `##` goes into the hero, beside the library's name.
 */
type MinimarkNode = string | [string, Record<string, unknown>, ...MinimarkNode[]]

const props = defineProps<{ lib: Lib, page: LibPage, changelog: string | null }>()

const demoTags = ['example', 'http-call', 'code-group']
const isDemo = (node: MinimarkNode) => Array.isArray(node) && demoTags.includes(node[0])
const isHeading = (node: MinimarkNode) => Array.isArray(node) && node[0] === 'h2'

const content = computed(() => {
  const nodes = (props.page.body as { value?: MinimarkNode[] } | undefined)?.value ?? []
  const part = (value: MinimarkNode[]) => ({ ...props.page, body: { ...props.page.body, value } }) as LibPage

  // Before the first `##`: the hero's demo, if any.
  const first = nodes.findIndex(isHeading)
  const preamble = first === -1 ? nodes : nodes.slice(0, first)
  const heroDemo = preamble.filter(isDemo)

  const groups: MinimarkNode[][] = []
  for (const node of first === -1 ? [] : nodes.slice(first)) {
    if (isHeading(node)) groups.push([])
    groups.at(-1)!.push(node)
  }
  return {
    hero: heroDemo.length ? part(heroDemo) : null,
    sections: groups.map((group, index) => {
      const demo = group.filter(isDemo)
      return {
        number: String(index + 1).padStart(2, '0'),
        kind: demo.length ? 'demo' : group.some(node => Array.isArray(node) && node[0] === 'card-group') ? 'cards' : 'plain',
        text: part(demo.length ? group.filter(node => !isDemo(node)) : group),
        demo: demo.length ? part(demo) : null,
      }
    }),
  }
})

const { data: libs } = useLibs()
const related = computed(() => libs.value.filter(item => props.lib.related.includes(item.slug)))

const install = computed(() => `composer require ${props.lib.package}`)
const toast = useToast()
async function copyInstall() {
  await navigator.clipboard.writeText(install.value)
  toast.add({ title: 'Command copied', icon: 'i-lucide-check', color: 'success' })
}

const links = computed(() => [
  { label: 'Get started', to: props.lib.entry, trailingIcon: 'i-lucide-arrow-right', size: 'xl' as const },
  { label: 'GitHub', to: `https://github.com/${props.lib.repository}`, target: '_blank', icon: 'i-simple-icons-github', color: 'neutral' as const, variant: 'outline' as const, size: 'xl' as const },
])

/**
 * Sections below the fold rise into view as the reader scrolls. Only those: what is on screen at load stays
 * put, the prerendered page shows everything without JavaScript, and reduced motion turns it off.
 */
const root = useTemplateRef<HTMLElement>('root')
onMounted(() => {
  if (!root.value || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
  const below = [...root.value.querySelectorAll<HTMLElement>('[data-reveal]')]
    .filter(element => element.getBoundingClientRect().top > innerHeight)
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries.filter(entry => entry.isIntersecting)) {
      const element = entry.target
      element.classList.replace('is-hidden', 'is-revealed')
      observer.unobserve(element)
      // Back to the plain state once risen, so the cards' hover is not delayed by the stagger.
      setTimeout(() => element.classList.remove('is-revealed'), 1200)
    }
  }, { rootMargin: '0px 0px -10% 0px' })
  for (const element of below) {
    element.classList.add('is-hidden')
    observer.observe(element)
  }
  onBeforeUnmount(() => observer.disconnect())
})
</script>

<template>
  <div ref="root" class="home">
    <!-- Built from lib.yml: every library's home opens the same way, only the accent changes. -->
    <section class="relative isolate overflow-hidden border-b border-default">
      <div class="home-grid absolute inset-0 -z-10" aria-hidden="true" />
      <div class="home-glow absolute inset-x-0 top-0 -z-10 h-[36rem]" aria-hidden="true" />

      <UContainer
        class="py-20 sm:py-28 lg:py-32"
        :class="content.hero ? 'grid items-center gap-12 lg:grid-cols-2 lg:gap-16' : 'flex flex-col items-center text-center'"
      >
        <div class="flex flex-col" :class="content.hero ? 'items-center text-center lg:items-start lg:text-left' : 'items-center'">
          <ULink
            :to="changelog ?? `https://github.com/${lib.repository}/releases`"
            :target="changelog ? undefined : '_blank'"
            class="mb-8 inline-flex items-center gap-2 rounded-full border border-default bg-default/70 py-1 ps-1 pe-3 text-sm text-muted backdrop-blur transition-colors hover:border-primary/50 hover:text-highlighted"
          >
            <span class="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UIcon :name="lib.icon" class="size-4" />
            </span>
            <span v-if="lib.version" class="font-medium text-highlighted">{{ lib.version }}</span>
            <span>{{ lib.version ? 'is out' : 'Releases' }}</span>
            <UIcon name="i-lucide-arrow-right" class="size-3.5" />
          </ULink>

          <h1
            class="home-title font-bold tracking-tight text-balance"
            :class="content.hero ? 'text-5xl sm:text-6xl' : 'text-5xl sm:text-6xl lg:text-7xl'"
          >
            {{ lib.name }}
          </h1>
          <p class="mt-6 max-w-2xl text-lg text-balance text-muted sm:text-xl">
            {{ lib.tagline }}
          </p>

          <div class="mt-10 flex flex-wrap gap-3" :class="content.hero ? 'justify-center lg:justify-start' : 'justify-center'">
            <UButton v-for="link in links" :key="link.label" v-bind="link" />
          </div>

          <button
            type="button"
            class="group mt-8 inline-flex max-w-full items-center gap-3 rounded-md border border-default bg-default/70 px-4 py-2 font-mono text-sm text-muted backdrop-blur transition-colors hover:border-primary/50"
            :aria-label="`Copy: ${install}`"
            @click="copyInstall"
          >
            <span class="text-primary select-none">$</span>
            <span class="truncate text-highlighted">{{ install }}</span>
            <UIcon name="i-lucide-copy" class="size-4 shrink-0 transition-colors group-hover:text-primary" />
          </button>
        </div>

        <div v-if="content.hero" class="relative min-w-0">
          <div class="home-demo-glow absolute -inset-10 -z-10" aria-hidden="true" />
          <ContentRenderer :value="content.hero" class="home-demo" />
        </div>
      </UContainer>
    </section>

    <section
      v-for="(section, index) in content.sections"
      :key="section.number"
      class="home-section py-16 sm:py-24"
      :class="index % 2 === 1 && 'home-band border-y border-default'"
    >
      <UContainer data-reveal>
        <div v-if="section.demo" class="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div class="lg:col-span-5">
            <span class="home-number" aria-hidden="true">{{ section.number }}</span>
            <ContentRenderer :value="section.text" class="home-text" />
          </div>
          <div class="relative min-w-0 lg:col-span-7">
            <div class="home-demo-glow absolute -inset-8 -z-10" aria-hidden="true" />
            <ContentRenderer :value="section.demo" class="home-demo" />
          </div>
        </div>
        <template v-else>
          <span class="home-number home-number-centred" aria-hidden="true">{{ section.number }}</span>
          <ContentRenderer :value="section.text" class="home-centred" :class="`home-${section.kind}`" />
        </template>
      </UContainer>
    </section>

    <section class="relative isolate overflow-hidden border-t border-default py-20 text-center sm:py-24">
      <div class="home-glow home-glow-bottom absolute inset-0 -z-10" aria-hidden="true" />
      <UContainer class="flex flex-col items-center" data-reveal>
        <h2 class="text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
          Start with {{ lib.name }}
        </h2>
        <p class="mt-4 max-w-xl text-lg text-muted">
          Install it, follow the quick start, and see your first result in minutes.
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <UButton v-for="link in links" :key="link.label" v-bind="link" />
        </div>
      </UContainer>
    </section>

    <UPageSection
      v-if="related.length"
      title="Works with"
      class="border-t border-default"
      :ui="{ title: 'text-3xl sm:text-4xl' }"
    >
      <UPageGrid>
        <LibCard v-for="item in related" :key="item.slug" :slug="item.slug" />
      </UPageGrid>
    </UPageSection>
  </div>
</template>

<style scoped>
/* Hero: a fading grid and a glow of the library's accent. */
.home-grid {
  background-image:
    linear-gradient(to right, var(--ui-border) 1px, transparent 1px),
    linear-gradient(to bottom, var(--ui-border) 1px, transparent 1px);
  background-size: 3rem 3rem;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, #000 40%, transparent 100%);
}
.home-glow {
  background: radial-gradient(ellipse 60% 55% at 50% 0%, color-mix(in oklab, var(--ui-primary) 22%, transparent), transparent 70%);
}
.home-glow-bottom {
  background: radial-gradient(ellipse 50% 80% at 50% 100%, color-mix(in oklab, var(--ui-primary) 16%, transparent), transparent 70%);
}
.home-title {
  background: linear-gradient(180deg, var(--ui-text-highlighted) 40%, color-mix(in oklab, var(--ui-primary) 70%, var(--ui-text-highlighted)));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  padding-bottom: 0.1em;
}

/* Sections: every other one on a band, so the page alternates. */
.home-band {
  background: color-mix(in oklab, var(--ui-bg-elevated) 55%, transparent);
}
.home-section :deep(h2) {
  margin-top: 0;
  font-size: clamp(1.75rem, 1.2rem + 1.5vw, 2.25rem);
  letter-spacing: -0.025em;
}
.home-section :deep(h2 + p) {
  margin-top: 1rem;
  font-size: 1.125rem;
  color: var(--ui-text-muted);
}

/* A centred section: heading and subtitle on a readable measure, cards on the full width. */
.home-centred > :deep(*) {
  max-width: 64rem;
  margin-inline: auto;
}
.home-centred > :deep(h2),
.home-centred > :deep(h2 + p) {
  max-width: 48rem;
  text-align: center;
}
.home-centred > :deep(h2 + p) {
  margin-bottom: 3rem;
}
.home-cards > :deep(.grid) {
  max-width: none;
}
@media (min-width: 64rem) {
  .home-cards > :deep(.grid) {
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  }
}

/* Feature cards: the icon on a tinted tile, a lift on hover. */
.home-cards :deep(.grid > *) {
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}
.home-cards :deep(.grid > *:hover) {
  transform: translateY(-2px);
  border-color: color-mix(in oklab, var(--ui-primary) 50%, transparent);
  box-shadow: 0 12px 32px -16px color-mix(in oklab, var(--ui-primary) 45%, transparent);
}
.home-cards :deep(.grid > * > .iconify) {
  position: relative;
  margin-bottom: 1.25rem;
}
/* The icon is a CSS mask, so its tile is drawn behind it, by the card. */
.home-cards :deep(.grid > *::before) {
  content: "";
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: calc(var(--ui-radius) * 1.5);
  background: color-mix(in oklab, var(--ui-primary) 12%, transparent);
}
@media (min-width: 40rem) {
  .home-cards :deep(.grid > *::before) {
    top: 1rem;
    left: 1rem;
  }
}

/* A section with a demo: its text on the left, the demo on the right, on a glow. */
.home-text > :deep(:first-child) {
  margin-top: 0;
}
.home-demo > :deep(*) {
  margin-block: 0;
  background: var(--ui-bg);
  box-shadow: 0 24px 64px -32px color-mix(in oklab, var(--ui-primary) 55%, transparent);
}
.home-demo > :deep(* + *) {
  margin-top: 1.5rem;
}
.home-demo-glow {
  background: radial-gradient(ellipse at 60% 50%, color-mix(in oklab, var(--ui-primary) 14%, transparent), transparent 70%);
}

/* Section numbers: a quiet, monospaced marker in the accent. */
.home-number {
  display: block;
  margin-bottom: 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--ui-primary);
}
.home-number::after {
  content: "";
  display: inline-block;
  width: 2rem;
  height: 1px;
  margin-inline-start: 0.75rem;
  vertical-align: middle;
  background: color-mix(in oklab, var(--ui-primary) 50%, transparent);
}
.home-number-centred {
  text-align: center;
}
.home-number-centred::before {
  content: "";
  display: inline-block;
  width: 2rem;
  height: 1px;
  margin-inline-end: 0.75rem;
  vertical-align: middle;
  background: color-mix(in oklab, var(--ui-primary) 50%, transparent);
}

/* Reveal on scroll (set up in onMounted): a short rise, then the cards one after the other. */
.is-hidden {
  opacity: 0;
  transform: translateY(1.5rem);
}
.is-revealed {
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.is-hidden :deep(.grid > *) {
  opacity: 0;
  transform: translateY(1rem);
}
.is-revealed :deep(.grid > *) {
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.is-revealed :deep(.grid > *:nth-child(2)) { transition-delay: 0.08s; }
.is-revealed :deep(.grid > *:nth-child(3)) { transition-delay: 0.16s; }
.is-revealed :deep(.grid > *:nth-child(4)) { transition-delay: 0.24s; }
</style>
