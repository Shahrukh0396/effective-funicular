<template>
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
      <p class="text-lg text-gray-600">Request a demo or contact us to learn how Linton can transform your business.</p>
    </div>
    
    <div class="grid md:grid-cols-2 gap-8">
      <!-- Contact Form -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h3 class="text-xl font-semibold mb-6">Contact Us</h3>
        <form @submit.prevent="submitContactForm" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input 
                v-model="contactForm.firstName" 
                type="text" 
                required 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input 
                v-model="contactForm.lastName" 
                type="text" 
                required 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              v-model="contactForm.email" 
              type="email" 
              required 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input 
              v-model="contactForm.company" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea 
              v-model="contactForm.message" 
              rows="4" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell us about your project..."
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {{ loading ? 'Sending...' : 'Send Message' }}
          </button>
        </form>
      </div>
      
      <!-- Quick Demo Request -->
      <div class="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <h3 class="text-xl font-semibold mb-6">Request Demo</h3>
        <form @submit.prevent="submitDemoRequest" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Name</label>
            <input 
              v-model="demoForm.name" 
              type="text" 
              required 
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white/70"
              placeholder="Your name"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Email</label>
            <input 
              v-model="demoForm.email" 
              type="email" 
              required 
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-white/70"
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Company Size</label>
            <select 
              v-model="demoForm.companySize" 
              class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white"
            >
              <option value="">Select company size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="200+">200+ employees</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            :disabled="demoLoading"
            class="w-full bg-white text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {{ demoLoading ? 'Sending...' : 'Request Demo' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from '@/config/axios'
import { validateBusinessEmail } from '@/utils/emailValidation'

const loading = ref(false)
const demoLoading = ref(false)

const contactForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  message: ''
})

const demoForm = ref({
  name: '',
  email: '',
  companySize: ''
})

const submitContactForm = async () => {
  // Validate business email for contact form (since this is for business inquiries)
  const emailValidation = validateBusinessEmail(contactForm.value.email)
  if (!emailValidation.isValid) {
    alert(emailValidation.message)
    return
  }

  loading.value = true
  try {
    const response = await axios.post('/api/marketing/contact', {
      firstName: contactForm.value.firstName,
      lastName: contactForm.value.lastName,
      email: contactForm.value.email,
      company: contactForm.value.company,
      message: contactForm.value.message,
      subject: 'Contact Form Submission'
    })
    
    if (response.data.success) {
      // Reset form
      Object.keys(contactForm.value).forEach(key => {
        contactForm.value[key] = ''
      })
      alert('Thank you! Your message has been sent.')
    } else {
      throw new Error(response.data.message || 'Failed to send message')
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    alert('There was an error sending your message. Please try again.')
  } finally {
    loading.value = false
  }
}

const submitDemoRequest = async () => {
  // Validate business email for demo requests
  const emailValidation = validateBusinessEmail(demoForm.value.email)
  if (!emailValidation.isValid) {
    alert(emailValidation.message)
    return
  }

  demoLoading.value = true
  try {
    // Split full name into first and last name
    const nameParts = demoForm.value.name.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    const response = await axios.post('/api/marketing/demo-request', {
      firstName,
      lastName,
      email: demoForm.value.email,
      companySize: demoForm.value.companySize,
      message: `Demo request from ${demoForm.value.name} (${demoForm.value.email}) - Company size: ${demoForm.value.companySize}`
    })
    
    if (response.data.success) {
      // Reset form
      Object.keys(demoForm.value).forEach(key => {
        demoForm.value[key] = ''
      })
      alert('Thank you! We\'ll contact you soon to schedule your demo.')
    } else {
      throw new Error(response.data.message || 'Failed to submit demo request')
    }
  } catch (error) {
    console.error('Error submitting demo request:', error)
    alert('There was an error submitting your demo request. Please try again.')
  } finally {
    demoLoading.value = false
  }
}
</script>

<style scoped>
/* Make form text much darker */
input, textarea, select {
  color: #111827 !important;
}

input::placeholder, textarea::placeholder {
  color: #4b5563 !important;
}

/* Ensure labels are dark */
label {
  color: #111827 !important;
  font-weight: 600;
}

/* Make select options dark */
select option {
  color: #111827 !important;
  background-color: white;
}

/* Override any Tailwind classes */
.text-gray-600 {
  color: #111827 !important;
}

.text-gray-700 {
  color: #111827 !important;
}
</style> 