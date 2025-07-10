const mongoose = require('mongoose')

const paymentMethodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stripePaymentMethodId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['card', 'bank_account', 'sepa_debit', 'ideal', 'sofort'],
    default: 'card'
  },
  card: {
    brand: String,
    country: String,
    expMonth: Number,
    expYear: Number,
    fingerprint: String,
    funding: String,
    last4: String,
    threeDSecureUsage: {
      supported: Boolean
    }
  },
  billingDetails: {
    address: {
      city: String,
      country: String,
      line1: String,
      line2: String,
      postalCode: String,
      state: String
    },
    email: String,
    name: String,
    phone: String
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
})

// Ensure only one default payment method per user
paymentMethodSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    )
  }
  next()
})

// Virtual for display name
paymentMethodSchema.virtual('displayName').get(function() {
  if (this.type === 'card' && this.card) {
    return `${this.card.brand} •••• ${this.card.last4}`
  }
  return `${this.type} payment method`
})

// Virtual for masked number
paymentMethodSchema.virtual('maskedNumber').get(function() {
  if (this.type === 'card' && this.card) {
    return `•••• •••• •••• ${this.card.last4}`
  }
  return '•••• •••• •••• ••••'
})

// Virtual for expiry date
paymentMethodSchema.virtual('expiryDate').get(function() {
  if (this.type === 'card' && this.card) {
    return `${this.card.expMonth.toString().padStart(2, '0')}/${this.card.expYear}`
  }
  return null
})

// Virtual for brand icon
paymentMethodSchema.virtual('brandIcon').get(function() {
  if (this.type === 'card' && this.card) {
    const brandIcons = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
      jcb: '💳',
      dinersclub: '💳',
      unionpay: '💳'
    }
    return brandIcons[this.card.brand.toLowerCase()] || '💳'
  }
  return '🏦'
})

// Indexes
paymentMethodSchema.index({ user: 1, isDefault: 1 })
paymentMethodSchema.index({ user: 1, isActive: 1 })
paymentMethodSchema.index({ stripePaymentMethodId: 1 }, { unique: true })

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema) 