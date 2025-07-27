// 测试 DeepSeekService 环境变量
require("dotenv").config();

console.log("🧪 测试 DeepSeekService 环境变量...\n");

// 直接测试环境变量
console.log("📊 直接环境变量检查:");
console.log(
  `  - process.env.DEEPSEEK_API_KEY: ${
    process.env.DEEPSEEK_API_KEY ? "已设置" : "未设置"
  }`
);
console.log(
  `  - API Key 长度: ${
    process.env.DEEPSEEK_API_KEY ? process.env.DEEPSEEK_API_KEY.length : 0
  }`
);

// 测试 DeepSeekService 构造函数
console.log("\n📊 测试 DeepSeekService 构造函数:");
const DeepSeekService = require("../services/deepseekService");

try {
  const deepseekService = new DeepSeekService();
  console.log(`  - DeepSeekService 创建成功: ✅`);
  console.log(
    `  - API Key 在服务中: ${deepseekService.apiKey ? "已设置" : "未设置"}`
  );
  console.log(
    `  - API Key 长度: ${
      deepseekService.apiKey ? deepseekService.apiKey.length : 0
    }`
  );
} catch (error) {
  console.log(`  - DeepSeekService 创建失败: ❌`);
  console.log(`  - 错误信息: ${error.message}`);
}

console.log("\n✅ DeepSeekService 环境变量测试完成！");
