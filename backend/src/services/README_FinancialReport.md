# Financial Report Service

财务报告服务，为前端财报页面提供完整的数据支持，包括股票价格分析、财务指标计算、DCF估值模型等。

## 功能特性

### 1. 报告期管理
- 支持年度报告（YYYY）和季度报告（YYYY-Q1/Q2/Q3/Q4）
- 自动计算最新报告期
- 提供可用报告期列表

### 2. 股票价格分析
- 计算5年股票价格年化增长率（CAGR）
- 获取报告期末价格和5年前价格
- 支持价格时间段范围查询

### 3. 财务指标计算
- 营收数据及同比增长率
- 毛利数据及毛利率
- 自由现金流（FCF）及FCF利润率
- 现金等价物数据
- 历史同比数据（最多5年）

### 4. DCF估值模型
- **DCF模型**：基于当前FCF计算公允价值
- **反DCF模型**：基于当前市值反推隐含增长率
- 支持敏感性分析和可行性概率计算

### 5. 分析数据（LLM生成）
- 公司正面和反面信息（DeepSeek自动生成）
- 经营评级（管理效率、产品创新、团队质量、护城河）
- 收入来源成分占比
- 收入地区分布
- 关键业务指标增长率

## API 接口

### 1. 获取财报数据
```
GET /api/financial-report/:securityCode/:reportDate
```

**参数：**
- `securityCode`: 股票代码（如：00700）
- `reportDate`: 报告期（如：2024-Q1, 2024）

**响应示例：**
```json
{
  "success": true,
  "data": {
    "stockCode": "00700",
    "reportDate": "2024-Q1",
    "reportInfo": {
      "reportDate": "2024-Q1",
      "reportType": "quarterly",
      "fiscalYear": 2024,
      "quarter": 1,
      "reportDateObj": "2024-03-30T00:00:00.000Z"
    },
    "stockPrice": {
      "reportEndPrice": 129.0,
      "fiveYearsAgoPrice": 85.0,
      "cagr": 8.7,
      "priceRange": {
        "startDate": "2019-03-30",
        "endDate": "2024-03-30",
        "totalDays": 1250
      }
    },
    "financial": {
      "current": {
        "revenue": 150000000000,
        "revenueGrowth": 12.5,
        "grossProfit": 45000000000,
        "grossMargin": 30.0,
        "fcf": 25000000000,
        "fcfMargin": 16.7,
        "fcfGrowth": 15.2,
        "cashEquivalents": 87000000000
      },
      "historical": [...]
    },
    "dcf": {
      "assumptions": {
        "wacc": 9.6,
        "terminalGrowthRate": 2.5,
        "fcfGrowthRate": 10.0,
        "growthPeriod": 5
      },
      "fairValuePerShare": 230.0,
      "expectedReturn": 12.2
    },
    "reverseDcf": {
      "impliedGrowthRate": 8.7,
      "feasibilityProbability": 75.0
    },
    "analysis": {
      "pros": [...],
      "cons": [...],
      "ratings": {...}
    }
  }
}
```

### 2. 获取可用报告期列表
```
GET /api/financial-report/:securityCode/report-dates
```

**响应示例：**
```json
{
  "success": true,
  "data": ["2024-Q1", "2023", "2023-Q4", "2023-Q3"]
}
```

### 3. 获取最新财报数据
```
GET /api/financial-report/:securityCode/latest
```

**⚠️ 重要说明：**
路由定义顺序很重要，必须按照以下顺序定义以避免冲突：
1. `/:securityCode/report-dates` - 报告期列表
2. `/:securityCode/latest` - 最新数据
3. `/:securityCode/:reportDate` - 特定报告期数据

这是因为Express按定义顺序匹配路由，如果顺序错误，`/latest` 和 `/report-dates` 会被 `/:reportDate` 路由捕获。

## 计算公式

### 1. 股票年化增长率（CAGR）
```
CAGR = (期末股价 / 期初股价)^(1/n) - 1
```

### 2. 自由现金流（FCF）
```
FCF = 经营活动现金流量净额 - 资本支出
```

### 3. FCF利润率
```
FCF利润率 = FCF / 营收 × 100%
```

### 4. DCF模型
```
公允价值 = Σ(FCF_t / (1+WACC)^t) + TV / (1+WACC)^N
其中：
- FCF_t = FCF_0 × (1+g)^t
- TV = FCF_N × (1+g∞) / (WACC-g∞)
```

### 5. 反DCF模型
通过迭代求解隐含增长率g，使得：
```
市值 = Σ(FCF_0 × (1+g)^t / (1+WACC)^t) + TV / (1+WACC)^N
```

## 数据来源

### 1. 股票价格数据
- 来源：`HKStockTradingService.getHistoryData()`
- 计算：5年CAGR、价格区间等

### 2. 财务数据
- 来源：`HKFinancialService.getFinancialDataByDate()`
- 包含：当期数据、历史同比数据、年度数据
- 计算：FCF、FCF利润率、增长率等

### 3. DCF估值数据
- 来源：基于年度财务数据计算（优先使用年度数据）
- 包含：未来FCF预测、终值、公允价值等
- 数据选择逻辑：
  - 优先使用年度报告期数据
  - 如果当前是季度报告且不是Q4，使用上一年度数据
  - 如果找不到年度数据，使用当前报告期数据作为备用

### 4. 反DCF数据
- 来源：基于当前市值反推隐含增长率（使用年度数据）
- 包含：隐含增长率、可行性概率等
- 数据选择逻辑：与DCF相同

### 5. LLM分析数据
- 来源：DeepSeek API
- 包含：公司优缺点、评级、收入分布等

## 年度数据获取逻辑

### 1. 年度数据选择规则
- **季度报告（Q1-Q3）**：使用上一年度数据
- **季度报告（Q4）**：使用当年年度数据
- **年度报告**：使用当年年度数据

### 2. 年度数据查找策略
1. 首先尝试获取指定年份的年度数据（12月31日）
2. 如果找不到，查找最近的年度数据
3. 如果仍然找不到，使用当前报告期数据作为备用

### 3. 数据一致性
- DCF和反DCF计算都使用相同的年度数据
- 现金等价物仍使用当前报告期数据（因为需要最新状态）
- 市值优先使用年度数据，如果没有则使用当前报告期数据

## 使用示例

### JavaScript
```javascript
// 获取腾讯2024年Q1财报数据
const response = await fetch('/api/financial-report/00700/2024-Q1');
const data = await response.json();

// 获取最新财报数据
const latestResponse = await fetch('/api/financial-report/00700/latest');
const latestData = await latestResponse.json();

// 获取可用报告期列表
const datesResponse = await fetch('/api/financial-report/00700/report-dates');
const datesData = await datesResponse.json();
```

### Python
```python
import requests

# 获取财报数据
response = requests.get('http://localhost:3000/api/financial-report/00700/2024-Q1')
data = response.json()

# 获取最新数据
latest_response = requests.get('http://localhost:3000/api/financial-report/00700/latest')
latest_data = latest_response.json()
```

## 错误处理

服务会返回标准化的错误响应：

```json
{
  "success": false,
  "message": "错误描述信息"
}
```

常见错误：
- 股票代码不存在
- 报告期格式错误
- 数据获取失败
- 计算参数无效

## 依赖服务

- `HKFinancialService`: 港股财务数据服务
- `HKStockTradingService`: 港股交易数据服务
- `DeepSeekService`: DeepSeek LLM服务（自动生成分析数据）
- `moment`: 日期处理库

## LLM集成

### DeepSeek服务配置
1. **环境变量设置**：
   ```bash
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ```

2. **自动生成内容**：
   - 公司正面和反面信息分析
   - 经营能力评级（0-5分）
   - 收入来源和地区分布
   - 关键业务指标增长率

3. **容错机制**：
   - API调用失败时自动返回默认数据
   - 响应解析失败时降级处理
   - 30秒超时保护

### 测试LLM服务
```bash
# 运行DeepSeek服务测试
node src/examples/testDeepSeekService.js
```

## 注意事项

1. **数据依赖**: 需要确保相关的财务数据和股票价格数据已存在
2. **计算精度**: DCF模型使用迭代计算，可能存在精度误差
3. **LLM集成**: 分析数据通过DeepSeek LLM服务自动生成，需要配置API密钥
4. **缓存策略**: 建议对计算结果和LLM生成结果进行缓存以提高性能
5. **参数调优**: WACC、永续增长率等参数可根据行业特点调整
6. **API成本**: 注意DeepSeek API调用成本，建议实施缓存和限流机制 