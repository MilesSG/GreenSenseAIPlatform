import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useImageStore = defineStore('images', () => {
  // Base64编码的绿色占位图
  const greenPlaceholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  
  // 状态
  const images = ref([
    {
      id: 1,
      name: '南京紫金山区域',
      description: '2023年5月拍摄的南京紫金山区域卫星图像',
      originalUrl: greenPlaceholder,
      processedUrl: greenPlaceholder,
      date: '2023-05-15',
      location: '南京',
      size: '2048x2048',
      vegetation: {
        beforePercentage: 45.2,
        afterPercentage: 45.8,
        change: 0.6
      }
    },
    {
      id: 2,
      name: '广州白云山区域',
      description: '2023年7月拍摄的广州白云山区域卫星图像',
      originalUrl: greenPlaceholder,
      processedUrl: greenPlaceholder,
      date: '2023-07-22',
      location: '广州',
      size: '1920x1920',
      vegetation: {
        beforePercentage: 62.5,
        afterPercentage: 64.1,
        change: 1.6
      }
    },
    {
      id: 3,
      name: '成都青城山区域',
      description: '2023年9月拍摄的成都青城山区域卫星图像',
      originalUrl: greenPlaceholder,
      processedUrl: greenPlaceholder,
      date: '2023-09-18',
      location: '成都',
      size: '2560x2560',
      vegetation: {
        beforePercentage: 78.3,
        afterPercentage: 79.5,
        change: 1.2
      }
    }
  ])
  
  const selectedImageId = ref(1)
  const isLoading = ref(false)
  const error = ref(null)
  
  // Getters
  const selectedImage = computed(() => {
    return images.value.find(img => img.id === selectedImageId.value) || null
  })
  
  const allImages = computed(() => images.value)
  
  // Actions
  function selectImage(id) {
    selectedImageId.value = id
  }
  
  async function fetchImages() {
    // 这里会是真实的API调用
    isLoading.value = true
    error.value = null
    
    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 500))
      // 在实际应用中, 这里会从API获取图像数据
      // images.value = await response.json()
    } catch (err) {
      error.value = '获取图像数据失败'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }
  
  async function processImage(imageId, parameters) {
    isLoading.value = true
    error.value = null
    
    try {
      // 模拟API请求处理图像
      await new Promise(resolve => setTimeout(resolve, 1500))
      // 在实际应用中, 这里会发送图像处理请求到后端API
      console.log('处理图像：', imageId, parameters)
      
      // 模拟更新处理后的图像URL和植被数据
      const imageIndex = images.value.findIndex(img => img.id === imageId)
      if (imageIndex !== -1) {
        // 这里只是模拟 - 真实应用会用API返回的数据
        const oldVegPercentage = images.value[imageIndex].vegetation.beforePercentage
        const randomIncrease = Math.random() * 3
        const newVegPercentage = oldVegPercentage + randomIncrease
        
        images.value[imageIndex] = {
          ...images.value[imageIndex],
          vegetation: {
            beforePercentage: oldVegPercentage,
            afterPercentage: newVegPercentage,
            change: randomIncrease
          }
        }
      }
    } catch (err) {
      error.value = '处理图像失败'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }
  
  // 返回store公共API
  return {
    images,
    selectedImageId,
    isLoading,
    error,
    selectedImage,
    allImages,
    selectImage,
    fetchImages,
    processImage
  }
}) 