const db = require("../config/database");

class TradingData {
  static async findByCode(code) {
    const [rows] = await db.query(
      "SELECT * FROM trading_data WHERE code = ? ORDER BY date DESC",
      [code]
    );
    return rows;
  }

  static async findByCodeAndDateRange(code, startDate, endDate) {
    const [rows] = await db.query(
      "SELECT * FROM trading_data WHERE code = ? AND date BETWEEN ? AND ? ORDER BY date ASC",
      [code, startDate, endDate]
    );
    return rows;
  }

  static async create(data) {
    const [result] = await db.query(
      "INSERT INTO trading_data (code, date, open, high, low, close, volume, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        data.code,
        data.date,
        data.open,
        data.high,
        data.low,
        data.close,
        data.volume,
        data.amount,
      ]
    );
    return result.insertId;
  }

  static async bulkCreate(dataArray) {
    const values = dataArray.map((data) => [
      data.code,
      data.date,
      data.open,
      data.high,
      data.low,
      data.close,
      data.volume,
      data.amount,
    ]);

    const [result] = await db.query(
      "INSERT INTO trading_data (code, date, open, high, low, close, volume, amount) VALUES ?",
      [values]
    );
    return result.affectedRows;
  }

  static async update(code, date, data) {
    const [result] = await db.query(
      "UPDATE trading_data SET open = ?, high = ?, low = ?, close = ?, volume = ?, amount = ? WHERE code = ? AND date = ?",
      [
        data.open,
        data.high,
        data.low,
        data.close,
        data.volume,
        data.amount,
        code,
        date,
      ]
    );
    return result.affectedRows;
  }

  static async delete(code, date) {
    const [result] = await db.query(
      "DELETE FROM trading_data WHERE code = ? AND date = ?",
      [code, date]
    );
    return result.affectedRows;
  }
}

module.exports = TradingData;
