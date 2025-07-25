<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="border-b border-gray-200 pb-6">
      <h1 class="text-2xl font-bold text-gray-900">System Settings</h1>
      <p class="mt-2 text-sm text-gray-600">Configure system-wide settings and preferences.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Settings Forms -->
      <div class="lg:col-span-2 space-y-6">
        <!-- General Settings -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
          <form @submit.prevent="saveGeneralSettings" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">System Name</label>
              <input
                v-model="settings.systemName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Linton Tech Ecosystem"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input
                v-model="settings.supportEmail"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="support@lintontech.com"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Default Timezone</label>
              <select
                v-model="settings.timezone"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>
            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="loading"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {{ loading ? 'Saving...' : 'Save Settings' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Security Settings -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                <p class="text-sm text-gray-600">Require 2FA for all super admin accounts</p>
              </div>
              <button
                @click="settings.twoFactorEnabled = !settings.twoFactorEnabled"
                :class="settings.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span
                  :class="settings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'"
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                />
              </button>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">Session Timeout</h4>
                <p class="text-sm text-gray-600">Automatically log out inactive sessions</p>
              </div>
              <select
                v-model="settings.sessionTimeout"
                class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="480">8 hours</option>
              </select>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">Password Policy</h4>
                <p class="text-sm text-gray-600">Enforce strong password requirements</p>
              </div>
              <button
                @click="settings.strongPasswordPolicy = !settings.strongPasswordPolicy"
                :class="settings.strongPasswordPolicy ? 'bg-blue-600' : 'bg-gray-200'"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span
                  :class="settings.strongPasswordPolicy ? 'translate-x-6' : 'translate-x-1'"
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">Email Notifications</h4>
                <p class="text-sm text-gray-600">Receive email alerts for system events</p>
              </div>
              <button
                @click="settings.emailNotifications = !settings.emailNotifications"
                :class="settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span
                  :class="settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'"
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                />
              </button>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">Vendor Approval Alerts</h4>
                <p class="text-sm text-gray-600">Notify when new vendors need approval</p>
              </div>
              <button
                @click="settings.vendorApprovalAlerts = !settings.vendorApprovalAlerts"
                :class="settings.vendorApprovalAlerts ? 'bg-blue-600' : 'bg-gray-200'"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span
                  :class="settings.vendorApprovalAlerts ? 'translate-x-6' : 'translate-x-1'"
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                />
              </button>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">Revenue Reports</h4>
                <p class="text-sm text-gray-600">Weekly revenue summary emails</p>
              </div>
              <button
                @click="settings.revenueReports = !settings.revenueReports"
                :class="settings.revenueReports ? 'bg-blue-600' : 'bg-gray-200'"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span
                  :class="settings.revenueReports ? 'translate-x-6' : 'translate-x-1'"
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Summary -->
      <div class="space-y-6">
        <!-- System Status -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">System Status</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">System Status</span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Online
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Last Backup</span>
              <span class="text-sm font-medium text-gray-900">2 hours ago</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Active Sessions</span>
              <span class="text-sm font-medium text-gray-900">12</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">System Version</span>
              <span class="text-sm font-medium text-gray-900">v2.1.0</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <button
              @click="clearCache"
              class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              Clear System Cache
            </button>
            <button
              @click="backupSystem"
              class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              Create System Backup
            </button>
            <button
              @click="exportSettings"
              class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              Export Settings
            </button>
            <button
              @click="resetSettings"
              class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(false)

const settings = ref({
  systemName: 'Linton Tech Ecosystem',
  supportEmail: 'support@lintontech.com',
  timezone: 'UTC',
  twoFactorEnabled: true,
  sessionTimeout: 30,
  strongPasswordPolicy: true,
  emailNotifications: true,
  vendorApprovalAlerts: true,
  revenueReports: false
})

const saveGeneralSettings = async () => {
  try {
    loading.value = true
    // Implement save logic here
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    alert('Settings saved successfully!')
  } catch (error) {
    alert('Error saving settings')
  } finally {
    loading.value = false
  }
}

const clearCache = () => {
  alert('System cache cleared successfully!')
}

const backupSystem = () => {
  alert('System backup created successfully!')
}

const exportSettings = () => {
  alert('Settings exported successfully!')
}

const resetSettings = () => {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    alert('Settings reset to defaults!')
  }
}
</script> 