// 测试 JSON 解析功能
require("dotenv").config();

console.log("🧪 测试 JSON 解析功能...\n");

// 模拟 DeepSeekService 的 safeParseJSON 方法
function safeParseJSON(jsonString) {
  try {
    // 移除可能的Markdown代码块格式
    let cleanedString = jsonString.trim();

    // 移除开头的 ```json 或 ```
    if (cleanedString.startsWith("```json")) {
      cleanedString = cleanedString.substring(7);
    } else if (cleanedString.startsWith("```")) {
      cleanedString = cleanedString.substring(3);
    }

    // 移除结尾的 ```
    if (cleanedString.endsWith("```")) {
      cleanedString = cleanedString.substring(0, cleanedString.length - 3);
    }

    // 清理字符串并解析JSON
    cleanedString = cleanedString.trim();
    return JSON.parse(cleanedString);
  } catch (error) {
    console.warn(`JSON解析失败:`, error.message);
    console.warn(`原始字符串:`, jsonString);
    return null;
  }
}

// 测试用例
const testCases = [
  {
    name: "标准JSON",
    input: '{"key": "value"}',
    expected: { key: "value" },
  },
  {
    name: "带Markdown代码块的JSON",
    input: '```json\n{"key": "value"}\n```',
    expected: { key: "value" },
  },
  {
    name: "带json标记的代码块",
    input: '```json\n{"pros": ["正面1", "正面2"], "cons": ["反面1"]}\n```',
    expected: { pros: ["正面1", "正面2"], cons: ["反面1"] },
  },
  {
    name: "不带json标记的代码块",
    input: '```\n{"keyMetrics": {"用户增长率": 12.5}}\n```',
    expected: { keyMetrics: { 用户增长率: 12.5 } },
  },
  {
    name: "复杂的财务数据JSON",
    input: `\`\`\`json
{
  "keyMetrics": {
    "用户增长率": 10.7,
    "客单价增长率": 9.2,
    "市场份额": 48.5,
    "活跃用户数": 890000000,
    "付费用户率": 16.5
  }
}
\`\`\``,
    expected: {
      keyMetrics: {
        用户增长率: 10.7,
        客单价增长率: 9.2,
        市场份额: 48.5,
        活跃用户数: 890000000,
        付费用户率: 16.5,
      },
    },
  },
  {
    name: "无效JSON",
    input: "```json\n{invalid json}\n```",
    expected: null,
  },
];

// 运行测试
console.log("📊 测试结果:");
testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}:`);
  console.log(
    `   输入: ${testCase.input.substring(0, 50)}${
      testCase.input.length > 50 ? "..." : ""
    }`
  );

  const result = safeParseJSON(testCase.input);

  if (result === null && testCase.expected === null) {
    console.log(`   结果: ✅ 正确返回 null`);
  } else if (
    result &&
    testCase.expected &&
    JSON.stringify(result) === JSON.stringify(testCase.expected)
  ) {
    console.log(`   结果: ✅ 解析成功`);
    console.log(`   输出: ${JSON.stringify(result)}`);
  } else {
    console.log(`   结果: ❌ 解析失败`);
    console.log(`   期望: ${JSON.stringify(testCase.expected)}`);
    console.log(`   实际: ${JSON.stringify(result)}`);
  }
});

console.log("\n✅ JSON 解析测试完成！");
