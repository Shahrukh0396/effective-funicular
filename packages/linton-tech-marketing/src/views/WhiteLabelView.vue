<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            White-Label Solutions
          </h1>
          <p class="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
            Transform your business with our comprehensive white-label platform
          </p>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Why Choose Our White-Label Platform?
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Launch your own branded SaaS platform with our proven technology stack
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Custom Branding -->
          <div class="bg-white rounded-xl p-8 shadow-lg">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Custom Branding</h3>
            <p class="text-gray-600">
              Fully customizable branding with your logo, colors, and domain. Your customers will never know you're using our platform.
            </p>
          </div>

          <!-- Multi-Tenant Architecture -->
          <div class="bg-white rounded-xl p-8 shadow-lg">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Multi-Tenant Architecture</h3>
            <p class="text-gray-600">
              Built for scale with isolated tenant environments, ensuring data security and performance for each client.
            </p>
          </div>

          <!-- Admin Dashboard -->
          <div class="bg-white rounded-xl p-8 shadow-lg">
            <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h3>
            <p class="text-gray-600">
              Powerful admin panel to manage clients, users, billing, and analytics with real-time insights.
            </p>
          </div>

          <!-- API Access -->
          <div class="bg-white rounded-xl p-8 shadow-lg">
            <div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">API Access</h3>
            <p class="text-gray-600">
              RESTful APIs and webhooks for seamless integration with your existing systems and workflows.
            </p>
          </div>

          <!-- Analytics & Reporting -->
          <div class="bg-white rounded-xl p-8 shadow-lg">
            <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Analytics & Reporting</h3>
            <p class="text-gray-600">
              Comprehensive analytics and reporting tools to track usage, performance, and business metrics.
            </p>
          </div>

          <!-- 24/7 Support -->
          <div class="bg-white rounded-xl p-8 shadow-lg">
            <div class="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">24/7 Support</h3>
            <p class="text-gray-600">
              Dedicated support team available around the clock to help you and your customers succeed.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">For Vendors</h2>
          <p class="text-xl text-gray-600">
            White-label our platform and build your own SaaS business
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- Partner Plan -->
          <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow">
            <div class="text-center mb-8">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Partner</h3>
              <p class="text-gray-600 mb-6">Start your white-label journey</p>
              <div class="mb-6">
                <span class="text-4xl font-bold text-gray-900">$299</span>
                <span class="text-gray-600">/month</span>
              </div>
              <router-link 
                to="/contact" 
                class="block w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Learn More
              </router-link>
            </div>

            <div class="space-y-4">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Custom branding</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Up to 100 clients</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Revenue sharing</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Dedicated support</span>
              </div>
            </div>
          </div>

          <!-- Enterprise Partner -->
          <div class="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-600 relative">
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span class="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Recommended</span>
            </div>
            <div class="text-center mb-8">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Enterprise Partner</h3>
              <p class="text-gray-600 mb-6">Scale your white-label business</p>
              <div class="mb-6">
                <span class="text-4xl font-bold text-gray-900">$599</span>
                <span class="text-gray-600">/month</span>
              </div>
              <router-link 
                to="/contact" 
                class="block w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Contact Sales
              </router-link>
            </div>

            <div class="space-y-4">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Unlimited clients</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Custom domain</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Priority support</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Custom development</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-6">
          Ready to Launch Your White-Label Platform?
        </h2>
        <p class="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
          Join hundreds of businesses that have successfully launched their own SaaS platforms with our white-label solution.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/contact"
            class="inline-flex items-center px-8 py-4 text-lg font-semibold text-purple-900 bg-white rounded-lg hover:bg-gray-100 transition-all duration-300"
          >
            Start Your Free Trial
            <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </router-link>
          <router-link
            to="/contact"
            class="inline-flex items-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-lg hover:bg-white hover:text-purple-900 transition-all duration-300"
          >
            Schedule Demo
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Component logic here
</script> 