<template>
  <div class="kpi-block">
    <div class="block-title-with-icon">
      <span class="block-icon finance"><el-icon><Money /></el-icon></span>
      <div class="block-title-text">
        <span class="block-title">财务数据</span>
        <span class="block-subtitle">{{ time }}</span>
      </div>
    </div>
    <bar-progress
      v-for="(item, idx) in finances"
      :key="item.label"
      :label="item.label"
      :value="item.value"
      :percent="item.percent"
      :color="item.color"
      :is-percentage="item.isPercentage"
    />
  </div>
</template>

<script setup>
import { Money } from '@element-plus/icons-vue'
import BarProgress from '../common/bar-progress.vue'

defineProps({
  time: {
    type: String,
    required: true
  },
  finances: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(item => 
        typeof item.label === 'string' && 
        typeof item.value === 'string' && 
        typeof item.percent === 'number' &&
        typeof item.color === 'string' &&
        typeof item.isPercentage === 'boolean'
      )
    }
  }
})
</script>

<style scoped>
.kpi-block {
  background: #f5f5f5;
  border-radius: 12px;
  flex: 1;
  padding: 12px 18px 12px 18px;
  box-shadow: 0 1px 6px 0 #ececec;
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
</style>
