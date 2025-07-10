<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl font-semibold text-gray-900">Billing & Payments</h1>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4">
          <button
            @click="openPaymentModal"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Payment Method
          </button>
        </div>
      </div>

      <!-- Current Plan -->
      <div class="mt-8">
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900">Current Plan</h2>
          <div class="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-sm font-medium text-gray-500">Plan Details</h3>
              <div class="mt-2">
                <p class="text-lg font-semibold text-gray-900">{{ currentPlan.name }}</p>
                <p class="text-sm text-gray-500">{{ currentPlan.description }}</p>
              </div>
              <div class="mt-4">
                <p class="text-sm text-gray-500">Next billing date: {{ formatDate(currentPlan.nextBillingDate) }}</p>
                <p class="text-sm text-gray-500">Amount: ${{ currentPlan.amount }}/month</p>
              </div>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-sm font-medium text-gray-500">Payment Method</h3>
              <div class="mt-2">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-900">•••• •••• •••• {{ currentPlan.last4 }}</p>
                    <p class="text-sm text-gray-500">Expires {{ currentPlan.expiryDate }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transaction History -->
      <div class="mt-8">
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Transaction History</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="transaction in transactions" :key="transaction.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(transaction.date) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ transaction.description }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${{ transaction.amount }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800',
                        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium'
                      ]"
                    >
                      {{ transaction.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                    <button @click="downloadInvoice(transaction)" class="hover:text-indigo-900">
                      Download
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Payment Method Modal -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Add Payment Method</h3>
        <form @submit.prevent="addPaymentMethod" class="space-y-4">
          <div>
            <label for="cardNumber" class="block text-sm font-medium text-gray-700">Card Number</label>
            <input
              type="text"
              id="cardNumber"
              v-model="newPayment.cardNumber"
              placeholder="1234 5678 9012 3456"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="expiryDate" class="block text-sm font-medium text-gray-700">Expiry Date</label>
              <input
                type="text"
                id="expiryDate"
                v-model="newPayment.expiryDate"
                placeholder="MM/YY"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label for="cvv" class="block text-sm font-medium text-gray-700">CVV</label>
              <input
                type="text"
                id="cvv"
                v-model="newPayment.cvv"
                placeholder="123"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label for="cardName" class="block text-sm font-medium text-gray-700">Name on Card</label>
            <input
              type="text"
              id="cardName"
              v-model="newPayment.cardName"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="showPaymentModal = false"
              class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Add Card
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { format } from 'date-fns'

// Sample data - replace with actual API calls
const currentPlan = ref({
  name: 'Professional Plan',
  description: 'Full access to all features and premium support',
  amount: 99,
  nextBillingDate: '2024-04-15',
  last4: '4242',
  expiryDate: '12/25'
})

const transactions = ref([
  {
    id: 1,
    date: '2024-03-15',
    description: 'Monthly Subscription - Professional Plan',
    amount: 99.00,
    status: 'completed',
    invoiceUrl: '#'
  },
  {
    id: 2,
    date: '2024-02-15',
    description: 'Monthly Subscription - Professional Plan',
    amount: 99.00,
    status: 'completed',
    invoiceUrl: '#'
  },
  {
    id: 3,
    date: '2024-01-15',
    description: 'Monthly Subscription - Professional Plan',
    amount: 99.00,
    status: 'completed',
    invoiceUrl: '#'
  },
  {
    id: 4,
    date: '2024-01-10',
    description: 'Initial Setup Fee',
    amount: 199.00,
    status: 'completed',
    invoiceUrl: '#'
  }
])

const showPaymentModal = ref(false)
const newPayment = ref({
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  cardName: ''
})

function formatDate(date) {
  return format(new Date(date), 'MMM d, yyyy')
}

function openPaymentModal() {
  showPaymentModal.value = true
}

function addPaymentMethod() {
  // Here you would integrate with your payment processor (e.g., Stripe)
  console.log('Adding payment method:', newPayment.value)
  showPaymentModal.value = false
  newPayment.value = {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  }
}

function downloadInvoice(transaction) {
  // Here you would generate and download the invoice
  console.log('Downloading invoice for transaction:', transaction.id)
}
</script> 