<template>
  <div class="data-view">
    <h1>港股南向交易量数据</h1>
    
    <div class="date-range">
      <div class="quick-select">
        <el-button 
          v-for="days in [7, 14, 30, 60, 90, 180, 360]" 
          :key="days"
          :type="selectedDays === days ? 'primary' : 'default'"
          @click="selectDateRange(days)"
        >
          近{{ days }}天
        </el-button>
      </div>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="handleDateChange"
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
const selectedDays = ref(30) // 默认选中30天
let chart = null

const initChart = () => {
  if (chartContainer.value) {
    chart = echarts.init(chartContainer.value)
  }
}

const selectDateRange = (days) => {
  selectedDays.value = days
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  dateRange.value = [start, end]
  fetchData()
}

const handleDateChange = () => {
  selectedDays.value = null // 手动选择日期时，清除快捷选择的选中状态
  fetchData()
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

  const dates = data.map(item => item.date).reverse()
  const totalVolume = data.map(item => (item.totalVolume / 100).toFixed(2)).reverse()
  const todayNetBuyVolume = data.map(item => (item.todayNetBuyVolume / 100).toFixed(2)).reverse()
  const todayVolume = data.map(item => (item.todayVolume / 100).toFixed(2)).reverse()

  const option = {
    title: {
      text: '港股南向交易量趋势'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['南向累计净买入额(亿)', '南向今日交易量(亿)', '南向今日净买入额(亿)']
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
        name: '南向累计净买入额(亿)',
        type: 'line',
        data: totalVolume
      },
      {
        name: '南向今日交易量(亿)',
        type: 'line',
        data: todayVolume
      },
      {
        name: '南向今日净买入额(亿)',
        type: 'line',
        data: todayNetBuyVolume
      },
    ]
  }

  chart.setOption(option)
}

onMounted(() => {
  initChart()
  // 设置默认日期范围为最近30天
  selectDateRange(30)

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
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quick-select {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.chart-container {
  width: 100%;
  height: 600px;
  margin-top: 20px;
}
</style> 