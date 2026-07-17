<template>
  <div class="max-w-sm mx-auto mt-10 p-6 bg-slate-100 min-h-screen">
    <button
      @click="handlePrint"
      class="print:hidden mb-5 px-5 py-2.5 rounded-lg text-white font-semibold
             bg-gradient-to-br from-indigo-500 to-violet-500
             shadow-lg shadow-indigo-500/40 hover:scale-105 transition-transform"
    >
      🖨️ Test Print
    </button>

    <div class="print-area bg-white rounded-2xl p-6 shadow-xl border border-dashed border-slate-300">
      <div class="text-center mb-3">
        <h2 class="text-xl font-bold bg-gradient-to-r from-pink-500 to-indigo-500 bg-clip-text text-transparent print:bg-none print:text-indigo-600">
          Toko Contoh Jaya
        </h2>
        <p class="text-xs text-slate-500 mt-1">Jl. Testing No. 123, Malang</p>
      </div>

      <div class="border-t-2 border-dotted border-slate-400 my-3"></div>

      <div
        v-for="item in items"
        :key="item.name"
        class="flex justify-between text-sm text-slate-700 py-1"
      >
        <span>{{ item.name }}</span>
        <span>Rp{{ item.price.toLocaleString('id-ID') }}</span>
      </div>

      <div class="border-t-2 border-dotted border-slate-400 my-3"></div>

      <div class="flex justify-between font-bold text-slate-900 mt-2">
        <span>Total</span>
        <span class="text-green-600">Rp{{ total.toLocaleString('id-ID') }}</span>
      </div>

      <span class="inline-block mt-4 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-green-100 text-green-600">
        LUNAS
      </span>

      <p class="text-center text-xs italic text-slate-400 mt-4">
        Terima kasih sudah belanja ✨
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const items = [
  { name: 'Item A', price: 10000 },
  { name: 'Item B', price: 15000 },
]
const total = computed(() => items.reduce((a, b) => a + b.price, 0))

function handlePrint() {
  window.print()
}
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  .print-area, .print-area * {
    visibility: visible;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>