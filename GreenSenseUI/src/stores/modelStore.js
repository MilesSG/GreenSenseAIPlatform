import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useModelStore = defineStore('models', () => {
  // 状态
  const models = ref([
    { 
      id: 1, 
      name: 'U-Net', 
      accuracy: 91.2, 
      recall: 89.5, 
      precision: 88.7, 
      f1Score: 89.1,
      inferenceSpeed: 85,
      region: '华北', 
      season: '夏季',
      lastUpdated: '2023-11-10',
      parameters: '30.5M',
      modelSize: '124MB',
      trainingTime: 28,
      energyConsumption: 65.4,
      robustness: 82.7,
      scenarioPerformance: {
        'cloudy': 88.9,
        'sunny': 92.3,
        'rainy': 85.7,
        'foggy': 81.4
      }
    },
    { 
      id: 2, 
      name: 'U-Net++', 
      accuracy: 92.8, 
      recall: 90.1, 
      precision: 91.5,
      f1Score: 90.8,
      inferenceSpeed: 78,
      region: '华北', 
      season: '夏季',
      lastUpdated: '2023-12-05',
      parameters: '37.2M',
      modelSize: '150MB',
      trainingTime: 35,
      energyConsumption: 78.2,
      robustness: 86.5,
      scenarioPerformance: {
        'cloudy': 91.2,
        'sunny': 94.5,
        'rainy': 88.3,
        'foggy': 83.9
      }
    },
    { 
      id: 3, 
      name: 'FCN', 
      accuracy: 85.3, 
      recall: 82.7, 
      precision: 84.5,
      f1Score: 83.6,
      inferenceSpeed: 92,
      region: '华北', 
      season: '夏季',
      lastUpdated: '2023-10-15',
      parameters: '24.8M',
      modelSize: '98MB',
      trainingTime: 22,
      energyConsumption: 52.3,
      robustness: 77.9,
      scenarioPerformance: {
        'cloudy': 84.5,
        'sunny': 87.2,
        'rainy': 80.1,
        'foggy': 76.8
      }
    },
    { 
      id: 4, 
      name: 'DeepLab V3+', 
      accuracy: 93.5, 
      recall: 91.2, 
      precision: 92.8,
      f1Score: 92.0,
      inferenceSpeed: 75,
      region: '华北', 
      season: '夏季',
      lastUpdated: '2024-01-20',
      parameters: '42.5M',
      modelSize: '165MB',
      trainingTime: 40,
      energyConsumption: 85.7,
      robustness: 89.3,
      scenarioPerformance: {
        'cloudy': 92.8,
        'sunny': 95.6,
        'rainy': 90.4,
        'foggy': 86.2
      }
    },
    { 
      id: 5, 
      name: 'U-Net', 
      accuracy: 89.5, 
      recall: 87.8, 
      precision: 86.9,
      f1Score: 87.3,
      inferenceSpeed: 85,
      region: '华南', 
      season: '春季',
      lastUpdated: '2023-11-10',
      parameters: '30.5M',
      modelSize: '124MB',
      trainingTime: 28,
      energyConsumption: 66.2,
      robustness: 81.3,
      scenarioPerformance: {
        'cloudy': 87.6,
        'sunny': 91.0,
        'rainy': 86.2,
        'foggy': 80.1
      }
    },
    { 
      id: 6, 
      name: 'U-Net++', 
      accuracy: 90.3, 
      recall: 88.9, 
      precision: 89.7,
      f1Score: 89.3,
      inferenceSpeed: 78,
      region: '华南', 
      season: '春季',
      lastUpdated: '2023-12-05',
      parameters: '37.2M',
      modelSize: '150MB',
      trainingTime: 35,
      energyConsumption: 78.2,
      robustness: 86.5,
      scenarioPerformance: {
        'cloudy': 91.2,
        'sunny': 94.5,
        'rainy': 88.3,
        'foggy': 83.9
      }
    },
    { 
      id: 7, 
      name: 'FCN', 
      accuracy: 83.7, 
      recall: 80.5, 
      precision: 82.1,
      f1Score: 81.3,
      inferenceSpeed: 92,
      region: '华南', 
      season: '春季',
      lastUpdated: '2023-10-15',
      parameters: '24.8M',
      modelSize: '98MB',
      trainingTime: 22,
      energyConsumption: 52.3,
      robustness: 77.9,
      scenarioPerformance: {
        'cloudy': 84.5,
        'sunny': 87.2,
        'rainy': 80.1,
        'foggy': 76.8
      }
    },
    { 
      id: 8, 
      name: 'DeepLab V3+', 
      accuracy: 92.1, 
      recall: 90.0, 
      precision: 91.5,
      f1Score: 90.7,
      inferenceSpeed: 75,
      region: '华南', 
      season: '春季',
      lastUpdated: '2024-01-20',
      parameters: '42.5M',
      modelSize: '165MB',
      trainingTime: 40,
      energyConsumption: 85.7,
      robustness: 89.3,
      scenarioPerformance: {
        'cloudy': 92.8,
        'sunny': 95.6,
        'rainy': 90.4,
        'foggy': 86.2
      }
    }
  ])
  
  const regions = ref(['华北', '华南', '华东', '华中', '西北', '西南', '东北'])
  const seasons = ref(['春季', '夏季', '秋季', '冬季'])
  const scenarios = ref(['cloudy', 'sunny', 'rainy', 'foggy'])
  
  const selectedRegion = ref('全部')
  const selectedSeason = ref('全部')
  const selectedScenario = ref('全部')
  const isLoading = ref(false)
  const error = ref(null)
  
  // Getters
  const filteredModels = computed(() => {
    return models.value.filter(model => 
      (selectedRegion.value === '全部' || model.region === selectedRegion.value) && 
      (selectedSeason.value === '全部' || model.season === selectedSeason.value)
    )
  })
  
  const bestPerformingModel = computed(() => {
    if (filteredModels.value.length === 0) return null
    return filteredModels.value.reduce((best, current) => 
      current.accuracy > best.accuracy ? current : best
    )
  })
  
  const averageAccuracy = computed(() => {
    if (filteredModels.value.length === 0) return 0
    const sum = filteredModels.value.reduce((acc, curr) => acc + curr.accuracy, 0)
    return (sum / filteredModels.value.length).toFixed(1)
  })
  
  const modelComparison = computed(() => {
    if (filteredModels.value.length < 2) return null
    
    const comparisons = []
    for (let i = 0; i < filteredModels.value.length; i++) {
      for (let j = i + 1; j < filteredModels.value.length; j++) {
        const model1 = filteredModels.value[i]
        const model2 = filteredModels.value[j]
        
        comparisons.push({
          model1: model1.name,
          model2: model2.name,
          accuracyDiff: (model1.accuracy - model2.accuracy).toFixed(1),
          recallDiff: (model1.recall - model2.recall).toFixed(1),
          precisionDiff: (model1.precision - model2.precision).toFixed(1),
          f1ScoreDiff: (model1.f1Score - model2.f1Score).toFixed(1),
          speedDiff: (model1.inferenceSpeed - model2.inferenceSpeed).toFixed(1),
          energyDiff: (model1.energyConsumption - model2.energyConsumption).toFixed(1)
        })
      }
    }
    
    return comparisons
  })
  
  const modelHistoricalData = computed(() => {
    // 模拟历史趋势数据
    const result = {}
    
    filteredModels.value.forEach(model => {
      const data = []
      const baseValue = model.accuracy
      
      for (let i = 0; i < 12; i++) {
        const randomVariation = (Math.random() - 0.5) * 3
        data.push({
          month: i + 1,
          value: Math.min(100, Math.max(70, baseValue + randomVariation))
        })
      }
      
      result[model.id] = data
    })
    
    return result
  })
  
  // Actions
  function setRegion(region) {
    selectedRegion.value = region
  }
  
  function setSeason(season) {
    selectedSeason.value = season
  }
  
  function setScenario(scenario) {
    selectedScenario.value = scenario
  }
  
  async function fetchModels() {
    isLoading.value = true
    error.value = null
    
    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 500))
      // 在实际应用中，这里会从API获取模型数据
      // models.value = await response.json()
    } catch (err) {
      error.value = '获取模型数据失败'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }
  
  function getModelScenarioPerformance(modelId, scenario) {
    const model = models.value.find(m => m.id === modelId)
    if (!model || !model.scenarioPerformance || !model.scenarioPerformance[scenario]) {
      return 0
    }
    return model.scenarioPerformance[scenario]
  }
  
  function calculateEfficiencyScore(model) {
    // 计算效率分数 (性能与资源消耗的平衡)
    const performanceScore = (model.accuracy + model.f1Score) / 2
    const resourceScore = 100 - (model.energyConsumption / 100) * 100
    return ((performanceScore * 0.7) + (resourceScore * 0.3)).toFixed(1)
  }
  
  // 返回store公共API
  return {
    models,
    regions,
    seasons,
    scenarios,
    selectedRegion,
    selectedSeason,
    selectedScenario,
    isLoading,
    error,
    filteredModels,
    bestPerformingModel,
    averageAccuracy,
    modelComparison,
    modelHistoricalData,
    setRegion,
    setSeason,
    setScenario,
    fetchModels,
    getModelScenarioPerformance,
    calculateEfficiencyScore
  }
}) 