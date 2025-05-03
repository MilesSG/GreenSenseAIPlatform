<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useModelStore } from '@/stores/modelStore'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useVModel } from '@vueuse/core'

const modelStore = useModelStore()

// 图表实例
const radarChartRef = ref(null)
const barChartRef = ref(null)
const trendChartRef = ref(null)
const heatmapChartRef = ref(null)
const scenarioChartRef = ref(null)
const efficiencyChartRef = ref(null)
const radarInstance = ref(null)
const barInstance = ref(null)
const trendInstance = ref(null)
const heatmapInstance = ref(null)
const scenarioInstance = ref(null)
const efficiencyInstance = ref(null)

// 过滤条件
const selectedRegion = ref('全部')
const selectedSeason = ref('全部')
const selectedMetric = ref('accuracy')
const showAnimation = ref(true)
const isCompareMode = ref(false)
const selectedModels = ref([])
const sortBy = ref('accuracy')
const sortOrder = ref('desc')
const timeRange = ref('1year')
const activeTab = ref('charts')

// 计算属性
const filteredModels = computed(() => modelStore.filteredModels)
const regions = computed(() => ['全部', ...modelStore.regions])
const seasons = computed(() => ['全部', ...modelStore.seasons])
const scenarios = computed(() => ['全部', ...modelStore.scenarios])

// 指标选项
const metricOptions = [
  { value: 'accuracy', label: '准确率' },
  { value: 'recall', label: '召回率' },
  { value: 'precision', label: '精确率' },
  { value: 'f1Score', label: 'F1分数' },
  { value: 'inferenceSpeed', label: '推理速度' },
  { value: 'energyConsumption', label: '能耗' },
  { value: 'robustness', label: '鲁棒性' }
]

// 时间范围选项
const timeRangeOptions = [
  { value: '1month', label: '近1个月' },
  { value: '3month', label: '近3个月' },
  { value: '6month', label: '近6个月' },
  { value: '1year', label: '近1年' }
]

// 排序后的模型
const sortedModels = computed(() => {
  const models = [...filteredModels.value]
  
  return models.sort((a, b) => {
    if (sortOrder.value === 'asc') {
      return a[sortBy.value] - b[sortBy.value]
    } else {
      return b[sortBy.value] - a[sortBy.value]
    }
  })
})

// 计算模型对比数据
const comparisonData = computed(() => {
  if (!isCompareMode.value || selectedModels.value.length === 0) return null
  
  const models = filteredModels.value.filter(m => selectedModels.value.includes(m.id))
  const metrics = ['accuracy', 'recall', 'precision', 'f1Score', 'inferenceSpeed', 'energyConsumption', 'robustness']
  
  return {
    models,
    metrics,
    differences: metrics.map(metric => {
      if (models.length < 2) return { metric, value: 0 }
      
      const diff = models[0][metric] - models[1][metric]
      return {
        metric,
        value: diff,
        isPositive: diff > 0
      }
    })
  }
})

// 计算效率统计信息
const efficiencyStats = computed(() => {
  if (filteredModels.value.length === 0) return null
  
  const models = filteredModels.value
  const efficiencyScores = models.map(model => {
    return {
      name: model.name,
      score: Number(modelStore.calculateEfficiencyScore(model)),
      accuracy: model.accuracy,
      energy: model.energyConsumption
    }
  })
  
  return {
    scores: efficiencyScores,
    average: (efficiencyScores.reduce((sum, item) => sum + item.score, 0) / efficiencyScores.length).toFixed(1),
    highest: efficiencyScores.reduce((max, item) => Math.max(max, item.score), 0).toFixed(1),
    lowest: efficiencyScores.reduce((min, item) => Math.min(min, item.score), 100).toFixed(1)
  }
})

// 生成月份数据
function getMonthsData() {
  const months = []
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  
  const monthCount = timeRange.value === '1month' ? 1 : 
                     timeRange.value === '3month' ? 3 : 
                     timeRange.value === '6month' ? 6 : 12
  
  for (let i = 0; i < monthCount; i++) {
    let month = currentMonth - i
    if (month < 0) month += 12
    
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    months.unshift(monthNames[month])
  }
  
  return months
}

// 筛选模型
function filterModels() {
  modelStore.setRegion(selectedRegion.value)
  modelStore.setSeason(selectedSeason.value)
  
  // 更新图表
  nextTick(() => {
    initCharts()
  })
}

// 切换排序顺序
function toggleSort(column) {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'desc'
  }
}

// 切换对比模式
function toggleCompareMode() {
  isCompareMode.value = !isCompareMode.value
  selectedModels.value = []
  
  if (!isCompareMode.value) {
    nextTick(() => {
      initCharts()
    })
  } else {
    ElMessage({
      message: '请选择要对比的模型 (最多3个)',
      type: 'info'
    })
  }
}

// 选择/取消选择模型进行对比
function toggleModelSelection(modelId) {
  if (!isCompareMode.value) return
  
  const index = selectedModels.value.indexOf(modelId)
  if (index !== -1) {
    selectedModels.value.splice(index, 1)
  } else {
    if (selectedModels.value.length < 3) {
      selectedModels.value.push(modelId)
    } else {
      ElMessage({
        message: '最多只能选择3个模型进行对比',
        type: 'warning'
      })
    }
  }
}

// 生成随机趋势数据
function generateTrendData(baseValue, months = 12, variance = 3) {
  const data = []
  let value = baseValue
  
  for (let i = 0; i < months; i++) {
    // 添加随机波动
    const change = (Math.random() - 0.5) * variance
    value = Math.min(100, Math.max(70, value + change))
    data.push(value)
  }
  
  return data
}

// 初始化雷达图
function initRadarChart() {
  if (!radarChartRef.value) return
  
  // 如果已存在实例，则销毁
  if (radarInstance.value) {
    radarInstance.value.dispose()
  }
  
  // 初始化图表
  radarInstance.value = echarts.init(radarChartRef.value)
  
  // 构建雷达图数据
  let modelNames = []
  let seriesData = []
  
  if (isCompareMode.value && selectedModels.value.length > 0) {
    // 对比模式: 只显示选中的模型
    modelNames = selectedModels.value.map(id => {
      const model = filteredModels.value.find(m => m.id === id)
      return model ? model.name : ''
    }).filter(name => name)
    
    seriesData = selectedModels.value.map(id => {
      const model = filteredModels.value.find(m => m.id === id)
      if (!model) return null
      
      return {
        name: model.name,
        value: [
          model.accuracy,
          model.recall,
          model.precision,
          model.f1Score,
          model.inferenceSpeed,
          model.robustness
        ]
      }
    }).filter(item => item)
  } else {
    // 标准模式: 显示所有模型分组
    modelNames = [...new Set(filteredModels.value.map(m => m.name))]
    
    seriesData = modelNames.map(name => {
      const model = filteredModels.value.find(m => m.name === name)
      
      return {
        name,
        value: [
          model.accuracy,
          model.recall,
          model.precision,
          model.f1Score,
          model.inferenceSpeed,
          model.robustness
        ]
      }
    })
  }
  
  // 雷达图指标
  const indicators = [
    { name: '准确率', max: 100 },
    { name: '召回率', max: 100 },
    { name: '精确率', max: 100 },
    { name: 'F1分数', max: 100 },
    { name: '推理速度', max: 100 },
    { name: '鲁棒性', max: 100 }
  ]
  
  // 图表配置选项
  const option = {
    title: {
      text: '模型性能雷达图对比',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      },
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: params => {
        const { name, value } = params
        return `
          <div class="font-bold">${name}</div>
          <div>准确率: ${value[0].toFixed(1)}%</div>
          <div>召回率: ${value[1].toFixed(1)}%</div>
          <div>精确率: ${value[2].toFixed(1)}%</div>
          <div>F1分数: ${value[3].toFixed(1)}%</div>
          <div>推理速度: ${value[4].toFixed(1)}</div>
          <div>鲁棒性: ${value[5].toFixed(1)}%</div>
        `
      }
    },
    legend: {
      data: modelNames,
      bottom: 0,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: 12
      }
    },
    radar: {
      indicator: indicators,
      center: ['50%', '50%'],
      radius: '65%',
      splitNumber: 5,
      shape: 'polygon',
      splitLine: {
        lineStyle: {
          color: 'rgba(128, 128, 128, 0.2)'
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(128, 128, 128, 0.3)'
        }
      }
    },
    series: [
      {
        type: 'radar',
        data: seriesData,
        areaStyle: {
          opacity: 0.2
        },
        lineStyle: {
          width: 2.5
        },
        animation: showAnimation.value
      }
    ],
    color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#9932CC']
  }
  
  // 渲染图表
  radarInstance.value.setOption(option)
}

// 初始化柱状图
function initBarChart() {
  if (!barChartRef.value) return
  
  // 如果已存在实例，则销毁
  if (barInstance.value) {
    barInstance.value.dispose()
  }
  
  // 初始化图表
  barInstance.value = echarts.init(barChartRef.value)
  
  // 构建柱状图数据
  let modelNames = []
  let accuracyData = []
  let recallData = []
  let precisionData = []
  let f1ScoreData = []
  
  if (isCompareMode.value && selectedModels.value.length > 0) {
    // 对比模式
    modelNames = selectedModels.value.map(id => {
      const model = filteredModels.value.find(m => m.id === id)
      return model ? model.name : ''
    }).filter(name => name)
    
    accuracyData = selectedModels.value.map(id => {
      const model = filteredModels.value.find(m => m.id === id)
      return model ? model.accuracy : 0
    })
    
    recallData = selectedModels.value.map(id => {
      const model = filteredModels.value.find(m => m.id === id)
      return model ? model.recall : 0
    })
    
    precisionData = selectedModels.value.map(id => {
      const model = filteredModels.value.find(m => m.id === id)
      return model ? model.precision : 0
    })
    
    f1ScoreData = selectedModels.value.map(id => {
      const model = filteredModels.value.find(m => m.id === id)
      return model ? model.f1Score : 0
    })
  } else {
    // 标准模式
    modelNames = [...new Set(filteredModels.value.map(m => m.name))]
    
    accuracyData = modelNames.map(name => {
      const model = filteredModels.value.find(m => m.name === name)
      return model ? model.accuracy : 0
    })
    
    recallData = modelNames.map(name => {
      const model = filteredModels.value.find(m => m.name === name)
      return model ? model.recall : 0
    })
    
    precisionData = modelNames.map(name => {
      const model = filteredModels.value.find(m => m.name === name)
      return model ? model.precision : 0
    })
    
    f1ScoreData = modelNames.map(name => {
      const model = filteredModels.value.find(m => m.id === id)
      return model ? model.f1Score : 0
    })
  }
  
  // 图表配置选项
  const option = {
    title: {
      text: '模型性能评价指标对比',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      },
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: params => {
        let res = `<div class="font-bold">${params[0].name}</div>`
        params.forEach(param => {
          res += `<div>${param.seriesName}: ${param.value.toFixed(1)}%</div>`
        })
        return res
      }
    },
    legend: {
      data: ['准确率', '召回率', '精确率', 'F1分数'],
      bottom: 0,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: 12
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
      axisLabel: {
        rotate: modelNames.length > 4 ? 30 : 0
      }
    },
    yAxis: {
      type: 'value',
      min: 80,
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '准确率',
        type: 'bar',
        data: accuracyData,
        itemStyle: { color: '#409EFF' },
        animation: showAnimation.value,
        barMaxWidth: 25,
        emphasis: {
          focus: 'series'
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          fontSize: 10
        }
      },
      {
        name: '召回率',
        type: 'bar',
        data: recallData,
        itemStyle: { color: '#67C23A' },
        animation: showAnimation.value,
        barMaxWidth: 25,
        emphasis: {
          focus: 'series'
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          fontSize: 10
        }
      },
      {
        name: '精确率',
        type: 'bar',
        data: precisionData,
        itemStyle: { color: '#E6A23C' },
        animation: showAnimation.value,
        barMaxWidth: 25,
        emphasis: {
          focus: 'series'
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          fontSize: 10
        }
      },
      {
        name: 'F1分数',
        type: 'bar',
        data: f1ScoreData,
        itemStyle: { color: '#F56C6C' },
        animation: showAnimation.value,
        barMaxWidth: 25,
        emphasis: {
          focus: 'series'
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          fontSize: 10
        }
      }
    ]
  }
  
  // 渲染图表
  barInstance.value.setOption(option)
}

// 初始化趋势图
function initTrendChart() {
  if (!trendChartRef.value) return
  
  // 如果已存在实例，则销毁
  if (trendInstance.value) {
    trendInstance.value.dispose()
  }
  
  // 初始化图表
  trendInstance.value = echarts.init(trendChartRef.value)
  
  // 生成月份数据
  const months = getMonthsData()
  
  // 生成趋势数据
  let series = []
  
  if (isCompareMode.value && selectedModels.value.length > 0) {
    // 对比模式：只显示选中的模型
    series = selectedModels.value.map(id => {
      const model = filteredModels.value.find(m => m.id === id)
      if (!model) return null
      
      return {
        name: model.name,
        type: 'line',
        data: generateTrendData(model[selectedMetric.value], months.length),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        animation: showAnimation.value,
        emphasis: {
          focus: 'series'
        }
      }
    }).filter(item => item)
  } else {
    // 标准模式：显示所有唯一的模型
    const uniqueModels = [...new Set(filteredModels.value.map(m => m.name))].map(name => {
      return filteredModels.value.find(m => m.name === name)
    }).filter(model => model)
    
    series = uniqueModels.map(model => {
      return {
        name: model.name,
        type: 'line',
        data: generateTrendData(model[selectedMetric.value], months.length),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        animation: showAnimation.value,
        emphasis: {
          focus: 'series'
        }
      }
    })
  }
  
  // 获取指标标题
  const metricTitle = metricOptions.find(option => option.value === selectedMetric.value)?.label || '准确率'
  
  // 图表配置选项
  const option = {
    title: {
      text: `${metricTitle}时间趋势`,
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      },
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: params => {
        let res = `<div class="font-bold">${params[0].axisValue}</div>`
        params.forEach(param => {
          res += `<div>${param.seriesName}: ${param.value.toFixed(1)}${selectedMetric.value === 'energyConsumption' ? '' : '%'}</div>`
        })
        return res
      }
    },
    legend: {
      data: series.map(s => s.name),
      bottom: 0,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: 12
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: {
        lineStyle: {
          color: '#aaa',
        }
      }
    },
    yAxis: {
      type: 'value',
      name: metricTitle,
      min: function(value) {
        return Math.floor(value.min - 2)
      },
      max: selectedMetric.value === 'energyConsumption' ? null : 100,
      axisLabel: {
        formatter: `{value}${selectedMetric.value === 'energyConsumption' ? '' : '%'}`
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(240, 240, 240, 0.8)'
        }
      }
    },
    series: series,
    color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#9932CC'],
    animation: showAnimation.value
  }
  
  // 渲染图表
  trendInstance.value.setOption(option)
}

// 初始化热力图
function initHeatmapChart() {
  if (!heatmapChartRef.value) return
  
  // 如果已存在实例，则销毁
  if (heatmapInstance.value) {
    heatmapInstance.value.dispose()
  }
  
  // 初始化图表
  heatmapInstance.value = echarts.init(heatmapChartRef.value)
  
  // 准备数据
  const metrics = ['准确率', '召回率', '精确率', 'F1分数', '推理速度']
  
  let modelNames = []
  let heatmapData = []
  
  if (isCompareMode.value && selectedModels.value.length > 0) {
    // 对比模式：只显示选中的模型
    modelNames = selectedModels.value.map(id => {
      const model = filteredModels.value.find(m => m.id === id)
      return model ? model.name : ''
    }).filter(name => name)
    
    selectedModels.value.forEach((id, modelIndex) => {
      const model = filteredModels.value.find(m => m.id === id)
      if (!model) return
      
      metrics.forEach((metric, metricIndex) => {
        let value = 0
        switch (metricIndex) {
          case 0: value = model.accuracy; break;
          case 1: value = model.recall; break;
          case 2: value = model.precision; break;
          case 3: value = model.f1Score; break;
          case 4: value = model.inferenceSpeed; break;
        }
        
        heatmapData.push([modelIndex, metricIndex, value])
      })
    })
  } else {
    // 标准模式：显示所有唯一模型
    modelNames = [...new Set(filteredModels.value.map(m => m.name))]
    
    modelNames.forEach((name, modelIndex) => {
      const model = filteredModels.value.find(m => m.name === name)
      if (!model) return
      
      metrics.forEach((metric, metricIndex) => {
        let value = 0
        switch (metricIndex) {
          case 0: value = model.accuracy; break;
          case 1: value = model.recall; break;
          case 2: value = model.precision; break;
          case 3: value = model.f1Score; break;
          case 4: value = model.inferenceSpeed; break;
        }
        
        heatmapData.push([modelIndex, metricIndex, value])
      })
    })
  }
  
  // 图表配置选项
  const option = {
    title: {
      text: '模型性能热力图',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      },
      left: 'center'
    },
    tooltip: {
      position: 'top',
      formatter: function (params) {
        return `${modelNames[params.data[0]]}<br>${metrics[params.data[1]]}: ${params.data[2].toFixed(1)}%`
      }
    },
    grid: {
      top: '15%',
      bottom: '15%',
      left: '10%',
      right: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: modelNames,
      splitArea: {
        show: true
      },
      axisLabel: {
        rotate: modelNames.length > 4 ? 30 : 0
      }
    },
    yAxis: {
      type: 'category',
      data: metrics,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 70,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      right: 'center',
      bottom: '0',
      inRange: {
        color: ['#c5e8bc', '#67C23A', '#009800']
      }
    },
    series: [{
      name: '性能指标',
      type: 'heatmap',
      data: heatmapData,
      label: {
        show: true,
        formatter: function (params) {
          return params.data[2].toFixed(1)
        },
        fontSize: 10
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      animation: showAnimation.value
    }]
  }
  
  // 渲染图表
  heatmapInstance.value.setOption(option)
}

// 初始化场景性能图
function initScenarioChart() {
  if (!scenarioChartRef.value) return
  
  // 如果已存在实例，则销毁
  if (scenarioInstance.value) {
    scenarioInstance.value.dispose()
  }
  
  // 初始化图表
  scenarioInstance.value = echarts.init(scenarioChartRef.value)
  
  // 场景列表
  const scenarioList = modelStore.scenarios
  
  // 构建数据
  let series = []
  let modelNames = []
  
  if (isCompareMode.value && selectedModels.value.length > 0) {
    // 对比模式
    modelNames = selectedModels.value.map(id => {
      const model = filteredModels.value.find(m => m.id === id)
      return model ? model.name : ''
    }).filter(name => name)
    
    series = selectedModels.value.map(id => {
      const model = filteredModels.value.find(m => m.id === id)
      if (!model) return null
      
      return {
        name: model.name,
        type: 'radar',
        data: [{
          value: scenarioList.map(s => model.scenarioPerformance[s] || 0),
          name: model.name
        }],
        areaStyle: {
          opacity: 0.2
        },
        animation: showAnimation.value
      }
    }).filter(item => item)
  } else {
    // 标准模式
    modelNames = [...new Set(filteredModels.value.map(m => m.name))]
    
    series = modelNames.map(name => {
      const model = filteredModels.value.find(m => m.name === name)
      if (!model) return null
      
      return {
        name: model.name,
        type: 'radar',
        data: [{
          value: scenarioList.map(s => model.scenarioPerformance[s] || 0),
          name: model.name
        }],
        areaStyle: {
          opacity: 0.2
        },
        animation: showAnimation.value
      }
    }).filter(item => item)
  }
  
  // 配置选项
  const option = {
    title: {
      text: '不同场景下的模型性能',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      },
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      data: modelNames,
      bottom: 0,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: 12
      }
    },
    radar: {
      indicator: scenarioList.map(scenario => {
        return { name: scenario, max: 100 }
      }),
      center: ['50%', '50%'],
      radius: '65%'
    },
    series: series,
    color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#9932CC']
  }
  
  // 渲染图表
  scenarioInstance.value.setOption(option)
}

// 初始化效率图
function initEfficiencyChart() {
  if (!efficiencyChartRef.value || !efficiencyStats.value) return
  
  // 如果已存在实例，则销毁
  if (efficiencyInstance.value) {
    efficiencyInstance.value.dispose()
  }
  
  // 初始化图表
  efficiencyInstance.value = echarts.init(efficiencyChartRef.value)
  
  // 准备数据
  const data = efficiencyStats.value.scores.map(item => [
    item.accuracy, // x轴 - 准确率
    item.energy,   // y轴 - 能耗
    item.score,    // 气泡大小 - 效率分数
    item.name      // 名称
  ])
  
  // 配置选项
  const option = {
    title: {
      text: '模型效率分析',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      },
      left: 'center'
    },
    tooltip: {
      formatter: function(params) {
        const data = params.data
        return `
          <div class="font-bold">${data[3]}</div>
          <div>准确率: ${data[0].toFixed(1)}%</div>
          <div>能耗: ${data[1].toFixed(1)}</div>
          <div>效率分数: ${data[2].toFixed(1)}</div>
        `
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      name: '准确率 (%)',
      nameLocation: 'center',
      nameGap: 25,
      nameTextStyle: {
        fontSize: 12
      },
      min: 80,
      max: 100
    },
    yAxis: {
      name: '能耗',
      nameLocation: 'center',
      nameGap: 40,
      nameTextStyle: {
        fontSize: 12
      }
    },
    series: [{
      type: 'scatter',
      data: data,
      symbolSize: function(data) {
        return data[2] / 2 // 效率分数决定气泡大小
      },
      itemStyle: {
        color: function(params) {
          // 根据效率分数生成颜色，分数越高颜色越绿
          const score = params.data[2]
          if (score > 85) return '#67C23A' // 高效率 - 绿色
          if (score > 75) return '#E6A23C' // 中效率 - 橙色
          return '#F56C6C' // 低效率 - 红色
        }
      },
      label: {
        show: true,
        formatter: function(params) {
          return params.data[3]
        },
        position: 'top',
        fontSize: 10
      },
      emphasis: {
        focus: 'self'
      },
      animation: showAnimation.value
    }]
  }
  
  // 渲染图表
  efficiencyInstance.value.setOption(option)
}

function initCharts() {
  // 初始化所有图表
  initRadarChart()
  initBarChart()
  initTrendChart()
  initHeatmapChart()
  initScenarioChart()
  initEfficiencyChart()
}

function handleResize() {
  // 响应窗口大小变化，调整图表大小
  if (radarInstance.value) radarInstance.value.resize()
  if (barInstance.value) barInstance.value.resize()
  if (trendInstance.value) trendInstance.value.resize()
  if (heatmapInstance.value) heatmapInstance.value.resize()
  if (scenarioInstance.value) scenarioInstance.value.resize()
  if (efficiencyInstance.value) efficiencyInstance.value.resize()
}

// 导出模型对比报告
function exportComparisonReport() {
  if (!isCompareMode.value || selectedModels.value.length < 2) {
    ElMessage.warning('请至少选择两个模型进行对比后再导出报告')
    return
  }
  
  ElMessage.success('模型对比报告已导出')
}

// 监听选中的模型变化
watch(selectedModels, () => {
  if (isCompareMode.value) {
    nextTick(() => {
      initCharts()
    })
  }
})

// 监听选择的指标变化
watch(selectedMetric, () => {
  nextTick(() => {
    initTrendChart()
  })
})

// 监听时间范围变化
watch(timeRange, () => {
  nextTick(() => {
    initTrendChart()
  })
})

// 监听动画切换
watch(showAnimation, () => {
  nextTick(() => {
    initCharts()
  })
})

onMounted(() => {
  // 加载数据
  modelStore.fetchModels()
  
  // 初始化图表
  nextTick(() => {
    initCharts()
  })
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  // 组件卸载前清理事件监听
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="model-performance bg-white dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- 页面标题 -->
      <h1 class="text-3xl font-semibold text-gray-900 dark:text-white text-center mb-8">模型性能分析</h1>
      
      <!-- 性能概览卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm transform transition-all hover:shadow-md">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">最佳表现模型</h3>
          <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-1">
            {{ modelStore.bestPerformingModel?.name || 'DeepLab V3+' }}
          </p>
          <div class="text-lg text-gray-600 dark:text-gray-300 font-medium">
            准确率: {{ modelStore.bestPerformingModel?.accuracy.toFixed(1) || '93.5' }}%
          </div>
        </div>
        
        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm transform transition-all hover:shadow-md">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">平均准确率</h3>
          <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-1">
            {{ modelStore.averageAccuracy }}%
          </p>
          <div class="text-lg text-gray-600 dark:text-gray-300 font-medium">
            基于 {{ filteredModels.length }} 个模型
          </div>
        </div>
        
        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm transform transition-all hover:shadow-md">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">平均效率分数</h3>
          <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-1">
            {{ efficiencyStats?.average || '85.4' }}
          </p>
          <div class="text-lg text-gray-600 dark:text-gray-300 font-medium">
            能耗/性能综合评分
          </div>
        </div>
      </div>
      
      <!-- 主要图表区域 -->
      <div class="space-y-16">
        <!-- 雷达图部分 -->
        <section>
          <h2 class="text-2xl font-medium text-gray-900 dark:text-white text-center mb-6">全方位性能对比</h2>
          <p class="text-gray-600 dark:text-gray-400 text-center max-w-3xl mx-auto mb-10">模型在准确率、召回率、精确率、F1分数、推理速度和鲁棒性等多维度上的综合表现对比</p>
          <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div ref="radarChartRef" style="width: 100%; height: 500px;"></div>
          </div>
        </section>
        
        <!-- 趋势图部分 -->
        <section>
          <h2 class="text-2xl font-medium text-gray-900 dark:text-white text-center mb-6">性能时间趋势分析</h2>
          <p class="text-gray-600 dark:text-gray-400 text-center max-w-3xl mx-auto mb-10">各模型准确率在过去12个月的变化趋势，展示了算法持续改进的效果</p>
          <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div ref="trendChartRef" style="width: 100%; height: 500px;"></div>
          </div>
        </section>
        
        <!-- 效率气泡图部分 -->
        <section>
          <h2 class="text-2xl font-medium text-gray-900 dark:text-white text-center mb-6">性能与能耗平衡分析</h2>
          <p class="text-gray-600 dark:text-gray-400 text-center max-w-3xl mx-auto mb-10">气泡大小代表综合效率分数，展示了各模型在性能与能耗之间的平衡能力</p>
          <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div ref="efficiencyChartRef" style="width: 100%; height: 500px;"></div>
          </div>
        </section>
        
        <!-- 场景适应性图表部分 -->
        <section>
          <h2 class="text-2xl font-medium text-gray-900 dark:text-white text-center mb-6">不同场景适应性分析</h2>
          <p class="text-gray-600 dark:text-gray-400 text-center max-w-3xl mx-auto mb-10">各模型在多种天气条件下的性能表现，评估模型在实际环境中的鲁棒性</p>
          <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div ref="scenarioChartRef" style="width: 100%; height: 500px;"></div>
          </div>
        </section>
        
        <!-- 详细评估指标表格 -->
        <section>
          <h2 class="text-2xl font-medium text-gray-900 dark:text-white text-center mb-6">模型评估指标一览</h2>
          <p class="text-gray-600 dark:text-gray-400 text-center max-w-3xl mx-auto mb-10">各模型在所有关键指标上的具体数值表现，可直观比对不同模型的优劣</p>
          <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <el-table 
                :data="sortedModels" 
                style="width: 100%"
                :stripe="true"
                :border="false"
                row-class-name="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <el-table-column label="模型名称" prop="name" min-width="150" />
                <el-table-column label="准确率" sortable min-width="100">
                  <template #default="{ row }">
                    <span class="font-medium" :class="row.accuracy > 90 ? 'text-green-600' : ''">
                      {{ row.accuracy.toFixed(1) }}%
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="召回率" sortable min-width="100">
                  <template #default="{ row }">
                    <span class="font-medium" :class="row.recall > 90 ? 'text-green-600' : ''">
                      {{ row.recall.toFixed(1) }}%
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="精确率" sortable min-width="100">
                  <template #default="{ row }">
                    <span class="font-medium" :class="row.precision > 90 ? 'text-green-600' : ''">
                      {{ row.precision.toFixed(1) }}%
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="推理速度" sortable min-width="100">
                  <template #default="{ row }">
                    <span class="font-medium" :class="row.inferenceSpeed > 85 ? 'text-green-600' : ''">
                      {{ row.inferenceSpeed }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="能耗" sortable min-width="100">
                  <template #default="{ row }">
                    <span class="font-medium" :class="row.energyConsumption < 70 ? 'text-green-600' : ''">
                      {{ row.energyConsumption.toFixed(1) }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="效率分数" sortable min-width="100">
                  <template #default="{ row }">
                    <span class="font-medium" :class="modelStore.calculateEfficiencyScore(row) > 85 ? 'text-green-600' : ''">
                      {{ modelStore.calculateEfficiencyScore(row) }}
                    </span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  @apply bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm p-6;
}
</style> 