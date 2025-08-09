import './assets/tailwind.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)

// Use Pinia for state management
app.use(createPinia())

// Use Vue Router
app.use(router)

// Initialize auth store
const authStore = useAuthStore()
authStore.initialize()

app.mount('#app')
