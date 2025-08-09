<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Smart Header with View Toggle -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Smart Project Control Center</h1>
            <p class="mt-1 text-sm text-gray-500">Comprehensive project management with real-time insights</p>
          </div>
          <div class="flex items-center space-x-4">
            <!-- View Toggle -->
            <div class="flex bg-gray-100 rounded-lg p-1">
              <button 
                @click="currentView = 'dashboard'"
                :class="currentView === 'dashboard' ? 'bg-white shadow-sm' : 'text-gray-600'"
                class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </button>
              <button 
                @click="currentView = 'kanban'"
                :class="currentView === 'kanban' ? 'bg-white shadow-sm' : 'text-gray-600'"
                class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Kanban
              </button>
              <button 
                @click="currentView = 'timeline'"
                :class="currentView === 'timeline' ? 'bg-white shadow-sm' : 'text-gray-600'"
                class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Timeline
              </button>
              <button 
                @click="currentView = 'analytics'"
                :class="currentView === 'analytics' ? 'bg-white shadow-sm' : 'text-gray-600'"
                class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Analytics
              </button>
            </div>
            
            <!-- Quick Actions -->
            <button
              @click="showQuickActions = !showQuickActions"
              class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
              </svg>
              Actions
            </button>
            
            <button
              @click="openAddProjectModal"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              New Project
            </button>
          </div>
        </div>
        
        <!-- Quick Actions Dropdown -->
        <div v-if="showQuickActions" class="pb-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button @click="bulkAction('activate')" class="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100">
              <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Activate Selected
            </button>
            <button @click="bulkAction('pause')" class="flex items-center p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100">
              <svg class="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Pause Selected
            </button>
            <button @click="exportProjects" class="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100">
              <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Export Data
            </button>
            <button @click="showRiskAnalysis = true" class="flex items-center p-3 bg-red-50 rounded-lg hover:bg-red-100">
              <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              Risk Analysis
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loadingProjects" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Loading project data...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error loading projects</h3>
            <p class="text-sm text-red-700 mt-1">{{ error }}</p>
          </div>
          <div class="ml-auto pl-3">
            <button @click="refreshProjects" class="text-red-400 hover:text-red-600">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Smart Dashboard View -->
      <div v-else-if="currentView === 'dashboard'" class="space-y-8">
        <!-- Real-time Analytics Cards -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Active Projects</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">{{ projectMetrics.activeProjects }}</div>
                      <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <svg class="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        <span class="sr-only">Increased by</span>
                        {{ projectMetrics.projectGrowth }}%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">{{ projectMetrics.completedProjects }}</div>
                      <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <span class="text-xs text-gray-500">This month</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-purple-500">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">${{ formatCurrency(projectMetrics.totalRevenue) }}</div>
                      <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <svg class="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        {{ projectMetrics.revenueGrowth }}%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-yellow-500">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Avg. Duration</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">{{ projectMetrics.avgDuration }}</div>
                      <div class="ml-2 flex items-baseline text-sm font-semibold text-blue-600">
                        <span class="text-xs text-gray-500">days</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Smart Filters -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
              <!-- Search -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Search Projects</label>
                <div class="relative">
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search by name, client, or description..."
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>

              <!-- Status Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select v-model="statusFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <!-- Priority Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select v-model="priorityFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <!-- Type Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select v-model="typeFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">All Types</option>
                  <option value="web_development">Web Development</option>
                  <option value="mobile_app">Mobile App</option>
                  <option value="consulting">Consulting</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="saas_development">SaaS Development</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="support">Support</option>
                  <option value="training">Training</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Project Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div v-for="project in filteredProjects" :key="project._id" class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <!-- Project Header -->
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ project.name }}</h3>
                  <p class="text-sm text-gray-600 mb-3">{{ project.description }}</p>
                  
                  <!-- Status & Priority Badges -->
                  <div class="flex items-center space-x-2 mb-3">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusClass(project.status)">
                      {{ project.status }}
                    </span>
                    <span v-if="project.priority" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getPriorityClass(project.priority)">
                      {{ project.priority }}
                    </span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ project.type }}
                    </span>
                  </div>

                  <!-- Progress Bar -->
                  <div class="mb-3">
                    <div class="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{{ project.progress?.overall || 0 }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" :style="{ width: (project.progress?.overall || 0) + '%' }"></div>
                    </div>
                  </div>
                </div>

                <!-- Action Menu -->
                <div class="relative">
                  <button @click="toggleProjectMenu(project._id)" class="text-gray-400 hover:text-gray-600">
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                    </svg>
                  </button>
                  
                  <!-- Dropdown Menu -->
                  <div v-if="openProjectMenu === project._id" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div class="py-1">
                      <button @click="editProject(project)" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Edit Project
                      </button>
                      <button @click="viewProjectDetails(project)" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        View Details
                      </button>
                      <button @click="manageTeam(project)" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Manage Team
                      </button>
                      <button @click="viewTimeline(project)" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Timeline
                      </button>
                      <hr class="my-1">
                      <button @click="duplicateProject(project)" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Duplicate
                      </button>
                      <button @click="archiveProject(project)" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        Archive
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Project Details -->
            <div class="p-6">
              <!-- Client Info -->
              <div class="flex items-center mb-4">
                <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                  <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ project.clientId?.firstName }} {{ project.clientId?.lastName }}</p>
                  <p class="text-xs text-gray-500">{{ project.clientId?.company }}</p>
                </div>
              </div>

              <!-- Budget Info -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p class="text-xs text-gray-500">Budget</p>
                  <p class="text-sm font-medium text-gray-900">${{ formatCurrency(project.budget?.estimated || 0) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Spent</p>
                  <p class="text-sm font-medium text-gray-900">${{ formatCurrency(project.budget?.actual || 0) }}</p>
                </div>
              </div>

              <!-- Timeline -->
              <div class="mb-4">
                <p class="text-xs text-gray-500 mb-1">Timeline</p>
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span>{{ formatDate(project.timeline?.startDate) }} - {{ formatDate(project.timeline?.endDate) }}</span>
                </div>
              </div>

              <!-- Team Members -->
              <div>
                <p class="text-xs text-gray-500 mb-2">Team</p>
                <div class="flex items-center">
                  <div class="flex -space-x-2">
                    <div v-for="member in project.team?.members?.slice(0, 3)" :key="member._id" class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <span class="text-xs text-gray-600">{{ member.user?.firstName?.charAt(0) }}</span>
                    </div>
                  </div>
                  <span v-if="project.team?.members?.length > 3" class="ml-2 text-xs text-gray-500">+{{ project.team.members.length - 3 }} more</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredProjects.length === 0 && !loadingProjects" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
          <div class="mt-6">
            <button @click="openAddProjectModal" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              New Project
            </button>
          </div>
        </div>
      </div>

      <!-- Kanban View -->
      <div v-else-if="currentView === 'kanban'" class="space-y-6">
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Project Kanban Board</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Planning Column -->
            <div class="bg-gray-50 rounded-lg p-4" 
                 @dragover="onDragOver" 
                 @drop="onDrop('planning')">
              <h3 class="font-medium text-gray-900 mb-3">Planning</h3>
              <div class="space-y-2">
                <div v-for="project in filteredProjects.filter(p => p.status === 'planning')" :key="project._id" 
                     class="bg-white p-3 rounded border cursor-pointer hover:shadow-sm transition-shadow"
                     draggable="true"
                     @dragstart="onDragStart(project)"
                     @click="viewProjectDetails(project)">
                  <h4 class="font-medium text-sm text-gray-900">{{ project.name }}</h4>
                  <p class="text-xs text-gray-600 mt-1">{{ project.description.substring(0, 50) }}...</p>
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-xs text-gray-500">{{ project.clientId?.firstName }} {{ project.clientId?.lastName }}</span>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="getPriorityClass(project.priority)">
                      {{ project.priority }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Active Column -->
            <div class="bg-blue-50 rounded-lg p-4"
                 @dragover="onDragOver" 
                 @drop="onDrop('active')">
              <h3 class="font-medium text-blue-900 mb-3">Active</h3>
              <div class="space-y-2">
                <div v-for="project in filteredProjects.filter(p => p.status === 'active')" :key="project._id" 
                     class="bg-white p-3 rounded border cursor-pointer hover:shadow-sm transition-shadow"
                     draggable="true"
                     @dragstart="onDragStart(project)"
                     @click="viewProjectDetails(project)">
                  <h4 class="font-medium text-sm text-gray-900">{{ project.name }}</h4>
                  <p class="text-xs text-gray-600 mt-1">{{ project.description.substring(0, 50) }}...</p>
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-xs text-gray-500">{{ project.clientId?.firstName }} {{ project.clientId?.lastName }}</span>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="getPriorityClass(project.priority)">
                      {{ project.priority }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- On Hold Column -->
            <div class="bg-yellow-50 rounded-lg p-4"
                 @dragover="onDragOver" 
                 @drop="onDrop('on_hold')">
              <h3 class="font-medium text-yellow-900 mb-3">On Hold</h3>
              <div class="space-y-2">
                <div v-for="project in filteredProjects.filter(p => p.status === 'on_hold')" :key="project._id" 
                     class="bg-white p-3 rounded border cursor-pointer hover:shadow-sm transition-shadow"
                     draggable="true"
                     @dragstart="onDragStart(project)"
                     @click="viewProjectDetails(project)">
                  <h4 class="font-medium text-sm text-gray-900">{{ project.name }}</h4>
                  <p class="text-xs text-gray-600 mt-1">{{ project.description.substring(0, 50) }}...</p>
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-xs text-gray-500">{{ project.clientId?.firstName }} {{ project.clientId?.lastName }}</span>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="getPriorityClass(project.priority)">
                      {{ project.priority }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Completed Column -->
            <div class="bg-green-50 rounded-lg p-4"
                 @dragover="onDragOver" 
                 @drop="onDrop('completed')">
              <h3 class="font-medium text-green-900 mb-3">Completed</h3>
              <div class="space-y-2">
                <div v-for="project in filteredProjects.filter(p => p.status === 'completed')" :key="project._id" 
                     class="bg-white p-3 rounded border cursor-pointer hover:shadow-sm transition-shadow"
                     draggable="true"
                     @dragstart="onDragStart(project)"
                     @click="viewProjectDetails(project)">
                  <h4 class="font-medium text-sm text-gray-900">{{ project.name }}</h4>
                  <p class="text-xs text-gray-600 mt-1">{{ project.description.substring(0, 50) }}...</p>
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-xs text-gray-500">{{ project.clientId?.firstName }} {{ project.clientId?.lastName }}</span>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="getPriorityClass(project.priority)">
                      {{ project.priority }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline View -->
      <div v-else-if="currentView === 'timeline'" class="space-y-6">
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Project Timeline</h2>
          <div class="space-y-4">
            <div v-for="project in filteredProjects" :key="project._id" class="border-l-4 border-blue-500 pl-4 py-2">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-gray-900">{{ project.name }}</h3>
                  <p class="text-sm text-gray-600">{{ project.description }}</p>
                  <div class="flex items-center space-x-4 mt-2">
                    <span class="text-xs text-gray-500">
                      <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      {{ formatDate(project.timeline?.startDate) }} - {{ formatDate(project.timeline?.endDate) }}
                    </span>
                    <span :class="getStatusClass(project.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ project.status }}
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-gray-900">${{ formatCurrency(project.budget?.estimated || 0) }}</div>
                  <div class="text-xs text-gray-500">{{ project.progress?.overall || 0 }}% complete</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Analytics View -->
      <div v-else-if="currentView === 'analytics'" class="space-y-6">
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Project Analytics</h2>
          
          <!-- Analytics Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-blue-50 p-4 rounded-lg">
              <h3 class="text-sm font-medium text-blue-900">Total Projects</h3>
              <p class="text-2xl font-bold text-blue-600">{{ filteredProjects.length }}</p>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
              <h3 class="text-sm font-medium text-green-900">Active Projects</h3>
              <p class="text-2xl font-bold text-green-600">{{ filteredProjects.filter(p => p.status === 'active').length }}</p>
            </div>
            <div class="bg-yellow-50 p-4 rounded-lg">
              <h3 class="text-sm font-medium text-yellow-900">On Hold</h3>
              <p class="text-2xl font-bold text-yellow-600">{{ filteredProjects.filter(p => p.status === 'on_hold').length }}</p>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg">
              <h3 class="text-sm font-medium text-purple-900">Completed</h3>
              <p class="text-2xl font-bold text-purple-600">{{ filteredProjects.filter(p => p.status === 'completed').length }}</p>
            </div>
          </div>

          <!-- Status Distribution Chart -->
          <div class="mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-3">Project Status Distribution</h3>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="space-y-2">
                <div v-for="status in ['planning', 'active', 'on_hold', 'completed']" :key="status" class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700 capitalize">{{ status.replace('_', ' ') }}</span>
                  <div class="flex items-center space-x-2">
                    <div class="w-32 bg-gray-200 rounded-full h-2">
                      <div class="bg-blue-600 h-2 rounded-full" :style="{ width: getStatusPercentage(status) + '%' }"></div>
                    </div>
                    <span class="text-sm text-gray-600">{{ getStatusPercentage(status) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Priority Distribution -->
          <div class="mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-3">Priority Distribution</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div v-for="priority in ['urgent', 'high', 'medium', 'low']" :key="priority" 
                   class="bg-gray-50 p-4 rounded-lg text-center">
                <div class="text-2xl font-bold" :class="getPriorityColor(priority)">
                  {{ filteredProjects.filter(p => p.priority === priority).length }}
                </div>
                <div class="text-sm font-medium text-gray-700 capitalize">{{ priority }}</div>
              </div>
            </div>
          </div>

          <!-- Budget Overview -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-3">Budget Overview</h3>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600">${{ formatCurrency(getTotalBudget()) }}</div>
                  <div class="text-sm text-gray-600">Total Budget</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-600">${{ formatCurrency(getAverageBudget()) }}</div>
                  <div class="text-sm text-gray-600">Average Budget</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-purple-600">{{ getActiveProjectsCount() }}</div>
                  <div class="text-sm text-gray-600">Active Projects</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Project Detail Modal -->
    <div v-if="showProjectDetailModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <!-- Header -->
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-medium text-gray-900">Project Details</h3>
            <button @click="showProjectDetailModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

                    <!-- Project Information -->
          <div v-if="selectedProject" class="space-y-6">
            <!-- Loading state -->
            <div v-if="!selectedProject.name" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p class="mt-2 text-sm text-gray-600">Loading project details...</p>
            </div>
            
            <!-- Error state -->
            <div v-else-if="selectedProject.error" class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <p class="mt-2 text-sm text-red-600">Failed to load project details</p>
              <button @click="viewProjectDetails(selectedProject)" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Retry
              </button>
            </div>
            
            <!-- Project content -->
            <div v-else>
            <!-- Loading indicator for additional data -->
            <div v-if="loadingAdditionalData" class="mb-4 p-3 bg-blue-50 rounded-lg">
              <div class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span class="text-sm text-blue-600">Loading additional project data...</span>
              </div>
            </div>
            
            <!-- Basic Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="text-lg font-semibold text-gray-900 mb-2">{{ selectedProject.name }}</h4>
                <p class="text-gray-600 mb-4">{{ selectedProject.description }}</p>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <span class="text-sm font-medium text-gray-500">Status</span>
                    <span :class="getStatusClass(selectedProject.status)" class="ml-2 px-2 py-1 text-xs font-medium rounded-full">
                      {{ selectedProject.status }}
                    </span>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-500">Priority</span>
                    <span :class="getPriorityClass(selectedProject.priority)" class="ml-2 px-2 py-1 text-xs font-medium rounded-full">
                      {{ selectedProject.priority }}
                    </span>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-500">Type</span>
                    <span class="ml-2 text-sm text-gray-900">{{ selectedProject.type }}</span>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-500">Progress</span>
                    <span class="ml-2 text-sm text-gray-900">{{ selectedProject.progress?.overall || 0 }}%</span>
                  </div>
                </div>
              </div>

              <!-- Client Info -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <h5 class="font-medium text-gray-900 mb-3">Client Information</h5>
                <div class="space-y-2">
                  <div>
                    <span class="text-sm font-medium text-gray-500">Name:</span>
                    <span class="ml-2 text-sm text-gray-900">
                      {{ selectedProject.clientId?.firstName }} {{ selectedProject.clientId?.lastName }}
                    </span>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-500">Company:</span>
                    <span class="ml-2 text-sm text-gray-900">{{ selectedProject.clientId?.company || 'N/A' }}</span>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-500">Email:</span>
                    <span class="ml-2 text-sm text-gray-900">{{ selectedProject.clientId?.email }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Budget Information -->
            <div class="bg-blue-50 p-4 rounded-lg">
              <h5 class="font-medium text-gray-900 mb-3">Budget Information</h5>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <span class="text-sm font-medium text-gray-500">Estimated Budget</span>
                  <div class="text-lg font-semibold text-gray-900">${{ formatCurrency(selectedProject.budget?.estimated || 0) }}</div>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500">Actual Spent</span>
                  <div class="text-lg font-semibold text-gray-900">${{ formatCurrency(selectedProject.budget?.actual || 0) }}</div>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500">Variance</span>
                  <div :class="getBudgetVarianceClass(selectedProject.budget?.actual - selectedProject.budget?.estimated)" class="text-lg font-semibold">
                    ${{ formatCurrency((selectedProject.budget?.actual || 0) - (selectedProject.budget?.estimated || 0)) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Timeline Information -->
            <div class="bg-green-50 p-4 rounded-lg">
              <h5 class="font-medium text-gray-900 mb-3">Timeline Information</h5>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <span class="text-sm font-medium text-gray-500">Start Date</span>
                  <div class="text-sm text-gray-900">{{ formatDate(selectedProject.timeline?.startDate) }}</div>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500">End Date</span>
                  <div class="text-sm text-gray-900">{{ formatDate(selectedProject.timeline?.endDate) }}</div>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500">Estimated Hours</span>
                  <div class="text-sm text-gray-900">{{ selectedProject.timeline?.estimatedHours || 0 }} hours</div>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500">Actual Hours</span>
                  <div class="text-sm text-gray-900">{{ selectedProject.timeline?.actualHours || 0 }} hours</div>
                </div>
              </div>
            </div>

            <!-- Team Information -->
            <div class="bg-purple-50 p-4 rounded-lg">
              <h5 class="font-medium text-gray-900 mb-3">Team Information</h5>
              <div class="space-y-3">
                <div v-if="selectedProject.team?.projectManager">
                  <span class="text-sm font-medium text-gray-500">Project Manager:</span>
                  <span class="ml-2 text-sm text-gray-900">
                    {{ selectedProject.team.projectManager?.firstName }} {{ selectedProject.team.projectManager?.lastName }}
                  </span>
                </div>
                <div v-if="selectedProject.team?.members?.length">
                  <span class="text-sm font-medium text-gray-500">Team Members ({{ selectedProject.team.members.length }}):</span>
                  <div class="mt-2 space-y-1">
                    <div v-for="member in selectedProject.team.members" :key="member._id" class="flex items-center justify-between">
                      <span class="text-sm text-gray-900">
                        {{ member.user?.firstName }} {{ member.user?.lastName }} - {{ member.role }}
                      </span>
                      <span v-if="member.hourlyRate" class="text-xs text-gray-500">${{ member.hourlyRate }}/hr</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-3 pt-4 border-t">
              <button @click="viewTasks(selectedProject)" class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                View Tasks
              </button>
              <button @click="editProject(selectedProject)" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Edit Project
              </button>
              <button @click="manageTeam(selectedProject)" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Manage Team
              </button>
              <button @click="viewTimeline(selectedProject)" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                View Timeline
              </button>
              <button @click="showProjectDetailModal = false" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                Close
              </button>
            </div>
            </div> <!-- Close project content div -->
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Project Modal -->
    <div v-if="showEditProjectModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <!-- Header -->
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-medium text-gray-900">Edit Project</h3>
            <button @click="showEditProjectModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Edit Form -->
          <form @submit.prevent="updateProject" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Basic Information -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Project Name</label>
                  <input v-model="editingProject.name" type="text" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea v-model="editingProject.description" rows="3" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Status</label>
                    <select v-model="editingProject.status" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Priority</label>
                    <select v-model="editingProject.priority" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Type</label>
                  <select v-model="editingProject.type" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="web_development">Web Development</option>
                    <option value="mobile_app">Mobile App</option>
                    <option value="consulting">Consulting</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="saas_development">SaaS Development</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="support">Support</option>
                    <option value="training">Training</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <!-- Budget and Timeline -->
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Estimated Budget</label>
                    <input v-model.number="editingProject.budget.estimated" type="number" min="0" step="0.01" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Actual Budget</label>
                    <input v-model.number="editingProject.budget.actual" type="number" min="0" step="0.01" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Start Date</label>
                  <input v-model="editingProject.timeline.startDate" type="date" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">End Date</label>
                  <input v-model="editingProject.timeline.endDate" type="date" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Estimated Hours</label>
                  <input v-model.number="editingProject.timeline.estimatedHours" type="number" min="0" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-3 pt-4 border-t">
              <button type="button" @click="showEditProjectModal = false" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Update Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Add Project Modal -->
    <div v-if="showAddProjectModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <!-- Header -->
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-medium text-gray-900">Create New Project</h3>
            <button @click="showAddProjectModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Create Project Form -->
          <form @submit.prevent="addProject" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Basic Information -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Project Name</label>
                  <input v-model="newProject.name" type="text" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea v-model="newProject.description" rows="3" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Type</label>
                    <select v-model="newProject.type" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="web_development">Web Development</option>
                      <option value="mobile_app">Mobile App</option>
                      <option value="consulting">Consulting</option>
                      <option value="design">Design</option>
                      <option value="marketing">Marketing</option>
                      <option value="ecommerce">E-commerce</option>
                      <option value="saas_development">SaaS Development</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="support">Support</option>
                      <option value="training">Training</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Priority</label>
                    <select v-model="newProject.priority" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Client</label>
                  <select v-model="newProject.clientId" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Select a client</option>
                    <option v-for="client in availableClients" :key="client._id" :value="client._id">
                      {{ client.firstName }} {{ client.lastName }} - {{ client.company }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Budget and Timeline -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Estimated Budget</label>
                  <input v-model.number="newProject.budget.estimated" type="number" min="0" step="0.01" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Start Date</label>
                  <input v-model="newProject.timeline.startDate" type="date" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">End Date</label>
                  <input v-model="newProject.timeline.endDate" type="date" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Estimated Hours</label>
                  <input v-model.number="newProject.timeline.estimatedHours" type="number" min="0" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-3 pt-4 border-t">
              <button type="button" @click="showAddProjectModal = false" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Task View Modal -->
    <div v-if="showTaskView" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-11/12 lg:w-11/12 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <!-- Header -->
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-medium text-gray-900">Project Tasks</h3>
            <button @click="showTaskView = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Task Kanban Board -->
          <TaskKanbanBoard 
            v-if="currentProjectForTasks" 
            :project="currentProjectForTasks"
            @task-updated="handleTaskUpdated"
            @task-created="handleTaskCreated"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '../stores/adminStore'
import { useAuthStore } from '../stores/authStore'
import { projectService } from '../services/projectService'
import { config } from '../config'
import TaskKanbanBoard from '../components/TaskKanbanBoard.vue'

const adminStore = useAdminStore()

// View state
const currentView = ref('dashboard')
const showQuickActions = ref(false)
const showAddProjectModal = ref(false)
const showRiskAnalysis = ref(false)
const showProjectDetailModal = ref(false)
const showEditProjectModal = ref(false)
const showTaskView = ref(false)
const currentProjectForTasks = ref(null)

// Filters
const searchQuery = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')
const typeFilter = ref('')

// Project data
const selectedProjects = ref([])
const selectedProject = ref(null)
const loadingAdditionalData = ref(false)
const editingProject = ref({
  name: '',
  description: '',
  clientId: '',
  type: 'web_development',
  status: 'planning',
  priority: 'medium',
  budget: {
    estimated: 0,
    actual: 0,
    currency: 'USD',
    billingType: 'fixed'
  },
  timeline: {
    startDate: '',
    endDate: '',
    estimatedHours: 0,
    actualHours: 0
  },
  team: {
    projectManager: null,
    members: []
  }
})
const projectAnalytics = ref(null)
const projectTimeline = ref(null)
const projectTasks = ref([])
const projectSprints = ref([])

// Reactive data
const newProject = ref({
  name: '',
  description: '',
  clientId: '',
  type: 'web_development',
  status: 'planning',
  priority: 'medium',
  budget: {
    estimated: 0,
    currency: 'USD',
    billingType: 'fixed'
  },
  timeline: {
    startDate: '',
    endDate: '',
    estimatedHours: 0
  },
  team: []
})

// Computed properties
const projectMetrics = computed(() => adminStore.projectAnalytics?.stats || {})
const projectList = computed(() => adminStore.projectAnalytics?.projects || [])
const loadingProjects = computed(() => adminStore.loadingProjects)
const error = computed(() => adminStore.error)

// Available clients for project creation
const availableClients = ref([])

// Load available clients
const loadAvailableClients = async () => {
  try {
    // This should fetch clients that the vendor admin can assign projects to
    // For now, we'll use a simple approach - you can enhance this later
    const authStore = useAuthStore()
    const response = await fetch(`${config.apiUrl}/api/users/clients`, {
      headers: authStore.getAuthHeaders()
    })
    
    if (response.ok) {
      const data = await response.json()
      availableClients.value = data.data || []
    }
  } catch (error) {
    console.error('Failed to load available clients:', error)
    // For now, use some dummy data for testing
    availableClients.value = [
      { _id: 'client1', firstName: 'John', lastName: 'Doe', company: 'Test Company 1' },
      { _id: 'client2', firstName: 'Jane', lastName: 'Smith', company: 'Test Company 2' }
    ]
  }
}

const filteredProjects = computed(() => {
  let filtered = projectList.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(project =>
      project.name.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.clientId?.firstName?.toLowerCase().includes(query) ||
      project.clientId?.lastName?.toLowerCase().includes(query) ||
      project.clientId?.company?.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(project => project.status === statusFilter.value)
  }

  if (priorityFilter.value) {
    filtered = filtered.filter(project => project.priority === priorityFilter.value)
  }

  if (typeFilter.value) {
    filtered = filtered.filter(project => project.type === typeFilter.value)
  }

  return filtered
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US').format(amount)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const getStatusClass = (status) => {
  switch (status) {
    case 'active':
      return 'bg-blue-100 text-blue-800'
    case 'planning':
      return 'bg-yellow-100 text-yellow-800'
    case 'on_hold':
      return 'bg-red-100 text-red-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
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

const getBudgetVarianceClass = (variance) => {
  if (variance > 0) {
    return 'text-green-600'
  } else if (variance < 0) {
    return 'text-red-600'
  } else {
    return 'text-gray-600'
  }
}

// Analytics helper functions
const getStatusPercentage = (status) => {
  const total = filteredProjects.value.length
  if (total === 0) return 0
  const count = filteredProjects.value.filter(p => p.status === status).length
  return Math.round((count / total) * 100)
}

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'urgent':
      return 'text-red-600'
    case 'high':
      return 'text-yellow-600'
    case 'medium':
      return 'text-blue-600'
    case 'low':
      return 'text-green-600'
    default:
      return 'text-gray-600'
  }
}

const getTotalBudget = () => {
  return filteredProjects.value.reduce((total, project) => {
    return total + (project.budget?.estimated || 0)
  }, 0)
}

const getAverageBudget = () => {
  const total = getTotalBudget()
  const count = filteredProjects.value.length
  return count > 0 ? Math.round(total / count) : 0
}

const getActiveProjectsCount = () => {
  return filteredProjects.value.filter(p => p.status === 'active').length
}

const refreshProjects = async () => {
  try {
    await adminStore.fetchProjects()
  } catch (error) {
    console.error('Failed to refresh projects:', error)
  }
}

// Smart Project Management Methods
const loadProjectAnalytics = async (projectId) => {
  try {
    const response = await projectService.getProjectAnalytics(projectId)
    projectAnalytics.value = response.data.data
  } catch (error) {
    console.error('Failed to load project analytics:', error)
  }
}

const loadProjectTimeline = async (projectId) => {
  try {
    const response = await projectService.getProjectTimeline(projectId)
    projectTimeline.value = response.data.data
  } catch (error) {
    console.error('Failed to load project timeline:', error)
  }
}

const loadProjectTasks = async (projectId) => {
  try {
    const response = await projectService.getProjectTasks(projectId)
    projectTasks.value = response.data.data
  } catch (error) {
    console.error('Failed to load project tasks:', error)
  }
}

const loadProjectSprints = async (projectId) => {
  try {
    const response = await projectService.getProjectSprints(projectId)
    projectSprints.value = response.data.data
  } catch (error) {
    console.error('Failed to load project sprints:', error)
  }
}

const addTeamMember = async (projectId, userId, role) => {
  try {
    await projectService.addTeamMember(projectId, userId, role)
    await refreshProjects()
  } catch (error) {
    console.error('Failed to add team member:', error)
  }
}

const removeTeamMember = async (projectId, userId) => {
  try {
    await projectService.removeTeamMember(projectId, userId)
    await refreshProjects()
  } catch (error) {
    console.error('Failed to remove team member:', error)
  }
}

const uploadAttachment = async (projectId, file) => {
  try {
    await projectService.uploadProjectAttachment(projectId, file)
    await refreshProjects()
  } catch (error) {
    console.error('Failed to upload attachment:', error)
  }
}

// Bulk Operations
const bulkAction = async (action) => {
  if (selectedProjects.value.length === 0) {
    alert('Please select projects first')
    return
  }

  if (confirm(`Are you sure you want to ${action} ${selectedProjects.value.length} projects?`)) {
    try {
      const projectIds = selectedProjects.value.map(p => p._id)
      const updates = { status: action === 'activate' ? 'active' : 'on_hold' }
      
      await projectService.bulkUpdateProjects(projectIds, updates)
      await refreshProjects()
      selectedProjects.value = []
      alert(`Successfully ${action}ed ${projectIds.length} projects`)
    } catch (error) {
      console.error('Failed to perform bulk action:', error)
      alert('Failed to perform bulk action')
    }
  }
}

const exportProjects = async () => {
  try {
    const filters = {
      status: statusFilter.value,
      search: searchQuery.value
    }
    await projectService.exportProjects(filters)
  } catch (error) {
    console.error('Failed to export projects:', error)
    alert('Failed to export projects')
  }
}

// Project Actions
const viewProjectDetails = async (project) => {
  try {
    // Debug: Check current token
    const authStore = useAuthStore()
    console.log('🔐 Current token state:', {
      hasToken: !!authStore.token,
      hasRefreshToken: !!authStore.refreshToken,
      tokenFromStorage: !!localStorage.getItem('admin_token'),
      refreshTokenFromStorage: !!localStorage.getItem('admin_refresh_token')
    })
    
    // Check what's actually in localStorage
    const storedToken = localStorage.getItem('admin_token')
    const storedRefreshToken = localStorage.getItem('admin_refresh_token')
    console.log('🔐 Stored tokens:', {
      tokenLength: storedToken ? storedToken.length : 0,
      refreshTokenLength: storedRefreshToken ? storedRefreshToken.length : 0,
      tokenStart: storedToken ? storedToken.substring(0, 20) + '...' : 'null',
      refreshTokenStart: storedRefreshToken ? storedRefreshToken.substring(0, 20) + '...' : 'null'
    })
    
    // Test token validity and refresh if needed
    try {
      // Decode token to see what's in it
      if (authStore.token) {
        const tokenParts = authStore.token.split('.')
        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(atob(tokenParts[1]))
            const expTime = new Date(payload.exp * 1000)
            const now = new Date()
            const timeUntilExpiry = expTime.getTime() - now.getTime()
            
            console.log('🔐 Token payload:', {
              userId: payload.userId,
              email: payload.email,
              role: payload.role,
              vendorId: payload.vendorId,
              portalType: payload.portalType,
              exp: expTime,
              iat: new Date(payload.iat * 1000),
              timeUntilExpiry: Math.round(timeUntilExpiry / 1000 / 60) + ' minutes'
            })
            
            // If token expires in less than 10 minutes, refresh it
            if (timeUntilExpiry < (10 * 60 * 1000)) {
              console.log('🔐 Token expiring soon, refreshing...')
              const refreshed = await authStore.refreshTokenIfNeeded()
              console.log('🔐 Token refresh result:', refreshed)
            }
          } catch (decodeError) {
            console.error('🔐 Token decode error:', decodeError)
          }
        }
      }
      
      console.log('🔐 Testing token with /api/auth/me...')
      const testResponse = await fetch(`${config.apiUrl}/api/auth/me`, {
        headers: authStore.getAuthHeaders()
      })
      console.log('🔐 Token test response status:', testResponse.status)
      
      if (!testResponse.ok) {
        const errorData = await testResponse.json()
        console.log('🔐 Token test error:', errorData)
        console.log('🔐 Token is invalid, attempting refresh...')
        const refreshed = await authStore.refreshTokenIfNeeded()
        console.log('🔐 Token refresh result:', refreshed)
        
        // Test again after refresh
        if (refreshed) {
          console.log('🔐 Testing token again after refresh...')
          const retryResponse = await fetch(`${config.apiUrl}/api/auth/me`, {
            headers: authStore.getAuthHeaders()
          })
          console.log('🔐 Retry response status:', retryResponse.status)
        }
      } else {
        console.log('🔐 Token is valid!')
      }
    } catch (testError) {
      console.error('🔐 Token test failed:', testError)
    }
    
    // Load full project details
    const response = await projectService.getProjectById(project._id)
    console.log('Project details response:', response) // Debug log
    
    // Handle different response structures
    if (response.data && response.data.data) {
      selectedProject.value = response.data.data
    } else if (response.data) {
      selectedProject.value = response.data
    } else {
      selectedProject.value = response
    }
    
    console.log('Selected project:', selectedProject.value) // Debug log
    
    // Show the detail modal immediately with basic data
    showProjectDetailModal.value = true
    console.log('Modal should be visible:', showProjectDetailModal.value) // Debug log
    
    // Load additional project data in background (non-blocking)
    loadingAdditionalData.value = true
    Promise.allSettled([
      loadProjectAnalytics(project._id),
      loadProjectTimeline(project._id),
      loadProjectTasks(project._id),
      loadProjectSprints(project._id)
    ]).then(results => {
      console.log('Background data loading completed:', results.map(r => r.status))
      loadingAdditionalData.value = false
    }).catch(error => {
      console.error('Background data loading failed:', error)
      loadingAdditionalData.value = false
    })
  } catch (error) {
    console.error('Failed to load project details:', error)
    alert('Failed to load project details')
  }
}

const manageTeam = async (project) => {
  try {
    await loadProjectTasks(project._id)
    // Show team management modal or navigate to team page
    console.log('Team management for project:', project)
  } catch (error) {
    console.error('Failed to load team data:', error)
  }
}

const viewTimeline = async (project) => {
  try {
    await loadProjectTimeline(project._id)
    // Show timeline modal or navigate to timeline view
    console.log('Timeline for project:', project)
  } catch (error) {
    console.error('Failed to load timeline:', error)
  }
}

const viewTasks = (project) => {
  currentProjectForTasks.value = project
  showTaskView.value = true
  showProjectDetailModal.value = false
}

const handleTaskUpdated = (task) => {
  console.log('Task updated:', task)
  // You can add additional logic here, like refreshing project data
}

const handleTaskCreated = (task) => {
  console.log('Task created:', task)
  // You can add additional logic here, like refreshing project data
}

const duplicateProject = async (project) => {
  try {
    const duplicateData = {
      name: `${project.name} (Copy)`,
      description: project.description,
      clientId: project.clientId,
      type: project.type,
      status: 'planning',
      priority: project.priority,
      budget: project.budget,
      timeline: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      team: []
    }
    
    await projectService.createProject(duplicateData)
    await refreshProjects()
    alert('Project duplicated successfully')
  } catch (error) {
    console.error('Failed to duplicate project:', error)
    alert('Failed to duplicate project')
  }
}

const archiveProject = async (project) => {
  if (confirm(`Are you sure you want to archive ${project.name}?`)) {
    try {
      await projectService.updateProject(project._id, { status: 'cancelled' })
      await refreshProjects()
      alert('Project archived successfully')
    } catch (error) {
      console.error('Failed to archive project:', error)
      alert('Failed to archive project')
    }
  }
}

// Project Creation
const addProject = async () => {
  try {
    await projectService.createProject(newProject.value)
    
    // Reset form
    newProject.value = {
      name: '',
      description: '',
      clientId: '',
      type: 'web_development',
      status: 'planning',
      priority: 'medium',
      budget: {
        estimated: 0,
        currency: 'USD',
        billingType: 'fixed'
      },
      timeline: {
        startDate: '',
        endDate: '',
        estimatedHours: 0
      },
      team: []
    }
    showAddProjectModal.value = false
    
    // Refresh project list
    await refreshProjects()
    alert('Project created successfully')
  } catch (error) {
    console.error('Failed to add project:', error)
    alert('Failed to create project')
  }
}

const editProject = async (project) => {
  try {
    // Load project data into form
    editingProject.value = { ...project }
    showEditProjectModal.value = true
  } catch (error) {
    console.error('Failed to load project for editing:', error)
  }
}

const updateProject = async () => {
  try {
    await projectService.updateProject(editingProject.value._id, editingProject.value)
    showEditProjectModal.value = false
    await refreshProjects()
    alert('Project updated successfully')
  } catch (error) {
    console.error('Failed to update project:', error)
    alert('Failed to update project')
  }
}

const deleteProject = async (project) => {
  if (confirm(`Are you sure you want to delete ${project.name}?`)) {
    try {
      await projectService.deleteProject(project._id)
      await refreshProjects()
      alert('Project deleted successfully')
    } catch (error) {
      console.error('Failed to delete project:', error)
      alert('Failed to delete project')
    }
  }
}

// UI State Management
const showProjectMenu = ref({})
const openProjectMenu = ref(null)
const draggedProject = ref(null)

// Handle opening the add project modal
const openAddProjectModal = async () => {
  showAddProjectModal.value = true
  // Load clients if not already loaded
  if (availableClients.value.length === 0) {
    await loadAvailableClients()
  }
}

// Kanban drag and drop handlers
const onDragStart = (project) => {
  draggedProject.value = project
}

const onDragOver = (event) => {
  event.preventDefault()
}

const onDrop = async (newStatus) => {
  if (draggedProject.value && draggedProject.value.status !== newStatus) {
    try {
      await projectService.updateProject(draggedProject.value._id, { status: newStatus })
      await refreshProjects()
      console.log(`Project ${draggedProject.value.name} moved to ${newStatus}`)
    } catch (error) {
      console.error('Failed to update project status:', error)
    }
  }
  draggedProject.value = null
}

const toggleProjectMenu = (projectId) => {
  openProjectMenu.value = openProjectMenu.value === projectId ? null : projectId
}

const toggleProjectSelection = (project) => {
  const index = selectedProjects.value.findIndex(p => p._id === project._id)
  if (index > -1) {
    selectedProjects.value.splice(index, 1)
  } else {
    selectedProjects.value.push(project)
  }
}

// Test token refresh function
const testTokenRefresh = async () => {
  const authStore = useAuthStore()
  console.log('🔐 Testing token refresh...')
  
  try {
    // First, let's test the current token
    console.log('🔐 Current token:', authStore.token ? authStore.token.substring(0, 50) + '...' : 'null')
    
    // Test the /api/auth/me endpoint
    const meResponse = await fetch(`${config.apiUrl}/api/auth/me`, {
      headers: authStore.getAuthHeaders()
    })
    console.log('🔐 /api/auth/me response status:', meResponse.status)
    
    if (!meResponse.ok) {
      const errorData = await meResponse.json()
      console.log('🔐 /api/auth/me error:', errorData)
    } else {
      const meData = await meResponse.json()
      console.log('🔐 /api/auth/me success:', meData)
    }
    
    // Now try token refresh
    const refreshed = await authStore.refreshTokenIfNeeded()
    console.log('🔐 Manual token refresh result:', refreshed)
    
    if (refreshed) {
      alert('Token refreshed successfully!')
    } else {
      alert('Token refresh failed or not needed.')
    }
  } catch (error) {
    console.error('🔐 Token refresh test failed:', error)
    alert('Token refresh test failed: ' + error.message)
  }
}

// Debug sessions function
const debugSessions = async () => {
  try {
    console.log('🔐 Debugging sessions...')
    const response = await fetch(`${config.apiUrl}/api/auth/debug-sessions`)
    const data = await response.json()
    console.log('🔐 Debug sessions response:', data)
    
    if (data.success) {
      alert(`Found ${data.data.totalSessions} active sessions`)
    } else {
      alert('Failed to get sessions: ' + data.message)
    }
  } catch (error) {
    console.error('🔐 Debug sessions failed:', error)
    alert('Debug sessions failed: ' + error.message)
  }
}

// Load data on mount
onMounted(async () => {
  try {
    // Debug: Check current auth state
    const authStore = useAuthStore()
    console.log('🔐 OnMount - Current auth state:', {
      isAuthenticated: authStore.isAuthenticated,
      hasToken: !!authStore.token,
      hasRefreshToken: !!authStore.refreshToken,
      user: authStore.user,
      tokenFromStorage: !!localStorage.getItem('admin_token'),
      refreshTokenFromStorage: !!localStorage.getItem('admin_refresh_token')
    })
    
    // Debug: Check all localStorage items
    console.log('🔐 All localStorage items:', {
      admin_token: localStorage.getItem('admin_token') ? 'present' : 'missing',
      admin_refresh_token: localStorage.getItem('admin_refresh_token') ? 'present' : 'missing',
      access_token: localStorage.getItem('access_token') ? 'present' : 'missing',
      refresh_token: localStorage.getItem('refresh_token') ? 'present' : 'missing',
      user: localStorage.getItem('user') ? 'present' : 'missing'
    })
    
    // If not authenticated, redirect to login
    if (!authStore.isAuthenticated) {
      console.log('🔐 Not authenticated, redirecting to login...')
      window.location.href = '/login'
      return
    }
    
    await adminStore.fetchProjects()
    await loadAvailableClients() // Load available clients for project creation
  } catch (error) {
    console.error('Failed to load projects:', error)
  }
})
</script> 