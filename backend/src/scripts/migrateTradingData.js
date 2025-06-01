const fs = require("fs").promises;
const path = require("path");
const TradingData = require("../models/tradingData");

async function migrateTradingData() {
  try {
    const dataDir = path.join(__dirname, "../../data/trading");
    const files = await fs.readdir(dataDir);

    for (const file of files) {
      if (file.endsWith(".txt")) {
        const code = file.replace(".txt", "");
        console.log(`Migrating data for ${code}...`);

        const filePath = path.join(dataDir, file);
        const content = await fs.readFile(filePath, "utf8");
        const lines = content.split("\n").filter((line) => line.trim());

        const tradingData = lines.map((line) => {
          const [date, open, high, low, close, volume, amount] =
            line.split(",");
          return {
            code,
            date,
            open: parseFloat(open),
            high: parseFloat(high),
            low: parseFloat(low),
            close: parseFloat(close),
            volume: parseInt(volume),
            amount: parseFloat(amount),
          };
        });

        await TradingData.bulkCreate(tradingData);
        console.log(
          `Successfully migrated ${tradingData.length} records for ${code}`
        );
      }
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateTradingData();
