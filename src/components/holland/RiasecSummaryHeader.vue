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
			<p
				class="text-md md:tex-xl font-semibold tracking-widest text-primary mb-1"
			>
				{{ topCodesString }}
			</p>
			<p
				class="text-xs md:text-sm font-medium text-black-secondary leading-snug mb-2"
			>
				{{ topCodesLabel }}
			</p>
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

// Kode digabung jadi satu string, mis. "SCR"
const topCodesString = computed(() => {
	return displayTopCodes.value.map((item) => item.code).join("");
});

// Label digabung dengan koma, mis. "Sosial, Konvensional, Realistis"
const topCodesLabel = computed(() => {
	return displayTopCodes.value.map((item) => item.label).join(", ");
});
</script>
