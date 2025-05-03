<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import StatCard from '@/components/StatCard.vue'
import { useImageStore } from '@/stores/imageStore'
import { useModelStore } from '@/stores/modelStore'

const router = useRouter()
const imageStore = useImageStore()
const modelStore = useModelStore()

const chartInstance = ref(null)
const chartContainer = ref(null)

// 计算统计数据
const totalImages = computed(() => imageStore.images.length)
const totalModels = computed(() => modelStore.models.length)
const bestModel = computed(() => modelStore.bestPerformingModel?.name || '-')
const averageAccuracy = computed(() => modelStore.averageAccuracy)

// 获取最近处理的图像
const recentImages = computed(() => {
  return imageStore.images.slice(0, 3).map(img => ({
    ...img,
    trend: img.vegetation.change
  }))
})

function goToModelPerformance() {
  router.push('/model-performance')
}

function initChart() {
  if (!chartContainer.value) return
  
  // 初始化图表
  chartInstance.value = echarts.init(chartContainer.value)
  
  // 从模型数据中提取性能数据
  const modelNames = [...new Set(modelStore.models.map(m => m.name))]
  const accuracyData = modelNames.map(name => {
    const model = modelStore.models.find(m => m.name === name)
    return model ? model.accuracy : 0
  })
  const recallData = modelNames.map(name => {
    const model = modelStore.models.find(m => m.name === name)
    return model ? model.recall : 0
  })
  const precisionData = modelNames.map(name => {
    const model = modelStore.models.find(m => m.name === name)
    return model ? model.precision : 0
  })
  
  // 设置图表选项
  const option = {
    title: {
      text: '模型性能对比',
      textStyle: {
        fontWeight: 'normal',
        color: '#333',
      },
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#f5f5f7',
      textStyle: {
        color: '#333'
      }
    },
    legend: {
      data: ['准确率', '召回率', '精确率'],
      bottom: 0,
      itemStyle: {
        borderWidth: 0
      },
      textStyle: {
        color: '#666'
      }
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
      data: modelNames,
      axisLine: {
        lineStyle: {
          color: '#e8e8ed'
        }
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      min: 70,
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      },
      splitLine: {
        lineStyle: {
          color: '#f5f5f7'
        }
      }
    },
    series: [
      {
        name: '准确率',
        type: 'bar',
        data: accuracyData,
        barMaxWidth: 30,
        itemStyle: {
          color: '#0071e3'
        }
      },
      {
        name: '召回率',
        type: 'bar',
        data: recallData,
        barMaxWidth: 30,
        itemStyle: {
          color: '#5ac8fa'
        }
      },
      {
        name: '精确率',
        type: 'bar',
        data: precisionData,
        barMaxWidth: 30,
        itemStyle: {
          color: '#af52de'
        }
      }
    ]
  }
  
  // 渲染图表
  chartInstance.value.setOption(option)
}

function handleResize() {
  if (chartInstance.value) {
    chartInstance.value.resize()
  }
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})
</script>

<template>
  <div class="dashboard">
    <h1 class="apple-heading mb-8">GreenSense AI 仪表盘</h1>
    
    <!-- 统计卡片栏 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard 
        title="已处理图像"
        :value="totalImages"
        icon="image"
        iconColor="apple-blue"
        description="最近30天"
      />
      
      <StatCard 
        title="模型准确率"
        :value="averageAccuracy"
        unit="%"
        icon="chart-line"
        iconColor="apple-teal"
        :trend="1.5"
        description="平均值"
      />
      
      <StatCard 
        title="最佳模型"
        :value="bestModel"
        icon="server"
        iconColor="apple-purple"
        description="按准确率排名"
      />
      
      <StatCard 
        title="模型总数"
        :value="totalModels"
        icon="server"
        iconColor="apple-indigo"
      />
    </div>
    
    <!-- 图表和最近图像 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 模型性能图表 -->
      <div class="lg:col-span-2 apple-chart-container">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">模型性能对比</h2>
          <button @click="goToModelPerformance" class="btn btn-primary text-sm">
            查看详情
          </button>
        </div>
        
        <div ref="chartContainer" class="w-full" style="height: 400px;"></div>
      </div>
      
      <!-- 最近处理的图像 -->
      <div class="apple-chart-container">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">最近处理的图像</h2>
        </div>
        
        <div class="space-y-4">
          <div v-for="image in recentImages" :key="image.id" class="p-3 bg-apple-gray-50 dark:bg-apple-gray-800 rounded-apple">
            <div class="flex items-center">
              <div class="h-14 w-14 bg-apple-gray-200 dark:bg-apple-gray-700 rounded-apple overflow-hidden mr-4">
                <img :src="image.processedUrl" alt="处理后图像" class="h-full w-full object-cover" />
              </div>
              
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ image.name }}</h3>
                <p class="text-xs text-apple-gray-500 dark:text-apple-gray-400 mt-1">{{ image.date }}</p>
              </div>
              
              <div class="flex items-center">
                <svg v-if="image.trend > 0" class="w-4 h-4 text-apple-green" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
                </svg>
                <span class="ml-1 text-xs font-medium" :class="image.trend > 0 ? 'text-apple-green' : 'text-apple-red'">
                  +{{ image.trend.toFixed(1) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 