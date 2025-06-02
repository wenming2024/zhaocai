const moment = require("moment");
const SouthTradingData = require("../models/southTradingData");
const DataTransform = require("../utils/dataTransform");

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

    // 转换数据格式
    return DataTransform.toResponse(data);
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

    // 转换数据格式
    return DataTransform.toResponse(data[data.length - 1]);
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

    // 转换数据格式
    const transformedData = DataTransform.toResponse(data);

    // 计算统计数据
    const stats = {
      totalDays: transformedData.length,
      totalNetBuyVolume: transformedData.reduce(
        (sum, record) => sum + record.todayNetBuyVolume,
        0
      ),
      avgNetBuyVolume:
        transformedData.reduce(
          (sum, record) => sum + record.todayNetBuyVolume,
          0
        ) / transformedData.length,
      maxNetBuyVolume: Math.max(
        ...transformedData.map((record) => record.todayNetBuyVolume)
      ),
      minNetBuyVolume: Math.min(
        ...transformedData.map((record) => record.todayNetBuyVolume)
      ),
      totalVolume: transformedData.reduce(
        (sum, record) => sum + record.todayVolume,
        0
      ),
      avgVolume:
        transformedData.reduce((sum, record) => sum + record.todayVolume, 0) /
        transformedData.length,
      leadStocks: transformedData.reduce((acc, record) => {
        if (!acc[record.leadStocksCode]) {
          acc[record.leadStocksCode] = {
            code: record.leadStocksCode,
            name: record.leadStocksName,
            count: 0,
            totalChangeRate: 0,
          };
        }
        acc[record.leadStocksCode].count++;
        acc[record.leadStocksCode].totalChangeRate +=
          record.leadStocksChangeRate;
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
    // 转换数据格式
    const dbData = DataTransform.toDatabase(data);
    const existingRecord = await SouthTradingData.findByDate(dbData.date);

    if (existingRecord) {
      return await SouthTradingData.update(dbData.date, dbData);
    } else {
      return await SouthTradingData.create(dbData);
    }
  }

  /**
   * 批量保存交易数据
   * @param {Array} dataArray - 交易数据数组
   * @returns {Promise<number>} 影响的行数
   */
  static async bulkSaveData(dataArray) {
    // 转换数据格式
    const dbData = DataTransform.toDatabase(dataArray);
    return await SouthTradingData.bulkCreate(dbData);
  }

  /**
   * 检查特定日期的数据是否存在
   * @param {string} date - 日期
   * @returns {Promise<Object|null>} 数据记录或null
   */
  static async checkDateData(date) {
    // 验证日期格式
    if (!moment(date).isValid()) {
      throw new Error("日期格式无效");
    }

    // 尝试不同的日期格式
    const formats = [
      date, // 原始格式
      moment(date).format("YYYY-MM-DD"), // 标准格式
      moment(date).format("YYYY-MM-DD HH:mm:ss"), // 带时间格式
    ];

    for (const format of formats) {
      const record = await SouthTradingData.findByDate(format);
      if (record) {
        console.log(`找到数据，使用格式: ${format}`);
        return DataTransform.toResponse(record);
      }
    }

    console.log(`未找到数据，尝试过的格式: ${formats.join(", ")}`);
    return null;
  }
}

module.exports = SouthTradingService;
