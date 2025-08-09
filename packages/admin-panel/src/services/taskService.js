import axios from '../config/axios'

const taskService = {
  // Get all tasks for a project
  async getTasksByProject(projectId) {
    try {
      const response = await axios.get(`/api/tasks/project/${projectId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching tasks:', error)
      throw new Error('Failed to fetch tasks')
    }
  },

  // Get task by ID
  async getTaskById(taskId) {
    try {
      const response = await axios.get(`/api/tasks/${taskId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching task:', error)
      throw new Error('Failed to fetch task')
    }
  },

  // Create new task
  async createTask(taskData) {
    try {
      const response = await axios.post('/api/tasks', taskData)
      return response.data
    } catch (error) {
      console.error('Error creating task:', error)
      throw new Error('Failed to create task')
    }
  },

  // Update task
  async updateTask(taskId, updateData) {
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, updateData)
      return response.data
    } catch (error) {
      console.error('Error updating task:', error)
      throw new Error('Failed to update task')
    }
  },

  // Delete task
  async deleteTask(taskId) {
    try {
      const response = await axios.delete(`/api/tasks/${taskId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting task:', error)
      throw new Error('Failed to delete task')
    }
  },

  // Update task status (for drag and drop)
  async updateTaskStatus(taskId, status) {
    try {
      const response = await axios.patch(`/api/tasks/${taskId}/status`, { status })
      return response.data
    } catch (error) {
      console.error('Error updating task status:', error)
      throw new Error('Failed to update task status')
    }
  }
}

export { taskService } 