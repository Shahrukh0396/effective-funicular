<template>
  <div class="min-h-screen bg-gray-100">
    <Navigation v-if="authStore.isAuthenticated" />
    <main class="py-10">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <router-view></router-view>
      </div>
    </main>
    <SupportButton v-if="authStore.isAuthenticated" />
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/authStore'
import Navigation from './components/Navigation.vue'
import SupportButton from './components/SupportButton.vue'

const authStore = useAuthStore()
</script> 