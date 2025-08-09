import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { attendanceService } from '../services/attendanceService'

export const useAttendanceStore = defineStore('attendance', () => {
  const currentStatus = ref(null)
  const attendanceHistory = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed properties
  const isCheckedIn = computed(() => currentStatus.value?.checkedIn || false)
  const isCheckedOut = computed(() => currentStatus.value?.checkedOut || false)
  const onBreak = computed(() => currentStatus.value?.onBreak || false)
  
  const canCheckIn = computed(() => !isCheckedIn.value)
  const canCheckOut = computed(() => isCheckedIn.value && !isCheckedOut.value)
  const canStartBreak = computed(() => isCheckedIn.value && !isCheckedOut.value && !onBreak.value)
  const canEndBreak = computed(() => onBreak.value)
  const totalHoursToday = computed(() => currentStatus.value?.totalHours || 0)

  // Methods
  const fetchCurrentStatus = async () => {
    loading.value = true
    error.value = null
    try {
      console.log('🔍 Attendance Store - Fetching current status...')
      const response = await attendanceService.getAttendanceStatus()
      currentStatus.value = response
      console.log('🔍 Attendance Store - Status updated:', response)
      return response
    } catch (err) {
      error.value = err.message || 'Failed to fetch attendance status'
      console.error('Error fetching attendance status:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const checkIn = async () => {
    loading.value = true
    error.value = null
    try {
      console.log('🔍 Attendance Store - Checking in...')
      const response = await attendanceService.checkIn()
      await fetchCurrentStatus()
      console.log('🔍 Attendance Store - Check-in successful')
      return response
    } catch (err) {
      error.value = err.message || 'Failed to check in'
      console.error('Error checking in:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const checkOut = async () => {
    loading.value = true
    error.value = null
    try {
      console.log('🔍 Attendance Store - Checking out...')
      const response = await attendanceService.checkOut()
      await fetchCurrentStatus()
      console.log('🔍 Attendance Store - Check-out successful')
      return response
    } catch (err) {
      error.value = err.message || 'Failed to check out'
      console.error('Error checking out:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAttendanceHistory = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      console.log('🔍 Attendance Store - Fetching attendance history...')
      const response = await attendanceService.getAttendanceHistory(filters)
      attendanceHistory.value = Array.isArray(response) ? response : []
      console.log('🔍 Attendance Store - Attendance history:', attendanceHistory.value)
      return attendanceHistory.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch attendance history'
      console.error('Error fetching attendance history:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const startBreak = async (reason = 'other', notes = '') => {
    loading.value = true
    error.value = null
    try {
      console.log('🔍 Attendance Store - Starting break...')
      const response = await attendanceService.startBreak(reason, notes)
      await fetchCurrentStatus()
      console.log('🔍 Attendance Store - Break started successfully')
      return response
    } catch (err) {
      error.value = err.message || 'Failed to start break'
      console.error('Error starting break:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const endBreak = async (notes = '') => {
    loading.value = true
    error.value = null
    try {
      console.log('🔍 Attendance Store - Ending break...')
      const response = await attendanceService.endBreak(notes)
      await fetchCurrentStatus()
      console.log('🔍 Attendance Store - Break ended successfully')
      return response
    } catch (err) {
      error.value = err.message || 'Failed to end break'
      console.error('Error ending break:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    currentStatus,
    attendanceHistory,
    loading,
    error,
    isCheckedIn,
    isCheckedOut,
    onBreak,
    canCheckIn,
    canCheckOut,
    canStartBreak,
    canEndBreak,
    totalHoursToday,
    fetchCurrentStatus,
    checkIn,
    checkOut,
    startBreak,
    endBreak,
    fetchAttendanceHistory,
    clearError
  }
}) 