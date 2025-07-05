const express = require("express");
const router = express.Router();
const HKFinancialService = require("../services/hkFinancialService");

const service = new HKFinancialService();

/**
 * 获取指定股票的财务数据
 * GET /api/hk-financial/:stockCode
 */
router.get("/:stockCode", async (req, res) => {
  console.log("get /api/hk-financial/:stockCode");
  try {
    const { stockCode } = req.params;
    const { startDate, endDate, limit, allowCrawl } = req.query;

    // 验证股票代码格式
    if (!stockCode || !/^\d{4,5}$/.test(stockCode)) {
      return res.status(400).json({
        success: false,
        message: "股票代码格式错误，请输入4-5位数字代码",
      });
    }

    const options = {
      startDate,
      endDate,
      limit: limit ? parseInt(limit) : undefined,
      allowCrawl: allowCrawl !== "false",
    };

    const result = await service.getFinancialData(stockCode, options);

    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error("获取财务数据失败:", error);
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
      error: error.message,
    });
  }
});

/**
 * 获取指定股票和报告期的财务数据
 * GET /api/hk-financial/:stockCode/date/:reportDate
 */
router.get("/:stockCode/date/:reportDate", async (req, res) => {
  try {
    const { stockCode, reportDate } = req.params;
    const { allowCrawl } = req.query;

    // 验证股票代码格式
    if (!stockCode || !/^\d{4,5}$/.test(stockCode)) {
      return res.status(400).json({
        success: false,
        message: "股票代码格式错误，请输入4-5位数字代码",
      });
    }

    // 验证报告期格式
    if (!reportDate || !/^\d{4}-\d{2}-\d{2}$/.test(reportDate)) {
      return res.status(400).json({
        success: false,
        message: "报告期格式错误，请使用YYYY-MM-DD格式",
      });
    }

    const options = {
      allowCrawl: allowCrawl !== "false",
    };

    const result = await service.getFinancialDataByDate(
      stockCode,
      reportDate,
      options
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error("获取财务数据失败:", error);
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
      error: error.message,
    });
  }
});

/**
 * 获取财务数据统计信息
 * GET /api/hk-financial/:stockCode/stats
 */
router.get("/:stockCode/stats", async (req, res) => {
  try {
    const { stockCode } = req.params;

    // 验证股票代码格式
    if (!stockCode || !/^\d{4,5}$/.test(stockCode)) {
      return res.status(400).json({
        success: false,
        message: "股票代码格式错误，请输入4-5位数字代码",
      });
    }

    const result = await service.getFinancialDataStats(stockCode);

    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error("获取统计信息失败:", error);
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
      error: error.message,
    });
  }
});

/**
 * 强制更新指定股票的财务数据
 * POST /api/hk-financial/:stockCode/update
 */
router.post("/:stockCode/update", async (req, res) => {
  try {
    const { stockCode } = req.params;

    // 验证股票代码格式
    if (!stockCode || !/^\d{4,5}$/.test(stockCode)) {
      return res.status(400).json({
        success: false,
        message: "股票代码格式错误，请输入4-5位数字代码",
      });
    }

    const result = await service.updateFinancialData(stockCode);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("更新财务数据失败:", error);
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
      error: error.message,
    });
  }
});

/**
 * 批量更新多个股票的财务数据
 * POST /api/hk-financial/batch-update
 */
router.post("/batch-update", async (req, res) => {
  try {
    const { stockCodes } = req.body;

    if (!stockCodes || !Array.isArray(stockCodes) || stockCodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "请提供股票代码数组",
      });
    }

    // 验证股票代码格式
    const invalidCodes = stockCodes.filter((code) => !/^\d{4,5}$/.test(code));
    if (invalidCodes.length > 0) {
      return res.status(400).json({
        success: false,
        message: `以下股票代码格式错误: ${invalidCodes.join(", ")}`,
      });
    }

    const result = await service.updateBatchFinancialData(stockCodes);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("批量更新财务数据失败:", error);
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
      error: error.message,
    });
  }
});

/**
 * 检查数据新鲜度
 * GET /api/hk-financial/:stockCode/freshness
 */
router.get("/:stockCode/freshness", async (req, res) => {
  try {
    const { stockCode } = req.params;
    const { daysThreshold } = req.query;

    // 验证股票代码格式
    if (!stockCode || !/^\d{4,5}$/.test(stockCode)) {
      return res.status(400).json({
        success: false,
        message: "股票代码格式错误，请输入4-5位数字代码",
      });
    }

    const threshold = daysThreshold ? parseInt(daysThreshold) : 30;
    const result = await service.checkDataFreshness(stockCode, threshold);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("检查数据新鲜度失败:", error);
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
      error: error.message,
    });
  }
});

/**
 * 获取所有有财务数据的股票代码
 * GET /api/hk-financial/stocks
 */
router.get("/stocks", async (req, res) => {
  try {
    const result = await service.getAllStockCodes();

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("获取股票代码失败:", error);
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
      error: error.message,
    });
  }
});

module.exports = router;
