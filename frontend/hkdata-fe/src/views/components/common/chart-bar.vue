<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  xAxis: {
    type: Array,
    required: true
  },
  series: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(item => 
        typeof item.name === 'string' && 
        Array.isArray(item.data) &&
        typeof item.type === 'string' &&
        typeof item.color === 'string'
      )
    }
  },
  yAxis: {
    type: Object,
    default: () => ({
      min: 0,
      max: 100
    })
  },
  grid: {
    type: Object,
    default: () => ({
      left: 60,
      right: 20,
      top: 40,
      bottom: 30
    })
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
    grid: props.grid,
    backgroundColor: '#f8f1e6',
    tooltip: { trigger: 'axis' },
    legend: {
      data: props.series.map(item => ({
        name: item.name,
        icon: 'circle'
      })),
      top: 0,
      left: 40,
      itemWidth: 16,
      itemHeight: 16,
      textStyle: { fontWeight: 'bold', fontSize: 15 }
    },
    xAxis: {
      type: 'category',
      data: props.xAxis,
      axisLabel: { fontWeight: 'bold', fontSize: 15 },
      axisLine: { lineStyle: { color: '#333', width: 2 } }
    },
    yAxis: {
      type: 'value',
      min: props.yAxis.min,
      max: props.yAxis.max,
      axisLabel: { fontWeight: 'bold', fontSize: 15 },
      axisLine: { lineStyle: { color: '#333', width: 2 } },
      splitLine: { lineStyle: { color: '#e0e0e0' } }
    },
    series: props.series.map(item => ({
      name: item.name,
      type: item.type,
      data: item.data,
      smooth: false,
      symbol: 'circle',
      symbolSize: 12,
      lineStyle: { color: item.color, width: 4 },
      itemStyle: { color: item.color, borderWidth: 2, borderColor: '#fff' }
    }))
  })
}

watch(() => props.series, updateChart, { deep: true })
watch(() => props.xAxis, updateChart, { deep: true })

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
