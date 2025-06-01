const moment = require("moment");
const SouthTradingData = require("../models/southTradingData");

class SouthTradingService {
  /**
   * 获取指定日期范围的数据
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   * @returns {Promise<Array>} 交易数据数组
   */
  static async getDataByDateRange(startDate, endDate) {
    // 验证日期格式
    if (!moment(startDate).isValid() || !moment(endDate).isValid()) {
      throw new Error("日期格式无效");
    }

    const data = await SouthTradingData.findByDateRange(startDate, endDate);
    if (data.length === 0) {
      throw new Error("指定日期范围内没有数据");
    }

    return data;
  }

  /**
   * 获取最新数据
   * @returns {Promise<Object>} 最新交易数据
   */
  static async getLatestData() {
    const endDate = moment().format("YYYY-MM-DD");
    const startDate = moment().subtract(30, "days").format("YYYY-MM-DD");

    const data = await SouthTradingData.findByDateRange(startDate, endDate);
    if (data.length === 0) {
      throw new Error("没有可用数据");
    }

    return data[data.length - 1];
  }

  /**
   * 获取统计数据
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   * @returns {Promise<Object>} 统计数据
   */
  static async getStats(startDate, endDate) {
    // 验证日期格式
    if (!moment(startDate).isValid() || !moment(endDate).isValid()) {
      throw new Error("日期格式无效");
    }

    const data = await SouthTradingData.findByDateRange(startDate, endDate);
    if (data.length === 0) {
      throw new Error("指定日期范围内没有数据");
    }

    // 计算统计数据
    const stats = {
      totalDays: data.length,
      totalNetBuyVolume: data.reduce(
        (sum, record) => sum + record.today_net_buy_volume,
        0
      ),
      avgNetBuyVolume:
        data.reduce((sum, record) => sum + record.today_net_buy_volume, 0) /
        data.length,
      maxNetBuyVolume: Math.max(
        ...data.map((record) => record.today_net_buy_volume)
      ),
      minNetBuyVolume: Math.min(
        ...data.map((record) => record.today_net_buy_volume)
      ),
      totalVolume: data.reduce((sum, record) => sum + record.today_volume, 0),
      avgVolume:
        data.reduce((sum, record) => sum + record.today_volume, 0) /
        data.length,
      leadStocks: data.reduce((acc, record) => {
        if (!acc[record.lead_stocks_code]) {
          acc[record.lead_stocks_code] = {
            code: record.lead_stocks_code,
            name: record.lead_stocks_name,
            count: 0,
            totalChangeRate: 0,
          };
        }
        acc[record.lead_stocks_code].count++;
        acc[record.lead_stocks_code].totalChangeRate +=
          record.lead_stocks_change_rate;
        return acc;
      }, {}),
    };

    // 计算领涨股票的平均涨跌幅
    Object.values(stats.leadStocks).forEach((stock) => {
      stock.avgChangeRate = stock.totalChangeRate / stock.count;
    });

    // 按出现次数排序领涨股票
    stats.leadStocks = Object.values(stats.leadStocks)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // 只返回前10个

    return stats;
  }

  /**
   * 保存或更新交易数据
   * @param {Object} data - 交易数据
   * @returns {Promise<number>} 影响的行数
   */
  static async saveOrUpdateData(data) {
    const existingRecord = await SouthTradingData.findByDate(data.date);

    if (existingRecord) {
      return await SouthTradingData.update(data.date, data);
    } else {
      return await SouthTradingData.create(data);
    }
  }

  /**
   * 批量保存交易数据
   * @param {Array} dataArray - 交易数据数组
   * @returns {Promise<number>} 影响的行数
   */
  static async bulkSaveData(dataArray) {
    return await SouthTradingData.bulkCreate(dataArray);
  }
}

module.exports = SouthTradingService;
