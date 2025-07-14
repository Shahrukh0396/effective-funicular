import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
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
import Login from '../views/Login.vue'

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
    path: '/chat',
    name: 'Chat',
    component: () => import('../components/ChatInterface.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory('/admin/'),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresSuperAdmin = to.matched.some(record => record.meta.requiresSuperAdmin)

  // Check if the user is authenticated
  const isAuthenticated = await authStore.checkAuth()

  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if trying to access a protected route while not authenticated
    next('/login')
  } else if (requiresSuperAdmin && !authStore.isSuperAdmin) {
    // Redirect to dashboard if trying to access super admin route without permissions
    next('/')
  } else if (to.path === '/login' && isAuthenticated) {
    // Redirect to dashboard if trying to access login while authenticated
    next('/dashboard')
  } else {
    next()
  }
})

export default router 