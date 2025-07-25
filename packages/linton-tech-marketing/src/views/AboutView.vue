<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            About Linton Tech
          </h1>
          <p class="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
            Empowering businesses through innovative technology solutions
          </p>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p class="text-lg text-gray-600 mb-6">
              At Linton Tech, we believe that technology should be accessible, powerful, and transformative. Our mission is to empower businesses of all sizes with cutting-edge solutions that drive growth, efficiency, and innovation.
            </p>
            <p class="text-lg text-gray-600 mb-6">
              We're passionate about creating software that not only meets today's needs but anticipates tomorrow's challenges. Our team of experts combines deep technical knowledge with a deep understanding of business processes to deliver solutions that truly make a difference.
            </p>
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <svg class="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="text-gray-700">Innovation First</span>
              </div>
              <div class="flex items-center">
                <svg class="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="text-gray-700">Customer Focused</span>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl p-8 shadow-lg">
            <div class="grid grid-cols-2 gap-6">
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600 mb-2">500+</div>
                <div class="text-gray-600">Happy Clients</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600 mb-2">50+</div>
                <div class="text-gray-600">Team Members</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600 mb-2">10+</div>
                <div class="text-gray-600">Years Experience</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
                <div class="text-gray-600">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Values Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Our Values
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            The principles that guide everything we do
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Innovation -->
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Innovation</h3>
            <p class="text-gray-600">
              We constantly push the boundaries of what's possible, exploring new technologies and approaches to solve complex problems.
            </p>
          </div>

          <!-- Quality -->
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Quality</h3>
            <p class="text-gray-600">
              We maintain the highest standards in everything we do, from code quality to customer service and support.
            </p>
          </div>

          <!-- Collaboration -->
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Collaboration</h3>
            <p class="text-gray-600">
              We believe the best solutions come from working together with our clients, partners, and team members.
            </p>
          </div>

          <!-- Integrity -->
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Integrity</h3>
            <p class="text-gray-600">
              We operate with honesty, transparency, and ethical practices in all our business relationships.
            </p>
          </div>

          <!-- Customer Success -->
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Customer Success</h3>
            <p class="text-gray-600">
              Your success is our success. We're committed to helping you achieve your goals and overcome challenges.
            </p>
          </div>

          <!-- Continuous Learning -->
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.254 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Continuous Learning</h3>
            <p class="text-gray-600">
              We stay ahead of the curve by continuously learning and adapting to new technologies and industry trends.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Meet Our Team
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            The talented individuals behind our success
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Team Member 1 -->
          <div class="bg-white rounded-xl p-8 shadow-lg text-center">
            <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-2xl font-bold text-white">JD</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">John Doe</h3>
            <p class="text-blue-600 mb-4">CEO & Founder</p>
            <p class="text-gray-600">
              Visionary leader with 15+ years of experience in technology and business development.
            </p>
          </div>

          <!-- Team Member 2 -->
          <div class="bg-white rounded-xl p-8 shadow-lg text-center">
            <div class="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-2xl font-bold text-white">JS</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Jane Smith</h3>
            <p class="text-blue-600 mb-4">CTO</p>
            <p class="text-gray-600">
              Technical expert leading our engineering team and driving innovation across all products.
            </p>
          </div>

          <!-- Team Member 3 -->
          <div class="bg-white rounded-xl p-8 shadow-lg text-center">
            <div class="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-2xl font-bold text-white">MJ</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Mike Johnson</h3>
            <p class="text-blue-600 mb-4">Head of Product</p>
            <p class="text-gray-600">
              Product strategist focused on creating user-centric solutions that drive business value.
            </p>
          </div>

          <!-- Team Member 4 -->
          <div class="bg-white rounded-xl p-8 shadow-lg text-center">
            <div class="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-2xl font-bold text-white">SW</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Sarah Wilson</h3>
            <p class="text-blue-600 mb-4">Head of Customer Success</p>
            <p class="text-gray-600">
              Dedicated to ensuring every client achieves their goals and realizes maximum value.
            </p>
          </div>

          <!-- Team Member 5 -->
          <div class="bg-white rounded-xl p-8 shadow-lg text-center">
            <div class="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-2xl font-bold text-white">DB</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">David Brown</h3>
            <p class="text-blue-600 mb-4">Lead Developer</p>
            <p class="text-gray-600">
              Full-stack developer passionate about clean code and scalable architecture.
            </p>
          </div>

          <!-- Team Member 6 -->
          <div class="bg-white rounded-xl p-8 shadow-lg text-center">
            <div class="w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-2xl font-bold text-white">LM</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Lisa Martinez</h3>
            <p class="text-blue-600 mb-4">UX/UI Designer</p>
            <p class="text-gray-600">
              Creative designer focused on creating intuitive and beautiful user experiences.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-6">
          Ready to Work With Us?
        </h2>
        <p class="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
          Let's discuss how we can help transform your business with our innovative solutions.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/contact"
            class="inline-flex items-center px-8 py-4 text-lg font-semibold text-blue-900 bg-white rounded-lg hover:bg-gray-100 transition-all duration-300"
          >
            Get Started
            <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </router-link>
          <router-link
            to="/services"
            class="inline-flex items-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-lg hover:bg-white hover:text-blue-900 transition-all duration-300"
          >
            Our Services
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Component logic here
</script> 