<template>
	<!-- Bare mode: no wrapper, no title, no toggle — parent controls all chrome -->
	<div v-if="bare" class="space-y-4">
		<div
			v-for="section in detailSections"
			:key="section.key"
			:class="{ 'avoid-break': avoidBreak }"
		>
			<div class="flex items-center gap-2 mb-4">
				<span class="text-base font-semibold text-black">{{
					section.label
				}}</span>
				<span class="text-sm text-black">({{ section.code }})</span>
			</div>

			<!-- Tabel pernyataan per kolom (desktop) -->
			<div
				class="hidden md:block overflow-x-auto rounded-xl border border-border"
			>
				<table class="w-full text-left border-collapse table-fixed">
					<thead class="border-b border-border">
						<tr>
							<th
								v-for="col in section.columns"
								:key="col.key"
								class="px-3 md:px-4 py-2.5 text-xs md:text-sm font-medium tracking-wider"
							>
								{{ col.label }}
							</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="i in Math.max(
								...section.columns.map((c) => c.questions.length),
							)"
							:key="i"
							class="divide-x divide-border"
						>
							<td
								v-for="col in section.columns"
								:key="col.key"
								class="px-3 md:px-4 py-1 align-top"
							>
								<label
									v-if="col.questions[i - 1]"
									class="flex items-start gap-2.5 text-xs md:text-sm"
								>
									<input
										type="checkbox"
										class="mt-0.5 w-3 md:w-4 h-3 md:h-4 shrink-0"
										:checked="answeredIds.has(col.questions[i - 1].id)"
										disabled
									/>
									<span
										class="leading-relaxed"
										:class="
											answeredIds.has(col.questions[i - 1].id)
												? 'text-black-secondary'
												: 'text-black'
										"
										>{{ col.questions[i - 1].question }}</span
									>
								</label>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- Daftar pernyataan per kolom (mobile) -->
			<div
				class="md:hidden rounded-xl border border-border divide-y divide-border"
			>
				<div v-for="col in section.columns" :key="col.key" class="p-4">
					<h3 class="text-xs font-semibold uppercase tracking-wider mb-3">
						{{ col.label }}
					</h3>
					<div class="space-y-3">
						<label
							v-for="q in col.questions"
							:key="q.id"
							class="flex items-start gap-2.5 text-xs"
						>
							<input
								type="checkbox"
								class="mt-0.5 w-4 h-4 shrink-0"
								:checked="answeredIds.has(q.id)"
								disabled
							/>
							<span
								class="leading-relaxed"
								:class="
									answeredIds.has(q.id) ? 'text-black-secondary' : 'text-black'
								"
								>{{ q.question }}</span
							>
						</label>
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
			<p class="text-xs font-medium text-black">{{ title }}</p>
			<svg
				class="w-4 h-4 text-text-muted transition-transform duration-200"
				:class="{ 'rotate-180': showDetails }"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 9l-7 7-7-7"
				/>
			</svg>
		</button>
		<p v-else class="text-xs font-medium text-black mb-4">{{ title }}</p>

		<Transition name="expand">
			<div
				v-if="!collapsible || showDetails"
				class="space-y-4"
				:class="{ 'mt-4': collapsible }"
			>
				<div
					v-for="section in detailSections"
					:key="section.key"
					class="border border-border rounded-xl p-4"
					:class="[noBg ? 'bg-surface-muted avoid-break' : '']"
				>
					<div class="flex items-center gap-2 mb-4">
						<span
							class="w-2.5 h-2.5 rounded-full shrink-0"
							:style="{ backgroundColor: section.dot }"
						></span>
						<span class="text-base font-semibold text-black">{{
							section.label
						}}</span>
						<span class="text-sm text-black">({{ section.code }})</span>
					</div>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div
							v-for="col in section.columns"
							:key="col.key"
							class="md:border-l md:border-border md:pl-6 md:first:border-l-0 md:first:pl-0"
						>
							<p class="text-xs font-semibold text-black mb-2">
								{{ col.label }}
							</p>
							<div class="space-y-2">
								<div
									v-for="q in col.questions"
									:key="q.id"
									class="flex items-start gap-2.5 rounded-lg p-2.5 border transition-colors"
									:class="
										answeredIds.has(q.id) ? 'border-primary' : unansweredClass
									"
								>
									<span
										class="mt-0.5 w-4 h-4 shrink-0 rounded flex items-center justify-center border"
										:class="
											answeredIds.has(q.id) ? 'border-black' : 'border-border'
										"
									>
										<svg
											v-if="answeredIds.has(q.id)"
											class="w-3 h-3 text-text-on-primary"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											stroke-width="3"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M5 13l4 4L19 7"
											/>
										</svg>
									</span>
									<span class="text-xs leading-relaxed text-black">
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
import { ref } from "vue";

defineProps({
	detailSections: { type: Array, required: true },
	answeredIds: { type: Set, required: true },
	collapsible: { type: Boolean, default: false },
	title: { type: String, default: "Rincian jawaban" },
	noBg: { type: Boolean, default: false },
	unansweredClass: {
		type: String,
		default: "border-border bg-surface-muted/40",
	},
	bare: { type: Boolean, default: false },
	avoidBreak: { type: Boolean, default: false },
});

const showDetails = ref(false);
</script>
