const express = require('express')
const router = express.Router()
const sprintController = require('../controllers/sprintController')
const { auth } = require('../middleware/auth')

// Get all sprints
router.get('/', auth, sprintController.getSprints)

// Create a new sprint
router.post('/', auth, sprintController.createSprint)

// Update a sprint
router.patch('/:id', auth, sprintController.updateSprint)

// Delete a sprint
router.delete('/:id', auth, sprintController.deleteSprint)

// Start a sprint
router.post('/:id/start', auth, sprintController.startSprint)

// Complete a sprint
router.post('/:id/complete', auth, sprintController.completeSprint)

// Get sprint metrics
router.get('/:id/metrics', auth, sprintController.getSprintMetrics)

// Add a task to a sprint
router.post('/:id/tasks', auth, sprintController.addTask)

// Remove a task from a sprint
router.delete('/:id/tasks/:taskId', auth, sprintController.removeTask)

module.exports = router 