<template>
  <UFooter>
    <template #left>
      <p class="text-sm text-muted">
        MIT licensed · ark4ne
      </p>
    </template>
    <template #right>
      <UButton to="/llms.txt" target="_blank" label="llms.txt" icon="i-lucide-bot" color="neutral" variant="ghost" size="sm" />
      <UButton :to="useAppConfig().github" target="_blank" icon="i-simple-icons-github" color="neutral" variant="ghost" aria-label="GitHub" />
    </template>
  </UFooter>
</template>
