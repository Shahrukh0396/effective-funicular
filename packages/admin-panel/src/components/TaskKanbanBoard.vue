<template>
  <div class="task-kanban-board">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">{{ project?.name }} - Task Board</h2>
      <p class="text-sm text-gray-600">{{ project?.description }}</p>
    </div>

    <!-- Kanban Board -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Todo Column -->
      <div class="bg-gray-50 rounded-lg p-4" 
           @dragover="onDragOver" 
           @drop="onDrop('todo')">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-medium text-gray-900">Todo</h3>
          <span class="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
            {{ getTasksByStatus('todo').length }}
          </span>
        </div>
        <div class="space-y-2">
          <div v-for="task in getTasksByStatus('todo')" :key="task._id" 
               class="bg-white p-3 rounded border cursor-pointer hover:shadow-sm transition-shadow"
               draggable="true"
               @dragstart="onDragStart(task)"
               @click="viewTaskDetails(task)">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="font-medium text-sm text-gray-900">{{ task.title }}</h4>
                <p class="text-xs text-gray-600 mt-1">{{ task.description?.substring(0, 50) }}...</p>
                <div class="flex items-center space-x-2 mt-2">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="getPriorityClass(task.priority)">
                    {{ task.priority }}
                  </span>
                  <span v-if="task.dueDate" class="text-xs text-gray-500">
                    {{ formatDate(task.dueDate) }}
                  </span>
                </div>
              </div>
              <div class="flex flex-col items-end space-y-1">
                <div v-if="task.assignedTo" class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-xs text-blue-600 font-medium">
                    {{ task.assignedTo.firstName?.charAt(0) }}
                  </span>
                </div>
                <div v-if="task.estimatedHours" class="text-xs text-gray-500">
                  {{ task.estimatedHours }}h
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- In Progress Column -->
      <div class="bg-blue-50 rounded-lg p-4"
           @dragover="onDragOver" 
           @drop="onDrop('in-progress')">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-medium text-blue-900">In Progress</h3>
          <span class="bg-blue-200 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
            {{ getTasksByStatus('in-progress').length }}
          </span>
        </div>
        <div class="space-y-2">
          <div v-for="task in getTasksByStatus('in-progress')" :key="task._id" 
               class="bg-white p-3 rounded border cursor-pointer hover:shadow-sm transition-shadow"
               draggable="true"
               @dragstart="onDragStart(task)"
               @click="viewTaskDetails(task)">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="font-medium text-sm text-gray-900">{{ task.title }}</h4>
                <p class="text-xs text-gray-600 mt-1">{{ task.description?.substring(0, 50) }}...</p>
                <div class="flex items-center space-x-2 mt-2">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="getPriorityClass(task.priority)">
                    {{ task.priority }}
                  </span>
                  <span v-if="task.dueDate" class="text-xs text-gray-500">
                    {{ formatDate(task.dueDate) }}
                  </span>
                </div>
              </div>
              <div class="flex flex-col items-end space-y-1">
                <div v-if="task.assignedTo" class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-xs text-blue-600 font-medium">
                    {{ task.assignedTo.firstName?.charAt(0) }}
                  </span>
                </div>
                <div v-if="task.estimatedHours" class="text-xs text-gray-500">
                  {{ task.estimatedHours }}h
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Review Column -->
      <div class="bg-yellow-50 rounded-lg p-4"
           @dragover="onDragOver" 
           @drop="onDrop('review')">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-medium text-yellow-900">Review</h3>
          <span class="bg-yellow-200 text-yellow-700 text-xs font-medium px-2 py-1 rounded-full">
            {{ getTasksByStatus('review').length }}
          </span>
        </div>
        <div class="space-y-2">
          <div v-for="task in getTasksByStatus('review')" :key="task._id" 
               class="bg-white p-3 rounded border cursor-pointer hover:shadow-sm transition-shadow"
               draggable="true"
               @dragstart="onDragStart(task)"
               @click="viewTaskDetails(task)">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="font-medium text-sm text-gray-900">{{ task.title }}</h4>
                <p class="text-xs text-gray-600 mt-1">{{ task.description?.substring(0, 50) }}...</p>
                <div class="flex items-center space-x-2 mt-2">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="getPriorityClass(task.priority)">
                    {{ task.priority }}
                  </span>
                  <span v-if="task.dueDate" class="text-xs text-gray-500">
                    {{ formatDate(task.dueDate) }}
                  </span>
                </div>
              </div>
              <div class="flex flex-col items-end space-y-1">
                <div v-if="task.assignedTo" class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-xs text-blue-600 font-medium">
                    {{ task.assignedTo.firstName?.charAt(0) }}
                  </span>
                </div>
                <div v-if="task.estimatedHours" class="text-xs text-gray-500">
                  {{ task.estimatedHours }}h
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Done Column -->
      <div class="bg-green-50 rounded-lg p-4"
           @dragover="onDragOver" 
           @drop="onDrop('done')">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-medium text-green-900">Done</h3>
          <span class="bg-green-200 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
            {{ getTasksByStatus('done').length }}
          </span>
        </div>
        <div class="space-y-2">
          <div v-for="task in getTasksByStatus('done')" :key="task._id" 
               class="bg-white p-3 rounded border cursor-pointer hover:shadow-sm transition-shadow"
               draggable="true"
               @dragstart="onDragStart(task)"
               @click="viewTaskDetails(task)">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="font-medium text-sm text-gray-900">{{ task.title }}</h4>
                <p class="text-xs text-gray-600 mt-1">{{ task.description?.substring(0, 50) }}...</p>
                <div class="flex items-center space-x-2 mt-2">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="getPriorityClass(task.priority)">
                    {{ task.priority }}
                  </span>
                  <span v-if="task.completedAt" class="text-xs text-green-600">
                    Completed {{ formatDate(task.completedAt) }}
                  </span>
                </div>
              </div>
              <div class="flex flex-col items-end space-y-1">
                <div v-if="task.assignedTo" class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-xs text-green-600 font-medium">
                    {{ task.assignedTo.firstName?.charAt(0) }}
                  </span>
                </div>
                <div v-if="task.actualHours" class="text-xs text-gray-500">
                  {{ task.actualHours }}h
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Task Button -->
    <div class="mt-6">
      <button @click="showAddTaskModal = true" 
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
        <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Add Task
      </button>
    </div>

    <!-- Task Details Modal -->
    <div v-if="showTaskDetailModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <!-- Header -->
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-medium text-gray-900">Task Details</h3>
            <button @click="showTaskDetailModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Task Information -->
          <div v-if="selectedTask" class="space-y-4">
            <div>
              <h4 class="text-lg font-semibold text-gray-900">{{ selectedTask.title }}</h4>
              <p class="text-gray-600 mt-2">{{ selectedTask.description }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-sm font-medium text-gray-500">Status</span>
                <span :class="getStatusClass(selectedTask.status)" class="ml-2 px-2 py-1 text-xs font-medium rounded-full">
                  {{ selectedTask.status }}
                </span>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-500">Priority</span>
                <span :class="getPriorityClass(selectedTask.priority)" class="ml-2 px-2 py-1 text-xs font-medium rounded-full">
                  {{ selectedTask.priority }}
                </span>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-500">Assigned To</span>
                <span class="ml-2 text-sm text-gray-900">
                  {{ selectedTask.assignedTo?.firstName }} {{ selectedTask.assignedTo?.lastName }}
                </span>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-500">Due Date</span>
                <span class="ml-2 text-sm text-gray-900">
                  {{ selectedTask.dueDate ? formatDate(selectedTask.dueDate) : 'Not set' }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-sm font-medium text-gray-500">Estimated Hours</span>
                <span class="ml-2 text-sm text-gray-900">{{ selectedTask.estimatedHours || 0 }}h</span>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-500">Actual Hours</span>
                <span class="ml-2 text-sm text-gray-900">{{ selectedTask.actualHours || 0 }}h</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-3 pt-4 border-t">
              <button @click="editTask(selectedTask)" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Edit Task
              </button>
              <button @click="showTaskDetailModal = false" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Task Modal -->
    <div v-if="showAddTaskModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <!-- Header -->
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-medium text-gray-900">Add New Task</h3>
            <button @click="showAddTaskModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Add Task Form -->
          <form @submit.prevent="addTask" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Task Title</label>
              <input v-model="newTask.title" type="text" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <textarea v-model="newTask.description" rows="3" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Priority</label>
                <select v-model="newTask.priority" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Status</label>
                <select v-model="newTask.status" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Due Date</label>
                <input v-model="newTask.dueDate" type="date" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Estimated Hours</label>
                <input v-model.number="newTask.estimatedHours" type="number" min="0" step="0.5" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Assign To</label>
              <select v-model="newTask.assignedTo" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Select team member</option>
                <option v-for="member in project?.team?.members" :key="member.user._id" :value="member.user._id">
                  {{ member.user.firstName }} {{ member.user.lastName }}
                </option>
              </select>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-3 pt-4 border-t">
              <button type="button" @click="showAddTaskModal = false" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { taskService } from '../services/taskService'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['task-updated', 'task-created'])

// State
const tasks = ref([])
const loading = ref(false)
const showTaskDetailModal = ref(false)
const showAddTaskModal = ref(false)
const selectedTask = ref(null)
const draggedTask = ref(null)

// New task form
const newTask = ref({
  title: '',
  description: '',
  priority: 'medium',
  status: 'todo',
  dueDate: '',
  estimatedHours: 0,
  assignedTo: ''
})

// Computed
const getTasksByStatus = (status) => {
  return tasks.value.filter(task => task.status === status)
}

// Methods
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

const getPriorityClass = (priority) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800'
    case 'high':
      return 'bg-yellow-100 text-yellow-800'
    case 'medium':
      return 'bg-blue-100 text-blue-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 'todo':
      return 'bg-gray-100 text-gray-800'
    case 'in-progress':
      return 'bg-blue-100 text-blue-800'
    case 'review':
      return 'bg-yellow-100 text-yellow-800'
    case 'done':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Load tasks for the project
const loadTasks = async () => {
  if (!props.project?._id) return
  
  try {
    loading.value = true
    console.log('Loading tasks for project:', props.project._id)
    
    const response = await taskService.getTasksByProject(props.project._id)
    console.log('Tasks response:', response)
    
    if (response.success) {
      tasks.value = response.data.tasks || []
      console.log('Loaded tasks:', tasks.value)
    } else {
      console.error('Failed to load tasks:', response.message)
      tasks.value = []
    }
  } catch (error) {
    console.error('Failed to load tasks:', error)
    tasks.value = []
  } finally {
    loading.value = false
  }
}

// Drag and drop handlers
const onDragStart = (task) => {
  draggedTask.value = task
}

const onDragOver = (event) => {
  event.preventDefault()
}

const onDrop = async (newStatus) => {
  if (draggedTask.value && draggedTask.value.status !== newStatus) {
    try {
      console.log(`Updating task ${draggedTask.value._id} status to ${newStatus}`)
      
      // Update task status via API
      const response = await taskService.updateTaskStatus(draggedTask.value._id, newStatus)
      
      if (response.success) {
        // Update local task status
        draggedTask.value.status = newStatus
        emit('task-updated', draggedTask.value)
        console.log(`Task ${draggedTask.value.title} moved to ${newStatus}`)
      } else {
        console.error('Failed to update task status:', response.message)
      }
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }
  draggedTask.value = null
}

// Task actions
const viewTaskDetails = (task) => {
  selectedTask.value = task
  showTaskDetailModal.value = true
}

const editTask = (task) => {
  // Implement task editing
  console.log('Edit task:', task)
}

const addTask = async () => {
  try {
    console.log('Creating new task:', newTask.value)
    
    // Prepare task data
    const taskData = {
      ...newTask.value,
      project: props.project._id,
      assignedTo: newTask.value.assignedTo || null
    }
    
    // Create task via API
    const response = await taskService.createTask(taskData)
    
    if (response.success) {
      console.log('Task created successfully:', response.data)
      
      // Add new task to local state
      tasks.value.push(response.data.task)
      emit('task-created', response.data.task)
      
      // Reset form
      newTask.value = {
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        estimatedHours: 0,
        assignedTo: ''
      }
      
      showAddTaskModal.value = false
    } else {
      console.error('Failed to create task:', response.message)
    }
  } catch (error) {
    console.error('Failed to create task:', error)
  }
}

// Load tasks when component mounts
onMounted(() => {
  loadTasks()
})
</script> 