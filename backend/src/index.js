const express = require('express');
const cors = require('cors');
const schedule = require('node-schedule');
const {
  fetchLatestData,
  fetchHistoricalData,
} = require("./services/crawlerSouthTrading");
const dataRoutes = require("./routes/data");

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use("/api/data", dataRoutes);

// 抓取历史数据
fetchHistoricalData();

// 定时任务：每天下午4点执行爬虫
schedule.scheduleJob("0 18 * * *", async () => {
  console.log("开始执行每日数据抓取任务...");
  try {
    await fetchLatestData();
    console.log("数据抓取完成");
  } catch (error) {
    console.error("数据抓取失败:", error);
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
}); 