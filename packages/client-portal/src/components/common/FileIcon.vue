<template>
  <div class="file-icon">
    <!-- Image files -->
    <svg v-if="isImage" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
    </svg>
    
    <!-- Video files -->
    <svg v-else-if="isVideo" class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
    </svg>
    
    <!-- Audio files -->
    <svg v-else-if="isAudio" class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
    </svg>
    
    <!-- PDF files -->
    <svg v-else-if="isPdf" class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
    </svg>
    
    <!-- Document files -->
    <svg v-else-if="isDocument" class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
    </svg>
    
    <!-- Spreadsheet files -->
    <svg v-else-if="isSpreadsheet" class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
    </svg>
    
    <!-- Archive files -->
    <svg v-else-if="isArchive" class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
    </svg>
    
    <!-- Code files -->
    <svg v-else-if="isCode" class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
    </svg>
    
    <!-- Default file icon -->
    <svg v-else class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  type: {
    type: String,
    required: true
  }
})

// Computed properties for file type detection
const isImage = computed(() => {
  return props.type.startsWith('image/')
})

const isVideo = computed(() => {
  return props.type.startsWith('video/')
})

const isAudio = computed(() => {
  return props.type.startsWith('audio/')
})

const isPdf = computed(() => {
  return props.type === 'application/pdf'
})

const isDocument = computed(() => {
  return [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/html'
  ].includes(props.type)
})

const isSpreadsheet = computed(() => {
  return [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ].includes(props.type)
})

const isArchive = computed(() => {
  return [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/gzip',
    'application/x-tar'
  ].includes(props.type)
})

const isCode = computed(() => {
  return [
    'text/javascript',
    'application/javascript',
    'text/xml',
    'application/json',
    'text/css',
    'text/html',
    'application/x-python',
    'text/x-python',
    'application/x-httpd-php',
    'text/x-java-source',
    'text/x-c++src',
    'text/x-csrc',
    'text/x-csharp',
    'text/x-ruby',
    'text/x-swift',
    'text/x-kotlin',
    'text/x-go',
    'text/x-rust',
    'text/x-scala',
    'text/x-clojure',
    'text/x-haskell',
    'text/x-erlang',
    'text/x-elixir',
    'text/x-fsharp',
    'text/x-dart',
    'text/x-typescript',
    'text/x-coffeescript',
    'text/x-livescript',
    'text/x-clojurescript',
    'text/x-jsx',
    'text/x-tsx',
    'text/x-vue',
    'text/x-svelte',
    'text/x-angular'
  ].includes(props.type)
})
</script>

<style scoped>
.file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 