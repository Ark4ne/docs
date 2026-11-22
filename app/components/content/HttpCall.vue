<script setup lang="ts">
/**
 * An HTTP call and what it answers, stacked at full width: the request line (method, path, one query parameter per
 * line), its headers and body, then the status and the response body.
 *
 * ::http-call{method="POST" url="/orders" :headers='{"Api-Revision":"winter-25"}' status="422"}
 * #request
 * ```json
 * { "title": "Lamp" }
 * ```
 * #response
 * ```json
 * { "message": "…" }
 * ```
 * ::
 *
 * `status` may be a code (`200`, its reason phrase is added) or any label (`$request->validated()`).
 */
const props = withDefaults(defineProps<{
  method?: string
  url: string
  headers?: Record<string, string>
  status?: string | number
}>(), { method: 'GET', headers: () => ({}), status: undefined })

const reasons: Record<number, string> = {
  200: 'OK', 201: 'Created', 202: 'Accepted', 204: 'No Content',
  301: 'Moved Permanently', 302: 'Found', 304: 'Not Modified',
  400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 405: 'Method Not Allowed',
  406: 'Not Acceptable', 409: 'Conflict', 410: 'Gone', 415: 'Unsupported Media Type', 422: 'Unprocessable Content',
  429: 'Too Many Requests', 500: 'Internal Server Error', 503: 'Service Unavailable',
}

const methodColors: Record<string, 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
  GET: 'success', POST: 'info', PUT: 'warning', PATCH: 'warning', DELETE: 'error',
}

const verb = computed(() => props.method.toUpperCase())

/** The path, then each query parameter on its own line, decoded so `fields[users]` reads as written. */
const target = computed(() => {
  const [path = '', query] = props.url.split(/\?(.*)/s, 2)
  const params = query
    ? query.split('&').filter(Boolean).map((pair, index) => {
        const [key = '', value] = pair.split(/=(.*)/s, 2)
        return { sep: index === 0 ? '?' : '&', key: safeDecode(key), value: value === undefined ? undefined : safeDecode(value) }
      })
    : []
  return { path, params }
})

const code = computed(() => {
  const n = Number(props.status)
  return Number.isInteger(n) && n >= 100 && n < 600 ? n : null
})

const statusLabel = computed(() => code.value === null
  ? String(props.status ?? '')
  : `${code.value} ${reasons[code.value] ?? ''}`.trim())

const statusColor = computed(() => {
  if (code.value === null) return 'neutral'
  if (code.value >= 500) return 'error'
  if (code.value >= 400) return 'warning'
  return 'success'
})

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '))
  }
  catch {
    return value
  }
}
</script>

<template>
  <div class="http-call my-5 overflow-hidden rounded-md border border-default">
    <div class="flex items-start gap-3 bg-elevated/50 px-4 py-3 font-mono text-sm">
      <UBadge :label="verb" :color="methodColors[verb] ?? 'neutral'" variant="subtle" size="sm" class="shrink-0 font-semibold" />
      <div class="min-w-0 break-all leading-6">
        <span class="font-medium text-highlighted">{{ target.path }}</span>
        <div v-for="param in target.params" :key="param.sep + param.key" class="pl-4">
          <span class="text-dimmed">{{ param.sep }}</span><span class="text-primary">{{ param.key }}</span>
          <template v-if="param.value !== undefined">
            <span class="text-dimmed">=</span><span class="text-highlighted">{{ param.value }}</span>
          </template>
        </div>
      </div>
    </div>

    <div v-if="Object.keys(headers).length" class="border-t border-default bg-muted px-4 py-2 font-mono text-sm leading-6">
      <div v-for="(value, name) in headers" :key="name" class="break-all">
        <span class="text-muted">{{ name }}:</span> <span class="text-highlighted">{{ value }}</span>
      </div>
    </div>

    <div v-if="$slots.request" class="http-call-panel border-t border-default">
      <slot name="request" mdc-unwrap="p" />
    </div>

    <template v-if="$slots.response || status !== undefined">
      <div class="flex items-center gap-2 border-t border-default bg-elevated/50 px-4 py-2 text-muted">
        <UIcon name="i-lucide-corner-down-right" class="size-4" />
        <span class="text-xs font-semibold uppercase tracking-wide">Response</span>
        <UBadge
          v-if="statusLabel"
          :label="statusLabel"
          :color="statusColor"
          variant="subtle"
          size="sm"
          class="font-mono"
        />
      </div>
      <div v-if="$slots.response" class="http-call-panel border-t border-default">
        <slot name="response" mdc-unwrap="p" />
      </div>
    </template>
  </div>
</template>

<style scoped>
/* The code blocks of the slots are panels of the call, not boxes inside it. */
.http-call :deep(pre) {
  border: 0;
  border-radius: 0;
  margin-block: 0;
}

/* The slot's block (the code block's wrapper, which carries its copy button) sits flush in the panel.
   Not `:has(> pre)`: the CSS minifier drops that selector. */
.http-call-panel > :deep(*) {
  margin-block: 0;
}
</style>
