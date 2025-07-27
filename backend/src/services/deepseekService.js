require("dotenv").config();
const axios = require("axios");
const {
  safeNumber,
  safeToBillion,
  safeToPercent,
} = require("../utils/numberUtils");

class DeepSeekService {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.baseURL = "https://api.deepseek.com";
    this.model = "deepseek-chat";
  }

  /**
   * 调用DeepSeek API
   * @param {string} prompt - 提示词
   * @param {number} maxTokens - 最大token数
   * @returns {Promise<Object>} API响应
   */
  async callDeepSeek(prompt, maxTokens = 2000) {
    // console.log("callDeepSeek", prompt, maxTokens);
    try {
      if (!this.apiKey) {
        throw new Error("DeepSeek API key not configured");
      }

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: maxTokens,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30秒超时
        }
      );
      // console.log("response", response);

      return {
        success: true,
        data: response.data.choices[0].message.content,
      };
    } catch (error) {
      console.error(`[DeepSeekService] API调用失败:`, error.message);
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  /**
   * 生成公司正面和反面信息
   * @param {string} companyName - 公司名称
   * @param {Object} financialData - 财务数据
   * @returns {Promise<Object>} 正面和反面信息
   */
  async generateProsAndCons(companyName, financialData) {
    const prompt = this.buildProsConsPrompt(companyName, financialData);
    console.log("generateProsAndCons", prompt);
    const result = await this.callDeepSeek(prompt, 1500);

    if (!result.success) {
      return this.getDefaultProsCons();
    }

    try {
      // 尝试解析JSON响应
      const parsed = this.safeParseJSON(result.data);
      if (!parsed) {
        return this.getDefaultProsCons();
      }
      return {
        pros: parsed.pros || [],
        cons: parsed.cons || [],
      };
    } catch (error) {
      console.warn(`[DeepSeekService] 解析正面反面信息失败:`, error);
      return this.getDefaultProsCons();
    }
  }

  /**
   * 生成公司经营评级
   * @param {string} companyName - 公司名称
   * @param {Object} financialData - 财务数据
   * @returns {Promise<Object>} 经营评级
   */
  async generateBusinessRatings(companyName, financialData) {
    const prompt = this.buildRatingsPrompt(companyName, financialData);
    const result = await this.callDeepSeek(prompt, 1000);

    if (!result.success) {
      return this.getDefaultRatings();
    }

    try {
      const parsed = this.safeParseJSON(result.data);
      if (!parsed) {
        return this.getDefaultRatings();
      }
      return {
        managementEfficiency: parsed.managementEfficiency || 3.5,
        productInnovation: parsed.productInnovation || 3.5,
        teamQuality: parsed.teamQuality || 3.5,
        moat: parsed.moat || 3.5,
      };
    } catch (error) {
      console.warn(`[DeepSeekService] 解析经营评级失败:`, error);
      return this.getDefaultRatings();
    }
  }

  /**
   * 生成收入来源和地区分布
   * @param {string} companyName - 公司名称
   * @param {Object} financialData - 财务数据
   * @returns {Promise<Object>} 收入分布数据
   */
  async generateRevenueDistribution(companyName, financialData) {
    const prompt = this.buildRevenuePrompt(companyName, financialData);
    const result = await this.callDeepSeek(prompt, 1200);

    if (!result.success) {
      return this.getDefaultRevenueDistribution();
    }

    try {
      const parsed = this.safeParseJSON(result.data);
      if (!parsed) {
        return this.getDefaultRevenueDistribution();
      }
      return {
        revenueComposition: parsed.revenueComposition || {},
        regionalDistribution: parsed.regionalDistribution || {},
      };
    } catch (error) {
      console.warn(`[DeepSeekService] 解析收入分布失败:`, error);
      return this.getDefaultRevenueDistribution();
    }
  }

  /**
   * 生成关键业务指标
   * @param {string} companyName - 公司名称
   * @param {Object} financialData - 财务数据
   * @returns {Promise<Object>} 关键业务指标
   */
  async generateKeyMetrics(companyName, financialData) {
    const prompt = this.buildMetricsPrompt(companyName, financialData);
    const result = await this.callDeepSeek(prompt, 1000);

    if (!result.success) {
      return this.getDefaultKeyMetrics();
    }

    try {
      // console.log("generateKeyMetrics", result.data);
      const parsed = this.safeParseJSON(result.data);
      if (!parsed) {
        return this.getDefaultKeyMetrics();
      }
      return parsed.keyMetrics || {};
    } catch (error) {
      console.warn(`[DeepSeekService] 解析关键指标失败:`, error);
      return this.getDefaultKeyMetrics();
    }
  }

  /**
   * 构建正面反面信息提示词
   * @param {string} companyName - 公司名称
   * @param {Object} financialData - 财务数据
   * @returns {string} 提示词
   */
  buildProsConsPrompt(companyName, financialData) {
    const current = financialData.current;
    const historical = financialData.historical;
    try {
      const prompt = `请分析${companyName}的财务数据，生成正面和反面信息。要求：
1. 正面信息不超过3条，反面信息不超过3条
2. 每条信息要通俗易懂，有数据支撑
3. 基于以下财务数据进行分析

财务数据：
- 营收：${safeToBillion(current.revenue, 1)}，同比增长${safeToPercent(
        current.revenueGrowth,
        1
      )}
- 毛利率：${safeToPercent(current.grossMargin, 1)}
- FCF：${safeToBillion(current.fcf, 1)}，FCF利润率${safeToPercent(
        current.fcfMargin,
        1
      )}
- 现金等价物：${safeToBillion(current.cashEquivalents, 1)}
- 净利润：${safeToBillion(current.netProfit, 1)}，同比增长${safeToPercent(
        current.netProfitGrowth,
        1
      )}
- ROE：${safeToPercent(current.roe, 1)}，ROA：${safeToPercent(current.roa, 1)}

历史数据（近5年）：
${historical
  .map(
    (item) =>
      `- ${item.year}年：营收${safeToBillion(
        item.revenue,
        1
      )}，FCF${safeToBillion(item.fcf, 1)}`
  )
  .join("\n")}

请以JSON格式返回，格式如下：
{
  "pros": ["正面信息1", "正面信息2", "正面信息3"],
  "cons": ["反面信息1", "反面信息2", "反面信息3"]
}`;
      console.log("buildProsConsPrompt", prompt);
      return prompt;
    } catch (error) {
      console.error(`[DeepSeekService] 构建正面反面信息提示词失败:`, error);
      return "";
    }
  }

  /**
   * 构建经营评级提示词
   * @param {string} companyName - 公司名称
   * @param {Object} financialData - 财务数据
   * @returns {string} 提示词
   */
  buildRatingsPrompt(companyName, financialData) {
    const current = financialData.current;

    return `请对${companyName}的经营能力进行评级，评分范围0-5分。基于以下财务指标：

财务指标：
- ROE：${safeToPercent(current.roe, 1)}（管理效率指标）
- 营收增长率：${safeToPercent(current.revenueGrowth, 1)}（创新能力指标）
- 毛利率：${safeToPercent(current.grossMargin, 1)}（护城河指标）
- FCF利润率：${safeToPercent(current.fcfMargin, 1)}（经营质量指标）
- 现金比率：${safeToPercent(
      (safeNumber(current.cashEquivalents) / safeNumber(current.totalAssets)) *
        100,
      1
    )}（财务健康度）

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
- 0分：极差水平`;
  }

  /**
   * 构建收入分布提示词
   * @param {string} companyName - 公司名称
   * @param {Object} financialData - 财务数据
   * @returns {string} 提示词
   */
  buildRevenuePrompt(companyName, financialData) {
    const current = financialData.current;

    return `请分析${companyName}的收入来源成分和地区分布。基于以下财务数据：

财务数据：
- 总营收：${safeToBillion(current.revenue, 1)}
- 毛利率：${safeToPercent(current.grossMargin, 1)}
- 主营业务：${safeToBillion(safeNumber(current.revenue) * 0.75, 1)}（估算）
- 新业务：${safeToBillion(safeNumber(current.revenue) * 0.15, 1)}（估算）

请以JSON格式返回，格式如下：
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

注意：百分比总和应为100%`;
  }

  /**
   * 构建关键指标提示词
   * @param {string} companyName - 公司名称
   * @param {Object} financialData - 财务数据
   * @returns {string} 提示词
   */
  buildMetricsPrompt(companyName, financialData) {
    const current = financialData.current;
    const historical = financialData.historical;

    return `请分析${companyName}的关键业务指标增长率。基于以下数据：

当前数据：
- 营收增长率：${safeToPercent(current.revenueGrowth, 1)}
- 净利润增长率：${safeToPercent(current.netProfitGrowth, 1)}
- FCF增长率：${safeToPercent(current.fcfGrowth, 1)}

历史趋势：
${historical
  .map((item) => `- ${item.year}年营收：${safeToBillion(item.revenue, 1)}`)
  .join("\n")}

请以JSON格式返回关键业务指标，格式如下：
{
  "keyMetrics": {
    "用户增长率": 12.5,
    "客单价增长率": 8.3,
    "市场份额": 45.2,
    "活跃用户数": 850000000,
    "付费用户率": 15.8
  }
}

请根据公司类型和行业特点，提供合理的业务指标增长率。`;
  }

  /**
   * 获取默认正面反面信息
   * @returns {Object} 默认数据
   */
  getDefaultProsCons() {
    return {
      pros: [
        "营收增长稳定，财务表现良好",
        "自由现金流充裕，具备投资价值",
        "资产负债率合理，财务结构健康",
      ],
      cons: [
        "行业竞争加剧，市场份额面临挑战",
        "新业务投入较大，短期可能影响盈利能力",
        "政策环境变化可能带来不确定性",
      ],
    };
  }

  /**
   * 获取默认经营评级
   * @returns {Object} 默认数据
   */
  getDefaultRatings() {
    return {
      managementEfficiency: 3.5,
      productInnovation: 3.5,
      teamQuality: 3.5,
      moat: 3.5,
    };
  }

  /**
   * 获取默认收入分布
   * @returns {Object} 默认数据
   */
  getDefaultRevenueDistribution() {
    return {
      revenueComposition: {
        主营业务: 75,
        新业务: 15,
        其他: 10,
      },
      regionalDistribution: {
        中国大陆: 85,
        海外市场: 15,
      },
    };
  }

  /**
   * 安全解析JSON响应
   * @param {string} jsonString - JSON字符串
   * @returns {Object|null} 解析后的对象，失败返回null
   */
  safeParseJSON(jsonString) {
    try {
      // 移除可能的Markdown代码块格式
      let cleanedString = jsonString.trim();

      // 移除开头的 ```json 或 ```
      if (cleanedString.startsWith("```json")) {
        cleanedString = cleanedString.substring(7);
      } else if (cleanedString.startsWith("```")) {
        cleanedString = cleanedString.substring(3);
      }

      // 移除结尾的 ```
      if (cleanedString.endsWith("```")) {
        cleanedString = cleanedString.substring(0, cleanedString.length - 3);
      }

      // 清理字符串并解析JSON
      cleanedString = cleanedString.trim();
      return JSON.parse(cleanedString);
    } catch (error) {
      console.warn(`[DeepSeekService] JSON解析失败:`, error.message);
      console.warn(`[DeepSeekService] 原始字符串:`, jsonString);
      return null;
    }
  }

  /**
   * 获取默认关键指标
   * @returns {Object} 默认数据
   */
  getDefaultKeyMetrics() {
    return {
      用户增长率: 10.0,
      客单价增长率: 5.0,
      市场份额: 30.0,
    };
  }
}

module.exports = DeepSeekService;
