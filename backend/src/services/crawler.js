const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const moment = require('moment');
const schedule = require("node-schedule");

const DATA_FILE = path.join(__dirname, "../data/hk_south_trading_data.txt");

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
    console.log(response.data);
    // 返回的数据结构如.cursor/docs/get.json文件的结构所示
    const newRecords = response.data.result.data.map((item) => ({
      date: item.TRADE_DATE,
      // 南向累计买入额
      totalVolume: item.ACCUM_DEAL_AMT,
      // 南向本日成交额
      todayVolume: item.DEAL_AMT,
      // 南向本日买入额
      todayBuyVolume: item.BUY_AMT,
      // 南向本日卖出额
      todaySellVolume: item.SELL_AMT,
      // 南向本日净买入额
      todayNetBuyVolume: item.BUY_AMT - item.SELL_AMT,
      // 南向本日领涨股票代码
      leadStocksCode: item.LEAD_STOCKS_CODE,
      // 南向本日领涨股票名称
      leadStocksName: item.LEAD_STOCKS_NAME,
      // 南向本日领涨股票涨跌幅
      leadStocksChangeRate: item.LS_CHANGE_RATE,
    }));

    // 读取现有数据（如果存在）
    let existingData = [];
    try {
      const fileContent = await fs.readFile(DATA_FILE, "utf8");
      existingData = JSON.parse(fileContent);
    } catch (error) {
      // 如果文件不存在或为空，使用空数组
      console.log("未找到现有数据文件，将创建新文件");
    }

    // 合并数据并去重
    const mergedData = [...existingData];
    for (const newRecord of newRecords) {
      const existingIndex = mergedData.findIndex(
        (item) => item.date === newRecord.date
      );
      if (existingIndex !== -1) {
        // 如果存在相同日期的数据，更新它
        mergedData[existingIndex] = newRecord;
      } else {
        // 如果不存在，添加到数组
        mergedData.push(newRecord);
      }
    }

    // 按日期降序排序
    mergedData.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 保存历史数据
    await fs.writeFile(DATA_FILE, JSON.stringify(mergedData, null, 2));
    console.log("历史数据获取成功，共获取", mergedData.length, "条记录");
    return mergedData;
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
      date: latestData.TRADE_DATE,
      totalVolume: latestData.ACCUM_DEAL_AMT,
      todayVolume: latestData.DEAL_AMT,
      todayBuyVolume: latestData.BUY_AMT,
      todaySellVolume: latestData.SELL_AMT,
      todayNetBuyVolume: latestData.BUY_AMT - latestData.SELL_AMT,
      leadStocksCode: latestData.LEAD_STOCKS_CODE,
      leadStocksName: latestData.LEAD_STOCKS_NAME,
      leadStocksChangeRate: latestData.LS_CHANGE_RATE,
    };

    // 读取现有数据
    let existingData = [];
    try {
      const fileContent = await fs.readFile(DATA_FILE, "utf8");
      existingData = JSON.parse(fileContent);
    } catch (error) {
      console.error("读取现有数据失败:", error);
      return record;
    }

    // 检查是否已存在相同日期的数据
    const existingIndex = existingData.findIndex(
      (item) => item.date === record.date
    );
    if (existingIndex !== -1) {
      // 如果存在，更新该条数据
      existingData[existingIndex] = record;
    } else {
      // 如果不存在，添加到数组开头
      existingData.unshift(record);
    }

    // 保存更新后的数据
    await fs.writeFile(DATA_FILE, JSON.stringify(existingData, null, 2));
    console.log("最新数据更新成功");
    return record;
  } catch (error) {
    console.error("获取最新数据失败:", error);
    throw error;
  }
}

// 设置定时任务，每天下午5点执行
function scheduleDailyUpdate() {
  schedule.scheduleJob("0 17 * * *", async () => {
    console.log("开始执行每日数据更新...");
    try {
      await fetchLatestData();
    } catch (error) {
      console.error("每日数据更新失败:", error);
    }
  });
  console.log("已设置每日数据更新任务，将在每天下午5点执行");
}

module.exports = {
  fetchHistoricalData,
  fetchLatestData,
  scheduleDailyUpdate,
}; 