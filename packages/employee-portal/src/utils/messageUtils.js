// Message formatting and utility functions

/**
 * Parse mentions from message content
 * @param {string} content - Message content
 * @param {Array} users - Available users for mention matching
 * @returns {Array} Array of mention objects
 */
export function parseMentions(content, users = []) {
  const mentions = []
  
  // Match @username patterns
  const mentionRegex = /@(\w+)/g
  let match
  
  while ((match = mentionRegex.exec(content)) !== null) {
    const username = match[1]
    const user = users.find(u => 
      u.displayName?.toLowerCase() === username.toLowerCase() ||
      u.firstName?.toLowerCase() === username.toLowerCase() ||
      u.lastName?.toLowerCase() === username.toLowerCase()
    )
    
    if (user) {
      mentions.push({
        type: 'user',
        id: user._id,
        username: username,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        displayName: getUserDisplayName(user)
      })
    }
  }
  
  // Match @everyone and @channel
  const everyoneRegex = /@everyone/g
  while ((match = everyoneRegex.exec(content)) !== null) {
    mentions.push({
      type: 'everyone',
      startIndex: match.index,
      endIndex: match.index + match[0].length
    })
  }
  
  const channelRegex = /@channel/g
  while ((match = channelRegex.exec(content)) !== null) {
    mentions.push({
      type: 'channel',
      startIndex: match.index,
      endIndex: match.index + match[0].length
    })
  }
  
  return mentions
}

/**
 * Format message content with HTML markup
 * @param {string} content - Raw message content
 * @param {Array} users - Available users for mention formatting
 * @returns {string} Formatted HTML content
 */
export function formatMessageContent(content, users = []) {
  if (!content) return ''
  
  let formatted = content
  
  // Parse mentions
  const mentions = parseMentions(content, users)
  
  // Apply mentions formatting (in reverse order to maintain indices)
  mentions.reverse().forEach(mention => {
    const before = formatted.substring(0, mention.startIndex)
    const after = formatted.substring(mention.endIndex)
    
    if (mention.type === 'user') {
      formatted = `${before}<span class="mention" data-user-id="${mention.id}">@${mention.displayName}</span>${after}`
    } else if (mention.type === 'everyone') {
      formatted = `${before}<span class="mention mention-everyone">@everyone</span>${after}`
    } else if (mention.type === 'channel') {
      formatted = `${before}<span class="mention mention-channel">@channel</span>${after}`
    }
  })
  
  // Format code blocks (```code```)
  formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre class="code-block">$1</pre>')
  
  // Format inline code (`code`)
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="code">$1</code>')
  
  // Format bold text (**text**)
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  
  // Format italic text (*text*)
  formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  
  // Format strikethrough (~~text~~)
  formatted = formatted.replace(/~~([^~]+)~~/g, '<del>$1</del>')
  
  // Convert URLs to links
  formatted = formatted.replace(
    /(https?:\/\/[^\s]+)/g, 
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="link">$1</a>'
  )
  
  // Convert line breaks to <br> tags
  formatted = formatted.replace(/\n/g, '<br>')
  
  return formatted
}

/**
 * Get user display name
 * @param {Object} user - User object
 * @returns {string} Display name
 */
export function getUserDisplayName(user) {
  if (!user) return 'Unknown User'
  
  if (user.displayName) {
    return user.displayName
  }
  
  const firstName = user.firstName || ''
  const lastName = user.lastName || ''
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  }
  
  return firstName || lastName || user.email || 'Unknown User'
}

/**
 * Check if content contains mentions
 * @param {string} content - Message content
 * @returns {boolean} True if content has mentions
 */
export function hasMentions(content) {
  return /@(\w+|everyone|channel)/.test(content)
}

/**
 * Extract mentioned user IDs from content
 * @param {string} content - Message content
 * @param {Array} users - Available users
 * @returns {Array} Array of user IDs
 */
export function extractMentionedUserIds(content, users) {
  const mentions = parseMentions(content, users)
  return mentions
    .filter(mention => mention.type === 'user')
    .map(mention => mention.id)
}

/**
 * Format message preview (truncated content)
 * @param {string} content - Message content
 * @param {number} maxLength - Maximum length
 * @returns {string} Formatted preview
 */
export function formatMessagePreview(content, maxLength = 100) {
  if (!content) return ''
  
  // Remove formatting for preview
  let preview = content
    .replace(/```[\s\S]*?```/g, '[code]') // Replace code blocks
    .replace(/`[^`]+`/g, '[code]') // Replace inline code
    .replace(/\*\*[^*]+\*\*/g, '') // Remove bold
    .replace(/\*[^*]+\*/g, '') // Remove italic
    .replace(/~~[^~]+~~/g, '') // Remove strikethrough
    .replace(/@(\w+|everyone|channel)/g, '') // Remove mentions
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .trim()
  
  if (preview.length > maxLength) {
    preview = preview.substring(0, maxLength - 3) + '...'
  }
  
  return preview
}

/**
 * Check if message is a system message
 * @param {Object} message - Message object
 * @returns {boolean} True if system message
 */
export function isSystemMessage(message) {
  return message.messageType === 'system' || message.sender?.role === 'system'
}

/**
 * Get message status text
 * @param {string} status - Message status
 * @returns {string} Status text
 */
export function getMessageStatusText(status) {
  switch (status) {
    case 'sending':
      return 'Sending...'
    case 'sent':
      return 'Sent'
    case 'delivered':
      return 'Delivered'
    case 'read':
      return 'Read'
    default:
      return 'Unknown'
  }
}

/**
 * Check if message can be edited
 * @param {Object} message - Message object
 * @param {Object} currentUser - Current user
 * @returns {boolean} True if editable
 */
export function canEditMessage(message, currentUser) {
  if (!message || !currentUser) return false
  
  // System messages cannot be edited
  if (isSystemMessage(message)) return false
  
  // Only sender can edit their own messages
  if (message.sender._id !== currentUser._id) return false
  
  // Check if message is too old (e.g., 15 minutes)
  const editWindow = 15 * 60 * 1000 // 15 minutes in milliseconds
  const messageAge = Date.now() - new Date(message.createdAt).getTime()
  
  return messageAge < editWindow
}

/**
 * Check if message can be deleted
 * @param {Object} message - Message object
 * @param {Object} currentUser - Current user
 * @returns {boolean} True if deletable
 */
export function canDeleteMessage(message, currentUser) {
  if (!message || !currentUser) return false
  
  // System messages cannot be deleted
  if (isSystemMessage(message)) return false
  
  // Sender can delete their own messages
  if (message.sender._id === currentUser._id) return true
  
  // Admins can delete any message
  if (currentUser.role === 'admin' || currentUser.role === 'owner') return true
  
  return false
} 