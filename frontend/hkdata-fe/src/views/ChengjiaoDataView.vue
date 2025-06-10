<template>
  <div class="chengjiao-date-view">
    <el-form :inline="true" @submit.prevent="fetchData">
      <el-form-item label="股票代码">
        <el-input v-model="code" placeholder="如 01810" style="width: 120px;" />
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
import { ref, nextTick } from 'vue'
import axios from 'axios'
import * as echarts from 'echarts'
import moment from 'moment'
const code = ref('')
const dateRange = ref([])
const chartRef = ref(null)
let chart = null

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
    title: { text: "南向净买入量-" + data[0]["security_name"] },
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
