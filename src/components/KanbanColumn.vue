<script setup lang="ts">
import type { Card, Column } from '@/types'
import KanbanCard from './KanbanCard.vue'
import { computed, ref } from 'vue'
import draggable from 'vuedraggable'
import { useHistory } from '@/composables/useHistory'

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
const editWipLimit = ref(0)
const { addHistory } = useHistory()

const filteredCards = computed(() => {
  const query = props.searchQuery.toLowerCase().trim()
  if (!query) return props.column.cards
  return props.column.cards.filter((card) => card.title.toLowerCase().includes(query))
})

const isOverLimit = computed(() => {
  if (!props.column.wipLimit) return false
  return props.column.cards.length >= props.column.wipLimit
})

function startEditing() {
  editTitle.value = props.column.title
  editWipLimit.value = props.column.wipLimit ?? 0
  isEditing.value = true
}

function saveEdit() {
  const title = editTitle.value.trim()
  if (!title) return
  props.column.title = title
  props.column.wipLimit = editWipLimit.value || undefined
  addHistory(`Колонка переименована в "${title}"`)
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}

function addCard() {
  if (isOverLimit.value) return
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
  addHistory(`Добавлена карточка "${title}" в "${props.column.title}"`)
  newCardTitle.value = ''
}

function deleteCard(id: string) {
  const index = props.column.cards.findIndex((c) => c.id === id)

  if (index !== -1) {
    const card = props.column.cards[index]
    if (!card) return
    addHistory(`Удалена карточка "${card.title}" из "${props.column.title}"`)
    props.column.cards.splice(index, 1)
  }
}

function onDragChange(event: any) {
  if (event.added) {
    addHistory(`Карточка "${event.added.element.title}" перемещена в "${props.column.title}"`)
  }
}
</script>

<template>
  <div class="kanban-column" :class="{ 'over-limit': isOverLimit }">
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
        {{ column.title }}
        <span class="count"
          >({{ column.cards.length
          }}<template v-if="column.wipLimit">/ {{ column.wipLimit }}</template
          >)</span
        >
      </h3>
      <button class="delete-column-btn" @click="emit('delete', column.id)">&times;</button>
    </div>
    <template v-if="isEditing">
      <input
        v-model.number="editWipLimit"
        type="number"
        min="0"
        class="edit-input"
        placeholder="WIP лимит (0 = без лимита)"
      />
      <div class="edit-actions">
        <button class="save-btn" @click="saveEdit">Сохранить</button>
        <button class="cancel-btn" @click="cancelEdit">Отмена</button>
      </div>
    </template>
    <draggable
      :list="filteredCards"
      group="cards"
      item-key="id"
      class="cards-list"
      :animation="200"
      @change="onDragChange"
    >
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
  background: var(--bg-column);
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
  color: var(--text-primary);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.column-header h3:hover {
  background: var(--bg-hover);
}

.column-header .count {
  color: var(--text-secondary);
  font-weight: 400;
}

.delete-column-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
  border-radius: 4px;
  line-height: 1;
}

.delete-column-btn:hover {
  background: var(--bg-hover);
  color: var(--danger);
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
  border: 2px solid var(--accent);
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
  background: var(--accent-btn);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.save-btn:hover {
  background: var(--accent-btn-hover);
}

.cancel-btn {
  padding: 6px 12px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
}

.cancel-btn:hover {
  color: var(--text-primary);
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
  background: var(--bg-input);
  color: var(--text-primary);
  outline: none;
}

.add-card input::placeholder {
  color: var(--text-secondary);
}

.add-card input:focus {
  box-shadow: 0 0 0 2px var(--accent-soft);
  background: var(--bg-input-focus);
}

.add-card button {
  padding: 8px 14px;
  background: var(--accent-btn);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background 0.2s;
}

.add-card button:hover {
  background: var(--accent-btn-hover);
}

.kanban-column.over-limit {
  border: 2px solid var(--danger);
}
</style>
