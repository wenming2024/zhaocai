<template>
  <div class="hk-stock-history-view">
    <h1>港股历史交易数据查询</h1>
    
    <!-- 查询表单 -->
    <el-form :inline="true" class="query-form" @submit.prevent="fetchData">
      <el-form-item label="股票代码">
        <el-input
          v-model="stockCode"
          placeholder="请输入港股代码，如：00700"
          style="width: 200px"
          clearable
        />
      </el-form-item>
      
      <el-form-item label="日期区间">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="dateShortcuts"
          @change="handleDateChange"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="fetchData" :loading="loading">
          查询
        </el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>

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
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- 错误信息 -->
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      closable
      @close="error = ''"
    />

    <!-- 数据展示 -->
    <div v-if="!loading && stockData" class="data-container">
      <!-- 统计信息卡片 -->
      <!-- <div class="stats-cards">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-title">最高价</div>
              <div class="stat-value">¥{{ stockData.stats.highestPrice }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-title">最低价</div>
              <div class="stat-value">¥{{ stockData.stats.lowestPrice }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-title">上涨天数</div>
              <div class="stat-value up">{{ stockData.stats.upDays }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-title">下跌天数</div>
              <div class="stat-value down">{{ stockData.stats.downDays }}</div>
            </el-card>
          </el-col>
        </el-row>
      </div> -->

      <!-- K线图表 -->
      <div class="chart-container">
        <h3>K线走势图</h3>
        <div ref="klineChart" class="kline-chart"></div>
      </div>

      <!-- 数据表格 -->
      <div class="table-container">
        <h3>历史数据明细</h3>
        <el-table
          :data="stockData.data"
          style="width: 100%"
          height="400"
          stripe
          border
        >
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="open" label="开盘价" width="100">
            <template #default="scope">
              ¥{{ scope.row.open }}
            </template>
          </el-table-column>
          <el-table-column prop="high" label="最高价" width="100">
            <template #default="scope">
              ¥{{ scope.row.high }}
            </template>
          </el-table-column>
          <el-table-column prop="low" label="最低价" width="100">
            <template #default="scope">
              ¥{{ scope.row.low }}
            </template>
          </el-table-column>
          <el-table-column prop="close" label="收盘价" width="100">
            <template #default="scope">
              ¥{{ scope.row.close }}
            </template>
          </el-table-column>
          <el-table-column prop="change_rate" label="涨跌幅" width="100">
            <template #default="scope">
              <span :class="getPriceChangeClass(scope.row.change_rate)">
                {{ scope.row.change_rate > 0 ? '+' : '' }}{{ scope.row.change_rate }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="volume" label="成交量" width="120">
            <template #default="scope">
              {{ formatVolume(scope.row.volume) }}
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="成交额" width="120">
            <template #default="scope">
              {{ formatAmount(scope.row.amount) }}
            </template>
          </el-table-column>
          <el-table-column prop="turnover_rate" label="换手率" width="100">
            <template #default="scope">
              {{ scope.row.turnover_rate }}%
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 图表容器 - 始终存在但根据状态显示 -->
    <div v-if="!stockData" class="chart-container">
      <h3>K线走势图</h3>
      <div ref="klineChart" class="kline-chart" style="display: flex; align-items: center; justify-content: center; color: #909399;">
        <span>请输入股票代码和日期范围进行查询</span>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && !stockData && !error" class="empty-state">
      <el-empty description="请输入股票代码和日期范围进行查询" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import axios from 'axios'
import * as echarts from 'echarts'
import moment from 'moment'

// 响应式数据
const stockCode = ref('')
const dateRange = ref([])
const loading = ref(false)
const error = ref('')
const stockData = ref(null)
const selectedQuickDays = ref(30)
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

// 初始化图表
const initChart = () => {
  console.log('initChart called, klineChart.value:', klineChart.value)
  
  if (klineChart.value) {
    // 确保容器有尺寸
    const rect = klineChart.value.getBoundingClientRect()
    console.log('容器尺寸:', rect.width, 'x', rect.height)
    
    if (rect.width > 0 && rect.height > 0) {
      chart = echarts.init(klineChart.value)
      console.log('图表初始化成功')
    } else {
      console.log('容器尺寸为0，无法初始化图表')
    }
  } else {
    console.log('图表容器未找到，klineChart.value:', klineChart.value)
  }
}

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
  if (!stockCode.value || !dateRange.value || dateRange.value.length !== 2) {
    error.value = '请填写完整的查询条件'
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
      // 延迟一点时间确保DOM完全渲染
      setTimeout(() => {
        renderChart()
      }, 100)
    } else {
      error.value = response.data.message || '获取数据失败'
    }
  } catch (err) {
    console.error('获取数据失败:', err)
    error.value = err.response?.data?.message || '网络请求失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 渲染图表
const renderChart = () => {
  console.log('renderChart called, chart:', chart, 'stockData:', stockData.value)
  console.log('klineChart.value:', klineChart.value)
  
  // 如果chart不存在，尝试重新初始化
  if (!chart) {
    console.log('Chart不存在，尝试重新初始化')
    initChart()
  }
  
  // 如果容器重新渲染了，需要重新初始化图表
  if (chart && klineChart.value && !chart.getDom()) {
    console.log('容器重新渲染，重新初始化图表')
    chart.dispose()
    chart = null
    initChart()
  }
  
  if (!chart || !stockData.value) {
    console.log('Chart或数据不存在，无法渲染')
    return
  }

  const data = stockData.value.data
  if (!data || data.length === 0) {
    console.log('数据为空，无法渲染图表')
    return
  }

  const dates = data.map(item => item.date)
  const prices = data.map(item => [item.open, item.close, item.low, item.high])
  const volumes = data.map(item => item.volume)

  console.log('准备渲染图表，数据长度:', data.length)

  const option = {
    title: {
      text: `${stockData.value.code} K线图`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: function (params) {
        const data = params[0].data
        const volume = params[1]?.data || 0
        return `
          <div>
            <div>日期：${params[0].axisValue}</div>
            <div>开盘：¥${data[1]}</div>
            <div>收盘：¥${data[2]}</div>
            <div>最低：¥${data[3]}</div>
            <div>最高：¥${data[4]}</div>
            <div>成交量：${formatVolume(volume)}</div>
          </div>
        `
      }
    },
    legend: {
      data: ['K线', '成交量'],
      top: 30
    },
    grid: [
      {
        left: '10%',
        right: '10%',
        height: '60%'
      },
      {
        left: '10%',
        right: '10%',
        top: '75%',
        height: '20%'
      }
    ],
    xAxis: [
      {
        type: 'category',
        data: dates,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax'
      },
      {
        type: 'category',
        gridIndex: 1,
        data: dates,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax'
      }
    ],
    yAxis: [
      {
        scale: true,
        splitArea: {
          show: true
        }
      },
      {
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false }
      }
    ],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0, 1],
        start: 0,
        end: 100
      },
      {
        show: true,
        xAxisIndex: [0, 1],
        type: 'slider',
        bottom: '0%',
        start: 0,
        end: 100
      }
    ],
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
      },
      {
        name: '成交量',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumes
      }
    ]
  }

  try {
    chart.setOption(option)
    console.log('图表渲染成功')
  } catch (error) {
    console.error('图表渲染失败:', error)
  }
}

// 重置表单
const resetForm = () => {
  stockCode.value = ''
  dateRange.value = []
  selectedQuickDays.value = 30
  stockData.value = null
  error.value = ''
}

// 格式化成交量
const formatVolume = (volume) => {
  if (volume >= 100000000) {
    return (volume / 100000000).toFixed(2) + '亿'
  } else if (volume >= 10000) {
    return (volume / 10000).toFixed(2) + '万'
  }
  return volume.toString()
}

// 格式化成交额
const formatAmount = (amount) => {
  if (amount >= 100000000) {
    return '¥' + (amount / 100000000).toFixed(2) + '亿'
  } else if (amount >= 10000) {
    return '¥' + (amount / 10000).toFixed(2) + '万'
  }
  return '¥' + amount.toString()
}

// 获取价格变化样式类
const getPriceChangeClass = (changeRate) => {
  if (changeRate > 0) return 'up'
  if (changeRate < 0) return 'down'
  return ''
}

// 生命周期
onMounted(async () => {
  console.log('组件挂载，klineChart.value:', klineChart.value)
  
  // 等待DOM更新完成后再初始化图表
  await nextTick()
  initChart()
  
  // 设置默认日期范围为最近30天
  selectQuickDate(30)

  window.addEventListener('resize', () => {
    if (chart) {
      chart.resize()
    }
  })
})

onUnmounted(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
  window.removeEventListener('resize', () => {
    if (chart) {
      chart.resize()
    }
  })
})
</script>

<style scoped>
.hk-stock-history-view {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 24px;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.query-form {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.quick-date-select {
  margin-bottom: 20px;
}

.loading-container {
  margin: 40px 0;
}

.data-container {
  margin-top: 20px;
}

.stats-cards {
  margin-bottom: 30px;
}

.stat-card {
  text-align: center;
  border-radius: 8px;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-value.up {
  color: #f56c6c;
}

.stat-value.down {
  color: #67c23a;
}

.change-rate {
  font-size: 14px;
  margin-left: 8px;
}

.chart-container {
  margin-bottom: 30px;
}

.chart-container h3 {
  margin-bottom: 16px;
  color: #303133;
}

.kline-chart {
  width: 100%;
  height: 500px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.table-container h3 {
  margin-bottom: 16px;
  color: #303133;
}

.empty-state {
  margin: 60px 0;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hk-stock-history-view {
    padding: 16px;
  }
  
  .query-form {
    padding: 16px;
  }
  
  .kline-chart {
    height: 300px;
  }
}
</style> 