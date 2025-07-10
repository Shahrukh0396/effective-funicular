<template>
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
    <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div :class="getTaskTypeClass(task.type)" class="flex-shrink-0">
              <TaskIcons :name="getTaskTypeIcon(task.type)" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900">
                {{ task.key }} - {{ task.title }}
              </h2>
              <div class="mt-1 flex items-center space-x-4">
                <span :class="getStatusClass(task.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ task.status }}
                </span>
                <span :class="getPriorityClass(task.priority)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ task.priority }}
                </span>
              </div>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-500"
          >
            <span class="sr-only">Close</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="px-6 py-4">
        <div class="grid grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="col-span-2 space-y-6">
            <!-- Description -->
            <div>
              <h3 class="text-lg font-medium text-gray-900">Description</h3>
              <div class="mt-2 prose prose-sm max-w-none">
                <p>{{ task.description }}</p>
              </div>
            </div>

            <!-- Comments -->
            <div>
              <h3 class="text-lg font-medium text-gray-900">Comments</h3>
              <div class="mt-4 space-y-4">
                <div v-for="comment in task.comments" :key="comment.id" class="flex space-x-3">
                  <div class="flex-shrink-0">
                    <img
                      :src="comment.author.avatar"
                      :alt="comment.author.name"
                      class="h-10 w-10 rounded-full"
                    />
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <h4 class="text-sm font-medium text-gray-900">{{ comment.author.name }}</h4>
                      <p class="text-sm text-gray-500">{{ formatDate(comment.createdAt) }}</p>
                    </div>
                    <div class="mt-1 text-sm text-gray-700">
                      <p>{{ comment.content }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- New Comment -->
              <div class="mt-4">
                <textarea
                  v-model="newComment"
                  rows="3"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Add a comment..."
                ></textarea>
                <div class="mt-2 flex justify-end">
                  <button
                    @click="addComment"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>

            <!-- Attachments -->
            <div>
              <h3 class="text-lg font-medium text-gray-900">Attachments</h3>
              <div class="mt-4">
                <div class="flex items-center justify-center w-full">
                  <label
                    class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg class="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p class="mb-2 text-sm text-gray-500">
                        <span class="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p class="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                    </div>
                    <input type="file" class="hidden" @change="handleFileUpload" />
                  </label>
                </div>

                <!-- Attachment List -->
                <div class="mt-4 space-y-2">
                  <div v-for="attachment in task.attachments" :key="attachment.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center space-x-3">
                      <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ attachment.name }}</p>
                        <p class="text-xs text-gray-500">{{ formatFileSize(attachment.size) }}</p>
                      </div>
                    </div>
                    <button
                      @click="downloadAttachment(attachment)"
                      class="text-indigo-600 hover:text-indigo-900"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Details -->
            <div>
              <h3 class="text-lg font-medium text-gray-900">Details</h3>
              <dl class="mt-4 space-y-4">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Project</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ getProjectName(task.projectId) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Assignee</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ getAssigneeName(task.assigneeId) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Due Date</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatDate(task.dueDate) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Created</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatDate(task.createdAt) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Updated</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatDate(task.updatedAt) }}</dd>
                </div>
              </dl>
            </div>

            <!-- Activity -->
            <div>
              <h3 class="text-lg font-medium text-gray-900">Activity</h3>
              <div class="mt-4 flow-root">
                <ul role="list" class="-mb-8">
                  <li v-for="(activity, index) in task.activity" :key="activity.id">
                    <div class="relative pb-8">
                      <span
                        v-if="index !== task.activity.length - 1"
                        class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      ></span>
                      <div class="relative flex space-x-3">
                        <div>
                          <span
                            :class="[
                              activity.type === 'comment' ? 'bg-gray-400' : 'bg-indigo-500',
                              'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white'
                            ]"
                          >
                            <component
                              :is="TaskIcons"
                              :name="getActivityIcon(activity.type)"
                              class="h-5 w-5 text-white"
                              aria-hidden="true"
                            />
                          </span>
                        </div>
                        <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p class="text-sm text-gray-500">
                              {{ activity.description }}
                              <span class="font-medium text-gray-900">{{ activity.user.name }}</span>
                            </p>
                          </div>
                          <div class="text-right text-sm whitespace-nowrap text-gray-500">
                            <time :datetime="activity.createdAt">{{ formatDate(activity.createdAt) }}</time>
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { format } from 'date-fns'
import TaskIcons from './icons/TaskIcons.vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const newComment = ref('')

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

function getStatusClass(status) {
  const classes = {
    'todo': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'in-review': 'bg-yellow-100 text-yellow-800',
    'done': 'bg-green-100 text-green-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
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

function getActivityIcon(type) {
  const icons = {
    comment: 'CommentIcon',
    status: 'StatusIcon',
    assignee: 'AssigneeIcon',
    attachment: 'AttachmentIcon'
  }
  return icons[type] || 'ActivityIcon'
}

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

function getProjectName(projectId) {
  // Replace with actual project lookup
  return 'Project ' + projectId
}

function getAssigneeName(assigneeId) {
  // Replace with actual user lookup
  return 'User ' + assigneeId
}

// Event handlers
function addComment() {
  if (!newComment.value.trim()) return

  const comment = {
    id: Date.now(),
    content: newComment.value,
    author: {
      id: 1, // Replace with actual user
      name: 'Current User',
      avatar: 'https://via.placeholder.com/40'
    },
    createdAt: new Date().toISOString()
  }

  props.task.comments.push(comment)
  newComment.value = ''
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const attachment = {
    id: Date.now(),
    name: file.name,
    size: file.size,
    type: file.type,
    url: URL.createObjectURL(file)
  }

  props.task.attachments.push(attachment)
}

function downloadAttachment(attachment) {
  // Implement file download logic
  console.log('Downloading attachment:', attachment)
}
</script> 