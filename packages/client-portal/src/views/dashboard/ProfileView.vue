<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <h1 class="text-2xl font-semibold text-gray-900">Profile & Settings</h1>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <!-- Profile Information -->
      <div class="mt-8">
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
          <form @submit.prevent="updateProfile" class="space-y-6">
            <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-3">
                <label for="first-name" class="block text-sm font-medium text-gray-700">First name</label>
                <div class="mt-1">
                  <input
                    type="text"
                    id="first-name"
                    v-model="profile.firstName"
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div class="sm:col-span-3">
                <label for="last-name" class="block text-sm font-medium text-gray-700">Last name</label>
                <div class="mt-1">
                  <input
                    type="text"
                    id="last-name"
                    v-model="profile.lastName"
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div class="sm:col-span-4">
                <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
                <div class="mt-1">
                  <input
                    type="email"
                    id="email"
                    v-model="profile.email"
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div class="sm:col-span-3">
                <label for="phone" class="block text-sm font-medium text-gray-700">Phone number</label>
                <div class="mt-1">
                  <input
                    type="tel"
                    id="phone"
                    v-model="profile.phone"
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Payment Methods -->
      <div class="mt-8">
        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Payment Methods</h3>
            <button
              type="button"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              @click="showAddPaymentModal = true"
            >
              Add Payment Method
            </button>
          </div>

          <div class="space-y-4">
            <div
              v-for="method in paymentMethods"
              :key="method.id"
              class="flex items-center justify-between p-4 border rounded-lg"
            >
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <component :is="method.icon" class="h-8 w-8 text-gray-400" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">{{ method.type }} ending in {{ method.last4 }}</p>
                  <p class="text-sm text-gray-500">Expires {{ method.expiry }}</p>
                </div>
              </div>
              <button
                type="button"
                class="text-sm font-medium text-red-600 hover:text-red-500"
                @click="removePaymentMethod(method)"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Subscription History -->
      <div class="mt-8">
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Subscription History</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Service
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Plan
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Next Billing
                  </th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="subscription in subscriptions" :key="subscription.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ subscription.service }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ subscription.plan }}</div>
                    <div class="text-sm text-gray-500">{{ subscription.price }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full'
                      ]"
                    >
                      {{ subscription.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ subscription.nextBilling }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      type="button"
                      class="text-indigo-600 hover:text-indigo-900"
                      @click="viewSubscription(subscription)"
                    >
                      View Details
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
    <div v-if="showAddPaymentModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Add Payment Method</h3>
            <form @submit.prevent="addPaymentMethod" class="space-y-4">
              <div>
                <label for="card-number" class="block text-sm font-medium text-gray-700">Card Number</label>
                <input
                  type="text"
                  id="card-number"
                  v-model="newPaymentMethod.cardNumber"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="expiry" class="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <input
                    type="text"
                    id="expiry"
                    v-model="newPaymentMethod.expiry"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="MM/YY"
                    required
                  />
                </div>

                <div>
                  <label for="cvc" class="block text-sm font-medium text-gray-700">CVC</label>
                  <input
                    type="text"
                    id="cvc"
                    v-model="newPaymentMethod.cvc"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                >
                  Add Card
                </button>
                <button
                  type="button"
                  class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  @click="showAddPaymentModal = false"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { CreditCardIcon } from '@heroicons/vue/24/outline'

const profile = ref({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567'
})

const showAddPaymentModal = ref(false)
const newPaymentMethod = ref({
  cardNumber: '',
  expiry: '',
  cvc: ''
})

const paymentMethods = ref([
  {
    id: 1,
    type: 'Visa',
    last4: '4242',
    expiry: '12/25',
    icon: CreditCardIcon
  },
  {
    id: 2,
    type: 'Mastercard',
    last4: '5555',
    expiry: '09/24',
    icon: CreditCardIcon
  }
])

const subscriptions = ref([
  {
    id: 1,
    service: 'Home Cleaning',
    plan: 'Professional',
    price: '$199/month',
    status: 'active',
    nextBilling: 'Apr 15, 2024'
  },
  {
    id: 2,
    service: 'Appliance Repair',
    plan: 'Basic',
    price: '$79/service',
    status: 'active',
    nextBilling: 'May 1, 2024'
  }
])

const updateProfile = async () => {
  // Implement profile update logic
  console.log('Updating profile:', profile.value)
}

const addPaymentMethod = () => {
  // Implement payment method addition logic
  console.log('Adding payment method:', newPaymentMethod.value)
  showAddPaymentModal.value = false
  newPaymentMethod.value = {
    cardNumber: '',
    expiry: '',
    cvc: ''
  }
}

const removePaymentMethod = (method) => {
  // Implement payment method removal logic
  console.log('Removing payment method:', method)
}

const viewSubscription = (subscription) => {
  // Implement subscription details view logic
  console.log('Viewing subscription:', subscription)
}
</script> 