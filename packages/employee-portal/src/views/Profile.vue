<template>
  <div class="space-y-6">
    <div class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Profile
          </h2>
        </div>
      </div>
    </div>

    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 class="text-lg font-medium leading-6 text-gray-900">Employee Information</h3>
            <div class="mt-4 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Name</label>
                <div class="mt-1 text-sm text-gray-900">{{ user.name }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <div class="mt-1 text-sm text-gray-900">{{ user.email }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Role</label>
                <div class="mt-1 text-sm text-gray-900">{{ user.role }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Department</label>
                <div class="mt-1 text-sm text-gray-900">{{ user.department }}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-medium leading-6 text-gray-900">Skills</h3>
            <div class="mt-4">
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="skill in user.skills"
                  :key="skill"
                  class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900">Performance Metrics</h3>
        <div class="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <dt class="text-sm font-medium text-gray-500 truncate">Total Points</dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ taskMetrics.points }}</dd>
            </div>
          </div>
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <dt class="text-sm font-medium text-gray-500 truncate">Tasks Completed</dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ taskMetrics.completedTasks }}</dd>
            </div>
          </div>
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <dt class="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ taskMetrics.successRate }}%</dd>
            </div>
          </div>
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <dt class="text-sm font-medium text-gray-500 truncate">Avg. Response Time</dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatResponseTime(taskMetrics.averageResponseTime) }}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900">Recent Activity</h3>
        <div class="mt-4 flow-root">
          <ul role="list" class="-mb-8">
            <li v-for="(activity, index) in recentActivity" :key="activity.id">
              <div class="relative pb-8">
                <span
                  v-if="index !== recentActivity.length - 1"
                  class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                ></span>
                <div class="relative flex space-x-3">
                  <div>
                    <span
                      :class="[
                        activity.type === 'task_completed' ? 'bg-green-500' : 'bg-blue-500',
                        'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white'
                      ]"
                    >
                      <svg
                        class="h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </span>
                  </div>
                  <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p class="text-sm text-gray-500">
                        {{ activity.description }}
                        <span class="font-medium text-gray-900">{{ activity.taskTitle }}</span>
                      </p>
                    </div>
                    <div class="text-right text-sm whitespace-nowrap text-gray-500">
                      <time :datetime="activity.date">{{ formatDate(activity.date) }}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import { useUserStore } from '../stores/userStore'
import { formatDistanceToNow } from 'date-fns'

const taskStore = useTaskStore()
const userStore = useUserStore()
const { taskMetrics } = taskStore

const user = ref({
  name: 'John Doe',
  email: 'john@example.com',
  role: userStore.role,
  department: userStore.department,
  skills: userStore.skills
})

const recentActivity = ref([
  {
    id: 1,
    type: 'task_completed',
    taskTitle: 'Implement Login Page',
    description: 'Completed task',
    date: new Date().toISOString()
  },
  {
    id: 2,
    type: 'task_picked',
    taskTitle: 'Design Dashboard',
    description: 'Picked up task',
    date: new Date(Date.now() - 86400000).toISOString()
  }
])

const formatResponseTime = (ms) => {
  const minutes = Math.floor(ms / 60000)
  return `${minutes}m`
}

const formatDate = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

onMounted(async () => {
  await taskStore.fetchTaskHistory()
})
</script> 