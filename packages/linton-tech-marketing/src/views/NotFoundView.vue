<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 flex items-center justify-center">
    <div class="max-w-2xl mx-auto text-center px-4">
      <!-- 404 Icon -->
      <div class="mb-8">
        <div class="w-32 h-32 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
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
          class="btn-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
        >
          <HomeIcon class="w-5 h-5 mr-2" />
          Go Home
        </router-link>
        <router-link 
          to="/contact" 
          class="group border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
        >
          <ChatBubbleLeftRightIcon class="w-5 h-5 mr-2" />
          Contact Support
        </router-link>
      </div>
      
      <!-- Helpful Links -->
      <div class="mt-12 pt-8 border-t border-gray-200">
        <p class="text-gray-600 mb-4">Looking for something specific?</p>
        <div class="flex flex-wrap justify-center gap-4">
          <router-link 
            to="/services" 
            class="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Our Services
          </router-link>
          <router-link 
            to="/pricing" 
            class="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Pricing
          </router-link>
          <router-link 
            to="/about" 
            class="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            About Us
          </router-link>
          <router-link 
            to="/white-label" 
            class="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            White Label
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { HomeIcon, ChatBubbleLeftRightIcon } from '@heroicons/vue/24/outline'
</script> 