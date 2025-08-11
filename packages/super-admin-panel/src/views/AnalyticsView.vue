<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
        <p class="text-gray-600 mt-2">Comprehensive analytics and performance metrics</p>
      </div>
      <div class="flex space-x-2">
        <select class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
          <option>Last 6 Months</option>
          <option>Last Year</option>
        </select>
        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <span class="text-sm mr-2">📊</span>
          Export Report
        </button>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Revenue</p>
            <p class="text-3xl font-bold text-gray-900">$2.4M</p>
            <p class="text-sm text-green-600">+23% from last month</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">💰</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active Users</p>
            <p class="text-3xl font-bold text-gray-900">15.2K</p>
            <p class="text-sm text-green-600">+18% from last month</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">👥</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Conversion Rate</p>
            <p class="text-3xl font-bold text-gray-900">8.7%</p>
            <p class="text-sm text-green-600">+2.1% from last month</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">📈</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Avg. Session</p>
            <p class="text-3xl font-bold text-gray-900">24m</p>
            <p class="text-sm text-green-600">+12% from last month</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">⏱️</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Revenue Analytics -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-blue-500 rounded mr-3"></div>
              <span class="text-sm text-gray-700">White-Label Revenue</span>
            </div>
            <span class="text-sm font-semibold text-gray-900">$1.2M (50%)</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-purple-500 rounded mr-3"></div>
              <span class="text-sm text-gray-700">Standard Subscriptions</span>
            </div>
            <span class="text-sm font-semibold text-gray-900">$720K (30%)</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-green-500 rounded mr-3"></div>
              <span class="text-sm text-gray-700">Premium Features</span>
            </div>
            <span class="text-sm font-semibold text-gray-900">$360K (15%)</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
              <span class="text-sm text-gray-700">Other Services</span>
            </div>
            <span class="text-sm font-semibold text-gray-900">$120K (5%)</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Performing Vendors</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <span class="text-white text-xs font-medium">T</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">TechCorp Solutions</p>
                <p class="text-xs text-gray-500">45 clients</p>
              </div>
            </div>
            <span class="text-sm font-semibold text-green-600">$45,230</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                <span class="text-white text-xs font-medium">D</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Digital Dynamics</p>
                <p class="text-xs text-gray-500">32 clients</p>
              </div>
            </div>
            <span class="text-sm font-semibold text-green-600">$38,450</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                <span class="text-white text-xs font-medium">I</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Innovate Labs</p>
                <p class="text-xs text-gray-500">28 clients</p>
              </div>
            </div>
            <span class="text-sm font-semibold text-green-600">$32,180</span>
          </div>
        </div>
      </div>
    </div>

    <!-- User Analytics -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">New Users (This Month)</span>
            <span class="text-lg font-semibold text-green-600">2,847</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Active Users</span>
            <span class="text-lg font-semibold text-blue-600">15,234</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Retention Rate</span>
            <span class="text-lg font-semibold text-purple-600">87.3%</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Churn Rate</span>
            <span class="text-lg font-semibold text-red-600">2.1%</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">North America</span>
            <span class="text-sm font-semibold text-gray-900">45%</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Europe</span>
            <span class="text-sm font-semibold text-gray-900">32%</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Asia Pacific</span>
            <span class="text-sm font-semibold text-gray-900">18%</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Other</span>
            <span class="text-sm font-semibold text-gray-900">5%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Metrics -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span class="text-2xl">⚡</span>
          </div>
          <h4 class="text-sm font-medium text-gray-900">Uptime</h4>
          <p class="text-2xl font-bold text-green-600">99.9%</p>
          <p class="text-xs text-gray-500">Last 30 days</p>
        </div>
        <div class="text-center">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span class="text-2xl">🚀</span>
          </div>
          <h4 class="text-sm font-medium text-gray-900">Response Time</h4>
          <p class="text-2xl font-bold text-blue-600">142ms</p>
          <p class="text-xs text-gray-500">Average</p>
        </div>
        <div class="text-center">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span class="text-2xl">💾</span>
          </div>
          <h4 class="text-sm font-medium text-gray-900">Storage Used</h4>
          <p class="text-2xl font-bold text-purple-600">67%</p>
          <p class="text-xs text-gray-500">2.1TB / 3.2TB</p>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Analytics Events</h3>
      <div class="space-y-4">
        <div class="flex items-start space-x-3">
          <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
          <div>
            <p class="text-sm font-medium text-gray-900">Revenue milestone reached: $2.4M monthly</p>
            <p class="text-xs text-gray-500">2 hours ago</p>
          </div>
        </div>
        <div class="flex items-start space-x-3">
          <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          <div>
            <p class="text-sm font-medium text-gray-900">New user registration spike: +45%</p>
            <p class="text-xs text-gray-500">4 hours ago</p>
          </div>
        </div>
        <div class="flex items-start space-x-3">
          <div class="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
          <div>
            <p class="text-sm font-medium text-gray-900">White-label vendor performance improved</p>
            <p class="text-xs text-gray-500">6 hours ago</p>
          </div>
        </div>
        <div class="flex items-start space-x-3">
          <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
          <div>
            <p class="text-sm font-medium text-gray-900">System optimization completed</p>
            <p class="text-xs text-gray-500">8 hours ago</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Analytics logic can be added here
</script> 