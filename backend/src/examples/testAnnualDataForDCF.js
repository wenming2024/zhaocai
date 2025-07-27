const FinancialReportService = require("../services/financialReportService");
const {
  safeNumber,
  safeToBillion,
  safeToPercent,
  safeToHKD,
  safeToMultiple,
} = require("../utils/numberUtils");

async function testAnnualDataForDCF() {
  console.log("🧪 测试DCF计算使用年度数据...\n");

  const financialReportService = new FinancialReportService();
  const securityCode = "00700";
  const testReportDates = ["2024-Q1", "2024-Q2", "2024-Q3", "2024"];

  for (const reportDate of testReportDates) {
    try {
      console.log(`📊 测试报告期: ${reportDate}`);

      const result = await financialReportService.getFinancialReportData(
        securityCode,
        reportDate
      );

      if (result.success && result.data) {
        const reportData = result.data;

        console.log(`✅ 数据获取成功`);
        console.log(`📅 报告期: ${reportData.reportDate}`);

        // 检查财务数据结构
        if (reportData.financial) {
          console.log(`💰 财务数据存在`);

          // 检查当期数据
          if (reportData.financial.current) {
            const current = reportData.financial.current;
            console.log(`📈 当期数据:`);
            console.log(`  - 营收: ${safeToBillion(current.revenue, 0)}`);
            console.log(`  - FCF: ${safeToBillion(current.fcf, 0)}`);
            console.log(
              `  - FCF利润率: ${safeToPercent(current.fcfMargin, 1)}`
            );
          }

          // 检查年度数据
          if (reportData.financial.annual) {
            const annual = reportData.financial.annual;
            console.log(`📊 年度数据:`);
            console.log(`  - 年份: ${annual.year}年`);
            console.log(`  - 营收: ${safeToBillion(annual.revenue, 0)}`);
            console.log(`  - FCF: ${safeToBillion(annual.fcf, 0)}`);
            console.log(`  - 市值: ${safeToBillion(annual.marketCap, 0)}`);
          } else {
            console.log(`❌ 年度数据缺失`);
          }
        }

        // 检查DCF数据
        if (reportData.dcf) {
          console.log(`📊 DCF数据:`);
          console.log(
            `  - 数据来源: ${reportData.dcf.assumptions?.dataSource || "未知"}`
          );
          console.log(
            `  - 公允价值: ${safeToHKD(reportData.dcf.fairValuePerShare, 0)}`
          );
          console.log(
            `  - 预期回报率: ${safeToPercent(reportData.dcf.expectedReturn, 1)}`
          );
          console.log(
            `  - 终值倍数: ${safeToMultiple(
              reportData.dcf.terminalMultiple,
              1
            )}`
          );

          if (reportData.dcf.annualData) {
            console.log(
              `  - 使用年度数据: ${reportData.dcf.annualData.year}年`
            );
            console.log(
              `  - 年度FCF: ${safeToBillion(reportData.dcf.annualData.fcf, 0)}`
            );
          }
        } else {
          console.log(`❌ DCF数据缺失`);
        }

        // 检查反DCF数据
        if (reportData.reverseDcf) {
          console.log(`📊 反DCF数据:`);
          console.log(
            `  - 数据来源: ${
              reportData.reverseDcf.assumptions?.dataSource || "未知"
            }`
          );
          console.log(
            `  - 隐含增长率: ${safeToPercent(
              reportData.reverseDcf.impliedGrowthRate,
              1
            )}`
          );
          console.log(
            `  - 可行性概率: ${safeToPercent(
              reportData.reverseDcf.feasibilityProbability,
              0
            )}`
          );
          console.log(
            `  - 终值倍数: ${safeToMultiple(
              reportData.reverseDcf.terminalMultiple,
              1
            )}`
          );

          if (reportData.reverseDcf.annualData) {
            console.log(
              `  - 使用年度数据: ${reportData.reverseDcf.annualData.year}年`
            );
            console.log(
              `  - 年度FCF: ${safeToBillion(
                reportData.reverseDcf.annualData.fcf,
                0
              )}`
            );
          }
        } else {
          console.log(`❌ 反DCF数据缺失`);
        }

        // 验证数据一致性
        console.log(`🔍 数据一致性检查:`);
        if (reportData.financial.annual && reportData.dcf?.annualData) {
          const annualFCF = reportData.financial.annual.fcf;
          const dcfFCF = reportData.dcf.annualData.fcf;
          const isConsistent = Math.abs(annualFCF - dcfFCF) < 1000; // 允许1千元误差
          console.log(
            `  - DCF使用年度FCF: ${isConsistent ? "✅ 一致" : "❌ 不一致"}`
          );
        }

        if (reportData.financial.annual && reportData.reverseDcf?.annualData) {
          const annualFCF = reportData.financial.annual.fcf;
          const reverseDcfFCF = reportData.reverseDcf.annualData.fcf;
          const isConsistent = Math.abs(annualFCF - reverseDcfFCF) < 1000; // 允许1千元误差
          console.log(
            `  - 反DCF使用年度FCF: ${isConsistent ? "✅ 一致" : "❌ 不一致"}`
          );
        }
      } else {
        console.log(`❌ 数据获取失败: ${result.message}`);
      }
    } catch (error) {
      console.log(`❌ 测试异常: ${error.message}`);
    }

    console.log("");
  }
}

// 测试年度数据获取逻辑
async function testAnnualDataLogic() {
  console.log("🔍 测试年度数据获取逻辑...\n");

  const financialReportService = new FinancialReportService();
  const securityCode = "00700";

  // 测试不同报告期的年度数据获取
  const testCases = [
    { reportDate: "2024-Q1", expectedAnnualYear: 2023 },
    { reportDate: "2024-Q2", expectedAnnualYear: 2023 },
    { reportDate: "2024-Q3", expectedAnnualYear: 2023 },
    { reportDate: "2024-Q4", expectedAnnualYear: 2024 },
    { reportDate: "2024", expectedAnnualYear: 2024 },
  ];

  for (const testCase of testCases) {
    try {
      console.log(`📅 测试报告期: ${testCase.reportDate}`);
      console.log(`🎯 期望年度: ${testCase.expectedAnnualYear}年`);

      const result = await financialReportService.getFinancialReportData(
        securityCode,
        testCase.reportDate
      );

      if (result.success && result.data?.financial?.annual) {
        const annualData = result.data.financial.annual;
        const actualYear = annualData.year;

        console.log(`✅ 获取到年度数据: ${actualYear}年`);
        console.log(`  - 营收: ${safeToBillion(annualData.revenue, 0)}`);
        console.log(`  - FCF: ${safeToBillion(annualData.fcf, 0)}`);

        if (actualYear === testCase.expectedAnnualYear) {
          console.log(`✅ 年度数据正确`);
        } else {
          console.log(
            `❌ 年度数据不正确，期望${testCase.expectedAnnualYear}年，实际${actualYear}年`
          );
        }
      } else {
        console.log(`❌ 未获取到年度数据`);
      }
    } catch (error) {
      console.log(`❌ 测试异常: ${error.message}`);
    }

    console.log("");
  }
}

// 运行测试
if (require.main === module) {
  console.log("🚀 DCF年度数据测试脚本");
  console.log("=" * 50);

  testAnnualDataForDCF()
    .then(() => testAnnualDataLogic())
    .then(() => {
      console.log("\n✅ 所有测试完成！");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ 测试过程中发生错误:", error.message);
      process.exit(1);
    });
}

module.exports = {
  testAnnualDataForDCF,
  testAnnualDataLogic,
};
