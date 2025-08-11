<template>
  <nav class="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center group">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
              <span class="text-white font-bold text-sm">LT</span>
            </div>
            <span class="ml-2 text-xl font-bold gradient-text">Linton-Tech</span>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-8">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-all duration-300 relative group cursor-pointer"
          >
            {{ item.name }}
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
          </router-link>
        </div>

        <!-- CTA Buttons -->
        <div class="hidden md:flex items-center space-x-4">
          <router-link
            to="/contact"
            class="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            Get Started
          </router-link>
          <router-link
            to="/pricing"
            class="btn-primary text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          >
            View Pricing
          </router-link>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900 transition-all duration-300 p-2 rounded-lg hover:bg-gray-100"
          >
            <svg v-if="!mobileMenuOpen" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
            <svg v-else class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div
          v-show="mobileMenuOpen"
          class="md:hidden"
        >
          <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-md border-t border-gray-200 rounded-b-lg shadow-lg">
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              @click="mobileMenuOpen = false"
              class="text-gray-600 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-all duration-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              {{ item.name }}
            </router-link>
            
            <div class="pt-4 space-y-2 border-t border-gray-200">
              <router-link
                to="/contact"
                @click="mobileMenuOpen = false"
                class="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white block text-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </router-link>
              <router-link
                to="/pricing"
                @click="mobileMenuOpen = false"
                class="btn-primary text-white block text-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105"
              >
                View Pricing
              </router-link>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const mobileMenuOpen = ref(false)

import { useRouter } from 'vue-router'

const router = useRouter()

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'White Label', href: '/white-label' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

const navigateTo = (href) => {
  router.push(href)
}
</script> 