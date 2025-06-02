<template>
  <div class="metric">
    <div class="icon-bg">
      <el-icon><component :is="icon" /></el-icon>
    </div>
    <div class="metric-content">
      <div class="value">{{ value }}</div>
      <div class="desc">{{ desc }} ({{ time }})</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: [String, Object],
    required: true
  },
  value: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.metric {
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
.icon-bg {
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
.icon-bg .el-icon, .icon-bg .iconfont {
  font-size: 26px;
  color: #fff;
}
.metric-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.metric-content .value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 2px;
  color: #333;
}
.metric-content .desc {
  font-size: 14px;
  color: #888;
}
</style>

