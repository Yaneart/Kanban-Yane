<script setup lang="ts">
import type { Card } from '@/types'

const props = defineProps<{
  card: Card
}>()

function formaterDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString()
}
</script>

<template>
  <div :class="['kanban-card', card.priority]">
    <h4>{{ card.title }}</h4>
    <div v-if="card.tags?.length" class="card-tags">
      <span
        v-for="tag in card.tags"
        :key="tag.id"
        class="card-tag"
        :style="{ background: tag.color }"
      >
        {{ tag.name }}
      </span>
    </div>
    <p v-if="card.description">
      {{ card.description }}
    </p>
    <p v-if="card.deadline" :class="{ overdue: card.deadline < Date.now() }" class="deadline">
      {{ formaterDate(card.deadline) }}
    </p>
    <div :class="['priority-dot', card.priority]"></div>
    <div v-if="card.subtask?.length" class="subtasks">
      <span class="subtasks-progress">
        {{ card.subtask.filter((s) => s.done).length }}/{{ card.subtask.length }}
      </span>
      <label v-for="sub in card.subtask" :key="sub.id" class="subtask-item">
        <span :class="{ done: sub.done }">{{ sub.text }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.kanban-card {
  position: relative;
  background: var(--bg-card);
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px var(--shadow);
  border-left: 4px solid;
  cursor: grab;
  transition:
    box-shadow 0.2s,
    transform 0.15s;
}

.kanban-card:hover {
  box-shadow: 0 4px 12px var(--shadow-hover);
  transform: translateY(-1px);
  background: var(--bg-card-hover);
}

.kanban-card.low {
  border-left-color: var(--priority-low);
}

.kanban-card.medium {
  border-left-color: var(--priority-medium);
}

.kanban-card.high {
  border-left-color: var(--priority-high);
}

.kanban-card h4 {
  margin: 0 0 4px;
  font-size: 14px;
  color: var(--text-primary);
}

.kanban-card p {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.priority-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
}

.priority-dot.low {
  background: var(--priority-low);
}

.priority-dot.medium {
  background: var(--priority-medium);
}

.priority-dot.high {
  background: var(--priority-high);
}

.deadline {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 4px 0 0;
}

.deadline.overdue {
  color: var(--danger);
  font-weight: 600;
}

.subtasks {
  margin-top: 8px;
  border-top: 1px solid var(--bg-hover);
  padding-top: 6px;
}

.subtasks-progress {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 600;
}

.subtask-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 2px 0;
}

.subtask-item .done {
  text-decoration: line-through;
  opacity: 0.5;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 4px;
}

.card-tag {
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
}
</style>
