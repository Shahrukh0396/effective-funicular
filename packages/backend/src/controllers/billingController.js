const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')
const User = require('../models/User')
const Project = require('../models/Project')
const Invoice = require('../models/Invoice')
const Transaction = require('../models/Transaction')
const PaymentMethod = require('../models/PaymentMethod')

const billingController = {
  // Get billing overview
  async getBillingOverview(req, res) {
    try {
      const userId = req.user.id
      
      // Get user's subscription
      const user = await User.findById(userId).populate('subscription')
      
      // Get recent invoices
      const invoices = await Invoice.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
      
      // Get recent transactions
      const transactions = await Transaction.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10)
      
      // Get payment methods
      const paymentMethods = await PaymentMethod.find({ user: userId })
      
      res.json({
        success: true,
        data: {
          subscription: user.subscription,
          invoices,
          transactions,
          paymentMethods
        }
      })
    } catch (error) {
      console.error('Error getting billing overview:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get billing overview'
      })
    }
  },

  // Get billing analytics
  async getBillingAnalytics(req, res) {
    try {
      const userId = req.user.id
      const { period = 'month' } = req.query
      
      const now = new Date()
      let startDate
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      }
      
      // Get transactions in period
      const transactions = await Transaction.find({
        user: userId,
        createdAt: { $gte: startDate }
      })
      
      // Calculate analytics
      const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0)
      const successfulPayments = transactions.filter(t => t.status === 'completed').length
      const failedPayments = transactions.filter(t => t.status === 'failed').length
      const averageTransactionValue = totalRevenue / transactions.length || 0
      
      // Get monthly trends
      const monthlyData = await Transaction.aggregate([
        {
          $match: {
            user: userId,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ])
      
      res.json({
        success: true,
        data: {
          totalRevenue,
          successfulPayments,
          failedPayments,
          averageTransactionValue,
          monthlyData,
          period
        }
      })
    } catch (error) {
      console.error('Error getting billing analytics:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get billing analytics'
      })
    }
  },

  // Get subscription
  async getSubscription(req, res) {
    try {
      const userId = req.user.id
      const user = await User.findById(userId).populate('subscription')
      
      res.json({
        success: true,
        data: user.subscription
      })
    } catch (error) {
      console.error('Error getting subscription:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get subscription'
      })
    }
  },

  // Update subscription
  async updateSubscription(req, res) {
    try {
      const userId = req.user.id
      const { planId, paymentMethodId } = req.body
      
      const user = await User.findById(userId)
      
      // Update subscription in Stripe
      if (user.stripeCustomerId) {
        const subscription = await stripe.subscriptions.update(
          user.stripeSubscriptionId,
          {
            items: [{ id: user.stripeSubscriptionItemId, price: planId }],
            default_payment_method: paymentMethodId
          }
        )
        
        // Update user subscription
        user.subscription = {
          planId,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        }
        await user.save()
      }
      
      res.json({
        success: true,
        message: 'Subscription updated successfully'
      })
    } catch (error) {
      console.error('Error updating subscription:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to update subscription'
      })
    }
  },

  // Cancel subscription
  async cancelSubscription(req, res) {
    try {
      const userId = req.user.id
      const user = await User.findById(userId)
      
      if (user.stripeSubscriptionId) {
        await stripe.subscriptions.cancel(user.stripeSubscriptionId)
        
        user.subscription.status = 'canceled'
        await user.save()
      }
      
      res.json({
        success: true,
        message: 'Subscription canceled successfully'
      })
    } catch (error) {
      console.error('Error canceling subscription:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to cancel subscription'
      })
    }
  },

  // Get invoices
  async getInvoices(req, res) {
    try {
      const userId = req.user.id
      const { page = 1, limit = 10, status } = req.query
      
      const query = { user: userId }
      if (status) query.status = status
      
      const invoices = await Invoice.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('project')
      
      const total = await Invoice.countDocuments(query)
      
      res.json({
        success: true,
        data: invoices,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error('Error getting invoices:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get invoices'
      })
    }
  },

  // Create invoice
  async createInvoice(req, res) {
    try {
      const userId = req.user.id
      const { projectId, amount, description, currency = 'usd' } = req.body
      
      // Create invoice in Stripe
      const stripeInvoice = await stripe.invoices.create({
        customer: req.user.stripeCustomerId,
        description,
        currency,
        metadata: {
          projectId,
          userId
        }
      })
      
      // Add invoice item
      await stripe.invoiceItems.create({
        customer: req.user.stripeCustomerId,
        invoice: stripeInvoice.id,
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        description
      })
      
      // Finalize and send invoice
      const finalizedInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id)
      await stripe.invoices.sendInvoice(finalizedInvoice.id)
      
      // Save to database
      const invoice = new Invoice({
        user: userId,
        project: projectId,
        stripeInvoiceId: finalizedInvoice.id,
        amount,
        currency,
        description,
        status: finalizedInvoice.status,
        dueDate: new Date(finalizedInvoice.due_date * 1000)
      })
      await invoice.save()
      
      res.json({
        success: true,
        data: invoice,
        message: 'Invoice created successfully'
      })
    } catch (error) {
      console.error('Error creating invoice:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to create invoice'
      })
    }
  },

  // Get invoice by ID
  async getInvoiceById(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id
      
      const invoice = await Invoice.findOne({ _id: id, user: userId })
        .populate('project')
      
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        })
      }
      
      res.json({
        success: true,
        data: invoice
      })
    } catch (error) {
      console.error('Error getting invoice:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get invoice'
      })
    }
  },

  // Download invoice
  async downloadInvoice(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id
      
      const invoice = await Invoice.findOne({ _id: id, user: userId })
        .populate('project')
        .populate('user')
      
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        })
      }
      
      // Create PDF
      const doc = new PDFDocument()
      const filename = `invoice-${invoice._id}.pdf`
      
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      
      doc.pipe(res)
      
      // Add content to PDF
      doc.fontSize(20).text('INVOICE', { align: 'center' })
      doc.moveDown()
      
      doc.fontSize(12).text(`Invoice #: ${invoice._id}`)
      doc.text(`Date: ${invoice.createdAt.toLocaleDateString()}`)
      doc.text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`)
      doc.moveDown()
      
      doc.text(`Bill To:`)
      doc.text(`${invoice.user.firstName} ${invoice.user.lastName}`)
      doc.text(invoice.user.email)
      doc.moveDown()
      
      doc.text(`Description: ${invoice.description}`)
      doc.text(`Amount: $${invoice.amount} ${invoice.currency.toUpperCase()}`)
      doc.text(`Status: ${invoice.status}`)
      
      doc.end()
    } catch (error) {
      console.error('Error downloading invoice:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to download invoice'
      })
    }
  },

  // Get transactions
  async getTransactions(req, res) {
    try {
      const userId = req.user.id
      const { page = 1, limit = 10, status } = req.query
      
      const query = { user: userId }
      if (status) query.status = status
      
      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
      
      const total = await Transaction.countDocuments(query)
      
      res.json({
        success: true,
        data: transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error('Error getting transactions:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get transactions'
      })
    }
  },

  // Get transaction by ID
  async getTransactionById(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id
      
      const transaction = await Transaction.findOne({ _id: id, user: userId })
      
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        })
      }
      
      res.json({
        success: true,
        data: transaction
      })
    } catch (error) {
      console.error('Error getting transaction:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get transaction'
      })
    }
  },

  // Get payment methods
  async getPaymentMethods(req, res) {
    try {
      const userId = req.user.id
      
      const paymentMethods = await PaymentMethod.find({ user: userId })
      
      res.json({
        success: true,
        data: paymentMethods
      })
    } catch (error) {
      console.error('Error getting payment methods:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get payment methods'
      })
    }
  },

  // Add payment method
  async addPaymentMethod(req, res) {
    try {
      const userId = req.user.id
      const { paymentMethodId } = req.body
      
      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: req.user.stripeCustomerId
      })
      
      // Set as default if no other payment methods
      const paymentMethods = await stripe.paymentMethods.list({
        customer: req.user.stripeCustomerId,
        type: 'card'
      })
      
      if (paymentMethods.data.length === 1) {
        await stripe.customers.update(req.user.stripeCustomerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId
          }
        })
      }
      
      // Save to database
      const paymentMethod = new PaymentMethod({
        user: userId,
        stripePaymentMethodId: paymentMethodId,
        type: 'card'
      })
      await paymentMethod.save()
      
      res.json({
        success: true,
        data: paymentMethod,
        message: 'Payment method added successfully'
      })
    } catch (error) {
      console.error('Error adding payment method:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to add payment method'
      })
    }
  },

  // Remove payment method
  async removePaymentMethod(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id
      
      const paymentMethod = await PaymentMethod.findOne({ _id: id, user: userId })
      
      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          message: 'Payment method not found'
        })
      }
      
      // Detach from Stripe
      await stripe.paymentMethods.detach(paymentMethod.stripePaymentMethodId)
      
      // Remove from database
      await PaymentMethod.findByIdAndDelete(id)
      
      res.json({
        success: true,
        message: 'Payment method removed successfully'
      })
    } catch (error) {
      console.error('Error removing payment method:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to remove payment method'
      })
    }
  },

  // Create payment intent
  async createPaymentIntent(req, res) {
    try {
      const { amount, currency = 'usd' } = req.body
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        customer: req.user.stripeCustomerId,
        metadata: {
          userId: req.user.id
        }
      })
      
      res.json({
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret
        }
      })
    } catch (error) {
      console.error('Error creating payment intent:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to create payment intent'
      })
    }
  },

  // Create Stripe setup intent
  async createStripeSetupIntent(req, res) {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: req.user.stripeCustomerId,
        payment_method_types: ['card']
      })
      
      res.json({
        success: true,
        data: {
          clientSecret: setupIntent.client_secret
        }
      })
    } catch (error) {
      console.error('Error creating setup intent:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to create setup intent'
      })
    }
  },

  // Confirm Stripe payment
  async confirmStripePayment(req, res) {
    try {
      const { paymentIntentId, paymentMethodId } = req.body
      
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId
      })
      
      if (paymentIntent.status === 'succeeded') {
        // Save transaction
        const transaction = new Transaction({
          user: req.user.id,
          stripePaymentIntentId: paymentIntentId,
          amount: paymentIntent.amount / 100, // Convert from cents
          currency: paymentIntent.currency,
          status: 'completed',
          description: 'Payment processed successfully'
        })
        await transaction.save()
      }
      
      res.json({
        success: true,
        data: paymentIntent
      })
    } catch (error) {
      console.error('Error confirming payment:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to confirm payment'
      })
    }
  },

  // Handle Stripe webhook
  async handleStripeWebhook(req, res) {
    const sig = req.headers['stripe-signature']
    let event
    
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }
    
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event.data.object)
          break
        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object)
          break
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object)
          break
        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object)
          break
        default:
          console.log(`Unhandled event type: ${event.type}`)
      }
      
      res.json({ received: true })
    } catch (error) {
      console.error('Error handling webhook:', error)
      res.status(500).json({ error: 'Webhook handler failed' })
    }
  }
}

// Webhook handlers
async function handleInvoicePaymentSucceeded(invoice) {
  // Update invoice status
  await Invoice.findOneAndUpdate(
    { stripeInvoiceId: invoice.id },
    { status: 'paid', paidAt: new Date() }
  )
  
  // Create transaction record
  const transaction = new Transaction({
    user: invoice.customer,
    stripeInvoiceId: invoice.id,
    amount: invoice.amount_paid / 100,
    currency: invoice.currency,
    status: 'completed',
    description: `Payment for invoice ${invoice.number}`
  })
  await transaction.save()
}

async function handleInvoicePaymentFailed(invoice) {
  // Update invoice status
  await Invoice.findOneAndUpdate(
    { stripeInvoiceId: invoice.id },
    { status: 'payment_failed' }
  )
  
  // Create failed transaction record
  const transaction = new Transaction({
    user: invoice.customer,
    stripeInvoiceId: invoice.id,
    amount: invoice.amount_due / 100,
    currency: invoice.currency,
    status: 'failed',
    description: `Failed payment for invoice ${invoice.number}`
  })
  await transaction.save()
}

async function handleSubscriptionUpdated(subscription) {
  // Update user subscription
  await User.findOneAndUpdate(
    { stripeCustomerId: subscription.customer },
    {
      subscription: {
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      }
    }
  )
}

async function handleSubscriptionDeleted(subscription) {
  // Update user subscription status
  await User.findOneAndUpdate(
    { stripeCustomerId: subscription.customer },
    {
      'subscription.status': 'canceled'
    }
  )
}

module.exports = billingController 