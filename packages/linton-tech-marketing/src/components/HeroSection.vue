<template>
  <section class="hero-section relative overflow-hidden">
    <!-- Animated background -->
    <div class="hero-background">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
      </div>
      <div class="gradient-overlay"></div>
    </div>

    <!-- Content -->
    <div class="hero-content">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen">
          <!-- Left Column - Text Content -->
          <div class="hero-text space-y-8">
            <!-- Badge -->
            <div class="hero-badge">
              <SparklesIcon class="w-4 h-4" />
              <span>Enterprise Platform</span>
            </div>

            <!-- Main Heading -->
            <h1 class="hero-title">
              Transform Your Business with
              <span class="gradient-text">Smart Solutions</span>
            </h1>

            <!-- Description -->
            <p class="hero-description">
              Linton Tech provides cutting-edge project management and business solutions. 
              Whether you're a client looking for efficient project delivery or a vendor seeking 
              white-label opportunities, we have the perfect solution for you.
            </p>

            <!-- CTA Buttons -->
            <div class="hero-actions">
              <button class="btn-primary btn-large">
                <span>Explore Solutions</span>
                <ArrowRightIcon class="w-5 h-5" />
              </button>
              <button class="btn-secondary btn-large">
                <span>White Label Program</span>
                <ArrowRightIcon class="w-5 h-5" />
              </button>
            </div>

            <!-- Stats -->
            <div class="hero-stats">
              <div class="stat-item">
                <div class="stat-number">500+</div>
                <div class="stat-label">Happy Clients</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">50+</div>
                <div class="stat-label">Vendors</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">99.9%</div>
                <div class="stat-label">Uptime</div>
              </div>
            </div>
          </div>

          <!-- Right Column - Visual Elements -->
          <div class="hero-visual">
            <div class="floating-card">
              <div class="card-header">
                <div class="card-icon">
                  <BuildingOfficeIcon class="w-8 h-8" />
                </div>
                <h3 class="card-title">Platform Features</h3>
              </div>
              
              <div class="feature-list">
                <div class="feature-item" v-for="(feature, index) in features" :key="index">
                  <div class="feature-icon" :class="`feature-${index + 1}`">
                    <component :is="feature.icon" class="w-5 h-5" />
                  </div>
                  <span class="feature-text">{{ feature.text }}</span>
                  <div class="feature-status"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="scroll-indicator">
      <div class="scroll-arrow"></div>
      <span class="scroll-text">Scroll to explore</span>
    </div>
  </section>
</template>

<script setup>
import {
  SparklesIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

const features = [
  { icon: ClipboardDocumentListIcon, text: 'Project Management' },
  { icon: ClockIcon, text: 'Time Tracking' },
  { icon: UsersIcon, text: 'Team Collaboration' },
  { icon: ChartBarIcon, text: 'Analytics & Reporting' }
]
</script>

<style scoped>
.hero-section {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  top: 30%;
  right: 30%;
  animation-delay: 4s;
}

.shape-4 {
  width: 120px;
  height: 120px;
  bottom: 20%;
  left: 20%;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
}

.hero-content {
  position: relative;
  z-index: 10;
  width: 100%;
}

.hero-text {
  color: white;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 12px 20px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  animation: slideInUp 0.8s ease-out;
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  animation: slideInUp 0.8s ease-out 0.2s both;
}

.hero-description {
  font-size: clamp(1.1rem, 2vw, 1.25rem);
  line-height: 1.6;
  opacity: 0.9;
  margin-bottom: 32px;
  animation: slideInUp 0.8s ease-out 0.4s both;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 48px;
  animation: slideInUp 0.8s ease-out 0.6s both;
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
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.hero-stats {
  display: flex;
  gap: 32px;
  animation: slideInUp 0.8s ease-out 0.8s both;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
  animation: slideInRight 0.8s ease-out 0.4s both;
}

.floating-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 32px;
  max-width: 400px;
  width: 100%;
  animation: float 6s ease-in-out infinite;
}

.card-header {
  text-align: center;
  margin-bottom: 24px;
}

.card-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.feature-list {
  space-y: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  color: white;
  font-weight: 500;
}

.feature-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.feature-1 { background: linear-gradient(135deg, #10b981, #059669); }
.feature-2 { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.feature-3 { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.feature-4 { background: linear-gradient(135deg, #f59e0b, #d97706); }

.feature-text {
  flex: 1;
  font-size: 14px;
}

.feature-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse 2s ease-in-out infinite;
}

.scroll-indicator {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  animation: fadeIn 1s ease-out 1s both;
}

.scroll-arrow {
  width: 2px;
  height: 24px;
  background: currentColor;
  border-radius: 1px;
  animation: scrollBounce 2s ease-in-out infinite;
}

.scroll-text {
  font-size: 12px;
  font-weight: 500;
}

@keyframes scrollBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Responsive design */
@media (max-width: 768px) {
  .hero-actions {
    flex-direction: column;
  }
  
  .hero-stats {
    justify-content: space-around;
  }
  
  .floating-card {
    margin: 0 16px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .hero-background {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  }
}
</style> 