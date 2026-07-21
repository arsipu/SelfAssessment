<template>
  <!-- Wrapper dengan ukuran tetap untuk menjaga konsistensi, terutama saat di-print -->
  <div 
    class="relative mx-auto flex items-center justify-center"
    :style="{ width: size + 'px', height: size + 'px' }"
  >
    <Radar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Radar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'

// Register elemen Chart.js yang dibutuhkan untuk Radar Chart
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

const props = defineProps({
  scores: {
    type: Object,
    default: () => ({})
  },
  size: {
    type: Number,
    default: 320
  },
  labelFontSize: {
    type: Number,
    default: 15
  }
})

// Urutan sudut heksagon
const order = ['R', 'I', 'A', 'S', 'E', 'C']

// Setup Data Chart
const chartData = computed(() => {
  return {
    labels: order,
    datasets: [
      {
        label: 'Skor',
        data: order.map(code => props.scores[code] || 0),
        
        // CATATAN WARNA: 
        // Chart.js menggunakan canvas, jadi tidak bisa baca class Tailwind seperti 'fill-primary'.
        // Kamu harus menggunakan hex code atau rgb/rgba di sini. 
        // Ganti warna di bawah ini agar match dengan warna tema 'instrument' kamu.
        backgroundColor: 'rgba(59, 130, 246, 0.15)', // Area dalam (contoh: biru transparan)
        borderColor: '#3B82F6', // Garis pinggir polygon
        pointBackgroundColor: '#3B82F6', // Warna titik di setiap sudut
        
        borderWidth: 2,
        pointRadius: 4, // Ukuran titik (menggantikan <circle r="3.5">)
        pointHoverRadius: 6
      }
    ]
  }
})

// Setup Opsi Chart
const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false, // Membiarkan div wrapper yang mengatur ukuran
    plugins: {
      legend: {
        display: false // Sembunyikan tulisan legend karena cuma ada 1 data
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => ` ${context.raw}%`
        }
      }
    },
    scales: {
      r: {
        min: 0,
        max: 100, // Karena skor dalam persentase, set max 100
        ticks: {
          stepSize: 25, // Membuat jaring / grid setiap kelipatan 25%
          display: false // Sembunyikan angka 0, 25, 50, 100 di garis jaring
        },
        pointLabels: {
          font: {
            size: props.labelFontSize,
            weight: 'bold',
            family: "Inter, ui-sans-serif, system-ui, sans-serif" // Sesuaikan font aplikasi
          },
          color: '#374151' // Warna label teks (sesuaikan dengan text-primary)
        },
        grid: {
          color: '#E5E7EB', // Warna garis jaring polygon (pengganti class 'stroke-border')
          circular: false // False = bentuk polygon/hexagon. True = bentuk lingkaran
        },
        angleLines: {
          color: '#E5E7EB', // Warna garis axis dari tengah ke ujung huruf
        }
      }
    }
  }
})
</script>