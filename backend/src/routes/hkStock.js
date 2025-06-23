const express = require("express");
const router = express.Router();
const HKStockTradingService = require("../services/hkStockTrading");

/**
 * 获取港股历史交易数据
 * GET /api/hk-stock/history
 * 参数: code, startDate, endDate
 */
router.get("/history", async (req, res) => {
  try {
    const { code, startDate, endDate } = req.query;

    // 参数验证
    if (!code || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "请提供股票代码、开始日期和结束日期",
      });
    }

    // 调用服务获取数据
    const result = await HKStockTradingService.getHistoryData(
      code,
      startDate,
      endDate
    );

    res.json(result);
  } catch (error) {
    console.error("获取港股历史数据失败:", error);
    res.status(500).json({
      success: false,
      message: error.message || "获取港股历史数据失败",
    });
  }
});

/**
 * 获取港股最新交易数据
 * GET /api/hk-stock/latest
 * 参数: code
 */
router.get("/latest", async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "请提供股票代码",
      });
    }

    const result = await HKStockTradingService.getLatestData(code);
    res.json(result);
  } catch (error) {
    console.error("获取港股最新数据失败:", error);
    res.status(500).json({
      success: false,
      message: error.message || "获取港股最新数据失败",
    });
  }
});

/**
 * 检查港股数据是否存在
 * GET /api/hk-stock/check
 * 参数: code, date
 */
router.get("/check", async (req, res) => {
  try {
    const { code, date } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "请提供股票代码",
      });
    }

    const exists = await HKStockTradingService.checkDataExists(code, date);
    res.json({
      success: true,
      exists: exists,
      message: exists ? "数据存在" : "数据不存在",
    });
  } catch (error) {
    console.error("检查港股数据失败:", error);
    res.status(500).json({
      success: false,
      message: error.message || "检查港股数据失败",
    });
  }
});

/**
 * 获取港股数据时间范围
 * GET /api/hk-stock/range
 * 参数: code
 */
router.get("/range", async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "请提供股票代码",
      });
    }

    const result = await HKStockTradingService.getDataRange(code);
    res.json(result);
  } catch (error) {
    console.error("获取港股数据范围失败:", error);
    res.status(500).json({
      success: false,
      message: error.message || "获取港股数据范围失败",
    });
  }
});

module.exports = router;
