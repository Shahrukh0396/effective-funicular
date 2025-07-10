const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  stripePaymentIntentId: {
    type: String,
    unique: true,
    sparse: true
  },
  stripeInvoiceId: {
    type: String,
    unique: true,
    sparse: true
  },
  transactionNumber: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd',
    enum: ['usd', 'eur', 'gbp']
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'canceled', 'refunded'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['payment', 'refund', 'chargeback', 'subscription'],
    default: 'payment'
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['card', 'bank_transfer', 'paypal'],
      default: 'card'
    },
    last4: String,
    brand: String,
    expMonth: Number,
    expYear: Number
  },
  failureReason: {
    code: String,
    message: String
  },
  metadata: {
    type: Map,
    of: String
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true
})

// Generate transaction number before saving
transactionSchema.pre('save', async function(next) {
  if (this.isNew && !this.transactionNumber) {
    const count = await this.constructor.countDocuments()
    this.transactionNumber = `TXN-${String(count + 1).padStart(8, '0')}`
  }
  next()
})

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency.toUpperCase()
  }).format(this.amount)
})

// Virtual for status badge
transactionSchema.virtual('statusBadge').get(function() {
  const statusClasses = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    canceled: 'bg-gray-100 text-gray-800',
    refunded: 'bg-purple-100 text-purple-800'
  }
  return statusClasses[this.status] || 'bg-gray-100 text-gray-800'
})

// Virtual for type badge
transactionSchema.virtual('typeBadge').get(function() {
  const typeClasses = {
    payment: 'bg-blue-100 text-blue-800',
    refund: 'bg-green-100 text-green-800',
    chargeback: 'bg-red-100 text-red-800',
    subscription: 'bg-purple-100 text-purple-800'
  }
  return typeClasses[this.type] || 'bg-gray-100 text-gray-800'
})

// Indexes
transactionSchema.index({ user: 1, createdAt: -1 })
transactionSchema.index({ status: 1 })
transactionSchema.index({ type: 1 })
transactionSchema.index({ stripePaymentIntentId: 1 }, { unique: true, sparse: true })
transactionSchema.index({ stripeInvoiceId: 1 }, { unique: true, sparse: true })
transactionSchema.index({ transactionNumber: 1 }, { unique: true })

module.exports = mongoose.model('Transaction', transactionSchema) 