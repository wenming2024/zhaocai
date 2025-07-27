const moment = require("moment");
const HKFinancialData = require("../models/hkFinancialData");
const HKStockHistory = require("../models/hkStockHistory");
const HKFinancialService = require("./hkFinancialService");
const HKStockTradingService = require("./hkStockTrading");
const DeepSeekService = require("./deepseekService");
const { safeNumber, safeToBillion } = require("../utils/numberUtils");

class FinancialReportService {
  constructor() {
    this.hkFinancialService = new HKFinancialService();
    this.deepseekService = new DeepSeekService();
  }

  /**
   * 获取财报页面所需的完整数据
   * @param {string} securityCode - 股票代码
   * @param {string} reportDate - 报告期 (格式: YYYY-Q1, YYYY-Q2, YYYY-Q3, YYYY)
   * @returns {Promise<Object>} 财报页面数据
   */
  async getFinancialReportData(securityCode, reportDate) {
    try {
      console.log(
        `[FinancialReportService] 获取财报数据: ${securityCode}, ${reportDate}`
      );

      // 1. 解析报告期并获取相关数据
      const reportInfo = this.parseReportDate(reportDate);
      const currentDate = moment();

      // 2. 获取股票价格数据
      const stockPriceData = await this.getStockPriceData(
        securityCode,
        reportInfo.reportDate
      );

      // 3. 获取财务数据
      const financialData = await this.getFinancialData(
        securityCode,
        reportInfo
      );

      // 4. 计算DCF模型数据
      const dcfData = await this.calculateDCFData(
        securityCode,
        financialData,
        stockPriceData
      );

      // 5. 计算反DCF模型数据
      const reverseDcfData = await this.calculateReverseDCFData(
        securityCode,
        financialData,
        stockPriceData
      );

      // 6. 获取其他分析信息（LLM生成）
      const analysisData = await this.getAnalysisData(
        securityCode,
        financialData
      );

      return {
        success: true,
        data: {
          stockCode: securityCode,
          reportDate: reportDate,
          reportInfo: reportInfo,
          stockPrice: stockPriceData,
          financial: financialData,
          dcf: dcfData,
          reverseDcf: reverseDcfData,
          analysis: analysisData,
          timestamp: currentDate.toISOString(),
        },
      };
    } catch (error) {
      console.error(`[FinancialReportService] 获取财报数据失败:`, error);
      return {
        success: false,
        message: `获取财报数据失败: ${error.message}`,
        data: null,
      };
    }
  }

  /**
   * 解析报告期
   * @param {string} reportDate - 报告期字符串
   * @returns {Object} 解析后的报告期信息
   */
  parseReportDate(reportDate) {
    const currentDate = moment();
    let reportInfo = {};

    if (reportDate === "latest") {
      // 根据当前时间计算最新报告期
      const currentMonth = currentDate.month() + 1; // moment月份从0开始
      const currentYear = currentDate.year();

      if (currentMonth <= 3) {
        // 1季度，最新报告期为上一年度
        reportInfo = {
          reportDate: `${currentYear - 1}`,
          reportType: "annual",
          fiscalYear: currentYear - 1,
          quarter: null,
        };
      } else if (currentMonth <= 6) {
        // 2季度，最新报告期为Q1
        reportInfo = {
          reportDate: `${currentYear}-Q1`,
          reportType: "quarterly",
          fiscalYear: currentYear,
          quarter: 1,
        };
      } else if (currentMonth <= 9) {
        // 3季度，最新报告期为Q2
        reportInfo = {
          reportDate: `${currentYear}-Q2`,
          reportType: "quarterly",
          fiscalYear: currentYear,
          quarter: 2,
        };
      } else {
        // 4季度，最新报告期为Q3
        reportInfo = {
          reportDate: `${currentYear}-Q3`,
          reportType: "quarterly",
          fiscalYear: currentYear,
          quarter: 3,
        };
      }
    } else {
      // 解析指定的报告期
      const match = reportDate.match(/^(\d{4})(?:-Q(\d))?$/);
      if (!match) {
        throw new Error("报告期格式错误，应为 YYYY 或 YYYY-Q1/Q2/Q3/Q4");
      }

      const year = parseInt(match[1]);
      const quarter = match[2] ? parseInt(match[2]) : null;

      reportInfo = {
        reportDate: reportDate,
        reportType: quarter ? "quarterly" : "annual",
        fiscalYear: year,
        quarter: quarter,
      };
    }

    // 计算报告期对应的日期
    if (reportInfo.reportType === "annual") {
      reportInfo.reportDateObj = moment(`${reportInfo.fiscalYear}-12-31`);
    } else {
      const quarterEndMonths = [3, 6, 9, 12];
      const month = quarterEndMonths[reportInfo.quarter - 1];
      reportInfo.reportDateObj = moment(
        `${reportInfo.fiscalYear}-${month.toString().padStart(2, "0")}-${
          month === 12 || month === 3 ? "31" : "30"
        }`
      );
    }

    return reportInfo;
  }

  /**
   * 获取股票价格数据
   * @param {string} securityCode - 股票代码
   * @param {string} reportDate - 报告期
   * @returns {Promise<Object>} 股票价格数据
   */
  async getStockPriceData(securityCode, reportDate) {
    try {
      const reportInfo = this.parseReportDate(reportDate);
      const reportDateObj = reportInfo.reportDateObj;

      // 计算5年前的价格
      const fiveYearsAgo = moment(reportDateObj).subtract(5, "years");
      const endDate = reportDateObj.format("YYYY-MM-DD");
      const startDate = fiveYearsAgo.format("YYYY-MM-DD");

      // 获取历史价格数据
      const historyResult = await HKStockTradingService.getHistoryData(
        securityCode,
        startDate,
        endDate
      );

      if (!historyResult.success || historyResult.data.length === 0) {
        throw new Error(`无法获取股票 ${securityCode} 的历史价格数据`);
      }

      const priceData = historyResult.data;

      // 获取报告期末价格（报告期当天的收盘价，如果没有则取最近的数据）
      let reportEndPrice = null;
      const reportEndData = priceData.find((item) => item.date === endDate);
      if (reportEndData) {
        reportEndPrice = reportEndData.close;
      } else {
        // 取距离报告期最近的数据
        const sortedData = priceData.sort((a, b) =>
          moment(b.date).diff(moment(a.date))
        );
        reportEndPrice = sortedData[0].close;
      }

      // 获取5年前价格
      let fiveYearsAgoPrice = null;
      const fiveYearsAgoData = priceData.find(
        (item) => item.date === startDate
      );
      if (fiveYearsAgoData) {
        fiveYearsAgoPrice = fiveYearsAgoData.close;
      } else {
        // 取距离5年前最近的数据
        const sortedData = priceData.sort((a, b) =>
          moment(a.date).diff(moment(b.date))
        );
        fiveYearsAgoPrice = sortedData[0].close;
      }

      // 计算年化增长率
      const yearsDiff = 5;
      const cagr =
        Math.pow(reportEndPrice / fiveYearsAgoPrice, 1 / yearsDiff) - 1;

      return {
        reportEndPrice: reportEndPrice,
        fiveYearsAgoPrice: fiveYearsAgoPrice,
        cagr: cagr * 100, // 转换为百分比
        priceRange: {
          startDate: startDate,
          endDate: endDate,
          totalDays: priceData.length,
        },
        latestData: priceData[priceData.length - 1],
      };
    } catch (error) {
      console.error(`[FinancialReportService] 获取股票价格数据失败:`, error);
      throw error;
    }
  }

  /**
   * 获取财务数据
   * @param {string} securityCode - 股票代码
   * @param {Object} reportInfo - 报告期信息
   * @returns {Promise<Object>} 财务数据
   */
  async getFinancialData(securityCode, reportInfo) {
    try {
      // 获取当前报告期数据
      const currentData = await this.hkFinancialService.getFinancialDataByDate(
        securityCode,
        reportInfo.reportDateObj.format("YYYY-MM-DD")
      );

      if (!currentData.success || !currentData.data) {
        throw new Error(
          `无法获取 ${securityCode} 在 ${reportInfo.reportDate} 的财务数据`
        );
      }

      const current = currentData.data;

      // 获取历史同比数据（最多5年）
      const historicalData = await this.getHistoricalData(
        securityCode,
        reportInfo
      );

      // 获取最近的年度报告期数据（用于DCF计算）
      const annualData = await this.getLatestAnnualData(
        securityCode,
        reportInfo
      );

      // 计算FCF
      const fcf = this.calculateFCF(current);

      // 计算FCF利润率
      const fcfMargin = current.OPERATE_INCOME
        ? (fcf / current.OPERATE_INCOME) * 100
        : 0;

      // 计算FCF同比增长率
      const fcfGrowthRate = this.calculateGrowthRate(historicalData, "fcf");

      return {
        current: {
          revenue: current.OPERATE_INCOME || 0,
          revenueGrowth: current.OPERATE_INCOME_YOY || 0,
          grossProfit: current.GROSS_PROFIT || 0,
          grossMargin: current.GROSS_PROFIT_RATIO || 0,
          fcf: fcf,
          fcfMargin: fcfMargin,
          fcfGrowth: fcfGrowthRate,
          cashEquivalents: current.END_CASH || 0,
          netProfit: current.HOLDER_PROFIT || 0,
          netProfitGrowth: current.HOLDER_PROFIT_YOY || 0,
          totalAssets: current.TOTAL_ASSETS || 0,
          totalLiabilities: current.TOTAL_LIABILITIES || 0,
          marketCap: current.TOTAL_MARKET_CAP || 0,
          peRatio: current.PE_TTM || 0,
          pbRatio: current.PB_TTM || 0,
          roe: current.ROE_AVG || 0,
          roa: current.ROA || 0,
        },
        annual: annualData, // 添加年度数据
        historical: historicalData,
        reportInfo: reportInfo,
      };
    } catch (error) {
      console.error(`[FinancialReportService] 获取财务数据失败:`, error);
      throw error;
    }
  }

  /**
   * 获取最近的年度报告期数据（用于DCF计算）
   * @param {string} securityCode - 股票代码
   * @param {Object} reportInfo - 报告期信息
   * @returns {Promise<Object>} 年度数据
   */
  async getLatestAnnualData(securityCode, reportInfo) {
    try {
      console.log(`[FinancialReportService] 获取最近年度数据: ${securityCode}`);

      // 确定年度数据的年份
      let annualYear = reportInfo.fiscalYear;

      // 如果当前是季度报告，且不是Q4，则使用上一年度
      if (reportInfo.reportType === "quarterly" && reportInfo.quarter !== 4) {
        annualYear = reportInfo.fiscalYear - 1;
      }

      // 构建年度报告日期
      const annualDate = moment(`${annualYear}-12-31`);

      console.log(`[FinancialReportService] 查找年度数据: ${annualYear}年`);

      // 获取年度数据
      const annualData = await this.hkFinancialService.getFinancialDataByDate(
        securityCode,
        annualDate.format("YYYY-MM-DD")
      );

      if (annualData.success && annualData.data) {
        const annualFcf = this.calculateFCF(annualData.data);

        console.log(
          `[FinancialReportService] 获取到年度数据: ${annualYear}年`,
          {
            revenue: safeToBillion(annualData.data.OPERATE_INCOME, 0),
            fcf: safeToBillion(annualFcf, 0),
          }
        );

        return {
          year: annualYear,
          reportDate: annualDate.format("YYYY-MM-DD"),
          revenue: annualData.data.OPERATE_INCOME || 0,
          fcf: annualFcf,
          netProfit: annualData.data.HOLDER_PROFIT || 0,
          cashEquivalents: annualData.data.END_CASH || 0,
          totalAssets: annualData.data.TOTAL_ASSETS || 0,
          totalLiabilities: annualData.data.TOTAL_LIABILITIES || 0,
          marketCap: annualData.data.TOTAL_MARKET_CAP || 0,
        };
      } else {
        console.warn(
          `[FinancialReportService] 未找到 ${annualYear} 年年度数据`
        );

        // 如果找不到年度数据，尝试查找最近的年度数据
        return await this.findNearestAnnualData(securityCode, annualYear);
      }
    } catch (error) {
      console.error(`[FinancialReportService] 获取年度数据失败:`, error);
      return null;
    }
  }

  /**
   * 查找最近的年度数据
   * @param {string} securityCode - 股票代码
   * @param {number} targetYear - 目标年份
   * @returns {Promise<Object>} 年度数据
   */
  async findNearestAnnualData(securityCode, targetYear) {
    try {
      console.log(
        `[FinancialReportService] 查找最近的年度数据: ${securityCode}, 目标年份: ${targetYear}`
      );

      // 获取所有财务数据
      const allData = await this.hkFinancialService.getFinancialData(
        securityCode,
        { limit: 100 }
      );

      if (!allData.success || !allData.data.length) {
        console.warn(`[FinancialReportService] 没有找到任何财务数据`);
        return null;
      }

      // 筛选年度数据（12月31日的数据）
      const annualDataList = allData.data.filter((item) => {
        const reportDate = new Date(item.REPORT_DATE);
        return reportDate.getMonth() === 11 && reportDate.getDate() === 31; // 12月31日
      });

      if (annualDataList.length === 0) {
        console.warn(`[FinancialReportService] 没有找到年度数据`);
        return null;
      }

      // 按年份排序，找到最接近目标年份的数据
      annualDataList.sort((a, b) => {
        const yearA = new Date(a.REPORT_DATE).getFullYear();
        const yearB = new Date(b.REPORT_DATE).getFullYear();
        return Math.abs(yearA - targetYear) - Math.abs(yearB - targetYear);
      });

      const nearestAnnual = annualDataList[0];
      const nearestYear = new Date(nearestAnnual.REPORT_DATE).getFullYear();
      const annualFcf = this.calculateFCF(nearestAnnual);

      console.log(
        `[FinancialReportService] 找到最近的年度数据: ${nearestYear}年`
      );

      return {
        year: nearestYear,
        reportDate: nearestAnnual.REPORT_DATE,
        revenue: nearestAnnual.OPERATE_INCOME || 0,
        fcf: annualFcf,
        netProfit: nearestAnnual.HOLDER_PROFIT || 0,
        cashEquivalents: nearestAnnual.END_CASH || 0,
        totalAssets: nearestAnnual.TOTAL_ASSETS || 0,
        totalLiabilities: nearestAnnual.TOTAL_LIABILITIES || 0,
        marketCap: nearestAnnual.TOTAL_MARKET_CAP || 0,
      };
    } catch (error) {
      console.error(`[FinancialReportService] 查找最近年度数据失败:`, error);
      return null;
    }
  }

  /**
   * 获取历史同比数据
   * @param {string} securityCode - 股票代码
   * @param {Object} reportInfo - 报告期信息
   * @returns {Promise<Array>} 历史数据数组
   */
  async getHistoricalData(securityCode, reportInfo) {
    const historicalData = [];
    const maxYears = 5;

    console.log(
      `[FinancialReportService] 开始获取历史数据: ${securityCode}, 报告期: ${reportInfo.reportDate}`
    );

    for (let i = 0; i < maxYears; i++) {
      const targetYear = reportInfo.fiscalYear - i;
      let targetDate;

      if (reportInfo.reportType === "annual") {
        targetDate = moment(`${targetYear}-12-31`);
      } else {
        const quarterEndMonths = [3, 6, 9, 12];
        const month = quarterEndMonths[reportInfo.quarter - 1];
        targetDate = moment(
          `${targetYear}-${month.toString().padStart(2, "0")}-${
            month === 12 || month === 3 ? "31" : "30"
          }`
        );
      }

      try {
        const data = await this.hkFinancialService.getFinancialDataByDate(
          securityCode,
          targetDate.format("YYYY-MM-DD")
        );

        if (data.success && data.data) {
          const fcf = this.calculateFCF(data.data);
          const historicalItem = {
            year: targetYear,
            reportDate: targetDate.format("YYYY-MM-DD"),
            revenue: data.data.OPERATE_INCOME || 0,
            fcf: fcf,
            netProfit: data.data.HOLDER_PROFIT || 0,
            cashEquivalents: data.data.END_CASH || 0,
          };

          historicalData.push(historicalItem);
          console.log(`[FinancialReportService] 获取到 ${targetYear} 年数据:`, {
            year: historicalItem.year,
            revenue: safeToBillion(historicalItem.revenue, 0),
            fcf: safeToBillion(historicalItem.fcf, 0),
          });
        } else {
          console.warn(`[FinancialReportService] ${targetYear} 年数据获取失败`);
        }
      } catch (error) {
        console.warn(
          `[FinancialReportService] 获取 ${targetYear} 年数据失败:`,
          error.message
        );
      }
    }

    const sortedData = historicalData.sort((a, b) => b.year - a.year);
    console.log(
      `[FinancialReportService] 历史数据获取完成，共 ${sortedData.length} 条记录`
    );

    return sortedData;
  }

  /**
   * 计算自由现金流 (FCF)
   * @param {Object} financialData - 财务数据
   * @returns {number} 自由现金流
   */
  calculateFCF(financialData) {
    const operatingCashFlow = financialData.NETCASH_OPERATE || 0;
    // const investmentCashFlow = financialData.NETCASH_INVEST || 0;
    // 暂时先按0处理
    const investmentCashFlow = 0;

    // FCF = 经营活动现金流 - 资本支出
    // 资本支出通常为负的投资现金流，但需要具体分析
    // 这里简化处理，假设投资现金流主要为资本支出
    const capitalExpenditure = Math.abs(investmentCashFlow);

    return operatingCashFlow - capitalExpenditure;
  }

  /**
   * 计算增长率
   * @param {Array} historicalData - 历史数据
   * @param {string} field - 字段名
   * @returns {number} 增长率（百分比）
   */
  calculateGrowthRate(historicalData, field) {
    if (historicalData.length < 2) return 0;

    const current = historicalData[0][field];
    const previous = historicalData[1][field];

    if (previous === 0) return 0;

    return ((current - previous) / previous) * 100;
  }

  /**
   * 计算DCF模型数据
   * @param {string} securityCode - 股票代码
   * @param {Object} financialData - 财务数据
   * @param {Object} stockPriceData - 股票价格数据
   * @returns {Promise<Object>} DCF模型数据
   */
  async calculateDCFData(securityCode, financialData, stockPriceData) {
    try {
      // 使用年度数据而不是当前报告期数据
      const annualData = financialData.annual;
      if (!annualData) {
        console.warn(
          `[FinancialReportService] 没有年度数据，使用当前报告期数据`
        );
        return await this.calculateDCFDataWithCurrentData(
          securityCode,
          financialData,
          stockPriceData
        );
      }

      console.log(
        `[FinancialReportService] 使用年度数据计算DCF: ${annualData.year}年`
      );

      const annualFCF = annualData.fcf;
      const marketCap = annualData.marketCap || financialData.current.marketCap;

      // 基础参数设置
      const wacc = 0.096; // 9.6% WACC
      const terminalGrowthRate = 0.025; // 2.5% 永续增长率
      const growthPeriod = 5; // 5年高增长期

      // 假设未来5年FCF增长率（可以根据行业和公司情况调整）
      const fcfGrowthRate = 0.1; // 10%

      // 计算未来5年FCF
      const futureFCFs = [];
      let currentFCFValue = annualFCF;

      for (let i = 1; i <= growthPeriod; i++) {
        currentFCFValue = currentFCFValue * (1 + fcfGrowthRate);
        futureFCFs.push({
          year: annualData.year + i,
          fcf: currentFCFValue,
          presentValue: currentFCFValue / Math.pow(1 + wacc, i),
        });
      }

      // 计算终值
      const terminalFCF = futureFCFs[futureFCFs.length - 1].fcf;
      const terminalValue =
        (terminalFCF * (1 + terminalGrowthRate)) / (wacc - terminalGrowthRate);
      const terminalValuePV = terminalValue / Math.pow(1 + wacc, growthPeriod);

      // 计算企业价值
      const growthStagePV = futureFCFs.reduce(
        (sum, item) => sum + item.presentValue,
        0
      );
      const enterpriseValue = growthStagePV + terminalValuePV;

      // 计算股权价值（使用当前报告期的现金等价物）
      const netCash = financialData.current.cashEquivalents;
      const equityValue = enterpriseValue + netCash;

      // 计算每股公允价值
      const sharesOutstanding = marketCap / stockPriceData.reportEndPrice;
      const fairValuePerShare = equityValue / sharesOutstanding;

      // 计算隐含回报率
      const expectedReturn =
        Math.pow(
          fairValuePerShare / stockPriceData.reportEndPrice,
          1 / growthPeriod
        ) - 1;

      return {
        assumptions: {
          wacc: wacc * 100,
          terminalGrowthRate: terminalGrowthRate * 100,
          fcfGrowthRate: fcfGrowthRate * 100,
          growthPeriod: growthPeriod,
          dataSource: `年度数据(${annualData.year}年)`,
        },
        futureFCFs: futureFCFs,
        terminalValue: terminalValue,
        enterpriseValue: enterpriseValue,
        equityValue: equityValue,
        fairValuePerShare: fairValuePerShare,
        expectedReturn: expectedReturn * 100,
        terminalMultiple: terminalValue / terminalFCF,
        annualData: {
          year: annualData.year,
          fcf: annualFCF,
          revenue: annualData.revenue,
        },
      };
    } catch (error) {
      console.error(`[FinancialReportService] 计算DCF数据失败:`, error);
      return null;
    }
  }

  /**
   * 使用当前报告期数据计算DCF（备用方法）
   */
  async calculateDCFDataWithCurrentData(
    securityCode,
    financialData,
    stockPriceData
  ) {
    try {
      const currentFCF = financialData.current.fcf;
      const marketCap = financialData.current.marketCap;

      // 基础参数设置
      const wacc = 0.096; // 9.6% WACC
      const terminalGrowthRate = 0.025; // 2.5% 永续增长率
      const growthPeriod = 5; // 5年高增长期

      // 假设未来5年FCF增长率（可以根据行业和公司情况调整）
      const fcfGrowthRate = 0.1; // 10%

      // 计算未来5年FCF
      const futureFCFs = [];
      let currentFCFValue = currentFCF;

      for (let i = 1; i <= growthPeriod; i++) {
        currentFCFValue = currentFCFValue * (1 + fcfGrowthRate);
        futureFCFs.push({
          year: new Date().getFullYear() + i,
          fcf: currentFCFValue,
          presentValue: currentFCFValue / Math.pow(1 + wacc, i),
        });
      }

      // 计算终值
      const terminalFCF = futureFCFs[futureFCFs.length - 1].fcf;
      const terminalValue =
        (terminalFCF * (1 + terminalGrowthRate)) / (wacc - terminalGrowthRate);
      const terminalValuePV = terminalValue / Math.pow(1 + wacc, growthPeriod);

      // 计算企业价值
      const growthStagePV = futureFCFs.reduce(
        (sum, item) => sum + item.presentValue,
        0
      );
      const enterpriseValue = growthStagePV + terminalValuePV;

      // 计算股权价值（假设净现金为现金等价物）
      const netCash = financialData.current.cashEquivalents;
      const equityValue = enterpriseValue + netCash;

      // 计算每股公允价值
      const sharesOutstanding = marketCap / stockPriceData.reportEndPrice;
      const fairValuePerShare = equityValue / sharesOutstanding;

      // 计算隐含回报率
      const expectedReturn =
        Math.pow(
          fairValuePerShare / stockPriceData.reportEndPrice,
          1 / growthPeriod
        ) - 1;

      return {
        assumptions: {
          wacc: wacc * 100,
          terminalGrowthRate: terminalGrowthRate * 100,
          fcfGrowthRate: fcfGrowthRate * 100,
          growthPeriod: growthPeriod,
          dataSource: "当前报告期数据",
        },
        futureFCFs: futureFCFs,
        terminalValue: terminalValue,
        enterpriseValue: enterpriseValue,
        equityValue: equityValue,
        fairValuePerShare: fairValuePerShare,
        expectedReturn: expectedReturn * 100,
        terminalMultiple: terminalValue / terminalFCF,
      };
    } catch (error) {
      console.error(`[FinancialReportService] 使用当前数据计算DCF失败:`, error);
      return null;
    }
  }

  /**
   * 计算反DCF模型数据
   * @param {string} securityCode - 股票代码
   * @param {Object} financialData - 财务数据
   * @param {Object} stockPriceData - 股票价格数据
   * @returns {Promise<Object>} 反DCF模型数据
   */
  async calculateReverseDCFData(securityCode, financialData, stockPriceData) {
    try {
      // 使用年度数据而不是当前报告期数据
      const annualData = financialData.annual;
      if (!annualData) {
        console.warn(
          `[FinancialReportService] 没有年度数据，使用当前报告期数据`
        );
        return await this.calculateReverseDCFDataWithCurrentData(
          securityCode,
          financialData,
          stockPriceData
        );
      }

      console.log(
        `[FinancialReportService] 使用年度数据计算反DCF: ${annualData.year}年`
      );

      const annualFCF = annualData.fcf;
      const marketCap = annualData.marketCap || financialData.current.marketCap;
      const currentPrice = stockPriceData.reportEndPrice;

      // 基础参数设置
      const wacc = 0.096; // 9.6% WACC
      const terminalGrowthRate = 0.025; // 2.5% 永续增长率
      const growthPeriod = 5; // 5年高增长期

      // 通过迭代求解隐含增长率
      const impliedGrowthRate = this.solveImpliedGrowthRate(
        marketCap,
        annualFCF,
        wacc,
        terminalGrowthRate,
        growthPeriod
      );

      // 使用隐含增长率计算终值
      const terminalFCF =
        annualFCF * Math.pow(1 + impliedGrowthRate, growthPeriod);
      const terminalValue =
        (terminalFCF * (1 + terminalGrowthRate)) / (wacc - terminalGrowthRate);
      const terminalValuePV = terminalValue / Math.pow(1 + wacc, growthPeriod);

      // 计算可行性概率（基于历史数据对比）
      const feasibilityProbability = this.calculateFeasibilityProbability(
        impliedGrowthRate,
        financialData.historical
      );

      return {
        assumptions: {
          wacc: wacc * 100,
          terminalGrowthRate: terminalGrowthRate * 100,
          growthPeriod: growthPeriod,
          dataSource: `年度数据(${annualData.year}年)`,
        },
        impliedGrowthRate: impliedGrowthRate * 100,
        terminalValue: terminalValue,
        terminalMultiple: terminalValue / terminalFCF,
        expectedReturn: wacc * 100,
        feasibilityProbability: feasibilityProbability,
        annualData: {
          year: annualData.year,
          fcf: annualFCF,
          revenue: annualData.revenue,
        },
      };
    } catch (error) {
      console.error(`[FinancialReportService] 计算反DCF数据失败:`, error);
      return null;
    }
  }

  /**
   * 使用当前报告期数据计算反DCF（备用方法）
   */
  async calculateReverseDCFDataWithCurrentData(
    securityCode,
    financialData,
    stockPriceData
  ) {
    try {
      const currentFCF = financialData.current.fcf;
      const marketCap = financialData.current.marketCap;
      const currentPrice = stockPriceData.reportEndPrice;

      // 基础参数设置
      const wacc = 0.096; // 9.6% WACC
      const terminalGrowthRate = 0.025; // 2.5% 永续增长率
      const growthPeriod = 5; // 5年高增长期

      // 通过迭代求解隐含增长率
      const impliedGrowthRate = this.solveImpliedGrowthRate(
        marketCap,
        currentFCF,
        wacc,
        terminalGrowthRate,
        growthPeriod
      );

      // 使用隐含增长率计算终值
      const terminalFCF =
        currentFCF * Math.pow(1 + impliedGrowthRate, growthPeriod);
      const terminalValue =
        (terminalFCF * (1 + terminalGrowthRate)) / (wacc - terminalGrowthRate);
      const terminalValuePV = terminalValue / Math.pow(1 + wacc, growthPeriod);

      // 计算可行性概率（基于历史数据对比）
      const feasibilityProbability = this.calculateFeasibilityProbability(
        impliedGrowthRate,
        financialData.historical
      );

      return {
        assumptions: {
          wacc: wacc * 100,
          terminalGrowthRate: terminalGrowthRate * 100,
          growthPeriod: growthPeriod,
          dataSource: "当前报告期数据",
        },
        impliedGrowthRate: impliedGrowthRate * 100,
        terminalValue: terminalValue,
        terminalMultiple: terminalValue / terminalFCF,
        expectedReturn: wacc * 100,
        feasibilityProbability: feasibilityProbability,
      };
    } catch (error) {
      console.error(
        `[FinancialReportService] 使用当前数据计算反DCF失败:`,
        error
      );
      return null;
    }
  }

  /**
   * 求解隐含增长率
   * @param {number} marketCap - 市值
   * @param {number} currentFCF - 当前FCF
   * @param {number} wacc - 折现率
   * @param {number} terminalGrowthRate - 永续增长率
   * @param {number} growthPeriod - 增长期
   * @returns {number} 隐含增长率
   */
  solveImpliedGrowthRate(
    marketCap,
    currentFCF,
    wacc,
    terminalGrowthRate,
    growthPeriod
  ) {
    // 使用二分法求解
    let low = -0.5; // -50%
    let high = 1.0; // 100%
    const tolerance = 0.001;

    while (high - low > tolerance) {
      const mid = (low + high) / 2;
      const calculatedValue = this.calculateDCFValue(
        currentFCF,
        mid,
        wacc,
        terminalGrowthRate,
        growthPeriod
      );

      if (Math.abs(calculatedValue - marketCap) < tolerance) {
        return mid;
      } else if (calculatedValue > marketCap) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return (low + high) / 2;
  }

  /**
   * 计算DCF价值
   * @param {number} currentFCF - 当前FCF
   * @param {number} growthRate - 增长率
   * @param {number} wacc - 折现率
   * @param {number} terminalGrowthRate - 永续增长率
   * @param {number} growthPeriod - 增长期
   * @returns {number} DCF价值
   */
  calculateDCFValue(
    currentFCF,
    growthRate,
    wacc,
    terminalGrowthRate,
    growthPeriod
  ) {
    let presentValue = 0;
    let currentFCFValue = currentFCF;

    // 计算增长期现值
    for (let i = 1; i <= growthPeriod; i++) {
      currentFCFValue = currentFCFValue * (1 + growthRate);
      presentValue += currentFCFValue / Math.pow(1 + wacc, i);
    }

    // 计算终值现值
    const terminalFCF = currentFCFValue;
    const terminalValue =
      (terminalFCF * (1 + terminalGrowthRate)) / (wacc - terminalGrowthRate);
    const terminalValuePV = terminalValue / Math.pow(1 + wacc, growthPeriod);

    return presentValue + terminalValuePV;
  }

  /**
   * 计算可行性概率
   * @param {number} impliedGrowthRate - 隐含增长率
   * @param {Array} historicalData - 历史数据
   * @returns {number} 可行性概率
   */
  calculateFeasibilityProbability(impliedGrowthRate, historicalData) {
    if (historicalData.length < 2) return 50.0; // 默认50%

    // 计算历史FCF增长率
    const historicalGrowthRates = [];
    for (let i = 0; i < historicalData.length - 1; i++) {
      const current = historicalData[i].fcf;
      const previous = historicalData[i + 1].fcf;
      if (previous > 0) {
        const growthRate = (current - previous) / previous;
        historicalGrowthRates.push(growthRate);
      }
    }

    if (historicalGrowthRates.length === 0) return 50.0;

    // 计算历史平均增长率
    const avgHistoricalGrowth =
      historicalGrowthRates.reduce((sum, rate) => sum + rate, 0) /
      historicalGrowthRates.length;

    // 基于历史增长率与隐含增长率的对比计算概率
    const growthDiff = impliedGrowthRate - avgHistoricalGrowth;

    let probability;
    if (growthDiff <= 0) {
      // 隐含增长率低于或等于历史平均，概率较高
      probability = Math.min(90, 70 + Math.abs(growthDiff) * 100);
    } else {
      // 隐含增长率高于历史平均，概率较低
      probability = Math.max(10, 70 - growthDiff * 200);
    }

    // 保留两位小数
    return Math.round(probability * 100) / 100;
  }

  /**
   * 获取分析数据（LLM生成）
   * @param {string} securityCode - 股票代码
   * @param {Object} financialData - 财务数据
   * @returns {Promise<Object>} 分析数据
   */
  async getAnalysisData(securityCode, financialData) {
    try {
      console.log(
        `[FinancialReportService] 开始生成LLM分析数据: ${securityCode}`
      );

      // 获取公司名称
      const companyName = await this.getCompanyName(securityCode);

      // 并行调用DeepSeek服务生成各类分析数据
      const [prosCons, ratings, revenueDistribution, keyMetrics] =
        await Promise.allSettled([
          this.deepseekService.generateProsAndCons(companyName, financialData),
          this.deepseekService.generateBusinessRatings(
            companyName,
            financialData
          ),
          this.deepseekService.generateRevenueDistribution(
            companyName,
            financialData
          ),
          this.deepseekService.generateKeyMetrics(companyName, financialData),
        ]);

      // 处理结果
      const analysisData = {
        pros: prosCons.status === "fulfilled" ? prosCons.value.pros : [],
        cons: prosCons.status === "fulfilled" ? prosCons.value.cons : [],
        ratings: ratings.status === "fulfilled" ? ratings.value : {},
        revenueComposition:
          revenueDistribution.status === "fulfilled"
            ? revenueDistribution.value.revenueComposition
            : {},
        regionalDistribution:
          revenueDistribution.status === "fulfilled"
            ? revenueDistribution.value.regionalDistribution
            : {},
        keyMetrics: keyMetrics.status === "fulfilled" ? keyMetrics.value : {},
      };

      console.log(
        `[FinancialReportService] LLM分析数据生成完成: ${securityCode}`
      );
      return analysisData;
    } catch (error) {
      console.error(`[FinancialReportService] 获取分析数据失败:`, error);
      // 返回默认数据
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
        ratings: {
          managementEfficiency: 3.5,
          productInnovation: 3.5,
          teamQuality: 3.5,
          moat: 3.5,
        },
        revenueComposition: {
          主营业务: 75,
          新业务: 15,
          其他: 10,
        },
        regionalDistribution: {
          中国大陆: 85,
          海外市场: 15,
        },
        keyMetrics: {
          用户增长率: 10.0,
          客单价增长率: 5.0,
          市场份额: 30.0,
        },
      };
    }
  }

  /**
   * 获取公司名称
   * @param {string} securityCode - 股票代码
   * @returns {Promise<string>} 公司名称
   */
  async getCompanyName(securityCode) {
    try {
      // 从财务数据中获取公司名称
      const financialData = await this.hkFinancialService.getFinancialData(
        securityCode,
        { limit: 1 }
      );

      if (financialData.success && financialData.data.length > 0) {
        return (
          financialData.data[0].SECURITY_NAME_ABBR || `股票${securityCode}`
        );
      }

      // 如果无法获取，返回默认名称
      return `股票${securityCode}`;
    } catch (error) {
      console.warn(`[FinancialReportService] 获取公司名称失败:`, error.message);
      return `股票${securityCode}`;
    }
  }

  /**
   * 获取可用的报告期列表
   * @param {string} securityCode - 股票代码
   * @returns {Promise<Array>} 报告期列表
   */
  async getAvailableReportDates(securityCode) {
    try {
      const stats = await this.hkFinancialService.getFinancialDataStats(
        securityCode
      );

      if (!stats.success || !stats.stats.hasData) {
        return [];
      }

      // 获取所有财务数据
      const allData = await this.hkFinancialService.getFinancialData(
        securityCode,
        { limit: 100 }
      );

      if (!allData.success) {
        return [];
      }

      // 提取报告期
      const reportDates = allData.data.map((item) => {
        const date = moment(item.REPORT_DATE);
        const year = date.year();
        const month = date.month() + 1;

        if (month === 12) {
          return `${year}`; // 年度报告
        } else {
          const quarter = Math.ceil(month / 3);
          return `${year}-Q${quarter}`; // 季度报告
        }
      });

      // 去重并排序
      return [...new Set(reportDates)].sort().reverse();
    } catch (error) {
      console.error(`[FinancialReportService] 获取报告期列表失败:`, error);
      return [];
    }
  }
}

module.exports = FinancialReportService;
