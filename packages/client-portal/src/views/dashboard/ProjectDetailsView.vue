<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Back button and Project Header -->
      <div class="mb-6">
        <button
          @click="router.back()"
          class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Projects
        </button>
      </div>

      <!-- Project Overview -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">{{ project.name }}</h1>
            <p class="mt-2 text-sm text-gray-600">{{ project.description }}</p>
            <div class="mt-2 flex items-center space-x-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ project.type || 'Not specified' }}
              </span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {{ project.priority || 'Not specified' }}
              </span>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span
              :class="[
                project.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : project.status === 'completed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800',
                'inline-flex rounded-full px-3 py-1 text-sm font-semibold'
              ]"
            >
              {{ project.status }}
            </span>
            <span
              :class="[
                project.health === 'good'
                  ? 'bg-green-100 text-green-800'
                  : project.health === 'warning'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800',
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
            <h3 class="text-sm font-medium text-gray-500">Progress</h3>
            <div class="mt-1">
              <div class="relative pt-1">
                <div class="flex mb-2 items-center justify-between">
                  <div>
                    <span class="text-xs font-semibold inline-block text-indigo-600">
                      {{ calculateProjectProgress() }}%
                    </span>
                  </div>
                </div>
                <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                  <div
                    :style="{ width: calculateProjectProgress() + '%' }"
                    class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-sm font-medium text-gray-500">Project Info</h3>
            <p class="mt-1 text-sm text-gray-900">Budget: {{ project.budgetRange || 'Not specified' }}</p>
            <p class="mt-1 text-sm text-gray-900">Team Size: {{ project.teamSize || 'Not specified' }}</p>
            <p class="mt-1 text-sm text-gray-900">Manager: {{ project.projectManager || 'Not specified' }}</p>
          </div>
        </div>
      </div>

      <!-- Requirements Section -->
      <div class="bg-white shadow rounded-lg mb-6">
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
      <div v-if="project.srsDocument || (project.additionalDocuments && project.additionalDocuments.length > 0)" class="bg-white shadow rounded-lg mb-6">
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
      <div class="bg-white shadow rounded-lg mb-6">
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
      <div class="bg-white shadow rounded-lg mb-6">
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

      <!-- Tasks Section -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-medium text-gray-900">Project Tasks</h2>
            <button
              @click="openNewTaskModal"
              class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Add Task
            </button>
          </div>
        </div>

        <!-- Tasks Overview -->
        <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p class="text-sm font-medium text-gray-500">Total Tasks</p>
              <p class="text-2xl font-semibold text-gray-900">{{ projectTasks.length }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Completed</p>
              <p class="text-2xl font-semibold text-green-600">{{ completedTasks }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Progress</p>
              <p class="text-2xl font-semibold text-indigo-600">{{ projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0 }}%</p>
            </div>
          </div>
        </div>

        <div class="divide-y divide-gray-200">
          <div v-for="task in projectTasks" :key="task.id" class="p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input
                  type="checkbox"
                  :checked="task.completed"
                  @change="toggleTask(task)"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <div class="ml-4">
                  <h3 class="text-sm font-medium text-gray-900">{{ task.title }}</h3>
                  <p class="text-sm text-gray-500">{{ task.description }}</p>
                  <div class="mt-2">
                    <span
                      :class="[
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800',
                        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium'
                      ]"
                    >
                      {{ task.priority }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-4">
                <span
                  :class="[
                    task.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : task.status === 'in-progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800',
                    'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium'
                  ]"
                >
                  {{ task.status }}
                </span>
                <span class="text-sm text-gray-500">
                  Due: {{ formatDate(task.dueDate) }}
                </span>
              </div>
            </div>

            <!-- Subtasks Section -->
            <div class="mt-4 ml-8">
              <div class="flex justify-between items-center mb-2">
                <h4 class="text-sm font-medium text-gray-700">Subtasks</h4>
                <button
                  @click="openNewSubtaskModal(task)"
                  class="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  Add Subtask
                </button>
              </div>
              <div class="space-y-3">
                <div v-for="subtask in task.subtasks" :key="subtask.id" class="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      :checked="subtask.completed"
                      @change="toggleSubtask(task, subtask)"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <div class="ml-3">
                      <p class="text-sm text-gray-900">{{ subtask.title }}</p>
                      <p class="text-xs text-gray-500">{{ subtask.description }}</p>
                    </div>
                  </div>
                  <span
                    :class="[
                      subtask.completed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800',
                      'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium'
                    ]"
                  >
                    {{ subtask.completed ? 'Completed' : 'Pending' }}
                  </span>
                </div>
              </div>
              <!-- Task Progress -->
              <div class="mt-3">
                <div class="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Task Progress</span>
                  <span>{{ calculateTaskProgress(task) }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    class="bg-indigo-600 h-1.5 rounded-full"
                    :style="{ width: calculateTaskProgress(task) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Task Modal -->
    <div v-if="showNewTaskModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Add New Task</h3>
        <form @submit.prevent="createTask">
          <div class="space-y-4">
            <div>
              <label for="taskTitle" class="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                id="taskTitle"
                v-model="newTask.title"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label for="taskDescription" class="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="taskDescription"
                v-model="newTask.description"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              ></textarea>
            </div>
            <div>
              <label for="taskPriority" class="block text-sm font-medium text-gray-700">Priority</label>
              <select
                id="taskPriority"
                v-model="newTask.priority"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label for="taskDueDate" class="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                id="taskDueDate"
                v-model="newTask.dueDate"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="showNewTaskModal = false"
              class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- New Subtask Modal -->
    <div v-if="showNewSubtaskModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Add New Subtask</h3>
        <form @submit.prevent="createSubtask">
          <div class="space-y-4">
            <div>
              <label for="subtaskTitle" class="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                id="subtaskTitle"
                v-model="newSubtask.title"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label for="subtaskDescription" class="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="subtaskDescription"
                v-model="newSubtask.description"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              ></textarea>
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="showNewSubtaskModal = false"
              class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'

const route = useRoute()
const router = useRouter()

// Sample project data - replace with actual API call
const project = ref({
  id: 1,
  name: 'Website Redesign',
  type: 'web-development',
  description: 'Complete overhaul of the company website with modern design and improved UX',
  status: 'active',
  health: 'good',
  startDate: '2024-03-01',
  dueDate: '2024-04-15',
  priority: 'high',
  budgetRange: '25k-50k',
  estimatedDuration: '2-4-months',
  teamSize: '3-5',
  projectManager: 'Sarah Johnson',
  
  // Requirements
  businessRequirements: 'The current website is outdated and doesn\'t reflect our modern brand identity. We need a complete redesign that improves user experience, increases conversion rates, and provides better mobile responsiveness.',
  functionalRequirements: '1. Modern, responsive design that works on all devices\n2. Improved navigation and user flow\n3. Contact forms with validation\n4. Blog section with CMS\n5. Integration with social media\n6. Analytics and tracking capabilities',
  nonFunctionalRequirements: '1. Page load time under 3 seconds\n2. 99.9% uptime\n3. SEO optimized\n4. WCAG 2.1 AA accessibility compliance\n5. Cross-browser compatibility',
  technicalSpecifications: 'React.js frontend, Node.js backend, MongoDB database, AWS hosting, responsive design with Tailwind CSS',
  
  // Documents
  srsDocument: { name: 'Website_Redesign_SRS_v1.0.pdf', size: 2048576 },
  additionalDocuments: [
    { name: 'Brand_Guidelines.pdf', size: 1048576 },
    { name: 'Wireframes.zip', size: 5120000 }
  ],
  documentNotes: 'SRS document includes detailed user stories and acceptance criteria. Brand guidelines should be followed strictly.',
  
  // Timeline & Budget
  milestones: '1. Discovery & Planning (Week 1-2)\n2. Design Phase (Week 3-6)\n3. Development Phase (Week 7-12)\n4. Testing & QA (Week 13-14)\n5. Launch & Deployment (Week 15)',
  
  // Team & Stakeholders
  stakeholders: 'CEO: John Smith (final approval)\nMarketing Director: Lisa Chen (content and branding)\nSales Manager: Mike Davis (lead generation requirements)',
  communicationPreferences: 'Weekly status meetings on Fridays at 2 PM. Daily updates via Slack. Monthly stakeholder presentations.',
  specialRequirements: 'Must integrate with existing CRM system. Compliance with GDPR and CCPA required.',
  
  team: [
    { name: 'John Doe', initials: 'JD' },
    { name: 'Jane Smith', initials: 'JS' }
  ]
})

// Sample tasks data - replace with actual API call
const projectTasks = ref([
  {
    id: 1,
    title: 'Design System Implementation',
    description: 'Create and implement new design system with color palette, typography, and components',
    status: 'completed',
    completed: true,
    dueDate: '2024-03-15',
    priority: 'high',
    subtasks: [
      {
        id: 1,
        title: 'Color Palette',
        description: 'Define and document color system',
        completed: true
      },
      {
        id: 2,
        title: 'Typography',
        description: 'Select and document type system',
        completed: true
      },
      {
        id: 3,
        title: 'Component Library',
        description: 'Create base component designs',
        completed: false
      }
    ]
  },
  {
    id: 2,
    title: 'Homepage Redesign',
    description: 'Design and implement new homepage layout with improved user flow',
    status: 'in-progress',
    completed: false,
    dueDate: '2024-03-25',
    priority: 'high',
    subtasks: [
      {
        id: 1,
        title: 'Wireframing',
        description: 'Create homepage wireframes',
        completed: true
      },
      {
        id: 2,
        title: 'Visual Design',
        description: 'Create high-fidelity designs',
        completed: false
      },
      {
        id: 3,
        title: 'Implementation',
        description: 'Code the new homepage',
        completed: false
      }
    ]
  }
])

const showNewTaskModal = ref(false)
const showNewSubtaskModal = ref(false)
const selectedTask = ref(null)

const newTask = ref({
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium',
  status: 'pending',
  completed: false,
  subtasks: []
})

const newSubtask = ref({
  title: '',
  description: '',
  completed: false
})

const completedTasks = computed(() => projectTasks.value.filter(task => task.completed).length)

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

function calculateTaskProgress(task) {
  if (!task.subtasks.length) return task.completed ? 100 : 0
  const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length
  return Math.round((completedSubtasks / task.subtasks.length) * 100)
}

function calculateProjectProgress() {
  if (!projectTasks.value.length) return 0
  const totalProgress = projectTasks.value.reduce((sum, task) => sum + calculateTaskProgress(task), 0)
  return Math.round(totalProgress / projectTasks.value.length)
}

function toggleTask(task) {
  task.completed = !task.completed
  task.status = task.completed ? 'completed' : 'in-progress'
}

function toggleSubtask(task, subtask) {
  subtask.completed = !subtask.completed
  // Update task status based on subtasks
  const allSubtasksCompleted = task.subtasks.every(st => st.completed)
  task.completed = allSubtasksCompleted
  task.status = allSubtasksCompleted ? 'completed' : 'in-progress'
}

function openNewTaskModal() {
  showNewTaskModal.value = true
}

function openNewSubtaskModal(task) {
  selectedTask.value = task
  showNewSubtaskModal.value = true
}

function createTask() {
  const task = {
    id: projectTasks.value.length + 1,
    ...newTask.value,
    subtasks: []
  }
  projectTasks.value.push(task)
  showNewTaskModal.value = false
  newTask.value = {
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending',
    completed: false,
    subtasks: []
  }
}

function createSubtask() {
  if (!selectedTask.value) return
  
  const subtask = {
    id: selectedTask.value.subtasks.length + 1,
    ...newSubtask.value
  }
  selectedTask.value.subtasks.push(subtask)
  showNewSubtaskModal.value = false
  newSubtask.value = {
    title: '',
    description: '',
    completed: false
  }
}

onMounted(() => {
  // Here you would typically fetch the project and tasks data using the route.params.id
  // const projectId = route.params.id
  // fetchProjectDetails(projectId)
})
</script> 