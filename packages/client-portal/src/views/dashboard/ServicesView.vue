<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <h1 class="text-2xl font-semibold text-gray-900">Service Catalog</h1>
      <p class="mt-2 text-sm text-gray-700">Browse and subscribe to our available services.</p>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <!-- Service Grid -->
      <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="service in services" :key="service.id" class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <component :is="service.icon" class="h-8 w-8 text-indigo-600" />
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">{{ service.title }}</h3>
                <p class="mt-1 text-sm text-gray-500">{{ service.price }}</p>
              </div>
            </div>
            <p class="mt-4 text-sm text-gray-500">{{ service.description }}</p>
          </div>
          <div class="bg-gray-50 px-6 py-4">
            <div class="flex justify-between items-center">
              <button
                v-if="service.isSubscribed"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                @click="viewSubscription(service)"
              >
                View Subscription
              </button>
              <button
                v-else
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                @click="subscribeToService(service)"
              >
                Subscribe
              </button>
              <button
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                @click="viewDetails(service)"
              >
                Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  HomeIcon,
  WrenchScrewdriverIcon,
  PaintBrushIcon,
  TruckIcon,
  ComputerDesktopIcon,
  PhoneIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()

const services = ref([
  {
    id: 1,
    title: 'Home Cleaning',
    price: '$99/month',
    description: 'Professional home cleaning service with customizable schedules and eco-friendly products.',
    icon: HomeIcon,
    isSubscribed: false
  },
  {
    id: 2,
    title: 'Appliance Repair',
    price: '$79/service',
    description: 'Expert repair services for all major home appliances with same-day availability.',
    icon: WrenchScrewdriverIcon,
    isSubscribed: true
  },
  {
    id: 3,
    title: 'Interior Painting',
    price: '$299/project',
    description: 'Professional interior painting services with premium quality paints and expert craftsmanship.',
    icon: PaintBrushIcon,
    isSubscribed: false
  },
  {
    id: 4,
    title: 'Moving Services',
    price: '$199/hour',
    description: 'Full-service moving assistance with packing, loading, and transportation included.',
    icon: TruckIcon,
    isSubscribed: false
  },
  {
    id: 5,
    title: 'IT Support',
    price: '$149/month',
    description: '24/7 technical support for all your home and business technology needs.',
    icon: ComputerDesktopIcon,
    isSubscribed: false
  },
  {
    id: 6,
    title: 'Smart Home Setup',
    price: '$199/setup',
    description: 'Professional installation and configuration of smart home devices and systems.',
    icon: PhoneIcon,
    isSubscribed: false
  }
])

const subscribeToService = (service) => {
  router.push({
    name: 'subscription-details',
    params: { id: service.id }
  })
}

const viewSubscription = (service) => {
  router.push({
    name: 'subscription-details',
    params: { id: service.id }
  })
}

const viewDetails = (service) => {
  // Implement service details view
  console.log('View details for service:', service.title)
}
</script> 