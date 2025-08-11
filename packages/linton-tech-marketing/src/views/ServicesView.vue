<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 text-white py-20 relative overflow-hidden">
      <!-- Background decoration -->
      <div class="absolute inset-0">
        <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
        <div class="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div class="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full animate-pulse" style="animation-delay: 1s;"></div>
        <div class="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full animate-pulse" style="animation-delay: 2s;"></div>
      </div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            Our 
            <span class="gradient-text">Services</span>
          </h1>
          <p class="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Comprehensive digital solutions tailored to transform your business
          </p>
        </div>
      </div>
    </section>

    <!-- Services Grid -->
    <section class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Web Development -->
          <div class="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 border border-white/20">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Web Development</h3>
            <p class="text-gray-600 mb-6 leading-relaxed">
              Custom web applications built with modern technologies, ensuring scalability, security, and exceptional user experience.
            </p>
            <ul class="text-sm text-gray-500 space-y-2 mb-6">
              <li class="flex items-center">
                <div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                React, Vue.js, Angular
              </li>
              <li class="flex items-center">
                <div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Node.js, Python, PHP
              </li>
              <li class="flex items-center">
                <div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Responsive Design
              </li>
              <li class="flex items-center">
                <div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                API Development
              </li>
            </ul>
            <router-link
              to="/contact"
              class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium group/link transition-all duration-300"
            >
              Learn More
              <svg class="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </router-link>
          </div>

          <!-- Mobile Apps -->
          <div class="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 border border-white/20">
            <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Mobile Apps</h3>
            <p class="text-gray-600 mb-6 leading-relaxed">
              Native and cross-platform mobile applications that engage users and drive business growth across all devices.
            </p>
            <ul class="text-sm text-gray-500 space-y-2 mb-6">
              <li class="flex items-center">
                <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                iOS & Android Development
              </li>
              <li class="flex items-center">
                <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                React Native, Flutter
              </li>
              <li class="flex items-center">
                <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                App Store Optimization
              </li>
              <li class="flex items-center">
                <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Push Notifications
              </li>
            </ul>
            <router-link
              to="/contact"
              class="inline-flex items-center text-green-600 hover:text-green-700 font-medium group/link transition-all duration-300"
            >
              Learn More
              <svg class="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </router-link>
          </div>

          <!-- Cloud Solutions -->
          <div class="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 border border-white/20">
            <div class="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Cloud Solutions</h3>
            <p class="text-gray-600 mb-6 leading-relaxed">
              Scalable cloud infrastructure and DevOps solutions to optimize performance and reduce operational costs.
            </p>
            <ul class="text-sm text-gray-500 space-y-2 mb-6">
              <li class="flex items-center">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                AWS, Azure, Google Cloud
              </li>
              <li class="flex items-center">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                CI/CD Pipelines
              </li>
              <li class="flex items-center">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                Infrastructure as Code
              </li>
              <li class="flex items-center">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                Monitoring & Logging
              </li>
            </ul>
            <router-link
              to="/contact"
              class="inline-flex items-center text-yellow-600 hover:text-yellow-700 font-medium group/link transition-all duration-300"
            >
              Learn More
              <svg class="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </router-link>
          </div>

          <!-- Data Analytics -->
          <div class="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 border border-white/20">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Data Analytics</h3>
            <p class="text-gray-600 mb-6 leading-relaxed">
              Transform your data into actionable insights with advanced analytics and business intelligence solutions.
            </p>
            <ul class="text-sm text-gray-500 space-y-2 mb-6">
              <li class="flex items-center">
                <div class="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Business Intelligence
              </li>
              <li class="flex items-center">
                <div class="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Predictive Analytics
              </li>
              <li class="flex items-center">
                <div class="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Custom Dashboards
              </li>
              <li class="flex items-center">
                <div class="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Data Visualization
              </li>
            </ul>
            <router-link
              to="/contact"
              class="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium group/link transition-all duration-300"
            >
              Learn More
              <svg class="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </router-link>
          </div>

          <!-- Cybersecurity -->
          <div class="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 border border-white/20">
            <div class="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Cybersecurity</h3>
            <p class="text-gray-600 mb-6 leading-relaxed">
              Comprehensive security solutions to protect your digital assets and ensure compliance with industry standards.
            </p>
            <ul class="text-sm text-gray-500 space-y-2 mb-6">
              <li class="flex items-center">
                <div class="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                Security Audits
              </li>
              <li class="flex items-center">
                <div class="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                Penetration Testing
              </li>
              <li class="flex items-center">
                <div class="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                Compliance Management
              </li>
              <li class="flex items-center">
                <div class="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                Threat Detection
              </li>
            </ul>
            <router-link
              to="/contact"
              class="inline-flex items-center text-red-600 hover:text-red-700 font-medium group/link transition-all duration-300"
            >
              Learn More
              <svg class="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </router-link>
          </div>

          <!-- Consulting -->
          <div class="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 border border-white/20">
            <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Consulting</h3>
            <p class="text-gray-600 mb-6 leading-relaxed">
              Strategic technology consulting to help you make informed decisions and achieve your business objectives.
            </p>
            <ul class="text-sm text-gray-500 space-y-2 mb-6">
              <li class="flex items-center">
                <div class="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                Technology Strategy
              </li>
              <li class="flex items-center">
                <div class="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                Digital Transformation
              </li>
              <li class="flex items-center">
                <div class="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                Project Management
              </li>
              <li class="flex items-center">
                <div class="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                Architecture Design
              </li>
            </ul>
            <router-link
              to="/contact"
              class="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium group/link transition-all duration-300"
            >
              Learn More
              <svg class="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 relative overflow-hidden">
      <!-- Background decoration -->
      <div class="absolute inset-0">
        <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div class="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full"></div>
        <div class="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full"></div>
      </div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <h2 class="text-3xl md:text-4xl font-bold mb-6">
          Ready to Transform Your Business?
        </h2>
        <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
          Let's discuss how our services can help you achieve your digital transformation goals.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/contact"
            class="group bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center shadow-lg"
          >
            Get Started
            <svg class="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </router-link>
          <router-link
            to="/pricing"
            class="group border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center backdrop-blur-sm"
          >
            View Pricing
            <svg class="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Component logic here
</script> 