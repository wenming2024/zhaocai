const axios = require("axios");
const moment = require("moment");
const schedule = require("node-schedule");
const SouthTradingData = require("../models/southTradingData");

async function fetchHistoricalData() {
  try {
    const response = await axios.get(
      "https://datacenter-web.eastmoney.com/web/api/data/v1/get",
      {
        params: {
          sortColumns: "TRADE_DATE",
          sortTypes: "-1",
          pageSize: 2396,
          pageNumber: 1,
          reportName: "RPT_MUTUAL_DEAL_HISTORY",
          columns: "ALL",
          source: "WEB",
          client: "WEB",
          filter: '(MUTUAL_TYPE="006")',
        },
      }
    );

    // 转换数据格式
    const newRecords = response.data.result.data.map((item) => ({
      date: item.TRADE_DATE.split(" ")[0], // 只保留日期部分
      totalVolume: item.ACCUM_DEAL_AMT,
      todayVolume: item.DEAL_AMT,
      todayBuyVolume: item.BUY_AMT,
      todaySellVolume: item.SELL_AMT,
      todayNetBuyVolume: item.BUY_AMT - item.SELL_AMT,
      leadStocksCode: item.LEAD_STOCKS_CODE,
      leadStocksName: item.LEAD_STOCKS_NAME,
      leadStocksChangeRate: item.LS_CHANGE_RATE,
    }));

    // 获取数据库中的最新记录日期
    const latestRecord = await SouthTradingData.findByDateRange(
      moment().subtract(10, "year").format("YYYY-MM-DD"),
      moment().format("YYYY-MM-DD")
    );

    // 过滤出需要更新的记录
    const existingDates = new Set(
      latestRecord.map((record) => record.date.toISOString().split("T")[0])
    );
    const recordsToUpdate = newRecords.filter(
      (record) => !existingDates.has(record.date)
    );

    if (recordsToUpdate.length > 0) {
      // 批量插入新记录
      // await SouthTradingData.bulkCreate(recordsToUpdate);
      console.log("历史数据更新成功，新增", recordsToUpdate.length, "条记录");
    } else {
      console.log("没有新的历史数据需要更新");
    }

    return newRecords;
  } catch (error) {
    console.error("获取历史数据失败:", error);
    throw error;
  }
}

async function fetchLatestData() {
  try {
    const response = await axios.get(
      "https://datacenter-web.eastmoney.com/web/api/data/v1/get",
      {
        params: {
          sortColumns: "TRADE_DATE",
          sortTypes: "-1",
          pageSize: 1,
          pageNumber: 1,
          reportName: "RPT_MUTUAL_DEAL_HISTORY",
          columns: "ALL",
          source: "WEB",
          client: "WEB",
          filter: '(MUTUAL_TYPE="006")',
        },
      }
    );

    const latestData = response.data.result.data[0];
    const record = {
      date: latestData.TRADE_DATE.split(" ")[0], // 只保留日期部分
      totalVolume: latestData.ACCUM_DEAL_AMT,
      todayVolume: latestData.DEAL_AMT,
      todayBuyVolume: latestData.BUY_AMT,
      todaySellVolume: latestData.SELL_AMT,
      todayNetBuyVolume: latestData.BUY_AMT - latestData.SELL_AMT,
      leadStocksCode: latestData.LEAD_STOCKS_CODE,
      leadStocksName: latestData.LEAD_STOCKS_NAME,
      leadStocksChangeRate: latestData.LS_CHANGE_RATE,
    };

    // 检查数据库中是否已存在该日期的数据
    const existingRecord = await SouthTradingData.findByDate(record.date);

    if (existingRecord) {
      // 如果存在，更新数据
      await SouthTradingData.update(record.date, record);
      console.log("更新最新数据成功");
    } else {
      // 如果不存在，创建新记录
      await SouthTradingData.create(record);
      console.log("添加最新数据成功");
    }

    return record;
  } catch (error) {
    console.error("获取最新数据失败:", error);
    throw error;
  }
}

// 设置定时任务，每天下午6点执行
function scheduleDailyUpdate() {
  schedule.scheduleJob("0 18 * * *", async () => {
    console.log("开始执行每日数据更新...");
    try {
      await fetchLatestData();
    } catch (error) {
      console.error("每日数据更新失败:", error);
    }
  });
  console.log("已设置每日数据更新任务，将在每天下午6点执行");
}

module.exports = {
  fetchHistoricalData,
  fetchLatestData,
  scheduleDailyUpdate,
};
