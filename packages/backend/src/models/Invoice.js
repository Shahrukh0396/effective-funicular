const mongoose = require('mongoose')

const invoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  stripeInvoiceId: {
    type: String,
    required: true,
    unique: true
  },
  invoiceNumber: {
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
    enum: ['draft', 'open', 'paid', 'void', 'uncollectible', 'payment_failed'],
    default: 'draft'
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidAt: {
    type: Date
  },
  items: [{
    description: String,
    amount: Number,
    quantity: {
      type: Number,
      default: 1
    },
    unitPrice: Number
  }],
  taxAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  notes: String,
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
})

// Generate invoice number before saving
invoiceSchema.pre('save', async function(next) {
  if (this.isNew && !this.invoiceNumber) {
    const count = await this.constructor.countDocuments()
    this.invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`
  }
  next()
})

// Calculate total amount
invoiceSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    const subtotal = this.items.reduce((sum, item) => {
      return sum + (item.amount || (item.unitPrice * item.quantity))
    }, 0)
    this.totalAmount = subtotal + (this.taxAmount || 0)
  } else {
    this.totalAmount = this.amount
  }
  next()
})

// Virtual for formatted amount
invoiceSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency.toUpperCase()
  }).format(this.totalAmount)
})

// Virtual for status badge
invoiceSchema.virtual('statusBadge').get(function() {
  const statusClasses = {
    draft: 'bg-gray-100 text-gray-800',
    open: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    void: 'bg-red-100 text-red-800',
    uncollectible: 'bg-red-100 text-red-800',
    payment_failed: 'bg-yellow-100 text-yellow-800'
  }
  return statusClasses[this.status] || 'bg-gray-100 text-gray-800'
})

// Indexes
invoiceSchema.index({ user: 1, createdAt: -1 })
invoiceSchema.index({ status: 1 })
invoiceSchema.index({ stripeInvoiceId: 1 }, { unique: true })
invoiceSchema.index({ invoiceNumber: 1 }, { unique: true })

module.exports = mongoose.model('Invoice', invoiceSchema) 