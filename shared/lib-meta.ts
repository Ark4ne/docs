import { z } from 'zod'

/** Tailwind palettes a library may pick as its accent colour. */
export const accentColors = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo',
  'violet', 'purple', 'fuchsia', 'pink', 'rose',
] as const

/**
 * `docs/site/lib.yml`: the identity of a library. The portal builds the landing card, the header, the
 * compatibility table and the accent colour from it, so none of them is written by hand in the portal.
 */
export const libMetaSchema = z.object({
  name: z.string().min(1),
  /** Composer package; its latest version is read from Packagist. */
  package: z.string().regex(/^[a-z0-9-]+\/[a-z0-9-]+$/),
  /** One sentence, shown on the landing card and as the default page description. */
  tagline: z.string().min(1).max(160),
  /** Iconify name, e.g. `i-lucide-file-json`. */
  icon: z.string().regex(/^i-[a-z0-9]+-[a-z0-9-]+$/),
  color: z.enum(accentColors),
  /** Position on the landing page and in the library switcher, ascending. */
  order: z.number().int().default(100),
  compatibility: z.array(z.object({
    version: z.string(),
    php: z.string(),
    laravel: z.string().optional(),
    status: z.enum(['active', 'security', 'eol']),
  })).min(1),
  /** Slugs of the other ark4ne libraries this one works with. */
  related: z.array(z.string()).default([]),
  links: z.array(z.object({
    label: z.string(),
    to: z.string().url(),
    icon: z.string().optional(),
  })).default([]),
})

export type LibMeta = z.infer<typeof libMetaSchema>

/** Pages every library provides, so readers find them at the same place in each documentation. */
export const requiredPages = ['introduction', 'installation'] as const

/** Root files the portal renders for every library. */
export const rootPages = { 'CHANGELOG.md': 'changelog', 'UPGRADE.md': 'upgrade' } as const
