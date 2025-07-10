<template>
  <div class="subscription-plans">
    <h1>Choose Your Plan</h1>
    <div class="plans-container">
      <div class="plan-card" :class="{ 'highlighted': selectedPlan === 'basic' }" @click="selectPlan('basic')">
        <h2>Basic Plan</h2>
        <div class="price">$4,999<span>/month</span></div>
        <ul class="features">
          <li>✓ Basic Features</li>
          <li>✓ Standard Support</li>
          <li>✓ Access to Core Tools</li>
        </ul>
        <button class="select-button" @click.stop="handleSubscription('basic')">
          Select Plan
        </button>
      </div>

      <div class="plan-card" :class="{ 'highlighted': selectedPlan === 'premium' }" @click="selectPlan('premium')">
        <h2>Premium Plan</h2>
        <div class="price">$6,999<span>/month</span></div>
        <ul class="features">
          <li>✓ All Basic Features</li>
          <li>✓ Priority Support</li>
          <li>✓ Advanced Tools</li>
          <li>✓ Custom Integrations</li>
        </ul>
        <button class="select-button" @click.stop="handleSubscription('premium')">
          Select Plan
        </button>
      </div>
    </div>

    <!-- Stripe Elements will be mounted here -->
    <div v-if="showPaymentForm" class="payment-form">
      <div ref="cardElement"></div>
      <button @click="processPayment" :disabled="processing">
        {{ processing ? 'Processing...' : 'Subscribe Now' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { loadStripe } from '@stripe/stripe-js'

const stripe = ref(null)
const cardElement = ref(null)
const selectedPlan = ref(null)
const showPaymentForm = ref(false)
const processing = ref(false)

const plans = {
  basic: {
    price: 4999,
    name: 'Basic Plan'
  },
  premium: {
    price: 6999,
    name: 'Premium Plan'
  }
}

onMounted(async () => {
  stripe.value = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
})

const selectPlan = (plan) => {
  selectedPlan.value = plan
}

const handleSubscription = (plan) => {
  selectedPlan.value = plan
  showPaymentForm.value = true
}

const processPayment = async () => {
  if (!selectedPlan.value || !stripe.value) return

  processing.value = true
  try {
    // Here we'll implement the actual Stripe payment processing
    // This is a placeholder for the actual implementation
    const response = await fetch('/api/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan: selectedPlan.value,
        price: plans[selectedPlan.value].price
      })
    })

    const data = await response.json()
    // Handle successful subscription
  } catch (error) {
    console.error('Payment failed:', error)
  } finally {
    processing.value = false
  }
}
</script>

<style scoped>
.subscription-plans {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.plans-container {
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.plan-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 2rem;
  width: 300px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.plan-card.highlighted {
  border-color: #4CAF50;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #333;
  margin-bottom: 1rem;
}

.price {
  font-size: 2rem;
  font-weight: bold;
  color: #4CAF50;
  margin-bottom: 1.5rem;
}

.price span {
  font-size: 1rem;
  color: #666;
}

.features {
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
}

.features li {
  margin-bottom: 0.5rem;
  color: #666;
}

.select-button {
  width: 100%;
  padding: 0.8rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.select-button:hover {
  background-color: #45a049;
}

.payment-form {
  margin-top: 2rem;
  padding: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  max-width: 500px;
  margin: 2rem auto;
}

.payment-form button {
  margin-top: 1rem;
  width: 100%;
  padding: 0.8rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.payment-form button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style> 