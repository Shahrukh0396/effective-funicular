const cron = require('node-cron')
const sessionService = require('../services/sessionService')
const AuditLog = require('../models/AuditLog')
const User = require('../models/User')
const config = require('../config')

class Scheduler {
  constructor() {
    this.tasks = []
  }

  // Initialize all scheduled tasks
  init() {
    console.log('Initializing scheduled tasks...')
    
    // Session cleanup - every 15 minutes
    this.scheduleSessionCleanup()
    
    // Audit log cleanup - daily at 2 AM
    this.scheduleAuditLogCleanup()
    
    // Password expiration check - daily at 9 AM
    this.schedulePasswordExpirationCheck()
    
    // Account lockout cleanup - every hour
    this.scheduleAccountLockoutCleanup()
    
    // Session health monitoring - every 30 minutes
    this.scheduleSessionHealthMonitoring()
    
    console.log('Scheduled tasks initialized')
  }

  // Schedule session cleanup
  scheduleSessionCleanup() {
    const task = cron.schedule('*/15 * * * *', async () => {
      try {
        console.log('Running session cleanup...')
        const cleanedCount = await sessionService.cleanupExpiredSessions()
        console.log(`Session cleanup completed: ${cleanedCount} sessions cleaned`)
      } catch (error) {
        console.error('Session cleanup error:', error)
      }
    }, {
      scheduled: false
    })
    
    task.start()
    this.tasks.push({ name: 'session-cleanup', task })
    console.log('Session cleanup scheduled (every 15 minutes)')
  }

  // Schedule audit log cleanup
  scheduleAuditLogCleanup() {
    const task = cron.schedule('0 2 * * *', async () => {
      try {
        console.log('Running audit log cleanup...')
        const deletedCount = await AuditLog.cleanupOldLogs(90) // Keep 90 days
        console.log(`Audit log cleanup completed: ${deletedCount} logs deleted`)
      } catch (error) {
        console.error('Audit log cleanup error:', error)
      }
    }, {
      scheduled: false
    })
    
    task.start()
    this.tasks.push({ name: 'audit-log-cleanup', task })
    console.log('Audit log cleanup scheduled (daily at 2 AM)')
  }

  // Schedule password expiration check
  schedulePasswordExpirationCheck() {
    const task = cron.schedule('0 9 * * *', async () => {
      try {
        console.log('Running password expiration check...')
        const expiredUsers = await User.findExpiredPasswords()
        
        if (expiredUsers.length > 0) {
          console.log(`Found ${expiredUsers.length} users with expired passwords`)
          
          // TODO: Send email notifications to users with expired passwords
          for (const user of expiredUsers) {
            console.log(`User ${user.email} has expired password`)
            // await sendPasswordExpirationEmail(user)
          }
        }
      } catch (error) {
        console.error('Password expiration check error:', error)
      }
    }, {
      scheduled: false
    })
    
    task.start()
    this.tasks.push({ name: 'password-expiration-check', task })
    console.log('Password expiration check scheduled (daily at 9 AM)')
  }

  // Schedule account lockout cleanup
  scheduleAccountLockoutCleanup() {
    const task = cron.schedule('0 * * * *', async () => {
      try {
        console.log('Running account lockout cleanup...')
        const now = new Date()
        
        // Find users with expired lockouts
        const lockedUsers = await User.find({
          'security.accountLockedUntil': { $lt: now }
        })
        
        for (const user of lockedUsers) {
          user.security.accountLockedUntil = null
          user.security.failedAttempts = 0
          await user.save()
          console.log(`Unlocked account for user ${user.email}`)
        }
        
        if (lockedUsers.length > 0) {
          console.log(`Unlocked ${lockedUsers.length} accounts`)
        }
      } catch (error) {
        console.error('Account lockout cleanup error:', error)
      }
    }, {
      scheduled: false
    })
    
    task.start()
    this.tasks.push({ name: 'account-lockout-cleanup', task })
    console.log('Account lockout cleanup scheduled (every hour)')
  }

  // Schedule session health monitoring
  scheduleSessionHealthMonitoring() {
    const task = cron.schedule('*/30 * * * *', async () => {
      try {
        console.log('Running session health monitoring...')
        const health = await sessionService.monitorSessionHealth()
        
        if (health.issues.length > 0) {
          console.log('Session health issues detected:', health.issues)
          // TODO: Send alerts to administrators
          // await sendSessionHealthAlert(health)
        }
        
        console.log('Session health monitoring completed')
      } catch (error) {
        console.error('Session health monitoring error:', error)
      }
    }, {
      scheduled: false
    })
    
    task.start()
    this.tasks.push({ name: 'session-health-monitoring', task })
    console.log('Session health monitoring scheduled (every 30 minutes)')
  }

  // Stop all scheduled tasks
  stop() {
    console.log('Stopping all scheduled tasks...')
    this.tasks.forEach(({ name, task }) => {
      task.stop()
      console.log(`Stopped task: ${name}`)
    })
    this.tasks = []
  }

  // Get status of all tasks
  getStatus() {
    return this.tasks.map(({ name, task }) => ({
      name,
      running: task.running
    }))
  }

  // Run a task immediately
  async runTask(taskName) {
    try {
      switch (taskName) {
        case 'session-cleanup':
          return await sessionService.cleanupExpiredSessions()
        
        case 'audit-log-cleanup':
          return await AuditLog.cleanupOldLogs(90)
        
        case 'password-expiration-check':
          return await User.findExpiredPasswords()
        
        case 'account-lockout-cleanup':
          const now = new Date()
          const lockedUsers = await User.find({
            'security.accountLockedUntil': { $lt: now }
          })
          for (const user of lockedUsers) {
            user.security.accountLockedUntil = null
            user.security.failedAttempts = 0
            await user.save()
          }
          return lockedUsers.length
        
        case 'session-health-monitoring':
          return await sessionService.monitorSessionHealth()
        
        default:
          throw new Error(`Unknown task: ${taskName}`)
      }
    } catch (error) {
      console.error(`Error running task ${taskName}:`, error)
      throw error
    }
  }
}

module.exports = new Scheduler() 