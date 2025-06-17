const db = require("../config/database");
const { fetchHKDealAPI } = require("../services/crawlerSouthAPIs/chengjiao");
const {
  formatHKDealData,
} = require("../services/crawlerSouthDataFormat/chengjiao");

const fetchHKDeal = async (securityCode, pageSize = 100, pageNumber = 1) => {
  const list = await fetchHKDealAPI(securityCode, pageSize, pageNumber);
  const records = formatHKDealData(list);
  return records;
};

class SouthChengjiao {
  static async findByCodeAndDate(code, date) {
    const [rows] = await db.query(
      "SELECT * FROM south_chengjiao WHERE security_code=? AND trade_date=?",
      [code, date]
    );
    return rows[0];
  }

  static async findByCodeAndDateRange(code, startDate, endDate) {
    const [rows] = await db.query(
      "SELECT * FROM south_chengjiao WHERE security_code=? AND trade_date BETWEEN ? AND ?",
      [code, startDate, endDate]
    );
    // 如果没有数据，请爬取相关接口，爬取对应的数据，默认拉取500条
    if (!rows.length) {
      console.log("没有数据，开始爬取");
      const records = await fetchHKDeal(code, 500, 1);
      await SouthChengjiao.bulkInsert(records);
      const [result] = await db.query(
        "SELECT * FROM south_chengjiao WHERE security_code=? AND trade_date BETWEEN ? AND ?",
        [code, startDate, endDate]
      );
      return result;
    }
    return rows;
  }
  static async bulkInsert(records) {
    if (!records.length) return 0;
    const keys = Object.keys(records[0]);
    const sqlKeys = keys.map((k) => `\`${k}\``).join(",");
    const values = records.map((r) => keys.map((k) => r[k]));
    const sql = `INSERT IGNORE INTO south_chengjiao (${sqlKeys}) VALUES ?`;
    await db.query(sql, [values]);
    return records.length;
  }

  // 分页模糊查询股票代码和公司名
  static async searchCodeName({ keyword = "", page = 1, pageSize = 20 }) {
    const offset = (page - 1) * pageSize;
    const like = `%${keyword}%`;
    const [rows] = await db.query(
      `SELECT DISTINCT security_code, security_name
       FROM south_chengjiao
       WHERE security_code LIKE ? OR security_name LIKE ?
       ORDER BY security_code
       LIMIT ? OFFSET ?`,
      [like, like, pageSize, offset]
    );
    // 查询总数
    const [countRows] = await db.query(
      `SELECT COUNT(DISTINCT security_code) as total
       FROM south_chengjiao
       WHERE security_code LIKE ? OR security_name LIKE ?`,
      [like, like]
    );
    return { list: rows, total: countRows[0].total };
  }
}

module.exports = SouthChengjiao;
