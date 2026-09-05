<template>
	<div v-if="variant === 'list'" class="space-y-5">
		<div v-for="section in sectionsWithGlobalIndex" :key="section.key">
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
					<template
						v-for="section in sectionsWithGlobalIndex"
						:key="section.key"
					>
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
					</template>
				</tbody>
			</table>
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
