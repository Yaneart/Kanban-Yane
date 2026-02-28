<script setup lang="ts">
import type { Card } from '@/types'
import { ref } from 'vue'

const props = defineProps<{
  card: Card
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()

const isEditing = ref(false)
const editTitle = ref('')
const editDiscription = ref('')
const editDeadline = ref('')

function formaterDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString()
}

function startEditing() {
  editTitle.value = props.card.title
  editDiscription.value = props.card.description
  editDeadline.value = props.card.deadline
    ? new Date(props.card.deadline).toISOString().slice(0, 10)
    : ''
  isEditing.value = true
}

function saveEdit() {
  const title = editTitle.value.trim()
  if (!title) return
  props.card.title = title
  props.card.description = editDiscription.value.trim()
  props.card.deadline = editDeadline.value ? new Date(editDeadline.value).getTime() : undefined
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}

function togglePriority() {
  const priority: Card['priority'][] = ['low', 'medium', 'high']
  const current = priority.indexOf(props.card.priority)
  props.card.priority = priority[(current + 1) % 3] ?? 'low'
}
</script>

<template>
  <div :class="['kanban-card', card.priority]" @dblclick="startEditing">
    <button class="delete-btn" @click="emit('delete', card.id)">&times;</button>

    <template v-if="isEditing">
      <input
        v-model="editTitle"
        class="edit-input"
        @keyup.enter="saveEdit"
        @keyup.escape="cancelEdit"
      />
      <textarea v-model="editDiscription" class="edit-textarea" @keyup.escape="cancelEdit" />
      <input v-model="editDeadline" type="date" class="edit-input" />
      <div class="edit-actions">
        <button class="save-btn" @click="saveEdit">Сохранить</button>
        <button class="cancel-btn" @click="cancelEdit">Отмена</button>
      </div>
    </template>

    <template v-else>
      <h4>{{ card.title }}</h4>
      <p v-if="card.description">
        {{ card.description }}
      </p>
      <p v-if="card.deadline" :class="{ overdue: card.deadline < Date.now() }" class="deadline">
        {{ formaterDate(card.deadline) }}
      </p>
      <div
        :class="['priority-dot', card.priority]"
        @click.stop="togglePriority"
        @dblclick.stop
      ></div>
    </template>
  </div>
</template>

<style scoped>
.kanban-card {
  position: relative;
  background: #362b50;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  border-left: 4px solid;
  cursor: grab;
  transition:
    box-shadow 0.2s,
    transform 0.15s;
}

.kanban-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transform: translateY(-1px);
  background: #3d3260;
}

.kanban-card.low {
  border-left-color: #61bd4f;
}

.kanban-card.medium {
  border-left-color: #f2d600;
}

.kanban-card.high {
  border-left-color: #eb5a46;
}

.kanban-card h4 {
  margin: 0 0 4px;
  font-size: 14px;
  color: #e8e0f0;
  cursor: pointer;
}

.kanban-card p {
  margin: 0;
  font-size: 12px;
  color: #9b8ab8;
}

.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: none;
  border: none;
  font-size: 16px;
  color: #ccc;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  opacity: 0;
  transition:
    opacity 0.2s,
    color 0.2s;
}

.kanban-card:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #eb5a46;
  background: rgba(235, 90, 70, 0.1);
}

.priority-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  cursor: pointer;
  transition: transform 0.15s;
}

.priority-dot:hover {
  transform: scale(1.5);
}

.priority-dot.low {
  background: #61bd4f;
}

.priority-dot.medium {
  background: #f2d600;
}

.priority-dot.high {
  background: #eb5a46;
}

.edit-input {
  width: 100%;
  padding: 4px 8px;
  font-size: 14px;
  font-weight: bold;
  border: 2px solid #a882ff;
  border-radius: 4px;
  margin-bottom: 4px;
  box-sizing: border-box;
  outline: none;
}

.edit-textarea {
  width: 100%;
  padding: 4px 8px;
  font-size: 12px;
  border: 2px solid #a882ff;
  border-radius: 4px;
  resize: vertical;
  min-height: 40px;
  box-sizing: border-box;
  outline: none;
}

.edit-actions {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.save-btn {
  padding: 4px 12px;
  background: #7c5cbf;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.save-btn:hover {
  background: #9a6ef5;
}

.cancel-btn {
  padding: 4px 12px;
  background: none;
  border: none;
  color: #9b8ab8;
  cursor: pointer;
  font-size: 12px;
}

.deadline {
  font-size: 11px;
  color: #9b8ab8;
  margin: 4px 0 0;
}

.deadline.overdue {
  color: #eb5a46;
  font-weight: 600;
}
</style>
