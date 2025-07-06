const moment = require("moment");
const HKStockHistory = require("../models/hkStockHistory");
const { checkAndFillMissingData } = require("./crawlerHKStockHistory");

class HKStockTradingService {
  /**
   * 获取港股历史交易数据
   * @param {string} code - 股票代码（如：00700）
   * @param {string} startDate - 开始日期 YYYY-MM-DD
   * @param {string} endDate - 结束日期 YYYY-MM-DD
   * @returns {Promise<Object>} 包含数据和统计信息的对象
   */
  static async getHistoryData(code, startDate, endDate) {
    try {
      // 验证参数
      if (!code || !startDate || !endDate) {
        throw new Error("股票代码、开始日期和结束日期不能为空");
      }

      // 验证日期格式
      if (!moment(startDate).isValid() || !moment(endDate).isValid()) {
        throw new Error("日期格式无效，请使用 YYYY-MM-DD 格式");
      }

      // 验证日期范围
      if (moment(startDate).isAfter(moment(endDate))) {
        throw new Error("开始日期不能晚于结束日期");
      }

      console.log(
        `开始获取港股 ${code} 从 ${startDate} 到 ${endDate} 的历史数据`
      );

      // 首先尝试从数据库获取数据
      let data = await HKStockHistory.findByCodeAndDateRange(
        code,
        startDate,
        endDate
      );

      // 检查是否需要调用爬虫服务
      let needCrawler = false;

      if (data.length === 0) {
        // 如果数据库中没有数据，直接调用爬虫
        needCrawler = true;
        console.log(`数据库中没有港股 ${code} 的历史数据，开始从网络获取`);
      } else {
        // 检查数据完整性
        const dataDates = data.map((item) => item.date).sort();
        const earliestDataDate = dataDates[0];
        const latestDataDate = dataDates[dataDates.length - 1];
        console.log(
          `数据库中港股 ${code} 的历史数据，最早日期: ${earliestDataDate}，最晚日期: ${latestDataDate}`
        );

        // 计算日期差值（天数）
        const startDateDiff = moment(startDate).diff(
          moment(earliestDataDate),
          "days"
        );
        const endDateDiff = moment(latestDataDate).diff(
          moment(endDate),
          "days"
        );
        console.log(`开始日期: ${startDate}，结束日期: ${endDate}`);
        console.log(
          `开始日期与数据库最早日期的差值: ${startDateDiff}天，结束日期与数据库最晚日期的差值: ${endDateDiff}天`
        );

        // 如果开始日期或结束日期与数据库数据的差值大于2天，则调用爬虫
        if (Math.abs(startDateDiff) > 2 || Math.abs(endDateDiff) > 2) {
          needCrawler = true;
          console.log(
            `港股 ${code} 数据不完整，开始日期差值: ${startDateDiff}天，结束日期差值: ${endDateDiff}天，开始从网络获取`
          );
        } else {
          console.log(
            `从数据库获取到港股 ${code} 历史数据 ${data.length} 条，数据完整`
          );
        }
      }

      // 如果需要调用爬虫服务
      if (needCrawler) {
        await checkAndFillMissingData(code, startDate, endDate);

        // 重新从数据库获取数据
        data = await HKStockHistory.findByCodeAndDateRange(
          code,
          startDate,
          endDate
        );

        if (data.length === 0) {
          throw new Error(`无法获取港股 ${code} 在指定日期范围内的历史数据`);
        }
      }

      // 计算统计数据
      const stats = this.calculateStats(data);

      return {
        code,
        startDate,
        endDate,
        totalDays: data.length,
        data: data,
        stats: stats,
        success: true,
        message: `成功获取港股 ${code} 历史数据 ${data.length} 条`,
      };
    } catch (error) {
      console.error(`获取港股 ${code} 历史数据失败:`, error);
      return {
        code,
        startDate,
        endDate,
        totalDays: 0,
        data: [],
        stats: null,
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * 计算历史数据的统计信息
   * @param {Array} data - 历史数据数组
   * @returns {Object} 统计信息
   */
  static calculateStats(data) {
    if (!data || data.length === 0) {
      return null;
    }

    const prices = data.map((item) => item.close);
    const volumes = data.map((item) => item.volume);
    const changeRates = data.map((item) => item.change_rate);

    const stats = {
      // 价格统计
      highestPrice: Math.max(...prices),
      lowestPrice: Math.min(...prices),
      avgPrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,

      // 成交量统计
      totalVolume: volumes.reduce((sum, volume) => sum + volume, 0),
      avgVolume:
        volumes.reduce((sum, volume) => sum + volume, 0) / volumes.length,
      maxVolume: Math.max(...volumes),
      minVolume: Math.min(...volumes),

      // 涨跌幅统计
      totalChangeRate: changeRates.reduce((sum, rate) => sum + rate, 0),
      avgChangeRate:
        changeRates.reduce((sum, rate) => sum + rate, 0) / changeRates.length,
      maxGain: Math.max(...changeRates),
      maxLoss: Math.min(...changeRates),

      // 涨跌天数统计
      upDays: changeRates.filter((rate) => rate > 0).length,
      downDays: changeRates.filter((rate) => rate < 0).length,
      flatDays: changeRates.filter((rate) => rate === 0).length,

      // 最新数据
      latestPrice: data[data.length - 1].close,
      latestChangeRate: data[data.length - 1].change_rate,
      latestVolume: data[data.length - 1].volume,
    };

    return stats;
  }

  /**
   * 获取港股最新交易数据
   * @param {string} code - 股票代码
   * @returns {Promise<Object>} 最新交易数据
   */
  static async getLatestData(code) {
    try {
      if (!code) {
        throw new Error("股票代码不能为空");
      }

      // 获取最近30天的数据
      const endDate = moment().format("YYYY-MM-DD");
      const startDate = moment().subtract(30, "days").format("YYYY-MM-DD");

      const result = await this.getHistoryData(code, startDate, endDate);

      if (!result.success || result.data.length === 0) {
        throw new Error(`无法获取港股 ${code} 的最新数据`);
      }

      // 返回最新的一条数据
      const latestData = result.data[result.data.length - 1];

      return {
        code,
        data: latestData,
        success: true,
        message: `成功获取港股 ${code} 最新数据`,
      };
    } catch (error) {
      console.error(`获取港股 ${code} 最新数据失败:`, error);
      return {
        code,
        data: null,
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * 检查港股数据是否存在
   * @param {string} code - 股票代码
   * @param {string} date - 日期
   * @returns {Promise<boolean>} 是否存在数据
   */
  static async checkDataExists(code, date) {
    try {
      if (!code || !date) {
        return false;
      }

      const data = await HKStockHistory.findByCodeAndDate(code, date);
      return !!data;
    } catch (error) {
      console.error(`检查港股 ${code} 数据是否存在失败:`, error);
      return false;
    }
  }

  /**
   * 获取港股数据的时间范围
   * @param {string} code - 股票代码
   * @returns {Promise<Object>} 时间范围信息
   */
  static async getDataRange(code) {
    try {
      if (!code) {
        throw new Error("股票代码不能为空");
      }

      const latestDate = await HKStockHistory.getLatestDate(code);

      if (!latestDate) {
        return {
          code,
          hasData: false,
          earliestDate: null,
          latestDate: null,
          message: `港股 ${code} 暂无历史数据`,
        };
      }

      // 获取最早的数据日期（这里简化处理，实际可能需要查询最早日期）
      const [earliestRow] = await HKStockHistory.findByCodeAndDateRange(
        code,
        moment().subtract(10, "years").format("YYYY-MM-DD"),
        latestDate
      );

      return {
        code,
        hasData: true,
        earliestDate: earliestRow ? earliestRow.date : null,
        latestDate: latestDate,
        message: `港股 ${code} 数据范围获取成功`,
      };
    } catch (error) {
      console.error(`获取港股 ${code} 数据范围失败:`, error);
      return {
        code,
        hasData: false,
        earliestDate: null,
        latestDate: null,
        message: error.message,
      };
    }
  }
}

module.exports = HKStockTradingService;
