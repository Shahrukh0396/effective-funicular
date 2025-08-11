<template>
  <div class="project-kanban-view">
    <ProjectKanbanBoard :project-id="projectId" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ProjectKanbanBoard from '@/components/ProjectKanbanBoard.vue'

const route = useRoute()

// Get project ID from route params
const projectId = computed(() => route.params.id)
</script>

<style scoped>
.project-kanban-view {
  @apply min-h-screen bg-gray-50;
}
</style> 