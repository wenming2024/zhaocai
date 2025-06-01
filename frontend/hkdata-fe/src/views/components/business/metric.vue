<template>
  <div class="core-metrics">
    <metric-core
      v-for="(item, idx) in metrics"
      :key="idx"
      :icon="item.icon"
      :value="item.value"
      :desc="item.desc"
      :time="item.time"
    />
  </div>
</template>

<script setup>
import MetricCore from '../common/metric-core.vue'

defineProps({
  metrics: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(item => 
        item.icon && 
        typeof item.value === 'string' && 
        typeof item.desc === 'string' && 
        typeof item.time === 'string'
      )
    }
  }
})
</script>

<style scoped>
.core-metrics {
  display: flex;
  justify-content: space-between;
  margin-bottom: 18px;
  gap: 12px;
}
</style>
