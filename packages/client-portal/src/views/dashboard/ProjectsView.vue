<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-2xl font-semibold text-gray-900">Projects</h1>
          <p class="mt-2 text-sm text-gray-700">
            A list of all your projects including their status, health, and team members.
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            @click="openNewProjectModal"
            class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Add project
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="mt-6 bg-white shadow rounded-lg p-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <!-- Search -->
          <div>
            <label for="search" class="block text-sm font-medium text-gray-700">Search</label>
            <input
              type="text"
              name="search"
              id="search"
              v-model="filters.search"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Search projects..."
            />
          </div>

          <!-- Status filter -->
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="status"
              name="status"
              v-model="filters.status"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>

          <!-- Health filter -->
          <div>
            <label for="health" class="block text-sm font-medium text-gray-700">Health</label>
            <select
              id="health"
              name="health"
              v-model="filters.health"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All</option>
              <option value="good">Good</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Projects List -->
      <div class="mt-8 flex flex-col">
        <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Project Name
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Health
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Team
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Due Date
                    </th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-for="project in filteredProjects" :key="project.id">
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {{ project.name }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span
                        :class="[
                          project.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : project.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800',
                          'inline-flex rounded-full px-2 text-xs font-semibold leading-5'
                        ]"
                      >
                        {{ project.status }}
                      </span>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div class="flex items-center">
                        <div
                          :class="[
                            project.health === 'good'
                              ? 'bg-green-500'
                              : project.health === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-red-500',
                            'h-2.5 w-2.5 rounded-full mr-2'
                          ]"
                        ></div>
                        {{ project.health }}
                      </div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div class="flex -space-x-2">
                        <template v-for="(member, index) in project.team" :key="index">
                          <div
                            class="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center"
                            :title="member.name"
                          >
                            <span class="text-xs font-medium">{{ member.initials }}</span>
                          </div>
                        </template>
                      </div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {{ formatDate(project.dueDate) }}
                    </td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        @click="viewProject(project)"
                        class="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        View
                      </button>
                      <button
                        @click="editProject(project)"
                        class="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Project Modal -->
    <div v-if="showNewProjectModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center overflow-y-auto">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-medium leading-6 text-gray-900">Create New Project</h3>
          <button
            @click="showNewProjectModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="createProject" class="space-y-8">
          <!-- Step Navigation -->
          <div class="flex items-center justify-center space-x-4 mb-6">
            <div
              v-for="(step, index) in formSteps"
              :key="step.name"
              class="flex items-center"
            >
              <div
                :class="[
                  currentStep >= index + 1
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-600',
                  'rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium'
                ]"
              >
                {{ index + 1 }}
              </div>
              <span
                :class="[
                  currentStep >= index + 1 ? 'text-indigo-600' : 'text-gray-500',
                  'ml-2 text-sm font-medium'
                ]"
              >
                {{ step.name }}
              </span>
              <div
                v-if="index < formSteps.length - 1"
                :class="[
                  currentStep > index + 1 ? 'bg-indigo-600' : 'bg-gray-200',
                  'ml-4 h-0.5 w-8'
                ]"
              ></div>
            </div>
          </div>

          <!-- Step 1: Basic Information -->
          <div v-if="currentStep === 1" class="space-y-6">
            <h4 class="text-lg font-medium text-gray-900">Basic Project Information</h4>
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label for="projectName" class="block text-sm font-medium text-gray-700">Project Name *</label>
                <input
                  type="text"
                  id="projectName"
                  v-model="newProject.name"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label for="projectType" class="block text-sm font-medium text-gray-700">Project Type *</label>
                <select
                  id="projectType"
                  v-model="newProject.type"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select project type</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-app">Mobile Application</option>
                  <option value="desktop-app">Desktop Application</option>
                  <option value="api-development">API Development</option>
                  <option value="database-design">Database Design</option>
                  <option value="ui-ux-design">UI/UX Design</option>
                  <option value="consulting">Consulting</option>
                  <option value="maintenance">Maintenance & Support</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="sm:col-span-2">
                <label for="projectDescription" class="block text-sm font-medium text-gray-700">Project Description *</label>
                <textarea
                  id="projectDescription"
                  v-model="newProject.description"
                  rows="4"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Describe your project goals, objectives, and expected outcomes..."
                ></textarea>
              </div>
              <div>
                <label for="projectStartDate" class="block text-sm font-medium text-gray-700">Start Date *</label>
                <input
                  type="date"
                  id="projectStartDate"
                  v-model="newProject.startDate"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label for="projectDueDate" class="block text-sm font-medium text-gray-700">Due Date *</label>
                <input
                  type="date"
                  id="projectDueDate"
                  v-model="newProject.dueDate"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Step 2: Requirements & Specifications -->
          <div v-if="currentStep === 2" class="space-y-6">
            <h4 class="text-lg font-medium text-gray-900">Requirements & Specifications</h4>
            <div class="space-y-6">
              <div>
                <label for="businessRequirements" class="block text-sm font-medium text-gray-700">Business Requirements *</label>
                <textarea
                  id="businessRequirements"
                  v-model="newProject.businessRequirements"
                  rows="6"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Describe the business problem this project solves, business goals, success criteria, and key stakeholders..."
                ></textarea>
              </div>
              <div>
                <label for="functionalRequirements" class="block text-sm font-medium text-gray-700">Functional Requirements *</label>
                <textarea
                  id="functionalRequirements"
                  v-model="newProject.functionalRequirements"
                  rows="6"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="List all features, functions, and capabilities the system must have. Include user stories, use cases, and workflows..."
                ></textarea>
              </div>
              <div>
                <label for="nonFunctionalRequirements" class="block text-sm font-medium text-gray-700">Non-Functional Requirements</label>
                <textarea
                  id="nonFunctionalRequirements"
                  v-model="newProject.nonFunctionalRequirements"
                  rows="4"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Performance, security, scalability, usability, reliability, and other quality attributes..."
                ></textarea>
              </div>
              <div>
                <label for="technicalSpecifications" class="block text-sm font-medium text-gray-700">Technical Specifications</label>
                <textarea
                  id="technicalSpecifications"
                  v-model="newProject.technicalSpecifications"
                  rows="4"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Preferred technologies, frameworks, platforms, integrations, and technical constraints..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Step 3: Document Upload -->
          <div v-if="currentStep === 3" class="space-y-6">
            <h4 class="text-lg font-medium text-gray-900">Document Upload</h4>
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700">SRS Document (Software Requirements Specification)</label>
                <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div class="space-y-1 text-center">
                    <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <div class="flex text-sm text-gray-600">
                      <label for="srs-document" class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Upload SRS Document</span>
                        <input id="srs-document" name="srs-document" type="file" class="sr-only" @change="handleFileUpload('srsDocument', $event)" accept=".pdf,.doc,.docx,.txt" />
                      </label>
                      <p class="pl-1">or drag and drop</p>
                    </div>
                    <p class="text-xs text-gray-500">PDF, DOC, DOCX, TXT up to 10MB</p>
                  </div>
                </div>
                <div v-if="newProject.srsDocument" class="mt-2 text-sm text-green-600">
                  ✓ {{ newProject.srsDocument.name }}
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Additional Requirements Documents</label>
                <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div class="space-y-1 text-center">
                    <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <div class="flex text-sm text-gray-600">
                      <label for="additional-documents" class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Upload Additional Documents</span>
                        <input id="additional-documents" name="additional-documents" type="file" class="sr-only" @change="handleFileUpload('additionalDocuments', $event)" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" multiple />
                      </label>
                      <p class="pl-1">or drag and drop</p>
                    </div>
                    <p class="text-xs text-gray-500">PDF, DOC, DOCX, TXT, Images up to 10MB each</p>
                  </div>
                </div>
                <div v-if="newProject.additionalDocuments && newProject.additionalDocuments.length > 0" class="mt-2 space-y-1">
                  <div v-for="(doc, index) in newProject.additionalDocuments" :key="index" class="text-sm text-green-600">
                    ✓ {{ doc.name }}
                  </div>
                </div>
              </div>

              <div>
                <label for="documentNotes" class="block text-sm font-medium text-gray-700">Document Notes</label>
                <textarea
                  id="documentNotes"
                  v-model="newProject.documentNotes"
                  rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Any additional notes about the uploaded documents..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Step 4: Timeline & Budget -->
          <div v-if="currentStep === 4" class="space-y-6">
            <h4 class="text-lg font-medium text-gray-900">Timeline & Budget</h4>
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label for="projectPriority" class="block text-sm font-medium text-gray-700">Project Priority *</label>
                <select
                  id="projectPriority"
                  v-model="newProject.priority"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select priority</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label for="budgetRange" class="block text-sm font-medium text-gray-700">Budget Range</label>
                <select
                  id="budgetRange"
                  v-model="newProject.budgetRange"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select budget range</option>
                  <option value="under-10k">Under $10,000</option>
                  <option value="10k-25k">$10,000 - $25,000</option>
                  <option value="25k-50k">$25,000 - $50,000</option>
                  <option value="50k-100k">$50,000 - $100,000</option>
                  <option value="100k-250k">$100,000 - $250,000</option>
                  <option value="over-250k">Over $250,000</option>
                </select>
              </div>
              <div>
                <label for="estimatedDuration" class="block text-sm font-medium text-gray-700">Estimated Duration</label>
                <select
                  id="estimatedDuration"
                  v-model="newProject.estimatedDuration"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select duration</option>
                  <option value="1-2-weeks">1-2 weeks</option>
                  <option value="2-4-weeks">2-4 weeks</option>
                  <option value="1-2-months">1-2 months</option>
                  <option value="2-4-months">2-4 months</option>
                  <option value="4-6-months">4-6 months</option>
                  <option value="6-12-months">6-12 months</option>
                  <option value="over-12-months">Over 12 months</option>
                </select>
              </div>
              <div>
                <label for="teamSize" class="block text-sm font-medium text-gray-700">Preferred Team Size</label>
                <select
                  id="teamSize"
                  v-model="newProject.teamSize"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select team size</option>
                  <option value="1-2">1-2 people</option>
                  <option value="3-5">3-5 people</option>
                  <option value="6-10">6-10 people</option>
                  <option value="10+">10+ people</option>
                </select>
              </div>
              <div class="sm:col-span-2">
                <label for="milestones" class="block text-sm font-medium text-gray-700">Key Milestones</label>
                <textarea
                  id="milestones"
                  v-model="newProject.milestones"
                  rows="4"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="List important milestones, deliverables, and checkpoints for the project..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Step 5: Team & Stakeholders -->
          <div v-if="currentStep === 5" class="space-y-6">
            <h4 class="text-lg font-medium text-gray-900">Team & Stakeholders</h4>
            <div class="space-y-6">
              <div>
                <label for="projectManager" class="block text-sm font-medium text-gray-700">Project Manager/Contact Person *</label>
                <input
                  type="text"
                  id="projectManager"
                  v-model="newProject.projectManager"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Name of the main contact person"
                />
              </div>
              <div>
                <label for="stakeholders" class="block text-sm font-medium text-gray-700">Key Stakeholders</label>
                <textarea
                  id="stakeholders"
                  v-model="newProject.stakeholders"
                  rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="List key stakeholders, decision makers, and their roles in the project..."
                ></textarea>
              </div>
              <div>
                <label for="communicationPreferences" class="block text-sm font-medium text-gray-700">Communication Preferences</label>
                <textarea
                  id="communicationPreferences"
                  v-model="newProject.communicationPreferences"
                  rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Preferred communication methods, meeting frequency, reporting requirements..."
                ></textarea>
              </div>
              <div>
                <label for="specialRequirements" class="block text-sm font-medium text-gray-700">Special Requirements or Constraints</label>
                <textarea
                  id="specialRequirements"
                  v-model="newProject.specialRequirements"
                  rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Any special requirements, constraints, compliance needs, or unique considerations..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between pt-6 border-t border-gray-200">
            <button
              v-if="currentStep > 1"
              type="button"
              @click="currentStep--"
              class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
            <div v-else></div>
            
            <div class="flex space-x-3">
              <button
                v-if="currentStep < formSteps.length"
                type="button"
                @click="currentStep++"
                class="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Next
              </button>
              <button
                v-if="currentStep === formSteps.length"
                type="submit"
                class="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Create Project
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'

const router = useRouter()

// Sample data - replace with actual API calls
const projects = ref([
  {
    id: 1,
    name: 'Website Redesign',
    status: 'active',
    health: 'good',
    team: [
      { name: 'John Doe', initials: 'JD' },
      { name: 'Jane Smith', initials: 'JS' }
    ],
    dueDate: '2024-04-15',
    description: 'Complete website redesign with new branding'
  },
  {
    id: 2,
    name: 'Mobile App Development',
    status: 'active',
    health: 'warning',
    team: [
      { name: 'Mike Johnson', initials: 'MJ' },
      { name: 'Sarah Wilson', initials: 'SW' }
    ],
    dueDate: '2024-05-01',
    description: 'Develop new mobile app for iOS and Android'
  }
])

// Filters
const filters = ref({
  search: '',
  status: '',
  health: ''
})

// New project form
const showNewProjectModal = ref(false)
const currentStep = ref(1)
const formSteps = [
  { name: 'Basic Info' },
  { name: 'Requirements' },
  { name: 'Documents' },
  { name: 'Timeline & Budget' },
  { name: 'Team & Stakeholders' }
]

const newProject = ref({
  name: '',
  type: '',
  description: '',
  startDate: '',
  dueDate: '',
  businessRequirements: '',
  functionalRequirements: '',
  nonFunctionalRequirements: '',
  technicalSpecifications: '',
  srsDocument: null,
  additionalDocuments: [],
  documentNotes: '',
  priority: '',
  budgetRange: '',
  estimatedDuration: '',
  teamSize: '',
  milestones: '',
  projectManager: '',
  stakeholders: '',
  communicationPreferences: '',
  specialRequirements: ''
})

// File upload handler
function handleFileUpload(field, event) {
  const files = event.target.files
  if (field === 'srsDocument') {
    newProject.value.srsDocument = files[0]
  } else if (field === 'additionalDocuments') {
    newProject.value.additionalDocuments = Array.from(files)
  }
}

// Computed properties
const filteredProjects = computed(() => {
  return projects.value.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(filters.value.search.toLowerCase())
    const matchesStatus = !filters.value.status || project.status === filters.value.status
    const matchesHealth = !filters.value.health || project.health === filters.value.health
    return matchesSearch && matchesStatus && matchesHealth
  })
})

// Methods
function formatDate(date) {
  return format(new Date(date), 'MMM d, yyyy')
}

function openNewProjectModal() {
  showNewProjectModal.value = true
  currentStep.value = 1
  // Reset form data
  newProject.value = {
    name: '',
    type: '',
    description: '',
    startDate: '',
    dueDate: '',
    businessRequirements: '',
    functionalRequirements: '',
    nonFunctionalRequirements: '',
    technicalSpecifications: '',
    srsDocument: null,
    additionalDocuments: [],
    documentNotes: '',
    priority: '',
    budgetRange: '',
    estimatedDuration: '',
    teamSize: '',
    milestones: '',
    projectManager: '',
    stakeholders: '',
    communicationPreferences: '',
    specialRequirements: ''
  }
}

function createProject() {
  // Validate required fields based on current step
  if (!validateCurrentStep()) {
    return
  }

  // Create project object with all collected information
  const projectData = {
    id: projects.value.length + 1,
    name: newProject.value.name,
    type: newProject.value.type,
    description: newProject.value.description,
    startDate: newProject.value.startDate,
    dueDate: newProject.value.dueDate,
    status: 'active',
    health: 'good',
    team: [],
    
    // Requirements
    businessRequirements: newProject.value.businessRequirements,
    functionalRequirements: newProject.value.functionalRequirements,
    nonFunctionalRequirements: newProject.value.nonFunctionalRequirements,
    technicalSpecifications: newProject.value.technicalSpecifications,
    
    // Documents
    srsDocument: newProject.value.srsDocument,
    additionalDocuments: newProject.value.additionalDocuments,
    documentNotes: newProject.value.documentNotes,
    
    // Timeline & Budget
    priority: newProject.value.priority,
    budgetRange: newProject.value.budgetRange,
    estimatedDuration: newProject.value.estimatedDuration,
    teamSize: newProject.value.teamSize,
    milestones: newProject.value.milestones,
    
    // Team & Stakeholders
    projectManager: newProject.value.projectManager,
    stakeholders: newProject.value.stakeholders,
    communicationPreferences: newProject.value.communicationPreferences,
    specialRequirements: newProject.value.specialRequirements,
    
    // Metadata
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  // Add to projects list
  projects.value.push(projectData)
  
  // Close modal and reset
  showNewProjectModal.value = false
  currentStep.value = 1
  
  // Show success message (you can implement a toast notification here)
  console.log('Project created successfully:', projectData)
}

function validateCurrentStep() {
  switch (currentStep.value) {
    case 1:
      return newProject.value.name && newProject.value.type && 
             newProject.value.description && newProject.value.startDate && 
             newProject.value.dueDate
    case 2:
      return newProject.value.businessRequirements && newProject.value.functionalRequirements
    case 3:
      // Documents are optional
      return true
    case 4:
      return newProject.value.priority
    case 5:
      return newProject.value.projectManager
    default:
      return true
  }
}

function viewProject(project) {
  router.push(`/dashboard/projects/${project.id}`)
}

function editProject(project) {
  router.push(`/dashboard/projects/${project.id}/edit`)
}
</script> 