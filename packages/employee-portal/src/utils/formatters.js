// Formatter utility functions

/**
 * Format time for display
 * @param {Date|string} timestamp - Timestamp to format
 * @param {boolean} showSeconds - Whether to show seconds
 * @returns {string} Formatted time string
 */
export function formatTime(timestamp, showSeconds = false) {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  // If it's today, show time
  if (diff < 24 * 60 * 60 * 1000 && date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: showSeconds ? '2-digit' : undefined
    })
  }
  
  // If it's yesterday, show "Yesterday"
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  
  // If it's this week, show day name
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString([], { weekday: 'short' })
  }
  
  // Otherwise show date
  return date.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric' 
  })
}

/**
 * Format date for display
 * @param {Date|string} timestamp - Timestamp to format
 * @returns {string} Formatted date string
 */
export function formatDate(timestamp) {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  // If it's today
  if (date.toDateString() === now.toDateString()) {
    return 'Today'
  }
  
  // If it's yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  
  // If it's this year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    })
  }
  
  // Otherwise show full date
  return date.toLocaleDateString([], { 
    year: 'numeric',
    month: 'short', 
    day: 'numeric' 
  })
}

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
 * Get user initials
 * @param {Object} user - User object
 * @returns {string} User initials
 */
export function getUserInitials(user) {
  if (!user) return '?'
  
  const firstName = user.firstName || ''
  const lastName = user.lastName || ''
  
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|string} timestamp - Timestamp to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)
  
  if (years > 0) {
    return `${years} year${years === 1 ? '' : 's'} ago`
  }
  
  if (months > 0) {
    return `${months} month${months === 1 ? '' : 's'} ago`
  }
  
  if (weeks > 0) {
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  }
  
  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} ago`
  }
  
  if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  }
  
  if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  }
  
  return 'Just now'
}

/**
 * Format duration in seconds to human readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export function formatDuration(seconds) {
  if (seconds < 60) {
    return `${seconds}s`
  }
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  return `${hours}h ${remainingMinutes}m`
}

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Format percentage
 * @param {number} value - Value to format (0-1)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, decimals = 1) {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) {
    return text
  }
  
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phone) {
  if (!phone) return ''
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '')
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  // Format as +X (XXX) XXX-XXXX
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  
  return phone
} 