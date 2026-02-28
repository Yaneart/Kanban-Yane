<script setup lang="ts">
import type { Card, Column } from '@/types'
import KanbanCard from './KanbanCard.vue'
import { ref } from 'vue'
import draggable from 'vuedraggable'

const props = defineProps<{
  column: Column
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()

const newCardTitle = ref('')
const isEditing = ref(false)
const editTitle = ref('')

function startEditing() {
  editTitle.value = props.column.title
  isEditing.value = true
}

function saveEdit() {
  const title = editTitle.value.trim()
  if (!title) return
  props.column.title = title
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}

function addCard() {
  const title = newCardTitle.value.trim()
  if (!title) return

  const card: Card = {
    id: `card-${Date.now()}`,
    title,
    description: '',
    createdAt: Date.now(),
  }

  props.column.cards.push(card)
  newCardTitle.value = ''
}

function deleteCard(id: string) {
  const index = props.column.cards.findIndex((c) => c.id === id)

  if (index !== -1) {
    props.column.cards.splice(index, 1)
  }
}
</script>

<template>
  <div class="kanban-column">
    <button class="delete-btn" @click="emit('delete', column.id)">x</button>
    <template v-if="isEditing">
      <input
        v-model="editTitle"
        class="edit-input"
        @keyup.enter="saveEdit"
        @keyup.escape="cancelEdit"
      />
      <div class="edit-actions">
        <button class="save-btn" @click="saveEdit">Сохранить</button>
        <button class="cancel-btn" @click="cancelEdit">Отмена</button>
      </div>
    </template>
    <template v-else>
      <h3 @dblclick="startEditing">{{ column.title }} ({{ column.cards.length }})</h3>
    </template>
    <draggable v-model="column.cards" group="cards" item-key="id" class="cards-list">
      <template #item="{ element }">
        <KanbanCard :card="element" @delete="deleteCard" />
      </template>
    </draggable>
    <div class="add-card">
      <input v-model="newCardTitle" placeholder="Новая задача..." @keyup.enter="addCard" />
      <button @click="addCard">+</button>
    </div>
  </div>
</template>

<style scoped>
.kanban-column {
  background: #f0f0f0;
  border-radius: 8px;
  padding: 12px;
  width: 280px;
  min-height: 300px;
  flex-shrink: 0;
}

.kanban-column h3 {
  margin: 0 0 12px;
  font-size: 16px;
}

.add-card {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.add-card input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.add-card button {
  padding: 8px 12px;
  background: #4a90d9;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
</style>
