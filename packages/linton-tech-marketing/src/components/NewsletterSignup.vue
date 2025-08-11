<template>
  <section class="newsletter-section py-16 bg-gray-50">
    <div class="container mx-auto px-4 text-center">
      <h3 class="text-2xl font-bold text-gray-900 mb-4">
        Stay Updated with Linton Tech
      </h3>
      <p class="text-gray-600 mb-8 max-w-md mx-auto">
        Get the latest updates, tips, and insights delivered to your inbox
      </p>
      
      <form @submit.prevent="signup" class="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
        <input 
          v-model="email" 
          type="email" 
          required 
          placeholder="Enter your email" 
          class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button 
          :disabled="loading" 
          class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {{ loading ? 'Signing up...' : 'Subscribe' }}
        </button>
      </form>
      
      <div v-if="success" class="mt-4 text-green-600">
        Successfully subscribed!
      </div>
      <div v-if="error" class="mt-4 text-red-600">
        {{ error }}
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import axios from '@/config/axios'

const email = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')

const signup = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await axios.post('/api/marketing/newsletter', { 
      email: email.value,
      source: 'marketing-website'
    })
    
    success.value = true
    email.value = ''
    
  } catch (err) {
    error.value = err.response?.data?.message || 'Signup failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Make form text much darker */
input {
  color: #111827 !important;
}

input::placeholder {
  color: #4b5563 !important;
}

/* Override any Tailwind classes */
.text-gray-600 {
  color: #111827 !important;
}
</style> 