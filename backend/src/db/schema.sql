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

// 新增一个表，用于存储港股的历史交易数据，数据字段，参见港股历史交易数据.md的K线数据
CREATE TABLE IF NOT EXISTS hk_stock_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL COMMENT '股票代码',
    name VARCHAR(100) NOT NULL COMMENT '股票名称',
    date DATE NOT NULL COMMENT '交易日期',
    open DECIMAL(10,2) NOT NULL COMMENT '开盘价',
    high DECIMAL(10,2) NOT NULL COMMENT '最高价',
    low DECIMAL(10,2) NOT NULL COMMENT '最低价',
    close DECIMAL(10,2) NOT NULL COMMENT '收盘价',
    change_rate DECIMAL(10,2) NOT NULL COMMENT '涨跌幅',
    change_amount DECIMAL(10,2) NOT NULL COMMENT '涨跌额',
    volume BIGINT NOT NULL COMMENT '成交量',
    amount DECIMAL(20,2) NOT NULL COMMENT '成交额',
    turnover_rate DECIMAL(10,2) NOT NULL COMMENT '换手率',
    amplitude DECIMAL(10,2) NOT NULL COMMENT '振幅',
    UNIQUE KEY (`code`, `date`)
);

-- 港股财务数据表
CREATE TABLE IF NOT EXISTS hk_financial_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- 公共属性字段（规则1：合并属性字段）
    SECURITY_CODE VARCHAR(20) NOT NULL COMMENT '股票代码',
    SECUCODE VARCHAR(20) NOT NULL COMMENT '股票代码（带后缀）',
    SECURITY_NAME_ABBR VARCHAR(100) COMMENT '股票简称',
    ORG_CODE VARCHAR(20) COMMENT '机构代码',
    REPORT_DATE DATE NOT NULL COMMENT '报告日期',
    STD_REPORT_DATE DATE COMMENT '标准报告日期',
    DATE_TYPE_CODE VARCHAR(10) COMMENT '日期类型代码',
    FISCAL_YEAR VARCHAR(10) COMMENT '财年',
    START_DATE DATE COMMENT '开始日期',
    CURRENCY VARCHAR(10) DEFAULT 'HKD' COMMENT '货币',
    IS_CNY_CODE TINYINT DEFAULT 0 COMMENT '是否人民币代码',
    ORG_TYPE VARCHAR(50) COMMENT '机构类型',
    
    -- 核心指标接口字段（重要指标）
    PER_NETCASH_OPERATE DECIMAL(20,4) COMMENT '每股经营现金流',
    PER_OI DECIMAL(20,4) COMMENT '每股营业收入',
    BPS DECIMAL(20,4) COMMENT '每股净资产',
    BASIC_EPS DECIMAL(20,4) COMMENT '基本每股收益',
    DILUTED_EPS DECIMAL(20,4) COMMENT '稀释每股收益',
    OPERATE_INCOME BIGINT COMMENT '营业收入',
    OPERATE_INCOME_YOY DECIMAL(10,4) COMMENT '营业收入同比增长',
    GROSS_PROFIT BIGINT COMMENT '毛利润',
    GROSS_PROFIT_YOY DECIMAL(10,4) COMMENT '毛利润同比增长',
    HOLDER_PROFIT BIGINT COMMENT '股东净利润',
    HOLDER_PROFIT_YOY DECIMAL(10,4) COMMENT '股东净利润同比增长',
    GROSS_PROFIT_RATIO DECIMAL(10,4) COMMENT '毛利率',
    EPS_TTM DECIMAL(20,4) COMMENT '每股收益TTM',
    OPERATE_INCOME_QOQ DECIMAL(10,4) COMMENT '营业收入环比增长',
    NET_PROFIT_RATIO DECIMAL(10,4) COMMENT '净利率',
    ROE_AVG DECIMAL(10,4) COMMENT '平均净资产收益率',
    GROSS_PROFIT_QOQ DECIMAL(10,4) COMMENT '毛利润环比增长',
    ROA DECIMAL(10,4) COMMENT '总资产收益率',
    HOLDER_PROFIT_QOQ DECIMAL(10,4) COMMENT '股东净利润环比增长',
    ROE_YEARLY DECIMAL(10,4) COMMENT '年化净资产收益率',
    ROIC_YEARLY DECIMAL(10,4) COMMENT '年化投资资本回报率',
    TOTAL_ASSETS BIGINT COMMENT '总资产',
    TOTAL_LIABILITIES BIGINT COMMENT '总负债',
    TAX_EBT DECIMAL(10,4) COMMENT '税率',
    OCF_SALES DECIMAL(10,4) COMMENT '经营现金流/销售收入',
    TOTAL_PARENT_EQUITY BIGINT COMMENT '母公司股东权益',
    DEBT_ASSET_RATIO DECIMAL(10,4) COMMENT '资产负债率',
    OPERATE_PROFIT BIGINT COMMENT '营业利润',
    PRETAX_PROFIT BIGINT COMMENT '税前利润',
    NETCASH_OPERATE BIGINT COMMENT '经营活动现金流',
    NETCASH_INVEST BIGINT COMMENT '投资活动现金流',
    NETCASH_FINANCE BIGINT COMMENT '筹资活动现金流',
    END_CASH BIGINT COMMENT '期末现金',
    DIVI_RATIO DECIMAL(10,4) COMMENT '分红比例',
    DIVIDEND_RATE DECIMAL(10,4) COMMENT '股息率',
    CURRENT_RATIO DECIMAL(10,4) COMMENT '流动比率',
    COMMON_ACS BIGINT COMMENT '普通股股本',
    CURRENTDEBT_DEBT DECIMAL(10,4) COMMENT '流动负债/总负债',
    ISSUED_COMMON_SHARES BIGINT COMMENT '已发行普通股',
    HK_COMMON_SHARES BIGINT COMMENT '港股普通股',
    PER_SHARES DECIMAL(10,4) COMMENT '每股',
    TOTAL_MARKET_CAP BIGINT COMMENT '总市值',
    HKSK_MARKET_CAP BIGINT COMMENT '港股市值',
    PE_TTM DECIMAL(10,4) COMMENT '市盈率TTM',
    PB_TTM DECIMAL(10,4) COMMENT '市净率TTM',
    REPORT_DATE_SQ DATE COMMENT '上期报告日期',
    REPORT_TYPE_SQ VARCHAR(50) COMMENT '上期报告类型',
    OPERATE_INCOME_SQ BIGINT COMMENT '上期营业收入',
    DPS_HKD DECIMAL(10,4) COMMENT '每股股息（港币）',
    OPERATE_INCOME_QOQ_SQ DECIMAL(10,4) COMMENT '上期营业收入环比',
    NET_PROFIT_RATIO_SQ DECIMAL(10,4) COMMENT '上期净利率',
    HOLDER_PROFIT_SQ BIGINT COMMENT '上期股东净利润',
    HOLDER_PROFIT_QOQ_SQ DECIMAL(10,4) COMMENT '上期股东净利润环比',
    ROE_AVG_SQ DECIMAL(10,4) COMMENT '上期平均净资产收益率',
    PE_TTM_SQ DECIMAL(10,4) COMMENT '上期市盈率TTM',
    PB_TTM_SQ DECIMAL(10,4) COMMENT '上期市净率TTM',
    ROA_SQ DECIMAL(10,4) COMMENT '上期总资产收益率',
    DPS_HKD_LY DECIMAL(10,4) COMMENT '上年度每股股息（港币）',
    PREMIUM_INCOME BIGINT COMMENT '保费收入',
    PREMIUM_INCOME_YOY DECIMAL(10,4) COMMENT '保费收入同比增长',
    NET_INTEREST_INCOME BIGINT COMMENT '净利息收入',
    NET_INTEREST_INCOME_YOY DECIMAL(10,4) COMMENT '净利息收入同比增长',
    FEE_COMMISSION_INCOME BIGINT COMMENT '手续费及佣金收入',
    FEE_COMMISSION_INCOME_YOY DECIMAL(10,4) COMMENT '手续费及佣金收入同比增长',
    ACCOUNTS_RECE_TDAYS DECIMAL(10,4) COMMENT '应收账款周转天数',
    INVENTORY_TDAYS DECIMAL(10,4) COMMENT '存货周转天数',
    CURRENT_ASSETS_TDAYS DECIMAL(10,4) COMMENT '流动资产周转天数',
    TOTAL_ASSETS_TDAYS DECIMAL(10,4) COMMENT '总资产周转天数',
    PREMIUM_EXPENSE BIGINT COMMENT '保费支出',
    LOAN_DEPOSIT DECIMAL(10,4) COMMENT '贷款/存款',
    LOAN_EQUITY DECIMAL(10,4) COMMENT '贷款/股东权益',
    LOAN_ASSETS DECIMAL(10,4) COMMENT '贷款/总资产',
    DEPOSIT_EQUITY DECIMAL(10,4) COMMENT '存款/股东权益',
    DEPOSIT_ASSETS DECIMAL(10,4) COMMENT '存款/总资产',
    EQUITY_MULTIPLIER DECIMAL(10,4) COMMENT '权益乘数',
    EQUITY_RATIO DECIMAL(10,4) COMMENT '权益比率',
    
    -- 资产负债表接口字段（规则2：添加前缀避免覆盖）
    BALANCE_STD_ITEM_CODE VARCHAR(20) COMMENT '资产负债表标准项目代码',
    BALANCE_STD_ITEM_NAME VARCHAR(100) COMMENT '资产负债表标准项目名称',
    BALANCE_AMOUNT BIGINT COMMENT '资产负债表金额',
    
    -- 利润表接口字段（规则2：添加前缀避免覆盖）
    INCOME_STD_ITEM_CODE VARCHAR(20) COMMENT '利润表标准项目代码',
    INCOME_STD_ITEM_NAME VARCHAR(100) COMMENT '利润表标准项目名称',
    INCOME_AMOUNT BIGINT COMMENT '利润表金额',
    
    -- 现金流量表接口字段（规则2：添加前缀避免覆盖）
    CASHFLOW_STD_ITEM_CODE VARCHAR(20) COMMENT '现金流量表标准项目代码',
    CASHFLOW_STD_ITEM_NAME VARCHAR(100) COMMENT '现金流量表标准项目名称',
    CASHFLOW_AMOUNT BIGINT COMMENT '现金流量表金额',
    
    -- 系统字段
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    -- 联合主键
    UNIQUE KEY `uk_security_report` (`SECURITY_CODE`, `REPORT_DATE`),
    
    -- 索引
    INDEX `idx_security_code` (`SECURITY_CODE`),
    INDEX `idx_report_date` (`REPORT_DATE`),
    INDEX `idx_date_type` (`DATE_TYPE_CODE`),
    INDEX `idx_balance_item` (`BALANCE_STD_ITEM_CODE`),
    INDEX `idx_income_item` (`INCOME_STD_ITEM_CODE`),
    INDEX `idx_cashflow_item` (`CASHFLOW_STD_ITEM_CODE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='港股财务数据表';
