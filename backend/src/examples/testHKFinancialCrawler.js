const CrawlerHKFinancialData = require("../services/crawlerHKFinancialData");

async function testCrawler() {
  console.log("=== 测试港股财务数据爬虫 ===\n");

  const crawler = new CrawlerHKFinancialData();

  try {
    // 测试1: 爬取核心指标
    console.log("1. 测试爬取核心指标数据 (00388)");
    const mainIndicators = await crawler.crawlMainIndicators("00388");
    console.log(`✅ 核心指标数据: ${mainIndicators.length}条`);
    if (mainIndicators.length > 0) {
      console.log("示例数据:", {
        SECURITY_CODE: mainIndicators[0].SECURITY_CODE,
        SECURITY_NAME_ABBR: mainIndicators[0].SECURITY_NAME_ABBR,
        REPORT_DATE: mainIndicators[0].REPORT_DATE,
        BASIC_EPS: mainIndicators[0].BASIC_EPS,
        OPERATE_INCOME: mainIndicators[0].OPERATE_INCOME,
      });
    }
    console.log("");

    // 测试2: 爬取资产负债表
    console.log("2. 测试爬取资产负债表数据");
    const reportDates = ["2024-12-31", "2024-06-30"];
    const balanceSheet = await crawler.crawlBalanceSheet("00388", reportDates);
    console.log(`✅ 资产负债表数据: ${balanceSheet.length}条`);
    if (balanceSheet.length > 0) {
      console.log("示例数据:", {
        SECURITY_CODE: balanceSheet[0].SECURITY_CODE,
        REPORT_DATE: balanceSheet[0].REPORT_DATE,
        STD_ITEM_NAME: balanceSheet[0].STD_ITEM_NAME,
        AMOUNT: balanceSheet[0].AMOUNT,
      });
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
      console.log("示例数据:", {
        SECURITY_CODE: incomeStatement[0].SECURITY_CODE,
        REPORT_DATE: incomeStatement[0].REPORT_DATE,
        STD_ITEM_NAME: incomeStatement[0].STD_ITEM_NAME,
        AMOUNT: incomeStatement[0].AMOUNT,
      });
    }
    console.log("");

    // 测试4: 爬取现金流量表
    console.log("4. 测试爬取现金流量表数据");
    const cashFlow = await crawler.crawlCashFlow("00388", reportDates);
    console.log(`✅ 现金流量表数据: ${cashFlow.length}条`);
    if (cashFlow.length > 0) {
      console.log("示例数据:", {
        SECURITY_CODE: cashFlow[0].SECURITY_CODE,
        REPORT_DATE: cashFlow[0].REPORT_DATE,
        STD_ITEM_NAME: cashFlow[0].STD_ITEM_NAME,
        AMOUNT: cashFlow[0].AMOUNT,
      });
    }
    console.log("");

    // 测试5: 完整爬取
    console.log("5. 测试完整爬取财务数据");
    const fullResult = await crawler.crawlFinancialData("00388");
    console.log(`✅ 完整爬取结果: ${fullResult.success ? "成功" : "失败"}`);
    if (fullResult.success) {
      console.log("数据摘要:", fullResult.summary);
      console.log("合并后数据条数:", fullResult.data.length);
    } else {
      console.log("错误信息:", fullResult.message);
    }
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  testCrawler().catch(console.error);
}

module.exports = { testCrawler };
