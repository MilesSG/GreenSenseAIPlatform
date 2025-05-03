<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  originalImage: {
    type: String,
    required: true
  }
})

// 模型列表
const models = [
  { id: 'unet', name: 'UNet', color: '#ff0000' },
  { id: 'segnet', name: 'SegNet', color: '#ff0000' },
  { id: 'pspnet', name: 'PSPNet', color: '#ff0000' },
  { id: 'deeplabv3', name: 'DeepLab V3+', color: '#ff0000' }
]

// 处理状态
const isProcessing = ref(false)
const processedResults = ref({})
const labelImage = ref('')
const imageAnalysis = ref(null)

// 生成标签图像（基于图像内容的二值图）
async function generateLabelImage() {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      
      // 绘制原图
      ctx.drawImage(img, 0, 0)
      
      // 获取图像数据
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      
      // 分析图像内容
      const analysis = analyzeImage(data, canvas.width, canvas.height)
      imageAnalysis.value = analysis
      
      // 创建黑白标签图像（基于绿色区域检测）
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        
        // 植被检测：简单的绿色检测 (绿色占比较高)
        const isVegetation = g > Math.max(r, b) + 10
        
        // 二值化
        const value = isVegetation ? 255 : 0
        
        // 设置为黑白
        data[i] = value
        data[i + 1] = value
        data[i + 2] = value
        data[i + 3] = 255
      }
      
      ctx.putImageData(imageData, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    
    img.src = props.originalImage
  })
}

// 分析图像并识别潜在的目标区域
function analyzeImage(imageData, width, height) {
  // 找出图像中的显著区域
  const regions = []
  const pixelMap = new Array(width * height).fill(0)
  
  // 简单的绿色植被检测
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const r = imageData[i]
      const g = imageData[i + 1]
      const b = imageData[i + 2]
      
      // 检测绿色植被
      if (g > Math.max(r, b) + 10) {
        pixelMap[y * width + x] = 1
      }
    }
  }
  
  // 寻找连通区域 (简化的连通区域检测)
  const visited = new Array(width * height).fill(false)
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x
      if (pixelMap[index] === 1 && !visited[index]) {
        // 发现一个新的连通区域
        const region = { pixels: [], x: x, y: y, width: 0, height: 0, minX: x, minY: y, maxX: x, maxY: y }
        
        // 深度优先搜索寻找连通区域 (简化版，仅检查直接相邻点)
        const stack = [{x, y}]
        visited[index] = true
        
        while (stack.length > 0) {
          const {x: cx, y: cy} = stack.pop()
          region.pixels.push({x: cx, y: cy})
          
          // 更新区域边界
          region.minX = Math.min(region.minX, cx)
          region.minY = Math.min(region.minY, cy)
          region.maxX = Math.max(region.maxX, cx)
          region.maxY = Math.max(region.maxY, cy)
          
          // 检查相邻像素
          const directions = [
            {dx: -1, dy: 0}, // 左
            {dx: 1, dy: 0},  // 右
            {dx: 0, dy: -1}, // 上
            {dx: 0, dy: 1}   // 下
          ]
          
          for (const dir of directions) {
            const nx = cx + dir.dx
            const ny = cy + dir.dy
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIndex = ny * width + nx
              if (pixelMap[nIndex] === 1 && !visited[nIndex]) {
                stack.push({x: nx, y: ny})
                visited[nIndex] = true
              }
            }
          }
        }
        
        // 计算区域大小
        region.width = region.maxX - region.minX + 1
        region.height = region.maxY - region.minY + 1
        
        // 只保留足够大的区域
        if (region.pixels.length > 50) {
          regions.push(region)
        }
      }
    }
  }
  
  return { 
    regions: regions.sort((a, b) => b.pixels.length - a.pixels.length).slice(0, 5), // 最多返回5个最大的区域
    pixelMap
  }
}

// 模拟处理图像
async function processImage() {
  if (!props.originalImage) return
  
  isProcessing.value = true
  processedResults.value = {}
  
  try {
    // 生成标签图像并分析图像内容
    labelImage.value = await generateLabelImage()
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 为每个模型创建不同的分割结果
    for (const model of models) {
      processedResults.value[model.id] = await createSegmentationMask(props.originalImage, model.id)
    }
  } finally {
    isProcessing.value = false
  }
}

// 模拟不同模型的分割结果
async function createSegmentationMask(originalImage, modelId) {
  return new Promise(resolve => {
    if (!imageAnalysis.value) {
      resolve(labelImage.value) // 如果没有分析数据，返回标签图像
      return
    }
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      
      // 创建黑色背景
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 基于图像分析结果绘制白色区域
      ctx.fillStyle = 'white'
      
      // 获取要标记的区域
      const regions = [...imageAnalysis.value.regions]
      
      // 模型差异化处理
      let useRedBoxes = true
      
      switch(modelId) {
        case 'unet':
          // UNet: 包含一些额外的噪点，对小区域敏感
          for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width
            const y = Math.random() * canvas.height
            const size = Math.random() * 3 + 1
            ctx.fillRect(x, y, size, size)
          }
          
          // 边缘不平滑
          for (const region of regions) {
            const expandedRegion = { ...region }
            // 随机扩大或缩小区域尺寸
            const expandFactor = 0.9 + Math.random() * 0.2
            ctx.fillRect(
              region.minX,
              region.minY,
              region.width * expandFactor,
              region.height * expandFactor
            )
          }
          break
          
        case 'segnet':
          // SegNet: 比UNet少噪点，但仍有一些
          for (let i = 0; i < 20; i++) {
            const x = Math.random() * canvas.width
            const y = Math.random() * canvas.height
            const size = Math.random() * 2 + 1
            ctx.fillRect(x, y, size, size)
          }
          
          // 处理区域
          for (const region of regions) {
            ctx.fillRect(
              region.minX - 2,  // 稍微扩大区域
              region.minY - 2,
              region.width + 4,
              region.height + 4
            )
          }
          break
          
        case 'pspnet':
          // PSPNet: 更关注大区域，小区域可能丢失
          const filteredRegions = regions.filter(r => r.pixels.length > 100)
          
          for (const region of filteredRegions) {
            // 大区域处理得更好
            ctx.fillRect(
              region.minX,
              region.minY,
              region.width,
              region.height
            )
          }
          
          // 添加一些形状不规则的区域特征
          ctx.beginPath()
          if (regions.length > 0) {
            const largestRegion = regions[0]
            ctx.moveTo(largestRegion.minX, largestRegion.minY)
            // 创建不规则边缘
            for (let i = 0; i < 5; i++) {
              const x = largestRegion.minX + Math.random() * largestRegion.width
              const y = largestRegion.minY + Math.random() * largestRegion.height
              ctx.lineTo(x, y)
            }
            ctx.closePath()
            ctx.fill()
          }
          break
          
        case 'deeplabv3':
          // DeepLab V3+: 边缘更平滑，无噪点，更准确
          useRedBoxes = false
          
          // 使用平滑填充
          for (const region of regions) {
            const expandFactor = 1.05 // 略微放大区域
            
            // 绘制圆角矩形来模拟平滑边缘
            const x = region.minX
            const y = region.minY
            const width = region.width * expandFactor
            const height = region.height * expandFactor
            const radius = 5
            
            ctx.beginPath()
            ctx.moveTo(x + radius, y)
            ctx.lineTo(x + width - radius, y)
            ctx.arcTo(x + width, y, x + width, y + radius, radius)
            ctx.lineTo(x + width, y + height - radius)
            ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
            ctx.lineTo(x + radius, y + height)
            ctx.arcTo(x, y + height, x, y + height - radius, radius)
            ctx.lineTo(x, y + radius)
            ctx.arcTo(x, y, x + radius, y, radius)
            ctx.closePath()
            ctx.fill()
          }
          break
      }
      
      // 添加红框标注（除了DeepLab V3+）
      if (useRedBoxes && regions.length > 0) {
        ctx.strokeStyle = 'red'
        ctx.lineWidth = 2
        
        // 只为最大的2个区域添加红框
        const boxCount = Math.min(2, regions.length)
        for (let i = 0; i < boxCount; i++) {
          const region = regions[i]
          const padding = 5
          ctx.strokeRect(
            region.minX - padding,
            region.minY - padding,
            region.width + padding * 2,
            region.height + padding * 2
          )
        }
      }
      
      resolve(canvas.toDataURL('image/png'))
    }
    
    img.src = originalImage
  })
}

// 监听原始图像变化，自动处理
watch(() => props.originalImage, (newVal) => {
  if (newVal) {
    processImage()
  }
}, { immediate: true })
</script>

<template>
  <div class="model-comparison-grid">
    <!-- 处理中状态 -->
    <div v-if="isProcessing" class="p-8 text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
      <p class="mt-4 text-gray-500 dark:text-gray-400">正在处理图像，模拟多个模型的分割结果...</p>
    </div>
    
    <!-- 结果对比网格 -->
    <div v-else-if="Object.keys(processedResults).length > 0" class="comparison-results">
      <!-- 第一行 -->
      <div class="flex flex-wrap">
        <!-- 原始图像 -->
        <div class="comparison-cell">
          <div class="image-container">
            <img :src="originalImage" alt="原始图像" class="result-image" />
          </div>
          <p class="image-label">(a) 原始图像</p>
        </div>
        
        <!-- 标注图像 -->
        <div class="comparison-cell">
          <div class="image-container">
            <img :src="labelImage" alt="对应图像标签" class="result-image" />
          </div>
          <p class="image-label">(b) 对应图像标签</p>
        </div>
      </div>
      
      <!-- 第二行 -->
      <div class="flex flex-wrap">
        <!-- 各个模型结果 -->
        <div v-for="(model, index) in models" :key="model.id" class="comparison-cell">
          <div class="image-container">
            <img :src="processedResults[model.id]" alt="模型结果" class="result-image" />
          </div>
          <p class="image-label">
            ({{ String.fromCharCode(99 + index) }}) {{ model.name }}
          </p>
        </div>
      </div>
    </div>
    
    <!-- 未处理状态 -->
    <div v-else class="p-8 text-center">
      <p class="text-gray-500 dark:text-gray-400">请上传图像以查看多模型处理结果</p>
    </div>
  </div>
</template>

<style scoped>
.comparison-results {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 100%;
  overflow-x: hidden;
}

.comparison-cell {
  width: 50%;
  padding: 0.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-container {
  width: 100%;
  height: 160px;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.image-label {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
}

@media (max-width: 768px) {
  .comparison-cell {
    width: 100%;
  }
  
  .image-container {
    height: 140px;
  }
}
</style> 