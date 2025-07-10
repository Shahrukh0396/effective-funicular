import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const ROLES = {
  DEVELOPER: 'developer',
  DESIGNER: 'designer',
  PROJECT_MANAGER: 'project_manager',
  QA: 'qa',
  SALES: 'sales',
  EMPLOYEE: 'employee',
  SENIOR: 'senior',
  LEAD: 'lead'
}

export const DEPARTMENTS = {
  IT: 'it',
  SALES: 'sales',
  DESIGN: 'design',
  QA: 'qa',
  MANAGEMENT: 'management'
}

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const role = ref(null)
  const department = ref(null)
  const skills = ref([])
  const performance = ref({
    tasksCompleted: 0,
    successRate: 0,
    averageResponseTime: 0,
    points: 0
  })

  const isDeveloper = computed(() => role.value === ROLES.DEVELOPER)
  const isDesigner = computed(() => role.value === ROLES.DESIGNER)
  const isProjectManager = computed(() => role.value === ROLES.PROJECT_MANAGER)
  const isQA = computed(() => role.value === ROLES.QA)
  const isSales = computed(() => role.value === ROLES.SALES)
  const isEmployee = computed(() => role.value === ROLES.EMPLOYEE)
  const isSenior = computed(() => role.value === ROLES.SENIOR)
  const isLead = computed(() => role.value === ROLES.LEAD)

  const canAccessTask = (task) => {
    // For now, allow all employees to access all tasks
    // This can be enhanced with role-based access control later
    return true
  }

  const setUser = (userData) => {
    user.value = userData
    role.value = userData.role
    department.value = userData.department
    skills.value = userData.skills || []
  }

  const clearUser = () => {
    user.value = null
    role.value = null
    department.value = null
    skills.value = []
    performance.value = {
      tasksCompleted: 0,
      successRate: 0,
      averageResponseTime: 0,
      points: 0
    }
  }

  const updatePerformance = (newPerformance) => {
    performance.value = {
      ...performance.value,
      ...newPerformance
    }
  }

  return {
    user,
    role,
    department,
    skills,
    performance,
    isDeveloper,
    isDesigner,
    isProjectManager,
    isQA,
    isSales,
    isEmployee,
    isSenior,
    isLead,
    canAccessTask,
    setUser,
    clearUser,
    updatePerformance
  }
}) 