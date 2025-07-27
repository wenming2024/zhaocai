const {
  safeToFixed,
  safeToPercent,
  safeToBillion,
  safeToTenThousand,
  safeToHKD,
  safeToMultiple,
  safeNumber,
  safeFormatFinancialData,
} = require("../utils/numberUtils");

function testNumberUtils() {
  console.log("🧪 测试数字工具函数...\n");

  // 测试 safeToFixed
  console.log("📊 测试 safeToFixed:");
  console.log(`  - 正常数字: ${safeToFixed(123.456, 2)}`);
  console.log(`  - 字符串数字: ${safeToFixed("123.456", 2)}`);
  console.log(`  - null值: ${safeToFixed(null, 2)}`);
  console.log(`  - undefined: ${safeToFixed(undefined, 2)}`);
  console.log(`  - 无效字符串: ${safeToFixed("abc", 2)}`);
  console.log(`  - 负数: ${safeToFixed(-123.456, 2)}`);
  console.log(`  - 零: ${safeToFixed(0, 2)}`);
  console.log("");

  // 测试 safeToPercent
  console.log("📊 测试 safeToPercent:");
  console.log(`  - 正常百分比: ${safeToPercent(12.34, 1)}`);
  console.log(`  - 字符串百分比: ${safeToPercent("12.34", 1)}`);
  console.log(`  - null值: ${safeToPercent(null, 1)}`);
  console.log(`  - 负数: ${safeToPercent(-12.34, 1)}`);
  console.log("");

  // 测试 safeToBillion
  console.log("📊 测试 safeToBillion:");
  console.log(`  - 正常亿元: ${safeToBillion(123456789000, 1)}`);
  console.log(`  - 字符串亿元: ${safeToBillion("123456789000", 1)}`);
  console.log(`  - null值: ${safeToBillion(null, 1)}`);
  console.log(`  - 小数亿元: ${safeToBillion(12345678900, 2)}`);
  console.log("");

  // 测试 safeToTenThousand
  console.log("📊 测试 safeToTenThousand:");
  console.log(`  - 正常万元: ${safeToTenThousand(12345678, 1)}`);
  console.log(`  - 字符串万元: ${safeToTenThousand("12345678", 1)}`);
  console.log(`  - null值: ${safeToTenThousand(null, 1)}`);
  console.log("");

  // 测试 safeToHKD
  console.log("📊 测试 safeToHKD:");
  console.log(`  - 正常港币: ${safeToHKD(123.45, 0)}`);
  console.log(`  - 字符串港币: ${safeToHKD("123.45", 0)}`);
  console.log(`  - null值: ${safeToHKD(null, 0)}`);
  console.log("");

  // 测试 safeToMultiple
  console.log("📊 测试 safeToMultiple:");
  console.log(`  - 正常倍数: ${safeToMultiple(15.5, 1)}`);
  console.log(`  - 字符串倍数: ${safeToMultiple("15.5", 1)}`);
  console.log(`  - null值: ${safeToMultiple(null, 1)}`);
  console.log("");

  // 测试 safeNumber
  console.log("📊 测试 safeNumber:");
  console.log(`  - 正常数字: ${safeNumber(123.45)}`);
  console.log(`  - 字符串数字: ${safeNumber("123.45")}`);
  console.log(`  - null值: ${safeNumber(null)}`);
  console.log(`  - undefined: ${safeNumber(undefined)}`);
  console.log(`  - 无效字符串: ${safeNumber("abc")}`);
  console.log(`  - 自定义默认值: ${safeNumber("abc", 999)}`);
  console.log("");

  // 测试 safeFormatFinancialData
  console.log("📊 测试 safeFormatFinancialData:");
  const testFinancialData = {
    revenue: 123456789000,
    revenueGrowth: 12.34,
    grossMargin: 45.67,
    fcf: 98765432100,
    fcfMargin: 23.45,
    fcfGrowth: 8.9,
    cashEquivalents: 55555555500,
    netProfit: 77777777700,
    netProfitGrowth: 15.6,
    roe: 18.9,
    roa: 12.3,
    marketCap: 1111111111000,
    totalAssets: 2222222222000,
    totalLiabilities: 1111111111000,
  };

  const formattedData = safeFormatFinancialData(testFinancialData);
  console.log("  格式化后的财务数据:");
  Object.entries(formattedData).forEach(([key, value]) => {
    console.log(`    - ${key}: ${value}`);
  });
  console.log("");

  // 测试边界情况
  console.log("📊 测试边界情况:");
  console.log(`  - 极大数字: ${safeToBillion(Number.MAX_SAFE_INTEGER, 0)}`);
  console.log(`  - 极小数字: ${safeToBillion(Number.MIN_SAFE_INTEGER, 0)}`);
  console.log(`  - 无穷大: ${safeToFixed(Infinity, 2)}`);
  console.log(`  - 负无穷大: ${safeToFixed(-Infinity, 2)}`);
  console.log(`  - NaN: ${safeToFixed(NaN, 2)}`);
  console.log("");

  // 测试错误处理
  console.log("📊 测试错误处理:");
  try {
    // 模拟一个会抛出错误的场景
    const result = safeToFixed("invalid", 2);
    console.log(`  - 错误处理正常: ${result}`);
  } catch (error) {
    console.log(`  - 错误处理异常: ${error.message}`);
  }
  console.log("");

  console.log("✅ 所有测试完成！");
}

// 运行测试
if (require.main === module) {
  testNumberUtils();
}

module.exports = {
  testNumberUtils,
};
