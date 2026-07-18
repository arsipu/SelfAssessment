<template>
  <!-- Bare mode: no wrapper, no title, no toggle — parent controls all chrome -->
  <div v-if="bare" class="space-y-4">
    <div
      v-for="section in detailSections"
      :key="section.key"
      class="border border-border rounded-xl p-4"
      :class="{ 'avoid-break': avoidBreak }"
    >
      <div class="flex items-center gap-2 mb-4">
        <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: section.dot }"></span>
        <span class="text-base font-semibold text-text-primary">{{ section.label }}</span>
        <span class="text-sm text-text-muted">({{ section.code }})</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="col in section.columns"
          :key="col.key"
          class="md:border-l md:border-border md:pl-6 md:first:border-l-0 md:first:pl-0"
        >
          <p class="text-xs font-semibold text-text-secondary mb-2">{{ col.label }}</p>
          <div class="space-y-2">
            <div
              v-for="q in col.questions"
              :key="q.id"
              class="flex items-start gap-2.5 rounded-lg p-2.5 border transition-colors"
              :class="answeredIds.has(q.id) ? 'border-instrument bg-instrument-soft' : unansweredClass"
            >
              <span
                class="mt-0.5 w-4 h-4 shrink-0 rounded flex items-center justify-center border"
                :class="answeredIds.has(q.id) ? 'bg-instrument border-instrument' : 'border-border'"
              >
                <svg
                  v-if="answeredIds.has(q.id)"
                  class="w-3 h-3 text-text-on-primary"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span class="text-xs leading-relaxed" :class="answeredIds.has(q.id) ? 'text-text-primary' : 'text-text-muted'">
                {{ q.question }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Card mode (legacy, kept for any other usage): full self-contained card -->
  <div
    v-else
    class="bg-surface border border-border p-4 md:p-6 shadow-sm"
    :class="noBg ? 'rounded-xl' : 'rounded-2xl'"
  >
    <button
      v-if="collapsible"
      @click="showDetails = !showDetails"
      class="w-full flex items-center justify-between gap-2"
    >
      <p class="text-xs font-medium text-text-muted">{{ title }}</p>
      <svg
        class="w-4 h-4 text-text-muted transition-transform duration-200"
        :class="{ 'rotate-180': showDetails }"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <p v-else class="text-xs font-medium text-text-muted mb-4">{{ title }}</p>

    <Transition name="expand">
      <div v-if="!collapsible || showDetails" class="space-y-4" :class="{ 'mt-4': collapsible }">
        <div
          v-for="section in detailSections"
          :key="section.key"
          class="border border-border rounded-xl p-4"
          :class="[noBg ? 'bg-surface-muted avoid-break' : '']"
        >
          <div class="flex items-center gap-2 mb-4">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: section.dot }"></span>
            <span class="text-base font-semibold text-text-primary">{{ section.label }}</span>
            <span class="text-sm text-text-muted">({{ section.code }})</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              v-for="col in section.columns"
              :key="col.key"
              class="md:border-l md:border-border md:pl-6 md:first:border-l-0 md:first:pl-0"
            >
              <p class="text-xs font-semibold text-text-secondary mb-2">{{ col.label }}</p>
              <div class="space-y-2">
                <div
                  v-for="q in col.questions"
                  :key="q.id"
                  class="flex items-start gap-2.5 rounded-lg p-2.5 border transition-colors"
                  :class="answeredIds.has(q.id) ? 'border-instrument bg-instrument-soft' : unansweredClass"
                >
                  <span
                    class="mt-0.5 w-4 h-4 shrink-0 rounded flex items-center justify-center border"
                    :class="answeredIds.has(q.id) ? 'bg-instrument border-instrument' : 'border-border'"
                  >
                    <svg
                      v-if="answeredIds.has(q.id)"
                      class="w-3 h-3 text-text-on-primary"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span class="text-xs leading-relaxed" :class="answeredIds.has(q.id) ? 'text-text-primary' : 'text-text-muted'">
                    {{ q.question }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  detailSections: { type: Array, required: true },
  answeredIds: { type: Set, required: true },
  collapsible: { type: Boolean, default: false },
  title: { type: String, default: 'Rincian jawaban' },
  noBg: { type: Boolean, default: false },
  unansweredClass: { type: String, default: 'border-border bg-surface-muted/40' },
  bare: { type: Boolean, default: false },
  avoidBreak: { type: Boolean, default: false },
})

const showDetails = ref(false)
</script>