<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isMobileMenuOpen = ref(false)

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <header class="apple-nav sticky top-0 z-50">
    <nav class="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="顶部导航">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <RouterLink to="/" class="flex items-center">
              <div class="h-8 w-8 bg-apple-blue rounded-lg flex items-center justify-center text-white font-bold mr-2">
                <span class="text-lg">G</span>
              </div>
              <span class="text-lg font-semibold text-gray-900 dark:text-white">GreenSense AI</span>
            </RouterLink>
          </div>
          
          <!-- 桌面端导航链接 -->
          <div class="hidden sm:ml-8 sm:flex sm:space-x-8">
            <RouterLink 
              to="/" 
              class="inline-flex items-center px-1 pt-1 border-b-2" 
              :class="[
                route.name === 'dashboard' 
                  ? 'border-apple-blue text-apple-blue' 
                  : 'border-transparent text-apple-gray-500 dark:text-apple-gray-400 hover:text-apple-gray-700 dark:hover:text-apple-gray-300'
              ]"
            >
              仪表盘
            </RouterLink>
            
            <RouterLink 
              to="/model-performance" 
              class="inline-flex items-center px-1 pt-1 border-b-2" 
              :class="[
                route.name === 'model-performance' 
                  ? 'border-apple-blue text-apple-blue' 
                  : 'border-transparent text-apple-gray-500 dark:text-apple-gray-400 hover:text-apple-gray-700 dark:hover:text-apple-gray-300'
              ]"
            >
              模型性能
            </RouterLink>
            
            <RouterLink 
              to="/model-comparison" 
              class="inline-flex items-center px-1 pt-1 border-b-2" 
              :class="[
                route.name === 'model-comparison' 
                  ? 'border-apple-blue text-apple-blue' 
                  : 'border-transparent text-apple-gray-500 dark:text-apple-gray-400 hover:text-apple-gray-700 dark:hover:text-apple-gray-300'
              ]"
            >
              模型对比
            </RouterLink>
          </div>
        </div>
        
        <!-- 移动端菜单按钮 -->
        <div class="flex items-center sm:hidden">
          <button 
            type="button" 
            class="inline-flex items-center justify-center p-2 rounded-full text-apple-gray-400 hover:text-apple-gray-500 hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 dark:hover:text-apple-gray-300"
            @click="toggleMobileMenu"
            aria-expanded="false"
          >
            <span class="sr-only">打开主菜单</span>
            <!-- 菜单图标 -->
            <svg v-if="!isMobileMenuOpen" class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <!-- 关闭图标 -->
            <svg v-else class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
    
    <!-- 移动端菜单 -->
    <div 
      class="sm:hidden" 
      :class="{ 'block': isMobileMenuOpen, 'hidden': !isMobileMenuOpen }"
    >
      <div class="pt-2 pb-3 space-y-1 border-t border-apple-gray-200 dark:border-apple-gray-800">
        <RouterLink 
          to="/" 
          class="block pl-3 pr-4 py-2 text-base font-medium rounded-md"
          :class="[
            route.name === 'dashboard' 
              ? 'bg-apple-blue/10 text-apple-blue' 
              : 'text-apple-gray-600 dark:text-apple-gray-400 hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 hover:text-apple-gray-800 dark:hover:text-apple-gray-200'
          ]"
          @click="closeMobileMenu"
        >
          仪表盘
        </RouterLink>
        
        <RouterLink 
          to="/model-performance" 
          class="block pl-3 pr-4 py-2 text-base font-medium rounded-md"
          :class="[
            route.name === 'model-performance' 
              ? 'bg-apple-blue/10 text-apple-blue' 
              : 'text-apple-gray-600 dark:text-apple-gray-400 hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 hover:text-apple-gray-800 dark:hover:text-apple-gray-200'
          ]"
          @click="closeMobileMenu"
        >
          模型性能
        </RouterLink>
        
        <RouterLink 
          to="/model-comparison" 
          class="block pl-3 pr-4 py-2 text-base font-medium rounded-md"
          :class="[
            route.name === 'model-comparison' 
              ? 'bg-apple-blue/10 text-apple-blue' 
              : 'text-apple-gray-600 dark:text-apple-gray-400 hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 hover:text-apple-gray-800 dark:hover:text-apple-gray-200'
          ]"
          @click="closeMobileMenu"
        >
          模型对比
        </RouterLink>
      </div>
    </div>
  </header>
</template> 