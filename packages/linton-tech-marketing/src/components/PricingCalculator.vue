<template>
  <section id="pricing" class="py-20 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Dynamic Pricing Calculator</h2>
        <p class="text-lg text-gray-600">Calculate your custom pricing based on your needs</p>
      </div>
      
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <div class="grid md:grid-cols-2 gap-8 mb-8">
            <!-- Calculator Inputs -->
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Number of Users</label>
                <input 
                  v-model.number="calculator.users" 
                  type="number" 
                  min="1" 
                  max="1000"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Plan Type</label>
                <select 
                  v-model="calculator.plan" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="basic">Basic</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Contract Length</label>
                <select 
                  v-model="calculator.contract" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual (20% discount)</option>
                  <option value="biennial">Biennial (30% discount)</option>
                </select>
              </div>
              
              <div class="space-y-3">
                <label class="block text-sm font-medium text-gray-700 mb-2">Additional Features</label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input 
                      v-model="calculator.features.whiteLabel" 
                      type="checkbox" 
                      class="mr-2"
                    />
                    <span class="text-sm">White-Label Solution</span>
                  </label>
                  <label class="flex items-center">
                    <input 
                      v-model="calculator.features.api" 
                      type="checkbox" 
                      class="mr-2"
                    />
                    <span class="text-sm">API Access</span>
                  </label>
                  <label class="flex items-center">
                    <input 
                      v-model="calculator.features.support" 
                      type="checkbox" 
                      class="mr-2"
                    />
                    <span class="text-sm">Priority Support</span>
                  </label>
                  <label class="flex items-center">
                    <input 
                      v-model="calculator.features.customization" 
                      type="checkbox" 
                      class="mr-2"
                    />
                    <span class="text-sm">Custom Development</span>
                  </label>
                </div>
              </div>
            </div>
            
            <!-- Price Display -->
            <div class="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-6 text-white">
              <h3 class="text-xl font-semibold mb-4">Your Custom Price</h3>
              <div class="space-y-4">
                <div class="text-center">
                  <div class="text-4xl font-bold">${{ calculatedPrice.monthly }}/mo</div>
                  <div class="text-sm opacity-90">Monthly</div>
                </div>
                
                <div class="border-t border-white/20 pt-4">
                  <div class="flex justify-between text-sm">
                    <span>Base Plan:</span>
                    <span>${{ basePrice }}/mo</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span>Users ({{ calculator.users }}):</span>
                    <span>${{ userCost }}/mo</span>
                  </div>
                  <div v-if="featureCost > 0" class="flex justify-between text-sm">
                    <span>Additional Features:</span>
                    <span>${{ featureCost }}/mo</span>
                  </div>
                  <div v-if="discount > 0" class="flex justify-between text-sm text-green-300">
                    <span>Contract Discount:</span>
                    <span>-${{ discount }}/mo</span>
                  </div>
                </div>
                
                <div class="text-center pt-4">
                  <button 
                    @click="requestQuote"
                    class="w-full bg-white text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Get Custom Quote
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
  
Certainly! Here is the last complete line from my previous response, followed by the continuation:

```vue:packages/linton-tech-marketing/src/components/PricingCalculator.vue
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const calculator = ref({
  users: 10,
  plan: 'basic',
  contract: 'monthly',
  features: {
    whiteLabel: false,
    api: false,
    support: false,
    customization: false
  }
})

const basePrices = {
  basic: 49,
  professional: 99,
  enterprise: 199
}

const userPrices = {
  basic: 4,
  professional: 3,
  enterprise: 2
}

const featurePrices = {
  whiteLabel: 50,
  api: 30,
  support: 40,
  customization: 100
}

const contractDiscounts = {
  monthly: 0,
  annual: 0.2,
  biennial: 0.3
}

const basePrice = computed(() => basePrices[calculator.value.plan])
const userCost = computed(() => calculator.value.users * userPrices[calculator.value.plan])
const featureCost = computed(() =>
  Object.entries(calculator.value.features)
    .filter(([_, v]) => v)
    .reduce((sum, [k]) => sum + featurePrices[k], 0)
)
const discount = computed(() => {
  const subtotal = basePrice.value + userCost.value + featureCost.value
  return Math.round(subtotal * contractDiscounts[calculator.value.contract])
})
const calculatedPrice = computed(() => {
  const subtotal = basePrice.value + userCost.value + featureCost.value
  return {
    monthly: subtotal - discount.value
  }
})

function requestQuote() {
  alert('Thank you! Our team will contact you with a custom quote.')
}
</script>
```

---

**Let me know if you want the next component (e.g., FeatureComparison.vue) or further integration steps!** 