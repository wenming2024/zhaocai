<template>
  <div class="google-status-view">
    <!-- 顶部Logo和公司名 -->
    <div class="header">
      <span class="google-logo">{{ statsData.code }}</span>
      <span class="alphabet">{{ statsData.name }}</span>
    </div>
    <!-- 四大核心指标 -->
    <div class="core-metrics">
      <div class="metric" v-for="(item, idx) in statsData.coreMetrics" :key="idx">
        <div class="icon-bg">
          <el-icon><component :is="item.icon" /></el-icon>
        </div>
        <div class="metric-content">
          <div class="value">{{ item.value }}</div>
          <div class="desc">{{ item.desc }} ({{ item.time }})</div>
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
          <div v-for="(item, idx) in statsData.region" :key="item.name" class="region-bubble" :class="item.name.toLowerCase()" :style="{ background: item.color, width: item.size + 'px', height: item.size + 'px', fontSize: item.font + 'px' }">
            {{ item.name }}
          </div>
        </div>
      </div>
    </div>
    <!-- 关键指标、经营评级、财务数据 -->
    <div class="kpi-row">
      <div class="kpi-block">
        <div class="block-title-with-icon">
          <span class="block-icon kpi"><el-icon><Search /></el-icon></span>
          <div class="block-title-text">
            <span class="block-title">关键指标</span>
            <span class="block-subtitle">{{ statsData.time }}</span>
          </div>
        </div>
        <div class="kpi-item" v-for="(item, idx) in statsData.kpi" :key="item.label">
          <div class="kpi-desc">{{ item.label }}</div>
          <div class="kpi-bar-row">
            <el-progress class="kpi-progress" :percentage="item.percent" :show-text="false" :color="item.color" />
            <span class="kpi-value">{{ item.value }}</span>
          </div>
        </div>
      </div>
      <div class="kpi-block">
        <div class="block-title-with-icon">
          <span class="block-icon rating"><el-icon><Search /></el-icon></span>
          <div class="block-title-text">
            <span class="block-title">经营评级</span>
            <span class="block-subtitle">{{ statsData.time }}</span>
          </div>
        </div>
        <div class="rating-item" v-for="(item, idx) in statsData.rating" :key="item.label">
          <div class="rating-label">{{ item.label }}</div>
          <div class="rating-bar-row">
            <el-rate v-model="statsData.rating[idx].value" disabled allow-half :max="5" />
            <span class="rating-score">{{ item.value.toFixed(1) }}</span>
          </div>
        </div>
      </div>
      <div class="kpi-block">
        <div class="block-title-with-icon">
          <span class="block-icon finance"><el-icon><Money /></el-icon></span>
          <div class="block-title-text">
            <span class="block-title">财务数据</span>
            <span class="block-subtitle">{{ statsData.time }}</span>
          </div>
        </div>
        <div class="kpi-item" v-for="(item, idx) in statsData.finance" :key="item.label">
          <div class="kpi-desc">{{ item.label }}</div>
          <div class="kpi-bar-row">
            <el-progress class="kpi-progress" :percentage="item.percent" :show-text="false" :color="item.color" />
            <span class="kpi-value">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 正面和反面 -->
    <div class="pros-cons-row">
      <div class="pros-cons-block">
        <div class="block-title-with-icon">
          <span class="block-icon proscons"><el-icon><CircleClose /></el-icon></span>
          <div class="block-title-text">
            <span class="block-title">正面和反面</span>
          </div>
        </div>
        <ul class="pros">
          <li v-for="(item, idx) in statsData.pros" :key="idx">
            <span class="pros-icon"><el-icon><component :is="item.icon" /></el-icon></span>{{ item.text }}
          </li>
        </ul>
        <ul class="cons">
          <li v-for="(item, idx) in statsData.cons" :key="idx">
            <span class="cons-icon"><el-icon><component :is="item.icon" /></el-icon></span>{{ item.text }}
          </li>
        </ul>
      </div>
      <!-- 估值A、估值B -->
      <div class="valuation-blocks">
        <div class="valuation-block">
          <div class="block-title-with-icon">
            <span class="block-icon valuation"><el-icon><PriceTag /></el-icon></span>
            <div class="block-title-text">
              <span class="block-title">估值A</span>
              <span class="block-subtitle">反向DCF分析</span>
            </div>
          </div>
          <div class="valuation-desc">{{ statsData.valuationA.desc }}</div>
          <ul class="valuation-list">
            <li v-for="(item, idx) in statsData.valuationA.list" :key="item.label">{{ item.label }}：<span class="bold">{{ item.value }}</span></li>
          </ul>
          <div class="valuation-row analysis-row">
            <span class="valuation-analysis-icon"><el-icon><Clock /></el-icon></span>
            <span class="valuation-analysis-label">目标可行性分析</span>
          </div>
          <div class="valuation-progress-bar-wrap">
            <el-progress :percentage="statsData.valuationA.progress" :text-inside="true" color="#00B050" class="valuation-progress-bar-el"/>
          </div>
        </div>
        <div class="valuation-block">
          <div class="block-title-with-icon">
            <span class="block-icon valuation"><el-icon><PriceTag /></el-icon></span>
            <div class="block-title-text">
              <span class="block-title">估值B</span>
              <span class="block-subtitle">DCF分析</span>
            </div>
          </div>
          <div class="valuation-desc">{{ statsData.valuationB.desc }}</div>
          <ul class="valuation-list">
            <li v-for="(item, idx) in statsData.valuationB.list" :key="item.label">{{ item.label }}：<span class="bold">{{ item.value }}</span></li>
          </ul>
          <div class="valuation-row value-row">
            <span class="valuation-value-label">公允价值</span>
            <span class="valuation-value-num">{{ statsData.valuationB.value }}</span>
          </div>
          <div class="valuation-row analysis-row">
            <span class="valuation-analysis-icon"><el-icon><Clock /></el-icon></span>
            <span class="valuation-analysis-label">建议 谨慎看待！</span>
          </div>
          <div class="valuation-btn green">{{ statsData.valuationB.btn }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import * as echarts from 'echarts'
import { ElProgress, ElRate, ElIcon } from 'element-plus'
import { TrendCharts, PieChart, Coin, PriceTag, Search, Money, CircleClose, CirclePlusFilled, RemoveFilled, Clock } from '@element-plus/icons-vue'

// 统一数据结构
const statsData = reactive({
  name: '美团',
  code: '美团-W',
  time: '2025年Q1',
  coreMetrics: [
    { icon: TrendCharts, value: '-3.04%', desc: '股票年化增长率', time: '2020年5月-2025年5月' },
    { icon: PieChart, value: '37.4%', desc: '毛利率', time: '2025年Q1' },
    { icon: Coin, value: '11.67%', desc: 'FCF利润率', time: '2025年Q1' },
    { icon: PriceTag, value: '164港币', desc: '公允价值', time: '2025年Q1' }
  ],
  revenueFcf: {
    x: ['2021', '2022', '2023', '2024', '2025Q1'],
    revenue: [1791, 2200, 2767, 3376, 866],
    fcf: [-40, 114, 405, 572, 101]
  },
  revenueSource: [
    { value: 42, name: '外卖', color: '#e74c3c' },
    { value: 10, name: '闪购', color: '#2986f7' }, 
    { value: 22, name: '到店', color: '#f7d358' },
    { value: 26, name: '新业务', color: '#6fcf97' },
  ],
  region: [
    { name: '中国', color: '#2986f7', size: 90, font: 28 },
    { name: '中东', color: '#3b5998', size: 60, font: 22 },
    { name: '巴西', color: '#7b8dbb', size: 60, font: 18 },
    { name: '其他', color: '#111', size: 50, font: 16 }
  ],
  kpi: [
    { label: '本地商业增长率', percent: 18, value: '+18%', color: '#00B050' },
    { label: '新业务亏损收窄', percent: 100, value: '23亿', color: '#FFD600' },
    { label: '闪购业务增长', percent: 35, value: '+35%', color: '#00B050' }
  ],
  rating: [
    { label: '管理效率', value: 4.5 },
    { label: '产品反馈', value: 4.0 },
    { label: '公司团队', value: 4.5 },
    { label: '护城河', value: 4.0 }
  ],
  finance: [
    { label: '营收增长', percent: 18, value: '+18%', color: '#FFD600' },
    { label: '自由现金流FCF增长', percent: 69, value: '+69%', color: '#00B050' },
    { label: '现金及现金等价物', percent: 100, value: '1150亿', color: '#2196f3' }
  ],
  pros: [
    { icon: CirclePlusFilled, text: '即时零售爆发：闪购累计交易用户超5亿，90后占比60%，复购率75%。' },
    { icon: CirclePlusFilled, text: '协同效应：与外卖共享配送网络，复用率达85%，即时零售日均单量达6815万单（外卖+闪购），2025年目标突破8700万单。' },
    { icon: CirclePlusFilled, text: '国际化布局：Keeta在沙特进入前三，巴西市场启动试点，复制“技术+本地化”模式，亏损可控。' }
  ],
  cons: [
    { icon: RemoveFilled, text: '成本压力：骑手社保政策或新增成本76.8亿-148.8亿元，挤压利润率1.5-3个百分点。' },
    { icon: RemoveFilled, text: '国际化挑战：中东及南美政策合规性风险，需持续本地化运营能力。' },
    { icon: RemoveFilled, text: '监管风险：反垄断政策持续，本地生活服务竞争加剧。' }
  ],
  valuationA: {
    desc: '假设以当前股价（129港币）计算的自由现金流增长：',
    list: [
      { label: '未来10年FCF增长', value: '12%' },
      { label: '终值倍数Terminal Multiple', value: '20x' },
      { label: '回报率', value: '10%' }
    ],
    progress: 60,
    btn: '可行性'
  },
  valuationB: {
    desc: '假设未来10年自由现金流增长缓慢下降：',
    list: [
      { label: '未来10年FCF增长', value: '11%' },
      { label: '终值倍数Terminal Multiple', value: '20x' },
      { label: '回报率', value: '10%' }
    ],
    value: '$176',
    btn: '+1% 估值合理'
  }
})

const barrier = ref(statsData.rating[0].value)
const product = ref(statsData.rating[1].value)
const team = ref(statsData.rating[2].value)
const moat = ref(statsData.rating[3].value)

const barChart = ref(null)
const pieChart = ref(null)

onMounted(() => {
  // 营收&FCF折线图
  const bar = echarts.init(barChart.value)
  bar.setOption({
    grid: { left: 60, right: 20, top: 40, bottom: 30 },
    backgroundColor: '#f8f1e6',
    tooltip: { trigger: 'axis' },
    legend: {
      data: [
        { name: '营收', icon: 'circle' },
        { name: 'FCF自由现金流', icon: 'circle' }
      ],
      top: 0,
      left: 40,
      itemWidth: 16,
      itemHeight: 16,
      textStyle: { fontWeight: 'bold', fontSize: 15 }
    },
    xAxis: {
      type: 'category',
      data: statsData.revenueFcf.x,
      axisLabel: { fontWeight: 'bold', fontSize: 15 },
      axisLine: { lineStyle: { color: '#333', width: 2 } }
    },
    yAxis: {
      type: 'value',
      min: -50,
      max: 3500,
      axisLabel: { fontWeight: 'bold', fontSize: 15 },
      axisLine: { lineStyle: { color: '#333', width: 2 } },
      splitLine: { lineStyle: { color: '#e0e0e0' } }
    },
    series: [
      {
        name: '营收',
        type: 'line',
        data: statsData.revenueFcf.revenue,
        smooth: false,
        symbol: 'circle',
        symbolSize: 12,
        lineStyle: { color: '#e74c3c', width: 4 },
        itemStyle: { color: '#e74c3c', borderWidth: 2, borderColor: '#fff' }
      },
      {
        name: 'FCF自由现金流',
        type: 'line',
        data: statsData.revenueFcf.fcf,
        smooth: false,
        symbol: 'circle',
        symbolSize: 12,
        lineStyle: { color: '#2986f7', width: 4 },
        itemStyle: { color: '#2986f7', borderWidth: 2, borderColor: '#fff' }
      }
    ]
  })
  // 收入来源环形图
  const pie = echarts.init(pieChart.value)
  pie.setOption({
    backgroundColor: '#f8f1e6',
    tooltip: { trigger: 'item' },
    series: [
      {
        name: '收入来源',
        type: 'pie',
        radius: ['40%', '68%'],
        center: ['50%', '50%'],
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
        data: statsData.revenueSource.map(item => ({ value: item.value, name: item.name, itemStyle: { color: item.color } }))
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
  min-width: 48px;
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
.chart-block .block-title {
  width: 100%;
}
.block-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 0;
  color: #111;
  text-align: left;
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
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 18px;
  font-size: 15px;
}
.kpi-desc {
  font-size: 15px;
  color: #222;
  margin-bottom: 4px;
  font-weight: 500;
}
.kpi-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.kpi-progress {
  flex: 1;
  min-width: 0;
}
:deep(.kpi-progress .el-progress-bar__outer) {
  height: 16px !important;
  border-radius: 8px;
  background: #eaeaea;
}
:deep(.kpi-progress .el-progress-bar__inner) {
  border-radius: 8px;
}
.kpi-value { color: #222; font-weight: bold; min-width: 48px; text-align: right;}
.kpi-value.green { color: #00b050; }
.kpi-value.yellow { color: #ffd600; }
.kpi-value.blue { color: #2196f3; }
.rating-item {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 18px;
  font-size: 16px;
}
.rating-label {
  font-size: 15px;
  color: #222;
  margin-bottom: 4px;
  font-weight: 500;
}
.rating-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.rating-score {
  min-width: 32px;
  background: #111;
  color: #fff;
  font-weight: bold;
  font-size: 18px;
  border-radius: 10px;
  padding: 2px 18px;
  text-align: center;
  margin-left: 16px;
  box-shadow: 0 1px 4px #e0e0e0;
}
.el-rate {
  margin: 0;
  background: #e0e0e0;
  border-radius: 2px;
}
:deep(.rating-bar-row .el-rate__icon) {
  font-size: 32px !important;
}
:deep(.rating-bar-row .el-rate.is-disabled .el-rate__icon--active) {
  background: #ffe066;
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
  flex-direction: row;
  gap: 18px;
  flex: 2;
}
.valuation-block {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 18px 18px 18px 18px;
  box-shadow: 0 1px 6px 0 #ececec;
  margin-bottom: 0;
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.valuation-desc {
  font-size: 14px;
  color: #888;
  margin-bottom: 4px;
}
.valuation-list {
  list-style: disc inside;
  padding-left: 0;
  margin: 0 0 8px 0;
  color: #222;
  font-size: 15px;
}
.valuation-list li {
  margin-bottom: 2px;
}
.valuation-row {
  display: flex;
  align-items: center;
  margin: 8px 0 8px 0;
}
.valuation-analysis-icon {
  color: #111;
  font-size: 20px;
  margin-right: 8px;
}
.valuation-analysis-label {
  font-size: 16px;
  color: #222;
  font-weight: bold;
}
.valuation-progress-bar-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 8px 0 8px 0;
}
.valuation-progress-label {
  font-size: 18px;
  color: #fff;
  background: #00b050;
  border-radius: 8px;
  padding: 2px 32px;
  font-weight: bold;
  margin-bottom: -12px;
  z-index: 2;
  position: relative;
  text-align: center;
  box-shadow: 0 1px 4px #e0e0e0;
}
.valuation-progress-bar-el {
  width: 100%;
  margin-top: 0;
  margin-bottom: 0;
}
:deep(.valuation-progress-bar-el .el-progress-bar__outer) {
  height: 18px !important;
  border-radius: 9px;
  background: #eaeaea;
}
:deep(.valuation-progress-bar-el .el-progress-bar__inner) {
  border-radius: 9px;
}
.valuation-btn.green {
  background: #00b050;
  color: #fff;
  font-weight: bold;
  font-size: 18px;
  border-radius: 9px;
  padding: 4px 24px;
  margin-top: 8px;
  display: inline-block;
}
.value-row {
  margin-top: 8px;
  margin-bottom: 0;
}
.valuation-value-label {
  font-size: 16px;
  color: #222;
  font-weight: bold;
  margin-right: 12px;
}
.valuation-value-num {
  font-size: 32px;
  color: #111;
  font-weight: bold;
}
.block-title-with-icon {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}
.block-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
  background: #111;
  flex-shrink: 0;
}
.block-title-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.block-title {
  font-size: 28px;
  font-weight: bold;
  color: #111;
  line-height: 1.1;
}
.block-subtitle {
  font-size: 15px;
  color: #888;
  margin-top: 2px;
  font-weight: 400;
}
.block-icon.proscons {
  background: #111;
}
.block-icon.valuation {
  background: #111;
}
.pros-icon {
  width: 28px;
  height: 28px;
  min-width: 28px;
  background: #00b050;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  margin-right: 10px;
}
.cons-icon {
  width: 28px;
  height: 28px;
  background: #ea4335;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  margin-right: 10px;
}
</style> 