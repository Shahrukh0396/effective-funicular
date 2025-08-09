<template>
  <div class="image-preview-overlay" @click="$emit('close')">
    <div class="image-preview-modal" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">{{ image.originalName }}</h3>
        <button @click="$emit('close')" class="close-btn">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>
      
      <div class="image-container">
        <img 
          :src="image.url" 
          :alt="image.originalName"
          class="preview-image"
          @load="imageLoaded = true"
        />
        <div v-if="!imageLoaded" class="loading-spinner">
          <div class="spinner"></div>
          <p>Loading image...</p>
        </div>
      </div>
      
      <div class="image-info">
        <div class="info-item">
          <span class="info-label">Size:</span>
          <span class="info-value">{{ formatFileSize(image.size) }}</span>
        </div>
        <div class="info-item" v-if="image.metadata?.width && image.metadata?.height">
          <span class="info-label">Dimensions:</span>
          <span class="info-value">{{ image.metadata.width }} × {{ image.metadata.height }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Type:</span>
          <span class="info-value">{{ image.mimeType }}</span>
        </div>
      </div>
      
      <div class="modal-actions">
        <a 
          :href="image.url" 
          :download="image.originalName"
          class="download-btn"
        >
          <ArrowDownTrayIcon class="w-4 h-4" />
          Download
        </a>
        <button @click="$emit('close')" class="close-modal-btn">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import { formatFileSize } from '@/utils/formatters'

// Props
const props = defineProps({
  image: {
    type: Object,
    required: true
  }
})

// Emits
defineEmits(['close'])

// Local state
const imageLoaded = ref(false)
</script>

<style scoped>
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.image-preview-modal {
  background: white;
  border-radius: 0.5rem;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.close-btn {
  padding: 0.5rem;
  border-radius: 0.375rem;
  color: #6b7280;
  transition: all 0.2s;
  background: none;
  border: none;
  cursor: pointer;
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.image-container {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  max-height: 60vh;
  overflow: hidden;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 0.375rem;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.image-info {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 500;
  color: #374151;
}

.info-value {
  color: #6b7280;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s;
}

.download-btn:hover {
  background-color: #2563eb;
}

.close-modal-btn {
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.close-modal-btn:hover {
  background-color: #e5e7eb;
}

/* Responsive design */
@media (max-width: 768px) {
  .image-preview-modal {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .download-btn,
  .close-modal-btn {
    justify-content: center;
  }
}
</style> 