# 数字工具函数 (NumberUtils)

提供安全的数字格式化功能，避免 `toFixed()` 函数在处理无效数据时出现异常。

## 功能特性

- ✅ **安全处理**: 支持 `null`、`undefined`、字符串、数字等多种输入类型
- ✅ **错误容错**: 当输入无效时返回默认值，不会抛出异常
- ✅ **格式化输出**: 提供多种常用的数字格式化功能
- ✅ **类型转换**: 自动处理字符串到数字的转换

## 主要函数

### 1. `safeToFixed(value, digits, defaultValue)`

安全格式化数字为指定小数位数。

**参数:**
- `value`: 要格式化的值（支持数字、字符串、null、undefined）
- `digits`: 小数位数，默认为 0
- `defaultValue`: 默认值，当输入无效时返回，默认为 0

**返回值:** 格式化后的字符串

**示例:**
```javascript
safeToFixed(123.456, 2)        // "123.46"
safeToFixed("123.456", 2)      // "123.46"
safeToFixed(null, 2)           // "0.00"
safeToFixed("abc", 2)          // "0.00"
safeToFixed("abc", 2, 999)     // "999.00"
```

### 2. `safeToPercent(value, digits, defaultValue)`

安全格式化数字为百分比。

**参数:**
- `value`: 要格式化的值
- `digits`: 小数位数，默认为 1
- `defaultValue`: 默认值，默认为 0

**返回值:** 格式化后的百分比字符串

**示例:**
```javascript
safeToPercent(12.34, 1)        // "12.3%"
safeToPercent("12.34", 1)      // "12.3%"
safeToPercent(null, 1)         // "0.0%"
```

### 3. `safeToBillion(value, digits, defaultValue)`

安全格式化数字为亿元单位。

**参数:**
- `value`: 要格式化的值（以元为单位）
- `digits`: 小数位数，默认为 1
- `defaultValue`: 默认值，默认为 0

**返回值:** 格式化后的亿元字符串

**示例:**
```javascript
safeToBillion(123456789000, 1)     // "1234.6亿元"
safeToBillion("123456789000", 1)   // "1234.6亿元"
safeToBillion(null, 1)             // "0.0亿元"
```

### 4. `safeToTenThousand(value, digits, defaultValue)`

安全格式化数字为万元单位。

**参数:**
- `value`: 要格式化的值（以元为单位）
- `digits`: 小数位数，默认为 1
- `defaultValue`: 默认值，默认为 0

**返回值:** 格式化后的万元字符串

**示例:**
```javascript
safeToTenThousand(12345678, 1)     // "1234.6万元"
safeToTenThousand("12345678", 1)   // "1234.6万元"
safeToTenThousand(null, 1)         // "0.0万元"
```

### 5. `safeToHKD(value, digits, defaultValue)`

安全格式化数字为港币。

**参数:**
- `value`: 要格式化的值
- `digits`: 小数位数，默认为 0
- `defaultValue`: 默认值，默认为 0

**返回值:** 格式化后的港币字符串

**示例:**
```javascript
safeToHKD(123.45, 0)          // "123港币"
safeToHKD("123.45", 0)        // "123港币"
safeToHKD(null, 0)            // "0港币"
```

### 6. `safeToMultiple(value, digits, defaultValue)`

安全格式化数字为倍数。

**参数:**
- `value`: 要格式化的值
- `digits`: 小数位数，默认为 1
- `defaultValue`: 默认值，默认为 0

**返回值:** 格式化后的倍数字符串

**示例:**
```javascript
safeToMultiple(15.5, 1)       // "15.5x"
safeToMultiple("15.5", 1)     // "15.5x"
safeToMultiple(null, 1)       // "0.0x"
```

### 7. `safeNumber(value, defaultValue)`

安全转换数字。

**参数:**
- `value`: 要转换的值
- `defaultValue`: 默认值，当输入无效时返回，默认为 0

**返回值:** 转换后的数字

**示例:**
```javascript
safeNumber(123.45)            // 123.45
safeNumber("123.45")          // 123.45
safeNumber(null)              // 0
safeNumber("abc")             // 0
safeNumber("abc", 999)        // 999
```

### 8. `safeFormatFinancialData(data, options)`

安全格式化财务数据对象。

**参数:**
- `data`: 财务数据对象
- `options`: 格式化选项（可选）

**返回值:** 格式化后的财务数据对象

**示例:**
```javascript
const financialData = {
  revenue: 123456789000,
  revenueGrowth: 12.34,
  grossMargin: 45.67,
  fcf: 98765432100,
  // ... 其他财务指标
};

const formatted = safeFormatFinancialData(financialData);
// 返回格式化后的所有财务指标
```

## 使用场景

### 1. 财务数据展示
```javascript
const { safeToBillion, safeToPercent } = require("../utils/numberUtils");

// 在模板中使用
const displayData = {
  revenue: safeToBillion(financialData.revenue, 1),
  growth: safeToPercent(financialData.growth, 1),
  margin: safeToPercent(financialData.margin, 1)
};
```

### 2. API 响应格式化
```javascript
const { safeToFixed, safeToHKD } = require("../utils/numberUtils");

// 格式化 API 响应
const response = {
  fairValue: safeToHKD(dcfResult.fairValue, 0),
  expectedReturn: safeToFixed(dcfResult.expectedReturn, 1) + "%",
  terminalMultiple: safeToFixed(dcfResult.terminalMultiple, 1) + "x"
};
```

### 3. 日志输出
```javascript
const { safeToBillion } = require("../utils/numberUtils");

console.log(`营收: ${safeToBillion(data.revenue, 0)}`);
console.log(`FCF: ${safeToBillion(data.fcf, 0)}`);
```

## 错误处理

所有函数都包含完善的错误处理机制：

1. **类型检查**: 自动处理各种输入类型
2. **数值验证**: 检查是否为有效数字
3. **默认值**: 提供合理的默认值
4. **异常捕获**: 捕获并处理可能的异常

## 测试

运行测试脚本验证功能：

```bash
cd backend && node src/examples/testNumberUtils.js
```

## 最佳实践

1. **统一使用**: 在项目中统一使用这些工具函数，避免直接调用 `toFixed()`
2. **合理设置默认值**: 根据业务场景设置合适的默认值
3. **保持一致性**: 在相同场景下使用相同的小数位数
4. **性能考虑**: 对于大量数据处理，可以考虑缓存格式化结果

## 注意事项

1. 所有函数都是纯函数，不会修改输入参数
2. 返回的格式化字符串包含单位，如 "亿元"、"%"、"港币" 等
3. 对于极大或极小数字，会自动处理精度问题
4. 支持负数输入，会保持负号 