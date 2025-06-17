// chengjiao.js
// 数据格式化工具：将API返回的数据格式化为数据库插入所需格式

const moment = require("moment");

function formatTop10Data(list) {
  return list.map((item) => ({
    mutual_type: item.MUTUAL_TYPE,
    security_code: item.SECURITY_CODE,
    derive_security_code: item.DERIVE_SECURITY_CODE,
    security_name: item.SECURITY_NAME,
    trade_date: moment(item.TRADE_DATE).format("YYYY-MM-DD"),
    close_price: item.CLOSE_PRICE,
    change_rate: item.CHANGE_RATE,
    net_buy_amt: item.NET_BUY_AMT,
    rank: item.RANK,
    buy_amt: item.BUY_AMT,
    sell_amt: item.SELL_AMT,
    deal_amt: item.DEAL_AMT,
    deal_amount: item.DEAL_AMOUNT,
    mutual_ratio: item.MUTUAL_RATIO,
    turnoverrate: item.TURNOVERRATE,
    change: item.CHANGE,
  }));
}

function formatHKDealData(list) {
  return list.map((item) => ({
    mutual_type: item.MUTUAL_TYPE,
    security_code: item.SECURITY_CODE,
    derive_security_code: item.DERIVE_SECURITY_CODE,
    security_name: item.SECURITY_NAME,
    trade_date: moment(item.TRADE_DATE).format("YYYY-MM-DD"),
    close_price: item.CLOSE_PRICE,
    change_rate: item.CHANGE_RATE,
    hk_net_buyamt: item.HK_NET_BUYAMT,
    hksh_rank: item.HKSH_RANK,
    hksh_net_buyamt: item.HKSH_NET_BUYAMT,
    hksh_buy_amt: item.HKSH_BUY_AMT,
    hksh_sell_amt: item.HKSH_SELL_AMT,
    hksz_rank: item.HKSZ_RANK,
    hksz_net_buyamt: item.HKSZ_NET_BUYAMT,
    hksz_buy_amt: item.HKSZ_BUY_AMT,
    hksz_sell_amt: item.HKSZ_SELL_AMT,
    hk_deal_amt: item.HK_DEAL_AMT,
    deal_amt_sz: item.DEAL_AMT_SZ,
    deal_amt_sh: item.DEAL_AMT_SH,
    hk_buy_amt: item.HK_BUY_AMT,
    hk_sell_amt: item.HK_SELL_AMT,
  }));
}

module.exports = {
  formatTop10Data,
  formatHKDealData,
};
