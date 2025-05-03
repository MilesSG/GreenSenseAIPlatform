<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import ImageUploader from '@/components/ImageUploader.vue'
import { ElMessage } from 'element-plus'

// 上传的图像
const uploadedImage = ref(null)
const isAnalyzing = ref(false)
const analysisComplete = ref(false)
const modelChartContainer = ref(null)
const metricChartContainer = ref(null)
const modelChartInstance = ref(null)
const metricChartInstance = ref(null)

// 模型性能数据
const modelPerformance = ref({
  UNet: {
    accuracy: 0.78,
    iou: 0.65,
    precision: 0.82,
    recall: 0.76
  },
  SegNet: {
    accuracy: 0.81,
    iou: 0.69,
    precision: 0.85,
    recall: 0.79
  },
  PSPNet: {
    accuracy: 0.85,
    iou: 0.73,
    precision: 0.88,
    recall: 0.83
  },
  DeepLabV3: {
    accuracy: 0.89,
    iou: 0.76,
    precision: 0.91,
    recall: 0.86
  }
})

// 处理上传的图像
function handleImageUploaded(imageData) {
  uploadedImage.value = imageData.previewUrl
  ElMessage.success('图像上传成功，正在进行模型分析对比')
  analyzeImage()
}

// 分析图像
async function analyzeImage() {
  if (!uploadedImage.value) return
  
  isAnalyzing.value = true
  analysisComplete.value = false
  
  try {
    // 模拟分析过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    analysisComplete.value = true
    
    // 初始化图表
    nextTick(() => {
      initModelChart()
      initMetricChart()
    })
  } finally {
    isAnalyzing.value = false
  }
}

// 初始化模型对比图表
function initModelChart() {
  if (!modelChartContainer.value) return
  
  if (modelChartInstance.value) {
    modelChartInstance.value.dispose()
  }
  
  modelChartInstance.value = echarts.init(modelChartContainer.value)
  
  const option = {
    title: {
      text: '模型性能对比',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['准确率', 'IoU', '精确率', '召回率'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['U-Net', 'SegNet', 'PSPNet', 'DeepLab V3+']
    },
    yAxis: {
      type: 'value',
      name: '性能指标',
      min: 0,
      max: 1
    },
    series: [
      {
        name: '准确率',
        type: 'bar',
        data: [
          modelPerformance.value.UNet.accuracy,
          modelPerformance.value.SegNet.accuracy,
          modelPerformance.value.PSPNet.accuracy,
          modelPerformance.value.DeepLabV3.accuracy
        ]
      },
      {
        name: 'IoU',
        type: 'bar',
        data: [
          modelPerformance.value.UNet.iou,
          modelPerformance.value.SegNet.iou,
          modelPerformance.value.PSPNet.iou,
          modelPerformance.value.DeepLabV3.iou
        ]
      },
      {
        name: '精确率',
        type: 'bar',
        data: [
          modelPerformance.value.UNet.precision,
          modelPerformance.value.SegNet.precision,
          modelPerformance.value.PSPNet.precision,
          modelPerformance.value.DeepLabV3.precision
        ]
      },
      {
        name: '召回率',
        type: 'bar',
        data: [
          modelPerformance.value.UNet.recall,
          modelPerformance.value.SegNet.recall,
          modelPerformance.value.PSPNet.recall,
          modelPerformance.value.DeepLabV3.recall
        ]
      }
    ]
  }
  
  modelChartInstance.value.setOption(option)
}

// 初始化指标对比图表
function initMetricChart() {
  if (!metricChartContainer.value) return
  
  if (metricChartInstance.value) {
    metricChartInstance.value.dispose()
  }
  
  metricChartInstance.value = echarts.init(metricChartContainer.value)
  
  const option = {
    title: {
      text: '模型指标雷达图',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      data: ['U-Net', 'SegNet', 'PSPNet', 'DeepLab V3+'],
      bottom: 10
    },
    radar: {
      indicator: [
        { name: '准确率', max: 1 },
        { name: 'IoU', max: 1 },
        { name: '精确率', max: 1 },
        { name: '召回率', max: 1 }
      ]
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [
              modelPerformance.value.UNet.accuracy,
              modelPerformance.value.UNet.iou,
              modelPerformance.value.UNet.precision,
              modelPerformance.value.UNet.recall
            ],
            name: 'U-Net',
            areaStyle: {}
          },
          {
            value: [
              modelPerformance.value.SegNet.accuracy,
              modelPerformance.value.SegNet.iou,
              modelPerformance.value.SegNet.precision,
              modelPerformance.value.SegNet.recall
            ],
            name: 'SegNet',
            areaStyle: {}
          },
          {
            value: [
              modelPerformance.value.PSPNet.accuracy,
              modelPerformance.value.PSPNet.iou,
              modelPerformance.value.PSPNet.precision,
              modelPerformance.value.PSPNet.recall
            ],
            name: 'PSPNet',
            areaStyle: {}
          },
          {
            value: [
              modelPerformance.value.DeepLabV3.accuracy,
              modelPerformance.value.DeepLabV3.iou,
              modelPerformance.value.DeepLabV3.precision,
              modelPerformance.value.DeepLabV3.recall
            ],
            name: 'DeepLab V3+',
            areaStyle: {}
          }
        ]
      }
    ]
  }
  
  metricChartInstance.value.setOption(option)
}

// 重置分析
function resetAnalysis() {
  uploadedImage.value = null
  analysisComplete.value = false
  ElMessage.info('已重置分析，您可以上传新的图像')
}

// 监听窗口大小变化
function handleResize() {
  if (modelChartInstance.value) {
    modelChartInstance.value.resize()
  }
  if (metricChartInstance.value) {
    metricChartInstance.value.resize()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})
</script>

<template>
  <div class="model-comparison-view">
    <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">遥感图像多模型对比分析</h1>
    
    <p class="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-3xl">
      上传遥感图像，体验不同深度学习模型的植被识别效果对比。我们提供多种先进模型的性能对比和详细分析。
    </p>
    
    <div class="flex flex-col gap-8 max-w-4xl mx-auto">
      <!-- 上传区域 -->
      <div class="apple-card rounded-2xl backdrop-blur-md">
        <div class="p-6 border-b border-gray-100 dark:border-gray-800">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-1">上传遥感图像</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">支持PNG、JPG格式的卫星或航拍图像</p>
            </div>
            
            <button 
              v-if="uploadedImage" 
              @click="resetAnalysis" 
              class="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline-offset-2 hover:underline transition-colors"
            >
              重新开始分析
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <ImageUploader @image-uploaded="handleImageUploaded" />
        </div>
      </div>
      
      <!-- 加载中状态 -->
      <div v-if="isAnalyzing" class="apple-card rounded-2xl backdrop-blur-md p-12 text-center">
        <div class="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-400 border-t-transparent"></div>
        <p class="mt-6 text-lg text-gray-600 dark:text-gray-300">正在分析图像，请稍候...</p>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">我们正在使用多种深度学习模型处理您的图像</p>
      </div>
      
      <!-- 模型对比结果 -->
      <div v-if="uploadedImage && analysisComplete" class="apple-card rounded-2xl backdrop-blur-md overflow-hidden">
        <div class="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-1">多模型分割对比结果</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            以下展示了不同深度学习模型对上传图像的植被分割结果及性能对比
          </p>
        </div>
        
        <div class="p-6">
          <!-- 模型对比信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-5 rounded-xl shadow-sm">
              <div class="flex items-center mb-3">
                <div class="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">U-Net</h3>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                效果特点：边缘不够平滑，包含一些噪点，对小区域敏感。适合医学影像等细节丰富的场景。
              </p>
            </div>
            
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-5 rounded-xl shadow-sm">
              <div class="flex items-center mb-3">
                <div class="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">SegNet</h3>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                效果特点：比U-Net噪点少，但边缘处理不够理想。在处理道路和建筑等人工结构时表现较好。
              </p>
            </div>
            
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-5 rounded-xl shadow-sm">
              <div class="flex items-center mb-3">
                <div class="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">PSPNet</h3>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                效果特点：更关注大区域，小区域可能丢失，边缘形状不规则。全局背景信息捕获能力强。
              </p>
            </div>
            
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-5 rounded-xl shadow-sm">
              <div class="flex items-center mb-3">
                <div class="w-10 h-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">DeepLab V3+</h3>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                效果特点：边缘更平滑，几乎无噪点，整体分割效果最佳。空洞卷积和ASPP模块提供多尺度感知能力。
              </p>
            </div>
          </div>
          
          <!-- 性能对比图表 -->
          <div class="mb-8">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">性能指标对比</h3>
            <div 
              ref="modelChartContainer" 
              class="w-full shadow-sm rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
              style="height: 350px;"
            ></div>
          </div>
          
          <!-- 雷达图 -->
          <div class="mb-8">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">模型全面评估</h3>
            <div 
              ref="metricChartContainer" 
              class="w-full shadow-sm rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
              style="height: 400px;"
            ></div>
          </div>
          
          <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <div class="flex items-start">
              <div class="mr-3 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  注：上述对比结果基于模拟数据生成，实际应用中应连接后端AI模型进行更准确处理。DeepLab V3+在多项指标上表现最佳，适合大多数遥感植被提取场景。
                </p>
              </div>
            </div>
          </div>
          
          <div class="mt-8 flex justify-center">
            <button 
              @click="resetAnalysis" 
              class="btn-apple"
            >
              重新上传图像
            </button>
          </div>
        </div>
      </div>
      
      <!-- 未上传图像提示 -->
      <div v-if="!uploadedImage && !isAnalyzing" class="apple-card rounded-2xl backdrop-blur-md p-12 text-center">
        <div class="flex flex-col items-center justify-center">
          <div class="mb-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-full shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 class="text-2xl font-medium text-gray-900 dark:text-white mb-3">请上传遥感图像</h3>
          <p class="text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            上传卫星或航空遥感图像后，系统将自动分析并展示多种深度学习模型的植被识别效果对比。您可以直观了解各种模型的优劣及适用场景。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.model-comparison-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.apple-card {
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
}

:deep(.dark) .apple-card {
  background-color: rgba(30, 30, 30, 0.8);
}

.btn-apple {
  background: linear-gradient(to bottom, #0077ed, #0062cc);
  color: white;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 98, 204, 0.2);
}

.btn-apple:hover {
  background: linear-gradient(to bottom, #0062cc, #004fa3);
  box-shadow: 0 4px 10px rgba(0, 98, 204, 0.3);
}

.btn-apple:disabled {
  background: linear-gradient(to bottom, #9cb3d0, #8ca4c0);
  cursor: not-allowed;
}
</style> 