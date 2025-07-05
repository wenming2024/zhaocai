const axios = require("axios");
const HKFinancialData = require("../models/hkFinancialData");

class CrawlerHKFinancialData {
  constructor() {
    this.baseURL =
      "https://datacenter.eastmoney.com/securities/api/data/v1/get";
    this.timeout = 30000;
  }

  /**
   * 构建请求参数
   * @param {string} reportName - 报告名称
   * @param {string} securityCode - 股票代码
   * @param {Object} options - 其他选项
   * @returns {Object} 请求参数
   */
  buildParams(reportName, securityCode, options = {}) {
    // 根据不同的报告名称设置对应的v参数值、排序参数和列参数
    const configMap = {
      RPT_HKF10_FN_MAININDICATOR: {
        v: "0391365200322224", // 重要指标
        sortTypes: -1,
        sortColumns: "STD_REPORT_DATE",
        columns: "ALL",
        pageSize: 100,
      },
      RPT_HKF10_FN_BALANCE_PC: {
        v: "07956401139605905", // 资产负债表
        sortTypes: "-1,1",
        sortColumns: "REPORT_DATE,STD_ITEM_CODE",
        columns:
          "SECUCODE,SECURITY_CODE,SECURITY_NAME_ABBR,ORG_CODE,REPORT_DATE,DATE_TYPE_CODE,FISCAL_YEAR,STD_ITEM_CODE,STD_ITEM_NAME,AMOUNT,STD_REPORT_DATE",
        pageSize: "",
      },
      RPT_HKF10_FN_INCOME_PC: {
        v: "08122767709863961", // 利润表
        sortTypes: "-1,1",
        sortColumns: "REPORT_DATE,STD_ITEM_CODE",
        columns:
          "SECUCODE,SECURITY_CODE,SECURITY_NAME_ABBR,ORG_CODE,REPORT_DATE,DATE_TYPE_CODE,FISCAL_YEAR,START_DATE,STD_ITEM_CODE,STD_ITEM_NAME,AMOUNT",
        pageSize: "",
      },
      RPT_HKF10_FN_CASHFLOW_PC: {
        v: "05295176816734208", // 现金流量表
        sortTypes: "-1,1",
        sortColumns: "REPORT_DATE,STD_ITEM_CODE",
        columns:
          "SECUCODE,SECURITY_CODE,SECURITY_NAME_ABBR,ORG_CODE,REPORT_DATE,DATE_TYPE_CODE,FISCAL_YEAR,START_DATE,STD_ITEM_CODE,STD_ITEM_NAME,AMOUNT",
        pageSize: "",
      },
    };

    const config = configMap[reportName] || {
      v: Date.now().toString(),
      sortTypes: -1,
      sortColumns: "STD_REPORT_DATE",
      columns: "ALL",
    };

    const defaultParams = {
      reportName,
      columns: config.columns,
      quoteColumns: "",
      filter: `(SECUCODE="${securityCode}.HK")`,
      pageNumber: 1,
      pageSize: options.pageSize || config.pageSize,
      sortTypes: config.sortTypes,
      sortColumns: config.sortColumns,
      source: "F10",
      client: "PC",
      v: config.v,
    };

    // 如果有报告期参数，添加到filter中
    if (options.reportDates && options.reportDates.length > 0) {
      const dateFilter = options.reportDates
        .map((date) => `'${date}'`)
        .join(",");
      defaultParams.filter += `(REPORT_DATE in (${dateFilter}))`;
    }

    return defaultParams;
  }

  /**
   * 发送HTTP请求
   * @param {Object} params - 请求参数
   * @returns {Promise<Object>} 响应数据
   */
  async makeRequest(params) {
    console.log(`[Crawler] 请求参数:`, params);
    try {
      // 获取一下完整的请求url
      const requestUrl = `${this.baseURL}?${new URLSearchParams(
        params
      ).toString()}`;
      console.log(`[Crawler] 请求URL:`, requestUrl);

      const response = await axios.get(this.baseURL, {
        params,
        timeout: this.timeout,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      console.log(`[Crawler] 响应状态: ${response.status}`);

      if (response.data && response.data.code === 0) {
        // 根据文档，数据可能在 result 字段中，也可能直接在 data 字段中
        return response.data.result || response.data;
      } else {
        throw new Error(`API返回错误: ${response.data?.message || "未知错误"}`);
      }
    } catch (error) {
      console.error(`[Crawler] 请求失败:`, error.message);
      throw error;
    }
  }

  /**
   * 爬取核心指标数据
   * @param {string} securityCode - 股票代码
   * @returns {Promise<Array>} 核心指标数据
   */
  async crawlMainIndicators(securityCode) {
    console.log(`[Crawler] 开始爬取核心指标数据: ${securityCode}`);

    const params = this.buildParams("RPT_HKF10_FN_MAININDICATOR", securityCode);
    const response = await this.makeRequest(params);

    if (response.data && Array.isArray(response.data)) {
      console.log(
        `[Crawler] 核心指标数据获取成功，共${response.data.length}条记录`
      );
      return response.data;
    } else {
      console.log(`[Crawler] 核心指标数据为空`);
      return [];
    }
  }

  /**
   * 爬取资产负债表数据
   * @param {string} securityCode - 股票代码
   * @param {Array} reportDates - 报告日期数组
   * @returns {Promise<Array>} 资产负债表数据
   */
  async crawlBalanceSheet(securityCode, reportDates) {
    console.log(
      `[Crawler] 开始爬取资产负债表数据: ${securityCode}, 报告期: ${reportDates.length}个`
    );

    const params = this.buildParams("RPT_HKF10_FN_BALANCE_PC", securityCode, {
      reportDates,
      pageSize: "", // 不限制页面大小
    });

    const response = await this.makeRequest(params);

    if (response.data && Array.isArray(response.data)) {
      console.log(
        `[Crawler] 资产负债表数据获取成功，共${response.data.length}条记录`
      );
      return response.data;
    } else {
      console.log(`[Crawler] 资产负债表数据为空`);
      return [];
    }
  }

  /**
   * 爬取利润表数据
   * @param {string} securityCode - 股票代码
   * @param {Array} reportDates - 报告日期数组
   * @returns {Promise<Array>} 利润表数据
   */
  async crawlIncomeStatement(securityCode, reportDates) {
    console.log(
      `[Crawler] 开始爬取利润表数据: ${securityCode}, 报告期: ${reportDates.length}个`
    );

    const params = this.buildParams("RPT_HKF10_FN_INCOME_PC", securityCode, {
      reportDates,
      pageSize: "", // 不限制页面大小
    });

    const response = await this.makeRequest(params);

    if (response.data && Array.isArray(response.data)) {
      console.log(
        `[Crawler] 利润表数据获取成功，共${response.data.length}条记录`
      );
      return response.data;
    } else {
      console.log(`[Crawler] 利润表数据为空`);
      return [];
    }
  }

  /**
   * 爬取现金流量表数据
   * @param {string} securityCode - 股票代码
   * @param {Array} reportDates - 报告日期数组
   * @returns {Promise<Array>} 现金流量表数据
   */
  async crawlCashFlow(securityCode, reportDates) {
    console.log(
      `[Crawler] 开始爬取现金流量表数据: ${securityCode}, 报告期: ${reportDates.length}个`
    );

    const params = this.buildParams("RPT_HKF10_FN_CASHFLOW_PC", securityCode, {
      reportDates,
      pageSize: "", // 不限制页面大小
    });

    const response = await this.makeRequest(params);

    if (response.data && Array.isArray(response.data)) {
      console.log(
        `[Crawler] 现金流量表数据获取成功，共${response.data.length}条记录`
      );
      return response.data;
    } else {
      console.log(`[Crawler] 现金流量表数据为空`);
      return [];
    }
  }

  /**
   * 合并财务数据
   * @param {Array} mainIndicators - 核心指标数据
   * @param {Array} balanceSheet - 资产负债表数据
   * @param {Array} incomeStatement - 利润表数据
   * @param {Array} cashFlow - 现金流量表数据
   * @returns {Array} 合并后的财务数据
   */
  mergeFinancialData(mainIndicators, balanceSheet, incomeStatement, cashFlow) {
    console.log(`[Crawler] 开始合并财务数据`);

    // 以核心指标数据为基础，按股票代码和报告日期分组
    const mergedData = new Map();

    // 处理核心指标数据
    mainIndicators.forEach((item) => {
      const key = `${item.SECURITY_CODE}_${item.REPORT_DATE}`;
      mergedData.set(key, {
        ...item,
        BALANCE_STD_ITEM_CODE: null,
        BALANCE_STD_ITEM_NAME: null,
        BALANCE_AMOUNT: null,
        INCOME_STD_ITEM_CODE: null,
        INCOME_STD_ITEM_NAME: null,
        INCOME_AMOUNT: null,
        CASHFLOW_STD_ITEM_CODE: null,
        CASHFLOW_STD_ITEM_NAME: null,
        CASHFLOW_AMOUNT: null,
      });
    });

    // 处理资产负债表数据
    balanceSheet.forEach((item) => {
      const key = `${item.SECURITY_CODE}_${item.REPORT_DATE}`;
      if (mergedData.has(key)) {
        const existing = mergedData.get(key);
        mergedData.set(key, {
          ...existing,
          BALANCE_STD_ITEM_CODE: item.STD_ITEM_CODE,
          BALANCE_STD_ITEM_NAME: item.STD_ITEM_NAME,
          BALANCE_AMOUNT: item.AMOUNT,
        });
      }
    });

    // 处理利润表数据
    incomeStatement.forEach((item) => {
      const key = `${item.SECURITY_CODE}_${item.REPORT_DATE}`;
      if (mergedData.has(key)) {
        const existing = mergedData.get(key);
        mergedData.set(key, {
          ...existing,
          INCOME_STD_ITEM_CODE: item.STD_ITEM_CODE,
          INCOME_STD_ITEM_NAME: item.STD_ITEM_NAME,
          INCOME_AMOUNT: item.AMOUNT,
        });
      }
    });

    // 处理现金流量表数据
    cashFlow.forEach((item) => {
      const key = `${item.SECURITY_CODE}_${item.REPORT_DATE}`;
      if (mergedData.has(key)) {
        const existing = mergedData.get(key);
        mergedData.set(key, {
          ...existing,
          CASHFLOW_STD_ITEM_CODE: item.STD_ITEM_CODE,
          CASHFLOW_STD_ITEM_NAME: item.STD_ITEM_NAME,
          CASHFLOW_AMOUNT: item.AMOUNT,
        });
      }
    });

    const result = Array.from(mergedData.values());
    console.log(`[Crawler] 财务数据合并完成，共${result.length}条记录`);
    return result;
  }

  /**
   * 爬取指定股票的完整财务数据
   * @param {string} securityCode - 股票代码
   * @returns {Promise<Object>} 爬取结果
   */
  async crawlFinancialData(securityCode) {
    console.log(`[Crawler] 开始爬取股票财务数据: ${securityCode}`);

    try {
      // 1. 先爬取核心指标数据，获取报告期信息
      const mainIndicators = await this.crawlMainIndicators(securityCode);

      if (!mainIndicators.length) {
        return {
          success: false,
          message: "未获取到核心指标数据",
          data: [],
        };
      }

      // 2. 提取报告期，限制最多100个
      const reportDates = mainIndicators
        .slice(0, 100)
        .map((item) => item.REPORT_DATE.split(" ")[0]); // 只取日期部分

      console.log(
        `[Crawler] 提取到${reportDates.length}个报告期:`,
        reportDates
      );

      // 3. 并行爬取其他三个接口的数据
      const [balanceSheet, incomeStatement, cashFlow] = await Promise.all([
        this.crawlBalanceSheet(securityCode, reportDates),
        this.crawlIncomeStatement(securityCode, reportDates),
        this.crawlCashFlow(securityCode, reportDates),
      ]);

      // 4. 合并数据
      const mergedData = this.mergeFinancialData(
        mainIndicators,
        balanceSheet,
        incomeStatement,
        cashFlow
      );

      // 5. 保存到数据库
      if (mergedData.length > 0) {
        const affectedRows = await HKFinancialData.bulkUpsert(mergedData);
        console.log(`[Crawler] 数据保存成功，影响${affectedRows}行`);
      }

      return {
        success: true,
        message: "财务数据爬取成功",
        data: mergedData,
        summary: {
          mainIndicators: mainIndicators.length,
          balanceSheet: balanceSheet.length,
          incomeStatement: incomeStatement.length,
          cashFlow: cashFlow.length,
          merged: mergedData.length,
        },
      };
    } catch (error) {
      console.error(`[Crawler] 爬取财务数据失败:`, error);
      return {
        success: false,
        message: `爬取失败: ${error.message}`,
        data: [],
      };
    }
  }

  /**
   * 批量爬取多个股票的财务数据
   * @param {Array} securityCodes - 股票代码数组
   * @returns {Promise<Array>} 批量爬取结果
   */
  async crawlBatchFinancialData(securityCodes) {
    console.log(
      `[Crawler] 开始批量爬取财务数据，共${securityCodes.length}个股票`
    );

    const results = [];

    for (let i = 0; i < securityCodes.length; i++) {
      const securityCode = securityCodes[i];
      console.log(
        `[Crawler] 进度: ${i + 1}/${
          securityCodes.length
        }, 当前股票: ${securityCode}`
      );

      try {
        const result = await this.crawlFinancialData(securityCode);
        results.push({
          securityCode,
          ...result,
        });

        // 添加延迟，避免请求过于频繁
        if (i < securityCodes.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`[Crawler] 爬取股票${securityCode}失败:`, error);
        results.push({
          securityCode,
          success: false,
          message: `爬取失败: ${error.message}`,
          data: [],
        });
      }
    }

    console.log(
      `[Crawler] 批量爬取完成，成功${
        results.filter((r) => r.success).length
      }个，失败${results.filter((r) => !r.success).length}个`
    );
    return results;
  }
}

module.exports = CrawlerHKFinancialData;
