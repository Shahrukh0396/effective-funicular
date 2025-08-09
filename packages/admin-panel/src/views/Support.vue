<template>
  <div class="support-page">
    <div class="page-header">
      <h1 class="page-title">Support Requests</h1>
      <p class="page-subtitle">Manage customer and employee support conversations</p>
    </div>

    <div class="support-container">
      <!-- Support Conversations List -->
      <div class="conversations-sidebar">
        <div class="sidebar-header">
          <h3 class="sidebar-title">Support Conversations</h3>
          <div class="conversation-filters">
            <button 
              @click="activeFilter = 'all'"
              :class="{ 'active': activeFilter === 'all' }"
              class="filter-btn"
            >
              All ({{ supportConversations.length }})
            </button>
            <button 
              @click="activeFilter = 'unread'"
              :class="{ 'active': activeFilter === 'unread' }"
              class="filter-btn"
            >
              Unread ({{ unreadCount }})
            </button>
          </div>
        </div>

        <div class="conversations-list">
          <div 
            v-for="conversation in filteredConversations" 
            :key="conversation._id"
            @click="selectConversation(conversation)"
            class="conversation-item"
            :class="{ 
              'active': selectedConversation?._id === conversation._id,
              'unread': conversation.unreadCount > 0
            }"
          >
            <div class="conversation-avatar">
              <div class="avatar-circle">
                {{ getUserInitials(conversation.participants.find(p => p.role === 'member')?.user) }}
              </div>
            </div>
            
            <div class="conversation-info">
              <div class="conversation-name">
                {{ conversation.name }}
              </div>
              <div class="conversation-preview">
                {{ conversation.lastMessage?.content || 'No messages yet' }}
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
      </div>

      <!-- Chat Area -->
      <div class="chat-area">
        <div v-if="selectedConversation" class="chat-container">
          <!-- Chat Header -->
          <div class="chat-header">
            <div class="chat-header-info">
              <h3 class="chat-title">{{ selectedConversation.name }}</h3>
              <p class="chat-subtitle">
                {{ getParticipantNames(selectedConversation) }}
              </p>
            </div>
            <div class="chat-header-actions">
              <button @click="markAsRead" class="action-btn" title="Mark as read">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
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
                <div class="message-avatar">
                  {{ getUserInitials(message.sender) }}
                </div>
                
                <div class="message-content">
                  <div class="message-header">
                    <span class="message-sender">{{ getUserDisplayName(message.sender) }}</span>
                    <span class="message-time">{{ formatTime(message.createdAt) }}</span>
                  </div>
                  
                  <div class="message-text">
                    {{ message.content }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="message-input-container">
            <div class="message-input-wrapper">
              <textarea 
                v-model="newMessage"
                @keydown.enter.prevent="sendMessage"
                placeholder="Type your response..."
                class="message-input"
                rows="1"
                ref="messageInput"
              ></textarea>
            </div>
            
            <button 
              @click="sendMessage"
              :disabled="!newMessage.trim() || sendingMessage"
              class="send-btn"
            >
              <svg v-if="!sendingMessage" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
              <svg v-else class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
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
            <h3 class="no-conversation-title">Select a Support Conversation</h3>
            <p class="no-conversation-subtitle">
              Choose a conversation from the list to start responding to support requests.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useWebSocketAuthStore } from '../stores/websocketAuthStore'
import chatService from '../services/chatService'

const authStore = useWebSocketAuthStore()

// Reactive data
const supportConversations = ref([])
const selectedConversation = ref(null)
const messages = ref([])
const newMessage = ref('')
const loading = ref(false)
const sendingMessage = ref(false)
const activeFilter = ref('all')
const messagesContainer = ref(null)
const messageInput = ref(null)

// Computed
const currentUser = computed(() => authStore.user || null)

const filteredConversations = computed(() => {
  if (activeFilter.value === 'unread') {
    return supportConversations.value.filter(conv => conv.unreadCount > 0)
  }
  return supportConversations.value
})

const unreadCount = computed(() => {
  return supportConversations.value.filter(conv => conv.unreadCount > 0).length
})

// Methods
const loadSupportConversations = async () => {
  try {
    console.log('🔍 Loading support conversations...')
    const response = await chatService.getConversations()
    console.log('🔍 Support conversations response:', response)
    
    if (response.data.success && response.data.data) {
      supportConversations.value = response.data.data.filter(conv => conv.type === 'support')
    } else if (Array.isArray(response.data)) {
      supportConversations.value = response.data.filter(conv => conv.type === 'support')
    } else {
      supportConversations.value = []
    }
    
    console.log('🔍 Filtered support conversations:', supportConversations.value)
  } catch (error) {
    console.error('Failed to load support conversations:', error)
  }
}

const selectConversation = async (conversation) => {
  selectedConversation.value = conversation
  await loadMessages(conversation._id)
  scrollToBottom()
}

const loadMessages = async (conversationId) => {
  try {
    loading.value = true
    const response = await chatService.getMessages(conversationId)
    if (response.data.success && response.data.data) {
      messages.value = response.data.data
    } else if (Array.isArray(response.data)) {
      messages.value = response.data
    } else {
      messages.value = []
    }
  } catch (error) {
    console.error('Failed to load messages:', error)
  } finally {
    loading.value = false
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedConversation.value) return
  
  const messageContent = newMessage.value.trim()
  newMessage.value = ''
  
  try {
    sendingMessage.value = true
    
    // Add optimistic message
    const optimisticMessage = {
      _id: `temp_${Date.now()}`,
      content: messageContent,
      sender: currentUser.value,
      createdAt: new Date(),
      status: 'sending'
    }
    messages.value.push(optimisticMessage)
    scrollToBottom()
    
    // Send actual message
    const response = await chatService.sendTextMessage({
      conversationId: selectedConversation.value._id,
      content: messageContent
    })
    
    // Update optimistic message
    const messageIndex = messages.value.findIndex(m => m._id === optimisticMessage._id)
    if (messageIndex !== -1) {
      const responseData = response.data.success ? response.data.data : response.data
      messages.value[messageIndex] = {
        ...messages.value[messageIndex],
        ...responseData,
        status: 'sent'
      }
    }
  } catch (error) {
    console.error('Failed to send message:', error)
    newMessage.value = messageContent
  } finally {
    sendingMessage.value = false
  }
}

const markAsRead = async () => {
  if (!selectedConversation.value) return
  
  try {
    await chatService.markAsRead(selectedConversation.value._id)
    // Reload conversations to update unread counts
    await loadSupportConversations()
  } catch (error) {
    console.error('Failed to mark as read:', error)
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const getUserDisplayName = (user) => {
  if (!user) return 'Unknown User'
  return `${user.firstName} ${user.lastName}`.trim() || user.email
}

const getUserInitials = (user) => {
  if (!user) return '?'
  const name = getUserDisplayName(user)
  return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
}

const getParticipantNames = (conversation) => {
  if (!conversation || !conversation.participants) return ''
  const members = conversation.participants
    .filter(p => p.role === 'member')
    .map(p => getUserDisplayName(p.user))
  return members.join(', ')
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return date.toLocaleDateString()
}

onMounted(async () => {
  await loadSupportConversations()
})
</script>

<style scoped>
.support-page {
  height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
}

.page-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: #6b7280;
  margin: 0;
}

.support-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.conversations-sidebar {
  width: 350px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
}

.conversation-filters {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #f9fafb;
}

.filter-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f3f4f6;
}

.conversation-item:hover {
  background: #f9fafb;
}

.conversation-item.active {
  background: #eff6ff;
  border-right: 3px solid #3b82f6;
}

.conversation-item.unread {
  background: #fef3c7;
}

.conversation-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-name {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-preview {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  font-weight: 600;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}

.chat-header-info {
  flex: 1;
}

.chat-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.chat-subtitle {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.chat-header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f9fafb;
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
  align-items: flex-start;
}

.message-item.own-message {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
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
  color: #111827;
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
  line-height: 1.5;
}

.own-message .message-text {
  background: #3b82f6;
  color: white;
}

.message-input-container {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-top: 1px solid #e5e7eb;
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
  line-height: 1.5;
  transition: border-color 0.2s;
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
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  background: #2563eb;
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.no-conversation {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f9fafb;
}

.no-conversation-content {
  text-align: center;
  color: #6b7280;
}

.no-conversation-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 1rem 0 0.5rem 0;
}

.no-conversation-subtitle {
  color: #6b7280;
  margin: 0;
}
</style> 