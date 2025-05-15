const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const moment = require('moment');

const DATA_FILE = path.join(__dirname, '../../data/trading_data.txt');

// 获取指定日期范围的数据
router.get('/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: '请提供开始日期和结束日期' });
    }

    const fileContent = await fs.readFile(DATA_FILE, 'utf8');
    const allData = JSON.parse(fileContent);

    const filteredData = allData.filter(record => {
      const recordDate = moment(record.date);
      return recordDate.isBetween(startDate, endDate, 'day', '[]');
    });

    res.json(filteredData);
  } catch (error) {
    console.error('获取数据失败:', error);
    res.status(500).json({ error: '获取数据失败' });
  }
});

// 获取最新数据
router.get('/latest', async (req, res) => {
  try {
    const fileContent = await fs.readFile(DATA_FILE, 'utf8');
    const allData = JSON.parse(fileContent);
    
    if (allData.length === 0) {
      return res.status(404).json({ error: '没有可用数据' });
    }

    const latestData = allData[allData.length - 1];
    res.json(latestData);
  } catch (error) {
    console.error('获取最新数据失败:', error);
    res.status(500).json({ error: '获取最新数据失败' });
  }
});

module.exports = router; 