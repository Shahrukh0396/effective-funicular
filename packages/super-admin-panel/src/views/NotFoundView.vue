<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="max-w-2xl mx-auto text-center px-4">
      <!-- 404 Icon -->
      <div class="mb-8">
        <div class="w-32 h-32 mx-auto bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-2xl">
          <span class="text-6xl font-bold text-white">404</span>
        </div>
      </div>
      
      <!-- Error Message -->
      <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
        Page Not Found
      </h1>
      <p class="text-xl text-gray-600 mb-8 leading-relaxed">
        Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
      </p>
      
      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <router-link 
          to="/" 
          class="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
        >
          <HomeIcon class="w-5 h-5 mr-2" />
          Go to Dashboard
        </router-link>
        <button 
          @click="goBack"
          class="group border-2 border-gray-600 text-gray-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-600 hover:text-white transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
        >
          <ArrowLeftIcon class="w-5 h-5 mr-2" />
          Go Back
        </button>
      </div>
      
      <!-- Helpful Links -->
      <div class="mt-12 pt-8 border-t border-gray-200">
        <p class="text-gray-600 mb-4">Looking for something specific?</p>
        <div class="flex flex-wrap justify-center gap-4">
          <router-link 
            to="/vendors" 
            class="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Vendors
          </router-link>
          <router-link 
            to="/analytics" 
            class="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Analytics
          </router-link>
          <router-link 
            to="/users" 
            class="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Users
          </router-link>
          <router-link 
            to="/revenue" 
            class="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Revenue
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { HomeIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script> 