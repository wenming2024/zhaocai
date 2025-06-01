<template>
  <div class="rating-item">
    <div class="rating-label">{{ label }}</div>
    <div class="rating-bar-row">
      <el-rate 
        :model-value="value" 
        @update:model-value="$emit('update:value', $event)"
        disabled 
        allow-half 
        :max="5" 
      />
      <span class="rating-score">{{ value.toFixed(1) }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 5
  }
})

defineEmits(['update:value'])
</script>

<style scoped>
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
:deep(.rating-bar-row .el-rate__icon) {
  font-size: 32px !important;
}
:deep(.rating-bar-row .el-rate.is-disabled .el-rate__icon--active) {
  background: #ffe066;
}
</style>
