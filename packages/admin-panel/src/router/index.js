import { createRouter, createWebHistory } from 'vue-router'
import { useWebSocketAuthStore } from '../stores/websocketAuthStore'
import Landing from '../views/Landing.vue'
import Dashboard from '../views/Dashboard.vue'
import Clients from '../views/Clients.vue'
import Employees from '../views/Employees.vue'
import Tasks from '../views/Tasks.vue'
import Subscriptions from '../views/Subscriptions.vue'
import SuperAccounts from '../views/SuperAccounts.vue'
import Analytics from '../views/Analytics.vue'
import Projects from '../views/Projects.vue'
import Sprints from '../views/Sprints.vue'
import Attendance from '../views/Attendance.vue'
import Support from '../views/Support.vue'
import ChatInterface from '../components/ChatInterface.vue'
import Login from '../views/Login.vue'
import MFASetup from '../views/MFASetup.vue'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: Landing,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/mfa-setup',
    name: 'MFASetup',
    component: MFASetup,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/clients',
    name: 'Clients',
    component: Clients,
    meta: { requiresAuth: true }
  },
  {
    path: '/employees',
    name: 'Employees',
    component: Employees,
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: Tasks,
    meta: { requiresAuth: true }
  },
  {
    path: '/subscriptions',
    name: 'Subscriptions',
    component: Subscriptions,
    meta: { requiresAuth: true }
  },
  {
    path: '/super-accounts',
    name: 'SuperAccounts',
    component: SuperAccounts,
    meta: { requiresAuth: true, requiresSuperAdmin: true }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: Analytics,
    meta: { requiresAuth: true }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: Projects,
    meta: { requiresAuth: true }
  },
  {
    path: '/sprints',
    name: 'Sprints',
    component: Sprints,
    meta: { requiresAuth: true }
  },
  {
    path: '/attendance',
    name: 'Attendance',
    component: Attendance,
    meta: { requiresAuth: true }
  },
  {
    path: '/support',
    name: 'Support',
    component: Support,
    meta: { requiresAuth: true }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: ChatInterface,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useWebSocketAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresSuperAdmin = to.matched.some(record => record.meta.requiresSuperAdmin)

  // Check if the user is authenticated using the WebSocket auth store
  const isAuthenticated = authStore.isAuthenticated

  console.log('🔐 Router Guard:', {
    to: to.path,
    from: from.path,
    isAuthenticated,
    requiresAuth,
    requiresSuperAdmin,
    user: authStore.user,
    token: !!authStore.token
  })

  if (requiresAuth && !isAuthenticated) {
    console.log('🔐 Redirecting to login - requires auth but not authenticated')
    next('/login')
  } else if (requiresSuperAdmin && !authStore.isSuperAdmin) {
    console.log('🔐 Redirecting to dashboard - requires super admin but not super admin')
    next('/dashboard')
  } else if (to.path === '/login' && isAuthenticated) {
    console.log('🔐 Redirecting to dashboard - authenticated user trying to access login')
    next('/dashboard')
  } else if (to.path === '/' && isAuthenticated) {
    console.log('🔐 Redirecting to dashboard - authenticated user on landing page')
    next('/dashboard')
  } else {
    console.log('🔐 Proceeding to:', to.path)
    next()
  }
})

export default router 