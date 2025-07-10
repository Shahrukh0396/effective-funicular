<template>
  <div class="time-tracking">
    <div class="time-tracking-header">
      <h3 class="text-lg font-medium">Time Tracking</h3>
      <button
        v-if="!isTracking"
        @click="startTracking"
        class="start-tracking-btn"
      >
        Start Tracking
      </button>
      <button
        v-else
        @click="stopTracking"
        class="stop-tracking-btn"
      >
        Stop Tracking
      </button>
    </div>

    <div v-if="isTracking" class="current-timer">
      <div class="timer-display">
        <span class="timer-value">{{ formatTime(currentTime) }}</span>
      </div>
      <div class="timer-description">
        <input
          v-model="currentDescription"
          type="text"
          placeholder="What are you working on?"
          class="description-input"
        />
      </div>
    </div>

    <div class="time-entries">
      <h4 class="text-sm font-medium text-gray-600 mb-2">Time Entries</h4>
      <div v-if="timeEntries.length === 0" class="no-entries">
        No time entries yet
      </div>
      <div v-else class="entries-list">
        <div
          v-for="entry in timeEntries"
          :key="entry.id"
          class="time-entry"
        >
          <div class="entry-header">
            <span class="entry-date">{{ formatDate(entry.date) }}</span>
            <span class="entry-duration">{{ formatDuration(entry.duration) }}</span>
          </div>
          <div class="entry-description">{{ entry.description }}</div>
        </div>
      </div>
    </div>

    <div class="time-summary">
      <div class="summary-item">
        <span class="summary-label">Today</span>
        <span class="summary-value">{{ formatDuration(todayTotal) }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">This Week</span>
        <span class="summary-value">{{ formatDuration(weekTotal) }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Total</span>
        <span class="summary-value">{{ formatDuration(totalTime) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { taskService } from '@/services/taskService'
import { formatDate, formatTime, formatDuration } from '@/utils/date'

const props = defineProps({
  taskId: {
    type: String,
    required: true
  }
})

const isTracking = ref(false)
const currentTime = ref(0)
const currentDescription = ref('')
const timeEntries = ref([])
const timerInterval = ref(null)

const todayTotal = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return timeEntries.value
    .filter(entry => entry.date.startsWith(today))
    .reduce((total, entry) => total + entry.duration, 0)
})

const weekTotal = computed(() => {
  const today = new Date()
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
  return timeEntries.value
    .filter(entry => new Date(entry.date) >= weekStart)
    .reduce((total, entry) => total + entry.duration, 0)
})

const totalTime = computed(() => {
  return timeEntries.value.reduce((total, entry) => total + entry.duration, 0)
})

onMounted(async () => {
  await loadTimeEntries()
})

onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})

async function loadTimeEntries() {
  try {
    const entries = await taskService.getTimeEntries(props.taskId)
    timeEntries.value = entries
  } catch (error) {
    console.error('Error loading time entries:', error)
  }
}

function startTracking() {
  isTracking.value = true
  currentTime.value = 0
  timerInterval.value = setInterval(() => {
    currentTime.value++
  }, 1000)
}

async function stopTracking() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }

  if (currentTime.value > 0) {
    try {
      const timeEntry = {
        taskId: props.taskId,
        duration: currentTime.value,
        description: currentDescription.value || 'No description',
        date: new Date().toISOString()
      }

      await taskService.logTime(props.taskId, timeEntry)
      await loadTimeEntries()

      isTracking.value = false
      currentTime.value = 0
      currentDescription.value = ''
    } catch (error) {
      console.error('Error saving time entry:', error)
    }
  }
}
</script>

<style scoped>
.time-tracking {
  @apply bg-white rounded-lg p-4 shadow-sm;
}

.time-tracking-header {
  @apply flex items-center justify-between mb-4;
}

.start-tracking-btn {
  @apply bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors;
}

.stop-tracking-btn {
  @apply bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors;
}

.current-timer {
  @apply mb-6 p-4 bg-gray-50 rounded-lg;
}

.timer-display {
  @apply text-3xl font-mono text-gray-900 mb-2;
}

.description-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.time-entries {
  @apply mb-6;
}

.no-entries {
  @apply text-gray-500 text-sm italic;
}

.entries-list {
  @apply space-y-2;
}

.time-entry {
  @apply p-3 bg-gray-50 rounded-lg;
}

.entry-header {
  @apply flex items-center justify-between mb-1;
}

.entry-date {
  @apply text-sm text-gray-600;
}

.entry-duration {
  @apply text-sm font-medium text-gray-900;
}

.entry-description {
  @apply text-sm text-gray-700;
}

.time-summary {
  @apply grid grid-cols-3 gap-4 pt-4 border-t border-gray-200;
}

.summary-item {
  @apply text-center;
}

.summary-label {
  @apply block text-sm text-gray-600;
}

.summary-value {
  @apply block text-lg font-medium text-gray-900;
}
</style> 