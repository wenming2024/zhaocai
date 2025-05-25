<template>
  <div class="google-status-view">
    <!-- 顶部Logo和公司名 -->
    <div class="header">
      <span class="google-logo">Google</span>
      <span class="alphabet">Alphabet</span>
    </div>
    <!-- 四大核心指标 -->
    <div class="core-metrics">
      <div class="metric">
        <div class="icon-bg">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="metric-content">
          <div class="value">+26%</div>
          <div class="desc">股票年化增长率<br/>(过去5年)</div>
        </div>
      </div>
      <div class="metric">
        <div class="icon-bg">
          <el-icon><PieChart /></el-icon>
        </div>
        <div class="metric-content">
          <div class="value">58%</div>
          <div class="desc">毛利率<br/>(去年)</div>
        </div>
      </div>
      <div class="metric">
        <div class="icon-bg">
          <el-icon><Coin /></el-icon>
        </div>
        <div class="metric-content">
          <div class="value">16%</div>
          <div class="desc">FCF利润率<br/>(去年)</div>
        </div>
      </div>
      <div class="metric">
        <div class="icon-bg">
          <el-icon><PriceTag /></el-icon>
        </div>
        <div class="metric-content">
          <div class="value">$176</div>
          <div class="desc">公允价值</div>
        </div>
      </div>
    </div>
    <!-- 营收&FCF、收入来源、区域收入分布 -->
    <div class="charts-row">
      <div class="chart-block bar">
        <div class="block-title">营收 & FCF</div>
        <div class="sub-title">增长率%</div>
        <div ref="barChart" class="bar-chart"></div>
      </div>
      <div class="chart-block pie">
        <div class="block-title">收入来源</div>
        <div ref="pieChart" class="pie-chart"></div>
      </div>
      <div class="chart-block region">
        <div class="block-title">区域收入分布</div>
        <div class="region-pie">
          <div class="region-bubble us">US</div>
          <div class="region-bubble emea">EMEA</div>
          <div class="region-bubble apac">APAC</div>
          <div class="region-bubble other">其他</div>
        </div>
      </div>
    </div>
    <!-- 关键指标、经营评级、财务数据 -->
    <div class="kpi-row">
      <div class="kpi-block">
        <div class="block-title">关键指标</div>
        <div class="kpi-item">
          <span>云服务增长率</span>
          <span class="kpi-value green">+30%</span>
        </div>
        <div class="kpi-item">
          <span>YouTube广告收入增长</span>
          <el-progress :percentage="14" :show-text="false" color="#FFD600" style="width: 60%"/>
          <span class="kpi-value yellow">+14%</span>
        </div>
        <div class="kpi-item">
          <span>搜索业务增长</span>
          <el-progress :percentage="12" :show-text="false" color="#00B050" style="width: 60%"/>
          <span class="kpi-value blue">+12%</span>
        </div>
      </div>
      <div class="kpi-block">
        <div class="block-title">经营评级</div>
        <div class="rating-item">
          <span>壁垒深度</span>
          <el-rate v-model="barrier" disabled allow-half :max="5" />
        </div>
        <div class="rating-item">
          <span>产品反馈</span>
          <el-rate v-model="product" disabled allow-half :max="5" />
        </div>
        <div class="rating-item">
          <span>公司团队</span>
          <el-rate v-model="team" disabled allow-half :max="5" />
        </div>
        <div class="rating-item">
          <span>护城河</span>
          <el-rate v-model="moat" disabled allow-half :max="5" />
        </div>
      </div>
      <div class="kpi-block">
        <div class="block-title">财务数据</div>
        <div class="kpi-item">
          <span>营收增长</span>
          <span class="kpi-value green">+12%</span>
        </div>
        <div class="kpi-item">
          <span>自由现金流FCF增长</span>
          <el-progress :percentage="100" :show-text="false" color="#00B050" style="width: 60%"/>
          <span class="kpi-value green">+214%</span>
        </div>
        <div class="kpi-item">
          <span>现金及现金等价物</span>
          <span class="kpi-value blue">730亿</span>
        </div>
      </div>
    </div>
    <!-- 正面和反面 -->
    <div class="pros-cons-row">
      <div class="pros-cons-block">
        <div class="block-title">正面和反面</div>
        <ul class="pros">
          <li><span class="dot green"></span>广泛的产品布局和护城河，市场份额高</li>
          <li><span class="dot green"></span>高盈利能力和现金流</li>
          <li><span class="dot green"></span>AI布局前沿</li>
        </ul>
        <ul class="cons">
          <li><span class="dot red"></span>面临监管的威胁</li>
          <li><span class="dot red"></span>AI带来的不确定性</li>
          <li><span class="dot red"></span>国际对头对手的竞争</li>
        </ul>
      </div>
      <!-- 估值A、估值B -->
      <div class="valuation-blocks">
        <div class="valuation-block">
          <div class="block-title">估值A</div>
          <div class="valuation-desc">假设以DCF(美元)计算的估值</div>
          <div class="valuation-row">假设10年FCF年复合增长：<span class="bold">12%</span></div>
          <div class="valuation-row">Terminal Multiple：<span class="bold">20x</span></div>
          <div class="valuation-row">目标可行性分析：<span class="green bold">可行性</span></div>
        </div>
        <div class="valuation-block">
          <div class="block-title">估值B</div>
          <div class="valuation-desc">假设以10年历史FCF增长计算的估值</div>
          <div class="valuation-row">假设10年FCF年复合增长：<span class="bold">11%</span></div>
          <div class="valuation-row">Terminal Multiple：<span class="bold">20x</span></div>
          <div class="valuation-row">公允价值：<span class="bold">$176</span></div>
          <div class="valuation-row"><span class="green bold">+1% 估值合理</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { ElProgress, ElRate, ElIcon } from 'element-plus'
import { TrendCharts, PieChart, Coin, PriceTag } from '@element-plus/icons-vue'

const barrier = ref(4.0)
const product = ref(4.5)
const team = ref(4.4)
const moat = ref(5.0)

const barChart = ref(null)
const pieChart = ref(null)

onMounted(() => {
  // 美化后的营收&FCF折线图
  const bar = echarts.init(barChart.value)
  bar.setOption({
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    backgroundColor: '#f8f1e6',
    tooltip: { trigger: 'axis' },
    legend: {
      data: [
        { name: '营收', icon: 'circle' },
        { name: 'FCF自由现金流', icon: 'circle' }
      ],
      top: 8,
      left: 80,
      itemWidth: 16,
      itemHeight: 16,
      textStyle: { fontWeight: 'bold', fontSize: 15 }
    },
    xAxis: {
      type: 'category',
      data: ['2020', '2021', '2022', '2023', 'LTM'],
      axisLabel: { fontWeight: 'bold', fontSize: 15 },
      axisLine: { lineStyle: { color: '#333', width: 2 } }
    },
    yAxis: {
      type: 'value',
      min: -10,
      max: 60,
      axisLabel: { fontWeight: 'bold', fontSize: 15 },
      axisLine: { lineStyle: { color: '#333', width: 2 } },
      splitLine: { lineStyle: { color: '#e0e0e0' } }
    },
    series: [
      {
        name: '营收',
        type: 'line',
        data: [13, 32, 40, 12, 13],
        smooth: false,
        symbol: 'circle',
        symbolSize: 12,
        lineStyle: { color: '#e74c3c', width: 4 },
        itemStyle: { color: '#e74c3c', borderWidth: 2, borderColor: '#fff' }
      },
      {
        name: 'FCF自由现金流',
        type: 'line',
        data: [38, 54, -8, 15, 10],
        smooth: false,
        symbol: 'circle',
        symbolSize: 12,
        lineStyle: { color: '#2986f7', width: 4 },
        itemStyle: { color: '#2986f7', borderWidth: 2, borderColor: '#fff' }
      }
    ]
  })
  // 美化后的收入来源环形图
  const pie = echarts.init(pieChart.value)
  pie.setOption({
    backgroundColor: '#f8f1e6',
    tooltip: { trigger: 'item' },
    series: [
      {
        name: '收入来源',
        type: 'pie',
        radius: ['40%', '68%'],
        center: ['58%', '54%'],
        label: {
          show: true,
          position: 'inside',
          formatter: '{name|{b}}\n{percent|{d}%}',
          rich: {
            name: { align: 'center', fontSize: 11, fontWeight: 'bold', color: '#333', lineHeight: 16 },
            percent: { align: 'center', fontSize: 11, color: '#333', lineHeight: 16 }
          }
        },
        labelLine: { show: false },
        data: [
          { value: 57, name: '搜索业务', itemStyle: { color: '#e74c3c' } },
          { value: 11, name: '订阅服务', itemStyle: { color: '#2986f7' } },
          { value: 11, name: '云服务', itemStyle: { color: '#f7d358' } },
          { value: 10, name: 'YouTube', itemStyle: { color: '#6fcf97' } },
          { value: 11, name: '其他', itemStyle: { color: '#666' } }
        ]
      }
    ]
  })
})
</script>

<style scoped>
.google-status-view {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px 0 #e0e0e0;
  padding: 24px 24px 32px 24px;
  max-width: 1100px;
  margin: 32px auto;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}
.header {
  position: relative;
  width: 100%;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}
.google-logo {
  font-size: 72px;
  font-weight: bold;
  letter-spacing: 2px;
  font-family: 'Product Sans', 'Arial', sans-serif;
  color: #4285f4;
  background: linear-gradient(90deg, #4285f4 0%, #ea4335 30%, #fbbc05 60%, #34a853 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}
.alphabet {
  position: absolute;
  right: 10px;
  bottom: 0;
  font-size: 36px;
  color: #ea4335;
  font-weight: 500;
  letter-spacing: 1px;
  font-family: 'Arial', sans-serif;
}
.core-metrics {
  display: flex;
  justify-content: space-between;
  margin-bottom: 18px;
  gap: 12px;
}
.metric {
  background: #f5f5f5;
  border-radius: 12px;
  flex: 1;
  padding: 18px 0 10px 0;
  text-align: left;
  box-shadow: 0 1px 6px 0 #ececec;
  display: flex;
  align-items: center;
  gap: 16px;
}
.icon-bg {
  width: 48px;
  height: 48px;
  background: #222;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 18px;
}
.icon-bg .el-icon, .icon-bg .iconfont {
  font-size: 26px;
  color: #fff;
}
.metric-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.metric-content .value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 2px;
  color: #333;
}
.metric-content .desc {
  font-size: 14px;
  color: #888;
}
.charts-row {
  display: flex;
  gap: 18px;
  margin-bottom: 18px;
  background: #f8f1e6;
  border: 2px solid #222;
  border-radius: 8px;
  padding: 18px 0 8px 0;
}
.chart-block {
  background: transparent;
  border-radius: 0;
  flex: 1;
  padding: 0 12px 0 12px;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  position: relative;
}
.chart-block.bar { border-right: 2px solid #d2c3a5; }
.chart-block.pie { border-right: 2px solid #d2c3a5; }
.block-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 0;
  color: #111;
  text-align: left;
  width: 100%;
  line-height: 1.1;
}
.sub-title {
  font-size: 16px;
  color: #222;
  font-weight: 500;
  margin-bottom: 0;
  margin-top: 2px;
  margin-left: 2px;
  width: 100%;
  text-align: left;
}
.bar-chart {
  width: 320px;
  height: 200px;
  margin-top: 8px;
}
.pie-chart {
  width: 300px;
  height: 240px;
  margin-top: 18px;
}
.region-pie {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  height: 180px;
  margin-top: 32px;
}
.region-bubble {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  font-weight: bold;
  font-size: 22px;
  box-shadow: 0 2px 8px #e0e0e0;
}
.region-bubble.us { background: #2986f7; width: 90px; height: 90px; font-size: 28px; }
.region-bubble.emea { background: #3b5998; width: 70px; height: 70px; font-size: 22px; }
.region-bubble.apac { background: #7b8dbb; width: 54px; height: 54px; font-size: 18px; }
.region-bubble.other { background: #111; width: 44px; height: 44px; font-size: 16px; }
.kpi-row {
  display: flex;
  gap: 18px;
  margin-bottom: 18px;
}
.kpi-block {
  background: #f5f5f5;
  border-radius: 12px;
  flex: 1;
  padding: 12px 18px 12px 18px;
  box-shadow: 0 1px 6px 0 #ececec;
}
.kpi-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 15px;
}
.kpi-value.green { color: #00b050; font-weight: bold; }
.kpi-value.yellow { color: #ffd600; font-weight: bold; }
.kpi-value.blue { color: #2196f3; font-weight: bold; }
.rating-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 15px;
}
.pros-cons-row {
  display: flex;
  gap: 18px;
  margin-bottom: 0;
}
.pros-cons-block {
  background: #f5f5f5;
  border-radius: 12px;
  flex: 2;
  padding: 12px 18px 12px 18px;
  box-shadow: 0 1px 6px 0 #ececec;
  min-width: 0;
}
.pros, .cons {
  list-style: none;
  padding: 0;
  margin: 0 0 6px 0;
}
.pros li, .cons li {
  display: flex;
  align-items: center;
  font-size: 15px;
  margin-bottom: 4px;
}
.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
}
.dot.green { background: #00b050; }
.dot.red { background: #ea4335; }
.valuation-blocks {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1.2;
}
.valuation-block {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 12px 18px 12px 18px;
  box-shadow: 0 1px 6px 0 #ececec;
  margin-bottom: 0;
}
.valuation-desc {
  font-size: 13px;
  color: #888;
  margin-bottom: 4px;
}
.valuation-row {
  font-size: 15px;
  margin-bottom: 2px;
}
.bold { font-weight: bold; }
.green { color: #00b050; }
</style> 