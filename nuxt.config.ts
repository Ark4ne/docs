import { enabledLibs, libs as registry } from './libs.config'

const site = process.env.DOCS_URL ?? 'https://docs.ark4ne.dev'
/** The path the site is served under: `/docs/` on GitHub Pages (https://ark4ne.github.io/docs), `/` on a domain. */
const base = new URL(site).pathname.replace(/\/?$/, '/')
const libs = enabledLibs()

export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  modules: ['@nuxt/ui', '@nuxt/content', 'nuxt-llms'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  app: {
    baseURL: base,
    head: {
      htmlAttrs: { lang: 'en' },
      link: [{ rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }],
    },
  },

  runtimeConfig: {
    public: {
      site,
      /** Libraries built into this run, in registry order; their identity comes from each lib.yml. */
      libs: libs.map(({ slug, repository, branch, path }) => ({ slug, repository, branch, path })),
      /** Every registered library, built or not: a link to one not in this build is not a dead link. */
      registry: registry.map(({ slug, repository }) => ({ slug, repository })),
    },
  },

  content: {
    build: {
      markdown: {
        toc: { depth: 3, searchDepth: 3 },
        highlight: {
          theme: { default: 'github-light', dark: 'github-dark' },
          langs: ['php', 'json', 'yaml', 'bash', 'shell', 'diff', 'ts', 'js', 'vue', 'html', 'ini', 'sql', 'xml', 'blade'],
        },
      },
    },
  },

  llms: {
    domain: site,
    title: 'ark4ne',
    description: 'Laravel and PHP libraries for JSON:API resources, OpenAPI documents and API revisions.',
    full: {
      title: 'ark4ne — complete documentation',
      description: 'Every page of every ark4ne library, as Markdown.',
    },
    sections: libs.map(lib => ({
      title: lib.slug,
      contentCollection: lib.slug.replaceAll('-', '_'),
    })),
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/'],
      failOnError: true,
    },
  },

  icon: {
    clientBundle: { scan: true },
  },
})
