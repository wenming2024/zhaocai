// 每日爬取南向成交十大成交股
// 分为两个接口，分别是沪股通和深股通的十大成交股
// 002 沪股通
// https://datacenter-web.eastmoney.com/web/api/data/v1/get?sortColumns=RANK&sortTypes=1&pageSize=10&pageNumber=1&reportName=RPT_MUTUAL_TOP10DEAL&columns=ALL&source=WEB&client=WEB&filter=(MUTUAL_TYPE%3D%22002%22)(TRADE_DATE%3D%272025-06-10%27)
// 004 深股通
// https://datacenter-web.eastmoney.com/web/api/data/v1/get?sortColumns=RANK&sortTypes=1&pageSize=10&pageNumber=1&reportName=RPT_MUTUAL_TOP10DEAL&columns=ALL&source=WEB&client=WEB&filter=(MUTUAL_TYPE%3D%22004%22)(TRADE_DATE%3D%272025-06-10%27)

// 返回的数据结构
// [
//   {
//     MUTUAL_TYPE: "004",
//     SECURITY_CODE: "01810",
//     DERIVE_SECURITY_CODE: "01810.HK",
//     SECURITY_NAME: "小米集团-W",
//     TRADE_DATE: "2025-06-10 00:00:00",
//     CLOSE_PRICE: 53.45,
//     CHANGE_RATE: -1.2927,
//     NET_BUY_AMT: -527510640,
//     RANK: 1,
//     BUY_AMT: 598255690,
//     SELL_AMT: 1125766330,
//     DEAL_AMT: 1724022020,
//     DEAL_AMOUNT: 6199588116.7,
//     MUTUAL_RATIO: 27.81,
//     TURNOVERRATE: 0.539858640075,
//     CHANGE: -0.7,
//   },
// ];

// 每天下午6点爬取，爬取的数据保存到数据库中，如果数据库中已经存在，则不保存
// 爬取的数据需要按照日期进行保存，日期为当天日期
// 爬取的数据需要按照沪股通和深股通进行保存，沪股通保存到沪股通表中，深股通保存到深股通表中
// 沪股通表名：south_chengjiao_hu
// 深股通表名：south_chengjiao_shen

// 然后根据成交前十名的公司，爬取近100天的港股成交数据，保存到数据库中
// 港股通表名：south_chengjiao
// 接口为：https://datacenter-web.eastmoney.com/api/data/v1/get?sortColumns=TRADE_DATE&sortTypes=-1&pageSize=100&pageNumber=1&reportName=RPT_HK_DEAL_RANK&columns=ALL&source=WEB&client=WEB&filter=(SECURITY_CODE%3D%2201810%22)
// 返回的数据结构
// [
//   {
//     MUTUAL_TYPE: "港股通",
//     SECURITY_CODE: "01810",
//     DERIVE_SECURITY_CODE: "01810.HK",
//     SECURITY_NAME: "小米集团-W",
//     TRADE_DATE: "2025-06-10 00:00:00",
//     CLOSE_PRICE: 53.45,
//     CHANGE_RATE: -1.29,
//     HK_NET_BUYAMT: -899203090,
//     HKSH_RANK: 2,
//     HKSH_NET_BUYAMT: -371692450,
//     HKSH_BUY_AMT: 1301165150,
//     HKSH_SELL_AMT: 1672857600,
//     HKSZ_RANK: 1,
//     HKSZ_NET_BUYAMT: -527510640,
//     HKSZ_BUY_AMT: 598255690,
//     HKSZ_SELL_AMT: 1125766330,
//     HK_DEAL_AMT: 4698044770,
//     DEAL_AMT_SZ: 1724022020,
//     DEAL_AMT_SH: 2974022750,
//     HK_BUY_AMT: 1899420840,
//     HK_SELL_AMT: 2798623930,
//   },
// ];

const moment = require("moment");
const schedule = require("node-schedule");
const SouthChengjiaoHu = require("../models/southChengjiaoHu");
const SouthChengjiaoShen = require("../models/southChengjiaoShen");
const SouthChengjiao = require("../models/southChengjiao");
const {
  fetchTop10API,
  fetchHKDealAPI,
} = require("./crawlerSouthAPIs/chengjiao");
const {
  formatTop10Data,
  formatHKDealData,
} = require("./crawlerSouthDataFormat/chengjiao");

const fetchTop10 = async (mutualType, tableModel) => {
  const today = moment().format("YYYY-MM-DD");
  const list = await fetchTop10API(mutualType, today);
  const records = formatTop10Data(list);
  await tableModel.bulkInsert(records);
  return records.map((r) => r.security_code);
};

const fetchHKDeal = async (securityCode, pageSize = 100, pageNumber = 1) => {
  const list = await fetchHKDealAPI(securityCode, pageSize, pageNumber);
  const records = formatHKDealData(list);
  await SouthChengjiao.bulkInsert(records);
};

const main = async () => {
  console.log("开始爬取沪股通和深股通十大成交股");
  // 1. 沪股通
  const huCodes = await fetchTop10("002", SouthChengjiaoHu);
  console.log("沪股通十大成交股爬取完成");
  // 2. 深股通
  const shenCodes = await fetchTop10("004", SouthChengjiaoShen);
  console.log("深股通十大成交股爬取完成");
  // 3. 港股通（对所有前10名股票爬取100天数据）
  const allCodes = Array.from(new Set([...huCodes, ...shenCodes]));
  for (const code of allCodes) {
    await fetchHKDeal(code);
  }
  console.log("爬取沪股通和深股通十大成交股完成");
};

// 定时任务
schedule.scheduleJob("0 18 * * *", main);

module.exports = { main, fetchHKDeal };
