<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Revenue Management</h1>
        <p class="text-gray-600 mt-2">Track and manage all revenue streams across the ecosystem</p>
      </div>
      <div class="flex space-x-2">
        <select class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
          <option>Last 6 Months</option>
          <option>Last Year</option>
        </select>
        <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          <span class="text-sm mr-2">📊</span>
          Export Report
        </button>
      </div>
    </div>

    <!-- Revenue Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Revenue</p>
            <p class="text-3xl font-bold text-gray-900">$2.4M</p>
            <p class="text-sm text-green-600">+23% from last month</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">💰</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">White-Label Revenue</p>
            <p class="text-3xl font-bold text-gray-900">$1.2M</p>
            <p class="text-sm text-green-600">+18% from last month</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">🎨</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Subscription Revenue</p>
            <p class="text-3xl font-bold text-gray-900">$720K</p>
            <p class="text-sm text-green-600">+15% from last month</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">📋</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Premium Features</p>
            <p class="text-3xl font-bold text-gray-900">$360K</p>
            <p class="text-sm text-green-600">+28% from last month</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">⭐</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Revenue Breakdown -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Revenue by Source</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-purple-500 rounded mr-3"></div>
              <span class="text-sm text-gray-700">White-Label (50%)</span>
            </div>
            <span class="text-sm font-semibold text-gray-900">$1,200,000</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-blue-500 rounded mr-3"></div>
              <span class="text-sm text-gray-700">Standard Subscriptions (30%)</span>
            </div>
            <span class="text-sm font-semibold text-gray-900">$720,000</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
              <span class="text-sm text-gray-700">Premium Features (15%)</span>
            </div>
            <span class="text-sm font-semibold text-gray-900">$360,000</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-green-500 rounded mr-3"></div>
              <span class="text-sm text-gray-700">Other Services (5%)</span>
            </div>
            <span class="text-sm font-semibold text-gray-900">$120,000</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Monthly Growth</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">January</span>
            <span class="text-sm font-semibold text-green-600">$1.8M (+12%)</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">February</span>
            <span class="text-sm font-semibold text-green-600">$2.0M (+11%)</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">March</span>
            <span class="text-sm font-semibold text-green-600">$2.2M (+10%)</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">April</span>
            <span class="text-sm font-semibold text-green-600">$2.4M (+9%)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Revenue Generators -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Revenue Generators</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendor
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Growth
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clients
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="vendor in topVendors" :key="vendor.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <span class="text-white font-medium text-sm">{{ vendor.name[0] }}</span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ vendor.name }}</div>
                    <div class="text-sm text-gray-500">{{ vendor.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="vendor.type === 'White-Label' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'"
                >
                  <span class="mr-1">{{ vendor.type === 'White-Label' ? '🎨' : '🏢' }}</span>
                  {{ vendor.type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                ${{ vendor.revenue.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-green-600">+{{ vendor.growth }}%</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ vendor.clients }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button class="text-blue-600 hover:text-blue-900">
                    <span class="text-sm">👁️</span>
                  </button>
                  <button class="text-green-600 hover:text-green-900">
                    <span class="text-sm">📊</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Revenue Analytics -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Average Revenue per Vendor</span>
            <span class="text-lg font-semibold text-blue-600">$9,720</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Average Revenue per Client</span>
            <span class="text-lg font-semibold text-green-600">$158</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Monthly Recurring Revenue</span>
            <span class="text-lg font-semibold text-purple-600">$2.4M</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Annual Recurring Revenue</span>
            <span class="text-lg font-semibold text-yellow-600">$28.8M</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Paid</span>
            <span class="text-sm font-semibold text-green-600">$2.2M (92%)</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Pending</span>
            <span class="text-sm font-semibold text-yellow-600">$120K (5%)</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Overdue</span>
            <span class="text-sm font-semibold text-red-600">$60K (3%)</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Failed</span>
            <span class="text-sm font-semibold text-red-600">$20K (1%)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <span class="text-sm">✅</span>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">TechCorp Solutions - White-Label</p>
              <p class="text-xs text-gray-500">Monthly subscription</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm font-semibold text-gray-900">$2,450</p>
            <p class="text-xs text-green-600">Paid</p>
          </div>
        </div>
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <span class="text-sm">⏳</span>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Digital Dynamics - Premium</p>
              <p class="text-xs text-gray-500">Feature upgrade</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm font-semibold text-gray-900">$850</p>
            <p class="text-xs text-yellow-600">Pending</p>
          </div>
        </div>
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <span class="text-sm">✅</span>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Innovate Labs - Standard</p>
              <p class="text-xs text-gray-500">Annual subscription</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm font-semibold text-gray-900">$1,200</p>
            <p class="text-xs text-green-600">Paid</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const topVendors = ref([
  {
    id: 1,
    name: 'TechCorp Solutions',
    email: 'admin@techcorp.com',
    type: 'White-Label',
    revenue: 45230,
    growth: 15,
    clients: 45
  },
  {
    id: 2,
    name: 'Digital Dynamics',
    email: 'contact@digitaldynamics.com',
    type: 'White-Label',
    revenue: 38450,
    growth: 12,
    clients: 32
  },
  {
    id: 3,
    name: 'Innovate Labs',
    email: 'hello@innovatelabs.com',
    type: 'Standard',
    revenue: 32180,
    growth: 8,
    clients: 28
  },
  {
    id: 4,
    name: 'Cloud Systems',
    email: 'info@cloudsystems.com',
    type: 'White-Label',
    revenue: 28900,
    growth: 18,
    clients: 25
  },
  {
    id: 5,
    name: 'DataFlow Analytics',
    email: 'admin@dataflow.com',
    type: 'Standard',
    revenue: 25600,
    growth: 22,
    clients: 30
  }
])
</script> 