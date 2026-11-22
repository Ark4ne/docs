import { defineNuxtModule, useLogger } from 'nuxt/kit'
import mermaid from 'mermaid'

/**
 * Mermaid diagrams, rendered when Nuxt Content parses a page.
 *
 * A ```mermaid code block becomes a `mermaid-diagram` node holding the SVG: Mermaid v13 renders without a
 * DOM, so the browser receives a finished drawing and no Mermaid JavaScript. The SVG is themed through
 * its `--mermaid-*` custom properties (see main.css), so light/dark mode and the library's accent apply
 * without rendering twice. A diagram that does not parse is shown as an error with its source, and
 * `pnpm check` reports it before it ever reaches the portal.
 */
type MinimarkNode = string | [string, Record<string, unknown>, ...MinimarkNode[]]

const logger = useLogger('mermaid')

/** Replaces the diagrams of `nodes` in place; `page.count` numbers them, their SVG ids must be unique on a page. */
async function transform(nodes: MinimarkNode[], page: { id: string, count: number }): Promise<void> {
  for (const [index, node] of nodes.entries()) {
    if (!Array.isArray(node)) continue
    const [tag, props, ...children] = node
    if (tag === 'pre' && props.language === 'mermaid' && typeof props.code === 'string') {
      const caption = typeof props.filename === 'string' ? props.filename : undefined
      nodes[index] = await diagram(`mermaid-${++page.count}`, props.code, caption, page.id)
    }
    else {
      await transform(children, page)
    }
  }
}

async function diagram(id: string, code: string, caption: string | undefined, file: string): Promise<MinimarkNode> {
  const props: Record<string, unknown> = caption ? { caption } : {}
  try {
    // `base` is the theme without built-in palettes: every colour comes from main.css. Git graphs, mind
    // maps and timelines still colour their branches from a fixed palette, by design.
    const { svg } = await mermaid.render(id, code, { config: { theme: 'base' } })
    return ['mermaid-diagram', { ...props, svg }]
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.warn(`${file}: invalid diagram\n${message}`)
    return ['mermaid-diagram', { ...props, error: message, code }]
  }
}

export default defineNuxtModule({
  meta: { name: 'mermaid' },
  setup(_, nuxt) {
    nuxt.hook('content:file:afterParse', async ({ file, content }) => {
      const nodes = (content.body as { value?: MinimarkNode[] } | undefined)?.value
      if (nodes) await transform(nodes, { id: file.id, count: 0 })
    })
  },
})
