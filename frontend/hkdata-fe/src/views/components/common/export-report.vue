<template>
  <div class="export-report" ref="exportButton">
    <el-dropdown @command="handleCommand">
      <el-button type="primary" plain>
        导出报告
        <el-icon class="el-icon--right"><arrow-down /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="image">导出为图片</el-dropdown-item>
          <el-dropdown-item command="pdf">导出为PDF</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { ArrowDown } from '@element-plus/icons-vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { ref } from 'vue'

const props = defineProps({
  targetId: {
    type: String,
    required: true,
    default: 'report-view'
  }
})

const exportButton = ref(null)

// 保存原始样式的元素
const originalStyles = new Map()

// 处理渐变文字
const handleGradientText = (element) => {
  // 获取所有后代元素
  const allElements = element.querySelectorAll('*');
  const gradientElements = [];
  allElements.forEach(el => {
    const style = window.getComputedStyle(el);
    if (
      style.backgroundClip === 'text' ||
      style.webkitBackgroundClip === 'text'
    ) {
      gradientElements.push(el);
    }
  });

  // 处理所有渐变文字节点
  gradientElements.forEach(el => {
    originalStyles.set(el, {
      background: el.style.background,
      backgroundClip: el.style.backgroundClip,
      webkitBackgroundClip: el.style.webkitBackgroundClip,
      textFillColor: el.style.webkitTextFillColor,
      color: el.style.color
    });

    // 获取渐变背景色
    const computedStyle = window.getComputedStyle(el);
    const bgImage = computedStyle.backgroundImage;
    if (bgImage && bgImage !== 'none') {
      // 使用渐变中的第一个颜色
      const firstColor = bgImage.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)/)?.[0];
      el.style.background = 'none';
      el.style.backgroundClip = 'none';
      el.style.webkitBackgroundClip = 'none';
      el.style.webkitTextFillColor = 'initial';
      el.style.color = firstColor || '#000';
    }
  });
}

// 恢复原始样式
const restoreOriginalStyles = () => {
  originalStyles.forEach((styles, element) => {
    Object.entries(styles).forEach(([property, value]) => {
      if (value) {
        element.style[property] = value
      }
    })
  })
  originalStyles.clear()
}

const handleCommand = async (command) => {
  try {
    const element = document.getElementById(props.targetId)
    if (!element) {
      throw new Error('找不到目标元素')
    }

    // 临时隐藏导出按钮
    if (exportButton.value) {
      exportButton.value.style.display = 'none'
    }

    try {
      // 处理渐变文字
      handleGradientText(element)

      if (command === 'image') {
        await exportAsImage(element)
      } else if (command === 'pdf') {
        await exportAsPDF(element)
      }
    } finally {
      // 恢复原始样式
      restoreOriginalStyles()
      // 恢复导出按钮显示
      if (exportButton.value) {
        exportButton.value.style.display = 'block'
      }
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

const exportAsImage = async (element) => {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    onclone: (clonedDoc) => {
      // 在克隆的文档中处理渐变文字
      const clonedElement = clonedDoc.getElementById(props.targetId)
      if (clonedElement) {
        handleGradientText(clonedElement)
      }
    }
  })
  
  const link = document.createElement('a')
  link.download = `报告_${new Date().toLocaleDateString()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

const exportAsPDF = async (element) => {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    onclone: (clonedDoc) => {
      // 在克隆的文档中处理渐变文字
      const clonedElement = clonedDoc.getElementById(props.targetId)
      if (clonedElement) {
        handleGradientText(clonedElement)
      }
    }
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height]
  })

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
  pdf.save(`报告_${new Date().toLocaleDateString()}.pdf`)
}
</script>

<style scoped>
.export-report {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 100;
}

:deep(.el-button) {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
  transition: all 0.3s;
}

:deep(.el-button:hover) {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

:deep(.el-dropdown-menu__item) {
  font-size: 14px;
  padding: 8px 16px;
}
</style> 