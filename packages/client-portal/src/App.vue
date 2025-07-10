<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import LoadingSpinner from './components/common/LoadingSpinner.vue'

const authStore = useAuthStore()

onMounted(async () => {
  await authStore.initialize()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <template v-if="!authStore.loading">
      <router-view />
    </template>
    <template v-else>
      <div class="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    </template>
  </div>
</template>

<style>
@import '@/assets/tailwind.css';
</style>
