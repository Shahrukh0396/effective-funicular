<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">White-Label Management</h1>
        <p class="text-gray-600 mt-2">Manage white-label vendors and their branding configurations</p>
      </div>
      <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
        <span class="text-sm mr-2">🎨</span>
        Setup White-Label
      </button>
    </div>

    <!-- White-Label Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">White-Label Vendors</p>
            <p class="text-3xl font-bold text-gray-900">89</p>
            <p class="text-sm text-green-600">+8% from last month</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">🎨</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active Brands</p>
            <p class="text-3xl font-bold text-gray-900">156</p>
            <p class="text-sm text-green-600">+12% from last month</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">🏷️</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Custom Domains</p>
            <p class="text-3xl font-bold text-gray-900">67</p>
            <p class="text-sm text-green-600">+15% from last month</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">🌐</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Revenue Share</p>
            <p class="text-3xl font-bold text-gray-900">$1.2M</p>
            <p class="text-sm text-green-600">+23% from last month</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">💰</span>
          </div>
        </div>
      </div>
    </div>

    <!-- White-Label Vendors Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">White-Label Vendors</h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendor
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domain
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clients
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="vendor in whiteLabelVendors" :key="vendor.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                    <span class="text-white font-medium text-sm">{{ vendor.name[0] }}</span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ vendor.name }}</div>
                    <div class="text-sm text-gray-500">{{ vendor.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-8 h-8 rounded bg-gray-100 flex items-center justify-center mr-3">
                    <span class="text-xs font-medium">{{ vendor.brandName[0] }}</span>
                  </div>
                  <span class="text-sm font-medium text-gray-900">{{ vendor.brandName }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span class="text-sm text-gray-900">{{ vendor.domain }}</span>
                  <span v-if="vendor.domainStatus === 'Active'" class="ml-2 text-xs text-green-600">✅</span>
                  <span v-else class="ml-2 text-xs text-red-600">❌</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="vendor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  <span class="mr-1">{{ vendor.status === 'Active' ? '✅' : '⏸️' }}</span>
                  {{ vendor.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ vendor.clients }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${{ vendor.revenue.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button class="text-blue-600 hover:text-blue-900">
                    <span class="text-sm">👁️</span>
                  </button>
                  <button class="text-purple-600 hover:text-purple-900">
                    <span class="text-sm">🎨</span>
                  </button>
                  <button class="text-green-600 hover:text-green-900">
                    <span class="text-sm">✏️</span>
                  </button>
                  <button 
                    class="text-red-600 hover:text-red-900"
                    @click="toggleVendorStatus(vendor)"
                  >
                    <span class="text-sm">{{ vendor.status === 'Active' ? '⏸️' : '▶️' }}</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Branding Configuration -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Branding Updates</h3>
        <div class="space-y-4">
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <div>
              <p class="text-sm font-medium text-gray-900">TechCorp updated their logo</p>
              <p class="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p class="text-sm font-medium text-gray-900">Digital Dynamics changed color scheme</p>
              <p class="text-xs text-gray-500">4 hours ago</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p class="text-sm font-medium text-gray-900">New white-label vendor onboarded</p>
              <p class="text-xs text-gray-500">6 hours ago</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Domain Management</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">techcorp.app</p>
              <p class="text-xs text-gray-500">TechCorp Solutions</p>
            </div>
            <span class="text-xs text-green-600">✅ Active</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">digitaldynamics.co</p>
              <p class="text-xs text-gray-500">Digital Dynamics</p>
            </div>
            <span class="text-xs text-green-600">✅ Active</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">cloudsystems.tech</p>
              <p class="text-xs text-gray-500">Cloud Systems</p>
            </div>
            <span class="text-xs text-red-600">❌ Pending</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
          <span class="text-2xl mb-2">🎨</span>
          <span class="text-sm font-medium text-gray-900">Setup Branding</span>
        </button>
        <button class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
          <span class="text-2xl mb-2">🌐</span>
          <span class="text-sm font-medium text-gray-900">Manage Domains</span>
        </button>
        <button class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
          <span class="text-2xl mb-2">📊</span>
          <span class="text-sm font-medium text-gray-900">View Analytics</span>
        </button>
        <button class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors">
          <span class="text-2xl mb-2">⚙️</span>
          <span class="text-sm font-medium text-gray-900">Settings</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const whiteLabelVendors = ref([
  {
    id: 1,
    name: 'TechCorp Solutions',
    email: 'admin@techcorp.com',
    brandName: 'TechCorp',
    domain: 'techcorp.app',
    domainStatus: 'Active',
    status: 'Active',
    clients: 45,
    revenue: 45230
  },
  {
    id: 2,
    name: 'Digital Dynamics',
    email: 'contact@digitaldynamics.com',
    brandName: 'DigitalDynamics',
    domain: 'digitaldynamics.co',
    domainStatus: 'Active',
    status: 'Active',
    clients: 32,
    revenue: 38450
  },
  {
    id: 3,
    name: 'Cloud Systems',
    email: 'info@cloudsystems.com',
    brandName: 'CloudSystems',
    domain: 'cloudsystems.tech',
    domainStatus: 'Pending',
    status: 'Suspended',
    clients: 15,
    revenue: 12500
  },
  {
    id: 4,
    name: 'Innovate Labs',
    email: 'hello@innovatelabs.com',
    brandName: 'InnovateLabs',
    domain: 'innovatelabs.io',
    domainStatus: 'Active',
    status: 'Active',
    clients: 28,
    revenue: 32180
  }
])

const toggleVendorStatus = (vendor) => {
  vendor.status = vendor.status === 'Active' ? 'Suspended' : 'Active'
}
</script> 