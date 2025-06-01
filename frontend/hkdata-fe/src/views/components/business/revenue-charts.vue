<template>
  <div class="charts-row">
    <div class="chart-block bar">
      <div class="block-title">营收 & FCF</div>
      <div class="sub-title">增长率%</div>
      <chart-bar
        :xAxis="revenueFcf.x"
        :series="[
          {
            name: '营收',
            type: 'line',
            data: revenueFcf.revenue,
            color: '#e74c3c'
          },
          {
            name: 'FCF自由现金流',
            type: 'line',
            data: revenueFcf.fcf,
            color: '#2986f7'
          }
        ]"
        :yAxis="{ min: -50, max: 3500 }"
        class="bar-chart"
      />
    </div>
    <div class="chart-block pie">
      <div class="block-title">收入来源</div>
      <chart-pie
        :data="revenueSource"
        class="pie-chart"
      />
    </div>
    <div class="chart-block region">
      <div class="block-title">区域收入分布</div>
      <chart-circle
        :data="region"
      />
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import ChartBar from '../common/chart-bar.vue'
import ChartPie from '../common/chart-pie.vue'
import ChartCircle from '../common/chart-circle.vue'

const props = defineProps({
  revenueFcf: {
    type: Object,
    required: true,
    validator: (value) => {
      return Array.isArray(value.x) &&
        Array.isArray(value.revenue) &&
        Array.isArray(value.fcf)
    }
  },
  revenueSource: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(item =>
        typeof item.value === 'number' &&
        typeof item.name === 'string' &&
        typeof item.color === 'string'
      )
    }
  },
  region: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(item =>
        typeof item.name === 'string' &&
        typeof item.color === 'string' &&
        typeof item.size === 'number' &&
        typeof item.font === 'number'
      )
    }
  }
})
</script>

<style scoped>
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
</style>
