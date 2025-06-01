<template>
  <div class="kpi-block">
    <div class="block-title-with-icon">
      <span class="block-icon rating"><el-icon><Search /></el-icon></span>
      <div class="block-title-text">
        <span class="block-title">经营评级</span>
        <span class="block-subtitle">{{ time }}</span>
      </div>
    </div>
    <rate-star
      v-for="(item, idx) in ratings"
      :key="item.label"
      :label="item.label"
      :value="item.value"
    />
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
import RateStar from '../common/rate-star.vue'

defineProps({
  time: {
    type: String,
    required: true
  },
  ratings: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(item => 
        typeof item.label === 'string' && 
        typeof item.value === 'number' &&
        item.value >= 0 &&
        item.value <= 5
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
