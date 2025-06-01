<template>
  <div class="kpi-item">
    <div class="kpi-desc">{{ label }}</div>
    <div class="kpi-bar-row">
      <el-progress 
        class="kpi-progress" 
        :percentage="isPercentage ? percent : 100" 
        :show-text="false" 
        :color="color" 
      />
      <span class="kpi-value" :class="valueClass">{{ value }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  percent: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  isPercentage: {
    type: Boolean,
    default: true
  }
})

const valueClass = computed(() => {
  if (!props.isPercentage) return ''
  if (props.value.includes('+')) return 'green'
  if (props.value.includes('-')) return 'red'
  return ''
})
</script>

<style scoped>
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
.kpi-value { 
  color: #222; 
  font-weight: bold; 
  min-width: 48px; 
  text-align: right;
}
.kpi-value.green { color: #00b050; }
.kpi-value.yellow { color: #ffd600; }
.kpi-value.blue { color: #2196f3; }
</style>
