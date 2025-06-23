const axios = require("axios");

async function testHKStockAPI() {
  console.log("开始测试港股API...");

  try {
    // 测试获取历史数据
    const response = await axios.get(
      "http://localhost:3000/api/hk-stock/history",
      {
        params: {
          code: "00700",
          startDate: "2024-01-01",
          endDate: "2024-01-10",
        },
      }
    );

    console.log("API响应:", JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log("✅ API测试成功");
      console.log(`获取到 ${response.data.totalDays} 条数据`);
      console.log(`数据示例:`, response.data.data[0]);
    } else {
      console.log("❌ API测试失败:", response.data.message);
    }
  } catch (error) {
    console.error("❌ API测试出错:", error.response?.data || error.message);
  }
}

// 运行测试
testHKStockAPI();
