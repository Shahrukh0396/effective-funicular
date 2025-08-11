import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/'

// Create axios instance with auth headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('employee_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const chatService = {
  // Get all conversations for the current user
  async getConversations() {
    try {
      const response = await api.get('api/chat/conversations')
      return response.data
    } catch (error) {
      console.error('Error fetching conversations:', error)
      throw error
    }
  },

  // Get default channels
  async getDefaultChannels() {
    try {
      const response = await api.get('api/chat/channels')
      return response.data
    } catch (error) {
      console.error('Error fetching channels:', error)
      throw error
    }
  },

  // Join a channel
  async joinChannel(conversationId) {
    try {
      const response = await api.post(`api/chat/conversations/${conversationId}/join`)
      return response.data
    } catch (error) {
      console.error('Error joining channel:', error)
      throw error
    }
  },

  // Add members to private channel
  async addChannelMembers(conversationId, userIds) {
    try {
      const response = await api.post(`api/chat/conversations/${conversationId}/members`, {
        userIds
      })
      return response.data
    } catch (error) {
      console.error('Error adding channel members:', error)
      throw error
    }
  },

  // Create or get support conversation
  async createSupportConversation(message = null) {
    try {
      console.log('🔍 Creating support conversation with message:', message)
      console.log('🔍 Auth token:', !!localStorage.getItem('employee_token'))
      
      const response = await api.post('api/chat/support', {
        message
      })
      console.log('🔍 Support conversation response:', response)
      return response.data
    } catch (error) {
      console.error('Error creating support conversation:', error)
      throw error
    }
  },

  // Get messages for a specific conversation
  async getMessages(conversationId) {
    try {
      const response = await api.get(`api/chat/conversations/${conversationId}/messages`)
      return response.data
    } catch (error) {
      console.error('Error fetching messages:', error)
      throw error
    }
  },

  // Send a text message
  async sendTextMessage({ conversationId, content }) {
    try {
      const response = await api.post(`api/chat/conversations/${conversationId}/messages`, {
        content,
        messageType: 'text'
      })
      return response
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  },

  // Send a file message
  async sendFileMessage(formData) {
    try {
      const response = await api.post('api/chat/messages/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response
    } catch (error) {
      console.error('Error sending file message:', error)
      throw error
    }
  },

  // Create a direct conversation
  async createDirectConversation({ participantId }) {
    try {
      const response = await api.post('api/chat/conversations', {
        type: 'direct',
        participantId
      })
      return response
    } catch (error) {
      console.error('Error creating direct conversation:', error)
      throw error
    }
  },

  // Create a group conversation
  async createGroupConversation({ name, participantIds }) {
    try {
      const response = await api.post('api/chat/conversations', {
        type: 'group',
        name,
        participantIds
      })
      return response
    } catch (error) {
      console.error('Error creating group conversation:', error)
      throw error
    }
  },

  // Create a channel
  async createChannel({ name, channelType, purpose, topic, isPublic = true, participantIds = [] }) {
    try {
      const response = await api.post('api/chat/conversations', {
        type: 'channel',
        name,
        channelType,
        purpose,
        topic,
        isPublic,
        participantIds
      })
      return response
    } catch (error) {
      console.error('Error creating channel:', error)
      throw error
    }
  },

  // Search messages
  async searchMessages(query, conversationId = null) {
    try {
      const params = { q: query }
      if (conversationId) {
        params.conversationId = conversationId
      }
      const response = await api.get('api/chat/search', { params })
      return response.data
    } catch (error) {
      console.error('Error searching messages:', error)
      throw error
    }
  },

  // Add reaction to message
  async addReaction(messageId, emoji) {
    try {
      const response = await api.post(`api/chat/messages/${messageId}/reactions`, {
        emoji
      })
      return response.data
    } catch (error) {
      console.error('Error adding reaction:', error)
      throw error
    }
  },

  // Edit message
  async editMessage(messageId, content) {
    try {
      const response = await api.put(`api/chat/messages/${messageId}`, {
        content
      })
      return response.data
    } catch (error) {
      console.error('Error editing message:', error)
      throw error
    }
  },

  // Delete message
  async deleteMessage(messageId) {
    try {
      const response = await api.delete(`api/chat/messages/${messageId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting message:', error)
      throw error
    }
  },

  // Mark messages as read
  async markAsRead(conversationId) {
    try {
      const response = await api.put(`api/chat/conversations/${conversationId}/read`)
      return response
    } catch (error) {
      console.error('Error marking messages as read:', error)
      throw error
    }
  },

  // Get available users for new conversations
  async getAvailableUsers() {
    try {
      const response = await api.get('api/chat/users')
      return response.data
    } catch (error) {
      console.error('Error fetching available users:', error)
      throw error
    }
  },

  // Leave a group conversation
  async leaveConversation(conversationId) {
    try {
      const response = await api.delete(`api/chat/conversations/${conversationId}/leave`)
      return response
    } catch (error) {
      console.error('Error leaving conversation:', error)
      throw error
    }
  },

  // Get conversation details
  async getConversationDetails(conversationId) {
    try {
      const response = await api.get(`api/chat/conversations/${conversationId}`)
      return response
    } catch (error) {
      console.error('Error fetching conversation details:', error)
      throw error
    }
  },

  // Get unread message count
  async getUnreadCount() {
    try {
      const response = await api.get('api/chat/unread-count')
      return response
    } catch (error) {
      console.error('Error fetching unread count:', error)
      throw error
    }
  }
}

export default chatService 