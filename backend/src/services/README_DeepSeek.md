# DeepSeek LLM Service

DeepSeek LLM服务集成，用于自动生成财务分析数据，包括公司正面反面信息、经营评级、收入分布和关键业务指标。

## 功能特性

### 1. 自动生成分析数据
- **正面反面信息**：基于财务数据生成公司优势和劣势分析
- **经营评级**：管理效率、产品创新、团队质量、护城河评分
- **收入分布**：收入来源成分和地区分布分析
- **关键指标**：业务指标增长率预测

### 2. 智能提示词构建
- 根据财务数据自动构建专业提示词
- 支持中文财务术语和行业分析
- 结构化JSON输出格式

### 3. 容错机制
- API调用失败时返回默认数据
- 响应解析失败时降级处理
- 超时和错误重试机制

## 环境配置

### 1. 设置API密钥
在环境变量中设置DeepSeek API密钥：

```bash
# .env 文件
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 2. 获取API密钥
1. 访问 [DeepSeek官网](https://platform.deepseek.com/)
2. 注册账号并登录
3. 在API管理页面获取API密钥

## API接口

### 1. 生成正面反面信息
```javascript
const result = await deepseekService.generateProsAndCons(companyName, financialData);
```

**输入参数：**
- `companyName`: 公司名称
- `financialData`: 财务数据对象

**输出示例：**
```json
{
  "pros": [
    "营收增长稳定，近5年复合增长率达到15%",
    "自由现金流充裕，FCF利润率维持在20%以上",
    "资产负债率合理，财务结构健康"
  ],
  "cons": [
    "行业竞争加剧，市场份额面临挑战",
    "新业务投入较大，短期可能影响盈利能力",
    "政策环境变化可能带来不确定性"
  ]
}
```

### 2. 生成经营评级
```javascript
const result = await deepseekService.generateBusinessRatings(companyName, financialData);
```

**输出示例：**
```json
{
  "managementEfficiency": 4.2,
  "productInnovation": 3.8,
  "teamQuality": 4.0,
  "moat": 3.5
}
```

### 3. 生成收入分布
```javascript
const result = await deepseekService.generateRevenueDistribution(companyName, financialData);
```

**输出示例：**
```json
{
  "revenueComposition": {
    "主营业务": 75,
    "新业务": 15,
    "其他": 10
  },
  "regionalDistribution": {
    "中国大陆": 85,
    "海外市场": 15
  }
}
```

### 4. 生成关键指标
```javascript
const result = await deepseekService.generateKeyMetrics(companyName, financialData);
```

**输出示例：**
```json
{
  "keyMetrics": {
    "用户增长率": 12.5,
    "客单价增长率": 8.3,
    "市场份额": 45.2,
    "活跃用户数": 850000000,
    "付费用户率": 15.8
  }
}
```

## 提示词模板

### 1. 正面反面信息提示词
```
请分析{公司名称}的财务数据，生成正面和反面信息。要求：
1. 正面信息不超过3条，反面信息不超过3条
2. 每条信息要通俗易懂，有数据支撑
3. 基于以下财务数据进行分析

财务数据：
- 营收：{营收}亿元，同比增长{增长率}%
- 毛利率：{毛利率}%
- FCF：{FCF}亿元，FCF利润率{FCF利润率}%
- 现金等价物：{现金}亿元
- 净利润：{净利润}亿元，同比增长{净利润增长率}%
- ROE：{ROE}%，ROA：{ROA}%

历史数据（近5年）：
{历史数据列表}

请以JSON格式返回，格式如下：
{
  "pros": ["正面信息1", "正面信息2", "正面信息3"],
  "cons": ["反面信息1", "反面信息2", "反面信息3"]
}
```

### 2. 经营评级提示词
```
请对{公司名称}的经营能力进行评级，评分范围0-5分。基于以下财务指标：

财务指标：
- ROE：{ROE}%（管理效率指标）
- 营收增长率：{营收增长率}%（创新能力指标）
- 毛利率：{毛利率}%（护城河指标）
- FCF利润率：{FCF利润率}%（经营质量指标）
- 现金比率：{现金比率}%（财务健康度）

请以JSON格式返回，格式如下：
{
  "managementEfficiency": 4.2,
  "productInnovation": 3.8,
  "teamQuality": 4.0,
  "moat": 3.5
}

评分标准：
- 5分：行业领先水平
- 4分：优秀水平
- 3分：平均水平
- 2分：低于平均
- 1分：较差水平
- 0分：极差水平
```

## 使用示例

### 在FinancialReportService中使用
```javascript
const DeepSeekService = require('./deepseekService');

class FinancialReportService {
  constructor() {
    this.deepseekService = new DeepSeekService();
  }

  async getAnalysisData(securityCode, financialData) {
    const companyName = await this.getCompanyName(securityCode);
    
    // 并行调用多个LLM服务
    const [prosCons, ratings, revenueDistribution, keyMetrics] = await Promise.allSettled([
      this.deepseekService.generateProsAndCons(companyName, financialData),
      this.deepseekService.generateBusinessRatings(companyName, financialData),
      this.deepseekService.generateRevenueDistribution(companyName, financialData),
      this.deepseekService.generateKeyMetrics(companyName, financialData)
    ]);

    return {
      pros: prosCons.status === 'fulfilled' ? prosCons.value.pros : [],
      cons: prosCons.status === 'fulfilled' ? prosCons.value.cons : [],
      ratings: ratings.status === 'fulfilled' ? ratings.value : {},
      // ... 其他数据
    };
  }
}
```

### 直接调用DeepSeek服务
```javascript
const DeepSeekService = require('./deepseekService');

const deepseekService = new DeepSeekService();

// 生成分析数据
const analysis = await deepseekService.generateProsAndCons('腾讯控股', {
  current: {
    revenue: 150000000000,
    revenueGrowth: 12.5,
    grossMargin: 30.0,
    fcf: 25000000000,
    fcfMargin: 16.7,
    // ... 其他财务数据
  },
  historical: [
    // ... 历史数据
  ]
});

console.log(analysis);
```

## 错误处理

### 1. API调用失败
```javascript
// 返回默认数据
{
  "pros": [
    "营收增长稳定，财务表现良好",
    "自由现金流充裕，具备投资价值",
    "资产负债率合理，财务结构健康"
  ],
  "cons": [
    "行业竞争加剧，市场份额面临挑战",
    "新业务投入较大，短期可能影响盈利能力",
    "政策环境变化可能带来不确定性"
  ]
}
```

### 2. 响应解析失败
- 自动降级到默认数据
- 记录警告日志
- 不影响整体服务运行

### 3. 超时处理
- 30秒超时设置
- 超时后返回默认数据
- 避免阻塞其他服务

## 性能优化

### 1. 并行调用
```javascript
// 使用Promise.allSettled并行调用多个LLM服务
const results = await Promise.allSettled([
  service1.generateData(),
  service2.generateData(),
  service3.generateData()
]);
```

### 2. 缓存机制
- 建议对LLM生成结果进行缓存
- 避免重复调用相同数据
- 提高响应速度

### 3. 批量处理
- 支持批量生成多个公司的分析数据
- 减少API调用次数
- 提高整体效率

## 注意事项

1. **API密钥安全**：确保API密钥安全存储，不要提交到代码仓库
2. **调用频率**：注意API调用频率限制，避免超出配额
3. **数据质量**：LLM生成的数据仅供参考，需要人工审核
4. **成本控制**：监控API调用成本，合理使用
5. **备用方案**：当LLM服务不可用时，系统应能正常运行

## 扩展功能

### 1. 支持更多LLM模型
- 可以轻松扩展到其他LLM服务
- 支持模型切换和对比
- 多模型融合分析

### 2. 自定义提示词
- 支持行业特定的提示词模板
- 可配置的分析维度
- 灵活的输出格式

### 3. 历史数据学习
- 基于历史分析结果优化提示词
- 机器学习模型训练
- 持续改进分析质量 