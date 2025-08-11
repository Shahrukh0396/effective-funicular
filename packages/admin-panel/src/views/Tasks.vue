<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-semibold text-gray-900">Task Management</h1>
          <div class="flex space-x-3">
            <button
              @click="showAssignmentModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Assign Tasks
            </button>
            <button
              @click="createNewTask"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create New Task
            </button>
          </div>
        </div>
      </div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <!-- Task Filters -->
        <div class="mt-4">
          <div class="flex space-x-4">
            <select
              v-model="statusFilter"
              class="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Status</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="testing">Testing</option>
              <option value="done">Done</option>
              <option value="blocked">Blocked</option>
            </select>
            <select
              v-model="priorityFilter"
              class="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              v-model="assignmentFilter"
              class="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Tasks</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="mt-8 flex justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="mt-8 bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error loading tasks</h3>
              <div class="mt-2 text-sm text-red-700">{{ error }}</div>
            </div>
          </div>
        </div>

        <!-- Task List -->
        <div v-else class="mt-8">
          <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" class="divide-y divide-gray-200">
              <li v-for="task in filteredTasks" :key="task._id" class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div :class="getPriorityColor(task.priority)" class="h-10 w-10 rounded-full flex items-center justify-center">
                        <span class="text-sm font-medium text-white">{{ task.priority.charAt(0).toUpperCase() }}</span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <h2 class="text-lg font-medium text-gray-900">{{ task.title }}</h2>
                      <p class="text-sm text-gray-500">{{ task.description }}</p>
                      <div class="mt-1 flex items-center space-x-4">
                        <span :class="getStatusColor(task.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {{ getStatusLabel(task.status) }}
                        </span>
                        <span v-if="task.project" class="text-sm text-gray-500">
                          Project: {{ task.project.name }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="ml-2 flex-shrink-0 flex space-x-2">
                    <button
                      v-if="!task.assignedTo"
                      @click="assignTask(task)"
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Assign
                    </button>
                    <button
                      v-else
                      @click="unassignTask(task)"
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Unassign
                    </button>
                    <button
                      @click="viewTaskDetails(task)"
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Details
                    </button>
                  </div>
                </div>
                <div class="mt-2 sm:flex sm:justify-between">
                  <div class="sm:flex">
                    <p class="flex items-center text-sm text-gray-500">
                      <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {{ task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned' }}
                    </p>
                  </div>
                  <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>
                      Due: {{ task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date' }}
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Task Assignment Modal -->
        <div v-if="showAssignmentModal" class="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div class="mt-3 text-center sm:mt-5">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Assign Task
                  </h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Select a task and an employee to assign
                    </p>
                  </div>
                </div>
              </div>

              <div class="mt-5 space-y-4">
                <div>
                  <label for="task" class="block text-sm font-medium text-gray-700">Task</label>
                  <select
                    id="task"
                    v-model="selectedTaskId"
                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select a task</option>
                    <option v-for="task in unassignedTasks" :key="task._id" :value="task._id">
                      {{ task.title }} ({{ task.status }})
                    </option>
                    <option v-if="unassignedTasks.length === 0" disabled>
                      No unassigned tasks available
                    </option>
                  </select>
                </div>

                <div>
                  <label for="employee" class="block text-sm font-medium text-gray-700">Employee</label>
                  <select
                    id="employee"
                    v-model="selectedEmployeeId"
                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select an employee</option>
                    <option v-for="employee in employees" :key="employee._id" :value="employee._id">
                      {{ employee.firstName }} {{ employee.lastName }} ({{ employee.role }})
                    </option>
                  </select>
                </div>
              </div>

              <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  @click="confirmAssignment"
                  :disabled="!selectedTaskId || !selectedEmployeeId || assignmentLoading"
                  class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="assignmentLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Assign
                </button>
                <button
                  type="button"
                  @click="closeAssignmentModal"
                  class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Create Task Modal -->
        <div v-if="showCreateTaskModal" class="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div class="mt-3 text-center sm:mt-5">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Create New Task
                  </h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Fill in the details to create a new task
                    </p>
                  </div>
                </div>
              </div>

              <form @submit.prevent="createTask" class="mt-5 space-y-4">
                <div>
                  <label for="title" class="block text-sm font-medium text-gray-700">Task Title</label>
                  <input
                    id="title"
                    v-model="newTask.title"
                    type="text"
                    required
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter task title"
                  />
                </div>

                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    id="description"
                    v-model="newTask.description"
                    rows="3"
                    required
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter task description"
                  ></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="priority" class="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                      id="priority"
                      v-model="newTask.priority"
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      id="status"
                      v-model="newTask.status"
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="testing">Testing</option>
                      <option value="done">Done</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="assignedTo" class="block text-sm font-medium text-gray-700">Assign To</label>
                    <select
                      id="assignedTo"
                      v-model="newTask.assignedTo"
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select an employee</option>
                      <option v-for="employee in employees" :key="employee._id" :value="employee._id">
                        {{ employee.firstName }} {{ employee.lastName }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label for="estimatedHours" class="block text-sm font-medium text-gray-700">Estimated Hours</label>
                    <input
                      id="estimatedHours"
                      v-model.number="newTask.estimatedHours"
                      type="number"
                      min="0"
                      step="0.5"
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label for="dueDate" class="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    id="dueDate"
                    v-model="newTask.dueDate"
                    type="date"
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    :disabled="createTaskLoading"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="createTaskLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Create Task
                  </button>
                  <button
                    type="button"
                    @click="closeCreateTaskModal"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Task Details Modal -->
        <div v-if="selectedTask" class="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div class="mt-3 text-center sm:mt-5">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {{ selectedTask.title }}
                  </h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      {{ selectedTask.description }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Task Details -->
              <div class="mt-5">
                <h4 class="text-sm font-medium text-gray-900">Task Details</h4>
                <div class="mt-2 bg-gray-50 rounded-lg p-4">
                  <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Status</dt>
                      <dd class="mt-1">
                        <span :class="getStatusColor(selectedTask.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {{ getStatusLabel(selectedTask.status) }}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Priority</dt>
                      <dd class="mt-1">
                        <span :class="getPriorityColor(selectedTask.priority)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white">
                          {{ selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1) }}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Assigned To</dt>
                      <dd class="mt-1 text-sm text-gray-900">
                        {{ selectedTask.assignedTo ? `${selectedTask.assignedTo.firstName} ${selectedTask.assignedTo.lastName}` : 'Unassigned' }}
                      </dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Due Date</dt>
                      <dd class="mt-1 text-sm text-gray-900">
                        {{ selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'No due date' }}
                      </dd>
                    </div>
                    <div v-if="selectedTask.assignedAt">
                      <dt class="text-sm font-medium text-gray-500">Assigned At</dt>
                      <dd class="mt-1 text-sm text-gray-900">
                        {{ new Date(selectedTask.assignedAt).toLocaleString() }}
                      </dd>
                    </div>
                    <div v-if="selectedTask.estimatedHours">
                      <dt class="text-sm font-medium text-gray-500">Estimated Hours</dt>
                      <dd class="mt-1 text-sm text-gray-900">
                        {{ selectedTask.estimatedHours }} hours
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div class="mt-5 sm:mt-6">
                <button
                  type="button"
                  class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                  @click="closeModal"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '../stores/adminStore'

const adminStore = useAdminStore()
const selectedTask = ref(null)
const showAssignmentModal = ref(false)
const showCreateTaskModal = ref(false)
const selectedEmployeeId = ref('')
const selectedTaskId = ref('')
const taskToAssign = ref(null)
const statusFilter = ref('all')
const priorityFilter = ref('all')
const assignmentFilter = ref('all')
const loading = ref(false)
const assignmentLoading = ref(false)
const createTaskLoading = ref(false)
const error = ref(null)

// New task form data
const newTask = ref({
  title: '',
  description: '',
  priority: 'medium',
  status: 'todo',
  assignedTo: '',
  estimatedHours: 0,
  dueDate: ''
})

const tasks = computed(() => adminStore.tasks)
const employees = computed(() => adminStore.employees)

const unassignedTasks = computed(() => {
  if (!Array.isArray(tasks.value)) {
    return []
  }
  return tasks.value.filter(task => !task.assignedTo)
})

const filteredTasks = computed(() => {
  if (!Array.isArray(tasks.value)) {
    return []
  }
  
  return tasks.value.filter(task => {
    const statusMatch = statusFilter.value === 'all' || task.status === statusFilter.value
    const priorityMatch = priorityFilter.value === 'all' || task.priority === priorityFilter.value
    const assignmentMatch = assignmentFilter.value === 'all' || 
      (assignmentFilter.value === 'assigned' && task.assignedTo) ||
      (assignmentFilter.value === 'unassigned' && !task.assignedTo)
    return statusMatch && priorityMatch && assignmentMatch
  })
})

const getStatusColor = (status) => {
  const colors = {
    'todo': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'review': 'bg-yellow-100 text-yellow-800',
    'testing': 'bg-purple-100 text-purple-800',
    'done': 'bg-green-100 text-green-800',
    'blocked': 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status) => {
  const labels = {
    'todo': 'Todo',
    'in-progress': 'In Progress',
    'review': 'Review',
    'testing': 'Testing',
    'done': 'Done',
    'blocked': 'Blocked'
  }
  return labels[status] || status
}

const getPriorityColor = (priority) => {
  const colors = {
    'high': 'bg-red-500',
    'medium': 'bg-yellow-500',
    'low': 'bg-green-500'
  }
  return colors[priority] || 'bg-gray-500'
}

const viewTaskDetails = (task) => {
  selectedTask.value = task
}

const closeModal = () => {
  selectedTask.value = null
}

const assignTask = (task) => {
  taskToAssign.value = task
  selectedTaskId.value = task._id
  showAssignmentModal.value = true
}

const confirmAssignment = async () => {
  if (!selectedTaskId.value || !selectedEmployeeId.value) return
  
  assignmentLoading.value = true
  try {
    await adminStore.assignTask(selectedTaskId.value, selectedEmployeeId.value)
    await loadTasks()
    closeAssignmentModal()
  } catch (error) {
    console.error('Error assigning task:', error)
  } finally {
    assignmentLoading.value = false
  }
}

const unassignTask = async (task) => {
  try {
    await adminStore.unassignTask(task._id)
    await loadTasks()
  } catch (error) {
    console.error('Error unassigning task:', error)
  }
}

const closeAssignmentModal = () => {
  showAssignmentModal.value = false
  selectedEmployeeId.value = ''
  selectedTaskId.value = ''
  taskToAssign.value = null
}

const createNewTask = () => {
  showCreateTaskModal.value = true
}

const createTask = async () => {
  createTaskLoading.value = true
  try {
    await adminStore.createTask(newTask.value)
    await loadTasks()
    closeCreateTaskModal()
  } catch (error) {
    console.error('Error creating task:', error)
  } finally {
    createTaskLoading.value = false
  }
}

const closeCreateTaskModal = () => {
  showCreateTaskModal.value = false
  // Reset form
  newTask.value = {
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    assignedTo: '',
    estimatedHours: 0,
    dueDate: ''
  }
}

const loadTasks = async () => {
  loading.value = true
  error.value = null
  try {
    console.log('Loading tasks and employees...')
    await Promise.all([
      adminStore.fetchAllTasks(),
      adminStore.fetchEmployees()
    ])
    console.log('Tasks loaded:', tasks.value?.length)
    console.log('Employees loaded:', employees.value?.length)
  } catch (err) {
    console.error('Error loading data:', err)
    error.value = err.message || 'Failed to load tasks'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadTasks()
})
</script> 