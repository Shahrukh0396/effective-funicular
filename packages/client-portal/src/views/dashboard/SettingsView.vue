<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="sm:flex sm:items-center">
            <div class="sm:flex-auto">
              <h1 class="text-2xl font-semibold text-gray-900">Settings</h1>
              <p class="mt-2 text-sm text-gray-700">
                Manage your account settings and preferences.
              </p>
            </div>
          </div>

          <div class="mt-6 space-y-8 divide-y divide-gray-200">
            <!-- Profile Section -->
            <div class="pt-8">
              <div>
                <h3 class="text-lg font-medium leading-6 text-gray-900">Profile</h3>
                <p class="mt-1 text-sm text-gray-500">Update your personal information.</p>
              </div>

              <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-3">
                  <label for="firstName" class="block text-sm font-medium text-gray-700">First name</label>
                  <div class="mt-1">
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      v-model="profile.firstName"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div class="sm:col-span-3">
                  <label for="lastName" class="block text-sm font-medium text-gray-700">Last name</label>
                  <div class="mt-1">
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      v-model="profile.lastName"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div class="sm:col-span-4">
                  <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
                  <div class="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      v-model="profile.email"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Notifications Section -->
            <div class="pt-8">
              <div>
                <h3 class="text-lg font-medium leading-6 text-gray-900">Notifications</h3>
                <p class="mt-1 text-sm text-gray-500">Manage your notification preferences.</p>
              </div>

              <div class="mt-6">
                <fieldset>
                  <div class="space-y-4">
                    <div class="relative flex items-start">
                      <div class="flex h-5 items-center">
                        <input
                          id="emailNotifications"
                          name="emailNotifications"
                          type="checkbox"
                          v-model="notifications.email"
                          class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                      <div class="ml-3 text-sm">
                        <label for="emailNotifications" class="font-medium text-gray-700">Email notifications</label>
                        <p class="text-gray-500">Receive updates about your projects via email.</p>
                      </div>
                    </div>

                    <div class="relative flex items-start">
                      <div class="flex h-5 items-center">
                        <input
                          id="projectUpdates"
                          name="projectUpdates"
                          type="checkbox"
                          v-model="notifications.projects"
                          class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                      <div class="ml-3 text-sm">
                        <label for="projectUpdates" class="font-medium text-gray-700">Project updates</label>
                        <p class="text-gray-500">Get notified when projects are updated or completed.</p>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>

            <!-- Save Button -->
            <div class="pt-8">
              <div class="flex justify-end">
                <button
                  type="button"
                  @click="saveSettings"
                  class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Save changes
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
import { ref, onMounted } from 'vue'

const profile = ref({
  firstName: '',
  lastName: '',
  email: ''
})

const notifications = ref({
  email: true,
  projects: true
})

onMounted(() => {
  console.log('SettingsView component mounted')
  // Load user data when component mounts
  loadUserData()
})

async function loadUserData() {
  // Simulate loading user data
  // Replace this with actual API call later
  profile.value = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com'
  }
}

async function saveSettings() {
  try {
    // TODO: Implement API call to save settings
    console.log('Saving settings:', {
      profile: profile.value,
      notifications: notifications.value
    })
  } catch (error) {
    console.error('Error saving settings:', error)
  }
}
</script>

<style scoped>
.py-6 {
  min-height: 100vh;
  background-color: #f3f4f6; /* Light gray background */
}
</style> 