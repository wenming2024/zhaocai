const axios = require("axios");
const moment = require("moment");

// 获取沪/深股通十大成交股
async function fetchTop10API(mutualType, date) {
  const url = `https://datacenter-web.eastmoney.com/web/api/data/v1/get?sortColumns=RANK&sortTypes=1&pageSize=10&pageNumber=1&reportName=RPT_MUTUAL_TOP10DEAL&columns=ALL&source=WEB&client=WEB&filter=(MUTUAL_TYPE%3D%22${mutualType}%22)(TRADE_DATE%3D%27${date}%27)`;
  const { data } = await axios.get(url);
  return data.result?.data || [];
}

// 获取港股通某股票近N天成交数据
async function fetchHKDealAPI(securityCode, pageSize = 100, pageNumber = 1) {
  const url = `https://datacenter-web.eastmoney.com/api/data/v1/get?sortColumns=TRADE_DATE&sortTypes=-1&pageSize=${pageSize}&pageNumber=${pageNumber}&reportName=RPT_HK_DEAL_RANK&columns=ALL&source=WEB&client=WEB&filter=(SECURITY_CODE%3D%22${securityCode}%22)`;
  const { data } = await axios.get(url);
  return data.result?.data || [];
}

module.exports = {
  fetchTop10API,
  fetchHKDealAPI,
};
