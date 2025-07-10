<template>
  <div class="space-y-6">
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
          <h3 class="text-sm font-medium text-red-800">Error loading project</h3>
          <p class="mt-1 text-sm text-red-700">{{ projectStore.error }}</p>
        </div>
      </div>
    </div>

    <!-- Project Content -->
    <div v-else-if="project" class="space-y-6">
      <!-- Back Button and Header -->
      <div class="flex items-center justify-between">
        <button
          @click="router.back()"
          class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Projects
        </button>
        <div class="flex space-x-3">
          <button
            @click="updateProjectStatus"
            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Update Status
          </button>
          <button
            @click="createTaskFromProject"
            class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create Task
          </button>
        </div>
      </div>

      <!-- Project Overview -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">{{ project.name }}</h1>
            <p class="mt-2 text-sm text-gray-600">{{ project.description }}</p>
            <div class="mt-2 flex items-center space-x-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ formatProjectType(project.type) }}
              </span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {{ project.priority }}
              </span>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span
              :class="[
                project.status === 'active' ? 'bg-green-100 text-green-800' :
                project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800',
                'inline-flex rounded-full px-3 py-1 text-sm font-semibold'
              ]"
            >
              {{ project.status }}
            </span>
            <span
              :class="[
                project.health === 'good' ? 'bg-green-100 text-green-800' :
                project.health === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800',
                'inline-flex rounded-full px-3 py-1 text-sm font-semibold'
              ]"
            >
              {{ project.health }}
            </span>
          </div>
        </div>

        <!-- Project Details -->
        <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-sm font-medium text-gray-500">Timeline</h3>
            <p class="mt-1 text-sm text-gray-900">Start: {{ formatDate(project.startDate) }}</p>
            <p class="mt-1 text-sm text-gray-900">Due: {{ formatDate(project.dueDate) }}</p>
            <p v-if="project.estimatedDuration" class="mt-1 text-sm text-gray-900">Duration: {{ project.estimatedDuration }}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-sm font-medium text-gray-500">Project Info</h3>
            <p class="mt-1 text-sm text-gray-900">Budget: {{ project.budgetRange || 'Not specified' }}</p>
            <p class="mt-1 text-sm text-gray-900">Team Size: {{ project.teamSize || 'Not specified' }}</p>
            <p class="mt-1 text-sm text-gray-900">Manager: {{ project.projectManager || 'Not specified' }}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-sm font-medium text-gray-500">Team</h3>
            <p class="mt-1 text-sm text-gray-900">{{ project.team.length }} members</p>
            <div class="mt-2 flex -space-x-2">
              <div
                v-for="(member, index) in project.team.slice(0, 5)"
                :key="index"
                class="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center"
                :title="`${member.name} (${member.role})`"
              >
                <span class="text-xs font-medium text-gray-600">{{ member.initials }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Requirements Section -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Requirements & Specifications</h2>
        </div>
        <div class="p-6 space-y-6">
          <div>
            <h3 class="text-sm font-medium text-gray-700 mb-2">Business Requirements</h3>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-900 whitespace-pre-wrap">{{ project.businessRequirements || 'No business requirements specified' }}</p>
            </div>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-700 mb-2">Functional Requirements</h3>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-900 whitespace-pre-wrap">{{ project.functionalRequirements || 'No functional requirements specified' }}</p>
            </div>
          </div>
          
          <div v-if="project.nonFunctionalRequirements">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Non-Functional Requirements</h3>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-900 whitespace-pre-wrap">{{ project.nonFunctionalRequirements }}</p>
            </div>
          </div>
          
          <div v-if="project.technicalSpecifications">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Technical Specifications</h3>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-900 whitespace-pre-wrap">{{ project.technicalSpecifications }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Documents Section -->
      <div v-if="project.srsDocument || (project.additionalDocuments && project.additionalDocuments.length > 0)" class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Project Documents</h2>
        </div>
        <div class="p-6 space-y-4">
          <div v-if="project.srsDocument" class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div class="flex items-center">
              <svg class="h-8 w-8 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p class="text-sm font-medium text-gray-900">SRS Document</p>
                <p class="text-xs text-gray-500">{{ project.srsDocument.name }}</p>
              </div>
            </div>
            <button class="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
              Download
            </button>
          </div>
          
          <div v-if="project.additionalDocuments && project.additionalDocuments.length > 0">
            <h3 class="text-sm font-medium text-gray-700 mb-3">Additional Documents</h3>
            <div class="space-y-2">
              <div v-for="(doc, index) in project.additionalDocuments" :key="index" class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div class="flex items-center">
                  <svg class="h-6 w-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ doc.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(doc.size) }}</p>
                  </div>
                </div>
                <button class="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                  Download
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="project.documentNotes" class="mt-4">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Document Notes</h3>
            <div class="bg-gray-50 p-3 rounded-lg">
              <p class="text-sm text-gray-900">{{ project.documentNotes }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline & Budget Section -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Timeline & Budget</h2>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-3">Project Details</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Priority:</span>
                  <span class="text-sm font-medium text-gray-900">{{ project.priority || 'Not specified' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Budget Range:</span>
                  <span class="text-sm font-medium text-gray-900">{{ project.budgetRange || 'Not specified' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Estimated Duration:</span>
                  <span class="text-sm font-medium text-gray-900">{{ project.estimatedDuration || 'Not specified' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Team Size:</span>
                  <span class="text-sm font-medium text-gray-900">{{ project.teamSize || 'Not specified' }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="project.milestones">
              <h3 class="text-sm font-medium text-gray-700 mb-3">Key Milestones</h3>
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-sm text-gray-900 whitespace-pre-wrap">{{ project.milestones }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team & Stakeholders Section -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Team & Stakeholders</h2>
        </div>
        <div class="p-6 space-y-6">
          <div>
            <h3 class="text-sm font-medium text-gray-700 mb-2">Project Manager</h3>
            <p class="text-sm text-gray-900">{{ project.projectManager || 'Not specified' }}</p>
          </div>
          
          <div v-if="project.stakeholders">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Key Stakeholders</h3>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-900 whitespace-pre-wrap">{{ project.stakeholders }}</p>
            </div>
          </div>
          
          <div v-if="project.communicationPreferences">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Communication Preferences</h3>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-900 whitespace-pre-wrap">{{ project.communicationPreferences }}</p>
            </div>
          </div>
          
          <div v-if="project.specialRequirements">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Special Requirements</h3>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-900 whitespace-pre-wrap">{{ project.specialRequirements }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from '../stores/projectStore'
import { format } from 'date-fns'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()

const project = computed(() => projectStore.currentProject)

function formatDate(date) {
  return format(new Date(date), 'MMM d, yyyy')
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

function updateProjectStatus() {
  // TODO: Implement status update modal
  console.log('Update project status')
}

function createTaskFromProject() {
  // TODO: Implement task creation from project requirements
  console.log('Create task from project:', project.value)
}

onMounted(() => {
  const projectId = route.params.id
  projectStore.fetchProjectById(projectId)
})
</script> 