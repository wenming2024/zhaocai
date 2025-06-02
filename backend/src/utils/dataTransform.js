const humps = require("humps");
const moment = require("moment");

/**
 * 数据转换工具类
 */
class DataTransform {
  /**
   * 将数据库返回的数据转换为前端需要的格式
   * @param {Object|Array} data - 数据库返回的数据
   * @returns {Object|Array} 转换后的数据
   */
  static toResponse(data) {
    if (Array.isArray(data)) {
      return data.map((item) => this.transformItem(item));
    }
    return this.transformItem(data);
  }

  /**
   * 转换单个数据项
   * @param {Object} item - 数据项
   * @returns {Object} 转换后的数据项
   */
  static transformItem(item) {
    if (!item) return null;

    // 深拷贝对象，避免修改原对象
    const transformed = JSON.parse(JSON.stringify(item));

    // 转换日期格式
    if (transformed.date) {
      transformed.date = moment(transformed.date).format("YYYY-MM-DD");
    }

    // 转换下划线为驼峰
    return humps.camelizeKeys(transformed);
  }

  /**
   * 将前端数据转换为数据库需要的格式
   * @param {Object|Array} data - 前端数据
   * @returns {Object|Array} 转换后的数据
   */
  static toDatabase(data) {
    if (Array.isArray(data)) {
      return data.map((item) => humps.decamelizeKeys(item));
    }
    return humps.decamelizeKeys(data);
  }
}

module.exports = DataTransform;
