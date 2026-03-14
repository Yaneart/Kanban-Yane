<script setup lang="ts">
import type { Card } from '@/types'
import { formatDate } from '@/utils/format'

defineProps<{
  card: Card
}>()

defineEmits<{
  open: []
}>()
</script>

<template>
  <div
    :class="['kanban-card', card.priority]"
    tabindex="0"
    @keydown.enter="$emit('open')"
    role="article"
    :aria-label="card.title + (card.subtask?.length ? `, подзадач: ${card.subtask.length}` : '')"
  >
    <div :class="['priority-dot', card.priority]"></div>
    <div class="drag-handle">
      <span class="grip-lines"></span>
    </div>
    <h4>{{ card.title }}</h4>

    <p v-if="card.description" class="card-description">{{ card.description }}</p>

    <div v-if="card.tags?.length" class="card-tags">
      <span
        v-for="tag in card.tags"
        :key="tag.id"
        class="card-tag"
        :style="{ '--tag-color': tag.color } as any"
      >
        {{ tag.name }}
      </span>
    </div>

    <p v-if="card.deadline" :class="{ overdue: card.deadline < Date.now() }" class="deadline">
      {{ formatDate(card.deadline) }}
    </p>
    <div v-if="card.subtask?.length" class="subtask-bar">
      <div
        v-for="sub in card.subtask"
        :key="sub.id"
        :class="['subtask-seg', { done: sub.done }]"
      ></div>
    </div>
    <span v-if="card.comments?.length" class="comment-count">💬{{ card.comments.length }}</span>
  </div>
</template>

<style scoped>
.kanban-card {
  position: relative;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 14px;
  padding: 16px;
  padding-left: 32px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  transform-style: preserve-3d;
}

.kanban-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(var(--col-color), 0.06) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.kanban-card:hover {
  background: rgba(var(--col-color), 0.04);
  border-color: rgba(var(--col-color), 0.2);
  transform: translateY(-3px) rotateX(1.5deg);
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.3),
    0 0 50px rgba(var(--col-color), 0.06);
}

.kanban-card:hover::after {
  opacity: 1;
}

.drag-handle {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  opacity: 0;
  transition: opacity 0.2s;
  touch-action: none;
  user-select: none;
  border-radius: 14px 0 0 14px;
  z-index: 2;
}

.grip-lines {
  width: 4px;
  height: 16px;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.2) 1px, transparent 1px);
  background-size: 4px 4px;
}

.kanban-card:hover .drag-handle {
  opacity: 0.6;
}

.drag-handle:hover {
  opacity: 1 !important;
  background: rgba(255, 255, 255, 0.03);
}

.drag-handle:active {
  cursor: grabbing;
}

@media (max-width: 768px) {
  .kanban-card {
    padding: 14px 14px 14px 34px;
  }

  .drag-handle {
    opacity: 0.5;
    width: 28px;
  }

  .grip-lines {
    width: 6px;
    height: 20px;
    background-size: 6px 6px;
  }
}

/* линия приоритета */
.kanban-card.low {
  border-left: none;
}

.kanban-card.medium {
  border-left: none;
}

.kanban-card.high {
  border-left: none;
}

.kanban-card h4 {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--card-title);
  position: relative;
  z-index: 1;
}

.priority-dot {
  display: block;
  width: 100%;
  height: 2px;
  margin: 6px 0 10px;
}

.priority-dot.low {
  background: linear-gradient(90deg, #22c55e, transparent);
}

.priority-dot.medium {
  background: linear-gradient(90deg, #f59e0b, transparent);
}

.priority-dot.high {
  background: linear-gradient(90deg, #ef4444, transparent);
}

.deadline {
  font-size: 10px;
  color: #444;
  margin: 6px 0 0;
  position: relative;
  z-index: 1;
}

.deadline.overdue {
  color: #ef4444;
  font-weight: 600;
}

.subtask-bar {
  display: flex;
  gap: 3px;
  margin-top: 10px;
  position: relative;
  z-index: 1;
}

.subtask-seg {
  flex: 1;
  height: 3px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.05);
}

.subtask-seg.done {
  background: rgb(var(--col-color));
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
  position: relative;
  z-index: 1;
}

.card-tag {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  text-transform: none;
  color: var(--tag-color);
  background: color-mix(in srgb, var(--tag-color) 12%, transparent);
}

[data-theme='light'] .card-tag {
  background: color-mix(in srgb, var(--tag-color) 15%, white);
  border: 1px solid color-mix(in srgb, var(--tag-color) 30%, transparent);
  font-weight: 700;
}

.comment-count {
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 6px;
  display: inline-block;
  position: relative;
  z-index: 1;
}

.card-description {
  font-size: 11px;
  color: var(--card-desc);
  max-height: 40px;
  overflow: hidden;
  line-height: 1.5;
  word-break: break-word;
  overflow-wrap: break-word;
  position: relative;
  z-index: 1;
  margin: 0;
}

.kanban-card:focus {
  outline: none;
  border-color: rgba(var(--col-color), 0.4);
  box-shadow:
    0 0 0 2px rgba(var(--col-color), 0.15),
    0 8px 24px rgba(0, 0, 0, 0.2);
}

.kanban-card:focus::after {
  opacity: 1;
}

/* светлая тема */
[data-theme='light'] .kanban-card {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

[data-theme='light'] .kanban-card:hover {
  background: rgba(var(--col-color), 0.08);
  border-color: rgba(var(--col-color), 0.35);
  box-shadow:
    0 8px 24px rgba(var(--col-color), 0.15),
    0 2px 8px rgba(0, 0, 0, 0.08);
}

[data-theme='light'] .kanban-card::after {
  background: linear-gradient(135deg, rgba(var(--col-color), 0.12) 0%, transparent 60%);
}

[data-theme='light'] .grip-lines {
  background-image: radial-gradient(circle, rgba(0, 0, 0, 0.2) 1px, transparent 1px);
}

[data-theme='light'] .drag-handle:hover {
  background: rgba(0, 0, 0, 0.04);
}

[data-theme='light'] .kanban-card:focus {
  border-color: rgba(var(--col-color), 0.5);
  box-shadow:
    0 0 0 2px rgba(var(--col-color), 0.2),
    0 4px 12px rgba(var(--col-color), 0.1);
}
</style>
