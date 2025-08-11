<template>
  <section class="features-section py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <div class="section-badge">
          <SparklesIcon class="w-4 h-4" />
          <span>Why Choose Us</span>
        </div>
        <h2 class="section-title">
          Powerful Features for 
          <span class="gradient-text">Modern Business</span>
        </h2>
        <p class="section-description">
          Our comprehensive platform offers everything you need to streamline your business operations 
          and achieve exceptional results.
        </p>
      </div>

      <!-- Features Grid -->
      <div class="features-grid">
        <div 
          v-for="(feature, index) in features" 
          :key="feature.id"
          class="feature-card"
          :class="`feature-${index + 1}`"
          @mouseenter="handleCardHover(index)"
          @mouseleave="handleCardLeave(index)"
        >
          <div class="card-content">
            <div class="card-icon">
              <component :is="feature.icon" class="w-8 h-8" />
            </div>
            <h3 class="card-title">{{ feature.title }}</h3>
            <p class="card-description">{{ feature.description }}</p>
            <ul class="card-features">
              <li v-for="item in feature.items" :key="item" class="feature-item">
                <CheckIcon class="w-4 h-4" />
                <span>{{ item }}</span>
              </li>
            </ul>
            <div class="card-action">
              <button class="learn-more-btn">
                Learn More
                <ArrowRightIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div class="card-background"></div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="cta-section text-center mt-16">
        <h3 class="cta-title">Ready to Get Started?</h3>
        <p class="cta-description">
          Join thousands of businesses that trust Linton Tech for their project management needs.
        </p>
        <div class="cta-actions">
          <button class="btn-primary btn-large">
            <span>Start Free Trial</span>
            <ArrowRightIcon class="w-5 h-5" />
          </button>
          <button class="btn-secondary btn-large">
            <span>Schedule Demo</span>
            <ArrowRightIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import {
  SparklesIcon,
  CheckIcon,
  ArrowRightIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  UsersIcon,
  ChartBarIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  CogIcon
} from '@heroicons/vue/24/outline'

const hoveredCard = ref(null)

const features = [
  {
    id: 1,
    icon: ClipboardDocumentListIcon,
    title: 'Project Management',
    description: 'Streamline your projects with our intuitive project management tools.',
    items: [
      'Task tracking and assignment',
      'Project timeline management',
      'Resource allocation',
      'Progress monitoring'
    ]
  },
  {
    id: 2,
    icon: ClockIcon,
    title: 'Time Tracking',
    description: 'Monitor productivity and bill accurately with our advanced time tracking system.',
    items: [
      'Automatic time tracking',
      'Billable hours calculation',
      'Time reports and analytics',
      'Integration with calendars'
    ]
  },
  {
    id: 3,
    icon: UsersIcon,
    title: 'Team Collaboration',
    description: 'Foster better teamwork with real-time communication tools and shared workspaces.',
    items: [
      'Real-time messaging',
      'File sharing and storage',
      'Team calendars',
      'Video conferencing'
    ]
  },
  {
    id: 4,
    icon: ChartBarIcon,
    title: 'Analytics & Reporting',
    description: 'Make data-driven decisions with comprehensive analytics and customizable reports.',
    items: [
      'Performance dashboards',
      'Custom report builder',
      'Data visualization',
      'Export capabilities'
    ]
  },
  {
    id: 5,
    icon: CreditCardIcon,
    title: 'Billing & Payments',
    description: 'Simplify your billing process with automated invoicing and payment tracking.',
    items: [
      'Automated invoicing',
      'Payment gateway integration',
      'Expense tracking',
      'Financial reporting'
    ]
  },
  {
    id: 6,
    icon: ShieldCheckIcon,
    title: 'Security & Compliance',
    description: 'Rest easy knowing your data is protected with enterprise-grade security.',
    items: [
      'End-to-end encryption',
      'GDPR compliance',
      'Regular security audits',
      'Data backup and recovery'
    ]
  }
]

const handleCardHover = (index) => {
  hoveredCard.value = index
}

const handleCardLeave = () => {
  hoveredCard.value = null
}
</script>

<style scoped>
.features-section {
  position: relative;
  overflow: hidden;
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

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-top: 48px;
}

.feature-card {
  position: relative;
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover .card-background {
  opacity: 1;
}

.card-content {
  position: relative;
  z-index: 10;
}

.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: white;
  transition: transform 0.3s ease;
}

.feature-card:hover .card-icon {
  transform: scale(1.1);
}

.feature-1 .card-icon { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.feature-2 .card-icon { background: linear-gradient(135deg, #10b981, #059669); }
.feature-3 .card-icon { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.feature-4 .card-icon { background: linear-gradient(135deg, #f59e0b, #d97706); }
.feature-5 .card-icon { background: linear-gradient(135deg, #ef4444, #dc2626); }
.feature-6 .card-icon { background: linear-gradient(135deg, #6366f1, #4f46e5); }

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
}

.card-description {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 20px;
}

.card-features {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  color: #374151;
  font-size: 14px;
}

.feature-item svg {
  color: #10b981;
  flex-shrink: 0;
}

.learn-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #3b82f6;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.learn-more-btn:hover {
  color: #2563eb;
  transform: translateX(4px);
}

.cta-section {
  margin-top: 80px;
  padding: 48px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.cta-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
}

.cta-description {
  color: #6b7280;
  font-size: 1.125rem;
  margin-bottom: 32px;
}

.cta-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-large {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: white;
  color: #3b82f6;
  border: 2px solid #3b82f6;
}

.btn-secondary:hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-2px);
}

/* Responsive design */
@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .feature-card {
    padding: 24px;
  }
  
  .cta-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-section {
    padding: 32px 24px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .features-section {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }
  
  .feature-card {
    background: #1f2937;
    border: 1px solid #374151;
  }
  
  .card-title {
    color: #f9fafb;
  }
  
  .card-description {
    color: #d1d5db;
  }
  
  .feature-item {
    color: #e5e7eb;
  }
  
  .cta-section {
    background: #1f2937;
    border: 1px solid #374151;
  }
  
  .cta-title {
    color: #f9fafb;
  }
  
  .cta-description {
    color: #d1d5db;
  }
  
  .btn-secondary {
    background: #374151;
    color: #f9fafb;
    border-color: #4b5563;
  }
  
  .btn-secondary:hover {
    background: #4b5563;
  }
}

/* Animation classes */
.feature-card {
  animation: fadeInUp 0.6s ease-out;
}

.feature-card:nth-child(1) { animation-delay: 0.1s; }
.feature-card:nth-child(2) { animation-delay: 0.2s; }
.feature-card:nth-child(3) { animation-delay: 0.3s; }
.feature-card:nth-child(4) { animation-delay: 0.4s; }
.feature-card:nth-child(5) { animation-delay: 0.5s; }
.feature-card:nth-child(6) { animation-delay: 0.6s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 