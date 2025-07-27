const HKFinancialData = require("../models/hkFinancialData");
const CrawlerHKFinancialData = require("./crawlerHKFinancialData");

class HKFinancialService {
  constructor() {
    this.crawler = new CrawlerHKFinancialData();
  }

  /**
   * 获取指定股票的财务数据
   * @param {string} securityCode - 股票代码
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 查询结果
   */
  async getFinancialData(securityCode, options = {}) {
    try {
      console.log(`[Service] 查询股票财务数据: ${securityCode}`);

      // 从数据库查询
      let data = await HKFinancialData.findByCode(securityCode);

      // 如果数据库没有数据，且允许爬取，则进行爬取
      if (!data.length && options.allowCrawl !== false) {
        console.log(`[Service] 数据库无数据，开始爬取: ${securityCode}`);
        const crawlResult = await this.crawler.crawlFinancialData(securityCode);

        if (crawlResult.success) {
          data = await HKFinancialData.findByCode(securityCode);
          console.log(`[Service] 爬取完成，获取到${data.length}条数据`);
        } else {
          console.log(`[Service] 爬取失败: ${crawlResult.message}`);
        }
      }

      // 应用过滤条件
      if (options.startDate) {
        data = data.filter(
          (item) => new Date(item.REPORT_DATE) >= new Date(options.startDate)
        );
      }

      if (options.endDate) {
        data = data.filter(
          (item) => new Date(item.REPORT_DATE) <= new Date(options.endDate)
        );
      }

      // 限制返回数量
      if (options.limit) {
        data = data.slice(0, options.limit);
      }

      return {
        success: true,
        data: data,
        count: data.length,
        securityCode: securityCode,
      };
    } catch (error) {
      console.error(`[Service] 查询财务数据失败:`, error);
      return {
        success: false,
        message: `查询失败: ${error.message}`,
        data: [],
      };
    }
  }

  /**
   * 获取指定股票和报告期的财务数据
   * @param {string} securityCode - 股票代码
   * @param {string} reportDate - 报告日期
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 查询结果
   */
  async getFinancialDataByDate(securityCode, reportDate, options = {}) {
    console.log("getFinancialDataByDate", securityCode, reportDate);
    try {
      console.log(
        `[Service] 查询股票特定报告期财务数据: ${securityCode}, ${reportDate}`
      );

      // 从数据库查询
      let data = await HKFinancialData.findByCodeAndDate(
        securityCode,
        reportDate
      );

      // 如果数据库没有数据，且允许爬取，则进行爬取
      if (!data && options.allowCrawl !== false) {
        console.log(`[Service] 数据库无数据，开始爬取: ${securityCode}`);
        const crawlResult = await this.crawler.crawlFinancialData(securityCode);

        if (crawlResult.success) {
          data = await HKFinancialData.findByCodeAndDate(
            securityCode,
            reportDate
          );
          console.log(`[Service] 爬取完成，获取到数据: ${!!data}`);
        } else {
          console.log(`[Service] 爬取失败: ${crawlResult.message}`);
        }
      }

      return {
        success: true,
        data: data,
        securityCode: securityCode,
        reportDate: reportDate,
      };
    } catch (error) {
      console.error(`[Service] 查询财务数据失败:`, error);
      return {
        success: false,
        message: `查询失败: ${error.message}`,
        data: null,
      };
    }
  }

  /**
   * 获取财务数据统计信息
   * @param {string} securityCode - 股票代码
   * @returns {Promise<Object>} 统计信息
   */
  async getFinancialDataStats(securityCode) {
    try {
      console.log(`[Service] 获取财务数据统计: ${securityCode}`);

      const data = await HKFinancialData.findByCode(securityCode);

      if (!data.length) {
        return {
          success: true,
          stats: {
            totalRecords: 0,
            latestReportDate: null,
            earliestReportDate: null,
            reportTypes: [],
            hasData: false,
          },
        };
      }

      const reportDates = data
        .map((item) => new Date(item.REPORT_DATE))
        .sort((a, b) => b - a);
      const reportTypes = [...new Set(data.map((item) => item.DATE_TYPE_CODE))];

      const stats = {
        totalRecords: data.length,
        latestReportDate: reportDates[0]?.toISOString().split("T")[0] || null,
        earliestReportDate:
          reportDates[reportDates.length - 1]?.toISOString().split("T")[0] ||
          null,
        reportTypes: reportTypes,
        hasData: true,
      };

      return {
        success: true,
        stats: stats,
      };
    } catch (error) {
      console.error(`[Service] 获取统计信息失败:`, error);
      return {
        success: false,
        message: `获取统计信息失败: ${error.message}`,
        stats: null,
      };
    }
  }

  /**
   * 强制更新指定股票的财务数据
   * @param {string} securityCode - 股票代码
   * @returns {Promise<Object>} 更新结果
   */
  async updateFinancialData(securityCode) {
    try {
      console.log(`[Service] 强制更新股票财务数据: ${securityCode}`);

      const result = await this.crawler.crawlFinancialData(securityCode);

      if (result.success) {
        // 重新查询数据
        const data = await HKFinancialData.findByCode(securityCode);
        return {
          success: true,
          message: "数据更新成功",
          data: data,
          count: data.length,
          summary: result.summary,
        };
      } else {
        return {
          success: false,
          message: result.message,
          data: [],
        };
      }
    } catch (error) {
      console.error(`[Service] 更新财务数据失败:`, error);
      return {
        success: false,
        message: `更新失败: ${error.message}`,
        data: [],
      };
    }
  }

  /**
   * 批量更新多个股票的财务数据
   * @param {Array} securityCodes - 股票代码数组
   * @returns {Promise<Object>} 批量更新结果
   */
  async updateBatchFinancialData(securityCodes) {
    try {
      console.log(
        `[Service] 批量更新财务数据，共${securityCodes.length}个股票`
      );

      const results = await this.crawler.crawlBatchFinancialData(securityCodes);

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      return {
        success: true,
        message: `批量更新完成，成功${successCount}个，失败${failCount}个`,
        results: results,
        summary: {
          total: securityCodes.length,
          success: successCount,
          failed: failCount,
        },
      };
    } catch (error) {
      console.error(`[Service] 批量更新失败:`, error);
      return {
        success: false,
        message: `批量更新失败: ${error.message}`,
        results: [],
      };
    }
  }

  /**
   * 检查数据是否需要更新
   * @param {string} securityCode - 股票代码
   * @param {number} daysThreshold - 天数阈值，默认30天
   * @returns {Promise<Object>} 检查结果
   */
  async checkDataFreshness(securityCode, daysThreshold = 30) {
    try {
      console.log(`[Service] 检查数据新鲜度: ${securityCode}`);

      const latestDate = await HKFinancialData.getLatestReportDate(
        securityCode
      );

      if (!latestDate) {
        return {
          needsUpdate: true,
          reason: "数据库中没有数据",
          latestDate: null,
        };
      }

      const daysSinceUpdate = Math.floor(
        (new Date() - new Date(latestDate)) / (1000 * 60 * 60 * 24)
      );
      const needsUpdate = daysSinceUpdate > daysThreshold;

      return {
        needsUpdate: needsUpdate,
        reason: needsUpdate ? `数据已过期${daysSinceUpdate}天` : "数据较新",
        latestDate: latestDate,
        daysSinceUpdate: daysSinceUpdate,
      };
    } catch (error) {
      console.error(`[Service] 检查数据新鲜度失败:`, error);
      return {
        needsUpdate: true,
        reason: `检查失败: ${error.message}`,
        latestDate: null,
      };
    }
  }

  /**
   * 获取所有有财务数据的股票代码
   * @returns {Promise<Array>} 股票代码数组
   */
  async getAllStockCodes() {
    try {
      console.log(`[Service] 获取所有有财务数据的股票代码`);

      const [rows] = await require("../config/database").query(
        "SELECT DISTINCT SECURITY_CODE, SECURITY_NAME_ABBR FROM hk_financial_data ORDER BY SECURITY_CODE"
      );

      return {
        success: true,
        data: rows,
        count: rows.length,
      };
    } catch (error) {
      console.error(`[Service] 获取股票代码失败:`, error);
      return {
        success: false,
        message: `获取股票代码失败: ${error.message}`,
        data: [],
      };
    }
  }
}

module.exports = HKFinancialService;
