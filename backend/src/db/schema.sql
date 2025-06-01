CREATE TABLE IF NOT EXISTS trading_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL COMMENT '股票代码',
    date DATE NOT NULL COMMENT '交易日期',
    open DECIMAL(10,2) NOT NULL COMMENT '开盘价',
    high DECIMAL(10,2) NOT NULL COMMENT '最高价',
    low DECIMAL(10,2) NOT NULL COMMENT '最低价',
    close DECIMAL(10,2) NOT NULL COMMENT '收盘价',
    volume BIGINT NOT NULL COMMENT '成交量',
    amount DECIMAL(20,2) NOT NULL COMMENT '成交额',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code_date (code, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='股票交易数据';

CREATE TABLE IF NOT EXISTS south_trading_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL COMMENT '交易日期',
    total_volume DECIMAL(20,2) NOT NULL COMMENT '总成交量',
    today_volume DECIMAL(20,2) NOT NULL COMMENT '今日成交量',
    today_buy_volume DECIMAL(20,2) NOT NULL COMMENT '今日买入量',
    today_sell_volume DECIMAL(20,2) NOT NULL COMMENT '今日卖出量',
    today_net_buy_volume DECIMAL(20,2) NOT NULL COMMENT '今日净买入量',
    lead_stocks_code VARCHAR(20) NOT NULL COMMENT '领涨股票代码',
    lead_stocks_name VARCHAR(100) NOT NULL COMMENT '领涨股票名称',
    lead_stocks_change_rate DECIMAL(10,2) NOT NULL COMMENT '领涨股票涨跌幅',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='南向交易数据'; 