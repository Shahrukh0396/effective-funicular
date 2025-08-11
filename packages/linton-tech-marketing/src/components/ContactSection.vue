<template>
  <form @submit.prevent="submit" class="bg-white p-8 rounded-lg shadow max-w-lg mx-auto">
    <h2 class="text-2xl font-bold mb-4">Request a Demo / Contact Us</h2>
    <div class="mb-4">
      <label class="block mb-1 font-medium">Name</label>
      <input v-model="form.name" type="text" required class="w-full border px-3 py-2 rounded" />
    </div>
    <div class="mb-4">
      <label class="block mb-1 font-medium">Email</label>
      <input v-model="form.email" type="email" required class="w-full border px-3 py-2 rounded" />
    </div>
    <div class="mb-4">
      <label class="block mb-1 font-medium">Company</label>
      <input v-model="form.company" type="text" class="w-full border px-3 py-2 rounded" />
    </div>
    <div class="mb-4">
      <label class="block mb-1 font-medium">Message</label>
      <textarea v-model="form.message" rows="4" class="w-full border px-3 py-2 rounded"></textarea>
    </div>
    <button :disabled="loading" class="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition">
      {{ loading ? 'Sending...' : 'Submit' }}
    </button>
    <p v-if="success" class="text-green-600 mt-4">Thank you! We'll be in touch soon.</p>
    <p v-if="error" class="text-red-600 mt-4">{{ error }}</p>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import axios from '@/config/axios'

const form = ref({ name: '', email: '', company: '', message: '' })
const loading = ref(false)
const success = ref(false)
const error = ref('')

const submit = async () => {
  loading.value = true
  error.value = ''
  try {
    await axios.post('/api/marketing/leads', form.value)
    success.value = true
    form.value = { name: '', email: '', company: '', message: '' }
  } catch (e) {
    error.value = e.response?.data?.message || 'Submission failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script> 