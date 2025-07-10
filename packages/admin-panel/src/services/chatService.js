import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Create axios instance with auth headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const chatService = {
  // Get all conversations for the current user
  async getConversations() {
    try {
      const response = await api.get('/chat/conversations')
      return response
    } catch (error) {
      console.error('Error fetching conversations:', error)
      throw error
    }
  },

  // Get messages for a specific conversation
  async getMessages(conversationId) {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`)
      return response
    } catch (error) {
      console.error('Error fetching messages:', error)
      throw error
    }
  },

  // Send a text message
  async sendTextMessage({ conversationId, content }) {
    try {
      const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
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
      const response = await api.post('/chat/messages/file', formData, {
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
      const response = await api.post('/chat/conversations', {
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
      const response = await api.post('/chat/conversations', {
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

  // Mark messages as read
  async markAsRead(conversationId) {
    try {
      const response = await api.put(`/chat/conversations/${conversationId}/read`)
      return response
    } catch (error) {
      console.error('Error marking messages as read:', error)
      throw error
    }
  },

  // Delete a message
  async deleteMessage(messageId) {
    try {
      const response = await api.delete(`/chat/messages/${messageId}`)
      return response
    } catch (error) {
      console.error('Error deleting message:', error)
      throw error
    }
  },

  // Edit a message
  async editMessage(messageId, content) {
    try {
      const response = await api.put(`/chat/messages/${messageId}`, {
        content
      })
      return response
    } catch (error) {
      console.error('Error editing message:', error)
      throw error
    }
  },

  // Get available users for new conversations
  async getAvailableUsers() {
    try {
      const response = await api.get('/chat/users')
      return response
    } catch (error) {
      console.error('Error fetching available users:', error)
      throw error
    }
  },

  // Leave a group conversation
  async leaveConversation(conversationId) {
    try {
      const response = await api.delete(`/chat/conversations/${conversationId}/leave`)
      return response
    } catch (error) {
      console.error('Error leaving conversation:', error)
      throw error
    }
  },

  // Get conversation details
  async getConversationDetails(conversationId) {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}`)
      return response
    } catch (error) {
      console.error('Error fetching conversation details:', error)
      throw error
    }
  },

  // Search conversations
  async searchConversations(query) {
    try {
      const response = await api.get('/chat/conversations/search', {
        params: { q: query }
      })
      return response
    } catch (error) {
      console.error('Error searching conversations:', error)
      throw error
    }
  },

  // Get unread message count
  async getUnreadCount() {
    try {
      const response = await api.get('/chat/unread-count')
      return response
    } catch (error) {
      console.error('Error fetching unread count:', error)
      throw error
    }
  },

  // Admin-specific methods
  // Get all conversations (admin can see all)
  async getAllConversations() {
    try {
      const response = await api.get('/admin/chat/conversations')
      return response
    } catch (error) {
      console.error('Error fetching all conversations:', error)
      throw error
    }
  },

  // Get conversation analytics
  async getConversationAnalytics() {
    try {
      const response = await api.get('/admin/chat/analytics')
      return response
    } catch (error) {
      console.error('Error fetching chat analytics:', error)
      throw error
    }
  },

  // Moderate a message
  async moderateMessage(messageId, action) {
    try {
      const response = await api.put(`/admin/chat/messages/${messageId}/moderate`, {
        action
      })
      return response
    } catch (error) {
      console.error('Error moderating message:', error)
      throw error
    }
  },

  // Ban user from chat
  async banUserFromChat(userId, reason) {
    try {
      const response = await api.post('/admin/chat/users/ban', {
        userId,
        reason
      })
      return response
    } catch (error) {
      console.error('Error banning user from chat:', error)
      throw error
    }
  },

  // Unban user from chat
  async unbanUserFromChat(userId) {
    try {
      const response = await api.post('/admin/chat/users/unban', {
        userId
      })
      return response
    } catch (error) {
      console.error('Error unbanning user from chat:', error)
      throw error
    }
  },

  // Get chat system status
  async getChatSystemStatus() {
    try {
      const response = await api.get('/admin/chat/system-status')
      return response
    } catch (error) {
      console.error('Error fetching chat system status:', error)
      throw error
    }
  }
}

export default chatService 