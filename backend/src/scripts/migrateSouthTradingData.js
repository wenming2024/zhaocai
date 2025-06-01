const fs = require("fs").promises;
const path = require("path");
const SouthTradingData = require("../models/southTradingData");

async function migrateSouthTradingData() {
  try {
    const filePath = path.join(__dirname, "../data/hk_south_trading_data.txt");
    const content = await fs.readFile(filePath, "utf8");

    // 解析JSON数据
    const dataArray = JSON.parse(content);

    // 转换日期格式
    const tradingData = dataArray.map((data) => {
      return {
        ...data,
        date: data.date.split(" ")[0], // 只保留日期部分
      };
    });

    await SouthTradingData.bulkCreate(tradingData);
    console.log(
      `Successfully migrated ${tradingData.length} records for south trading data`
    );

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateSouthTradingData();
