<template>
  <div class="support-button-container">
    <!-- Floating Support Button -->
    <button 
      @click="showSupportModal = true"
      class="support-button"
      :class="{ 'support-button--active': showSupportModal }"
      title="Contact Support"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </button>

    <!-- Support Modal -->
    <div v-if="showSupportModal" class="support-modal-overlay" @click="showSupportModal = false">
      <div class="support-modal" @click.stop>
        <div class="support-modal-header">
          <h3 class="support-modal-title">Contact Support</h3>
          <button @click="showSupportModal = false" class="support-modal-close">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="support-modal-body">
          <div class="support-info">
            <div class="support-icon">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
            <h4 class="support-subtitle">Need Help?</h4>
            <p class="support-description">
              Our support team is here to help you with any questions or issues you may have.
            </p>
          </div>
          
          <div class="support-form">
            <div class="form-group">
              <label class="form-label">Your Message</label>
              <textarea 
                v-model="supportMessage"
                class="form-textarea"
                placeholder="Describe your issue or question..."
                rows="4"
              ></textarea>
            </div>
          </div>
        </div>
        
        <div class="support-modal-footer">
          <button @click="showSupportModal = false" class="btn-secondary">Cancel</button>
          <button 
            @click="contactSupport"
            :disabled="!supportMessage.trim() || contactingSupport"
            class="btn-primary"
          >
            <span v-if="contactingSupport" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
            <span v-else>Send Message</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import chatService from '../services/chatService'

const router = useRouter()

// Reactive data
const showSupportModal = ref(false)
const supportMessage = ref('')
const contactingSupport = ref(false)

// Methods
const contactSupport = async () => {
  if (!supportMessage.value.trim()) return
  
  try {
    contactingSupport.value = true
    
    const response = await chatService.createSupportConversation(supportMessage.value)
    
    if (response.success) {
      // Close modal
      showSupportModal.value = false
      supportMessage.value = ''
      
      // Show success message
      alert('Support message sent successfully! Our team will get back to you soon.')
    }
  } catch (error) {
    console.error('Failed to contact support:', error)
    alert('Failed to send support message. Please try again.')
  } finally {
    contactingSupport.value = false
  }
}
</script>

<style scoped>
.support-button-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
}

.support-button {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.support-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.support-button--active {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.support-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.support-modal {
  background: white;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.support-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.support-modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.support-modal-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.support-modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.support-modal-body {
  padding: 1.5rem;
}

.support-info {
  text-align: center;
  margin-bottom: 2rem;
}

.support-icon {
  color: #667eea;
  margin-bottom: 1rem;
}

.support-subtitle {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.support-description {
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.support-form {
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.support-modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  justify-content: flex-end;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #5a67d8;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background: #4b5563;
}

@media (max-width: 640px) {
  .support-button {
    width: 3rem;
    height: 3rem;
  }
  
  .support-modal {
    width: 95%;
    margin: 1rem;
  }
}
</style> 