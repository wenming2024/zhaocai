# 港股财务数据服务

## 概述

港股财务数据服务用于爬取和存储香港股票的财务数据，包括核心指标、资产负债表、利润表和现金流量表数据。

## 数据来源

数据来源于东方财富网的四个核心API接口：

1. **重要指标** - `RPT_HKF10_FN_MAININDICATOR`
2. **资产负债表** - `RPT_HKF10_FN_BALANCE_PC`
3. **利润表** - `RPT_HKF10_FN_INCOME_PC`
4. **现金流量表** - `RPT_HKF10_FN_CASHFLOW_PC`

## 文件结构

```
backend/src/
├── models/
│   └── hkFinancialData.js          # 数据库模型
├── services/
│   ├── crawlerHKFinancialData.js   # 爬虫服务
│   ├── hkFinancialService.js       # 主服务
│   └── README_HKFinancialData.md   # 说明文档
└── examples/
    └── hkFinancialExample.js       # 使用示例
```

## 数据库表结构

表名：`hk_financial_data`

### 主要字段

- **联合主键**: `SECURITY_CODE` + `REPORT_DATE`
- **公共属性字段**: 股票代码、名称、报告日期等
- **核心指标字段**: 每股收益、营业收入、净利润等
- **资产负债表字段**: 以 `BALANCE_` 前缀区分
- **利润表字段**: 以 `INCOME_` 前缀区分
- **现金流量表字段**: 以 `CASHFLOW_` 前缀区分

## 爬虫逻辑

### 爬取规则

1. **先爬取核心指标接口**，默认获取100个报告期的数据
2. **提取报告期信息**，限制最多100个报告期
3. **并行爬取其他三个接口**，使用提取的报告期作为参数
4. **合并数据**，以核心指标为基础，合并其他表的数据
5. **批量保存到数据库**

### 数据合并规则

- **规则1**: 对于属性字段（如股票代码、名称等），直接合并
- **规则2**: 对于不同接口的相同数据字段，添加接口前缀避免覆盖

## 使用方法

### 1. 基本查询

```javascript
const HKFinancialService = require('./services/hkFinancialService');

const service = new HKFinancialService();

// 查询单个股票的财务数据
const result = await service.getFinancialData('00388', {
  limit: 10,           // 限制返回数量
  allowCrawl: true,    // 允许爬取
  startDate: '2024-01-01',  // 开始日期
  endDate: '2024-12-31'     // 结束日期
});
```

### 2. 强制更新数据

```javascript
// 强制更新指定股票的数据
const updateResult = await service.updateFinancialData('00388');

// 批量更新多个股票
const batchResult = await service.updateBatchFinancialData(['00388', '00700', '00941']);
```

### 3. 获取统计信息

```javascript
// 获取财务数据统计
const stats = await service.getFinancialDataStats('00388');

// 检查数据新鲜度
const freshness = await service.checkDataFreshness('00388', 30);
```

### 4. 直接使用爬虫

```javascript
const CrawlerHKFinancialData = require('./services/crawlerHKFinancialData');

const crawler = new CrawlerHKFinancialData();

// 爬取完整财务数据
const result = await crawler.crawlFinancialData('00388');

// 单独爬取各个接口
const mainIndicators = await crawler.crawlMainIndicators('00388');
const balanceSheet = await crawler.crawlBalanceSheet('00388', ['2024-12-31']);
const incomeStatement = await crawler.crawlIncomeStatement('00388', ['2024-12-31']);
const cashFlow = await crawler.crawlCashFlow('00388', ['2024-12-31']);
```

## API接口

### 主服务方法

- `getFinancialData(securityCode, options)` - 获取财务数据
- `getFinancialDataByDate(securityCode, reportDate, options)` - 获取特定报告期数据
- `getFinancialDataStats(securityCode)` - 获取统计信息
- `updateFinancialData(securityCode)` - 强制更新数据
- `updateBatchFinancialData(securityCodes)` - 批量更新数据
- `checkDataFreshness(securityCode, daysThreshold)` - 检查数据新鲜度
- `getAllStockCodes()` - 获取所有股票代码

### 爬虫方法

- `crawlMainIndicators(securityCode)` - 爬取核心指标
- `crawlBalanceSheet(securityCode, reportDates)` - 爬取资产负债表
- `crawlIncomeStatement(securityCode, reportDates)` - 爬取利润表
- `crawlCashFlow(securityCode, reportDates)` - 爬取现金流量表
- `crawlFinancialData(securityCode)` - 爬取完整财务数据
- `crawlBatchFinancialData(securityCodes)` - 批量爬取

## 运行示例

```bash
# 运行完整示例
node src/examples/hkFinancialExample.js

# 或者单独运行某个示例
node -e "require('./src/examples/hkFinancialExample.js').runExamples()"
```

## 注意事项

1. **请求频率**: 爬虫内置了2秒延迟，避免请求过于频繁
2. **数据量限制**: 每个股票最多获取100个报告期的数据
3. **错误处理**: 所有方法都包含完整的错误处理机制
4. **数据验证**: 爬取的数据会进行类型转换和验证
5. **并发控制**: 批量操作会串行执行，避免对目标服务器造成压力

## 错误处理

服务会返回统一的结果格式：

```javascript
{
  success: true/false,
  message: "操作结果描述",
  data: [], // 数据数组或对象
  // 其他字段...
}
```

## 性能优化

1. **数据库索引**: 已为常用查询字段创建索引
2. **批量操作**: 使用批量插入/更新提高数据库性能
3. **缓存策略**: 优先从数据库查询，避免重复爬取
4. **并发控制**: 合理控制并发请求数量

## 扩展功能

可以根据需要扩展以下功能：

1. **数据导出**: 支持Excel、CSV等格式导出
2. **数据分析**: 添加财务指标计算和分析功能
3. **定时任务**: 实现自动更新机制
4. **数据可视化**: 提供图表展示功能
5. **API接口**: 为前端提供RESTful API 