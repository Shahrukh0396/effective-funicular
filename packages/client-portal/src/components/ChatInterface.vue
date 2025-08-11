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
        <!-- Direct Messages Section -->
        <div class="conversation-section">
          <div class="section-header">
            <h4 class="section-title">Direct Messages</h4>
            <button @click="showNewConversationModal = true" class="add-btn">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
          </div>
          
          <div class="conversation-items">
            <div 
              v-for="conversation in directMessages" 
              :key="conversation._id"
              @click="selectConversation(conversation)"
              class="conversation-item"
              :class="{ 'active': selectedConversation?._id === conversation._id }"
            >
              <div class="conversation-avatar">
                <div class="avatar-circle small">
                  {{ getConversationInitials(conversation) }}
                </div>
              </div>
              
              <div class="conversation-info">
                <div class="conversation-name">
                  {{ getConversationName(conversation) }}
                </div>
                <div class="conversation-preview">
                  {{ conversation.lastMessage?.content || 'No messages yet' }}
                </div>
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

        <!-- Support Section -->
        <div class="conversation-section" v-if="supportConversations.length > 0">
          <div class="section-header">
            <h4 class="section-title">Support</h4>
          </div>
          
          <div class="conversation-items">
            <div 
              v-for="conversation in supportConversations" 
              :key="conversation._id"
              @click="selectConversation(conversation)"
              class="conversation-item"
              :class="{ 'active': selectedConversation?._id === conversation._id }"
            >
              <div class="conversation-avatar">
                <div class="avatar-circle small support-avatar">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                </div>
              </div>
              
              <div class="conversation-info">
                <div class="conversation-name">
                  {{ conversation.name }}
                </div>
                <div class="conversation-preview">
                  {{ conversation.lastMessage?.content || 'No messages yet' }}
                </div>
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

        <!-- Channels Section -->
        <div class="conversation-section">
          <div class="section-header">
            <h4 class="section-title">Channels</h4>
            <button @click="showCreateChannelModal = true" class="add-btn">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
          </div>
          
          <div class="conversation-items">
            <div 
              v-for="conversation in channels" 
              :key="conversation._id"
              @click="selectConversation(conversation)"
              class="conversation-item"
              :class="{ 'active': selectedConversation?._id === conversation._id }"
            >
              <div class="conversation-avatar">
                <div class="avatar-circle small channel-avatar">
                  #
                </div>
              </div>
              
              <div class="conversation-info">
                <div class="conversation-name">
                  {{ conversation.name }}
                  <span v-if="!conversation.isPublic" class="private-indicator" title="Private channel">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </span>
                </div>
                <div class="conversation-preview">
                  {{ conversation.lastMessage?.content || 'No messages yet' }}
                </div>
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
          <MessageItem
            v-for="message in messages" 
            :key="message._id"
            :message="message"
            :current-user="currentUser"
            @reply="handleReply"
            @edit="handleEdit"
            @delete="handleDelete"
            @reaction-toggle="handleReactionToggle"
            @copy-link="handleCopyLink"
          />
          
          <!-- Typing Indicator -->
          <div v-if="typingUsers.size > 0" class="typing-indicator">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="typing-text">
              {{ Array.from(typingUsers).length }} user{{ Array.from(typingUsers).length > 1 ? 's' : '' }} typing...
            </span>
          </div>
        </div>
      </div>

      <!-- Message Input -->
      <div class="message-input-container">
        <div class="input-actions">
          <div class="emoji-button-container">
            <button @click="showEmojiPicker = !showEmojiPicker" class="action-btn" :class="{ 'active': showEmojiPicker }" title="Add emoji">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </button>
            
            <!-- Emoji Picker -->
            <ReactionPicker
              v-if="showEmojiPicker"
              @emoji-select="insertEmoji"
              @close="showEmojiPicker = false"
              class="emoji-picker"
            />
          </div>
          
          <button @click="showFileUpload = true" class="action-btn" title="Attach file">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
            </svg>
          </button>
        </div>
        
        <div class="message-input-wrapper">
          <textarea 
            v-model="newMessage"
            @keydown.enter.prevent="sendMessage"
            @input="handleTypingStart"
            @blur="handleTypingStop"
            placeholder="Type your message..."
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
              <option 
                v-for="user in availableUsers" 
                :key="user._id" 
                :value="user._id"
              >
                {{ getUserDisplayName(user) }}
              </option>
            </select>
          </div>
          
          <div v-if="newConversation.type === 'group'" class="form-group">
            <label class="form-label">Group Name</label>
            <input 
              v-model="newConversation.name" 
              type="text" 
              class="form-input"
              placeholder="Enter group name"
            />
          </div>
          
          <div v-if="newConversation.type === 'group'" class="form-group">
            <label class="form-label">Select Participants</label>
            <div class="participants-list">
              <div 
                v-for="user in availableUsers" 
                :key="user._id"
                @click="toggleParticipant(user._id)"
                class="participant-item"
                :class="{ 'selected': newConversation.participantIds.includes(user._id) }"
              >
                <span>{{ getUserDisplayName(user) }}</span>
                <span v-if="newConversation.participantIds.includes(user._id)" class="check-mark">
                  ✓
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showNewConversationModal = false" class="btn-secondary">Cancel</button>
          <button @click="createConversation" class="btn-primary">Create Conversation</button>
        </div>
      </div>
    </div>

    <!-- Create Channel Modal -->
    <div v-if="showCreateChannelModal" class="modal-overlay" @click="showCreateChannelModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Create Channel</h3>
          <button @click="showCreateChannelModal = false" class="modal-close">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Channel Name</label>
            <input 
              v-model="newChannel.name" 
              type="text" 
              class="form-input"
              placeholder="e.g., general, random, project-team"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Channel Type</label>
            <select v-model="newChannel.channelType" class="form-select">
              <option value="custom">Custom Channel</option>
              <option value="project">Project Channel</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Purpose (Optional)</label>
            <textarea 
              v-model="newChannel.purpose" 
              class="form-input"
              placeholder="What is this channel for?"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">Topic (Optional)</label>
            <input 
              v-model="newChannel.topic" 
              type="text" 
              class="form-input"
              placeholder="Current topic for this channel"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Channel Visibility</label>
            <div class="visibility-options">
              <label class="visibility-option">
                <input 
                  type="radio" 
                  v-model="newChannel.isPublic" 
                  :value="true"
                  class="form-radio"
                />
                <div class="option-content">
                  <div class="option-title">Public Channel</div>
                  <div class="option-description">Anyone in the workspace can see and join this channel</div>
                </div>
              </label>
              
              <label class="visibility-option">
                <input 
                  type="radio" 
                  v-model="newChannel.isPublic" 
                  :value="false"
                  class="form-radio"
                />
                <div class="option-content">
                  <div class="option-title">Private Channel</div>
                  <div class="option-description">Only invited members can see and join this channel</div>
                </div>
              </label>
            </div>
          </div>
          
          <div v-if="!newChannel.isPublic" class="form-group">
            <label class="form-label">Invite Members</label>
            <div class="member-selection">
              <div 
                v-for="user in availableUsers" 
                :key="user._id"
                class="member-option"
                :class="{ 'selected': newChannel.participantIds.includes(user._id) }"
                @click="toggleChannelMember(user._id)"
              >
                <div class="member-avatar">
                  {{ getUserDisplayName(user).charAt(0) }}
                </div>
                <div class="member-info">
                  <div class="member-name">{{ getUserDisplayName(user) }}</div>
                  <div class="member-email">{{ user.email }}</div>
                </div>
                <div class="member-checkbox">
                  <svg v-if="newChannel.participantIds.includes(user._id)" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showCreateChannelModal = false" class="btn-secondary">Cancel</button>
          <button @click="createChannel" class="btn-primary">Create Channel</button>
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
          <button @click="showFileUpload = false" class="btn-secondary" :disabled="uploadingFiles">Cancel</button>
          <button @click="uploadFiles" :disabled="selectedFiles.length === 0 || uploadingFiles" class="btn-primary">
            <span v-if="uploadingFiles" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
            <span v-else>Upload Files</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import chatService from '../services/chatService'
import MessageItem from './chat/MessageItem.vue'
import ReactionPicker from './chat/ReactionPicker.vue'

const authStore = useAuthStore()

// Reactive data
const conversations = ref([])
const selectedConversation = ref(null)
const messages = ref([])
const newMessage = ref('')
const loading = ref(false)
const sendingMessage = ref(false)
const sidebarCollapsed = ref(false)
const showNewConversationModal = ref(false)
const showCreateChannelModal = ref(false)
const showFileUpload = ref(false)
const selectedFiles = ref([])
const availableUsers = ref([])
const typingUsers = ref(new Set())
const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const showEmojiPicker = ref(false)
const uploadingFiles = ref(false)

// Form data for new conversation
const newConversation = ref({
  type: 'direct',
  name: '',
  participantId: '',
  participantIds: []
})

// Form data for new channel
const newChannel = ref({
  name: '',
  channelType: 'custom',
  purpose: '',
  topic: '',
  isPublic: true,
  participantIds: []
})

// Socket connection
const socket = ref(null)
const messageInput = ref(null)

// Computed
const currentUser = authStore.user

const directMessages = computed(() => {
  return conversations.value.filter(conv => conv.type === 'direct')
})

const channels = computed(() => {
  return conversations.value.filter(conv => conv.type === 'channel')
})

const supportConversations = computed(() => {
  return conversations.value.filter(conv => conv.type === 'support')
})

// Methods
const loadConversations = async () => {
  try {
    const response = await chatService.getConversations()
    console.log('🔍 Frontend - Conversations response:', response)
    
    if (response.success && response.data) {
      conversations.value = Array.isArray(response.data) ? response.data : []
    } else if (Array.isArray(response)) {
      conversations.value = response
    } else {
      conversations.value = []
    }
  } catch (error) {
    console.error('Failed to load conversations:', error)
    conversations.value = []
  }
}

const loadAvailableUsers = async () => {
  try {
    const response = await chatService.getAvailableUsers()
    console.log('🔍 Frontend - Available users response:', response)
    
    // Handle different response structures
    if (response.success && response.data) {
      availableUsers.value = Array.isArray(response.data) ? response.data : []
    } else if (Array.isArray(response)) {
      availableUsers.value = response
    } else {
      availableUsers.value = []
    }
    
    console.log('🔍 Frontend - Available users data:', availableUsers.value.map(u => ({
      _id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      displayName: getUserDisplayName(u)
    })))
  } catch (error) {
    console.error('Failed to load available users:', error)
    availableUsers.value = []
  }
}

const loadMessages = async (conversationId) => {
  if (!conversationId) return
  
  loading.value = true
  try {
    const response = await chatService.getMessages(conversationId)
    console.log('🔍 Frontend - Messages response:', response)
    
    if (response.success && response.data) {
      messages.value = Array.isArray(response.data) ? response.data : []
    } else if (Array.isArray(response)) {
      messages.value = response
    } else {
      messages.value = []
    }
    
    console.log('🔍 Frontend - Loaded messages:', messages.value.map(m => ({
      _id: m._id,
      content: m.content,
      createdAt: m.createdAt,
      sender: m.sender?.firstName || 'Unknown'
    })))
    
    scrollToBottom()
  } catch (error) {
    console.error('Failed to load messages:', error)
    messages.value = []
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
  
  const messageContent = newMessage.value
  newMessage.value = ''
  sendingMessage.value = true
  
  try {
    // Add optimistic message to UI
    const optimisticMessage = {
      _id: `temp_${Date.now()}`,
      content: messageContent,
      sender: currentUser,
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
    
    // Update optimistic message with real data
    const messageIndex = messages.value.findIndex(m => m._id === optimisticMessage._id)
    if (messageIndex !== -1) {
      messages.value[messageIndex] = {
        ...messages.value[messageIndex],
        ...response.data,
        status: 'sent'
      }
    }
    
    // Stop typing indicator
    if (socket.value) {
      socket.value.emit('typing:stop', {
        conversationId: selectedConversation.value._id,
        userId: currentUser._id
      })
    }
  } catch (error) {
    console.error('Failed to send message:', error)
    // Remove optimistic message on error
    messages.value = messages.value.filter(m => m._id !== `temp_${Date.now()}`)
    // Restore message content
    newMessage.value = messageContent
  } finally {
    sendingMessage.value = false
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

const createChannel = async () => {
  try {
    await chatService.createChannel({
      name: newChannel.value.name,
      channelType: newChannel.value.channelType,
      purpose: newChannel.value.purpose,
      topic: newChannel.value.topic,
      isPublic: newChannel.value.isPublic,
      participantIds: newChannel.value.participantIds
    })
    
    showCreateChannelModal.value = false
    loadConversations()
    resetNewChannel()
  } catch (error) {
    console.error('Failed to create channel:', error)
  }
}

const toggleChannelMember = (userId) => {
  const index = newChannel.value.participantIds.indexOf(userId)
  if (index > -1) {
    newChannel.value.participantIds.splice(index, 1)
  } else {
    newChannel.value.participantIds.push(userId)
  }
}

const toggleParticipant = (userId) => {
  const index = newConversation.value.participantIds.indexOf(userId)
  if (index > -1) {
    newConversation.value.participantIds.splice(index, 1)
  } else {
    newConversation.value.participantIds.push(userId)
  }
}

const resetNewChannel = () => {
  newChannel.value = {
    name: '',
    channelType: 'custom',
    purpose: '',
    topic: '',
    isPublic: true,
    participantIds: []
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
  
  uploadingFiles.value = true
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
  } finally {
    uploadingFiles.value = false
  }
}

const joinConversation = (conversationId) => {
  if (socket.value) {
    socket.value.emit('joinConversation', conversationId)
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

const getConversationName = (conversation) => {
  if (conversation.name) {
    return conversation.name
  }
  
  // For direct messages, show the other participant's name
  if (conversation.type === 'direct' && conversation.participants) {
    const otherParticipant = conversation.participants.find(p => 
      p.user._id !== currentUser._id
    )
    if (otherParticipant) {
      return getUserDisplayName(otherParticipant.user)
    }
  }
  
  return 'Direct Message'
}

const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
}

const getInitialsFromSender = (sender) => {
  if (!sender) return '?'
  
  // Handle case where sender is a string (name)
  if (typeof sender === 'string') {
    return sender.charAt(0).toUpperCase()
  }
  
  // Handle case where sender is an object
  const firstName = sender.firstName || ''
  const lastName = sender.lastName || ''
  return getInitials(firstName, lastName)
}

const isOwnMessage = (message) => {
  if (!message.sender) return false
  
  // Handle case where sender is a string (name)
  if (typeof message.sender === 'string') {
    return message.sender === currentUser.firstName || message.sender === currentUser.lastName
  }
  
  // Handle case where sender is an object
  if (message.sender._id) {
    return message.sender._id === currentUser._id
  }
  
  return false
}

const getUserDisplayName = (user) => {
  if (!user) return 'Unknown User'
  
  // Handle case where user is a string (name)
  if (typeof user === 'string') {
    return user
  }
  
  // Handle case where user is an object
  const firstName = user.firstName || ''
  const lastName = user.lastName || ''
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  } else if (firstName) {
    return firstName
  } else if (lastName) {
    return lastName
  } else if (user.email) {
    return user.email.split('@')[0]
  } else {
    return 'Unknown User'
  }
}

const getParticipantNames = (conversation) => {
  if (conversation.participants) {
    return conversation.participants
      .map(p => getUserDisplayName(p.user))
      .join(', ')
  }
  return ''
}

const formatTime = (timestamp) => {
  console.log('🔍 formatTime - Input timestamp:', timestamp)
  
  if (!timestamp) {
    console.log('🔍 formatTime - No timestamp provided')
    return ''
  }
  
  const date = new Date(timestamp)
  console.log('🔍 formatTime - Parsed date:', date)
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.log('🔍 formatTime - Invalid date')
    return ''
  }
  
  const now = new Date()
  const diff = now - date
  
  if (diff < 24 * 60 * 60 * 1000) {
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    console.log('🔍 formatTime - Today, returning time:', timeString)
    return timeString
  } else {
    const dateString = date.toLocaleDateString()
    console.log('🔍 formatTime - Different day, returning date:', dateString)
    return dateString
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
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/'
    const token = localStorage.getItem('token')
    
    console.log('🔌 Socket.IO - Setting up connection to:', API_BASE_URL)
    console.log('🔌 Socket.IO - Token present:', !!token)
    
    if (!token) {
      console.log('🔌 Socket.IO - No auth token found')
      return
    }
    
    // Import socket.io-client dynamically
    import('socket.io-client').then(({ io }) => {
      console.log('🔌 Socket.IO - Client library loaded')
      
      socket.value = io(API_BASE_URL, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        forceNew: true
      })
      
      socket.value.on('connect', () => {
        console.log('🔌 Socket.IO connected:', socket.value.id)
        
        // Join user's room
        if (authStore.user?._id) {
          socket.value.emit('join', authStore.user._id)
          console.log('🔌 Socket.IO - Joined user room:', authStore.user._id)
        }
      })
      
      socket.value.on('disconnect', () => {
        console.log('🔌 Socket.IO disconnected')
      })
      
      socket.value.on('message:received', (data) => {
        console.log('🔌 Socket.IO - Message received:', data)
        handleNewMessage(data)
      })
      
      socket.value.on('message:sent', (data) => {
        console.log('🔌 Socket.IO - Message sent:', data)
        handleMessageSent(data)
      })
      
      socket.value.on('typing:start', (data) => {
        console.log('🔌 Socket.IO - User typing:', data)
        if (data.conversationId === selectedConversation.value?._id) {
          typingUsers.value.add(data.userId)
        }
      })
      
      socket.value.on('typing:stop', (data) => {
        console.log('🔌 Socket.IO - User stopped typing:', data)
        if (data.conversationId === selectedConversation.value?._id) {
          typingUsers.value.delete(data.userId)
        }
      })
      
      socket.value.on('connect_error', (error) => {
        console.error('🔌 Socket.IO connection error:', error)
      })
      
      socket.value.on('error', (error) => {
        console.error('🔌 Socket.IO error:', error)
      })
    }).catch(error => {
      console.error('🔌 Socket.IO import error:', error)
    })
  } catch (error) {
    console.error('🔌 Socket.IO setup error:', error)
  }
}

const handleNewMessage = (message) => {
  if (message.conversationId === selectedConversation.value?._id) {
    messages.value.push(message.message)
    scrollToBottom()
  }
  loadConversations() // Refresh conversation list
}

const handleMessageSent = (data) => {
  // Update message status to sent
  const messageIndex = messages.value.findIndex(m => m._id === data.messageId)
  if (messageIndex !== -1) {
    messages.value[messageIndex].status = 'sent'
  }
}

const handleTypingStart = () => {
  if (socket.value && selectedConversation.value) {
    socket.value.emit('typing:start', {
      conversationId: selectedConversation.value._id,
      userId: currentUser._id
    })
  }
}

const handleTypingStop = () => {
  if (socket.value && selectedConversation.value) {
    socket.value.emit('typing:stop', {
      conversationId: selectedConversation.value._id,
      userId: currentUser._id
    })
  }
}

// Message action handlers
const handleReply = (message) => {
  newMessage.value = `@${getUserDisplayName(message.sender)} `
  messageInput.value?.focus()
}

const handleEdit = (message) => {
  newMessage.value = message.content
  messageInput.value?.focus()
}

const handleDelete = async (messageId) => {
  try {
    await chatService.deleteMessage(messageId)
    const index = messages.value.findIndex(m => m._id === messageId)
    if (index !== -1) {
      messages.value.splice(index, 1)
    }
  } catch (error) {
    console.error('Failed to delete message:', error)
  }
}

const handleReactionToggle = async (messageId, emoji) => {
  try {
    await chatService.addReaction(messageId, emoji)
  } catch (error) {
    console.error('Failed to toggle reaction:', error)
  }
}

const handleCopyLink = (link) => {
  navigator.clipboard.writeText(link)
  // You could add a toast notification here
}

const insertEmoji = (emoji) => {
  newMessage.value += emoji
  showEmojiPicker.value = false
  messageInput.value?.focus()
}

// Close emoji picker when clicking outside
const handleClickOutside = (event) => {
  if (showEmojiPicker.value && !event.target.closest('.emoji-button-container')) {
    showEmojiPicker.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await loadConversations()
  await loadAvailableUsers()
  setupSocket()
  
  // Check for conversation parameter in URL
  const urlParams = new URLSearchParams(window.location.search)
  const conversationId = urlParams.get('conversation')
  if (conversationId) {
    // Find the conversation in the loaded conversations
    const conversation = conversations.value.find(c => c._id === conversationId)
    if (conversation) {
      selectConversation(conversation)
    }
  }
  
  // Add click outside listener
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect()
  }
  
  // Remove click outside listener
  document.removeEventListener('click', handleClickOutside)
})
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

.conversation-section {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.add-btn {
  padding: 0.5rem;
  border-radius: 0.375rem;
  color: #6b7280;
  transition: color 0.2s;
}

.add-btn:hover {
  color: #374151;
}

.conversation-items {
  /* No specific styles for conversation-items, they are handled by conversation-item */
}

.conversation-item {
  padding: 0.75rem 0;
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

.channel-avatar {
  background: #6b7280;
}

.support-avatar {
  background: #10b981;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
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

.action-btn.active {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
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

.message-item.message-sending {
  opacity: 0.7;
}

.message-item.message-sending .message-text {
  background: #9ca3af;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.typing-dots {
  display: flex;
  gap: 0.25rem;
}

.typing-dots span {
  width: 0.5rem;
  height: 0.5rem;
  background: #9ca3af;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.typing-text {
  font-style: italic;
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

.emoji-button-container {
  position: relative;
}

.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  z-index: 50;
  margin-bottom: 0.5rem;
}

.private-indicator {
  display: inline-flex;
  align-items: center;
  margin-left: 0.25rem;
  color: #6b7280;
}

.visibility-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.visibility-option {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.visibility-option:hover {
  border-color: #3b82f6;
  background-color: #f8fafc;
}

.visibility-option input[type="radio"] {
  margin-top: 0.125rem;
}

.option-content {
  flex: 1;
}

.option-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.option-description {
  font-size: 0.875rem;
  color: #6b7280;
}

.member-selection {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.member-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.member-option:hover {
  background-color: #f9fafb;
}

.member-option.selected {
  background-color: #eff6ff;
}

.member-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 500;
  color: #374151;
}

.member-email {
  font-size: 0.75rem;
  color: #6b7280;
}

.member-checkbox {
  color: #3b82f6;
}
</style> 