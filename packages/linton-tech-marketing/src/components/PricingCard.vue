<template>
  <div 
    class="pricing-card"
    :class="[
      { 'pricing-card-featured': featured },
      { 'pricing-card-popular': popular }
    ]"
  >
    <div class="pricing-header">
      <div v-if="popular" class="popular-badge">
        <StarIcon class="w-4 h-4" />
        Most Popular
      </div>
      
      <h3 class="pricing-title">{{ title }}</h3>
      <p class="pricing-description">{{ description }}</p>
      
      <div class="pricing-price">
        <span class="price-currency">$</span>
        <span class="price-amount">{{ price }}</span>
        <span class="price-period">/{{ period }}</span>
      </div>
    </div>

    <div class="pricing-features">
      <ul class="features-list">
        <li 
          v-for="feature in features" 
          :key="feature"
          class="feature-item"
        >
          <CheckIcon class="feature-icon" />
          <span>{{ feature }}</span>
        </li>
      </ul>
    </div>

    <div class="pricing-actions">
      <button 
        @click="handleSelect"
        class="pricing-button"
        :class="{ 'pricing-button-featured': featured }"
      >
        {{ buttonText }}
      </button>
    </div>

    <div v-if="additionalInfo" class="pricing-additional">
      <p class="additional-text">{{ additionalInfo }}</p>
    </div>
  </div>
</template>

<script setup>
import { CheckIcon, StarIcon } from '@heroicons/vue/24/outline'
import { useToast } from '@/composables/useToast'

const { success } = useToast()

defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: [String, Number],
    required: true
  },
  period: {
    type: String,
    default: 'month'
  },
  features: {
    type: Array,
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  popular: {
    type: Boolean,
    default: false
  },
  buttonText: {
    type: String,
    default: 'Get Started'
  },
  additionalInfo: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select'])

const handleSelect = () => {
  success('Plan selected! Redirecting to checkout...')
  emit('select')
}
</script>

<style scoped>
.pricing-card {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 2px solid #e5e7eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.pricing-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.pricing-card-featured {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
}

.pricing-card-popular {
  border-color: #8b5cf6;
  background: linear-gradient(135deg, #faf5ff 0%, #e0e7ff 100%);
  transform: scale(1.05);
}

.pricing-card-popular::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
}

.popular-badge {
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
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.pricing-header {
  text-align: center;
  margin-bottom: 32px;
}

.pricing-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.pricing-description {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 24px;
  line-height: 1.5;
}

.pricing-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.price-currency {
  font-size: 20px;
  font-weight: 600;
  color: #6b7280;
}

.price-amount {
  font-size: 48px;
  font-weight: 800;
  color: #1f2937;
  line-height: 1;
}

.price-period {
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
}

.pricing-features {
  margin-bottom: 32px;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
}

.feature-icon {
  width: 20px;
  height: 20px;
  color: #10b981;
  flex-shrink: 0;
}

.pricing-actions {
  margin-bottom: 16px;
}

.pricing-button {
  width: 100%;
  padding: 16px 24px;
  border: 2px solid #3b82f6;
  background: white;
  color: #3b82f6;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pricing-button:hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.3);
}

.pricing-button-featured {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border-color: transparent;
}

.pricing-button-featured:hover {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.4);
}

.pricing-additional {
  text-align: center;
}

.additional-text {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
  line-height: 1.4;
}

/* Responsive design */
@media (max-width: 768px) {
  .pricing-card {
    padding: 24px;
  }
  
  .pricing-card-popular {
    transform: none;
  }
  
  .price-amount {
    font-size: 36px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .pricing-card {
    background: #1f2937;
    border-color: #374151;
  }
  
  .pricing-card-featured {
    background: linear-gradient(135deg, #1f2937 0%, #312e81 100%);
  }
  
  .pricing-card-popular {
    background: linear-gradient(135deg, #1f2937 0%, #312e81 100%);
  }
  
  .pricing-title {
    color: #f9fafb;
  }
  
  .price-amount {
    color: #f9fafb;
  }
  
  .feature-item {
    color: #d1d5db;
  }
  
  .pricing-button {
    background: #374151;
    color: #f9fafb;
    border-color: #4b5563;
  }
  
  .pricing-button:hover {
    background: #4b5563;
  }
  
  .pricing-button-featured {
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  }
}
</style> 