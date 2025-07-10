<template>
  <div class="relative bg-white">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 overflow-hidden">
      <div class="absolute inset-0 bg-black opacity-20"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            <span class="block">Transform Your</span>
            <span class="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Business Digital
            </span>
            <span class="block">Experience</span>
          </h1>
          <p class="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            We deliver cutting-edge software solutions that drive innovation, 
            streamline operations, and accelerate your business growth.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link
              to="/auth/register"
              class="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              Start Your Project
              <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </router-link>
            <router-link
              to="/auth/login"
              class="inline-flex items-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-lg hover:bg-white hover:text-indigo-900 transition-all duration-300"
            >
              View Portfolio
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- Floating elements for visual appeal -->
      <div class="absolute top-20 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
      <div class="absolute top-40 right-20 w-16 h-16 bg-purple-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div class="absolute bottom-20 left-1/4 w-12 h-12 bg-indigo-400 rounded-full opacity-20 animate-pulse delay-2000"></div>
    </section>

    <!-- Services Section -->
    <section id="services" class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            We offer comprehensive digital solutions tailored to your business needs
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Web Development</h3>
            <p class="text-gray-600 mb-6">
              Custom web applications built with modern technologies, ensuring scalability, security, and exceptional user experience.
            </p>
            <ul class="text-sm text-gray-500 space-y-2">
              <li>• React, Vue.js, Angular</li>
              <li>• Node.js, Python, PHP</li>
              <li>• Responsive Design</li>
            </ul>
          </div>

          <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Mobile Apps</h3>
            <p class="text-gray-600 mb-6">
              Native and cross-platform mobile applications that engage users and drive business growth across all devices.
            </p>
            <ul class="text-sm text-gray-500 space-y-2">
              <li>• iOS & Android Development</li>
              <li>• React Native, Flutter</li>
              <li>• App Store Optimization</li>
            </ul>
          </div>

          <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Data Analytics</h3>
            <p class="text-gray-600 mb-6">
              Transform your data into actionable insights with advanced analytics and business intelligence solutions.
            </p>
            <ul class="text-sm text-gray-500 space-y-2">
              <li>• Business Intelligence</li>
              <li>• Predictive Analytics</li>
              <li>• Custom Dashboards</li>
            </ul>
          </div>

          <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div class="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Cloud Solutions</h3>
            <p class="text-gray-600 mb-6">
              Scalable cloud infrastructure and DevOps solutions to optimize performance and reduce operational costs.
            </p>
            <ul class="text-sm text-gray-500 space-y-2">
              <li>• AWS, Azure, Google Cloud</li>
              <li>• CI/CD Pipelines</li>
              <li>• Infrastructure as Code</li>
            </ul>
          </div>

          <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div class="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Cybersecurity</h3>
            <p class="text-gray-600 mb-6">
              Comprehensive security solutions to protect your digital assets and ensure compliance with industry standards.
            </p>
            <ul class="text-sm text-gray-500 space-y-2">
              <li>• Security Audits</li>
              <li>• Penetration Testing</li>
              <li>• Compliance Management</li>
            </ul>
          </div>

          <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Consulting</h3>
            <p class="text-gray-600 mb-6">
              Strategic technology consulting to help you make informed decisions and achieve your business objectives.
            </p>
            <ul class="text-sm text-gray-500 space-y-2">
              <li>• Technology Strategy</li>
              <li>• Digital Transformation</li>
              <li>• Project Management</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Portfolio Section -->
    <section id="portfolio" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Portfolio
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how we've helped businesses transform their digital presence with innovative solutions
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- E-Commerce Platform -->
          <div class="group relative overflow-hidden rounded-xl shadow-lg bg-white">
            <div class="aspect-w-16 aspect-h-9 bg-gradient-to-br from-blue-500 to-purple-600 relative">
              <div class="absolute inset-0 flex items-center justify-center">
                <svg class="w-16 h-16 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              </div>
            </div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-xl font-bold text-gray-900">E-Commerce Platform</h3>
                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">React</span>
              </div>
              <p class="text-gray-600 mb-4">Modern online store with advanced features including inventory management, payment processing, and analytics dashboard.</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">React</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Node.js</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">MongoDB</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Stripe</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Client: TechRetail Inc.</span>
                <span class="text-sm font-semibold text-green-600">+45% Revenue</span>
              </div>
            </div>
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div class="text-center text-white">
                <h3 class="text-xl font-bold mb-2">E-Commerce Platform</h3>
                <p class="text-sm mb-4">Modern online store with advanced features</p>
                <button class="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>

          <!-- Healthcare Management -->
          <div class="group relative overflow-hidden rounded-xl shadow-lg bg-white">
            <div class="aspect-w-16 aspect-h-9 bg-gradient-to-br from-green-500 to-blue-600 relative">
              <div class="absolute inset-0 flex items-center justify-center">
                <svg class="w-16 h-16 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </div>
            </div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-xl font-bold text-gray-900">Healthcare Management</h3>
                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Vue.js</span>
              </div>
              <p class="text-gray-600 mb-4">Comprehensive patient care and appointment system with telemedicine capabilities and secure data management.</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Vue.js</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Python</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">PostgreSQL</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">HIPAA</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Client: MedCare Plus</span>
                <span class="text-sm font-semibold text-green-600">+60% Efficiency</span>
              </div>
            </div>
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div class="text-center text-white">
                <h3 class="text-xl font-bold mb-2">Healthcare Management</h3>
                <p class="text-sm mb-4">Patient care and appointment system</p>
                <button class="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>

          <!-- Financial Dashboard -->
          <div class="group relative overflow-hidden rounded-xl shadow-lg bg-white">
            <div class="aspect-w-16 aspect-h-9 bg-gradient-to-br from-purple-500 to-pink-600 relative">
              <div class="absolute inset-0 flex items-center justify-center">
                <svg class="w-16 h-16 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
            </div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-xl font-bold text-gray-900">Financial Dashboard</h3>
                <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Angular</span>
              </div>
              <p class="text-gray-600 mb-4">Real-time analytics and reporting platform with interactive charts and automated insights for financial decision making.</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Angular</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">TypeScript</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">D3.js</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">WebSocket</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Client: FinanceCorp</span>
                <span class="text-sm font-semibold text-green-600">+35% ROI</span>
              </div>
            </div>
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div class="text-center text-white">
                <h3 class="text-xl font-bold mb-2">Financial Dashboard</h3>
                <p class="text-sm mb-4">Real-time analytics and reporting</p>
                <button class="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile Banking App -->
          <div class="group relative overflow-hidden rounded-xl shadow-lg bg-white">
            <div class="aspect-w-16 aspect-h-9 bg-gradient-to-br from-yellow-500 to-orange-600 relative">
              <div class="absolute inset-0 flex items-center justify-center">
                <svg class="w-16 h-16 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-xl font-bold text-gray-900">Mobile Banking App</h3>
                <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">React Native</span>
              </div>
              <p class="text-gray-600 mb-4">Secure mobile banking application with biometric authentication, real-time transactions, and investment tracking.</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">React Native</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Firebase</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Biometrics</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Encryption</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Client: SecureBank</span>
                <span class="text-sm font-semibold text-green-600">+80% Users</span>
              </div>
            </div>
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div class="text-center text-white">
                <h3 class="text-xl font-bold mb-2">Mobile Banking App</h3>
                <p class="text-sm mb-4">Secure financial transactions</p>
                <button class="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>

          <!-- Project Management -->
          <div class="group relative overflow-hidden rounded-xl shadow-lg bg-white">
            <div class="aspect-w-16 aspect-h-9 bg-gradient-to-br from-red-500 to-pink-600 relative">
              <div class="absolute inset-0 flex items-center justify-center">
                <svg class="w-16 h-16 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
            </div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-xl font-bold text-gray-900">Project Management</h3>
                <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Vue.js</span>
              </div>
              <p class="text-gray-600 mb-4">Comprehensive team collaboration platform with task management, time tracking, and resource allocation features.</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Vue.js</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Laravel</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">MySQL</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">WebRTC</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Client: TeamFlow Inc.</span>
                <span class="text-sm font-semibold text-green-600">+50% Productivity</span>
              </div>
            </div>
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div class="text-center text-white">
                <h3 class="text-xl font-bold mb-2">Project Management</h3>
                <p class="text-sm mb-4">Team collaboration platform</p>
                <button class="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>

          <!-- AI-Powered Analytics -->
          <div class="group relative overflow-hidden rounded-xl shadow-lg bg-white">
            <div class="aspect-w-16 aspect-h-9 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
              <div class="absolute inset-0 flex items-center justify-center">
                <svg class="w-16 h-16 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
            </div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-xl font-bold text-gray-900">AI-Powered Analytics</h3>
                <span class="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">Python</span>
              </div>
              <p class="text-gray-600 mb-4">Advanced machine learning platform providing predictive insights and automated decision-making capabilities.</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Python</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">TensorFlow</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">FastAPI</span>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Docker</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Client: DataInsight</span>
                <span class="text-sm font-semibold text-green-600">+75% Accuracy</span>
              </div>
            </div>
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div class="text-center text-white">
                <h3 class="text-xl font-bold mb-2">AI-Powered Analytics</h3>
                <p class="text-sm mb-4">Machine learning insights</p>
                <button class="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Approach to
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Digital Excellence
              </span>
            </h2>
            <p class="text-xl text-gray-600 mb-8">
              We believe in creating technology solutions that not only meet your current needs but also scale with your future growth. Our approach combines innovation, expertise, and a deep understanding of your business objectives.
            </p>
            
            <div class="space-y-6">
              <div class="flex items-start">
                <div class="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Discovery & Strategy</h3>
                  <p class="text-gray-600">We start by understanding your business goals, challenges, and opportunities to create a tailored strategy.</p>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Design & Development</h3>
                  <p class="text-gray-600">Our expert team creates intuitive designs and robust code using cutting-edge technologies.</p>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-4">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Testing & Deployment</h3>
                  <p class="text-gray-600">Rigorous testing ensures quality, while smooth deployment gets your solution to market faster.</p>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="flex-shrink-0 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center mr-4">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Support & Growth</h3>
                  <p class="text-gray-600">Ongoing support and continuous improvement ensure your solution evolves with your business.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="relative">
            <div class="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h3 class="text-2xl font-bold mb-6">Why Choose Us?</h3>
              <div class="space-y-4">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-white rounded-full mr-3"></div>
                  <span>10+ Years of Experience</span>
                </div>
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-white rounded-full mr-3"></div>
                  <span>200+ Successful Projects</span>
                </div>
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-white rounded-full mr-3"></div>
                  <span>24/7 Technical Support</span>
                </div>
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-white rounded-full mr-3"></div>
                  <span>99.9% Uptime Guarantee</span>
                </div>
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-white rounded-full mr-3"></div>
                  <span>Agile Development Process</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get In Touch
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to start your next project? Let's discuss how we can help you achieve your goals.
          </p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 class="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
            <div class="space-y-6">
              <div class="flex items-start">
                <div class="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-4">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-gray-900">Phone</h4>
                  <p class="text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-4">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-gray-900">Email</h4>
                  <p class="text-gray-600">hello@lintonlabs.com</p>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-4">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-gray-900">Address</h4>
                  <p class="text-gray-600">123 Innovation Drive<br>Tech City, TC 12345</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 rounded-xl p-8">
            <h3 class="text-2xl font-bold text-gray-900 mb-6">Send us a message</h3>
            <form class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea rows="4" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"></textarea>
              </div>
              <button type="submit" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-gradient-to-r from-indigo-900 to-purple-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Business?
        </h2>
        <p class="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Let's discuss how we can help you achieve your digital goals and take your business to the next level.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/auth/register"
            class="inline-flex items-center px-8 py-4 text-lg font-semibold text-indigo-900 bg-white rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
          >
            Start Your Project
            <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </router-link>
          <router-link
            to="/auth/login"
            class="inline-flex items-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-lg hover:bg-white hover:text-indigo-900 transition-all duration-300"
          >
            Schedule a Demo
          </router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="col-span-1 md:col-span-2">
            <div class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">
              Linton Labs
            </div>
            <p class="text-gray-400 mb-6 max-w-md">
              We deliver cutting-edge software solutions that drive innovation, streamline operations, and accelerate your business growth.
            </p>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold mb-4">Services</h3>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white transition-colors duration-200">Web Development</a></li>
              <li><a href="#" class="hover:text-white transition-colors duration-200">Mobile Apps</a></li>
              <li><a href="#" class="hover:text-white transition-colors duration-200">Data Analytics</a></li>
              <li><a href="#" class="hover:text-white transition-colors duration-200">Cloud Solutions</a></li>
              <li><a href="#" class="hover:text-white transition-colors duration-200">Cybersecurity</a></li>
            </ul>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold mb-4">Company</h3>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white transition-colors duration-200">About Us</a></li>
              <li><a href="#" class="hover:text-white transition-colors duration-200">Our Team</a></li>
              <li><a href="#" class="hover:text-white transition-colors duration-200">Careers</a></li>
              <li><a href="#" class="hover:text-white transition-colors duration-200">Blog</a></li>
              <li><a href="#" class="hover:text-white transition-colors duration-200">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div class="border-t border-gray-800 mt-12 pt-8">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <p class="text-gray-400 text-sm">
              © 2024 Linton Labs. All rights reserved.
            </p>
            <div class="flex space-x-6 mt-4 md:mt-0">
              <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors duration-200">Privacy Policy</a>
              <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors duration-200">Terms of Service</a>
              <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors duration-200">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.aspect-w-16 {
  position: relative;
  padding-bottom: 56.25%;
}

.aspect-w-16 > div {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style> 