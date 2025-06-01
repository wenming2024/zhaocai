const express = require('express');
const router = express.Router();
const SouthTradingService = require("../services/southTradingService");

// 获取指定日期范围的数据
router.get("/range", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "请提供开始日期和结束日期" });
    }

    const data = await SouthTradingService.getDataByDateRange(
      startDate,
      endDate
    );
    res.json(data);
  } catch (error) {
    console.error("获取数据失败:", error);
    res
      .status(error.message === "日期格式无效" ? 400 : 500)
      .json({ error: error.message || "获取数据失败" });
  }
});

// 获取最新数据
router.get("/latest", async (req, res) => {
  try {
    const latestData = await SouthTradingService.getLatestData();
    res.json(latestData);
  } catch (error) {
    console.error("获取最新数据失败:", error);
    res
      .status(error.message === "没有可用数据" ? 404 : 500)
      .json({ error: error.message || "获取最新数据失败" });
  }
});

// 获取统计数据
router.get("/stats", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "请提供开始日期和结束日期" });
    }

    const stats = await SouthTradingService.getStats(startDate, endDate);
    res.json(stats);
  } catch (error) {
    console.error("获取统计数据失败:", error);
    res
      .status(error.message === "日期格式无效" ? 400 : 500)
      .json({ error: error.message || "获取统计数据失败" });
  }
});

module.exports = router; 