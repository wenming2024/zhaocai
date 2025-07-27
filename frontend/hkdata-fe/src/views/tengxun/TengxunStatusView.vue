<template>
  <template-report :data="statsData" />
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { TrendCharts, PieChart, Coin, PriceTag, CirclePlusFilled, RemoveFilled } from '@element-plus/icons-vue'
import TemplateReport from '../components/template-report.vue'

// 统一数据结构
const statsData = reactive({
  // 公司名称、代码
  name: '腾讯',
  code: '00700',
  // 报告期：2025年Q1
  time: '2025年Q1',
  // 报告期的核心指标：营收、毛利率、FCF利润率、近5年股票年化增长率
  coreMetrics: [
    // 营收： 营收
    { icon: TrendCharts, value: '加载中...', desc: '营收', time: '2025年Q1' },
    // 毛利率： 毛利/营收
    { icon: PieChart, value: '加载中...', desc: '毛利率', time: '2025年Q1' },
    // FCF利润率： 自由现金流/营收
    { icon: Coin, value: '加载中...', desc: 'FCF利润率', time: '2025年Q1' },
    // 近5年股票年化增长率： （当前股价/5年前股价）^（1/5）-1
    { icon: PriceTag, value: '加载中...', desc: '股票年化增长率', time: '2020年5月-2025年5月' }
  ],
  // 营收&FCF，近5年营收&FCF
  revenueFcf: {
    x: ['2021', '2022', '2023', '2024'],
    revenue: [0, 0, 0, 0],
    fcf: [0, 0, 0, 0]
  },
  // 核心业务营收占比饼图
  revenueSource: [
    { value: 52, name: '增值服务', color: '#e74c3c' },
    { value: 28, name: '网络广告', color: '#2986f7' }, 
    { value: 20, name: '金融科技', color: '#f7d358' }
  ],
  // 核心收入区域气泡图
  region: [
    { name: '中国', color: '#2986f7', size: 85, font: 26 },
    { name: '海外', color: '#3b5998', size: 65, font: 20 },
    { name: '其他', color: '#7b8dbb', size: 45, font: 16 }
  ],
  // 核心业务指标数据
  kpi: [
    { label: '游戏业务增长', percent: 12, value: '+12%', color: '#00B050', isPercentage: true },
    { label: '广告业务恢复', percent: 18, value: '+18%', color: '#00B050', isPercentage: true },
    { label: '金融科技增长', percent: 15, value: '+15%', color: '#00B050', isPercentage: true },
  ],
  // 经营指标评级
  rating: [
    { label: '管理效率', value: 4.8 },
    { label: '产品创新', value: 4.5 },
    { label: '公司团队', value: 4.7 },
    { label: '护城河', value: 4.9 }
  ],
  // 财务指标数据
  finance: [
    { label: '营收增长', percent: 0, value: '加载中...', color: '#00B050', isPercentage: true },
    { label: '自由现金流FCF增长', percent: 0, value: '加载中...', color: '#00B050', isPercentage: true },
    { label: '现金及现金等价物', percent: 100, value: '加载中...', color: '#2196f3', isPercentage: false }
  ],
  // 正面和反面
  pros: [
    { icon: CirclePlusFilled, text: '游戏业务稳健：手游《王者荣耀》月活用户超2亿，海外游戏收入占比提升至30%，游戏业务护城河深厚。' },
    { icon: CirclePlusFilled, text: '广告业务复苏：微信生态广告收入同比增长18%，视频号商业化加速，广告库存利用率提升至85%。' },
    { icon: CirclePlusFilled, text: '金融科技增长：微信支付市场份额稳定在40%以上，企业服务收入同比增长25%，云服务进入盈利期。' }
  ],
  cons: [
    { icon: RemoveFilled, text: '监管风险：游戏版号审批不确定性，未成年人保护政策可能影响游戏收入增长。' },
    { icon: RemoveFilled, text: '竞争加剧：字节跳动、阿里等对手在游戏、广告领域持续发力，市场份额面临挑战。' },
    { icon: RemoveFilled, text: '投资减值：对外投资组合价值波动，可能影响净利润表现。' }
  ],
  // 估值-反DCF
  valuationA: {
    desc: '假设以当前股价计算的自由现金流增长：',
    list: [
      { label: '未来5年FCF增长', value: '加载中...' },
      { label: '终值倍数Terminal Multiple', value: '加载中...' },
      { label: '回报率', value: '加载中...' }
    ],
    progress: 0,
    btn: '可行性'
  },
  // 估值-DCF
  valuationB: {
    desc: '假设未来5年自由现金流增长缓慢下降：',
    list: [
      { label: '未来5年FCF增长', value: '加载中...' },
      { label: '终值倍数Terminal Multiple', value: '加载中...' },
      { label: '回报率', value: '加载中...' }
    ],
    value: '加载中...',
    btn: '估值分析'
  }
})

// 获取腾讯财务数据
const fetchTengxunData = async (reportDate = 'latest') => {
  try {
    // 获取腾讯财报数据（使用新的financialReportService）
    const response = await fetch(`http://localhost:3000/api/financial-report/00700/${reportDate}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        console.log('腾讯财报数据:', result.data)
        
        const reportData = result.data
        
        // 更新核心指标
        if (reportData.financial?.current?.revenue) {
          const revenue = reportData.financial.current.revenue / 100000000 // 转换为亿元
          statsData.coreMetrics[0].value = Number(revenue).toFixed(0) + '亿元'
          statsData.coreMetrics[0].time = reportData.reportDate || '2025年Q1'
        }
        
        if (reportData.financial?.current?.grossMargin) {
          const grossMargin = reportData.financial.current.grossMargin
          statsData.coreMetrics[1].value = Number(grossMargin).toFixed(1) + '%'
          const grossProfit = reportData.financial.current.grossProfit / 100000000
          const revenue = reportData.financial.current.revenue / 100000000
          statsData.coreMetrics[1].time = `${reportData.reportDate || '2025年Q1'}-${grossProfit.toFixed(0)}/${revenue.toFixed(0)}`
        }
        
        if (reportData.financial?.current?.fcfMargin) {
          const fcfMargin = reportData.financial.current.fcfMargin
          statsData.coreMetrics[2].value = Number(fcfMargin).toFixed(1) + '%'
          const fcf = reportData.financial.current.fcf / 100000000
          const revenue = reportData.financial.current.revenue / 100000000
          statsData.coreMetrics[2].time = `${reportData.reportDate || '2025年Q1'}-${fcf.toFixed(0)}/${revenue.toFixed(0)}`
        }
        
        // 更新营收和FCF历史数据
        if (reportData.financial?.historical && reportData.financial.historical.length >= 5) {
          // 按时间排序
          reportData.financial.historical.sort((a, b) => new Date(a.year) - new Date(b.year))
          const recentYears = reportData.financial.historical.slice(0, 5)
          
          console.log('原始历史数据:', recentYears)
          
          statsData.revenueFcf.x = recentYears.map(item => item.year.toString())
          statsData.revenueFcf.revenue = recentYears.map(item => {
            const revenue = item.revenue / 100000000
            return revenue ? Number(revenue.toFixed(0)) : 0
          })
          statsData.revenueFcf.fcf = recentYears.map(item => {
            const fcf = item.fcf / 100000000
            return fcf ? Number(fcf.toFixed(0)) : 0
          })
          
          console.log('营收和FCF历史数据更新:', {
            x: statsData.revenueFcf.x,
            revenue: statsData.revenueFcf.revenue,
            fcf: statsData.revenueFcf.fcf
          })
        } else {
          console.warn('历史数据不足或缺失:', reportData.financial?.historical)
        }
        
        // 更新财务指标数据
        if (reportData.financial?.current) {
          const current = reportData.financial.current
          
          // 营收增长率
          if (current.revenueGrowth !== undefined) {
            statsData.finance[0].percent = Math.abs(current.revenueGrowth)
            statsData.finance[0].value = (current.revenueGrowth >= 0 ? '+' : '') + Number(current.revenueGrowth).toFixed(1) + '%'
            statsData.finance[0].color = current.revenueGrowth >= 0 ? '#00B050' : '#f56c6c'
          }
          
          // FCF增长率
          if (current.fcfGrowth !== undefined) {
            statsData.finance[1].percent = Math.abs(current.fcfGrowth)
            statsData.finance[1].value = (current.fcfGrowth >= 0 ? '+' : '') + Number(current.fcfGrowth).toFixed(1) + '%'
            statsData.finance[1].color = current.fcfGrowth >= 0 ? '#00B050' : '#f56c6c'
          }
          
          // 现金及现金等价物
          if (current.cashEquivalents) {
            const cashAndEquivalents = current.cashEquivalents / 100000000 // 转换为亿元
            statsData.finance[2].value = cashAndEquivalents.toFixed(0) + '亿元'
          } else {
            statsData.finance[2].value = '数据缺失'
          }
        }
        
        // 更新LLM生成的分析数据
        if (reportData.analysis) {
          // 更新正面和反面信息
          if (reportData.analysis.pros && reportData.analysis.pros.length > 0) {
            statsData.pros = reportData.analysis.pros.map(text => ({
              icon: CirclePlusFilled,
              text: text
            }))
          }
          
          if (reportData.analysis.cons && reportData.analysis.cons.length > 0) {
            statsData.cons = reportData.analysis.cons.map(text => ({
              icon: RemoveFilled,
              text: text
            }))
          }
          
          // 更新经营评级
          if (reportData.analysis.ratings) {
            const ratings = reportData.analysis.ratings
            statsData.rating = [
              { label: '管理效率', value: ratings.managementEfficiency || 3.5 },
              { label: '产品创新', value: ratings.productInnovation || 3.5 },
              { label: '公司团队', value: ratings.teamQuality || 3.5 },
              { label: '护城河', value: ratings.moat || 3.5 }
            ]
          }
          
          // 更新收入来源和地区分布
          if (reportData.analysis.revenueComposition) {
            const composition = reportData.analysis.revenueComposition
            statsData.revenueSource = Object.entries(composition).map(([name, value], index) => ({
              value: value,
              name: name,
              color: ['#e74c3c', '#2986f7', '#f7d358', '#2ecc71'][index] || '#95a5a6'
            }))
          }
          
          if (reportData.analysis.regionalDistribution) {
            const distribution = reportData.analysis.regionalDistribution
            statsData.region = Object.entries(distribution).map(([name, value], index) => ({
              name: name,
              color: ['#2986f7', '#3b5998', '#7b8dbb'][index] || '#95a5a6',
              size: value,
              font: Math.max(16, value * 0.3)
            }))
          }
          
          // 更新关键业务指标
          if (reportData.analysis.keyMetrics) {
            const metrics = reportData.analysis.keyMetrics
            statsData.kpi = Object.entries(metrics).map(([label, value]) => ({
              label: label,
              percent: Math.abs(value),
              value: (value >= 0 ? '+' : '') + value.toFixed(1) + '%',
              color: value >= 0 ? '#00B050' : '#f56c6c',
              isPercentage: true
            }))
          }
        }
        
        // 更新估值数据
        if (reportData.dcf && reportData.reverseDcf) {
          // 反DCF数据
          statsData.valuationA.list[0].value = reportData.reverseDcf.impliedGrowthRate?.toFixed(1) + '%' || '计算中...'
          statsData.valuationA.list[1].value = reportData.reverseDcf.terminalMultiple?.toFixed(0) + 'x' || '计算中...'
          statsData.valuationA.list[2].value = reportData.reverseDcf.expectedReturn?.toFixed(1) + '%' || '计算中...'
          statsData.valuationA.progress = reportData.reverseDcf.feasibilityProbability || 50
          
          // DCF数据
          statsData.valuationB.list[0].value = reportData.dcf.assumptions?.fcfGrowthRate?.toFixed(1) + '%' || '10%'
          statsData.valuationB.list[1].value = reportData.dcf.terminalMultiple?.toFixed(0) + 'x' || '计算中...'
          statsData.valuationB.list[2].value = reportData.dcf.expectedReturn?.toFixed(1) + '%' || '计算中...'
          statsData.valuationB.value = reportData.dcf.fairValuePerShare?.toFixed(0) + '港币' || '计算中...'
          
          // 计算估值偏差
          if (reportData.stockPrice?.reportEndPrice && reportData.dcf.fairValuePerShare) {
            const currentPrice = reportData.stockPrice.reportEndPrice
            const fairValue = reportData.dcf.fairValuePerShare
            const upside = ((fairValue - currentPrice) / currentPrice) * 100
            statsData.valuationB.btn = upside >= 0 ? `+${upside.toFixed(0)}% 估值低估` : `${upside.toFixed(0)}% 估值高估`
          }
        }
        
        console.log('财报数据更新完成:', {
          reportDate: reportData.reportDate,
          revenue: reportData.financial?.current?.revenue,
          fcf: reportData.financial?.current?.fcf,
          analysis: reportData.analysis ? '已生成' : '未生成'
        })
        
      } else {
        console.error('获取腾讯财报数据失败:', result.message)
      }
    } else {
      console.error('财报数据接口请求失败:', response.status)
    }
  } catch (error) {
    console.error('获取腾讯财报数据失败:', error)
  }
}

// 获取腾讯股价数据
const fetchTengxunStockData = async () => {
  try {
    // 获取腾讯近5年股价数据
    const response = await fetch('http://localhost:3000/api/hk-stock/history?code=00700&startDate=2020-05-01&endDate=2025-05-01')
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data && result.data.length > 0) {
        console.log('腾讯股价数据:', result.data)
        
        // 计算近5年股票年化增长率
        const stockData = result.data
        if (stockData.length >= 2) {
          const latestPrice = stockData[stockData.length - 1].close
          const earliestPrice = stockData[0].close
          
          if (latestPrice > 0 && earliestPrice > 0) {
            // 计算年化增长率：(当前股价/5年前股价)^(1/5)-1
            const years = 5
            const cagr = Math.pow(latestPrice / earliestPrice, 1/years) - 1
            statsData.coreMetrics[3].value = (cagr * 100).toFixed(1) + '%'
            
            console.log('股票年化增长率计算:', {
              latestPrice: latestPrice + '港币',
              earliestPrice: earliestPrice + '港币',
              cagr: (cagr * 100).toFixed(1) + '%'
            })
          } else {
            statsData.coreMetrics[3].value = '数据异常'
          }
        } else {
          statsData.coreMetrics[3].value = '数据不足'
        }
      } else {
        console.error('获取腾讯股价数据失败:', result.message)
        statsData.coreMetrics[3].value = '数据获取失败'
      }
    } else {
      console.error('股价数据接口请求失败:', response.status)
      statsData.coreMetrics[3].value = '接口请求失败'
    }
  } catch (error) {
    console.error('获取腾讯股价数据失败:', error)
    statsData.coreMetrics[3].value = '获取失败'
  }
}

// 估值计算现在由后端financialReportService处理
// 前端只需要展示后端返回的DCF和反DCF计算结果

// 获取可用的报告期列表
const getAvailableReportDates = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/financial-report/00700/report-dates')
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        console.log('可用报告期:', result.data)
        return result.data
      }
    }
  } catch (error) {
    console.error('获取报告期列表失败:', error)
  }
  return []
}

// 更新报告期
const updateReportPeriod = async (reportDate) => {
  console.log('更新报告期:', reportDate)
  statsData.time = reportDate
  await fetchTengxunData(reportDate)
}

onMounted(async () => {
  // 获取可用报告期并设置默认值
  const availableDates = await getAvailableReportDates()
  if (availableDates.length > 0) {
    statsData.time = availableDates[0] // 使用最新的报告期
  }
  
  // 获取数据
  await fetchTengxunData(availableDates[0])
  await fetchTengxunStockData()
})
</script> 