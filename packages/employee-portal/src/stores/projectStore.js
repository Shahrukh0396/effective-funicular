import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '../config/axios'

export const PROJECT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ON_HOLD: 'on-hold',
  CANCELLED: 'cancelled'
}

export const PROJECT_HEALTH = {
  GOOD: 'good',
  WARNING: 'warning',
  CRITICAL: 'critical'
}

export const useProjectStore = defineStore('projects', () => {
  const projects = ref([])
  const currentProject = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Sample projects data - replace with actual API calls
  const sampleProjects = [
    {
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
        { name: 'John Doe', initials: 'JD', role: 'Developer' },
        { name: 'Jane Smith', initials: 'JS', role: 'Designer' }
      ],
      
      // Metadata
      createdAt: '2024-03-01T10:00:00Z',
      updatedAt: '2024-03-15T14:30:00Z'
    },
    {
      id: 2,
      name: 'Mobile App Development',
      type: 'mobile-app',
      description: 'Development of iOS and Android mobile applications for customer engagement',
      status: 'active',
      health: 'warning',
      startDate: '2024-03-10',
      dueDate: '2024-05-30',
      priority: 'medium',
      budgetRange: '50k-100k',
      estimatedDuration: '4-6-months',
      teamSize: '6-10',
      projectManager: 'Mike Wilson',
      
      // Requirements
      businessRequirements: 'Need mobile applications to increase customer engagement and provide on-the-go access to our services. Target both iOS and Android platforms.',
      functionalRequirements: '1. User authentication and profile management\n2. Push notifications\n3. Offline functionality\n4. Payment integration\n5. Social media sharing\n6. Analytics and crash reporting',
      nonFunctionalRequirements: '1. App store compliance\n2. Performance optimization\n3. Security standards\n4. Cross-platform consistency',
      technicalSpecifications: 'React Native, Firebase backend, Redux state management, native device APIs',
      
      // Documents
      srsDocument: { name: 'Mobile_App_SRS_v1.0.pdf', size: 1536000 },
      additionalDocuments: [
        { name: 'UI_Designs.sketch', size: 8192000 },
        { name: 'API_Specifications.pdf', size: 1024000 }
      ],
      documentNotes: 'Design files include complete UI/UX mockups. API specifications detail all backend integrations.',
      
      // Timeline & Budget
      milestones: '1. Requirements & Design (Month 1)\n2. Core Development (Month 2-4)\n3. Testing & QA (Month 5)\n4. App Store Submission (Month 6)',
      
      // Team & Stakeholders
      stakeholders: 'CTO: David Brown (technical decisions)\nProduct Manager: Amy Lee (feature prioritization)\nMarketing Team: Brand guidelines and messaging',
      communicationPreferences: 'Bi-weekly sprint reviews. Daily standups. Monthly stakeholder demos.',
      specialRequirements: 'Must support both iOS 13+ and Android 8+. Integration with existing web platform required.',
      
      team: [
        { name: 'Alex Chen', initials: 'AC', role: 'Mobile Developer' },
        { name: 'Maria Garcia', initials: 'MG', role: 'UI/UX Designer' },
        { name: 'Tom Johnson', initials: 'TJ', role: 'Backend Developer' }
      ],
      
      // Metadata
      createdAt: '2024-03-10T09:00:00Z',
      updatedAt: '2024-03-20T16:45:00Z'
    }
  ]

  // Computed properties
  const activeProjects = computed(() => 
    projects.value.filter(project => project.status === PROJECT_STATUS.ACTIVE)
  )

  const projectsByPriority = computed(() => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    return [...projects.value].sort((a, b) => 
      (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
    )
  })

  const projectsByHealth = computed(() => {
    const healthOrder = { critical: 3, warning: 2, good: 1 }
    return [...projects.value].sort((a, b) => 
      (healthOrder[b.health] || 0) - (healthOrder[a.health] || 0)
    )
  })

  // Methods
  const fetchProjects = async () => {
    loading.value = true
    error.value = null
    try {
      // Make actual API call to employee projects endpoint
      const response = await axios.get('/api/employee/projects')
      projects.value = response.data
    } catch (err) {
      error.value = 'Failed to fetch projects'
      console.error('Error fetching projects:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchProjectById = async (projectId) => {
    loading.value = true
    error.value = null
    try {
      // Make actual API call to get project details
      const response = await axios.get(`/api/employee/projects/${projectId}`)
      currentProject.value = response.data
      if (!currentProject.value) {
        error.value = 'Project not found'
      }
    } catch (err) {
      error.value = 'Failed to fetch project details'
      console.error('Error fetching project:', err)
    } finally {
      loading.value = false
    }
  }

  const updateProjectStatus = async (projectId, status) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/projects/${projectId}/status`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ status })
      // })
      
      const project = projects.value.find(p => p.id === projectId)
      if (project) {
        project.status = status
        project.updatedAt = new Date().toISOString()
      }
    } catch (err) {
      error.value = 'Failed to update project status'
      console.error('Error updating project status:', err)
    }
  }

  const updateProjectHealth = async (projectId, health) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/projects/${projectId}/health`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ health })
      // })
      
      const project = projects.value.find(p => p.id === projectId)
      if (project) {
        project.health = health
        project.updatedAt = new Date().toISOString()
      }
    } catch (err) {
      error.value = 'Failed to update project health'
      console.error('Error updating project health:', err)
    }
  }

  return {
    projects,
    currentProject,
    loading,
    error,
    activeProjects,
    projectsByPriority,
    projectsByHealth,
    fetchProjects,
    fetchProjectById,
    updateProjectStatus,
    updateProjectHealth
  }
}) 