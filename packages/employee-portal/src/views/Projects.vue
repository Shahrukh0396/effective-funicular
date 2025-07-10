<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Projects
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Manage and track all client projects with comprehensive requirements and documentation.
          </p>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <select
            v-model="selectedStatus"
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            v-model="selectedPriority"
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="projectStore.loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="projectStore.error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error loading projects</h3>
          <p class="mt-1 text-sm text-red-700">{{ projectStore.error }}</p>
        </div>
      </div>
    </div>

    <!-- Projects Grid -->
    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
      >
        <div class="px-4 py-5 sm:p-6">
          <!-- Project Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 truncate">{{ project.name }}</h3>
            <div class="flex space-x-2">
              <span
                :class="[
                  project.priority === 'critical' ? 'bg-red-100 text-red-800' :
                  project.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800',
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
                ]"
              >
                {{ project.priority }}
              </span>
              <span
                :class="[
                  project.health === 'good' ? 'bg-green-100 text-green-800' :
                  project.health === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800',
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
                ]"
              >
                {{ project.health }}
              </span>
            </div>
          </div>

          <!-- Project Type -->
          <div class="mb-3">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {{ formatProjectType(project.type) }}
            </span>
          </div>

          <!-- Project Description -->
          <p class="text-sm text-gray-600 mb-4 line-clamp-3">{{ project.description }}</p>

          <!-- Project Details -->
          <div class="space-y-2 mb-4">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Manager:</span>
              <span class="font-medium text-gray-900">{{ project.projectManager }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Budget:</span>
              <span class="font-medium text-gray-900">{{ project.budgetRange || 'Not specified' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Duration:</span>
              <span class="font-medium text-gray-900">{{ project.estimatedDuration || 'Not specified' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Team Size:</span>
              <span class="font-medium text-gray-900">{{ project.teamSize || 'Not specified' }}</span>
            </div>
          </div>

          <!-- Timeline -->
          <div class="mb-4">
            <div class="flex justify-between text-sm text-gray-500 mb-1">
              <span>Timeline</span>
            </div>
            <div class="text-xs text-gray-600">
              <div>Start: {{ formatDate(project.startDate) }}</div>
              <div>Due: {{ formatDate(project.dueDate) }}</div>
            </div>
          </div>

          <!-- Team Members -->
          <div class="mb-4">
            <div class="flex justify-between text-sm text-gray-500 mb-2">
              <span>Team</span>
              <span>{{ project.team.length }} members</span>
            </div>
            <div class="flex -space-x-2">
              <div
                v-for="(member, index) in project.team.slice(0, 4)"
                :key="index"
                class="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center"
                :title="`${member.name} (${member.role})`"
              >
                <span class="text-xs font-medium text-gray-600">{{ member.initials }}</span>
              </div>
              <div
                v-if="project.team.length > 4"
                class="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center"
              >
                <span class="text-xs font-medium text-gray-500">+{{ project.team.length - 4 }}</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-2">
            <router-link
              :to="`/projects/${project.id}`"
              class="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View Details
            </router-link>
            <button
              @click="createTaskFromProject(project)"
              class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              title="Create Task"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!projectStore.loading && !projectStore.error && filteredProjects.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ selectedStatus || selectedPriority ? 'Try adjusting your filters.' : 'Get started by creating a new project.' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProjectStore } from '../stores/projectStore'
import { format } from 'date-fns'

const projectStore = useProjectStore()
const { projects, fetchProjects } = projectStore

const selectedStatus = ref('')
const selectedPriority = ref('')

const filteredProjects = computed(() => {
  let filtered = projects.value

  if (selectedStatus.value) {
    filtered = filtered.filter(project => project.status === selectedStatus.value)
  }

  if (selectedPriority.value) {
    filtered = filtered.filter(project => project.priority === selectedPriority.value)
  }

  return filtered
})

function formatDate(date) {
  return format(new Date(date), 'MMM d, yyyy')
}

function formatProjectType(type) {
  const typeMap = {
    'web-development': 'Web Development',
    'mobile-app': 'Mobile App',
    'desktop-app': 'Desktop App',
    'api-development': 'API Development',
    'database-design': 'Database Design',
    'ui-ux-design': 'UI/UX Design',
    'consulting': 'Consulting',
    'maintenance': 'Maintenance',
    'other': 'Other'
  }
  return typeMap[type] || type
}

function createTaskFromProject(project) {
  // TODO: Implement task creation from project requirements
  console.log('Create task from project:', project)
  // This could open a modal or navigate to task creation with pre-filled project info
}

onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 