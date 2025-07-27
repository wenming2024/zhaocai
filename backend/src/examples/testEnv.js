// 测试环境变量加载
require("dotenv").config();

console.log("🧪 测试环境变量加载...\n");

console.log("📊 环境变量检查:");
console.log(
  `  - DEEPSEEK_API_KEY: ${process.env.DEEPSEEK_API_KEY ? "已设置" : "未设置"}`
);
console.log(
  `  - DEEPSEEK_API_KEY 长度: ${
    process.env.DEEPSEEK_API_KEY ? process.env.DEEPSEEK_API_KEY.length : 0
  }`
);
console.log(
  `  - DEEPSEEK_API_KEY 前缀: ${
    process.env.DEEPSEEK_API_KEY
      ? process.env.DEEPSEEK_API_KEY.substring(0, 10) + "..."
      : "N/A"
  }`
);

console.log("\n📊 其他环境变量:");
console.log(`  - DB_HOST: ${process.env.DB_HOST || "未设置"}`);
console.log(`  - DB_USER: ${process.env.DB_USER || "未设置"}`);
console.log(
  `  - DB_PASSWORD: ${process.env.DB_PASSWORD ? "已设置" : "未设置"}`
);
console.log(`  - DB_NAME: ${process.env.DB_NAME || "未设置"}`);
console.log(`  - PORT: ${process.env.PORT || "未设置"}`);

console.log("\n📊 当前工作目录:");
console.log(`  - CWD: ${process.cwd()}`);

console.log("\n📊 .env 文件路径:");
const path = require("path");
const envPath = path.join(process.cwd(), ".env");
console.log(`  - .env 路径: ${envPath}`);

const fs = require("fs");
if (fs.existsSync(envPath)) {
  console.log(`  - .env 文件存在: ✅`);
  const envContent = fs.readFileSync(envPath, "utf8");
  console.log(`  - .env 文件大小: ${envContent.length} 字符`);
  console.log(`  - .env 文件行数: ${envContent.split("\n").length} 行`);
} else {
  console.log(`  - .env 文件存在: ❌`);
}

console.log("\n✅ 环境变量测试完成！");
