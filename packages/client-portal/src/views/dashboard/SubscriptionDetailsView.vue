<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl font-semibold text-gray-900">Subscription Details</h1>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            @click="goBack"
          >
            Back to Services
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div class="mt-8">
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <!-- Service Information -->
          <div class="px-4 py-5 sm:px-6">
            <div class="flex items-center">
              <component :is="service?.icon" class="h-10 w-10 text-indigo-600" />
              <div class="ml-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">{{ service?.title }}</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">{{ service?.description }}</p>
              </div>
            </div>
          </div>

          <!-- Plan Selection -->
          <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Select a Plan</h4>
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="plan in plans"
                :key="plan.id"
                class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                :class="{ 'border-indigo-500 ring-2 ring-indigo-500': selectedPlan?.id === plan.id }"
                @click="selectPlan(plan)"
              >
                <div class="flex-1 min-w-0">
                  <div class="focus:outline-none">
                    <p class="text-sm font-medium text-gray-900">{{ plan.name }}</p>
                    <p class="text-sm text-gray-500">{{ plan.description }}</p>
                    <p class="mt-1 text-lg font-semibold text-indigo-600">{{ plan.price }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Form -->
          <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Payment Information</h4>
            <form @submit.prevent="handlePayment" class="space-y-6">
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-3">
                  <label for="card-number" class="block text-sm font-medium text-gray-700">Card Number</label>
                  <div class="mt-1">
                    <input
                      type="text"
                      id="card-number"
                      v-model="paymentInfo.cardNumber"
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                </div>

                <div class="sm:col-span-2">
                  <label for="expiry" class="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <div class="mt-1">
                    <input
                      type="text"
                      id="expiry"
                      v-model="paymentInfo.expiry"
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="MM/YY"
                    />
                  </div>
                </div>

                <div class="sm:col-span-1">
                  <label for="cvc" class="block text-sm font-medium text-gray-700">CVC</label>
                  <div class="mt-1">
                    <input
                      type="text"
                      id="cvc"
                      v-model="paymentInfo.cvc"
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="!selectedPlan || isProcessing"
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {{ isProcessing ? 'Processing...' : 'Complete Subscription' }}
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { HomeIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const service = ref(null)
const selectedPlan = ref(null)
const isProcessing = ref(false)

const paymentInfo = ref({
  cardNumber: '',
  expiry: '',
  cvc: ''
})

const plans = ref([
  {
    id: 1,
    name: 'Basic',
    description: 'Essential service features',
    price: '$99/month'
  },
  {
    id: 2,
    name: 'Professional',
    description: 'Advanced features and priority support',
    price: '$199/month'
  },
  {
    id: 3,
    name: 'Enterprise',
    description: 'Full feature set with dedicated support',
    price: '$299/month'
  }
])

onMounted(async () => {
  // Fetch service details based on route params
  const serviceId = route.params.id
  // Mock service data
  service.value = {
    id: serviceId,
    title: 'Home Cleaning',
    description: 'Professional home cleaning service with customizable schedules and eco-friendly products.',
    icon: HomeIcon
  }
})

const selectPlan = (plan) => {
  selectedPlan.value = plan
}

const handlePayment = async () => {
  if (!selectedPlan.value) return

  isProcessing.value = true
  try {
    // Implement payment processing logic here
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
    router.push({
      name: 'subscription-success',
      params: { id: service.value.id }
    })
  } catch (error) {
    console.error('Payment processing failed:', error)
  } finally {
    isProcessing.value = false
  }
}

const goBack = () => {
  router.push({ name: 'services' })
}
</script> 