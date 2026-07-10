<template>
  <svg :viewBox="`0 0 ${SIZE} ${SIZE}`" class="w-full h-auto">
    <!-- grid hexagon referensi -->
    <polygon
      v-for="(points, i) in gridPolygons"
      :key="'grid-' + i"
      :points="points"
      class="fill-none stroke-border"
      stroke-width="1"
    />

    <!-- garis dari tengah ke tiap sudut -->
    <line
      v-for="code in order"
      :key="'axis-' + code"
      :x1="center"
      :y1="center"
      :x2="hexPoint(code, 1).x"
      :y2="hexPoint(code, 1).y"
      class="stroke-border"
      stroke-width="1"
    />

    <!-- polygon skor asli respondent -->
    <polygon
      :points="scorePolygonPoints"
      class="fill-instrument/10 stroke-instrument"
      stroke-width="2"
      stroke-linejoin="round"
    />

    <!-- titik di tiap sudut skor -->
    <circle
      v-for="code in order"
      :key="'dot-' + code"
      :cx="hexPoint(code, (scoreMap[code] || 0) / 100).x"
      :cy="hexPoint(code, (scoreMap[code] || 0) / 100).y"
      r="3.5"
      class="fill-instrument"
    />

    <!-- label huruf R I A S E C -->
    <g class="fill-text-primary font-semibold" :style="{ fontSize: labelFontSize + 'px' }">
      <text
        v-for="item in hexLabels"
        :key="'label-' + item.code"
        :x="item.x"
        :y="item.y"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        {{ item.code }}
      </text>
    </g>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

// props: `scores` berupa object persentase per kategori, contoh:
// { R: 82, I: 40, A: 65, S: 20, E: 55, C: 30 }
const props = defineProps({
  scores: {
    type: Object,
    default: () => ({}),
  },
  size: {
    type: Number,
    default: 320,
  },
  labelFontSize: {
    type: Number,
    default: 15,
  },
})

// const SIZE = props.size
const order = ['R', 'I', 'A', 'S', 'E', 'C']
const angles = { R: -90, I: -30, A: 30, S: 90, E: 150, C: 210 }

const scoreMap = computed(() => props.scores || {})
const SIZE = computed(() => props.size)
const center = computed(() => SIZE.value / 2)
const maxRadius = computed(() => SIZE.value * 0.38)

function hexPoint(code, fraction) {
  const rad = (angles[code] * Math.PI) / 180
  const r = maxRadius.value * fraction
  return {
    x: center.value + r * Math.cos(rad),
    y: center.value + r * Math.sin(rad),
  }
}

function pointsToString(points) {
  return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
}

const gridPolygons = computed(() =>
  [0.25, 0.5, 0.75, 1].map((fraction) =>
    pointsToString(order.map((code) => hexPoint(code, fraction)))
  )
)

const scorePolygonPoints = computed(() =>
  pointsToString(order.map((code) => hexPoint(code, (scoreMap.value[code] || 0) / 100)))
)

const hexLabels = computed(() =>
  order.map((code) => {
    const p = hexPoint(code, 1.15)
    return { code, x: p.x, y: p.y }
  })
)
</script>