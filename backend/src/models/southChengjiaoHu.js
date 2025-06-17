const db = require("../config/database");

class SouthChengjiaoHu {
  static async findByCodeAndDate(code, date) {
    const [rows] = await db.query(
      "SELECT * FROM south_chengjiao_hu WHERE security_code=? AND trade_date=?",
      [code, date]
    );
    return rows[0];
  }

  static async bulkInsert(records) {
    if (!records.length) return 0;
    const keys = Object.keys(records[0]);
    const sqlKeys = keys.map((k) => `\`${k}\``).join(",");
    const values = records.map((r) => keys.map((k) => r[k]));
    const sql = `INSERT IGNORE INTO south_chengjiao_hu (${sqlKeys}) VALUES ?`;
    await db.query(sql, [values]);
    return records.length;
  }
}

module.exports = SouthChengjiaoHu;
