<template>
  <div class="chat-container">
    <!-- Chat Sidebar -->
    <div class="chat-sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <div class="sidebar-header">
        <h3 class="text-lg font-semibold text-gray-800">Messages</h3>
        <button 
          @click="sidebarCollapsed = !sidebarCollapsed"
          class="collapse-btn"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>

      <!-- New Conversation Button -->
      <div class="new-conversation-section">
        <button 
          @click="showNewConversationModal = true"
          class="new-conversation-btn"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          New Conversation
        </button>
      </div>

      <!-- Conversations List -->
      <div class="conversations-list">
        <div 
          v-for="conversation in conversations" 
          :key="conversation._id"
          @click="selectConversation(conversation)"
          class="conversation-item"
          :class="{ 'active': selectedConversation?._id === conversation._id }"
        >
          <div class="conversation-avatar">
            <div class="avatar-circle">
              {{ getConversationInitials(conversation) }}
            </div>
          </div>
          <div class="conversation-info">
            <h4 class="conversation-name">{{ conversation.name || 'Direct Message' }}</h4>
            <p class="conversation-preview">{{ conversation.lastMessage?.content || 'No messages yet' }}</p>
          </div>
          <div class="conversation-meta">
            <span class="conversation-time">{{ formatTime(conversation.lastMessage?.timestamp) }}</span>
            <span v-if="conversation.unreadCount > 0" class="unread-badge">
              {{ conversation.unreadCount }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Main Area -->
    <div class="chat-main" v-if="selectedConversation">
      <!-- Chat Header -->
      <div class="chat-header">
        <div class="chat-header-info">
          <h3 class="chat-title">{{ selectedConversation.name || 'Direct Message' }}</h3>
          <p class="chat-subtitle">{{ getParticipantNames(selectedConversation) }}</p>
        </div>
        <div class="chat-header-actions">
          <button @click="showConversationInfo = true" class="action-btn">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="messages-container" ref="messagesContainer">
        <div v-if="loading" class="loading-messages">
          <div class="loading-spinner"></div>
          <p>Loading messages...</p>
        </div>
        
        <div v-else-if="messages.length === 0" class="empty-messages">
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <p>No messages yet. Start the conversation!</p>
        </div>

        <div v-else class="messages-list">
          <div 
            v-for="message in messages" 
            :key="message._id"
            class="message-item"
            :class="{ 'own-message': message.sender._id === currentUser._id }"
          >
            <div class="message-avatar" v-if="message.sender._id !== currentUser._id">
              <div class="avatar-circle small">
                {{ getInitials(message.sender.firstName, message.sender.lastName) }}
              </div>
            </div>
            
            <div class="message-content">
              <div class="message-header">
                <span class="message-sender">{{ message.sender.firstName }} {{ message.sender.lastName }}</span>
                <span class="message-time">{{ formatTime(message.createdAt) }}</span>
              </div>
              
              <div class="message-text">
                <p v-if="message.content">{{ message.content }}</p>
                
                <!-- File Attachments -->
                <div v-if="message.attachments && message.attachments.length > 0" class="message-attachments">
                  <div 
                    v-for="attachment in message.attachments" 
                    :key="attachment.filename"
                    class="attachment-item"
                  >
                    <div class="attachment-icon">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                      </svg>
                    </div>
                    <div class="attachment-info">
                      <span class="attachment-name">{{ attachment.originalName }}</span>
                      <span class="attachment-size">{{ formatFileSize(attachment.size) }}</span>
                    </div>
                    <a :href="attachment.url" target="_blank" class="attachment-download">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message Input -->
      <div class="message-input-container">
        <div class="input-actions">
          <button @click="showFileUpload = true" class="action-btn">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
            </svg>
          </button>
        </div>
        
        <div class="message-input-wrapper">
          <textarea 
            v-model="newMessage"
            @keydown.enter.prevent="sendMessage"
            placeholder="Type your message..."
            class="message-input"
            rows="1"
            ref="messageInput"
          ></textarea>
        </div>
        
        <button 
          @click="sendMessage"
          :disabled="!newMessage.trim()"
          class="send-btn"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- No Conversation Selected -->
    <div v-else class="no-conversation">
      <div class="no-conversation-content">
        <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
        <h3 class="text-xl font-semibold text-gray-600 mt-4">Select a conversation</h3>
        <p class="text-gray-500 mt-2">Choose a conversation from the sidebar to start messaging</p>
        <button 
          @click="showNewConversationModal = true"
          class="new-conversation-btn mt-4"
        >
          Start New Conversation
        </button>
      </div>
    </div>

    <!-- New Conversation Modal -->
    <div v-if="showNewConversationModal" class="modal-overlay" @click="showNewConversationModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">New Conversation</h3>
          <button @click="showNewConversationModal = false" class="modal-close">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Conversation Type</label>
            <select v-model="newConversation.type" class="form-select">
              <option value="direct">Direct Message</option>
              <option value="group">Group Chat</option>
            </select>
          </div>
          
          <div v-if="newConversation.type === 'direct'" class="form-group">
            <label class="form-label">Select User</label>
            <select v-model="newConversation.participantId" class="form-select">
              <option value="">Choose a user...</option>
              <option v-for="user in availableUsers" :key="user._id" :value="user._id">
                {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
              </option>
            </select>
          </div>
          
          <div v-if="newConversation.type === 'group'" class="form-group">
            <label class="form-label">Group Name</label>
            <input v-model="newConversation.name" type="text" class="form-input" placeholder="Enter group name">
          </div>
          
          <div v-if="newConversation.type === 'group'" class="form-group">
            <label class="form-label">Select Participants</label>
            <div class="participants-list">
              <label v-for="user in availableUsers" :key="user._id" class="participant-item">
                <input type="checkbox" :value="user._id" v-model="newConversation.participantIds">
                <span>{{ user.firstName }} {{ user.lastName }}</span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showNewConversationModal = false" class="btn-secondary">Cancel</button>
          <button @click="createConversation" class="btn-primary">Create Conversation</button>
        </div>
      </div>
    </div>

    <!-- File Upload Modal -->
    <div v-if="showFileUpload" class="modal-overlay" @click="showFileUpload = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Upload Files</h3>
          <button @click="showFileUpload = false" class="modal-close">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="file-upload-area">
            <input 
              type="file" 
              multiple 
              @change="handleFileUpload" 
              ref="fileInput"
              class="file-input"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
            >
            <div class="upload-placeholder">
              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p>Click to select files or drag and drop</p>
              <p class="text-sm text-gray-500">Max 5 files, 50MB each</p>
            </div>
          </div>
          
          <div v-if="selectedFiles.length > 0" class="selected-files">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
            <div v-for="file in selectedFiles" :key="file.name" class="file-item">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
              <button @click="removeFile(file)" class="remove-file-btn">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showFileUpload = false" class="btn-secondary">Cancel</button>
          <button @click="uploadFiles" :disabled="selectedFiles.length === 0" class="btn-primary">Upload Files</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useAuthStore } from '../stores/auth'
import chatService from '../services/chatService'

export default {
  name: 'ChatInterface',
  setup() {
    const authStore = useAuthStore()
    
    // Reactive data
    const conversations = ref([])
    const selectedConversation = ref(null)
    const messages = ref([])
    const newMessage = ref('')
    const loading = ref(false)
    const sidebarCollapsed = ref(false)
    const showNewConversationModal = ref(false)
    const showFileUpload = ref(false)
    const selectedFiles = ref([])
    const availableUsers = ref([])
    
    // Form data for new conversation
    const newConversation = ref({
      type: 'direct',
      name: '',
      participantId: '',
      participantIds: []
    })
    
    // Socket connection
    let socket = null
    
    // Computed
    const currentUser = authStore.user
    
    // Methods
    const loadConversations = async () => {
      try {
        const response = await chatService.getConversations()
        conversations.value = response.data
      } catch (error) {
        console.error('Failed to load conversations:', error)
      }
    }
    
    const loadAvailableUsers = async () => {
      try {
        const response = await chatService.getAvailableUsers()
        availableUsers.value = response.data
      } catch (error) {
        console.error('Failed to load available users:', error)
      }
    }
    
    const loadMessages = async (conversationId) => {
      if (!conversationId) return
      
      loading.value = true
      try {
        const response = await chatService.getMessages(conversationId)
        messages.value = response.data
        scrollToBottom()
      } catch (error) {
        console.error('Failed to load messages:', error)
      } finally {
        loading.value = false
      }
    }
    
    const selectConversation = (conversation) => {
      selectedConversation.value = conversation
      loadMessages(conversation._id)
      joinConversation(conversation._id)
    }
    
    const sendMessage = async () => {
      if (!newMessage.value.trim() || !selectedConversation.value) return
      
      try {
        await chatService.sendTextMessage({
          conversationId: selectedConversation.value._id,
          content: newMessage.value
        })
        newMessage.value = ''
      } catch (error) {
        console.error('Failed to send message:', error)
      }
    }
    
    const createConversation = async () => {
      try {
        if (newConversation.value.type === 'direct') {
          await chatService.createDirectConversation({
            participantId: newConversation.value.participantId
          })
        } else {
          await chatService.createGroupConversation({
            name: newConversation.value.name,
            participantIds: newConversation.value.participantIds
          })
        }
        
        showNewConversationModal.value = false
        loadConversations()
        resetNewConversation()
      } catch (error) {
        console.error('Failed to create conversation:', error)
      }
    }
    
    const handleFileUpload = (event) => {
      const files = Array.from(event.target.files)
      selectedFiles.value = files
    }
    
    const removeFile = (file) => {
      const index = selectedFiles.value.indexOf(file)
      if (index > -1) {
        selectedFiles.value.splice(index, 1)
      }
    }
    
    const uploadFiles = async () => {
      if (!selectedConversation.value || selectedFiles.value.length === 0) return
      
      try {
        const formData = new FormData()
        formData.append('conversationId', selectedConversation.value._id)
        selectedFiles.value.forEach(file => {
          formData.append('files', file)
        })
        
        await chatService.sendFileMessage(formData)
        showFileUpload.value = false
        selectedFiles.value = []
      } catch (error) {
        console.error('Failed to upload files:', error)
      }
    }
    
    const joinConversation = (conversationId) => {
      if (socket) {
        socket.emit('joinConversation', conversationId)
      }
    }
    
    const scrollToBottom = () => {
      nextTick(() => {
        const container = document.querySelector('.messages-container')
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    }
    
    const resetNewConversation = () => {
      newConversation.value = {
        type: 'direct',
        name: '',
        participantId: '',
        participantIds: []
      }
    }
    
    // Utility methods
    const getConversationInitials = (conversation) => {
      if (conversation.name) {
        return conversation.name.charAt(0).toUpperCase()
      }
      return 'C'
    }
    
    const getInitials = (firstName, lastName) => {
      return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
    }
    
    const getParticipantNames = (conversation) => {
      if (conversation.participants) {
        return conversation.participants
          .map(p => `${p.user.firstName} ${p.user.lastName}`)
          .join(', ')
      }
      return ''
    }
    
    const formatTime = (timestamp) => {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 24 * 60 * 60 * 1000) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } else {
        return date.toLocaleDateString()
      }
    }
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    // Socket setup
    const setupSocket = () => {
      // Initialize socket connection here
      // This would connect to your Socket.IO server
    }
    
    const handleNewMessage = (message) => {
      if (message.conversationId === selectedConversation.value?._id) {
        messages.value.push(message.message)
        scrollToBottom()
      }
      loadConversations() // Refresh conversation list
    }
    
    // Lifecycle
    onMounted(async () => {
      await loadConversations()
      await loadAvailableUsers()
      setupSocket()
    })
    
    onUnmounted(() => {
      if (socket) {
        socket.disconnect()
      }
    })
    
    return {
      // Data
      conversations,
      selectedConversation,
      messages,
      newMessage,
      loading,
      sidebarCollapsed,
      showNewConversationModal,
      showFileUpload,
      selectedFiles,
      availableUsers,
      newConversation,
      currentUser,
      
      // Methods
      loadConversations,
      selectConversation,
      sendMessage,
      createConversation,
      handleFileUpload,
      removeFile,
      uploadFiles,
      getConversationInitials,
      getInitials,
      getParticipantNames,
      formatTime,
      formatFileSize
    }
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  background: #f8f9fa;
}

.chat-sidebar {
  width: 320px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar-collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.collapse-btn {
  padding: 0.5rem;
  border-radius: 0.375rem;
  color: #6b7280;
  transition: color 0.2s;
}

.collapse-btn:hover {
  color: #374151;
}

.new-conversation-section {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.new-conversation-btn {
  width: 100%;
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.new-conversation-btn:hover {
  background: #2563eb;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.conversation-item:hover {
  background: #f9fafb;
}

.conversation-item.active {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
}

.conversation-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.avatar-circle.small {
  width: 32px;
  height: 32px;
  font-size: 0.75rem;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-name {
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-preview {
  font-size: 0.875rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.conversation-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.unread-badge {
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  min-width: 1.25rem;
  text-align: center;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.chat-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

.action-btn {
  padding: 0.5rem;
  border-radius: 0.375rem;
  color: #6b7280;
  transition: color 0.2s;
}

.action-btn:hover {
  color: #374151;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.loading-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-item {
  display: flex;
  gap: 0.75rem;
}

.message-item.own-message {
  flex-direction: row-reverse;
}

.message-content {
  max-width: 70%;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.message-sender {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.message-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.message-text {
  background: white;
  padding: 0.75rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.own-message .message-text {
  background: #3b82f6;
  color: white;
}

.message-attachments {
  margin-top: 0.5rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  margin-bottom: 0.25rem;
}

.attachment-icon {
  color: #6b7280;
}

.attachment-info {
  flex: 1;
}

.attachment-name {
  font-size: 0.875rem;
  color: #374151;
  display: block;
}

.attachment-size {
  font-size: 0.75rem;
  color: #9ca3af;
}

.attachment-download {
  color: #3b82f6;
  padding: 0.25rem;
}

.message-input-container {
  padding: 1rem;
  background: white;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
}

.input-actions {
  display: flex;
  gap: 0.5rem;
}

.message-input-wrapper {
  flex: 1;
}

.message-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  resize: none;
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.message-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.send-btn {
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #2563eb;
}

.send-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.no-conversation {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-conversation-content {
  text-align: center;
  color: #6b7280;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  padding: 0.5rem;
  color: #6b7280;
  border-radius: 0.375rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
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

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.participants-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 0.25rem;
}

.participant-item:hover {
  background: #f9fafb;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
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

.file-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  position: relative;
  transition: border-color 0.2s;
}

.file-upload-area:hover {
  border-color: #3b82f6;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-placeholder {
  color: #6b7280;
}

.selected-files {
  margin-top: 1rem;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  margin-bottom: 0.25rem;
}

.file-name {
  font-size: 0.875rem;
  color: #374151;
}

.file-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.remove-file-btn {
  color: #ef4444;
  padding: 0.25rem;
}
</style> 