import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import Landing from '../views/Landing.vue'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import MyTasks from '../views/MyTasks.vue'
import AvailableTasks from '../views/AvailableTasks.vue'
import Projects from '../views/Projects.vue'
import ProjectDetails from '../views/ProjectDetails.vue'
import Profile from '../views/Profile.vue'
import Attendance from '../views/Attendance.vue'
import Sprints from '../views/Sprints.vue'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: Landing,
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
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
    path: '/tasks',
    name: 'MyTasks',
    component: MyTasks,
    meta: { requiresAuth: true }
  },
  {
    path: '/available-tasks',
    name: 'AvailableTasks',
    component: AvailableTasks,
    meta: { requiresAuth: true }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: Projects,
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/:id',
    name: 'ProjectDetails',
    component: ProjectDetails,
    meta: { requiresAuth: true }
  },
  {
    path: '/attendance',
    name: 'Attendance',
    component: Attendance,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
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
  history: createWebHistory('/'),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // Use the auth store's computed isAuthenticated property instead of checkAuth()
  const isAuthenticated = authStore.isAuthenticated

  console.log('🔐 Employee Router Guard:', {
    to: to.path,
    from: from.path,
    isAuthenticated,
    requiresAuth,
    token: !!authStore.token,
    user: !!authStore.user
  })

  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if trying to access a protected route while not authenticated
    console.log('🔐 Redirecting to login - requires auth but not authenticated')
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    // Redirect to home if trying to access login while authenticated
    console.log('🔐 Redirecting to home - authenticated user trying to access login')
    next('/home')
  } else if (to.path === '/' && isAuthenticated) {
    // Redirect to home if authenticated user on landing page
    console.log('🔐 Redirecting to home - authenticated user on landing page')
    next('/home')
  } else {
    console.log('🔐 Proceeding to:', to.path)
    next()
  }
})

export default router 