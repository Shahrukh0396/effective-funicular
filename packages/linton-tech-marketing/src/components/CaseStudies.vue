<template>
  <form @submit.prevent="signup" class="flex flex-col md:flex-row items-center gap-2 max-w-lg mx-auto">
    <input v-model="email" type="email" required placeholder="Your email" class="border px-3 py-2 rounded w-full md:w-auto" />
    <button :disabled="loading" class="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition">
      {{ loading ? 'Signing up...' : 'Sign Up' }}
    </button>
    <span v-if="success" class="text-green-600 ml-4">Subscribed!</span>
    <span v-if="error" class="text-red-600 ml-4">{{ error }}</span>
  </form>
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
    await axios.post('/api/marketing/newsletter', { email: email.value })
    success.value = true
    email.value = ''
  } catch (e) {
    error.value = e.response?.data?.message || 'Signup failed.'
  } finally {
    loading.value = false
  }
}
</script> 