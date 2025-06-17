// 获取某一段时间内，某一支股票港股通每天的净买入数据
const SouthChengjiao = require("../models/southChengjiao");
const db = require("../config/database");

class SouthChengjiaoService {
  static async getHKNetBuyAmt(code, startDate, endDate) {
    const data = await SouthChengjiao.findByCodeAndDateRange(
      code,
      startDate,
      endDate
    );
    return data;
  }

  static get _db() {
    return db;
  }

  // 新增：股票代码/公司名 SUG 分页模糊查询
  static async searchCodeName(keyword = "", page = 1, pageSize = 20) {
    return await SouthChengjiao.searchCodeName({ keyword, page, pageSize });
  }
}

module.exports = SouthChengjiaoService;
