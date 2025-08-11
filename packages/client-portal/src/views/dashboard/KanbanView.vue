<template>
  <div class="kanban-view">
    <KanbanBoard />
  </div>
</template>

<script setup>
import KanbanBoard from '@/components/KanbanBoard.vue'
</script>

<style scoped>
.kanban-view {
  @apply min-h-screen bg-gray-50;
}
</style> 