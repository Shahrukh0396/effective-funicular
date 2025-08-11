import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useTenantBrandingStore = defineStore('tenantBranding', () => {
  const branding = ref(null)
  const loading = ref(false)

  // Dynamic branding based on vendor context
  const primaryColor = computed(() => branding.value?.primaryColor || '#3B82F6')
  const secondaryColor = computed(() => branding.value?.secondaryColor || '#1F2937')
  const companyName = computed(() => branding.value?.companyName || 'Your Company')
  const logo = computed(() => branding.value?.logo || null)
  const logoDark = computed(() => branding.value?.logoDark || null)
  const favicon = computed(() => branding.value?.favicon || null)
  const tagline = computed(() => branding.value?.tagline || '')
  const removeLintonBranding = computed(() => branding.value?.removeLintonBranding || false)

  // CSS variables for dynamic theming
  const cssVariables = computed(() => ({
    '--primary-color': primaryColor.value,
    '--secondary-color': secondaryColor.value,
    '--primary-hover': adjustBrightness(primaryColor.value, -10),
    '--secondary-hover': adjustBrightness(secondaryColor.value, -10),
  }))

  // Inject branding into DOM
  const injectBranding = () => {
    if (branding.value) {
      // Apply CSS variables
      const root = document.documentElement
      Object.entries(cssVariables.value).forEach(([key, value]) => {
        root.style.setProperty(key, value)
      })

      // Inject custom CSS if provided
      if (branding.value.customCss) {
        injectCustomCSS(branding.value.customCss)
      }

      // Inject custom JS if provided
      if (branding.value.customJs) {
        injectCustomJS(branding.value.customJs)
      }

      // Update favicon
      if (favicon.value) {
        updateFavicon(favicon.value)
      }
    }
  }

  // Load branding from API
  const loadBranding = async () => {
    try {
      loading.value = true
      const response = await axios.get('/api/tenant/branding')
      branding.value = response.data.data
      injectBranding()
      return { success: true }
    } catch (error) {
      console.error('Load branding error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load branding'
      }
    } finally {
      loading.value = false
    }
  }

  // Update branding
  const updateBranding = async (brandingData) => {
    try {
      loading.value = true
      const response = await axios.put('/api/tenant/branding', brandingData)
      branding.value = response.data.data
      injectBranding()
      return { success: true }
    } catch (error) {
      console.error('Update branding error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update branding'
      }
    } finally {
      loading.value = false
    }
  }

  // Helper function to adjust color brightness
  const adjustBrightness = (hex, percent) => {
    const num = parseInt(hex.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = (num >> 8 & 0x00FF) + amt
    const B = (num & 0x0000FF) + amt
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
  }

  // Inject custom CSS
  const injectCustomCSS = (css) => {
    const style = document.createElement('style')
    style.id = 'tenant-custom-css'
    style.textContent = css
    document.head.appendChild(style)
  }

  // Inject custom JS
  const injectCustomJS = (js) => {
    const script = document.createElement('script')
    script.id = 'tenant-custom-js'
    script.textContent = js
    document.head.appendChild(script)
  }

  // Update favicon
  const updateFavicon = (faviconUrl) => {
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link')
    link.type = 'image/x-icon'
    link.rel = 'shortcut icon'
    link.href = faviconUrl
    document.getElementsByTagName('head')[0].appendChild(link)
  }

  // Clear branding
  const clearBranding = () => {
    branding.value = null
    const customCSS = document.getElementById('tenant-custom-css')
    const customJS = document.getElementById('tenant-custom-js')
    if (customCSS) customCSS.remove()
    if (customJS) customJS.remove()
  }

  return {
    branding,
    loading,
    primaryColor,
    secondaryColor,
    companyName,
    logo,
    logoDark,
    favicon,
    tagline,
    removeLintonBranding,
    cssVariables,
    loadBranding,
    updateBranding,
    injectBranding,
    clearBranding
  }
}) 