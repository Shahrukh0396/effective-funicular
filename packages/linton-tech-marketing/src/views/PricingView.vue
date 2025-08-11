<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <h1 class="text-2xl font-bold text-blue-600">Linton Tech</h1>
            </div>
          </div>
          <div class="hidden md:flex items-center space-x-8">
            <router-link to="/" class="text-gray-700 hover:text-blue-600 transition-colors">Home</router-link>
            <router-link to="/services" class="text-gray-700 hover:text-blue-600 transition-colors">Services</router-link>
            <router-link to="/pricing" class="text-gray-700 hover:text-blue-600 transition-colors">Pricing</router-link>
            <router-link to="/white-label" class="text-gray-700 hover:text-blue-600 transition-colors">White Label</router-link>
            <router-link to="/contact" class="text-gray-700 hover:text-blue-600 transition-colors">Contact</router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/login" class="text-gray-700 hover:text-blue-600 transition-colors">Login</router-link>
            <router-link to="/register" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Get Started</router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Header -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Simple, Transparent Pricing
        </h1>
        <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Choose the perfect plan for your business needs. Whether you're a client looking for 
          project management solutions or a vendor seeking white-label opportunities, we have you covered.
        </p>
        
        <!-- Pricing Toggle -->
        <div class="flex items-center justify-center mb-12">
          <span class="text-gray-600 mr-4">Monthly</span>
          <button 
            @click="billingCycle = billingCycle === 'monthly' ? 'yearly' : 'monthly'"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            :class="billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'"
          >
            <span 
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'"
            ></span>
          </button>
          <span class="text-gray-600 ml-4">Yearly <span class="text-green-600 font-semibold">(Save 20%)</span></span>
        </div>
      </div>
    </section>

    <!-- Client Plans -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">For Clients</h2>
          <p class="text-xl text-gray-600">
            Powerful project management and collaboration tools for your business
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Starter Plan -->
          <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow">
            <div class="text-center mb-8">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <p class="text-gray-600 mb-6">Perfect for small teams and startups</p>
              <div class="mb-6">
                <span class="text-4xl font-bold text-gray-900">${{ getPrice(29) }}</span>
                <span class="text-gray-600">/month</span>
              </div>
              <router-link 
                to="/register" 
                class="block w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Get Started
              </router-link>
            </div>

            <div class="space-y-4">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Up to 5 team members</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Unlimited projects</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Basic time tracking</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Email support</span>
              </div>
            </div>
          </div>

          <!-- Professional Plan -->
          <div class="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-600 relative">
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
            </div>
            <div class="text-center mb-8">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
              <p class="text-gray-600 mb-6">Ideal for growing businesses</p>
              <div class="mb-6">
                <span class="text-4xl font-bold text-gray-900">${{ getPrice(79) }}</span>
                <span class="text-gray-600">/month</span>
              </div>
              <router-link 
                to="/register" 
                class="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Get Started
              </router-link>
            </div>

            <div class="space-y-4">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Up to 25 team members</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Advanced analytics</span>
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
                <span class="text-gray-700">Custom integrations</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Advanced reporting</span>
              </div>
            </div>
          </div>

          <!-- Enterprise Plan -->
          <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow">
            <div class="text-center mb-8">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <p class="text-gray-600 mb-6">For large organizations</p>
              <div class="mb-6">
                <span class="text-4xl font-bold text-gray-900">${{ getPrice(199) }}</span>
                <span class="text-gray-600">/month</span>
              </div>
              <router-link 
                to="/contact" 
                class="block w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Contact Sales
              </router-link>
            </div>

            <div class="space-y-4">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Unlimited team members</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Dedicated support</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Custom development</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">SLA guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Vendor Plans -->
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
                <span class="text-4xl font-bold text-gray-900">${{ getPrice(299) }}</span>
                <span class="text-gray-600">/month</span>
              </div>
              <router-link 
                to="/white-label" 
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
                <span class="text-4xl font-bold text-gray-900">${{ getPrice(599) }}</span>
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

    <!-- FAQ Section -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p class="text-xl text-gray-600">
            Everything you need to know about our pricing and plans
          </p>
        </div>

        <div class="space-y-8">
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Can I change my plan anytime?</h3>
            <p class="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Is there a free trial available?</h3>
            <p class="text-gray-600">Yes, we offer a 14-day free trial for all client plans. No credit card required to start.</p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">What payment methods do you accept?</h3>
            <p class="text-gray-600">We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">How does white-label pricing work?</h3>
            <p class="text-gray-600">White-label partners pay a monthly fee and earn revenue by reselling our platform under their own brand.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-blue-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Get Started?
        </h2>
        <p class="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
          Join thousands of businesses that trust Linton Tech for their project management and business solutions.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link 
            to="/register" 
            class="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Free Trial
          </router-link>
          <router-link 
            to="/contact" 
            class="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
          >
            Contact Sales
          </router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 class="text-xl font-bold text-blue-400 mb-4">Linton Tech</h3>
            <p class="text-gray-400">
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
import { ref, computed } from 'vue'

const billingCycle = ref('monthly')

const getPrice = (monthlyPrice) => {
  if (billingCycle.value === 'yearly') {
    return Math.round(monthlyPrice * 0.8) // 20% discount
  }
  return monthlyPrice
}
</script> 