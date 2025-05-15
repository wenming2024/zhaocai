const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const moment = require('moment');

const DATA_FILE = path.join(__dirname, '../../data/trading_data.txt');

async function fetchAndSaveData() {
  try {
    // 这里需要根据东方财富的实际接口进行修改
    const response = await axios.get('https://push2.eastmoney.com/api/qt/stock/get', {
      params: {
        secid: '116.HSI', // 恒生指数
        fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f53,f54,f55,f56,f57,f58'
      }
    });

    const data = response.data;
    const today = moment().format('YYYY-MM-DD');
    
    // 构造数据记录
    const record = {
      date: today,
      totalVolume: data.data.f43, // 总成交量
      hkConnectVolume: data.data.f44, // 港股通成交量
      shConnectVolume: data.data.f45, // 沪股通成交量
      szConnectVolume: data.data.f46, // 深股通成交量
    };

    // 读取现有数据
    let existingData = [];
    try {
      const fileContent = await fs.readFile(DATA_FILE, 'utf8');
      existingData = JSON.parse(fileContent);
    } catch (error) {
      // 如果文件不存在或为空，使用空数组
    }

    // 添加新数据
    existingData.push(record);

    // 保存数据
    await fs.writeFile(DATA_FILE, JSON.stringify(existingData, null, 2));
    
    return record;
  } catch (error) {
    console.error('抓取数据失败:', error);
    throw error;
  }
}

module.exports = {
  fetchAndSaveData
}; 