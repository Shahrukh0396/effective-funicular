<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Super Account Management</h1>
      <p class="mt-2 text-gray-600">Create and manage super accounts with access to all portals</p>
    </div>

    <!-- Access Denied Message -->
    <div v-if="!canManageSuperAccounts" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Access Denied</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>Only super administrators can manage super accounts. Your current role does not have sufficient permissions.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Super Account Button -->
    <div v-if="canManageSuperAccounts" class="mb-6">
      <button
        @click="showCreateModal = true"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Create Super Account
      </button>
    </div>

    <!-- Super Accounts List -->
    <div v-if="canManageSuperAccounts" class="bg-white shadow overflow-hidden sm:rounded-md">
      <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Super Accounts</h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">All super accounts with cross-portal access</p>
      </div>
      
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-flex items-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading super accounts...
        </div>
      </div>

      <ul v-else-if="superAccounts.length === 0" class="divide-y divide-gray-200">
        <li class="px-4 py-8 text-center text-gray-500">
          No super accounts found. Create your first super account to get started.
        </li>
      </ul>

      <ul v-else class="divide-y divide-gray-200">
        <li v-for="account in superAccounts" :key="account._id" class="px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span class="text-sm font-medium text-indigo-600">
                    {{ account.firstName?.[0] }}{{ account.lastName?.[0] }}
                  </span>
                </div>
              </div>
              <div class="ml-4">
                <div class="flex items-center">
                  <h4 class="text-sm font-medium text-gray-900">
                    {{ account.firstName }} {{ account.lastName }}
                  </h4>
                  <span v-if="account.role === 'super_admin'" class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Super Admin
                  </span>
                  <span v-else class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Super Account
                  </span>
                </div>
                <div class="text-sm text-gray-500">
                  {{ account.email }}
                </div>
                <div class="text-xs text-gray-400">
                  Base Role: {{ account.role }} | Created: {{ formatDate(account.superAccountCreatedAt || account.createdAt) }}
                </div>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <span :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                account.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              ]">
                {{ account.isActive ? 'Active' : 'Inactive' }}
              </span>
              
              <button
                v-if="account.role !== 'super_admin' || account.isSuperAccount"
                @click="editAccount(account)"
                class="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                Edit
              </button>
              
              <button
                v-if="account.role !== 'super_admin' || account.isSuperAccount"
                @click="deleteAccount(account._id)"
                class="text-red-600 hover:text-red-900 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Create Super Account Modal -->
    <div v-if="showCreateModal && canManageSuperAccounts" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Create Super Account</h3>
          
          <form @submit.prevent="createSuperAccount">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  v-model="newAccount.firstName"
                  type="text"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  v-model="newAccount.lastName"
                  type="text"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input
                  v-model="newAccount.email"
                  type="email"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Password</label>
                <input
                  v-model="newAccount.password"
                  type="password"
                  required
                  minlength="8"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Base Role</label>
                <select
                  v-model="newAccount.baseRole"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a base role</option>
                  <option value="client">Client</option>
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Company (Optional)</label>
                <input
                  v-model="newAccount.company"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Position (Optional)</label>
                <input
                  v-model="newAccount.position"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div class="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                @click="showCreateModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="creating"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {{ creating ? 'Creating...' : 'Create Account' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Super Account Modal -->
    <div v-if="showEditModal && canManageSuperAccounts" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Super Account</h3>
          
          <form @submit.prevent="updateSuperAccount">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  v-model="editingAccount.firstName"
                  type="text"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  v-model="editingAccount.lastName"
                  type="text"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Company</label>
                <input
                  v-model="editingAccount.company"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Position</label>
                <input
                  v-model="editingAccount.position"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Status</label>
                <select
                  v-model="editingAccount.isActive"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option :value="true">Active</option>
                  <option :value="false">Inactive</option>
                </select>
              </div>
            </div>
            
            <div class="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                @click="showEditModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="updating"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {{ updating ? 'Updating...' : 'Update Account' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()

// Computed properties
const canManageSuperAccounts = computed(() => authStore.isSuperAdmin)

// State
const superAccounts = ref([])
const loading = ref(false)
const creating = ref(false)
const updating = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)

const newAccount = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  baseRole: '',
  company: '',
  position: ''
})

const editingAccount = ref({})

// Methods
const fetchSuperAccounts = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/super-accounts', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      superAccounts.value = data
    } else {
      console.error('Failed to fetch super accounts')
    }
  } catch (error) {
    console.error('Error fetching super accounts:', error)
  } finally {
    loading.value = false
  }
}

const createSuperAccount = async () => {
  creating.value = true
  try {
    const response = await fetch('/api/super-accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(newAccount.value)
    })
    
    if (response.ok) {
      const data = await response.json()
      superAccounts.value.unshift(data.superAccount)
      showCreateModal.value = false
      resetNewAccount()
      alert('Super account created successfully!')
    } else {
      const error = await response.json()
      alert(error.message || 'Failed to create super account')
    }
  } catch (error) {
    console.error('Error creating super account:', error)
    alert('Error creating super account')
  } finally {
    creating.value = false
  }
}

const editAccount = (account) => {
  editingAccount.value = { ...account }
  showEditModal.value = true
}

const updateSuperAccount = async () => {
  updating.value = true
  try {
    const response = await fetch(`/api/super-accounts/${editingAccount.value._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        firstName: editingAccount.value.firstName,
        lastName: editingAccount.value.lastName,
        company: editingAccount.value.company,
        position: editingAccount.value.position,
        isActive: editingAccount.value.isActive
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      const index = superAccounts.value.findIndex(acc => acc._id === editingAccount.value._id)
      if (index !== -1) {
        superAccounts.value[index] = { ...superAccounts.value[index], ...data.superAccount }
      }
      showEditModal.value = false
      alert('Super account updated successfully!')
    } else {
      const error = await response.json()
      alert(error.message || 'Failed to update super account')
    }
  } catch (error) {
    console.error('Error updating super account:', error)
    alert('Error updating super account')
  } finally {
    updating.value = false
  }
}

const deleteAccount = async (accountId) => {
  if (!confirm('Are you sure you want to delete this super account? This action cannot be undone.')) {
    return
  }
  
  try {
    const response = await fetch(`/api/super-accounts/${accountId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.ok) {
      superAccounts.value = superAccounts.value.filter(acc => acc._id !== accountId)
      alert('Super account deleted successfully!')
    } else {
      const error = await response.json()
      alert(error.message || 'Failed to delete super account')
    }
  } catch (error) {
    console.error('Error deleting super account:', error)
    alert('Error deleting super account')
  }
}

const resetNewAccount = () => {
  newAccount.value = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    baseRole: '',
    company: '',
    position: ''
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  fetchSuperAccounts()
})
</script> 