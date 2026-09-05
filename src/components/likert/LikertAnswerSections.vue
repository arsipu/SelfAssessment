<template>
	<div v-if="variant === 'list'" class="space-y-5">
		<div v-for="section in sectionsWithGlobalIndex" :key="section.key">
			<div class="flex items-center gap-2 mb-2.5">
				<span class="w-1.5 h-1.5 rounded-full bg-text-muted"></span>
				<span class="text-xs font-medium text-black-secondary">{{
					section.label
				}}</span>
			</div>
			<div class="space-y-2">
				<div
					v-for="(item, i) in section.items"
					:key="item.questionId"
					class="flex items-start justify-between gap-3 py-2.5 px-3 rounded-lg bg-surface-muted"
				>
					<p class="text-xs md:text-sm text-black leading-relaxed flex-1">
						<span class="text-black-secondary mr-1">{{ section.globalStartIndex + i + 1 }}.</span
						>{{ item.questionText }}
					</p>
					<span
						class="shrink-0 text-[11px] md:text-xs font-semibold px-2 py-1 rounded-md bg-surface border border-border text-black whitespace-nowrap"
					>
						{{ item.answerLabel }}
					</span>
				</div>
			</div>
		</div>
	</div>

	<div v-else>
		<div
			v-for="(section, index) in sectionsWithGlobalIndex"
			:key="section.key"
			class="avoid-break"
			:class="index < sectionsWithGlobalIndex.length - 1 ? 'border-b border-border' : ''"
		>
			<div class="pt-4 md:pt-6 pb-2 flex items-center gap-2">
				<h2 class="text-xs md:text-sm font-medium text-black">
					{{ section.label }}
				</h2>
			</div>
			<div class="overflow-x-auto pb-4 md:pb-6">
				<table
					class="w-full text-left border-collapse table-fixed text-xs md:text-sm"
				>
					<thead>
						<tr>
							<th
								class="w-[10%] md:w-[8%] px-3 py-2 text-xs md:text-sm font-normal text-black-secondary"
							>
								No
							</th>
							<th
								class="w-[60%] md:w-[50%] px-3 py-2 text-xs md:text-sm font-normal text-black-secondary"
							>
								Pertanyaan
							</th>
							<th
								class="w-[30%] px-3 py-2 text-xs md:text-sm font-normal text-black-secondary"
							>
								Jawaban
							</th>
						</tr>
					</thead>

					<tbody class="bg-surface">
						<tr
							v-for="(item, itemIndex) in section.items"
							:key="item.questionId"
						>
							<td class="px-3 py-2 text-xs md:text-sm text-black-secondary">
								{{ section.globalStartIndex + itemIndex + 1 }}
							</td>
							<td class="px-3 py-2 text-xs md:text-sm text-black">
								{{ item.questionText }}
							</td>
							<td class="px-3 py-2 text-xs md:text-sm text-black-secondary">
								{{ item.answerLabel }}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
	sections: { type: Array, required: true },
	variant: { type: String, default: "list" }, // 'list' | 'table'
});

/**
 * `sections` yang diperkaya dengan `globalStartIndex` — offset kumulatif
 * jumlah item dari semua section sebelumnya, digunakan untuk penomoran
 * global (1–N) tanpa restart per section.
 *
 * @returns {Array<{ key: string, label: string, items: Array, globalStartIndex: number }>}
 */
const sectionsWithGlobalIndex = computed(() => {
	let offset = 0;
	return props.sections.map((section) => {
		const start = offset;
		offset += section.items.length;
		return { ...section, globalStartIndex: start };
	});
});
</script>
