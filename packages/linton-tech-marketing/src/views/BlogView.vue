<template>
  <div class="min-h-screen bg-white">
    <!-- Navigation -->
    <Navigation />

    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Linton Tech
            <span class="gradient-text">Blog</span>
          </h1>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Insights, tips, and updates from our team on project management, 
            business solutions, and industry trends.
          </p>
        </div>
      </div>
    </section>

    <!-- Blog Posts -->
    <section class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Featured Post -->
        <div class="mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-8">Featured Post</h2>
          <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div class="md:flex">
              <div class="md:w-1/2">
                <div class="h-64 md:h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <DocumentTextIcon class="w-24 h-24 text-white opacity-80" />
                </div>
              </div>
              <div class="md:w-1/2 p-8">
                <div class="flex items-center text-sm text-gray-500 mb-4">
                  <CalendarIcon class="w-4 h-4 mr-2" />
                  <span>December 15, 2024</span>
                  <span class="mx-2">•</span>
                  <span>5 min read</span>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-4">
                  The Future of Project Management: AI-Powered Solutions
                </h3>
                <p class="text-gray-600 mb-6 leading-relaxed">
                  Discover how artificial intelligence is revolutionizing project management 
                  and how businesses can leverage these technologies to improve efficiency, 
                  reduce costs, and deliver better results.
                </p>
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span class="text-white font-semibold">LT</span>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-900">Linton Tech Team</p>
                      <p class="text-sm text-gray-500">Project Management Experts</p>
                    </div>
                  </div>
                  <button class="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    Read More →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Posts -->
        <div>
          <h2 class="text-3xl font-bold text-gray-900 mb-8">Recent Posts</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <article 
              v-for="post in blogPosts" 
              :key="post.id"
              class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div class="h-48 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <component :is="post.icon" class="w-16 h-16 text-white opacity-80" />
              </div>
              <div class="p-6">
                <div class="flex items-center text-sm text-gray-500 mb-3">
                  <CalendarIcon class="w-4 h-4 mr-2" />
                  <span>{{ post.date }}</span>
                  <span class="mx-2">•</span>
                  <span>{{ post.readTime }}</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">
                  {{ post.title }}
                </h3>
                <p class="text-gray-600 mb-4 leading-relaxed">
                  {{ post.excerpt }}
                </p>
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span class="text-white text-xs font-semibold">LT</span>
                    </div>
                    <span class="ml-2 text-sm text-gray-500">{{ post.author }}</span>
                  </div>
                  <button class="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
                    Read More →
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>

        <!-- Newsletter Signup -->
        <div class="mt-20">
          <div class="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
            <h3 class="text-2xl font-bold mb-4">Stay Updated</h3>
            <p class="text-blue-100 mb-6 max-w-2xl mx-auto">
              Get the latest insights, tips, and updates delivered directly to your inbox. 
              Join thousands of professionals who trust Linton Tech for their project management needs.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                class="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button class="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <p>&copy; 2024 Linton Tech. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import Navigation from '@/components/Navigation.vue'
import {
  DocumentTextIcon,
  CalendarIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  LightBulbIcon
} from '@heroicons/vue/24/outline'

const blogPosts = [
  {
    id: 1,
    title: '10 Essential Project Management Tools for 2024',
    excerpt: 'Discover the most effective project management tools that will help your team collaborate better and deliver projects on time.',
    date: 'December 10, 2024',
    readTime: '4 min read',
    author: 'Sarah Johnson',
    icon: ChartBarIcon
  },
  {
    id: 2,
    title: 'Building High-Performing Remote Teams',
    excerpt: 'Learn the strategies and best practices for managing remote teams effectively and maintaining productivity across distributed workforces.',
    date: 'December 8, 2024',
    readTime: '6 min read',
    author: 'Mike Chen',
    icon: UsersIcon
  },
  {
    id: 3,
    title: 'Automation in Project Management: What You Need to Know',
    excerpt: 'Explore how automation can streamline your project management processes and free up time for strategic thinking.',
    date: 'December 5, 2024',
    readTime: '5 min read',
    author: 'Emily Rodriguez',
    icon: CogIcon
  },
  {
    id: 4,
    title: 'Security Best Practices for Project Management Platforms',
    excerpt: 'Ensure your project data is protected with these essential security practices for modern project management tools.',
    date: 'December 3, 2024',
    readTime: '7 min read',
    author: 'David Kim',
    icon: ShieldCheckIcon
  },
  {
    id: 5,
    title: 'Scaling Your Business with White Label Solutions',
    excerpt: 'How white label project management solutions can help your business scale faster and serve more clients effectively.',
    date: 'November 30, 2024',
    readTime: '5 min read',
    author: 'Lisa Thompson',
    icon: RocketLaunchIcon
  },
  {
    id: 6,
    title: 'Innovation in Time Tracking: Beyond Traditional Methods',
    excerpt: 'Discover cutting-edge time tracking technologies that go beyond simple start/stop timers to provide deeper insights.',
    date: 'November 28, 2024',
    readTime: '4 min read',
    author: 'Alex Wong',
    icon: LightBulbIcon
  }
]
</script> 