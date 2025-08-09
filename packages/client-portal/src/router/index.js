import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/HomeView.vue')
      }
    ]
  },
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/auth/LoginView.vue')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/views/auth/RegisterView.vue')
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: () => import('@/views/auth/ForgotPasswordView.vue')
      }
    ]
  },
  {
    path: '/dashboard',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue')
      },
      {
        path: 'services',
        name: 'services',
        component: () => import('@/views/dashboard/ServicesView.vue')
      },
      {
        path: 'subscription/:id',
        name: 'subscription-details',
        component: () => import('@/views/dashboard/SubscriptionDetailsView.vue')
      },
      {
        path: 'tasks',
        name: 'tasks',
        component: () => import('@/views/dashboard/TasksView.vue')
      },
      {
        path: 'projects',
        name: 'projects',
        component: () => import('@/views/dashboard/ProjectsView.vue')
      },
      {
        path: 'projects/:id',
        name: 'project-details',
        component: () => import('@/views/dashboard/ProjectDetailsView.vue')
      },
      {
        path: 'projects/:id/kanban',
        name: 'project-kanban',
        component: () => import('@/views/dashboard/ProjectKanbanView.vue')
      },
      {
        path: 'notifications',
        name: 'notifications',
        component: () => import('@/views/dashboard/NotificationsView.vue')
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/dashboard/ProfileView.vue')
      },
      {
        path: 'billing',
        name: 'billing',
        component: () => import('@/views/dashboard/BillingView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/dashboard/SettingsView.vue')
      },
      {
        path: 'chat',
        name: 'chat',
        component: () => import('@/components/ChatInterface.vue')
      },
      {
        path: 'sprints',
        name: 'sprints',
        component: () => import('@/views/dashboard/SprintsView.vue')
      },
      {
        path: 'kanban',
        name: 'kanban',
        component: () => import('@/views/dashboard/KanbanView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router 