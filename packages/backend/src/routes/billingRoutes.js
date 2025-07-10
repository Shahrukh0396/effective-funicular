const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const billingController = require('../controllers/billingController')

// Billing overview and analytics
router.get('/overview', auth, billingController.getBillingOverview)
router.get('/analytics', auth, billingController.getBillingAnalytics)

// Subscription management
router.get('/subscription', auth, billingController.getSubscription)
router.patch('/subscription', auth, billingController.updateSubscription)
router.post('/subscription/cancel', auth, billingController.cancelSubscription)

// Invoice management
router.get('/invoices', auth, billingController.getInvoices)
router.post('/invoices', auth, billingController.createInvoice)
router.get('/invoices/:id', auth, billingController.getInvoiceById)
router.get('/invoices/:id/download', auth, billingController.downloadInvoice)

// Transaction history
router.get('/transactions', auth, billingController.getTransactions)
router.get('/transactions/:id', auth, billingController.getTransactionById)

// Payment methods
router.get('/payment-methods', auth, billingController.getPaymentMethods)
router.post('/payment-methods', auth, billingController.addPaymentMethod)
router.delete('/payment-methods/:id', auth, billingController.removePaymentMethod)

// Payment processing
router.post('/create-payment-intent', auth, billingController.createPaymentIntent)

// Stripe integration
router.post('/stripe/setup-intent', auth, billingController.createStripeSetupIntent)
router.post('/stripe/confirm-payment', auth, billingController.confirmStripePayment)
router.post('/stripe/webhook', billingController.handleStripeWebhook)

module.exports = router 