const express = require("express");
const router = express.Router();
const FinancialReportService = require("../services/financialReportService");

const financialReportService = new FinancialReportService();

/**
 * 获取可用的报告期列表
 * GET /api/financial-report/:securityCode/report-dates
 * 注意：这个路由必须在 /:securityCode/:reportDate 之前定义
 */
router.get("/:securityCode/report-dates", async (req, res) => {
  try {
    const { securityCode } = req.params;

    console.log(`[API] 获取报告期列表: ${securityCode}`);

    if (!securityCode) {
      return res.status(400).json({
        success: false,
        message: "股票代码不能为空",
      });
    }

    const reportDates = await financialReportService.getAvailableReportDates(
      securityCode
    );
    console.log("reportDates", reportDates);

    res.json({
      success: true,
      data: reportDates,
    });
  } catch (error) {
    console.error(`[API] 获取报告期列表失败:`, error);
    res.status(500).json({
      success: false,
      message: `获取报告期列表失败: ${error.message}`,
    });
  }
});

/**
 * 获取最新财报数据
 * GET /api/financial-report/:securityCode/latest
 * 注意：这个路由必须在 /:securityCode/:reportDate 之前定义
 */
router.get("/:securityCode/latest", async (req, res) => {
  try {
    const { securityCode } = req.params;

    console.log(`[API] 获取最新财报数据: ${securityCode}`);

    if (!securityCode) {
      return res.status(400).json({
        success: false,
        message: "股票代码不能为空",
      });
    }

    const result = await financialReportService.getFinancialReportData(
      securityCode,
      "latest"
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error(`[API] 获取最新财报数据失败:`, error);
    res.status(500).json({
      success: false,
      message: `获取最新财报数据失败: ${error.message}`,
    });
  }
});

/**
 * 获取财报页面数据
 * GET /api/financial-report/:securityCode/:reportDate
 * 注意：这个路由必须在最后定义，避免与其他路由冲突
 */
router.get("/:securityCode/:reportDate", async (req, res) => {
  try {
    const { securityCode, reportDate } = req.params;

    console.log(`[API] 获取财报数据: ${securityCode}, ${reportDate}`);

    if (!securityCode) {
      return res.status(400).json({
        success: false,
        message: "股票代码不能为空",
      });
    }

    if (!reportDate) {
      return res.status(400).json({
        success: false,
        message: "报告期不能为空",
      });
    }

    const result = await financialReportService.getFinancialReportData(
      securityCode,
      reportDate
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error(`[API] 获取财报数据失败:`, error);
    res.status(500).json({
      success: false,
      message: `获取财报数据失败: ${error.message}`,
    });
  }
});

module.exports = router;
