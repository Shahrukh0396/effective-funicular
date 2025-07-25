<template>
  <div>
    <section class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-5xl font-bold mb-4">Grow Your Business with Linton</h1>
        <p class="text-xl mb-8">All-in-one multi-tenant SaaS platform for project management, collaboration, and growth.</p>
        <a href="#lead-capture" class="bg-white text-indigo-700 px-8 py-3 rounded-lg font-semibold shadow hover:bg-gray-100 transition">Get Started Free</a>
      </div>
    </section>
    <ServiceShowcase />
    <PricingCalculator />
    <FeatureComparison />
    <CaseStudies />
    <section id="lead-capture" class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <LeadCaptureForm />
      </div>
    </section>
    <section class="py-8 bg-white">
      <div class="container mx-auto px-4">
        <NewsletterSignup />
      </div>
    </section>
  </div>
</template>

<script setup>
import ServiceShowcase from '@/components/ServiceShowcase.vue'
import PricingCalculator from '@/components/PricingCalculator.vue'
import FeatureComparison from '@/components/FeatureComparison.vue'
import CaseStudies from '@/components/CaseStudies.vue'
import LeadCaptureForm from '@/components/LeadCaptureForm.vue'
import NewsletterSignup from '@/components/NewsletterSignup.vue'
</script>