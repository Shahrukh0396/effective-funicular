<template>
  <section class="pricing-section py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <div class="section-badge">
          <CurrencyDollarIcon class="w-4 h-4" />
          <span>Simple Pricing</span>
        </div>
        <h2 class="section-title">
          Choose the Perfect 
          <span class="gradient-text">Plan for You</span>
        </h2>
        <p class="section-description">
          Start with our free plan and scale as your business grows. All plans include our core features.
        </p>
        
        <!-- Billing Toggle -->
        <div class="billing-toggle mt-8">
          <span class="toggle-label">Monthly</span>
          <button 
            @click="toggleBilling"
            class="toggle-button"
            :class="{ 'active': isAnnual }"
          >
            <div class="toggle-slider"></div>
          </button>
          <span class="toggle-label">
            Annual
            <span class="save-badge">Save 20%</span>
          </span>
        </div>
      </div>

      <!-- Pricing Cards -->
      <div class="pricing-grid">
        <div 
          v-for="plan in plans" 
          :key="plan.id"
          class="pricing-card"
          :class="{ 'featured': plan.featured }"
        >
          <div class="card-header">
            <div class="plan-badge" v-if="plan.featured">
              <StarIcon class="w-4 h-4" />
              <span>Most Popular</span>
            </div>
            <h3 class="plan-name">{{ plan.name }}</h3>
            <p class="plan-description">{{ plan.description }}</p>
            <div class="plan-price">
              <span class="currency">$</span>
              <span class="amount">{{ getPrice(plan) }}</span>
              <span class="period">/{{ isAnnual ? 'year' : 'month' }}</span>
            </div>
          </div>

          <div class="card-features">
            <ul class="features-list">
              <li 
                v-for="feature in plan.features" 
                :key="feature"
                class="feature-item"
              >
                <CheckIcon class="w-5 h-5" />
                <span>{{ feature }}</span>
              </li>
            </ul>
          </div>

          <div class="card-action">
            <button 
              class="plan-button"
              :class="{ 'featured': plan.featured }"
            >
              {{ plan.buttonText }}
              <ArrowRightIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="faq-section mt-20">
        <h3 class="faq-title">Frequently Asked Questions</h3>
        <div class="faq-grid">
          <div 
            v-for="faq in faqs" 
            :key="faq.id"
            class="faq-item"
            @click="toggleFaq(faq.id)"
          >
            <div class="faq-header">
              <h4 class="faq-question">{{ faq.question }}</h4>
              <ChevronDownIcon 
                class="w-5 h-5 faq-icon"
                :class="{ 'rotated': openFaq === faq.id }"
              />
            </div>
            <div 
              class="faq-answer"
              :class="{ 'open': openFaq === faq.id }"
            >
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  CurrencyDollarIcon,
  StarIcon,
  CheckIcon,
  ArrowRightIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'

const isAnnual = ref(false)
const openFaq = ref(null)

const plans = [
  {
    id: 1,
    name: 'Starter',
    description: 'Perfect for small teams and startups',
    monthlyPrice: 29,
    annualPrice: 279,
    features: [
      'Up to 5 team members',
      'Basic project management',
      'Time tracking',
      'Email support',
      '1GB storage',
      'Basic reporting'
    ],
    buttonText: 'Start Free Trial',
    featured: false
  },
  {
    id: 2,
    name: 'Professional',
    description: 'Ideal for growing businesses',
    monthlyPrice: 79,
    annualPrice: 759,
    features: [
      'Up to 25 team members',
      'Advanced project management',
      'Time tracking & billing',
      'Priority support',
      '10GB storage',
      'Advanced analytics',
      'Custom integrations',
      'White-label options'
    ],
    buttonText: 'Start Free Trial',
    featured: true
  },
  {
    id: 3,
    name: 'Enterprise',
    description: 'For large organizations',
    monthlyPrice: 199,
    annualPrice: 1919,
    features: [
      'Unlimited team members',
      'Enterprise project management',
      'Advanced time tracking',
      '24/7 phone support',
      'Unlimited storage',
      'Custom reporting',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced security'
    ],
    buttonText: 'Contact Sales',
    featured: false
  }
]

const faqs = [
  {
    id: 1,
    question: 'Can I change my plan at any time?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle.'
  },
  {
    id: 2,
    question: 'Is there a free trial available?',
    answer: 'Yes, all plans come with a 14-day free trial. No credit card required to start your trial.'
  },
  {
    id: 3,
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. Enterprise customers can also pay by invoice.'
  },
  {
    id: 4,
    question: 'Do you offer discounts for nonprofits?',
    answer: 'Yes, we offer special pricing for qualified nonprofits and educational institutions. Contact our sales team for more information.'
  },
  {
    id: 5,
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access to your account until the end of your current billing period.'
  },
  {
    id: 6,
    question: 'What kind of support do you provide?',
    answer: 'We provide email support for all plans, priority support for Professional plans, and 24/7 phone support for Enterprise customers.'
  }
]

const getPrice = (plan) => {
  return isAnnual.value ? plan.annualPrice : plan.monthlyPrice
}

const toggleBilling = () => {
  isAnnual.value = !isAnnual.value
}

const toggleFaq = (id) => {
  openFaq.value = openFaq.value === id ? null : id
}
</script>

<style scoped>
.pricing-section {
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

.billing-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
}

.toggle-label {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-badge {
  background: #10b981;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.toggle-button {
  position: relative;
  width: 48px;
  height: 24px;
  background: #d1d5db;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-button.active {
  background: #3b82f6;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.toggle-button.active .toggle-slider {
  transform: translateX(24px);
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 48px;
}

.pricing-card {
  position: relative;
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.pricing-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.pricing-card.featured {
  border-color: #3b82f6;
  transform: scale(1.05);
}

.pricing-card.featured:hover {
  transform: scale(1.05) translateY(-8px);
}

.plan-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.plan-description {
  color: #6b7280;
  margin-bottom: 24px;
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.currency {
  font-size: 1.5rem;
  font-weight: 600;
  color: #6b7280;
}

.amount {
  font-size: 3rem;
  font-weight: 800;
  color: #1f2937;
  line-height: 1;
}

.period {
  font-size: 1rem;
  color: #6b7280;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  color: #374151;
  font-size: 14px;
}

.feature-item svg {
  color: #10b981;
  flex-shrink: 0;
}

.plan-button {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 2px solid #e5e7eb;
  background: white;
  color: #374151;
}

.plan-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.plan-button.featured {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border-color: #3b82f6;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.3);
}

.plan-button.featured:hover {
  box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.4);
}

.faq-section {
  text-align: center;
}

.faq-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 32px;
}

.faq-grid {
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  gap: 16px;
}

.faq-item {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.faq-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.faq-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
}

.faq-question {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  text-align: left;
}

.faq-icon {
  color: #6b7280;
  transition: transform 0.3s ease;
}

.faq-icon.rotated {
  transform: rotate(180deg);
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  padding: 0 24px;
}

.faq-answer.open {
  max-height: 200px;
  padding: 0 24px 24px;
}

.faq-answer p {
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .pricing-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .pricing-card.featured {
    transform: none;
  }
  
  .pricing-card.featured:hover {
    transform: translateY(-8px);
  }
  
  .billing-toggle {
    flex-direction: column;
    gap: 12px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .pricing-section {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }
  
  .pricing-card {
    background: #1f2937;
    border-color: #374151;
  }
  
  .plan-name {
    color: #f9fafb;
  }
  
  .amount {
    color: #f9fafb;
  }
  
  .feature-item {
    color: #e5e7eb;
  }
  
  .plan-button {
    background: #374151;
    color: #f9fafb;
    border-color: #4b5563;
  }
  
  .faq-item {
    background: #1f2937;
    border-color: #374151;
  }
  
  .faq-question {
    color: #f9fafb;
  }
  
  .faq-answer p {
    color: #d1d5db;
  }
  
  .faq-title {
    color: #f9fafb;
  }
}

/* Animation classes */
.pricing-card {
  animation: fadeInUp 0.6s ease-out;
}

.pricing-card:nth-child(1) { animation-delay: 0.1s; }
.pricing-card:nth-child(2) { animation-delay: 0.2s; }
.pricing-card:nth-child(3) { animation-delay: 0.3s; }

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