<template>
  <div class="contact-form-container">
    <form @submit.prevent="handleSubmit" class="contact-form">
      <div class="form-grid">
        <div class="form-group">
          <label for="name" class="form-label">Full Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            :class="['form-input', { 'form-input-error': errors.name }]"
            placeholder="Enter your full name"
            required
          />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="email" class="form-label">Email Address</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            :class="['form-input', { 'form-input-error': errors.email }]"
            placeholder="Enter your email address"
            required
            @blur="validateEmailOnBlur"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          <span v-if="form.service === 'white-label' && form.email" class="text-xs text-blue-600 mt-1">
            ⚠️ Business email required for white label services
          </span>
        </div>

        <div class="form-group">
          <label for="phone" class="form-label">Phone Number</label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            :class="['form-input', { 'form-input-error': errors.phone }]"
            placeholder="Enter your phone number"
          />
          <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
        </div>

        <div class="form-group">
          <label for="company" class="form-label">Company</label>
          <input
            id="company"
            v-model="form.company"
            type="text"
            :class="['form-input', { 'form-input-error': errors.company }]"
            placeholder="Enter your company name"
          />
          <span v-if="errors.company" class="error-message">{{ errors.company }}</span>
        </div>

        <div class="form-group full-width">
          <label for="service" class="form-label">Service Interest</label>
          <select
            id="service"
            v-model="form.service"
            :class="['form-input', { 'form-input-error': errors.service }]"
            required
          >
            <option value="">Select a service</option>
            <option value="web-development">Web Development</option>
            <option value="mobile-apps">Mobile Apps</option>
            <option value="cloud-solutions">Cloud Solutions</option>
            <option value="data-analytics">Data Analytics</option>
            <option value="cybersecurity">Cybersecurity</option>
            <option value="consulting">Consulting</option>
            <option value="white-label">White Label Solutions</option>
          </select>
          <span v-if="errors.service" class="error-message">{{ errors.service }}</span>
        </div>

        <div class="form-group full-width">
          <label for="message" class="form-label">Message</label>
          <textarea
            id="message"
            v-model="form.message"
            :class="['form-input', 'form-textarea', { 'form-input-error': errors.message }]"
            placeholder="Tell us about your project or requirements..."
            rows="6"
            required
          ></textarea>
          <span v-if="errors.message" class="error-message">{{ errors.message }}</span>
        </div>

        <div class="form-group full-width">
          <label class="checkbox-container">
            <input
              v-model="form.newsletter"
              type="checkbox"
              class="checkbox-input"
            />
            <span class="checkbox-custom"></span>
            <span class="checkbox-label">
              Subscribe to our newsletter for updates and insights
            </span>
          </label>
        </div>
      </div>

      <div class="form-actions">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="submit-button"
          :class="{ 'submit-button-loading': isSubmitting }"
        >
          <LoadingSpinner v-if="isSubmitting" text="Sending..." />
          <span v-else>Send Message</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useToast } from '@/composables/useToast'
import LoadingSpinner from './LoadingSpinner.vue'
import { validateBusinessEmail } from '@/utils/emailValidation'
import axios from '@/config/axios'

const { success, error: showError } = useToast()

const isSubmitting = ref(false)
const errors = reactive({})

const form = reactive({
  name: '',
  email: '',
  phone: '',
  company: '',
  service: '',
  message: '',
  newsletter: false
})

const validateForm = () => {
  errors.value = {}

  if (!form.name.trim()) {
    errors.name = 'Name is required'
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address'
  } else if (form.service === 'white-label') {
    // For white label services, require business email
    const emailValidation = validateBusinessEmail(form.email)
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message
    }
  }

  if (form.phone && !/^[\+]?[1-9]\d{0,15}$|^0\d{0,15}$/.test(form.phone.replace(/[^\d+]/g, ''))) {
    errors.phone = 'Please enter a valid phone number (e.g., +1234567890, 1234567890, or 03399113000)'
  }

  if (!form.service) {
    errors.service = 'Please select a service'
  }

  if (!form.message.trim()) {
    errors.message = 'Message is required'
  } else if (form.message.length < 10) {
    errors.message = 'Message must be at least 10 characters long'
  }

  return Object.keys(errors).length === 0
}

const validateEmailOnBlur = () => {
  if (form.service === 'white-label' && form.email) {
    const emailValidation = validateBusinessEmail(form.email)
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message
    } else {
      delete errors.email
    }
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    // Split full name into first and last name
    const nameParts = form.name.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Clean phone number for API (remove all non-digit characters except +)
    const cleanPhone = form.phone ? form.phone.replace(/[^\d+]/g, '') : ''

    // Prepare the data for the API
    const contactData = {
      email: form.email,
      firstName,
      lastName,
      company: form.company,
      phone: cleanPhone,
      message: form.message,
      subject: `Service Interest: ${form.service}`
    }

    // Send to backend API
    const response = await axios.post('/api/marketing/contact', contactData)
    const result = response.data

    if (result.success) {
      success('Thank you! Your message has been sent successfully. We\'ll get back to you soon.')
      
      // Reset form
      Object.keys(form).forEach(key => {
        if (key === 'newsletter') {
          form[key] = false
        } else {
          form[key] = ''
        }
      })
    } else {
      throw new Error(result.message || 'Failed to send message')
    }
  } catch (err) {
    console.error('Contact form error:', err)
    showError('Sorry, there was an error sending your message. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.contact-form-container {
  max-width: 800px;
  margin: 0 auto;
}

.contact-form {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 600;
  color: #111827 !important;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-input {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;
  color: #111827 !important;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: #4b5563 !important;
}

.form-input-error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  font-weight: 500;
}

.checkbox-container {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  background: white;
  position: relative;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 0.3s ease;
}

.checkbox-input:checked + .checkbox-custom {
  background: #3b82f6;
  border-color: #3b82f6;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label {
  font-size: 14px;
  color: #111827 !important;
  line-height: 1.5;
}

.form-actions {
  display: flex;
  justify-content: center;
}

.submit-button {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  position: relative;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.2);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.submit-button-loading {
  pointer-events: none;
}

/* Responsive design */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .contact-form {
    padding: 24px;
  }
  
  .submit-button {
    width: 100%;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .contact-form {
    background: #1f2937;
    border-color: #374151;
  }
  
  .form-input {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .form-label {
    color: #d1d5db;
  }
  
  .checkbox-custom {
    background: #374151;
    border-color: #4b5563;
  }
  
  .checkbox-label {
    color: #9ca3af;
  }
}
</style> 