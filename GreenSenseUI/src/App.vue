<script setup>
import { onMounted } from 'vue'
import AppNavigation from './components/AppNavigation.vue'
import { useImageStore } from '@/stores/imageStore'
import { useModelStore } from '@/stores/modelStore'

const imageStore = useImageStore()
const modelStore = useModelStore()

onMounted(() => {
  // 初始化数据
  imageStore.fetchImages()
  modelStore.fetchModels()
})
</script>

<template>
  <div class="min-h-screen flex flex-col font-apple">
    <AppNavigation />
    
    <main class="flex-1 container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <RouterView v-slot="{ Component }">
        <Transition name="scale" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    
    <footer class="apple-nav py-6">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-apple-gray-500 dark:text-apple-gray-400">
          © {{ new Date().getFullYear() }} GreenSense AI 平台 - 遥感影像植被识别与提取研究工具
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
