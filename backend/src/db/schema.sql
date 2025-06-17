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

CREATE TABLE `south_chengjiao_hu` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `mutual_type` VARCHAR(8) NOT NULL,
  `security_code` VARCHAR(16) NOT NULL,
  `derive_security_code` VARCHAR(16),
  `security_name` VARCHAR(64),
  `trade_date` DATE NOT NULL,
  `close_price` DECIMAL(12,4),
  `change_rate` DECIMAL(8,4),
  `net_buy_amt` BIGINT,
  `rank` INT,
  `buy_amt` BIGINT,
  `sell_amt` BIGINT,
  `deal_amt` BIGINT,
  `deal_amount` BIGINT,
  `mutual_ratio` DECIMAL(8,4),
  `turnoverrate` DECIMAL(12,8),
  `change` DECIMAL(8,4),
  UNIQUE KEY (`security_code`, `trade_date`)
);

CREATE TABLE `south_chengjiao_shen` LIKE `south_chengjiao_hu`;

CREATE TABLE `south_chengjiao` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `mutual_type` VARCHAR(16),
  `security_code` VARCHAR(16) NOT NULL,
  `derive_security_code` VARCHAR(16),
  `security_name` VARCHAR(64),
  `trade_date` DATE NOT NULL,
  `close_price` DECIMAL(12,4),
  `change_rate` DECIMAL(8,4),
  `hk_net_buyamt` BIGINT,
  `hksh_rank` INT,
  `hksh_net_buyamt` BIGINT,
  `hksh_buy_amt` BIGINT,
  `hksh_sell_amt` BIGINT,
  `hksz_rank` INT,
  `hksz_net_buyamt` BIGINT,
  `hksz_buy_amt` BIGINT,
  `hksz_sell_amt` BIGINT,
  `hk_deal_amt` BIGINT,
  `deal_amt_sz` BIGINT,
  `deal_amt_sh` BIGINT,
  `hk_buy_amt` BIGINT,
  `hk_sell_amt` BIGINT,
  UNIQUE KEY (`security_code`, `trade_date`)
); 