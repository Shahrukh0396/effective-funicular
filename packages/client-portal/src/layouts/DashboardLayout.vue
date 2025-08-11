<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <img class="h-8 w-auto" src="@/assets/logo.svg" alt="Logo" />
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                v-for="item in navigation"
                :key="item.name"
                :to="item.to"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                :class="[
                  $route.name === item.to.name
                    ? 'border-indigo-500 text-gray-900 border-b-2'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                ]"
              >
                {{ item.name }}
              </router-link>
            </div>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:items-center">
            <!-- Portal Switcher for Super Accounts -->
            <div v-if="isSuperAccount" class="mr-4">
              <PortalSwitcher />
            </div>
            <div class="ml-3 relative">
              <button
                @click="userMenuOpen = !userMenuOpen"
                class="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span class="sr-only">Open user menu</span>
                <div class="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span class="text-sm font-medium text-gray-700">
                    {{ authStore.user?.email?.[0].toUpperCase() }}
                  </span>
                </div>
              </button>

              <!-- User dropdown -->
              <div
                v-if="userMenuOpen"
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5"
                role="menu"
              >
                <router-link
                  to="/dashboard/settings"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  @click="userMenuOpen = false"
                >
                  Settings
                </router-link>
                <button
                  @click="logout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import PortalSwitcher from '@/components/PortalSwitcher.vue'

const router = useRouter()
const authStore = useAuthStore()
const userMenuOpen = ref(false)

const navigation = [
  { name: 'Dashboard', to: { name: 'dashboard' } },
  { name: 'Projects', to: { name: 'projects' } },
  { name: 'Sprints', to: { name: 'sprints' } },
  { name: 'Kanban Board', to: { name: 'kanban' } },
  { name: 'Chat', to: { name: 'chat' } },
  { name: 'Billing', to: { name: 'billing' } }
]

// Check if user is a super account
const isSuperAccount = computed(() => {
  return authStore.user?.role === 'super_admin' || authStore.user?.isSuperAccount
})

async function logout() {
  try {
    await authStore.logout()
    router.push({ name: 'login' })
  } catch (error) {
    console.error('Error logging out:', error)
  }
}
</script> 