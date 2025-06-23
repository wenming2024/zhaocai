<template>
  <div class="navigation">
    <el-menu
      :default-active="activeIndex"
      class="nav-menu"
      mode="horizontal"
      router
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
    >
      <el-menu-item index="/">
        <el-icon><DataLine /></el-icon>
        <span>南向交易数据</span>
      </el-menu-item>
      
      <el-menu-item index="/hk-stock-history">
        <el-icon><TrendCharts /></el-icon>
        <span>港股历史交易</span>
      </el-menu-item>
      
      <el-menu-item index="/chengjiao-south">
        <el-icon><PieChart /></el-icon>
        <span>成交数据查询</span>
      </el-menu-item>
      
      <el-menu-item index="/google-status">
        <el-icon><Monitor /></el-icon>
        <span>Google状态</span>
      </el-menu-item>
      
      <el-menu-item index="/meituan-status">
        <el-icon><Shop /></el-icon>
        <span>美团状态</span>
      </el-menu-item>
      
      <el-menu-item index="/gangjiaosuo-status">
        <el-icon><OfficeBuilding /></el-icon>
        <span>港交所状态</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  DataLine, 
  TrendCharts, 
  PieChart, 
  Monitor, 
  Shop, 
  OfficeBuilding 
} from '@element-plus/icons-vue'

const route = useRoute()

const activeIndex = computed(() => route.path)
</script>

<style scoped>
.navigation {
  background-color: #545c64;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-menu {
  max-width: 1400px;
  margin: 0 auto;
  border-bottom: none;
}

.el-menu-item {
  font-size: 14px;
}

.el-menu-item .el-icon {
  margin-right: 5px;
}
</style> 