<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Users Management</h1>
        <p class="text-gray-600 mt-2">Manage all users across the ecosystem</p>
      </div>
      <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
        <span class="text-sm mr-2">➕</span>
        Add User
      </button>
    </div>

    <!-- User Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Users</p>
            <p class="text-3xl font-bold text-gray-900">15.2K</p>
            <p class="text-sm text-green-600">+18% from last month</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">👥</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active Users</p>
            <p class="text-3xl font-bold text-gray-900">12.8K</p>
            <p class="text-sm text-green-600">+15% from last month</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">✅</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">New This Month</p>
            <p class="text-3xl font-bold text-gray-900">2.8K</p>
            <p class="text-sm text-green-600">+23% from last month</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">🆕</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Suspended</p>
            <p class="text-3xl font-bold text-gray-900">156</p>
            <p class="text-sm text-red-600">+5% from last month</p>
          </div>
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">⏸️</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <span class="text-sm">🔍</span>
            </span>
            <input
              type="text"
              placeholder="Search users..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <!-- Filters -->
        <div class="flex gap-2">
          <select class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option>All Roles</option>
            <option>Super Admin</option>
            <option>Vendor Admin</option>
            <option>Client</option>
            <option>Employee</option>
          </select>
          <select class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option>All Status</option>
            <option>Active</option>
            <option>Suspended</option>
            <option>Pending</option>
          </select>
          <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <span class="text-sm">🔧</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organization
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Active
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <span class="text-white font-medium text-sm">{{ user.name[0] }}</span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getRoleClass(user.role)"
                >
                  <span class="mr-1">{{ getRoleIcon(user.role) }}</span>
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.organization }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  <span class="mr-1">{{ user.status === 'Active' ? '✅' : '⏸️' }}</span>
                  {{ user.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ user.lastActive }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ user.joined }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button class="text-blue-600 hover:text-blue-900">
                    <span class="text-sm">👁️</span>
                  </button>
                  <button class="text-green-600 hover:text-green-900">
                    <span class="text-sm">✏️</span>
                  </button>
                  <button 
                    class="text-red-600 hover:text-red-900"
                    @click="toggleUserStatus(user)"
                  >
                    <span class="text-sm">{{ user.status === 'Active' ? '⏸️' : '▶️' }}</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Previous
          </button>
          <button class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing <span class="font-medium">1</span> to <span class="font-medium">10</span> of <span class="font-medium">15,234</span> results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span class="text-sm">←</span>
              </button>
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                1
              </button>
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                3
              </button>
              <button class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span class="text-sm">→</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- User Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent User Activity</h3>
        <div class="space-y-4">
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p class="text-sm font-medium text-gray-900">New user registered: John Doe</p>
              <p class="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p class="text-sm font-medium text-gray-900">User role updated: Admin → Super Admin</p>
              <p class="text-xs text-gray-500">4 hours ago</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <div>
              <p class="text-sm font-medium text-gray-900">User suspended: jane@example.com</p>
              <p class="text-xs text-gray-500">6 hours ago</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <div>
              <p class="text-sm font-medium text-gray-900">Bulk user import completed</p>
              <p class="text-xs text-gray-500">8 hours ago</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Vendor Admins</span>
            <span class="text-sm font-semibold text-gray-900">247</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Clients</span>
            <span class="text-sm font-semibold text-gray-900">8,456</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Employees</span>
            <span class="text-sm font-semibold text-gray-900">6,531</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Super Admins</span>
            <span class="text-sm font-semibold text-gray-900">12</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const users = ref([
  {
    id: 1,
    name: 'John Smith',
    email: 'john@techcorp.com',
    role: 'Vendor Admin',
    organization: 'TechCorp Solutions',
    status: 'Active',
    lastActive: '2 hours ago',
    joined: 'Jan 2024'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@digitaldynamics.com',
    role: 'Vendor Admin',
    organization: 'Digital Dynamics',
    status: 'Active',
    lastActive: '1 hour ago',
    joined: 'Feb 2024'
  },
  {
    id: 3,
    name: 'Mike Wilson',
    email: 'mike@innovatelabs.com',
    role: 'Client',
    organization: 'Innovate Labs',
    status: 'Active',
    lastActive: '30 minutes ago',
    joined: 'Mar 2024'
  },
  {
    id: 4,
    name: 'Lisa Brown',
    email: 'lisa@cloudsystems.com',
    role: 'Employee',
    organization: 'Cloud Systems',
    status: 'Suspended',
    lastActive: '2 days ago',
    joined: 'Dec 2023'
  },
  {
    id: 5,
    name: 'David Lee',
    email: 'david@dataflow.com',
    role: 'Client',
    organization: 'DataFlow Analytics',
    status: 'Active',
    lastActive: '4 hours ago',
    joined: 'Apr 2024'
  }
])

const getRoleClass = (role) => {
  const classes = {
    'Super Admin': 'bg-red-100 text-red-800',
    'Vendor Admin': 'bg-blue-100 text-blue-800',
    'Client': 'bg-green-100 text-green-800',
    'Employee': 'bg-purple-100 text-purple-800'
  }
  return classes[role] || 'bg-gray-100 text-gray-800'
}

const getRoleIcon = (role) => {
  const icons = {
    'Super Admin': '👑',
    'Vendor Admin': '🏢',
    'Client': '👤',
    'Employee': '👷'
  }
  return icons[role] || '👤'
}

const toggleUserStatus = (user) => {
  user.status = user.status === 'Active' ? 'Suspended' : 'Active'
}
</script> 