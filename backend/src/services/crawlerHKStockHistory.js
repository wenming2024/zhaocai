const axios = require("axios");
const moment = require("moment");
const HKStockHistory = require("../models/hkStockHistory");

/**
 * 从东方财富网获取港股历史K线数据
 * @param {string} code - 股票代码（如：00700.HK）
 * @param {string} startDate - 开始日期 YYYY-MM-DD
 * @param {string} endDate - 结束日期 YYYY-MM-DD
 * @returns {Promise<Array>} 历史数据数组
 */
async function fetchHKStockHistory(code, startDate, endDate) {
  try {
    console.log(
      `开始获取港股 ${code} 从 ${startDate} 到 ${endDate} 的历史数据`
    );

    // 东方财富港股历史数据API
    const response = await axios.get(
      "https://push2his.eastmoney.com/api/qt/stock/kline/get",
      {
        params: {
          secid: `116.${code.trim()}`, // 港股代码格式转换
          ut: "fa5fd1943c7b386f172d6893dbfba10b",
          fields1: "f1,f2,f3,f4,f5,f6",
          fields2: "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61",
          klt: "101", // 日K线
          fqt: "1", // 前复权
          beg: startDate.replace(/-/g, ""), // 开始日期
          end: endDate.replace(/-/g, ""), // 结束日期
          lmt: "10000", // 最大返回条数
          _: Date.now(),
        },
        timeout: 30000,
      }
    );

    if (!response.data || !response.data.data || !response.data.data.klines) {
      console.log(`港股 ${code} 没有获取到数据`);
      return [];
    }

    // 解析K线数据
    const klines = response.data.data.klines;
    const stockName = response.data.data.name || code;

    const historyData = klines.map((kline) => {
      const [
        date,
        open,
        close,
        high,
        low,
        volume,
        amount,
        amplitude,
        changeRate,
        changeAmount,
        turnoverRate,
      ] = kline.split(",");

      return {
        code,
        name: stockName,
        date: moment(date, "YYYY-MM-DD").format("YYYY-MM-DD"),
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close),
        changeRate: parseFloat(changeRate),
        changeAmount: parseFloat(changeAmount),
        volume: parseInt(volume),
        amount: parseFloat(amount),
        turnoverRate: parseFloat(turnoverRate),
        amplitude: parseFloat(amplitude),
      };
    });

    console.log(`成功获取港股 ${code} 历史数据 ${historyData.length} 条`);
    return historyData;
  } catch (error) {
    console.error(`获取港股 ${code} 历史数据失败:`, error.message);
    throw new Error(`获取港股历史数据失败: ${error.message}`);
  }
}

/**
 * 获取港股历史数据并保存到数据库
 * @param {string} code - 股票代码
 * @param {string} startDate - 开始日期
 * @param {string} endDate - 结束日期
 * @returns {Promise<Array>} 保存的数据数组
 */
async function fetchAndSaveHKStockHistory(code, startDate, endDate) {
  try {
    // 获取历史数据
    const historyData = await fetchHKStockHistory(code, startDate, endDate);

    if (historyData.length === 0) {
      console.log(`港股 ${code} 在指定日期范围内没有数据`);
      return [];
    }

    // 保存到数据库
    const savedCount = await HKStockHistory.bulkCreate(historyData);
    console.log(`港股 ${code} 历史数据保存成功，新增 ${savedCount} 条记录`);

    return historyData;
  } catch (error) {
    console.error(`获取并保存港股 ${code} 历史数据失败:`, error);
    throw error;
  }
}

/**
 * 检查并补充缺失的历史数据
 * @param {string} code - 股票代码
 * @param {string} startDate - 开始日期
 * @param {string} endDate - 结束日期
 * @returns {Promise<Array>} 补充的数据数组
 */
async function checkAndFillMissingData(code, startDate, endDate) {
  try {
    // 检查数据库中是否已有数据
    const hasData = await HKStockHistory.hasDataInRange(
      code,
      startDate,
      endDate
    );

    if (hasData) {
      console.log(`港股 ${code} 在指定日期范围内已有数据，无需补充`);
      return [];
    }

    // 获取缺失的数据
    console.log(`港股 ${code} 在指定日期范围内缺少数据，开始获取`);
    return await fetchAndSaveHKStockHistory(code, startDate, endDate);
  } catch (error) {
    console.error(`检查并补充港股 ${code} 历史数据失败:`, error);
    throw error;
  }
}

module.exports = {
  fetchHKStockHistory,
  fetchAndSaveHKStockHistory,
  checkAndFillMissingData,
};
