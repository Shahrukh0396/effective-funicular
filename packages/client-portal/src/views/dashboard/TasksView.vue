<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl font-semibold text-gray-900">Task Management</h1>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            @click="showAddTaskModal = true"
          >
            Create Issue
          </button>
          <button
            type="button"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            @click="showFilters = !showFilters"
          >
            Filters
          </button>
        </div>
      </div>

      <!-- Filters Panel -->
      <div v-if="showFilters" class="mt-4 bg-white shadow rounded-lg p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Type</label>
            <select v-model="filters.type" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              <option value="">All Types</option>
              <option value="epic">Epic</option>
              <option value="story">Story</option>
              <option value="task">Task</option>
              <option value="bug">Bug</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Priority</label>
            <select v-model="filters.priority" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              <option value="">All Priorities</option>
              <option value="highest">Highest</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="lowest">Lowest</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <select v-model="filters.status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="in-review">In Review</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Assignee</label>
            <select v-model="filters.assignee" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              <option value="">All Assignees</option>
              <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Project Progress Overview -->
      <div class="mt-8">
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Project Progress</h3>
          <div class="space-y-4">
            <div v-for="project in projects" :key="project.id" class="border-b border-gray-200 pb-4 last:border-0">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm font-medium text-gray-900">{{ project.name }}</h4>
                <span class="text-sm text-gray-500">{{ projectProgress[project.id] }}%</span>
              </div>
              <div class="relative pt-1">
                <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                  <div
                    :style="{ width: `${projectProgress[project.id]}%` }"
                    class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Task List -->
      <div class="mt-8">
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" class="divide-y divide-gray-200">
            <li v-for="task in filteredTasks" :key="task.id">
              <div class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <!-- Task Type Icon -->
                    <div :class="getTaskTypeClass(task.type)" class="flex-shrink-0">
                      <TaskIcons :name="getTaskTypeIcon(task.type)" />
                    </div>
                    
                    <!-- Task Key and Title -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center">
                        <p class="text-sm font-medium text-gray-900">
                          {{ task.key }} - {{ task.title }}
                        </p>
                        <span
                          :class="getPriorityClass(task.priority)"
                          class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        >
                          {{ task.priority }}
                        </span>
                      </div>
                      <p class="text-sm text-gray-500">{{ task.description }}</p>
                      <div class="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>Project: {{ getProjectName(task.projectId) }}</span>
                        <span>Assignee: {{ getAssigneeName(task.assigneeId) }}</span>
                        <span>Due: {{ formatDate(task.dueDate) }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Task Status and Actions -->
                  <div class="flex items-center space-x-4">
                    <span
                      :class="getStatusClass(task.status)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ task.status }}
                    </span>
                    <div class="flex items-center space-x-2">
                      <button
                        @click="openTaskDetails(task)"
                        class="text-gray-400 hover:text-gray-500"
                      >
                        <span class="sr-only">View details</span>
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                        </svg>
                      </button>
                      <button
                        @click="editTask(task)"
                        class="text-gray-400 hover:text-gray-500"
                      >
                        <span class="sr-only">Edit</span>
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Create/Edit Task Modal -->
    <div v-if="showAddTaskModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              {{ editingTask ? 'Edit Task' : 'Create New Task' }}
            </h3>
            <form @submit.prevent="saveTask" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="type" class="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    id="type"
                    v-model="taskForm.type"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="epic">Epic</option>
                    <option value="story">Story</option>
                    <option value="task">Task</option>
                    <option value="bug">Bug</option>
                  </select>
                </div>

                <div>
                  <label for="priority" class="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    id="priority"
                    v-model="taskForm.priority"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="highest">Highest</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="lowest">Lowest</option>
                  </select>
                </div>
              </div>

              <div>
                <label for="project" class="block text-sm font-medium text-gray-700">Project</label>
                <select
                  id="project"
                  v-model="taskForm.projectId"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Select a project</option>
                  <option v-for="project in projects" :key="project.id" :value="project.id">
                    {{ project.name }}
                  </option>
                </select>
              </div>

              <div>
                <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  id="title"
                  v-model="taskForm.title"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  v-model="taskForm.description"
                  rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="assignee" class="block text-sm font-medium text-gray-700">Assignee</label>
                  <select
                    id="assignee"
                    v-model="taskForm.assigneeId"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Unassigned</option>
                    <option v-for="user in users" :key="user.id" :value="user.id">
                      {{ user.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label for="dueDate" class="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    id="dueDate"
                    v-model="taskForm.dueDate"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                >
                  {{ editingTask ? 'Save Changes' : 'Create Task' }}
                </button>
                <button
                  type="button"
                  class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  @click="closeTaskModal"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Details Modal -->
    <TaskDetails
      v-if="selectedTask"
      :task="selectedTask"
      @close="closeTaskDetails"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import TaskDetails from '@/components/TaskDetails.vue'
import TaskIcons from '@/components/icons/TaskIcons.vue'

// Sample users data - replace with actual API call
const users = ref([
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Mike Johnson' }
])

// Filters
const showFilters = ref(false)
const filters = ref({
  type: '',
  priority: '',
  status: '',
  assignee: ''
})

// Task form
const showAddTaskModal = ref(false)
const editingTask = ref(null)
const taskForm = ref({
  type: 'task',
  priority: 'medium',
  projectId: '',
  title: '',
  description: '',
  assigneeId: '',
  dueDate: '',
  status: 'todo'
})

// Sample projects data - replace with actual API call
const projects = ref([
  {
    id: 1,
    name: 'Website Redesign',
    status: 'active',
    description: 'Complete overhaul of the company website with modern design and improved UX',
    startDate: '2024-03-01',
    dueDate: '2024-04-15'
  },
  {
    id: 2,
    name: 'Mobile App Development',
    status: 'active',
    description: 'Development of iOS and Android mobile applications',
    startDate: '2024-03-10',
    dueDate: '2024-05-30'
  },
  {
    id: 3,
    name: 'Content Migration',
    status: 'active',
    description: 'Migrate existing content to new CMS platform',
    startDate: '2024-03-15',
    dueDate: '2024-04-30'
  },
  {
    id: 4,
    name: 'SEO Optimization',
    status: 'active',
    description: 'Improve website SEO and implement new content strategy',
    startDate: '2024-03-20',
    dueDate: '2024-05-15'
  }
])

// Sample tasks data - replace with actual API call
const tasks = ref([
  {
    id: 1,
    key: 'PROJ-1',
    type: 'story',
    title: 'Implement user authentication',
    description: 'Add secure user authentication system with JWT',
    status: 'in-progress',
    priority: 'high',
    projectId: 1,
    assigneeId: 1,
    dueDate: '2024-03-25'
  },
  {
    id: 2,
    key: 'PROJ-2',
    type: 'bug',
    title: 'Fix login page layout',
    description: 'Login form is not properly aligned on mobile devices',
    status: 'todo',
    priority: 'medium',
    projectId: 1,
    assigneeId: 2,
    dueDate: '2024-03-20'
  }
])

// Computed properties
const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    if (filters.value.type && task.type !== filters.value.type) return false
    if (filters.value.priority && task.priority !== filters.value.priority) return false
    if (filters.value.status && task.status !== filters.value.status) return false
    if (filters.value.assignee && task.assigneeId !== parseInt(filters.value.assignee)) return false
    return true
  })
})

// Add computed property for project progress
const projectProgress = computed(() => {
  const progress = {}
  projects.value.forEach(project => {
    const projectTasks = tasks.value.filter(task => task.projectId === project.id)
    const completedProjectTasks = projectTasks.filter(task => task.completed).length
    progress[project.id] = projectTasks.length ? Math.round((completedProjectTasks / projectTasks.length) * 100) : 0
  })
  return progress
})

// Helper functions
function getTaskTypeClass(type) {
  const classes = {
    epic: 'text-purple-500',
    story: 'text-blue-500',
    task: 'text-green-500',
    bug: 'text-red-500'
  }
  return classes[type] || 'text-gray-500'
}

function getTaskTypeIcon(type) {
  const icons = {
    epic: 'EpicIcon',
    story: 'StoryIcon',
    task: 'TaskIcon',
    bug: 'BugIcon'
  }
  return icons[type] || 'TaskIcon'
}

function getPriorityClass(priority) {
  const classes = {
    highest: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
    lowest: 'bg-gray-100 text-gray-800'
  }
  return classes[priority] || 'bg-gray-100 text-gray-800'
}

function getStatusClass(status) {
  const classes = {
    'todo': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'in-review': 'bg-yellow-100 text-yellow-800',
    'done': 'bg-green-100 text-green-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function getProjectName(projectId) {
  const project = projects.value.find(p => p.id === projectId)
  return project ? project.name : 'Unknown Project'
}

function getAssigneeName(assigneeId) {
  const user = users.value.find(u => u.id === assigneeId)
  return user ? user.name : 'Unassigned'
}

function formatDate(date) {
  return format(new Date(date), 'MMM d, yyyy')
}

// Task management functions
const selectedTask = ref(null)

function openTaskDetails(task) {
  selectedTask.value = task
}

function closeTaskDetails() {
  selectedTask.value = null
}

function editTask(task) {
  editingTask.value = task
  taskForm.value = { ...task }
  showAddTaskModal.value = true
}

function closeTaskModal() {
  showAddTaskModal.value = false
  editingTask.value = null
  taskForm.value = {
    type: 'task',
    priority: 'medium',
    projectId: '',
    title: '',
    description: '',
    assigneeId: '',
    dueDate: '',
    status: 'todo'
  }
}

function saveTask() {
  if (editingTask.value) {
    // Update existing task
    const index = tasks.value.findIndex(t => t.id === editingTask.value.id)
    if (index !== -1) {
      tasks.value[index] = { ...editingTask.value, ...taskForm.value }
    }
  } else {
    // Create new task
    const newTask = {
      id: tasks.value.length + 1,
      key: `PROJ-${tasks.value.length + 1}`,
      ...taskForm.value
    }
    tasks.value.push(newTask)
  }
  closeTaskModal()
}
</script> 