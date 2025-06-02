const db = require("../config/database");

class SouthTradingData {
  static async findByDate(date) {
    const [rows] = await db.query(
      "SELECT * FROM south_trading_data WHERE date = ?",
      [date]
    );
    return rows[0];
  }

  static async findByDateRange(startDate, endDate) {
    const [rows] = await db.query(
      "SELECT * FROM south_trading_data WHERE date BETWEEN ? AND ? ORDER BY date DESC",
      [startDate, endDate]
    );
    return rows;
  }

  static async create(data) {
    const [result] = await db.query(
      `INSERT INTO south_trading_data (
        date, total_volume, today_volume, today_buy_volume, 
        today_sell_volume, today_net_buy_volume, lead_stocks_code, 
        lead_stocks_name, lead_stocks_change_rate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.date,
        data.totalVolume,
        data.todayVolume,
        data.todayBuyVolume,
        data.todaySellVolume,
        data.todayNetBuyVolume,
        data.leadStocksCode,
        data.leadStocksName,
        data.leadStocksChangeRate,
      ]
    );
    return result.insertId;
  }

  static async bulkCreate(dataArray) {
    const values = dataArray.map((data) => [
      data.date,
      data.totalVolume,
      data.todayVolume,
      data.todayBuyVolume,
      data.todaySellVolume,
      data.todayNetBuyVolume,
      data.leadStocksCode,
      data.leadStocksName,
      data.leadStocksChangeRate,
    ]);

    const [result] = await db.query(
      `INSERT INTO south_trading_data (
        date, total_volume, today_volume, today_buy_volume, 
        today_sell_volume, today_net_buy_volume, lead_stocks_code, 
        lead_stocks_name, lead_stocks_change_rate
      ) VALUES ?`,
      [values]
    );
    return result.affectedRows;
  }

  static async update(date, data) {
    const [result] = await db.query(
      `UPDATE south_trading_data SET 
        total_volume = ?, today_volume = ?, today_buy_volume = ?, 
        today_sell_volume = ?, today_net_buy_volume = ?, lead_stocks_code = ?, 
        lead_stocks_name = ?, lead_stocks_change_rate = ? 
      WHERE date = ?`,
      [
        data.totalVolume,
        data.todayVolume,
        data.todayBuyVolume,
        data.todaySellVolume,
        data.todayNetBuyVolume,
        data.leadStocksCode,
        data.leadStocksName,
        data.leadStocksChangeRate,
        date,
      ]
    );
    return result.affectedRows;
  }

  static async delete(date) {
    const [result] = await db.query(
      "DELETE FROM south_trading_data WHERE date = ?",
      [date]
    );
    return result.affectedRows;
  }
}

module.exports = SouthTradingData;
