<template>
  <div class="overflow-x-auto">
    <table class="min-w-full bg-white rounded-lg shadow">
      <thead>
        <tr>
          <th class="px-4 py-2">Feature</th>
          <th class="px-4 py-2">Basic</th>
          <th class="px-4 py-2">Pro</th>
          <th class="px-4 py-2">Enterprise</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="feature in features" :key="feature.name">
          <td class="border px-4 py-2">{{ feature.name }}</td>
          <td class="border px-4 py-2 text-center">
            <span v-if="feature.basic">✔️</span>
          </td>
          <td class="border px-4 py-2 text-center">
            <span v-if="feature.pro">✔️</span>
          </td>
          <td class="border px-4 py-2 text-center">
            <span v-if="feature.enterprise">✔️</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const features = [
  { name: 'Project Management', basic: true, pro: true, enterprise: true },
  { name: 'Time Tracking', basic: true, pro: true, enterprise: true },
  { name: 'Advanced Analytics', basic: false, pro: true, enterprise: true },
  { name: 'Custom Integrations', basic: false, pro: false, enterprise: true },
  { name: 'Priority Support', basic: false, pro: true, enterprise: true },
  { name: 'White-labeling', basic: false, pro: false, enterprise: true }
]
</script> 