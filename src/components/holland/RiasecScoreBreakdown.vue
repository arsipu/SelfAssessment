<template>
  <div :class="variant === 'table' ? '' : 'bg-surface border border-border rounded-2xl p-5 md:p-6 shadow-sm'">
    <p v-if="title" class="text-xs font-medium text-text-secondary mb-3">{{ title }}</p>

    <table v-if="variant === 'table'" class="w-full text-sm border-collapse">
      <thead>
        <tr class="border-b border-border">
          <th class="text-left py-1.5 px-1 text-[11px] font-normal text-text-muted">Kategori</th>
          <th class="text-left py-1.5 px-1 text-[11px] font-normal text-text-muted w-[45%]">Proporsi</th>
          <th class="text-right py-1.5 px-1 text-[11px] font-normal text-text-muted">Skor</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in scoreBreakdown" :key="row.code" class="border-b border-border last:border-b-0">
          <td class="py-2 px-1 font-medium text-text-primary">
            {{ getLabel(row.code) }} <span class="text-text-muted font-normal">({{ row.code }})</span>
          </td>
          <td class="py-2 px-1">
            <div class="h-1.5 bg-surface-muted rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300 bg-instrument"
                :style="{ width: row.percentage + '%' }"
              ></div>
            </div>
          </td>
          <td class="py-2 px-1 text-right text-text-secondary whitespace-nowrap">
            {{ row.count }}/{{ row.total }} · {{ row.percentage }}%
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="space-y-4">
      <div v-for="row in scoreBreakdown" :key="row.code">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-sm font-medium text-text-primary">
            {{ getLabel(row.code) }} ({{ row.code }})
          </span>
          <span class="text-xs text-text-muted">
            {{ row.count }}/{{ row.total }} · {{ row.percentage }}%
          </span>
        </div>
        <div class="h-1.5 bg-surface-muted rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="row.isTop ? 'bg-instrument' : 'bg-border'"
            :style="{ width: row.percentage + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <p v-if="variant !== 'table'" class="text-[11px] text-text-muted mt-4 leading-relaxed">
      Persentase dihitung dari jumlah pernyataan yang dipilih dibagi total pernyataan pada
      kategori tersebut, karena jumlah pernyataan tiap kategori tidak sama.
    </p>

    <slot name="after-description" />
  </div>
</template>

<script setup>
defineProps({
  scoreBreakdown: { type: Array, required: true },
  title: { type: String, default: 'Rincian skor per kategori' },
  getLabel: { type: Function, default: (code) => code },
  variant: { type: String, default: 'card' }, // 'card' | 'table'
})
</script>