<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-semibold text-gray-900">Subscription Management</h1>
      </div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <!-- Subscription Overview -->
        <div class="mt-8">
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <!-- Total Revenue -->
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                      <dd class="flex items-baseline">
                        <div class="text-2xl font-semibold text-gray-900">${{ totalRevenue.toLocaleString() }}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <!-- Active Subscriptions -->
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Active Subscriptions</dt>
                      <dd class="flex items-baseline">
                        <div class="text-2xl font-semibold text-gray-900">{{ activeSubscriptions.length }}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pending Renewals -->
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Pending Renewals</dt>
                      <dd class="flex items-baseline">
                        <div class="text-2xl font-semibold text-gray-900">{{ pendingRenewals.length }}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Subscription List -->
        <div class="mt-8">
          <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" class="divide-y divide-gray-200">
              <li v-for="subscription in subscriptions" :key="subscription.id">
                <div class="px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <div class="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <span class="text-lg font-medium text-gray-600">{{ subscription.clientName.charAt(0) }}</span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <h2 class="text-lg font-medium text-gray-900">{{ subscription.clientName }}</h2>
                        <p class="text-sm text-gray-500">{{ subscription.plan }}</p>
                      </div>
                    </div>
                    <div class="ml-2 flex-shrink-0 flex">
                      <button
                        @click="viewSubscriptionDetails(subscription.id)"
                        class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                  <div class="mt-2 sm:flex sm:justify-between">
                    <div class="sm:flex">
                      <p class="flex items-center text-sm text-gray-500">
                        <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ subscription.status }}
                      </p>
                    </div>
                    <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>
                        Next billing: {{ new Date(subscription.nextBillingDate).toLocaleDateString() }}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Subscription Details Modal -->
        <div v-if="selectedSubscription" class="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div class="mt-3 text-center sm:mt-5">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {{ selectedSubscription.clientName }}
                  </h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      {{ selectedSubscription.plan }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Subscription Details -->
              <div class="mt-5">
                <h4 class="text-sm font-medium text-gray-900">Subscription Details</h4>
                <div class="mt-2 bg-gray-50 rounded-lg p-4">
                  <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Status</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ selectedSubscription.status }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Amount</dt>
                      <dd class="mt-1 text-sm text-gray-900">${{ selectedSubscription.amount }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Billing Cycle</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ selectedSubscription.billingCycle }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Next Billing</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ new Date(selectedSubscription.nextBillingDate).toLocaleDateString() }}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <!-- Payment History -->
              <div class="mt-5">
                <h4 class="text-sm font-medium text-gray-900">Payment History</h4>
                <div class="mt-2">
                  <ul role="list" class="divide-y divide-gray-200">
                    <li v-for="payment in selectedSubscription.payments" :key="payment.id" class="py-3">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div class="ml-3">
                            <p class="text-sm font-medium text-gray-900">{{ payment.description }}</p>
                            <p class="text-sm text-gray-500">{{ new Date(payment.date).toLocaleDateString() }}</p>
                          </div>
                        </div>
                        <div class="ml-2 flex-shrink-0">
                          <p class="text-sm font-medium text-gray-900">${{ payment.amount }}</p>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                  @click="closeModal"
                >
                  Close
                </button>
                <button
                  type="button"
                  class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  @click="editSubscription"
                >
                  Edit Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '../stores/adminStore'

const adminStore = useAdminStore()
const selectedSubscription = ref(null)

// Sample subscription data (replace with real data from your backend)
const subscriptions = ref([
  {
    id: 1,
    clientName: 'Acme Corp',
    plan: 'Enterprise',
    status: 'Active',
    amount: 999,
    billingCycle: 'Monthly',
    nextBillingDate: '2024-04-01',
    payments: [
      {
        id: 1,
        description: 'Monthly Subscription',
        date: '2024-03-01',
        amount: 999
      },
      {
        id: 2,
        description: 'Monthly Subscription',
        date: '2024-02-01',
        amount: 999
      }
    ]
  }
])

const totalRevenue = computed(() => {
  return subscriptions.value.reduce((total, sub) => {
    return total + sub.payments.reduce((subTotal, payment) => subTotal + payment.amount, 0)
  }, 0)
})

const activeSubscriptions = computed(() => {
  return subscriptions.value.filter(sub => sub.status === 'Active')
})

const pendingRenewals = computed(() => {
  const today = new Date()
  const thirtyDaysFromNow = new Date(today)
  thirtyDaysFromNow.setDate(today.getDate() + 30)
  
  return subscriptions.value.filter(sub => {
    const nextBilling = new Date(sub.nextBillingDate)
    return nextBilling >= today && nextBilling <= thirtyDaysFromNow
  })
})

const viewSubscriptionDetails = async (subscriptionId) => {
  await adminStore.fetchClientDetails(subscriptionId)
  selectedSubscription.value = subscriptions.value.find(s => s.id === subscriptionId)
}

const closeModal = () => {
  selectedSubscription.value = null
}

const editSubscription = () => {
  // Implement edit subscription functionality
  console.log('Edit subscription:', selectedSubscription.value)
}

onMounted(async () => {
  await adminStore.fetchClients()
})
</script> 