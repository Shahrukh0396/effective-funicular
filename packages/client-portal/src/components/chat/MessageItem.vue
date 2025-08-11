<template>
  <div 
    :id="`message-${message._id}`"
    class="message-item"
    :class="{ 
      'own-message': isOwnMessage,
      'message-sending': message.status === 'sending',
      'message-edited': message.editedAt,
      'has-reactions': message.reactions && message.reactions.length > 0
    }"
  >
    <!-- Message Avatar -->
    <div class="message-avatar" v-if="!isOwnMessage">
      <div class="avatar-circle small">
        {{ getInitialsFromSender(message.sender) }}
      </div>
    </div>
    
    <!-- Message Content -->
    <div class="message-content">
      <!-- Message Header -->
      <div class="message-header">
        <span class="message-sender">{{ getUserDisplayName(message.sender) }}</span>
        <span class="message-time">{{ formatTime(message.createdAt) }}</span>
        <span v-if="message.editedAt" class="message-edited-indicator">(edited)</span>
      </div>
      
      <!-- Reply Context -->
      <div v-if="message.replyTo" class="reply-context">
        <div class="reply-line"></div>
        <div class="reply-preview">
          <span class="reply-sender">{{ getUserDisplayName(message.replyTo.sender) }}</span>
          <span class="reply-content">{{ message.replyTo.content }}</span>
        </div>
      </div>
      
      <!-- Message Text with Formatting -->
      <div class="message-text">
        <div v-if="message.content" class="formatted-content" v-html="formatMessageContent(message.content)"></div>
        
        <!-- File Attachments -->
        <div v-if="message.attachments && message.attachments.length > 0" class="message-attachments">
          <div 
            v-for="attachment in message.attachments" 
            :key="attachment.filename"
            class="attachment-item"
          >
            <!-- Image Preview -->
            <div v-if="isImage(attachment.mimeType)" class="attachment-image">
              <img :src="attachment.url" :alt="attachment.originalName" @click="openImagePreview(attachment)" />
            </div>
            
            <!-- File Attachment -->
            <div v-else class="attachment-file">
              <div class="attachment-icon">
                <FileIcon :type="attachment.mimeType" />
              </div>
              <div class="attachment-info">
                <span class="attachment-name">{{ attachment.originalName }}</span>
                <span class="attachment-size">{{ formatFileSize(attachment.size) }}</span>
              </div>
              <button @click="downloadFile(attachment)" class="attachment-download" title="Download" :disabled="downloadingFiles.has(attachment.filename)">
                <svg v-if="downloadingFiles.has(attachment.filename)" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <ArrowDownTrayIcon v-else class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <!-- Audio Message -->
        <div v-if="message.audio && message.audio.url" class="audio-message">
          <audio controls class="audio-player">
            <source :src="message.audio.url" :type="message.audio.mimeType">
            Your browser does not support the audio element.
          </audio>
          <div v-if="message.audio.transcription" class="audio-transcription">
            <span class="transcription-label">Transcription:</span>
            <span class="transcription-text">{{ message.audio.transcription }}</span>
          </div>
        </div>
      </div>
      
      <!-- Message Actions -->
      <div class="message-actions" v-if="showActions">
        <button @click="showReactionPicker = true" class="action-btn" title="Add reaction">
          <FaceSmileIcon class="w-4 h-4" />
        </button>
        <button @click="replyToMessage" class="action-btn" title="Reply">
          <ArrowUturnLeftIcon class="w-4 h-4" />
        </button>
        <button @click="copyMessageLink" class="action-btn" title="Copy link">
          <LinkIcon class="w-4 h-4" />
        </button>
        <button v-if="isOwnMessage" @click="editMessage" class="action-btn" title="Edit">
          <PencilIcon class="w-4 h-4" />
        </button>
        <button v-if="isOwnMessage" @click="deleteMessage" class="action-btn text-red-500" title="Delete">
          <TrashIcon class="w-4 h-4" />
        </button>
      </div>
      
      <!-- Message Reactions -->
      <div v-if="message.reactions && message.reactions.length > 0" class="message-reactions">
        <div 
          v-for="reaction in groupedReactions" 
          :key="reaction.emoji"
          class="reaction-item"
          :class="{ 'user-reacted': hasUserReacted(reaction.emoji) }"
          @click="toggleReaction(reaction.emoji)"
        >
          <span class="reaction-emoji">{{ reaction.emoji }}</span>
          <span class="reaction-count">{{ reaction.count }}</span>
        </div>
      </div>
      
      <!-- Read Receipts -->
      <div v-if="message.readBy && message.readBy.length > 0" class="read-receipts">
        <span class="read-text">Seen by</span>
        <div class="read-users">
          <div 
            v-for="read in message.readBy.slice(0, 3)" 
            :key="read.user._id"
            class="read-user-avatar"
            :title="getUserDisplayName(read.user)"
          >
            {{ getInitialsFromSender(read.user) }}
          </div>
          <span v-if="message.readBy.length > 3" class="read-more">
            +{{ message.readBy.length - 3 }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Reaction Picker -->
    <ReactionPicker
      v-if="showReactionPicker"
      @emoji-select="addReaction"
      @close="showReactionPicker = false"
      class="reaction-picker"
    />
    
    <!-- Image Preview Modal -->
    <ImagePreviewModal
      v-if="showImagePreview"
      :image="previewImage"
      @close="showImagePreview = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  FaceSmileIcon, 
  ArrowUturnLeftIcon, 
  LinkIcon, 
  PencilIcon, 
  TrashIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'
import ReactionPicker from './ReactionPicker.vue'
import ImagePreviewModal from './ImagePreviewModal.vue'
import FileIcon from '../common/FileIcon.vue'
import { formatTime, formatFileSize, getUserDisplayName } from '@/utils/formatters'
import { parseMentions, formatMessageContent } from '@/utils/messageUtils'

// Props
const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  currentUser: {
    type: Object,
    required: true
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits([
  'reply',
  'edit',
  'delete',
  'reaction-toggle',
  'copy-link'
])

// Local state
const showReactionPicker = ref(false)
const showImagePreview = ref(false)
const previewImage = ref(null)
const downloadingFiles = ref(new Set())

// Computed
const isOwnMessage = computed(() => {
  return props.message.sender._id === props.currentUser._id
})

const groupedReactions = computed(() => {
  if (!props.message.reactions) return []
  
  const grouped = {}
  props.message.reactions.forEach(reaction => {
    if (!grouped[reaction.emoji]) {
      grouped[reaction.emoji] = {
        emoji: reaction.emoji,
        count: 0,
        users: []
      }
    }
    grouped[reaction.emoji].count++
    grouped[reaction.emoji].users.push(reaction.user._id)
  })
  
  return Object.values(grouped)
})

// Methods
function getInitialsFromSender(sender) {
  if (!sender) return '?'
  const firstName = sender.firstName || ''
  const lastName = sender.lastName || ''
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
}

function isImage(mimeType) {
  return mimeType && mimeType.startsWith('image/')
}

function hasUserReacted(emoji) {
  return groupedReactions.value.find(r => r.emoji === emoji)?.users.includes(props.currentUser._id)
}

function replyToMessage() {
  emit('reply', props.message)
}

function editMessage() {
  emit('edit', props.message)
}

function deleteMessage() {
  if (confirm('Are you sure you want to delete this message?')) {
    emit('delete', props.message._id)
  }
}

function copyMessageLink() {
  const link = `${window.location.origin}/chat/message/${props.message._id}`
  navigator.clipboard.writeText(link)
  emit('copy-link', link)
}

function addReaction(emoji) {
  emit('reaction-toggle', props.message._id, emoji)
  showReactionPicker.value = false
}

function toggleReaction(emoji) {
  emit('reaction-toggle', props.message._id, emoji)
}

function openImagePreview(attachment) {
  previewImage.value = attachment
  showImagePreview.value = true
}

async function downloadFile(attachment) {
  try {
    // Add to downloading set
    downloadingFiles.value.add(attachment.filename)
    
    // Create the full URL to the backend
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const fileUrl = `${baseUrl}${attachment.url}`
    
    // Fetch the file first to ensure it exists
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    // Get the blob
    const blob = await response.blob()
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = attachment.originalName || attachment.filename
    link.style.display = 'none'
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading file:', error)
    // Fallback: open in new tab
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const fileUrl = `${baseUrl}${attachment.url}`
    window.open(fileUrl, '_blank')
  } finally {
    // Remove from downloading set
    downloadingFiles.value.delete(attachment.filename)
  }
}

// Expose methods for parent component
defineExpose({
  scrollIntoView: () => {
    const element = document.getElementById(`message-${props.message._id}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
})
</script>

<style scoped>
.message-item {
  display: flex;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.message-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.message-item.own-message {
  flex-direction: row-reverse;
}

.message-item.own-message .message-content {
  align-items: flex-end;
}

.message-item.message-sending {
  opacity: 0.7;
}

.message-item.message-edited .message-text {
  font-style: italic;
}

.message-avatar {
  margin-right: 0.75rem;
  margin-left: 0.75rem;
  flex-shrink: 0;
}

.avatar-circle.small {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.message-sender {
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
}

.message-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.message-edited-indicator {
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
}

.reply-context {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  border-left: 3px solid #3b82f6;
}

.reply-line {
  width: 2px;
  background-color: #d1d5db;
  margin-right: 0.5rem;
}

.reply-preview {
  font-size: 0.875rem;
  color: #6b7280;
}

.reply-sender {
  font-weight: 600;
  color: #374151;
}

.message-text {
  margin-bottom: 0.5rem;
}

.formatted-content {
  line-height: 1.5;
  word-wrap: break-word;
}

.formatted-content :deep(.mention) {
  background-color: #dbeafe;
  color: #1d4ed8;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

.formatted-content :deep(.code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
}

.formatted-content :deep(.code-block) {
  background-color: #f3f4f6;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  margin: 0.5rem 0;
  overflow-x: auto;
}

.message-attachments {
  margin-top: 0.5rem;
}

.attachment-item {
  margin-bottom: 0.5rem;
}

.attachment-image img {
  max-width: 300px;
  max-height: 200px;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.attachment-image img:hover {
  opacity: 0.8;
}

.attachment-file {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  gap: 0.75rem;
}

.attachment-icon {
  flex-shrink: 0;
}

.attachment-info {
  flex: 1;
  min-width: 0;
}

.attachment-name {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.attachment-download {
  color: #3b82f6;
  transition: color 0.2s;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.attachment-download:hover:not(:disabled) {
  color: #2563eb;
  background-color: rgba(59, 130, 246, 0.1);
}

.attachment-download:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.audio-message {
  margin-top: 0.5rem;
}

.audio-player {
  width: 100%;
  max-width: 300px;
}

.audio-transcription {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.transcription-label {
  font-weight: 500;
  margin-right: 0.5rem;
}

.message-actions {
  display: flex;
  gap: 0.25rem;
  margin-top: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.message-item:hover .message-actions {
  opacity: 1;
}

.action-btn {
  padding: 0.25rem;
  border-radius: 0.25rem;
  color: #6b7280;
  transition: all 0.2s;
  background: none;
  border: none;
  cursor: pointer;
}

.action-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.message-reactions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.reaction-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.reaction-item:hover {
  background-color: #e5e7eb;
}

.reaction-item.user-reacted {
  background-color: #dbeafe;
  border-color: #3b82f6;
  color: #1d4ed8;
}

.reaction-emoji {
  font-size: 0.875rem;
}

.reaction-count {
  font-weight: 500;
}

.read-receipts {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.read-users {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.read-user-avatar {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5rem;
  font-weight: 600;
}

.read-more {
  font-size: 0.625rem;
}

.reaction-picker {
  position: absolute;
  z-index: 10;
}

/* Responsive design */
@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }
  
  .message-actions {
    opacity: 1;
  }
  
  .attachment-image img {
    max-width: 250px;
    max-height: 150px;
  }
}
</style> 