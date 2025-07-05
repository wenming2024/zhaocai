const HKFinancialService = require("../services/hkFinancialService");
const CrawlerHKFinancialData = require("../services/crawlerHKFinancialData");

/**
 * 港股财务数据使用示例
 */
async function runExamples() {
  console.log("=== 港股财务数据使用示例 ===\n");

  const service = new HKFinancialService();
  const crawler = new CrawlerHKFinancialData();

  try {
    // 示例1: 查询单个股票的财务数据
    console.log("1. 查询单个股票财务数据 (00388 - 香港交易所)");
    const result1 = await service.getFinancialData("00388", {
      limit: 5, // 只返回最近5条记录
      allowCrawl: true, // 允许爬取
    });

    if (result1.success) {
      console.log(`✅ 查询成功，共${result1.count}条记录`);
      console.log("最新数据:", result1.data[0]);
    } else {
      console.log(`❌ 查询失败: ${result1.message}`);
    }
    console.log("");

    // 示例2: 获取财务数据统计信息
    console.log("2. 获取财务数据统计信息");
    const stats = await service.getFinancialDataStats("00388");

    if (stats.success) {
      console.log("✅ 统计信息:", stats.stats);
    } else {
      console.log(`❌ 获取统计信息失败: ${stats.message}`);
    }
    console.log("");

    // 示例3: 检查数据新鲜度
    console.log("3. 检查数据新鲜度");
    const freshness = await service.checkDataFreshness("00388", 30);
    console.log("✅ 数据新鲜度检查:", freshness);
    console.log("");

    // 示例4: 强制更新数据
    console.log("4. 强制更新财务数据");
    const updateResult = await service.updateFinancialData("00388");

    if (updateResult.success) {
      console.log(`✅ 更新成功，共${updateResult.count}条记录`);
      console.log("更新摘要:", updateResult.summary);
    } else {
      console.log(`❌ 更新失败: ${updateResult.message}`);
    }
    console.log("");

    // 示例5: 直接使用爬虫
    console.log("5. 直接使用爬虫获取数据");
    const crawlResult = await crawler.crawlFinancialData("00388");

    if (crawlResult.success) {
      console.log(`✅ 爬取成功，共${crawlResult.data.length}条记录`);
      console.log("爬取摘要:", crawlResult.summary);
    } else {
      console.log(`❌ 爬取失败: ${crawlResult.message}`);
    }
    console.log("");

    // 示例6: 批量更新多个股票
    console.log("6. 批量更新多个股票");
    const stockCodes = ["00388", "00700", "00941"]; // 香港交易所、腾讯、中国移动
    const batchResult = await service.updateBatchFinancialData(stockCodes);

    if (batchResult.success) {
      console.log(`✅ 批量更新完成: ${batchResult.message}`);
      console.log("批量更新摘要:", batchResult.summary);
    } else {
      console.log(`❌ 批量更新失败: ${batchResult.message}`);
    }
    console.log("");

    // 示例7: 获取所有股票代码
    console.log("7. 获取所有有财务数据的股票代码");
    const allStocks = await service.getAllStockCodes();

    if (allStocks.success) {
      console.log(`✅ 获取成功，共${allStocks.count}个股票`);
      console.log("前5个股票:", allStocks.data.slice(0, 5));
    } else {
      console.log(`❌ 获取失败: ${allStocks.message}`);
    }
    console.log("");

    // 示例8: 查询特定报告期的数据
    console.log("8. 查询特定报告期的数据");
    const specificDate = "2024-12-31";
    const dateResult = await service.getFinancialDataByDate(
      "00388",
      specificDate
    );

    if (dateResult.success && dateResult.data) {
      console.log(`✅ 查询成功，报告期: ${specificDate}`);
      console.log("数据:", dateResult.data);
    } else {
      console.log(`❌ 查询失败或数据不存在: ${dateResult.message}`);
    }
    console.log("");
  } catch (error) {
    console.error("❌ 示例运行失败:", error);
  }
}

/**
 * 测试爬虫功能
 */
async function testCrawler() {
  console.log("=== 测试爬虫功能 ===\n");

  const crawler = new CrawlerHKFinancialData();

  try {
    // 测试1: 爬取核心指标
    console.log("1. 测试爬取核心指标数据");
    const mainIndicators = await crawler.crawlMainIndicators("00388");
    console.log(`✅ 核心指标数据: ${mainIndicators.length}条`);
    if (mainIndicators.length > 0) {
      console.log("示例数据:", mainIndicators[0]);
    }
    console.log("");

    // 测试2: 爬取资产负债表
    console.log("2. 测试爬取资产负债表数据");
    const reportDates = ["2024-12-31", "2024-06-30"];
    const balanceSheet = await crawler.crawlBalanceSheet("00388", reportDates);
    console.log(`✅ 资产负债表数据: ${balanceSheet.length}条`);
    if (balanceSheet.length > 0) {
      console.log("示例数据:", balanceSheet[0]);
    }
    console.log("");

    // 测试3: 爬取利润表
    console.log("3. 测试爬取利润表数据");
    const incomeStatement = await crawler.crawlIncomeStatement(
      "00388",
      reportDates
    );
    console.log(`✅ 利润表数据: ${incomeStatement.length}条`);
    if (incomeStatement.length > 0) {
      console.log("示例数据:", incomeStatement[0]);
    }
    console.log("");

    // 测试4: 爬取现金流量表
    console.log("4. 测试爬取现金流量表数据");
    const cashFlow = await crawler.crawlCashFlow("00388", reportDates);
    console.log(`✅ 现金流量表数据: ${cashFlow.length}条`);
    if (cashFlow.length > 0) {
      console.log("示例数据:", cashFlow[0]);
    }
    console.log("");
  } catch (error) {
    console.error("❌ 爬虫测试失败:", error);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log("开始运行港股财务数据示例...\n");

  // 运行基本示例
  await runExamples();

  console.log("\n" + "=".repeat(50) + "\n");

  // 运行爬虫测试
  await testCrawler();

  console.log("\n示例运行完成！");
}

// 如果直接运行此文件，则执行主函数
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  runExamples,
  testCrawler,
};
