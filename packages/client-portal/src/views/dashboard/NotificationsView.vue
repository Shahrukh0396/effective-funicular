<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <h1 class="text-2xl font-semibold text-gray-900">Notifications</h1>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <!-- Notification Preferences -->
      <div class="mt-8">
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">Email Notifications</h4>
                <p class="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <button
                type="button"
                :class="[
                  emailNotifications ? 'bg-indigo-600' : 'bg-gray-200',
                  'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                ]"
                @click="emailNotifications = !emailNotifications"
              >
                <span
                  :class="[
                    emailNotifications ? 'translate-x-5' : 'translate-x-0',
                    'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                  ]"
                >
                  <span
                    :class="[
                      emailNotifications ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200',
                      'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
                    ]"
                    aria-hidden="true"
                  >
                    <svg class="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                      <path
                        d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  <span
                    :class="[
                      emailNotifications ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100',
                      'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
                    ]"
                    aria-hidden="true"
                  >
                    <svg class="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
                      <path
                        d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z"
                      />
                    </svg>
                  </span>
                </span>
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">Push Notifications</h4>
                <p class="text-sm text-gray-500">Receive notifications in your browser</p>
              </div>
              <button
                type="button"
                :class="[
                  pushNotifications ? 'bg-indigo-600' : 'bg-gray-200',
                  'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                ]"
                @click="pushNotifications = !pushNotifications"
              >
                <span
                  :class="[
                    pushNotifications ? 'translate-x-5' : 'translate-x-0',
                    'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                  ]"
                >
                  <span
                    :class="[
                      pushNotifications ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200',
                      'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
                    ]"
                    aria-hidden="true"
                  >
                    <svg class="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                      <path
                        d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  <span
                    :class="[
                      pushNotifications ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100',
                      'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
                    ]"
                    aria-hidden="true"
                  >
                    <svg class="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
                      <path
                        d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z"
                      />
                    </svg>
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="mt-8">
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" class="divide-y divide-gray-200">
            <li v-for="notification in notifications" :key="notification.id">
              <div class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <component
                        :is="notification.icon"
                        class="h-6 w-6"
                        :class="{
                          'text-green-500': notification.type === 'success',
                          'text-yellow-500': notification.type === 'warning',
                          'text-blue-500': notification.type === 'info'
                        }"
                      />
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                      <p class="text-sm text-gray-500">{{ notification.message }}</p>
                    </div>
                  </div>
                  <div class="ml-4 flex-shrink-0">
                    <span class="text-sm text-gray-500">{{ notification.time }}</span>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  UserIcon
} from '@heroicons/vue/24/outline'

const emailNotifications = ref(true)
const pushNotifications = ref(true)

const notifications = ref([
  {
    id: 1,
    type: 'success',
    title: 'Task Completed',
    message: 'The "Update Documentation" task has been completed',
    time: '2 hours ago',
    icon: CheckCircleIcon
  },
  {
    id: 2,
    type: 'info',
    title: 'Payment Received',
    message: 'Your payment of $99.00 has been processed successfully',
    time: '1 day ago',
    icon: CurrencyDollarIcon
  },
  {
    id: 3,
    type: 'warning',
    title: 'Upcoming Deadline',
    message: 'The "Code Review" task is due in 2 days',
    time: '2 days ago',
    icon: ExclamationTriangleIcon
  },
  {
    id: 4,
    type: 'info',
    title: 'Team Update',
    message: 'A new team member has been assigned to your project',
    time: '3 days ago',
    icon: UserIcon
  },
  {
    id: 5,
    type: 'info',
    title: 'System Update',
    message: 'New features have been added to the platform',
    time: '1 week ago',
    icon: InformationCircleIcon
  }
])
</script> 