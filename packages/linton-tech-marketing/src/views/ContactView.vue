<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <Navigation />
    
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            Get In Touch
          </h1>
          <p class="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
            Ready to transform your business? Let's start a conversation.
          </p>
        </div>
      </div>
    </section>

    <!-- Contact Form Section -->
    <section class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Contact Form -->
          <div class="bg-white rounded-xl p-8 shadow-lg">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
            <form @submit.prevent="submitForm" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    v-model="form.firstName"
                    type="text"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    v-model="form.lastName"
                    type="text"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label for="company" class="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  id="company"
                  v-model="form.company"
                  type="text"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your Company"
                />
              </div>

              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label for="service" class="block text-sm font-medium text-gray-700 mb-2">
                  Service Interest
                </label>
                <select
                  id="service"
                  v-model="form.service"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a service</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-apps">Mobile Apps</option>
                  <option value="cloud-solutions">Cloud Solutions</option>
                  <option value="data-analytics">Data Analytics</option>
                  <option value="cybersecurity">Cybersecurity</option>
                  <option value="consulting">Consulting</option>
                  <option value="white-label">White-Label Solutions</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label for="message" class="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  v-model="form.message"
                  rows="6"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about your project or how we can help..."
                ></textarea>
              </div>

              <div class="flex items-center">
                <input
                  id="newsletter"
                  v-model="form.newsletter"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="newsletter" class="ml-2 block text-sm text-gray-700">
                  Subscribe to our newsletter for updates and insights
                </label>
              </div>

              <button
                type="submit"
                :disabled="submitting"
                class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="submitting">Sending...</span>
                <span v-else>Send Message</span>
              </button>
            </form>
          </div>

          <!-- Contact Information -->
          <div class="space-y-8">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div class="space-y-6">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-semibold text-gray-900">Phone</h3>
                    <p class="text-gray-600">+1 (443) 625-4261</p>
                    <p class="text-gray-600">Mon-Fri 10AM-7PM CST</p>
                  </div>
                </div>

                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-semibold text-gray-900">Email</h3>
                    <p class="text-gray-600">hello@linton-tech.com</p>
                    <p class="text-gray-600">support@linton-tech.com</p>
                  </div>
                </div>

                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-semibold text-gray-900">Office</h3>
                    <p class="text-gray-600">5900 Balcones Drive ste 100</p>
                    <p class="text-gray-600">Austin, TX 78731</p>
                    <p class="text-gray-600">United States</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Office Hours -->
            <div class="bg-white rounded-xl p-6 shadow-lg">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Office Hours</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Monday - Friday</span>
                  <span class="text-gray-900 font-medium">10:00 AM - 7:00 PM</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Saturday</span>
                  <span class="text-gray-900 font-medium">10:00 AM - 4:00 PM</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Sunday</span>
                  <span class="text-gray-900 font-medium">Closed</span>
                </div>
              </div>
            </div>

            <!-- Social Media -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Follow Us</h3>
              <div class="flex space-x-4">
                <a href="#" class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Map Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Find Us</h2>
          <p class="text-xl text-gray-600">Visit our office in Austin, TX</p>
        </div>
        <div class="bg-gray-200 rounded-xl h-96 flex items-center justify-center">
          <div class="text-center">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <p class="text-gray-600">Interactive map would be embedded here</p>
            <p class="text-sm text-gray-500">5900 Balcones Drive ste 100, Austin, TX 78731</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import Navigation from '@/components/Navigation.vue'
import { ref } from 'vue'
import axios from '@/config/axios'

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  phone: '',
  service: '',
  message: '',
  newsletter: false
})

const submitting = ref(false)

const submitForm = async () => {
  submitting.value = true
  
  try {
    // Send to backend API
    const response = await axios.post('/api/marketing/contact', {
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      email: form.value.email,
      company: form.value.company,
      phone: form.value.phone,
      message: form.value.message,
      subject: `Service Interest: ${form.value.service}`,
      service: form.value.service
    })

    if (response.data.success) {
      // Reset form
      form.value = {
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        phone: '',
        service: '',
        message: '',
        newsletter: false
      }
      
      // Show success message
      alert('Thank you for your message! We\'ll get back to you soon.')
    } else {
      throw new Error(response.data.message || 'Failed to send message')
    }
  } catch (error) {
    console.error('Contact form error:', error)
    alert('There was an error sending your message. Please try again.')
  } finally {
    submitting.value = false
  }
}
</script> 