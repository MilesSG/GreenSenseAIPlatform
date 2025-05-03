<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  unit: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'chart-line'
  },
  iconColor: {
    type: String,
    default: 'apple-blue'
  },
  trend: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="apple-stat-card flex flex-col h-full">
    <div class="flex justify-between items-start">
      <div>
        <h3 class="text-sm text-apple-gray-500 dark:text-apple-gray-400 font-medium">{{ title }}</h3>
        <div class="mt-2 flex items-baseline">
          <span class="text-3xl font-semibold text-gray-900 dark:text-white">{{ value }}</span>
          <span v-if="unit" class="ml-1 text-sm text-apple-gray-500 dark:text-apple-gray-400">{{ unit }}</span>
        </div>
      </div>
      
      <div :class="`rounded-full h-10 w-10 flex items-center justify-center bg-${iconColor}/10 text-${iconColor}`">
        <svg v-if="icon === 'chart-line'" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4m-10 5.6V16m0-6.6V4h16" />
        </svg>
        
        <svg v-else-if="icon === 'image'" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        
        <svg v-else-if="icon === 'server'" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
        
        <svg v-else-if="icon === 'leaf'" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8c0 3.3 2.7 6 6 6v0c3.3 0 6-2.7 6-6V4c0-1.1-0.9-2-2-2H5C3.9 2 3 2.9 3 4V8z M12 8c0 3.3 2.7 6 6 6v0c1.7 0 3-1.3 3-3V5c0-1.7-1.3-3-3-3h-3" />
        </svg>
      </div>
    </div>
    
    <div class="mt-6 flex items-center">
      <div v-if="trend !== 0" class="flex items-center">
        <svg v-if="trend > 0" class="w-4 h-4 text-apple-green" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
        </svg>
        <svg v-else class="w-4 h-4 text-apple-red" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1V9a1 1 0 112 0v2.586l4.293-4.293a1 1 0 011.414 0L16 9.586V7a1 1 0 112 0v5a1 1 0 01-1 1h-5z" clip-rule="evenodd" />
        </svg>
        
        <span :class="trend > 0 ? 'text-apple-green' : 'text-apple-red'" class="ml-1 text-sm font-medium">
          {{ Math.abs(trend).toFixed(1) }}%
        </span>
      </div>
      
      <span v-if="description" class="ml-auto text-xs text-apple-gray-500 dark:text-apple-gray-400">
        {{ description }}
      </span>
    </div>
  </div>
</template> 