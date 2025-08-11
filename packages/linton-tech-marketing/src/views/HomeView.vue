<template>
  <div class="min-h-screen bg-white">
    <!-- Navigation -->
    <Navigation />

    <!-- Hero Section -->
    <section id="home" class="relative bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 py-20 overflow-hidden">
      <!-- Animated background elements -->
      <div class="absolute inset-0">
        <div class="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div class="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style="animation-delay: 1s;"></div>
        <div class="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style="animation-delay: 2s;"></div>
      </div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-8">
            <div class="space-y-6">
              <div class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-medium shadow-lg pulse-glow">
                <SparklesIcon class="w-4 h-4 mr-2" />
                Enterprise Platform
              </div>
              <h1 class="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
                Transform Your Business with
                <span class="gradient-text">
                  Smart Solutions
                </span>
              </h1>
              <p class="text-xl text-gray-600 leading-relaxed">
                Linton Tech provides cutting-edge project management and business solutions. 
                Whether you're a client looking for efficient project delivery or a vendor seeking 
                white-label opportunities, we have the perfect solution for you.
              </p>
            </div>
            <div class="flex flex-col sm:flex-row gap-4">
              <router-link 
                to="/pricing" 
                class="group btn-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
              >
                Explore Solutions
                <ArrowRightIcon class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </router-link>
              <router-link 
                to="/white-label" 
                class="group border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center backdrop-blur-sm"
              >
                White Label Program
                <ArrowRightIcon class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </router-link>
            </div>
          </div>
          <div class="relative">
            <div class="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-all duration-500 float border border-white/20">
              <div class="space-y-6">
                <div class="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-sm">
                  <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span class="text-gray-700 font-medium">Project Management</span>
                </div>
                <div class="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm">
                  <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.5s;"></div>
                  <span class="text-gray-700 font-medium">Team Collaboration</span>
                </div>
                <div class="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl shadow-sm">
                  <div class="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style="animation-delay: 1s;"></div>
                  <span class="text-gray-700 font-medium">Time Tracking</span>
                </div>
                <div class="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl shadow-sm">
                  <div class="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style="animation-delay: 1.5s;"></div>
                  <span class="text-gray-700 font-medium">Analytics & Reporting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="services" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose 
            <span class="gradient-text">
              Linton Tech?
            </span>
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our comprehensive platform offers everything you need to streamline your business operations 
            and achieve exceptional results.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="group bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <ClipboardDocumentListIcon class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Project Management</h3>
            <p class="text-gray-600 leading-relaxed">
              Streamline your projects with our intuitive project management tools. 
              Track progress, manage tasks, and collaborate seamlessly with your team.
            </p>
          </div>

          <div class="group bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
            <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <ClockIcon class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Time Tracking</h3>
            <p class="text-gray-600 leading-relaxed">
              Monitor productivity and bill accurately with our advanced time tracking system. 
              Generate detailed reports and insights to optimize your workflow.
            </p>
          </div>

          <div class="group bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
            <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <UsersIcon class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Team Collaboration</h3>
            <p class="text-gray-600 leading-relaxed">
              Foster better teamwork with real-time communication tools, shared workspaces, 
              and integrated chat features that keep everyone connected.
            </p>
          </div>

          <div class="group bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
            <div class="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <ChartBarIcon class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Analytics & Reporting</h3>
            <p class="text-gray-600 leading-relaxed">
              Make data-driven decisions with comprehensive analytics and customizable reports. 
              Track performance metrics and identify areas for improvement.
            </p>
          </div>

          <div class="group bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
            <div class="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <CreditCardIcon class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Billing & Payments</h3>
            <p class="text-gray-600 leading-relaxed">
              Simplify your billing process with automated invoicing, payment tracking, 
              and integrated payment gateways for seamless transactions.
            </p>
          </div>

          <div class="group bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
            <div class="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <ShieldCheckIcon class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Security & Compliance</h3>
            <p class="text-gray-600 leading-relaxed">
              Rest easy knowing your data is protected with enterprise-grade security, 
              regular backups, and compliance with industry standards.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- White Label Section -->
    <section id="white-label" class="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
      <!-- Background decoration -->
      <div class="absolute inset-0">
        <div class="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div class="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-8">
            <div class="space-y-4">
              <h2 class="text-4xl md:text-5xl font-bold text-gray-900">
                White Label Solutions for 
                <span class="gradient-text">
                  Vendors
                </span>
              </h2>
              <p class="text-xl text-gray-600 leading-relaxed">
                Join our ecosystem as a vendor and offer our powerful platform under your own brand. 
                Expand your service offerings and increase your revenue with minimal investment.
              </p>
            </div>
            <div class="space-y-4">
              <div class="flex items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <div class="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mr-4 shadow-sm">
                  <CheckIcon class="w-4 h-4 text-white" />
                </div>
                <span class="text-gray-700 font-medium">Custom branding and domain</span>
              </div>
              <div class="flex items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <div class="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mr-4 shadow-sm">
                  <CheckIcon class="w-4 h-4 text-white" />
                </div>
                <span class="text-gray-700 font-medium">Dedicated support team</span>
              </div>
              <div class="flex items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <div class="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mr-4 shadow-sm">
                  <CheckIcon class="w-4 h-4 text-white" />
                </div>
                <span class="text-gray-700 font-medium">Revenue sharing opportunities</span>
              </div>
              <div class="flex items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <div class="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mr-4 shadow-sm">
                  <CheckIcon class="w-4 h-4 text-white" />
                </div>
                <span class="text-gray-700 font-medium">Full platform access</span>
              </div>
            </div>
            <router-link 
              to="/white-label" 
              class="inline-flex items-center btn-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Learn More About White Label
              <ArrowRightIcon class="w-5 h-5 ml-2" />
            </router-link>
          </div>
          <div class="relative">
            <div class="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 transform -rotate-3 hover:rotate-0 transition-all duration-500 float border border-white/20">
              <div class="text-center space-y-6">
                <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <BuildingOfficeIcon class="w-8 h-8 text-white" />
                </div>
                <h3 class="text-2xl font-bold text-gray-900">Your Brand, Our Platform</h3>
                <p class="text-gray-600">Offer enterprise-grade solutions under your own brand</p>
                <div class="flex items-center justify-center space-x-4">
                  <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <div class="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style="animation-delay: 0.5s;"></div>
                  <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse" style="animation-delay: 1s;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>



    <!-- CTA Section -->
    <section id="cta" class="py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
      <!-- Background decoration -->
      <div class="absolute inset-0">
        <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div class="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full"></div>
        <div class="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full"></div>
      </div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Business?
        </h2>
        <p class="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
          Join thousands of businesses that trust Linton Tech for their project management and business solutions. 
          Start your journey today and experience the difference.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link 
            to="/register" 
            class="group bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center shadow-lg"
          >
            Get Started Free
            <ArrowRightIcon class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </router-link>
          <router-link 
            to="/contact" 
            class="group border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center backdrop-blur-sm"
          >
            Contact Sales
            <ArrowRightIcon class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer id="contact" class="bg-gray-900 text-white py-12 relative">
      <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 class="text-xl font-bold gradient-text mb-4">Linton Tech</h3>
            <p class="text-gray-400 leading-relaxed">
              Empowering businesses with innovative project management and business solutions.
            </p>
          </div>
          <div>
            <h4 class="text-lg font-semibold mb-4">Solutions</h4>
            <ul class="space-y-2 text-gray-400">
              <li><router-link to="/services" class="hover:text-white transition-colors">Project Management</router-link></li>
              <li><router-link to="/services" class="hover:text-white transition-colors">Time Tracking</router-link></li>
              <li><router-link to="/services" class="hover:text-white transition-colors">Team Collaboration</router-link></li>
              <li><router-link to="/white-label" class="hover:text-white transition-colors">White Label</router-link></li>
            </ul>
          </div>
          <div>
            <h4 class="text-lg font-semibold mb-4">Company</h4>
            <ul class="space-y-2 text-gray-400">
              <li><router-link to="/about" class="hover:text-white transition-colors">About Us</router-link></li>
              <li><router-link to="/contact" class="hover:text-white transition-colors">Contact</router-link></li>
              <li><router-link to="/pricing" class="hover:text-white transition-colors">Pricing</router-link></li>
              <li><router-link to="/blog" class="hover:text-white transition-colors">Blog</router-link></li>
            </ul>
          </div>
          <div>
            <h4 class="text-lg font-semibold mb-4">Support</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" class="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Status</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Linton Tech. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import Navigation from '@/components/Navigation.vue'
import {
  SparklesIcon,
  ArrowRightIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  UsersIcon,
  ChartBarIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

const scrollToSection = (sectionId, event) => {
  // Prevent default anchor behavior
  if (event) {
    event.preventDefault()
  }
  
  const element = document.getElementById(sectionId)
  if (element) {
    // Account for sticky header height
    const headerHeight = 64 // 16 * 4 = 64px (h-16)
    const elementPosition = element.offsetTop - headerHeight
    
    console.log('Element found, scrolling to position:', elementPosition)
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    })
  } else {
    console.log('Element not found:', sectionId)
  }
}
</script> 