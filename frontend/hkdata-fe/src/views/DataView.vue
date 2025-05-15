<template>
  <div class="data-view">
    <h1>港股交易量数据</h1>
    
    <div class="date-range">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="fetchData"
      />
    </div>

    <div class="chart-container" ref="chartContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import * as echarts from 'echarts'
import moment from 'moment'

const API_BASE_URL = 'http://localhost:3000/api'
const chartContainer = ref(null)
const dateRange = ref([])
let chart = null

const initChart = () => {
  if (chartContainer.value) {
    chart = echarts.init(chartContainer.value)
  }
}

const fetchData = async () => {
  if (!dateRange.value || dateRange.value.length !== 2) return

  try {
    const [startDate, endDate] = dateRange.value
    const response = await axios.get(`${API_BASE_URL}/data/range`, {
      params: {
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD')
      }
    })

    updateChart(response.data)
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

const updateChart = (data) => {
  if (!chart) return

  const dates = data.map(item => item.date)
  const totalVolume = data.map(item => item.totalVolume)
  const hkConnectVolume = data.map(item => item.hkConnectVolume)
  const shConnectVolume = data.map(item => item.shConnectVolume)
  const szConnectVolume = data.map(item => item.szConnectVolume)

  const option = {
    title: {
      text: '港股交易量趋势'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['总交易量', '港股通', '沪股通', '深股通']
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value',
      name: '交易量'
    },
    series: [
      {
        name: '总交易量',
        type: 'line',
        data: totalVolume
      },
      {
        name: '港股通',
        type: 'line',
        data: hkConnectVolume
      },
      {
        name: '沪股通',
        type: 'line',
        data: shConnectVolume
      },
      {
        name: '深股通',
        type: 'line',
        data: szConnectVolume
      }
    ]
  }

  chart.setOption(option)
}

onMounted(() => {
  initChart()
  // 设置默认日期范围为最近30天
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  dateRange.value = [start, end]
  fetchData()

  window.addEventListener('resize', () => {
    chart?.resize()
  })
})

onUnmounted(() => {
  chart?.dispose()
  window.removeEventListener('resize', () => {
    chart?.resize()
  })
})
</script>

<style scoped>
.data-view {
  padding: 20px;
}

.date-range {
  margin: 20px 0;
}

.chart-container {
  width: 100%;
  height: 600px;
  margin-top: 20px;
}
</style> 