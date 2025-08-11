<template>
  <div class="toast-container">
    <TransitionGroup name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="[
          `toast-${toast.type}`,
          { 'toast-visible': toast.visible }
        ]"
        @click="removeToast(toast.id)"
      >
        <div class="toast-icon">
          <CheckCircleIcon v-if="toast.type === 'success'" class="w-5 h-5" />
          <ExclamationTriangleIcon v-else-if="toast.type === 'warning'" class="w-5 h-5" />
          <XCircleIcon v-else-if="toast.type === 'error'" class="w-5 h-5" />
          <InformationCircleIcon v-else class="w-5 h-5" />
        </div>
        <div class="toast-content">
          <p class="toast-message">{{ toast.message }}</p>
        </div>
        <button
          @click.stop="removeToast(toast.id)"
          class="toast-close"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.toast-visible {
  transform: translateX(0);
  opacity: 1;
}

.toast-success {
  border-left: 4px solid #10b981;
}

.toast-success .toast-icon {
  color: #10b981;
}

.toast-error {
  border-left: 4px solid #ef4444;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-warning {
  border-left: 4px solid #f59e0b;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-info {
  border-left: 4px solid #3b82f6;
}

.toast-info .toast-icon {
  color: #3b82f6;
}

.toast-content {
  flex: 1;
}

.toast-message {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  line-height: 1.4;
}

.toast-close {
  padding: 4px;
  border-radius: 6px;
  color: #9ca3af;
  transition: all 0.2s;
  background: transparent;
  border: none;
  cursor: pointer;
}

.toast-close:hover {
  color: #6b7280;
  background: #f3f4f6;
}

/* Toast animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .toast {
    background: #1f2937;
    border-color: #374151;
  }
  
  .toast-message {
    color: #d1d5db;
  }
  
  .toast-close:hover {
    background: #374151;
    color: #d1d5db;
  }
}
</style> 