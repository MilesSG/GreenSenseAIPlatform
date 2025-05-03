<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  originalImageUrl: {
    type: String,
    required: true
  },
  processedImageUrl: {
    type: String,
    required: true
  },
  width: {
    type: [String, Number],
    default: '100%'
  },
  height: {
    type: [String, Number],
    default: '500px'
  }
})

const imageContainer = ref(null)
const sliderPosition = ref(50)
const isDragging = ref(false)
const containerRect = ref(null)
const originalImageLoaded = ref(false)
const processedImageLoaded = ref(false)
const originalImageError = ref(false)
const processedImageError = ref(false)

function startDrag(e) {
  isDragging.value = true
  updateSliderPosition(e)
}

function stopDrag() {
  isDragging.value = false
}

function updateSliderPosition(e) {
  if (!isDragging.value || !containerRect.value) return
  
  const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
  const { left, width } = containerRect.value
  
  // 计算相对位置（0-100）
  let position = ((clientX - left) / width) * 100
  
  // 限制在0-100范围内
  position = Math.max(0, Math.min(100, position))
  
  sliderPosition.value = position
}

function handleResize() {
  if (imageContainer.value) {
    containerRect.value = imageContainer.value.getBoundingClientRect()
  }
}

function handleOriginalImageLoad() {
  originalImageLoaded.value = true
  originalImageError.value = false
}

function handleProcessedImageLoad() {
  processedImageLoaded.value = true
  processedImageError.value = false
}

function handleOriginalImageError() {
  originalImageError.value = true
  originalImageLoaded.value = false
}

function handleProcessedImageError() {
  processedImageError.value = true
  processedImageLoaded.value = false
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  window.addEventListener('mousemove', updateSliderPosition)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchmove', updateSliderPosition)
  window.addEventListener('touchend', stopDrag)
})

watch(() => [props.originalImageUrl, props.processedImageUrl], () => {
  // 当图像更新时，重置滑块位置和状态
  sliderPosition.value = 50
  originalImageLoaded.value = false
  processedImageLoaded.value = false
  originalImageError.value = false
  processedImageError.value = false
})
</script>

<template>
  <div 
    ref="imageContainer"
    class="image-comparison relative overflow-hidden select-none rounded-xl shadow-lg"
    :style="{ width, height }"
    @mousedown="startDrag"
    @touchstart="startDrag"
  >
    <!-- 图片加载失败时的提示 -->
    <div v-if="originalImageError || processedImageError" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">示例图像无法加载</p>
      <p class="text-xs text-gray-400 dark:text-gray-500">仅作演示用途</p>
    </div>
    
    <!-- 正常显示的图像对比区域 -->
    <template v-else>
      <!-- 原始图像（底层） -->
      <div class="absolute inset-0 w-full h-full overflow-hidden">
        <img 
          :src="originalImageUrl" 
          alt="原始遥感图像" 
          class="absolute w-full h-full object-cover"
          @load="handleOriginalImageLoad"
          @error="handleOriginalImageError"
        />
      </div>
      
      <!-- 处理后图像（顶层，根据滑块位置裁剪） -->
      <div 
        class="absolute inset-0 w-full h-full overflow-hidden"
        :style="{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }"
      >
        <img 
          :src="processedImageUrl" 
          alt="处理后的图像" 
          class="absolute w-full h-full object-cover"
          @load="handleProcessedImageLoad"
          @error="handleProcessedImageError"
        />
      </div>
      
      <!-- 滑块 -->
      <div 
        class="slider absolute top-0 bottom-0 w-1 bg-white shadow-md cursor-ew-resize z-10"
        :style="{ left: `${sliderPosition}%` }"
      >
        <!-- 滑块手柄 -->
        <div class="handle absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8M8 12h8M8 17h8" />
          </svg>
        </div>
      </div>
      
      <!-- 图像标签 -->
      <div class="absolute bottom-2 left-2 bg-gray-900/70 text-white text-xs py-1 px-2 rounded">
        原始图像
      </div>
      <div class="absolute bottom-2 right-2 bg-primary/70 text-white text-xs py-1 px-2 rounded">
        处理后图像
      </div>
    </template>
  </div>
</template>

<style scoped>
.image-comparison {
  touch-action: none;
}

.slider {
  pointer-events: none;
}

.handle {
  pointer-events: all;
}
</style> 