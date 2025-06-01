<template>
  <div class="pros-cons-block">
    <div class="block-title-with-icon">
      <span class="block-icon proscons"><el-icon><CircleClose /></el-icon></span>
      <div class="block-title-text">
        <span class="block-title">正面和反面</span>
      </div>
    </div>
    <ul class="pros">
      <li v-for="(item, idx) in pros" :key="idx">
        <span class="pros-icon"><el-icon><component :is="item.icon" /></el-icon></span>{{ item.text }}
      </li>
    </ul>
    <ul class="cons">
      <li v-for="(item, idx) in cons" :key="idx">
        <span class="cons-icon"><el-icon><component :is="item.icon" /></el-icon></span>{{ item.text }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { CircleClose, CirclePlusFilled, RemoveFilled } from '@element-plus/icons-vue'

defineProps({
  pros: {
    type: Array,
    required: true,
    default: () => []
  },
  cons: {
    type: Array,
    required: true,
    default: () => []
  }
})
</script>

<style scoped>
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
</style>
