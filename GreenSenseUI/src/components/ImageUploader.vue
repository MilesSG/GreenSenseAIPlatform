<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['image-uploaded'])

const dragActive = ref(false)
const selectedFile = ref(null)
const previewUrl = ref('')
const isProcessing = ref(false)

// 定义最大尺寸
const MAX_WIDTH = 800
const MAX_HEIGHT = 600

// 拖拽相关处理函数
function handleDragEnter(e) {
  e.preventDefault()
  e.stopPropagation()
  dragActive.value = true
}

function handleDragLeave(e) {
  e.preventDefault()
  e.stopPropagation()
  dragActive.value = false
}

function handleDragOver(e) {
  e.preventDefault()
  e.stopPropagation()
}

function handleDrop(e) {
  e.preventDefault()
  e.stopPropagation()
  dragActive.value = false
  
  const files = e.dataTransfer.files
  if (files.length > 0) {
    handleFile(files[0])
  }
}

// 处理文件选择
function handleFileInput(e) {
  const files = e.target.files
  if (files.length > 0) {
    handleFile(files[0])
  }
}

// 处理图像文件
async function handleFile(file) {
  // 检查文件类型
  if (!file.type.match('image.*')) {
    ElMessage.error('请上传图像文件（JPEG, PNG, GIF等）')
    return
  }
  
  // 文件大小限制 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图像文件大小不能超过5MB')
    return
  }
  
  selectedFile.value = file
  isProcessing.value = true
  
  try {
    // 加载图像并调整大小
    const resizedImageUrl = await resizeImage(file)
    
    // 创建预览URL
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }
    previewUrl.value = resizedImageUrl
    
    // 触发上传完成事件
    emit('image-uploaded', { file, previewUrl: resizedImageUrl })
  } finally {
    isProcessing.value = false
  }
}

// 调整图像尺寸
async function resizeImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // 计算调整后的尺寸，保持比例
        let width = img.width
        let height = img.height
        
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        
        // 创建画布并绘制调整大小后的图像
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        // 转换为DataURL
        const resizedDataUrl = canvas.toDataURL(file.type)
        resolve(resizedDataUrl)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

// 重置上传器
function resetUploader() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  selectedFile.value = null
  previewUrl.value = ''
}
</script>

<template>
  <div class="image-uploader">
    <!-- 处理中状态指示器 -->
    <div v-if="isProcessing" class="processing-overlay">
      <div class="processing-spinner"></div>
      <p>正在处理图像...</p>
    </div>
    
    <!-- 拖放区域 -->
    <div 
      class="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-colors"
      :class="[
        dragActive 
          ? 'border-apple-blue bg-apple-blue/5' 
          : 'border-apple-gray-200 dark:border-apple-gray-700 hover:border-apple-blue'
      ]"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @dragover="handleDragOver"
      @drop="handleDrop"
      :style="{ minHeight: previewUrl ? '100px' : '150px' }"
    >
      <div v-if="!previewUrl" class="text-center w-full">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mx-auto text-apple-gray-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          将图像拖放到此处
        </h3>
        <p class="mt-1 text-xs text-apple-gray-500 dark:text-apple-gray-400">
          支持PNG, JPG, JPEG, GIF图像文件，不超过5MB
        </p>
        
        <div class="mt-4">
          <label class="btn btn-primary cursor-pointer">
            <span>选择图片</span>
            <input type="file" class="hidden" accept="image/*" @change="handleFileInput">
          </label>
        </div>
      </div>
      
      <!-- 图像预览 -->
      <div v-else class="w-full">
        <div class="relative rounded-lg overflow-hidden max-w-md mx-auto">
          <img 
            :src="previewUrl" 
            alt="图像预览" 
            class="w-full h-auto object-contain"
            style="max-height: 250px;"
          >
          
          <button 
            @click="resetUploader"
            class="absolute top-2 right-2 bg-gray-900/70 rounded-full p-1 text-white hover:bg-gray-900"
            title="移除图像"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="mt-2 text-center">
          <p class="text-sm text-apple-gray-500 dark:text-apple-gray-400">
            已调整大小: {{ selectedFile?.name }} 
          </p>
          <p class="text-xs text-apple-gray-400 mb-3">
            图像已自动调整至适合尺寸 (最大 {{ MAX_WIDTH }}x{{ MAX_HEIGHT }}px)
          </p>
          
          <!-- 上传新图片按钮 -->
          <div class="flex justify-center space-x-3">
            <label class="btn btn-primary cursor-pointer">
              <span>上传新图片</span>
              <input type="file" class="hidden" accept="image/*" @change="handleFileInput">
            </label>
            
            <button 
              @click="resetUploader" 
              class="btn btn-secondary"
              title="移除当前图片"
            >
              清除图片
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.processing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 0.5rem;
}

.processing-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 113, 227, 0.2);
  border-radius: 50%;
  border-top-color: var(--apple-blue);
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.image-uploader {
  position: relative;
}
</style> 