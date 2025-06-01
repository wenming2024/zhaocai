<template>
  <div class="report-view">
    <!-- 顶部Logo和公司名 -->
    <header-code-name :code="data.code" :name="data.name" />
    
    <!-- 四大核心指标 -->
    <metric :metrics="data.coreMetrics" />
    
    <!-- 营收&FCF、收入来源、区域收入分布 -->
    <revenue-charts
      :revenueFcf="data.revenueFcf"
      :revenueSource="data.revenueSource"
      :region="data.region"
    />
    
    <!-- 关键指标、经营评级、财务数据 -->
    <div class="kpi-row">
      <kpi-core :time="data.time" :kpis="data.kpi" />
      <rating :time="data.time" :ratings="data.rating" />
      <finance :time="data.time" :finances="data.finance" />
    </div>
    
    <!-- 正面和反面 -->
    <div class="pros-cons-row">
      <positive-negative :pros="data.pros" :cons="data.cons" />
      
      <!-- 估值A、估值B -->
      <div class="valuation-blocks">
        <estimate-anti-dcf
          :desc="data.valuationA.desc"
          :list="data.valuationA.list"
          :progress="data.valuationA.progress"
          :btn="data.valuationA.btn"
        />
        <estimate-dcf
          :desc="data.valuationB.desc"
          :list="data.valuationB.list"
          :value="data.valuationB.value"
          :btn="data.valuationB.btn"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import HeaderCodeName from './common/header-code-name.vue'
import Metric from './business/metric.vue'
import RevenueCharts from './business/revenue-charts.vue'
import KpiCore from './business/kpi-core.vue'
import Rating from './business/rating.vue'
import Finance from './business/finance.vue'
import PositiveNegative from './business/positive-negative.vue'
import EstimateDcf from './business/estimate-dcf.vue'
import EstimateAntiDcf from './business/estimate-anti-dcf.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    validator: (value) => {
      return (
        typeof value.name === 'string' &&
        typeof value.code === 'string' &&
        typeof value.time === 'string' &&
        Array.isArray(value.coreMetrics) &&
        typeof value.revenueFcf === 'object' &&
        Array.isArray(value.revenueSource) &&
        Array.isArray(value.region) &&
        Array.isArray(value.kpi) &&
        Array.isArray(value.rating) &&
        Array.isArray(value.finance) &&
        Array.isArray(value.pros) &&
        Array.isArray(value.cons) &&
        typeof value.valuationA === 'object' &&
        typeof value.valuationB === 'object'
      )
    }
  }
})
</script>

<style scoped>
.report-view {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px 0 #e0e0e0;
  padding: 24px 24px 32px 24px;
  max-width: 1100px;
  margin: 32px auto;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

.kpi-row {
  display: flex;
  gap: 18px;
  margin-bottom: 18px;
}

.pros-cons-row {
  display: flex;
  gap: 18px;
  margin-bottom: 0;
}

.valuation-blocks {
  display: flex;
  flex-direction: row;
  gap: 18px;
  flex: 2;
}

/* 核心指标样式 */
:deep(.metric) {
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

:deep(.icon-bg) {
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

:deep(.icon-bg .el-icon) {
  font-size: 26px;
  color: #fff;
}

:deep(.metric-content .value) {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 2px;
  color: #333;
}

:deep(.metric-content .desc) {
  font-size: 14px;
  color: #888;
}

/* KPI样式 */
:deep(.kpi-block) {
  background: #f5f5f5;
  border-radius: 12px;
  flex: 1;
  padding: 12px 18px 12px 18px;
  box-shadow: 0 1px 6px 0 #ececec;
}

:deep(.kpi-item) {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 18px;
  font-size: 15px;
}

:deep(.kpi-desc) {
  font-size: 15px;
  color: #222;
  margin-bottom: 4px;
  font-weight: 500;
}

:deep(.kpi-bar-row) {
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.kpi-progress) {
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

:deep(.kpi-value) {
  color: #222;
  font-weight: bold;
  min-width: 48px;
  text-align: right;
}

:deep(.kpi-value.green) { color: #00b050; }
:deep(.kpi-value.yellow) { color: #ffd600; }
:deep(.kpi-value.blue) { color: #2196f3; }

/* 评级样式 */
:deep(.rating-item) {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 18px;
  font-size: 16px;
}

:deep(.rating-label) {
  font-size: 15px;
  color: #222;
  margin-bottom: 4px;
  font-weight: 500;
}

:deep(.rating-bar-row) {
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.rating-score) {
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

:deep(.el-rate) {
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

/* 优缺点样式 */
:deep(.pros-cons-block) {
  background: #f5f5f5;
  border-radius: 12px;
  flex: 2;
  padding: 12px 18px 12px 18px;
  box-shadow: 0 1px 6px 0 #ececec;
  min-width: 0;
}

:deep(.pros), :deep(.cons) {
  list-style: none;
  padding: 0;
  margin: 0 0 6px 0;
}

:deep(.pros li), :deep(.cons li) {
  display: flex;
  align-items: center;
  font-size: 15px;
  margin-bottom: 4px;
}

:deep(.pros-icon) {
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

:deep(.cons-icon) {
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

/* 估值样式 */
:deep(.valuation-block) {
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

:deep(.valuation-desc) {
  font-size: 14px;
  color: #888;
  margin-bottom: 4px;
}

:deep(.valuation-list) {
  list-style: disc inside;
  padding-left: 0;
  margin: 0 0 8px 0;
  color: #222;
  font-size: 15px;
}

:deep(.valuation-list li) {
  margin-bottom: 2px;
}

:deep(.valuation-row) {
  display: flex;
  align-items: center;
  margin: 8px 0 8px 0;
}

:deep(.valuation-analysis-icon) {
  display: flex;
  color: #111;
  font-size: 20px;
  margin-right: 8px;
}

:deep(.valuation-analysis-label) {
  font-size: 16px;
  color: #222;
  font-weight: bold;
}

:deep(.valuation-progress-bar-wrap) {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 8px 0 8px 0;
}

:deep(.valuation-progress-label) {
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

:deep(.valuation-progress-bar-el) {
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

:deep(.valuation-btn.green) {
  background: #00b050;
  color: #fff;
  font-weight: bold;
  font-size: 18px;
  border-radius: 9px;
  padding: 4px 24px;
  margin-top: 8px;
  display: inline-block;
}

:deep(.value-row) {
  margin-top: 8px;
  margin-bottom: 0;
}

:deep(.valuation-value-label) {
  font-size: 16px;
  color: #222;
  font-weight: bold;
  margin-right: 12px;
}

:deep(.valuation-value-num) {
  font-size: 32px;
  color: #111;
  font-weight: bold;
}
</style>
