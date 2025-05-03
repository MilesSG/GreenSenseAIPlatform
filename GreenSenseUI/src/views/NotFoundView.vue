<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goToDashboard() {
  router.push('/')
}
</script>

<template>
  <div class="not-found flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full text-center">
      <svg class="h-24 w-24 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
      
      <h1 class="mt-6 text-4xl font-extrabold text-gray-900 dark:text-white">页面未找到</h1>
      <p class="mt-2 text-lg text-gray-500 dark:text-gray-400">
        抱歉，您请求的页面不存在或已被移动。
      </p>
      
      <div class="mt-8">
        <button @click="goToDashboard" class="btn btn-primary px-8 py-3">
          返回仪表盘
        </button>
      </div>
    </div>
  </div>
</template> 