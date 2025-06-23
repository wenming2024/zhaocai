const db = require("../config/database");

class SouthStockHistory {
  /**
   * 根据股票代码和日期范围查询数据
   * @param {string} code - 股票代码
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   * @returns {Promise<Array>} 历史数据数组
   */
  static async findByCodeAndDateRange(code, startDate, endDate) {
    const [rows] = await db.query(
      "SELECT * FROM hk_stock_history WHERE code = ? AND date BETWEEN ? AND ? ORDER BY date ASC",
      [code, startDate, endDate]
    );
    return rows;
  }

  /**
   * 根据股票代码和日期查询单条数据
   * @param {string} code - 股票代码
   * @param {string} date - 日期
   * @returns {Promise<Object|null>} 历史数据或null
   */
  static async findByCodeAndDate(code, date) {
    const [rows] = await db.query(
      "SELECT * FROM hk_stock_history WHERE code = ? AND date = ?",
      [code, date]
    );
    return rows[0] || null;
  }

  /**
   * 创建单条历史数据记录
   * @param {Object} data - 历史数据对象
   * @returns {Promise<number>} 插入记录的ID
   */
  static async create(data) {
    const [result] = await db.query(
      `INSERT INTO hk_stock_history (
        code, name, date, open, high, low, close, 
        change_rate, change_amount, volume, amount, 
        turnover_rate, amplitude
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.code,
        data.name,
        data.date,
        data.open,
        data.high,
        data.low,
        data.close,
        data.changeRate,
        data.changeAmount,
        data.volume,
        data.amount,
        data.turnoverRate,
        data.amplitude,
      ]
    );
    return result.insertId;
  }

  /**
   * 批量创建历史数据记录
   * @param {Array} dataArray - 历史数据数组
   * @returns {Promise<number>} 影响的行数
   */
  static async bulkCreate(dataArray) {
    if (!dataArray.length) return 0;

    const values = dataArray.map((data) => [
      data.code,
      data.name,
      data.date,
      data.open,
      data.high,
      data.low,
      data.close,
      data.changeRate,
      data.changeAmount,
      data.volume,
      data.amount,
      data.turnoverRate,
      data.amplitude,
    ]);

    const [result] = await db.query(
      `INSERT IGNORE INTO hk_stock_history (
        code, name, date, open, high, low, close, 
        change_rate, change_amount, volume, amount, 
        turnover_rate, amplitude
      ) VALUES ?`,
      [values]
    );
    return result.affectedRows;
  }

  /**
   * 更新历史数据记录
   * @param {string} code - 股票代码
   * @param {string} date - 日期
   * @param {Object} data - 更新的数据
   * @returns {Promise<number>} 影响的行数
   */
  static async update(code, date, data) {
    const [result] = await db.query(
      `UPDATE hk_stock_history SET 
        name = ?, open = ?, high = ?, low = ?, close = ?, 
        change_rate = ?, change_amount = ?, volume = ?, amount = ?, 
        turnover_rate = ?, amplitude = ? 
      WHERE code = ? AND date = ?`,
      [
        data.name,
        data.open,
        data.high,
        data.low,
        data.close,
        data.changeRate,
        data.changeAmount,
        data.volume,
        data.amount,
        data.turnoverRate,
        data.amplitude,
        code,
        date,
      ]
    );
    return result.affectedRows;
  }

  /**
   * 删除历史数据记录
   * @param {string} code - 股票代码
   * @param {string} date - 日期
   * @returns {Promise<number>} 影响的行数
   */
  static async delete(code, date) {
    const [result] = await db.query(
      "DELETE FROM hk_stock_history WHERE code = ? AND date = ?",
      [code, date]
    );
    return result.affectedRows;
  }

  /**
   * 检查指定日期范围是否有数据
   * @param {string} code - 股票代码
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   * @returns {Promise<boolean>} 是否有数据
   */
  static async hasDataInRange(code, startDate, endDate) {
    const [rows] = await db.query(
      "SELECT COUNT(*) as count FROM hk_stock_history WHERE code = ? AND date BETWEEN ? AND ?",
      [code, startDate, endDate]
    );
    return rows[0].count > 0;
  }

  /**
   * 获取指定股票的最新数据日期
   * @param {string} code - 股票代码
   * @returns {Promise<string|null>} 最新日期或null
   */
  static async getLatestDate(code) {
    const [rows] = await db.query(
      "SELECT MAX(date) as latest_date FROM hk_stock_history WHERE code = ?",
      [code]
    );
    return rows[0].latest_date;
  }
}

module.exports = SouthStockHistory;
