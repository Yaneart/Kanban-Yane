<script setup lang="ts">
import type { Card, Column } from '@/types'
import KanbanCard from './KanbanCard.vue'
import { computed, ref } from 'vue'
import draggable from 'vuedraggable'

const props = defineProps<{
  column: Column
  searchQuery: string
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()

const newCardTitle = ref('')
const isEditing = ref(false)
const editTitle = ref('')

const filteredCards = computed(() => {
  const query = props.searchQuery.toLowerCase().trim()
  if (!query) return props.column.cards
  return props.column.cards.filter((card) => card.title.toLowerCase().includes(query))
})

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
    priority: 'low',
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
    <div class="column-header">
      <template v-if="isEditing">
        <input
          v-model="editTitle"
          class="edit-input"
          @keyup.enter="saveEdit"
          @keyup.escape="cancelEdit"
        />
      </template>
      <h3 v-else @dblclick="startEditing">
        {{ column.title }} <span class="count">({{ column.cards.length }})</span>
      </h3>
      <button class="delete-column-btn" @click="emit('delete', column.id)">&times;</button>
    </div>
    <template v-if="isEditing">
      <div class="edit-actions">
        <button class="save-btn" @click="saveEdit">Сохранить</button>
        <button class="cancel-btn" @click="cancelEdit">Отмена</button>
      </div>
    </template>
    <draggable :list="filteredCards" group="cards" item-key="id" class="cards-list">
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
  background: #2a2040;
  border-radius: 12px;
  padding: 12px;
  width: 280px;
  min-height: 100px;
  flex-shrink: 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.column-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #e8e0f0;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.column-header h3:hover {
  background: rgba(255, 255, 255, 0.08);
}

.column-header .count {
  color: #9b8ab8;
  font-weight: 400;
}

.delete-column-btn {
  background: none;
  border: none;
  color: #9b8ab8;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
  border-radius: 4px;
  line-height: 1;
}

.delete-column-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #eb5a46;
}

.cards-list {
  flex: 1;
  overflow-y: auto;
  min-height: 20px;
}

.edit-input {
  width: 100%;
  padding: 6px 8px;
  font-size: 14px;
  font-weight: 700;
  border: 2px solid #a882ff;
  border-radius: 4px;
  margin-bottom: 8px;
  box-sizing: border-box;
  outline: none;
}

.edit-actions {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.save-btn {
  padding: 6px 12px;
  background: #7c5cbf;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.save-btn:hover {
  background: #9a6ef5;
}

.cancel-btn {
  padding: 6px 12px;
  background: none;
  border: none;
  color: #9b8ab8;
  cursor: pointer;
  font-size: 13px;
}

.cancel-btn:hover {
  color: #e8e0f0;
}

.add-card {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
}

.add-card input {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.1);
  color: #e8e0f0;
  outline: none;
}

.add-card input::placeholder {
  color: #9b8ab8;
}

.add-card input:focus {
  box-shadow: 0 0 0 2px rgba(168, 130, 255, 0.4);
  background: rgba(255, 255, 255, 0.15);
}

.add-card button {
  padding: 8px 14px;
  background: #7c5cbf;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background 0.2s;
}

.add-card button:hover {
  background: #9a6ef5;
}
</style>
