<template>
  <div v-if="variant === 'list'" class="space-y-5">
    <div v-for="section in sections" :key="section.key">
      <div class="flex items-center gap-2 mb-2.5">
        <span class="w-1.5 h-1.5 rounded-full bg-text-muted"></span>
        <span class="text-xs font-medium text-text-secondary">{{ section.label }}</span>
      </div>
      <div class="space-y-2">
        <div
          v-for="(item, i) in section.items"
          :key="item.questionId"
          class="flex items-start justify-between gap-3 py-2.5 px-3 rounded-lg bg-surface-muted"
        >
          <p class="text-sm text-text-primary leading-relaxed flex-1">
            <span class="text-text-muted mr-1">{{ i + 1 }}.</span>{{ item.questionText }}
          </p>
          <span class="shrink-0 text-[11px] md:text-xs font-semibold px-2 py-1 rounded-md bg-surface border border-border text-text-primary whitespace-nowrap">
            {{ item.answerLabel }}
          </span>
        </div>
      </div>
    </div>
  </div>

  <div v-else>
    <div
      v-for="(section, index) in sections"
      :key="section.key"
      class="avoid-break"
      :class="index < sections.length - 1 ? 'border-b border-border' : ''"
    >
      <div class="pt-4 md:pt-6 pb-2 flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-text-muted shrink-0"></span>
        <h2 class="text-sm font-medium text-text-primary">{{ section.label }}</h2>
      </div>
      <div class="overflow-x-auto pb-4 md:pb-6">
        <table class="w-full text-left border-collapse table-fixed text-sm">
          <thead>
            <tr class="border-b border-border">
              <th class="w-[8%] px-3 py-2 text-[11px] font-normal text-text-muted">No</th>
              <th class="w-[50%] px-3 py-2 text-[11px] font-normal text-text-muted">Pertanyaan</th>
              <th class="w-[30%] px-3 py-2 text-[11px] font-normal text-text-muted">Jawaban</th>
              <th class="w-[12%] px-3 py-2 text-[11px] font-normal text-text-muted">Poin</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-border">
            <tr v-for="(item, itemIndex) in section.items" :key="item.questionId">
              <td class="px-3 py-2 text-text-secondary">{{ itemIndex + 1 }}</td>
              <td class="px-3 py-2 text-text-primary">{{ item.questionText }}</td>
              <td class="px-3 py-2 text-text-secondary">{{ item.answerLabel }}</td>
              <td class="px-3 py-2 text-text-secondary">{{ item.point }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  sections: { type: Array, required: true },
  variant: { type: String, default: 'list' }, // 'list' | 'table'
})
</script>