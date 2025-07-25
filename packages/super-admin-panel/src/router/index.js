import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('../layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/DashboardView.vue')
      },
      {
        path: 'vendors',
        name: 'Vendors',
        component: () => import('../views/VendorsView.vue')
      },
      {
        path: 'vendors/white-label',
        name: 'WhiteLabelVendors',
        component: () => import('../views/WhiteLabelVendorsView.vue')
      },
      {
        path: 'vendors/linton-tech',
        name: 'LintonTechClients',
        component: () => import('../views/LintonTechClientsView.vue')
      },
      {
        path: 'vendors/:id',
        name: 'VendorDetails',
        component: () => import('../views/VendorDetailsView.vue')
      },
      {
        path: 'vendors/create',
        name: 'CreateVendor',
        component: () => import('../views/CreateVendorView.vue')
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('../views/AnalyticsView.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/UsersView.vue')
      },
      {
        path: 'revenue',
        name: 'Revenue',
        component: () => import('../views/RevenueView.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/SettingsView.vue')
      },
      {
        path: 'client-requests',
        name: 'ClientRequests',
        component: () => import('../views/ClientRequestsView.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/ProfileView.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth !== false) {
    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      // Try to check auth status
      const isAuthenticated = await authStore.checkAuth()
      if (!isAuthenticated) {
        next('/login')
        return
      }
    }
    
    // Check if user is super admin
    if (!authStore.isSuperAdmin) {
      next('/login')
      return
    }
  }
  
  // If user is authenticated and trying to access login, redirect to dashboard
  if (to.name === 'Login' && authStore.isAuthenticated) {
    next('/')
    return
  }
  
  next()
})

export default router 