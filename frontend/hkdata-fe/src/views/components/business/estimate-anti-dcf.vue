<template>
  <div class="valuation-block">
    <div class="block-title-with-icon">
      <span class="block-icon valuation"><el-icon><PriceTag /></el-icon></span>
      <div class="block-title-text">
        <span class="block-title">估值A</span>
        <span class="block-subtitle">反向DCF分析</span>
      </div>
    </div>
    <div class="valuation-desc">{{ desc }}</div>
    <ul class="valuation-list">
      <li v-for="(item, idx) in list" :key="item.label">{{ item.label }}：<span class="bold">{{ item.value }}</span></li>
    </ul>
    <div class="valuation-row analysis-row">
      <span class="valuation-analysis-icon"><el-icon><Clock /></el-icon></span>
      <span class="valuation-analysis-label">目标可行性分析</span>
    </div>
    <div class="valuation-progress-bar-wrap">
      <el-progress :percentage="progress" :text-inside="true" color="#00B050" class="valuation-progress-bar-el"/>
    </div>
    <div class="valuation-btn green">{{ btn }}</div>
  </div>
</template>

<script setup>
import { PriceTag, Clock } from '@element-plus/icons-vue'
import { ElProgress } from 'element-plus'

defineProps({
  desc: {
    type: String,
    required: true
  },
  list: {
    type: Array,
    required: true
  },
  progress: {
    type: Number,
    required: true
  },
  btn: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.valuation-block {
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
.valuation-desc {
  font-size: 14px;
  color: #888;
  margin-bottom: 4px;
}
.valuation-list {
  list-style: disc inside;
  padding-left: 0;
  margin: 0 0 8px 0;
  color: #222;
  font-size: 15px;
}
.valuation-list li {
  margin-bottom: 2px;
}
.valuation-row {
  display: flex;
  align-items: center;
  margin: 8px 0 8px 0;
}
.valuation-analysis-icon {
  display: flex;
  color: #111;
  font-size: 20px;
  margin-right: 8px;
}
.valuation-analysis-label {
  font-size: 16px;
  color: #222;
  font-weight: bold;
}
.valuation-progress-bar-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 8px 0 8px 0;
}
.valuation-progress-bar-el {
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
.valuation-btn.green {
  background: #00b050;
  color: #fff;
  font-weight: bold;
  font-size: 18px;
  border-radius: 9px;
  padding: 4px 24px;
  margin-top: 8px;
  display: inline-block;
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
