<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(item => 
        typeof item.value === 'number' && 
        typeof item.name === 'string' &&
        typeof item.color === 'string'
      )
    }
  },
  radius: {
    type: Array,
    default: () => ['40%', '68%']
  },
  center: {
    type: Array,
    default: () => ['50%', '50%']
  }
})

const chartRef = ref(null)
let chart = null

const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  updateChart()
}

const updateChart = () => {
  if (!chart) return

  chart.setOption({
    backgroundColor: '#f8f1e6',
    tooltip: { trigger: 'item' },
    series: [
      {
        name: '收入来源',
        type: 'pie',
        radius: props.radius,
        center: props.center,
        label: {
          show: true,
          position: 'inside',
          formatter: '{name|{b}}\n{percent|{d}%}',
          rich: {
            name: { align: 'center', fontSize: 12, fontWeight: 'bold', color: '#333', lineHeight: 16 },
            percent: { align: 'center', fontSize: 12, color: '#333', lineHeight: 16 }
          }
        },
        labelLine: { show: false },
        data: props.data.map(item => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: item.color }
        }))
      }
    ]
  })
}

watch(() => props.data, updateChart, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chart?.resize())
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
</style>
