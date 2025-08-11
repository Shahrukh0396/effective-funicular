<template>
  <section class="testimonials-section py-20 bg-white">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <div class="section-badge">
          <StarIcon class="w-4 h-4" />
          <span>What Our Clients Say</span>
        </div>
        <h2 class="section-title">
          Trusted by 
          <span class="gradient-text">Leading Companies</span>
        </h2>
        <p class="section-description">
          See how businesses are transforming their operations with Linton Tech
        </p>
      </div>

      <!-- Testimonials Carousel -->
      <div class="testimonials-container">
        <div class="testimonials-track" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
          <div 
            v-for="(testimonial, index) in testimonials" 
            :key="testimonial.id"
            class="testimonial-card"
          >
            <div class="testimonial-content">
              <div class="quote-icon">
                <ChatBubbleLeftRightIcon class="w-8 h-8" />
              </div>
              <p class="testimonial-text">{{ testimonial.text }}</p>
              <div class="testimonial-author">
                <div class="author-avatar">
                  <img :src="testimonial.avatar" :alt="testimonial.name" />
                </div>
                <div class="author-info">
                  <h4 class="author-name">{{ testimonial.name }}</h4>
                  <p class="author-title">{{ testimonial.title }}</p>
                  <p class="author-company">{{ testimonial.company }}</p>
                </div>
                <div class="rating">
                  <StarIcon 
                    v-for="star in 5" 
                    :key="star"
                    class="w-4 h-4"
                    :class="star <= testimonial.rating ? 'text-yellow-400' : 'text-gray-300'"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Dots -->
        <div class="carousel-dots">
          <button
            v-for="(testimonial, index) in testimonials"
            :key="testimonial.id"
            @click="goToSlide(index)"
            class="dot"
            :class="{ 'active': currentIndex === index }"
          ></button>
        </div>

        <!-- Navigation Arrows -->
        <button @click="previousSlide" class="nav-arrow nav-prev">
          <ChevronLeftIcon class="w-6 h-6" />
        </button>
        <button @click="nextSlide" class="nav-arrow nav-next">
          <ChevronRightIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Client Logos -->
      <div class="clients-section mt-16">
        <h3 class="clients-title">Trusted by Industry Leaders</h3>
        <div class="clients-grid">
          <div 
            v-for="client in clients" 
            :key="client.id"
            class="client-logo"
          >
            <img :src="client.logo" :alt="client.name" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  StarIcon,
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'

const currentIndex = ref(0)
let autoplayInterval = null

const testimonials = [
  {
    id: 1,
    text: "Linton Tech has completely transformed how we manage our projects. The platform is intuitive, powerful, and has helped us increase our productivity by 40%. The white-label solution allowed us to offer our own branded platform to our clients.",
    name: "Sarah Johnson",
    title: "CEO",
    company: "TechFlow Solutions",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    rating: 5
  },
  {
    id: 2,
    text: "The time tracking and billing features have streamlined our entire workflow. We've reduced administrative overhead by 60% and our clients love the transparency. The analytics dashboard provides insights we never had before.",
    name: "Michael Chen",
    title: "Operations Director",
    company: "Digital Dynamics",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5
  },
  {
    id: 3,
    text: "As a vendor partner, the white-label program has been a game-changer for our business. We can offer enterprise-grade solutions under our own brand, and the revenue sharing model is incredibly fair. Highly recommended!",
    name: "Emily Rodriguez",
    title: "Founder",
    company: "Innovate Labs",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5
  },
  {
    id: 4,
    text: "The security and compliance features give us peace of mind when handling sensitive client data. The platform is rock-solid, and the support team is incredibly responsive. It's like having an extension of our own team.",
    name: "David Thompson",
    title: "CTO",
    company: "Secure Systems Inc",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5
  }
]

const clients = [
  { id: 1, name: "TechCorp", logo: "https://via.placeholder.com/120x60/3b82f6/ffffff?text=TechCorp" },
  { id: 2, name: "InnovateCo", logo: "https://via.placeholder.com/120x60/8b5cf6/ffffff?text=InnovateCo" },
  { id: 3, name: "DigitalFlow", logo: "https://via.placeholder.com/120x60/10b981/ffffff?text=DigitalFlow" },
  { id: 4, name: "FutureTech", logo: "https://via.placeholder.com/120x60/f59e0b/ffffff?text=FutureTech" },
  { id: 5, name: "SmartSystems", logo: "https://via.placeholder.com/120x60/ef4444/ffffff?text=SmartSystems" },
  { id: 6, name: "CloudWorks", logo: "https://via.placeholder.com/120x60/6366f1/ffffff?text=CloudWorks" }
]

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % testimonials.length
}

const previousSlide = () => {
  currentIndex.value = currentIndex.value === 0 
    ? testimonials.length - 1 
    : currentIndex.value - 1
}

const goToSlide = (index) => {
  currentIndex.value = index
}

const startAutoplay = () => {
  autoplayInterval = setInterval(nextSlide, 5000)
}

const stopAutoplay = () => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
  }
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<style scoped>
.testimonials-section {
  position: relative;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  padding: 8px 16px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
}

.section-title {
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 16px;
  line-height: 1.2;
}

.section-description {
  font-size: 1.125rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.testimonials-container {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  overflow: hidden;
}

.testimonials-track {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.testimonial-card {
  min-width: 100%;
  padding: 0 20px;
}

.testimonial-content {
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
  position: relative;
  transition: all 0.3s ease;
}

.testimonial-content:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.quote-icon {
  position: absolute;
  top: -20px;
  left: 40px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.testimonial-text {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #374151;
  margin-bottom: 32px;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 16px;
}

.author-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-info {
  flex: 1;
}

.author-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.author-title {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 2px 0;
}

.author-company {
  font-size: 0.875rem;
  color: #3b82f6;
  font-weight: 600;
  margin: 0;
}

.rating {
  display: flex;
  gap: 2px;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #d1d5db;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot.active {
  background: #3b82f6;
  transform: scale(1.2);
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.nav-arrow:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  transform: translateY(-50%) scale(1.1);
}

.nav-prev {
  left: -24px;
}

.nav-next {
  right: -24px;
}

.clients-section {
  text-align: center;
}

.clients-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 32px;
}

.clients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 32px;
  max-width: 800px;
  margin: 0 auto;
}

.client-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.client-logo:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.client-logo img {
  max-width: 100%;
  height: auto;
  filter: grayscale(100%);
  transition: filter 0.3s ease;
}

.client-logo:hover img {
  filter: grayscale(0%);
}

/* Responsive design */
@media (max-width: 768px) {
  .testimonial-content {
    padding: 32px 24px;
  }
  
  .nav-arrow {
    display: none;
  }
  
  .clients-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .testimonial-content {
    background: #1f2937;
    border-color: #374151;
  }
  
  .testimonial-text {
    color: #e5e7eb;
  }
  
  .author-name {
    color: #f9fafb;
  }
  
  .author-title {
    color: #9ca3af;
  }
  
  .clients-title {
    color: #f9fafb;
  }
  
  .client-logo {
    background: #1f2937;
    border: 1px solid #374151;
  }
  
  .nav-arrow {
    background: #1f2937;
    border-color: #374151;
    color: #9ca3af;
  }
  
  .nav-arrow:hover {
    background: #3b82f6;
    color: white;
  }
}

/* Animation classes */
.testimonial-card {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 