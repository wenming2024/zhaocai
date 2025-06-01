<template>
  <template-report :data="statsData" />
</template>

<script setup>
import { reactive } from 'vue'
import { TrendCharts, PieChart, Coin, PriceTag, CirclePlusFilled, RemoveFilled } from '@element-plus/icons-vue'
import TemplateReport from '../components/template-report.vue'

// 统一数据结构
const statsData = reactive({
  // 公司名称、代码
  name: '美团',
  code: '美团-W',
  // 报告期：2025年Q1
  time: '2025年Q1',
  // 报告期的核心指标：营收、毛利率、FCF利润率、近5年股票年化增长率
  coreMetrics: [
    // 营收： 营收
    { icon: TrendCharts, value: '866亿元', desc: '营收', time: '2025年Q1' },
    // 毛利率： 毛利/营收
    { icon: PieChart, value: '37.4%', desc: '毛利率', time: '2025年Q1-323/866' },
    // FCF利润率： 自由现金流/营收
    { icon: Coin, value: '11.67%', desc: 'FCF利润率', time: '2025年Q1-101/866' },
    // 近5年股票年化增长率： （当前股价/5年前股价）^（1/5）-1
    { icon: PriceTag, value: '-3.04%', desc: '股票年化增长率', time: '2020年5月-2025年5月' }
  ],
  // 营收&FCF，近5年营收&FCF
  revenueFcf: {
    x: ['2021', '2022', '2023', '2024'],
    revenue: [1791, 2200, 2767, 3376],
    fcf: [-40, 114, 405, 571]
  },
  // 核心业务营收占比饼图
  revenueSource: [
    { value: 42, name: '外卖', color: '#e74c3c' },
    { value: 10, name: '闪购', color: '#2986f7' }, 
    { value: 22, name: '到店', color: '#f7d358' },
    { value: 26, name: '新业务', color: '#6fcf97' },
  ],
  // 核心收入区域气泡图
  region: [
    { name: '中国', color: '#2986f7', size: 90, font: 28 },
    { name: '中东', color: '#3b5998', size: 60, font: 22 },
    { name: '巴西', color: '#7b8dbb', size: 60, font: 18 },
    { name: '其他', color: '#111', size: 50, font: 16 }
  ],
  // 核心业务指标数据
  kpi: [
    { label: '本地商业增长率', percent: 18, value: '+18%', color: '#00B050', isPercentage: true },
    { label: '闪购业务增长', percent: 35, value: '+35%', color: '#00B050', isPercentage: true },
    { label: '新业务亏损收窄', percent: 100, value: '23亿', color: '#FFD600', isPercentage: false },
  ],
  // 经营指标评级
  rating: [
    { label: '管理效率', value: 4.5 },
    { label: '产品反馈', value: 4.0 },
    { label: '公司团队', value: 4.5 },
    { label: '护城河', value: 4.0 }
  ],
  // 财务指标数据
  finance: [
    { label: '营收增长', percent: 18, value: '+18%', color: '#00B050', isPercentage: true },
    { label: '自由现金流FCF增长', percent: 69, value: '+69%', color: '#00B050', isPercentage: true },
    { label: '现金及现金等价物', percent: 100, value: '1150亿', color: '#2196f3', isPercentage: false }
  ],
  // 正面和反面
  pros: [
    { icon: CirclePlusFilled, text: '即时零售爆发：闪购累计交易用户超5亿，90后占比60%，复购率75%。' },
    { icon: CirclePlusFilled, text: '协同效应：与外卖共享配送网络，复用率达85%，即时零售日均单量达6815万单（外卖+闪购），2025年目标突破8700万单。' },
    { icon: CirclePlusFilled, text: '国际化布局：Keeta在沙特进入前三，巴西市场启动试点，复制"技术+本地化"模式，亏损可控。' }
  ],
  cons: [
    { icon: RemoveFilled, text: '成本压力：骑手社保政策或新增成本76.8亿-148.8亿元，挤压利润率1.5-3个百分点。' },
    { icon: RemoveFilled, text: '国际化挑战：中东及南美政策合规性风险，需持续本地化运营能力。' },
    { icon: RemoveFilled, text: '监管风险：反垄断政策持续，本地生活服务竞争加剧。' }
  ],
  // 估值-反DCF
  valuationA: {
    desc: '假设以当前股价（129港币）计算的自由现金流增长：',
    list: [
      { label: '未来5年FCF增长', value: '8.7%' },
      { label: '终值倍数Terminal Multiple', value: '15x' },
      { label: '回报率', value: '9.6%' }
    ],
    progress: 100,
    btn: '可行性'
  },
  // 估值-DCF
  valuationB: {
    desc: '假设未来5年自由现金流增长缓慢下降：',
    list: [
      { label: '未来5年FCF增长', value: '8%' },
      { label: '终值倍数Terminal Multiple', value: '15x' },
      { label: '回报率', value: '9.2%' }
    ],
    value: '200港币',
    btn: '+54% 估值低估'
  }
})
</script> 