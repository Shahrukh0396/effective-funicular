<template>
  <div class="reaction-picker-container">
    <div class="reaction-picker">
      <div class="picker-header">
        <h4 class="picker-title">Add Reaction</h4>
        <button @click="$emit('close')" class="close-btn">
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
      
      <div class="emoji-grid">
        <button
          v-for="emoji in commonEmojis"
          :key="emoji"
          @click="$emit('emoji-select', emoji)"
          class="emoji-btn"
        >
          {{ emoji }}
        </button>
      </div>
      
      <div class="custom-emoji">
        <input
          v-model="customEmoji"
          @keydown.enter="$emit('emoji-select', customEmoji)"
          placeholder="Type custom emoji..."
          class="custom-emoji-input"
          maxlength="10"
        />
        <button 
          @click="$emit('emoji-select', customEmoji)"
          :disabled="!customEmoji.trim()"
          class="add-custom-btn"
        >
          Add
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const customEmoji = ref('')

const commonEmojis = [
  '👍', '👎', '❤️', '😀', '😍', '😂', '😮', '😢', '😡', '🎉',
  '🔥', '💯', '👏', '🙏', '🤔', '😎', '🥳', '😴', '🤯', '💪',
  '👀', '💩', '🤝', '🙌', '👊', '✌️', '🤟', '👋', '💋', '💔'
]

defineEmits(['emoji-select', 'close'])
</script>

<style scoped>
.reaction-picker-container {
  position: relative;
}

.reaction-picker {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  min-width: 280px;
  z-index: 50;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.picker-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.close-btn {
  padding: 0.25rem;
  border-radius: 0.25rem;
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

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.emoji-btn {
  padding: 0.5rem;
  border-radius: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  transition: background-color 0.2s;
}

.emoji-btn:hover {
  background-color: #f3f4f6;
}

.custom-emoji {
  display: flex;
  gap: 0.5rem;
}

.custom-emoji-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.custom-emoji-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.add-custom-btn {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-custom-btn:hover:not(:disabled) {
  background-color: #2563eb;
}

.add-custom-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
</style> 