<template>
	<div class="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-6 items-center">
		<div class="flex flex-col items-center gap-2">
			<div class="w-full max-w-[160px]">
				<RiasecHexChart
					:scores="scorePercentMap"
					:size="160"
					:label-font-size="11"
				/>
			</div>
			<p class="text-[11px] text-text-muted text-center">Diagram RIASEC</p>
		</div>
		<div>
			<p class="text-xs text-text-muted mb-1">Kode minat dominan</p>
			<div class="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
				<span
					v-for="item in displayTopCodes"
					:key="item.code"
					class="flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-lg text-primary font-semibold tracking-widest"
				>
					<span class="text-md md:text-lg leading-none">{{ item.code }}</span>
					<span
						class="text-xs md:text-sm font-medium text-black-secondary leading-tight text-center"
					>
						{{ item.label }}
					</span>
				</span>
			</div>
			<p v-if="topCodeInfo" class="text-sm text-black leading-relaxed">
				{{ topCodeInfo.description }}
			</p>
		</div>
	</div>
</template>

<script setup>
import { computed } from "vue";
import RiasecHexChart from "@/components/RiasecHexChart.vue";

const props = defineProps({
	topCode: { type: String, required: true },
	topCodeInfo: { type: Object, default: null },
	scorePercentMap: { type: Object, required: true },
	topCodesInfo: { type: Array, default: () => [] },
});

// 3 kategori tertinggi (kode + label). Fallback: pecah topCode per huruf
// bila topCodesInfo belum/tidak dikirim (mis. halaman admin).
const displayTopCodes = computed(() => {
	const items = props.topCodesInfo.length
		? props.topCodesInfo
		: (props.topCode || "").split("").map((code) => ({ code, label: code }));

	return items.slice(0, 3);
});
</script>
