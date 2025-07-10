<template>
  <div class="sprint-board">
    <div class="sprint-header">
      <h2 class="text-xl font-semibold">{{ sprint.name }}</h2>
      <div class="sprint-dates">
        <span>{{ formatDate(sprint.startDate) }} - {{ formatDate(sprint.endDate) }}</span>
      </div>
      <div class="sprint-status">
        <span :class="getStatusClass(sprint.status)">{{ sprint.status }}</span>
      </div>
    </div>

    <div class="sprint-metrics">
      <div class="metric">
        <span class="metric-label">Velocity</span>
        <span class="metric-value">{{ metrics.velocity }}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Burndown</span>
        <span class="metric-value">{{ metrics.burndown }}%</span>
      </div>
      <div class="metric">
        <span class="metric-label">Tasks</span>
        <span class="metric-value">{{ metrics.totalTasks }}</span>
      </div>
    </div>

    <div class="task-columns">
      <div class="column" v-for="status in taskStatuses" :key="status">
        <div class="column-header">
          <h3 class="text-lg font-medium">{{ status }}</h3>
          <span class="task-count">{{ getTasksByStatus(status).length }}</span>
        </div>
        <div class="task-list">
          <div
            v-for="task in getTasksByStatus(status)"
            :key="task.id"
            class="task-card"
            @click="openTaskDetails(task)"
          >
            <div class="task-header">
              <TaskIcons :name="getTaskTypeIcon(task.type)" />
              <span class="task-key">{{ task.key }}</span>
              <span :class="getPriorityClass(task.priority)">{{ task.priority }}</span>
            </div>
            <div class="task-title">{{ task.title }}</div>
            <div class="task-footer">
              <div class="task-assignee">
                <img :src="task.assignee?.avatar" :alt="task.assignee?.name" class="w-6 h-6 rounded-full" />
              </div>
              <div class="task-progress">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${task.progress}%` }"
                  ></div>
                </div>
                <span class="progress-text">{{ task.progress }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <TaskDetails
      v-if="selectedTask"
      :task="selectedTask"
      @close="closeTaskDetails"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { sprintService } from '@/services/sprintService'
import { taskService } from '@/services/taskService'
import TaskDetails from './TaskDetails.vue'
import TaskIcons from './icons/TaskIcons.vue'
import { formatDate } from '@/utils/date'

const props = defineProps({
  sprintId: {
    type: String,
    required: true
  }
})

const sprint = ref({})
const metrics = ref({})
const selectedTask = ref(null)
const taskStatuses = ['To Do', 'In Progress', 'In Review', 'Done']

onMounted(async () => {
  await loadSprintData()
})

async function loadSprintData() {
  try {
    const [sprintData, metricsData] = await Promise.all([
      sprintService.fetchSprints().then(sprints => sprints.find(s => s.id === props.sprintId)),
      sprintService.getSprintMetrics(props.sprintId)
    ])
    sprint.value = sprintData
    metrics.value = metricsData
  } catch (error) {
    console.error('Error loading sprint data:', error)
  }
}

function getTasksByStatus(status) {
  return sprint.value.tasks?.filter(task => task.status === status) || []
}

function getStatusClass(status) {
  const classes = {
    'Planning': 'bg-blue-100 text-blue-800',
    'Active': 'bg-green-100 text-green-800',
    'Completed': 'bg-gray-100 text-gray-800'
  }
  return `px-2 py-1 rounded-full text-sm ${classes[status] || ''}`
}

function getPriorityClass(priority) {
  const classes = {
    'Highest': 'bg-red-100 text-red-800',
    'High': 'bg-orange-100 text-orange-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Low': 'bg-green-100 text-green-800',
    'Lowest': 'bg-blue-100 text-blue-800'
  }
  return `px-2 py-1 rounded-full text-xs ${classes[priority] || ''}`
}

function getTaskTypeIcon(type) {
  const icons = {
    'Epic': 'EpicIcon',
    'Story': 'StoryIcon',
    'Task': 'TaskIcon',
    'Bug': 'BugIcon'
  }
  return icons[type] || 'TaskIcon'
}

function openTaskDetails(task) {
  selectedTask.value = task
}

function closeTaskDetails() {
  selectedTask.value = null
}
</script>

<style scoped>
.sprint-board {
  @apply p-6;
}

.sprint-header {
  @apply flex items-center justify-between mb-6;
}

.sprint-metrics {
  @apply grid grid-cols-3 gap-4 mb-6;
}

.metric {
  @apply bg-white rounded-lg p-4 shadow-sm;
}

.metric-label {
  @apply text-sm text-gray-600;
}

.metric-value {
  @apply text-2xl font-semibold text-gray-900;
}

.task-columns {
  @apply grid grid-cols-4 gap-4;
}

.column {
  @apply bg-gray-50 rounded-lg p-4;
}

.column-header {
  @apply flex items-center justify-between mb-4;
}

.task-count {
  @apply bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm;
}

.task-list {
  @apply space-y-4;
}

.task-card {
  @apply bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow;
}

.task-header {
  @apply flex items-center gap-2 mb-2;
}

.task-key {
  @apply text-sm text-gray-600;
}

.task-title {
  @apply text-gray-900 mb-4;
}

.task-footer {
  @apply flex items-center justify-between;
}

.progress-bar {
  @apply w-24 h-2 bg-gray-200 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-blue-500;
}

.progress-text {
  @apply text-xs text-gray-600 ml-2;
}
</style> 