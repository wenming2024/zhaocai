<template>
  <div class="chengjiao-date-view">
    <el-form :inline="true" @submit.prevent="fetchData">
      <el-form-item label="股票代码">
        <el-select
          v-model="code"
          filterable
          remote
          reserve-keyword
          placeholder="输入代码/名称"
          :remote-method="fetchCodeSug"
          :loading="sugLoading"
          style="width: 220px"
          @scroll-bottom="loadMoreSug"
        >
          <el-option
            v-for="item in codeSugList"
            :key="item.security_code"
            :label="`${item.security_code} ${item.security_name}`"
            :value="item.security_code"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="日期区间">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="fetchData">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button-group>
          <el-button @click="selectQuickRange(7)">近7天</el-button>
          <el-button @click="selectQuickRange(30)">1个月</el-button>
          <el-button @click="selectQuickRange(90)">3个月</el-button>
        </el-button-group>
      </el-form-item>
    </el-form>
    <div ref="chartRef" class="bar-chart"></div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import axios from 'axios'
import * as echarts from 'echarts'
import moment from 'moment'

const code = ref('')
const dateRange = ref([])
const chartRef = ref(null)
let chart = null
const codeSugList = ref([])
const sugLoading = ref(false)
const sugPage = ref(1)
const sugTotal = ref(0)
const sugKeyword = ref('')

const selectQuickRange = (days) => {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - days + 1)
  dateRange.value = [start, end]
  fetchData()
}

const fetchData = async () => {
  if (!code.value || !dateRange.value || dateRange.value.length !== 2) return
  // 日期格式化为YYYY-MM-DD
  const [startDate, endDate] = dateRange.value.map((date) =>
    moment(date).format("YYYY-MM-DD")
  );
  const res = await axios.get(
    "http://localhost:3000/api/data/hk-net-buy-amt",
    {
      params: {
        code: code.value,
        startDate,
        endDate,
      },
    }
  );
  renderChart(res.data)
}

const fetchCodeSug = async (query) => {
  sugLoading.value = true
  sugPage.value = 1
  sugKeyword.value = query
  const { data } = await axios.get('http://localhost:3000/api/data/chengjiao/sug', {
    params: { keyword: query, page: 1, pageSize: 20 }
  })
  codeSugList.value = data.list
  sugTotal.value = data.total
  sugLoading.value = false
}

const loadMoreSug = async () => {
  if (codeSugList.value.length >= sugTotal.value) return
  sugLoading.value = true
  sugPage.value += 1
  const { data } = await axios.get('http://localhost:3000/api/data/chengjiao/sug', {
    params: { keyword: sugKeyword.value, page: sugPage.value, pageSize: 20 }
  })
  codeSugList.value = [...codeSugList.value, ...data.list]
  sugLoading.value = false
}

const renderChart = (data) => {
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }
  // 日期格式化为YYYY-MM-DD
  const dates = data.map((item) => moment(item.trade_date).format("YYYY-MM-DD"));
  // 净买入量，格式化到亿，保留小数点后1位
  const values = data.map((item) => (item.hk_net_buyamt / 100000000).toFixed(1));
  // 股价，保留两位小数
  const prices = data.map((item) => item.close_price ? Number(item.close_price).toFixed(2) : null);
  chart.setOption({
    title: { text: "南向净买入量-" + data[0]?.security_name },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: dates },
    yAxis: [
      {
        type: "value",
        name: "净买入量（亿）",
        position: "left",
      },
      {
        type: "value",
        name: "收盘价",
        position: "right",
        axisLabel: {
          formatter: '{value} 元'
        }
      }
    ],
    series: [
      {
        type: "bar",
        name: "净买入量",
        data: values,
        yAxisIndex: 0,
        itemStyle: {
          color: (params) => (params.value >= 0 ? "#e74c3c" : "#27ae60"),
        },
      },
      {
        type: "line",
        name: "收盘价",
        data: prices,
        yAxisIndex: 1,
        smooth: true,
        symbol: "circle",
        lineStyle: { color: "#409eff" },
        itemStyle: { color: "#409eff" },
      }
    ]
  })
}

// 监听股票代码变化，自动发起请求
watch(code, (newVal, oldVal) => {
  if (newVal && dateRange.value && dateRange.value.length === 2) {
    fetchData()
  }
})

</script>

<style scoped>
.chengjiao-date-view {
  padding: 24px;
}
.bar-chart {
  width: 100%;
  height: 500px;
  margin-top: 24px;
}
</style>
