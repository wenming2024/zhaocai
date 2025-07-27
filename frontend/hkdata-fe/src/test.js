// 把数字拆成字符串，然后逐位相加，如果进位，需要加到下一位
function addTwoBigNumbers(num1, num2) {
  num1 = String(num1).trim();
  num2 = String(num2).trim();

  // 进位、结果数组、两数的最大长度
  let nextNum = 0;
  let result = [];
  let maxLen = Math.max(num1.length, num2.length);

  // 从末位开始相加
  for (let i = 1; i <= maxLen; i++) {
    // 获取当前位的数字（若超出长度则为0）
    const digit1 = Number(num1[num1.length - i] || 0);
    const digit2 = Number(num2[num2.length - i] || 0);

    // 计算当前位的总和（包含进位）
    const sum = digit1 + digit2 + nextNum;
    // 当前位的结果
    result.unshift(sum % 10);
    // 更新进位
    nextNum = Math.floor(sum / 10);
  }

  // 若最后仍有进位，添加到结果最前面
  if (nextNum > 0) {
    result.unshift(carry);
  }
  return result.join("");
}
