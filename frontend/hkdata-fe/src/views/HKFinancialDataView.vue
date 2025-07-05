<template>
  <div class="hk-financial-data">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>港股财务数据查询</h1>
      <p>查询港股公司的财务数据，包括核心指标、资产负债表、利润表和现金流量表</p>
    </div>

    <!-- 筛选条件区域 -->
    <div class="filter-section">
      <el-card class="filter-card">
        <div class="filter-form">
          <!-- 股票代码输入 -->
          <div class="form-item">
            <label>股票代码：</label>
            <el-input
              v-model="filterForm.stockCode"
              placeholder="请输入港股代码，如：00388"
              style="width: 200px"
              clearable
            />
            <span class="stock-name" v-if="stockName">{{ stockName }}</span>
          </div>

          <!-- 报告期选择 -->
          <div class="form-item">
            <label>报告期：</label>
            <el-date-picker
              v-model="filterForm.startDate"
              type="date"
              placeholder="开始日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 150px"
            />
            <span class="date-separator">至</span>
            <el-date-picker
              v-model="filterForm.endDate"
              type="date"
              placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 150px"
            />
          </div>

          <!-- 快捷选择 -->
          <div class="form-item">
            <label>快捷选择：</label>
            <el-button-group>
              <el-button
                :type="filterForm.period === '3y' ? 'primary' : ''"
                @click="selectPeriod('3y')"
              >
                最近3年
              </el-button>
              <el-button
                :type="filterForm.period === '5y' ? 'primary' : ''"
                @click="selectPeriod('5y')"
              >
                最近5年
              </el-button>
              <el-button
                :type="filterForm.period === 'all' ? 'primary' : ''"
                @click="selectPeriod('all')"
              >
                全部
              </el-button>
            </el-button-group>
          </div>

          <!-- 操作按钮 -->
          <div class="form-item">
            <el-button type="primary" @click="queryData" :loading="loading">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="resetFilter">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
            <el-button @click="exportData" :disabled="!hasData">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 数据展示区域 -->
    <div class="data-section" v-if="hasData">
      <!-- 核心指标表格 -->
      <el-card class="data-card">
        <template #header>
          <div class="card-header">
            <h3>核心指标</h3>
            <span class="record-count">{{ reportDates.length }} 个报告期</span>
          </div>
        </template>

        
        <!-- 详细指标表格 -->
        <el-table
          :data="[
            { label: '基本每股收益', key: 'BASIC_EPS', format: 'number', decimals: 4 },
            { label: '稀释每股收益', key: 'DILUTED_EPS', format: 'number', decimals: 4 },
            { label: '每股净资产', key: 'BPS', format: 'number', decimals: 4 },
            { label: '营业收入', key: 'OPERATE_INCOME', format: 'currency' },
            { label: '营收同比', key: 'OPERATE_INCOME_YOY', format: 'percent' },
            { label: '股东净利润', key: 'HOLDER_PROFIT', format: 'currency' },
            { label: '净利润同比', key: 'HOLDER_PROFIT_YOY', format: 'percent' },
            { label: '平均ROE', key: 'ROE_AVG', format: 'percent' },
            { label: '市盈率TTM', key: 'PE_TTM', format: 'number', decimals: 2 },
            { label: '市净率TTM', key: 'PB_TTM', format: 'number', decimals: 2 }
          ]"
          style="width: 100%; margin-top: 20px;"
          :max-height="400"
          border
          stripe
          v-loading="loading"
        >
          <el-table-column prop="label" label="指标名称" width="150" fixed="left" />
          <el-table-column 
            v-for="date in reportDates" 
            :key="date"
            :label="formatReportDate(date)"
            :prop="date"
            width="120"
          >
            <template #default="scope">
              <div class="data-cell">
                <div class="data-value">
                  <span v-if="scope.row.format === 'currency'">
                    {{ formatCurrency(getDataByDate(date)?.[scope.row.key]) }}
                  </span>
                  <span v-else-if="scope.row.format === 'percent'">
                    <span :class="getChangeClass(getDataByDate(date)?.[scope.row.key])">
                      {{ formatPercent(getDataByDate(date)?.[scope.row.key]) }}
                    </span>
                  </span>
                  <span v-else>
                    {{ formatNumber(getDataByDate(date)?.[scope.row.key], scope.row.decimals || 2) }}
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 资产负债表表格 -->
      <el-card class="data-card">
        <template #header>
          <div class="card-header">
            <h3>资产负债表</h3>
            <span class="record-count">{{ reportDates.length }} 个报告期</span>
          </div>
        </template>
        <el-table
          :data="[
            { label: '总资产', key: 'TOTAL_ASSETS', format: 'currency' },
            { label: '总负债', key: 'TOTAL_LIABILITIES', format: 'currency' },
            { label: '股东权益', key: 'TOTAL_PARENT_EQUITY', format: 'currency' },
            { label: '资产负债率', key: 'DEBT_ASSET_RATIO', format: 'percent' }
          ]"
          style="width: 100%"
          :max-height="400"
          border
          stripe
        >
          <el-table-column prop="label" label="项目名称" width="150" fixed="left" />
          <el-table-column 
            v-for="date in reportDates" 
            :key="date"
            :label="formatReportDate(date)"
            :prop="date"
            width="120"
          >
            <template #default="scope">
              <div class="data-cell">
                <div class="data-value">
                  <span v-if="scope.row.format === 'currency'">
                    {{ formatCurrency(getDataByDate(date)?.[scope.row.key]) }}
                  </span>
                  <span v-else-if="scope.row.format === 'percent'">
                    {{ formatPercent(getDataByDate(date)?.[scope.row.key]) }}
                  </span>
                  <span v-else>
                    {{ formatNumber(getDataByDate(date)?.[scope.row.key], scope.row.decimals || 2) }}
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 利润表表格 -->
      <el-card class="data-card">
        <template #header>
          <div class="card-header">
            <h3>利润表</h3>
            <span class="record-count">{{ reportDates.length }} 个报告期</span>
          </div>
        </template>
        <el-table
          :data="[
            { label: '营业收入', key: 'OPERATE_INCOME', format: 'currency' },
            { label: '毛利润', key: 'GROSS_PROFIT', format: 'currency' },
            { label: '营业利润', key: 'OPERATE_PROFIT', format: 'currency' },
            { label: '税前利润', key: 'PRETAX_PROFIT', format: 'currency' },
            { label: '股东净利润', key: 'HOLDER_PROFIT', format: 'currency' }
          ]"
          style="width: 100%"
          :max-height="400"
          border
          stripe
        >
          <el-table-column prop="label" label="项目名称" width="150" fixed="left" />
          <el-table-column 
            v-for="date in reportDates" 
            :key="date"
            :label="formatReportDate(date)"
            :prop="date"
            width="120"
          >
            <template #default="scope">
              <div class="data-cell">
                <div class="data-value">
                  <span v-if="scope.row.format === 'currency'">
                    {{ formatCurrency(getDataByDate(date)?.[scope.row.key]) }}
                  </span>
                  <span v-else-if="scope.row.format === 'percent'">
                    {{ formatPercent(getDataByDate(date)?.[scope.row.key]) }}
                  </span>
                  <span v-else>
                    {{ formatNumber(getDataByDate(date)?.[scope.row.key], scope.row.decimals || 2) }}
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 现金流量表表格 -->
      <el-card class="data-card">
        <template #header>
          <div class="card-header">
            <h3>现金流量表</h3>
            <span class="record-count">{{ reportDates.length }} 个报告期</span>
          </div>
        </template>
        <el-table
          :data="[
            { label: '经营活动现金流', key: 'NETCASH_OPERATE', format: 'currency' },
            { label: '投资活动现金流', key: 'NETCASH_INVEST', format: 'currency' },
            { label: '筹资活动现金流', key: 'NETCASH_FINANCE', format: 'currency' },
            { label: '期末现金', key: 'END_CASH', format: 'currency' }
          ]"
          style="width: 100%"
          :max-height="400"
          border
          stripe
        >
          <el-table-column prop="label" label="项目名称" width="150" fixed="left" />
          <el-table-column 
            v-for="date in reportDates" 
            :key="date"
            :label="formatReportDate(date)"
            :prop="date"
            width="120"
          >
            <template #default="scope">
              <div class="data-cell">
                <div class="data-value">
                  <span v-if="scope.row.format === 'currency'">
                    {{ formatCurrency(getDataByDate(date)?.[scope.row.key]) }}
                  </span>
                  <span v-else-if="scope.row.format === 'percent'">
                    {{ formatPercent(getDataByDate(date)?.[scope.row.key]) }}
                  </span>
                  <span v-else>
                    {{ formatNumber(getDataByDate(date)?.[scope.row.key], scope.row.decimals || 2) }}
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 无数据提示 -->
    <div class="no-data" v-else-if="!loading">
      <el-empty description="暂无数据，请先查询" />
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Download } from '@element-plus/icons-vue'

export default {
  name: 'HKFinancialDataView',
  components: {
    Search,
    Refresh,
    Download
  },
  setup() {
    // 筛选表单
    const filterForm = reactive({
      stockCode: '',
      startDate: '',
      endDate: '',
      period: ''
    })

    // 数据状态
    const loading = ref(false)
    const stockName = ref('')
    const financialData = ref([])

    // 计算属性
    const hasData = computed(() => financialData.value.length > 0)

    // 获取所有报告期并排序
    const reportDates = computed(() => {
      const dates = [...new Set(financialData.value.map(item => item.REPORT_DATE?.split(' ')[0]))]
        .filter(date => date)
        .sort((a, b) => new Date(b) - new Date(a))
      return dates
    })

    // 格式化报告期为年月日
    const formatReportDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }

    // 获取指定报告期的数据
    const getDataByDate = (date) => {
      return financialData.value.find(item => item.REPORT_DATE?.split(' ')[0] === date) || {}
    }

    const mainIndicators = computed(() => {
      return financialData.value.filter(item => 
        item.BASIC_EPS !== null || item.OPERATE_INCOME !== null
      )
    })

    const balanceSheet = computed(() => {
      return financialData.value.filter(item => 
        item.BALANCE_STD_ITEM_CODE !== null
      )
    })

    const incomeStatement = computed(() => {
      return financialData.value.filter(item => 
        item.INCOME_STD_ITEM_CODE !== null
      )
    })

    const cashFlow = computed(() => {
      return financialData.value.filter(item => 
        item.CASHFLOW_STD_ITEM_CODE !== null
      )
    })

    // 选择报告期
    const selectPeriod = (period) => {
      filterForm.period = period
      const now = new Date()
      
      if (period === '3y') {
        filterForm.startDate = new Date(now.getFullYear() - 3, 0, 1).toISOString().split('T')[0]
        filterForm.endDate = now.toISOString().split('T')[0]
      } else if (period === '5y') {
        filterForm.startDate = new Date(now.getFullYear() - 5, 0, 1).toISOString().split('T')[0]
        filterForm.endDate = now.toISOString().split('T')[0]
      } else if (period === 'all') {
        filterForm.startDate = ''
        filterForm.endDate = ''
      }
    }

    // 重置筛选条件
    const resetFilter = () => {
      filterForm.stockCode = ''
      filterForm.startDate = ''
      filterForm.endDate = ''
      filterForm.period = ''
      stockName.value = ''
      financialData.value = []
    }

    // 查询数据
    const queryData = async () => {
      if (!filterForm.stockCode) {
        ElMessage.warning('请输入股票代码')
        return
      }

      loading.value = true
      try {
        const response = await fetch(`http://localhost:3000/api/hk-financial/${filterForm.stockCode}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('查询失败')
        }

        const result = await response.json()
        
        if (result.success) {
          financialData.value = result.data
          stockName.value = result.data[0]?.SECURITY_NAME_ABBR || ''
          ElMessage.success(`查询成功，共获取${result.count}条记录`)
        } else {
          ElMessage.error(result.message || '查询失败')
        }
      } catch (error) {
        console.error('查询失败:', error)
        ElMessage.error('查询失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }

    // 导出数据
    const exportData = () => {
      if (!hasData.value) {
        ElMessage.warning('暂无数据可导出')
        return
      }

      // 这里可以实现导出功能
      ElMessage.info('导出功能开发中...')
    }

    // 格式化数字
    const formatNumber = (value, decimals = 2) => {
      if (value === null || value === undefined) return '-'
      return Number(value).toFixed(decimals)
    }

    // 格式化货币
    const formatCurrency = (value) => {
      if (value === null || value === undefined) return '-'
      const num = Number(value)
      if (num >= 100000000) {
        return (num / 100000000).toFixed(2) + '亿'
      } else if (num >= 10000) {
        return (num / 10000).toFixed(2) + '万'
      }
      return num.toLocaleString()
    }

    // 格式化百分比
    const formatPercent = (value) => {
      if (value === null || value === undefined) return '-'
      return Number(value).toFixed(2) + '%'
    }

    // 获取变化样式
    const getChangeClass = (value) => {
      if (value === null || value === undefined) return ''
      const num = Number(value)
      return num > 0 ? 'text-success' : num < 0 ? 'text-danger' : ''
    }

    return {
      filterForm,
      loading,
      stockName,
      financialData,
      hasData,
      reportDates,
      formatReportDate,
      getDataByDate,
      mainIndicators,
      balanceSheet,
      incomeStatement,
      cashFlow,
      selectPeriod,
      resetFilter,
      queryData,
      exportData,
      formatNumber,
      formatCurrency,
      formatPercent,
      getChangeClass
    }
  }
}
</script>

<style scoped>
.hk-financial-data {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
  text-align: center;
}

.page-header h1 {
  color: #303133;
  margin-bottom: 10px;
}

.page-header p {
  color: #606266;
  font-size: 14px;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-card {
  background: white;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-item label {
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
}

.stock-name {
  color: #409eff;
  font-weight: 500;
  margin-left: 10px;
}

.date-separator {
  color: #606266;
  margin: 0 8px;
}

.data-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.data-card {
  background: white;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.record-count {
  color: #909399;
  font-size: 12px;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: white;
  border-radius: 8px;
}

.text-success {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}

.data-cell {
  text-align: center;
}

.data-value {
  font-weight: 500;
  color: #303133;
}

.data-label {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-item label {
    margin-bottom: 5px;
  }
}
</style> 