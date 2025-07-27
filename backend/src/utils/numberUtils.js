/**
 * 数字工具函数
 * 提供安全的数字格式化功能
 */

/**
 * 安全格式化数字为指定小数位数
 * @param {number|string|null|undefined} value - 要格式化的值
 * @param {number} digits - 小数位数，默认为0
 * @param {number} defaultValue - 默认值，当输入无效时返回，默认为0
 * @returns {string} 格式化后的字符串
 */
function safeToFixed(value, digits = 0, defaultValue = 0) {
  try {
    // 转换为数字
    const num = Number(value);

    // 检查是否为有效数字
    if (isNaN(num) || !isFinite(num)) {
      return Number(defaultValue).toFixed(digits);
    }

    return num.toFixed(digits);
  } catch (error) {
    console.warn(`[NumberUtils] safeToFixed 格式化失败:`, error.message);
    return Number(defaultValue).toFixed(digits);
  }
}

/**
 * 安全格式化数字为百分比
 * @param {number|string|null|undefined} value - 要格式化的值
 * @param {number} digits - 小数位数，默认为1
 * @param {number} defaultValue - 默认值，当输入无效时返回，默认为0
 * @returns {string} 格式化后的百分比字符串
 */
function safeToPercent(value, digits = 1, defaultValue = 0) {
  const formatted = safeToFixed(value, digits, defaultValue);
  return `${formatted}%`;
}

/**
 * 安全格式化数字为亿元单位
 * @param {number|string|null|undefined} value - 要格式化的值（以元为单位）
 * @param {number} digits - 小数位数，默认为1
 * @param {number} defaultValue - 默认值，当输入无效时返回，默认为0
 * @returns {string} 格式化后的亿元字符串
 */
function safeToBillion(value, digits = 1, defaultValue = 0) {
  const num = Number(value) || defaultValue;
  const billionValue = num / 100000000;
  const formatted = safeToFixed(billionValue, digits, 0);
  return `${formatted}亿元`;
}

/**
 * 安全格式化数字为万元单位
 * @param {number|string|null|undefined} value - 要格式化的值（以元为单位）
 * @param {number} digits - 小数位数，默认为1
 * @param {number} defaultValue - 默认值，当输入无效时返回，默认为0
 * @returns {string} 格式化后的万元字符串
 */
function safeToTenThousand(value, digits = 1, defaultValue = 0) {
  const num = Number(value) || defaultValue;
  const tenThousandValue = num / 10000;
  const formatted = safeToFixed(tenThousandValue, digits, 0);
  return `${formatted}万元`;
}

/**
 * 安全格式化数字为港币
 * @param {number|string|null|undefined} value - 要格式化的值
 * @param {number} digits - 小数位数，默认为0
 * @param {number} defaultValue - 默认值，当输入无效时返回，默认为0
 * @returns {string} 格式化后的港币字符串
 */
function safeToHKD(value, digits = 0, defaultValue = 0) {
  const formatted = safeToFixed(value, digits, defaultValue);
  return `${formatted}港币`;
}

/**
 * 安全格式化数字为倍数
 * @param {number|string|null|undefined} value - 要格式化的值
 * @param {number} digits - 小数位数，默认为1
 * @param {number} defaultValue - 默认值，当输入无效时返回，默认为0
 * @returns {string} 格式化后的倍数字符串
 */
function safeToMultiple(value, digits = 1, defaultValue = 0) {
  const formatted = safeToFixed(value, digits, defaultValue);
  return `${formatted}x`;
}

/**
 * 安全转换数字
 * @param {number|string|null|undefined} value - 要转换的值
 * @param {number} defaultValue - 默认值，当输入无效时返回，默认为0
 * @returns {number} 转换后的数字
 */
function safeNumber(value, defaultValue = 0) {
  try {
    const num = Number(value);
    return isNaN(num) || !isFinite(num) ? defaultValue : num;
  } catch (error) {
    console.warn(`[NumberUtils] safeNumber 转换失败:`, error.message);
    return defaultValue;
  }
}

/**
 * 安全格式化财务数据
 * @param {Object} data - 财务数据对象
 * @param {Object} options - 格式化选项
 * @returns {Object} 格式化后的数据对象
 */
function safeFormatFinancialData(data, options = {}) {
  const {
    revenueDigits = 1,
    fcfDigits = 1,
    marginDigits = 1,
    growthDigits = 1,
    cashDigits = 1,
    profitDigits = 1,
    roeDigits = 1,
    roaDigits = 1,
  } = options;

  return {
    revenue: safeToBillion(data.revenue, revenueDigits),
    revenueGrowth: safeToPercent(data.revenueGrowth, growthDigits),
    grossMargin: safeToPercent(data.grossMargin, marginDigits),
    fcf: safeToBillion(data.fcf, fcfDigits),
    fcfMargin: safeToPercent(data.fcfMargin, marginDigits),
    fcfGrowth: safeToPercent(data.fcfGrowth, growthDigits),
    cashEquivalents: safeToBillion(data.cashEquivalents, cashDigits),
    netProfit: safeToBillion(data.netProfit, profitDigits),
    netProfitGrowth: safeToPercent(data.netProfitGrowth, growthDigits),
    roe: safeToPercent(data.roe, roeDigits),
    roa: safeToPercent(data.roa, roaDigits),
    marketCap: safeToBillion(data.marketCap, revenueDigits),
    totalAssets: safeToBillion(data.totalAssets, revenueDigits),
    totalLiabilities: safeToBillion(data.totalLiabilities, revenueDigits),
  };
}

module.exports = {
  safeToFixed,
  safeToPercent,
  safeToBillion,
  safeToTenThousand,
  safeToHKD,
  safeToMultiple,
  safeNumber,
  safeFormatFinancialData,
};
