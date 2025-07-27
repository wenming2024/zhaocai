const DeepSeekService = require("../services/deepseekService");

// 模拟财务数据
const mockFinancialData = {
  current: {
    revenue: 150000000000, // 1500亿元
    revenueGrowth: 12.5,
    grossProfit: 45000000000, // 450亿元
    grossMargin: 30.0,
    fcf: 25000000000, // 250亿元
    fcfMargin: 16.7,
    fcfGrowth: 15.2,
    cashEquivalents: 87000000000, // 870亿元
    netProfit: 35000000000, // 350亿元
    netProfitGrowth: 18.5,
    totalAssets: 1200000000000, // 12000亿元
    totalLiabilities: 600000000000, // 6000亿元
    marketCap: 3500000000000, // 35000亿元
    peRatio: 28.5,
    pbRatio: 3.2,
    roe: 15.8,
    roa: 8.5,
  },
  historical: [
    {
      year: 2024,
      reportDate: "2024-12-31",
      revenue: 150000000000,
      fcf: 25000000000,
      netProfit: 35000000000,
      cashEquivalents: 87000000000,
    },
    {
      year: 2023,
      reportDate: "2023-12-31",
      revenue: 133000000000,
      fcf: 21700000000,
      netProfit: 29500000000,
      cashEquivalents: 75000000000,
    },
    {
      year: 2022,
      reportDate: "2022-12-31",
      revenue: 118000000000,
      fcf: 18800000000,
      netProfit: 24800000000,
      cashEquivalents: 65000000000,
    },
    {
      year: 2021,
      reportDate: "2021-12-31",
      revenue: 105000000000,
      fcf: 16000000000,
      netProfit: 22000000000,
      cashEquivalents: 58000000000,
    },
    {
      year: 2020,
      reportDate: "2020-12-31",
      revenue: 95000000000,
      fcf: 13500000000,
      netProfit: 19500000000,
      cashEquivalents: 52000000000,
    },
  ],
};

async function testDeepSeekService() {
  console.log("🧪 开始测试DeepSeek服务...\n");

  const deepseekService = new DeepSeekService();
  const companyName = "腾讯控股";

  try {
    // 测试1: 生成正面反面信息
    console.log("📊 测试1: 生成正面反面信息");
    const prosCons = await deepseekService.generateProsAndCons(
      companyName,
      mockFinancialData
    );
    console.log("✅ 正面信息:", prosCons.pros);
    console.log("❌ 反面信息:", prosCons.cons);
    console.log("");

    // 测试2: 生成经营评级
    console.log("📈 测试2: 生成经营评级");
    const ratings = await deepseekService.generateBusinessRatings(
      companyName,
      mockFinancialData
    );
    console.log("✅ 经营评级:", ratings);
    console.log("");

    // 测试3: 生成收入分布
    console.log("💰 测试3: 生成收入分布");
    const revenueDistribution =
      await deepseekService.generateRevenueDistribution(
        companyName,
        mockFinancialData
      );
    console.log("✅ 收入来源:", revenueDistribution.revenueComposition);
    console.log("✅ 地区分布:", revenueDistribution.regionalDistribution);
    console.log("");

    // 测试4: 生成关键指标
    console.log("🎯 测试4: 生成关键指标");
    const keyMetrics = await deepseekService.generateKeyMetrics(
      companyName,
      mockFinancialData
    );
    console.log("✅ 关键指标:", keyMetrics);
    console.log("");

    // 测试5: 测试API调用失败的情况
    console.log("🔧 测试5: 测试API调用失败情况");
    const originalApiKey = deepseekService.apiKey;
    deepseekService.apiKey = "invalid_key";

    const failedResult = await deepseekService.generateProsAndCons(
      companyName,
      mockFinancialData
    );
    console.log("✅ 失败时返回默认数据:", failedResult.pros.length > 0);

    // 恢复API密钥
    deepseekService.apiKey = originalApiKey;
    console.log("");

    console.log("🎉 所有测试完成！");
  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  }
}

// 测试提示词构建
function testPromptBuilding() {
  console.log("🔍 测试提示词构建...\n");

  const deepseekService = new DeepSeekService();
  const companyName = "腾讯控股";

  // 测试正面反面信息提示词
  console.log("📝 正面反面信息提示词:");
  const prosConsPrompt = deepseekService.buildProsConsPrompt(
    companyName,
    mockFinancialData
  );
  console.log(prosConsPrompt);
  console.log("");

  // 测试经营评级提示词
  console.log("📝 经营评级提示词:");
  const ratingsPrompt = deepseekService.buildRatingsPrompt(
    companyName,
    mockFinancialData
  );
  console.log(ratingsPrompt);
  console.log("");

  // 测试收入分布提示词
  console.log("📝 收入分布提示词:");
  const revenuePrompt = deepseekService.buildRevenuePrompt(
    companyName,
    mockFinancialData
  );
  console.log(revenuePrompt);
  console.log("");

  // 测试关键指标提示词
  console.log("📝 关键指标提示词:");
  const metricsPrompt = deepseekService.buildMetricsPrompt(
    companyName,
    mockFinancialData
  );
  console.log(metricsPrompt);
  console.log("");
}

// 运行测试
if (require.main === module) {
  console.log("🚀 DeepSeek服务测试脚本");
  console.log("=" * 50);

  // 检查环境变量
  if (!process.env.DEEPSEEK_API_KEY) {
    console.log("⚠️  警告: 未设置DEEPSEEK_API_KEY环境变量");
    console.log("   将使用模拟数据进行测试\n");
  } else {
    console.log("✅ 检测到DEEPSEEK_API_KEY环境变量\n");
  }

  // 测试提示词构建
  testPromptBuilding();

  // 测试服务功能
  testDeepSeekService();
}

module.exports = {
  testDeepSeekService,
  testPromptBuilding,
  mockFinancialData,
};
