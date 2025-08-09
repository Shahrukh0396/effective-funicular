import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import './config/axios'
import tokenRefreshService from './services/tokenRefreshService'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialize token refresh service when app starts
const pinia = createPinia()
app.use(pinia)

// Check if user is already logged in and initialize token refresh
const token = localStorage.getItem('admin_token')
const refreshToken = localStorage.getItem('admin_refresh_token')
if (token && refreshToken) {
  // Initialize token refresh service
  setTimeout(() => {
    tokenRefreshService.init()
  }, 1000) // Small delay to ensure stores are initialized
}

app.mount('#app') 