<template>
  <div class="hk-stock-history-view">
    <h1>港股K线图测试</h1>
    
    <!-- 查询表单 -->
    <div class="query-form">
      <el-input
        v-model="stockCode"
        placeholder="请输入港股代码，如：00700"
        style="width: 200px; margin-right: 10px;"
      />
      
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :shortcuts="dateShortcuts"
        style="width: 300px; margin-right: 10px;"
        @change="handleDateChange"
      />
      
      <el-button type="primary" @click="fetchData" :loading="loading">
        查询
      </el-button>
    </div>

    <!-- 快捷日期选择 -->
    <div class="quick-date-select">
      <el-button-group>
        <el-button 
          v-for="item in quickDateOptions" 
          :key="item.days"
          :type="selectedQuickDays === item.days ? 'primary' : 'default'"
          @click="selectQuickDate(item.days)"
        >
          {{ item.label }}
        </el-button>
      </el-button-group>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <p>加载中...</p>
    </div>

    <!-- 错误信息 -->
    <div v-if="error" class="error">
      <p style="color: red;">{{ error }}</p>
    </div>

    <!-- K线图表容器 -->
    <div class="chart-container">
      <h3>K线图</h3>
      <div ref="klineChart" class="kline-chart"></div>
    </div>

    <!-- 数据信息 -->
    <div v-if="stockData" class="data-info">
      <p>股票代码: {{ stockData.code }}</p>
      <p>数据条数: {{ stockData.data ? stockData.data.length : 0 }}</p>
      <p>日期范围: {{ stockData.startDate }} 至 {{ stockData.endDate }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import axios from 'axios'
import * as echarts from 'echarts'
import moment from 'moment'

// 响应式数据
const stockCode = ref('00700')
const dateRange = ref([])
const loading = ref(false)
const error = ref('')
const stockData = ref(null)
const selectedQuickDays = ref(7)
const klineChart = ref(null)
let chart = null

// 快捷日期选项
const quickDateOptions = [
  { days: 7, label: '近7天' },
  { days: 30, label: '近30天' },
  { days: 90, label: '近3个月' },
  { days: 180, label: '近6个月' },
  { days: 365, label: '近1年' }
]

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 选择快捷日期
const selectQuickDate = (days) => {
  selectedQuickDays.value = days
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - days + 1)
  dateRange.value = [start, end]
  fetchData()
}

// 处理日期变化
const handleDateChange = () => {
  selectedQuickDays.value = null
}

// 获取数据
const fetchData = async () => {
  if (!stockCode.value) {
    error.value = '请输入股票代码'
    return
  }

  if (!dateRange.value || dateRange.value.length !== 2) {
    error.value = '请选择日期范围'
    return
  }

  loading.value = true
  error.value = ''
  stockData.value = null

  try {
    const [startDate, endDate] = dateRange.value

    const response = await axios.get('http://localhost:3000/api/hk-stock/history', {
      params: {
        code: stockCode.value,
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD')
      }
    })

    if (response.data.success) {
      stockData.value = response.data
      await nextTick()
      renderChart()
    } else {
      error.value = response.data.message || '获取数据失败'
    }
  } catch (err) {
    console.error('获取数据失败:', err)
    error.value = err.response?.data?.message || '网络请求失败'
  } finally {
    loading.value = false
  }
}

// 初始化图表
const initChart = () => {
  console.log('初始化图表...')
  if (klineChart.value) {
    chart = echarts.init(klineChart.value)
    console.log('图表初始化成功')
  } else {
    console.log('图表容器不存在')
  }
}

// 渲染图表
const renderChart = () => {
  console.log('渲染图表...')
  
  if (!chart) {
    console.log('图表不存在，重新初始化')
    initChart()
  }
  
  if (!chart || !stockData.value || !stockData.value.data) {
    console.log('图表或数据不存在')
    return
  }

  const data = stockData.value.data
  console.log('数据:', data)

  // 数据转换
  data.forEach(item => {
    item.open = Number(item.open) || 0
    item.close = Number(item.close) || 0
    item.low = Number(item.low) || 0
    item.high = Number(item.high) || 0
    item.volume = Number(item.volume) || 0
  })

  const dates = data.map(item => moment(item.date).format('MM-DD'))
  const prices = data.map(item => [item.open, item.close, item.low, item.high])

  console.log('日期:', dates)
  console.log('价格:', prices)

  const option = {
    title: {
      text: `${stockData.value.code} K线图`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        const data = params[0].data
        return `
          <div>
            <div>日期：${params[0].axisValue}</div>
            <div>开盘：¥${data[1]}</div>
            <div>收盘：¥${data[2]}</div>
            <div>最低：¥${data[3]}</div>
            <div>最高：¥${data[4]}</div>
          </div>
        `
      }
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'K线',
        type: 'candlestick',
        data: prices,
        itemStyle: {
          color: '#ec0000',
          color0: '#00da3c',
          borderColor: '#ec0000',
          borderColor0: '#00da3c'
        }
      }
    ]
  }

  try {
    chart.setOption(option)
    console.log('K线图渲染成功')
  } catch (error) {
    console.error('K线图渲染失败:', error)
  }
}

// 生命周期
onMounted(async () => {
  console.log('组件挂载')
  await nextTick()
  initChart()
  
  // 设置默认日期范围为最近7天
  selectQuickDate(7)
})
</script>

<style scoped>
.hk-stock-history-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}

.query-form {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 5px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-date-select {
  margin-bottom: 20px;
}

.loading, .error {
  margin: 20px 0;
  padding: 10px;
  text-align: center;
}

.chart-container {
  margin: 20px 0;
}

.chart-container h3 {
  margin-bottom: 10px;
  color: #333;
}

.kline-chart {
  width: 100%;
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
}

.data-info {
  margin-top: 20px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 5px;
}

.data-info p {
  margin: 5px 0;
  color: #666;
}
</style> 