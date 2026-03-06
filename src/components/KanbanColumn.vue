<script setup lang="ts">
import type { Card, Column } from '@/types'
import KanbanCard from './KanbanCard.vue'
import { computed, nextTick, ref } from 'vue'
import draggable from 'vuedraggable'
import { useHistory } from '@/composables/useHistory'
import CardModal from './CardModal.vue'
import { useToast } from '@/composables/useToast'

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
const editWipLimit = ref<number | undefined>(0)
const { addHistory } = useHistory()
const sortMode = ref<'none' | 'priority' | 'date' | 'name'>('none')
const selectedCard = ref<Card | null>(null)
const { addToast } = useToast()
const editInputRef = ref<HTMLInputElement | null>(null)

const filteredCards = computed(() => {
  const query = props.searchQuery.toLowerCase().trim()
  let cards = props.column.cards.filter((t) => !t.archived)

  if (query) {
    cards = cards.filter((card) => card.title.toLowerCase().includes(query))
  }

  if (sortMode.value === 'name') {
    cards = [...cards].sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortMode.value === 'date') {
    cards = [...cards].sort((a, b) => b.createdAt - a.createdAt)
  } else if (sortMode.value === 'priority') {
    const order = { high: 0, medium: 1, low: 2 }
    cards = [...cards].sort((a, b) => order[a.priority] - order[b.priority])
  }

  return cards
})

const activeCards = computed(() => props.column.cards.filter((c) => !c.archived))

const isOverLimit = computed(() => {
  if (!props.column.wipLimit) return false
  return activeCards.value.length >= props.column.wipLimit
})

const progressPercent = computed(() => {
  if (!props.column.wipLimit) return 0
  return Math.min((activeCards.value.length / props.column.wipLimit) * 100, 100)
})

function startEditing() {
  editTitle.value = props.column.title
  editWipLimit.value = props.column.wipLimit
  isEditing.value = true
  nextTick(() => editInputRef.value?.focus())
}

function saveEdit() {
  const title = editTitle.value.trim()
  if (!title) return
  props.column.title = title
  props.column.wipLimit = (editWipLimit.value ?? 0) > 0 ? editWipLimit.value : undefined
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
    id: crypto.randomUUID(),
    title,
    description: '',
    createdAt: Date.now(),
    priority: 'low',
  }

  props.column.cards.push(card)
  addHistory(`Добавлена карточка "${title}" в "${props.column.title}"`)
  addToast('Карточка добавлена', 'success')
  newCardTitle.value = ''
}

function onDragChange(event: any) {
  if (event.added) {
    addHistory(`Карточка "${event.added.element.title}" перемещена в "${props.column.title}"`)
    addToast('Карточка перемещена', 'success')
  }
}

function updateCard(updatedCard: Card) {
  const index = props.column.cards.findIndex((c) => c.id === updatedCard.id)
  if (index !== -1) {
    props.column.cards[index] = updatedCard
  }
  selectedCard.value = updatedCard
}

function deleteCardFromModal(id: string) {
  const card = props.column.cards.find((c) => c.id === id)
  if (card) {
    addHistory(`Удалена карточка "${card.title}" из "${props.column.title}"`)
    addToast('Карточка удалена', 'success')
    props.column.cards = props.column.cards.filter((c) => c.id !== id)
  }
  selectedCard.value = null
}

function onDragMove(event: any) {
  if (event.to === event.from) return true

  const targetLimit = Number(event.to.dataset.wipLimit) || 0
  const targetCount = Number(event.to.dataset.activeCount) || 0

  if (targetLimit && targetCount >= targetLimit) {
    return false
  }
  return true
}

function duplicateCard(card: Card) {
  props.column.cards.push(card)
}
</script>

<template>
  <div class="kanban-column" :class="{ 'over-limit': isOverLimit }">
    <div class="column-header">
      <template v-if="isEditing">
        <input
          ref="editInputRef"
          v-model="editTitle"
          class="edit-input"
          @keyup.enter="saveEdit"
          @keyup.escape="cancelEdit"
        />
      </template>
      <div v-else class="column-title-row">
        <span class="column-drag-handle">⠿</span>
        <h3 @dblclick="startEditing">
          {{ column.title }}
          <span class="count"
            >({{ activeCards.length
            }}<template v-if="column.wipLimit">/ {{ column.wipLimit }}</template
            >)</span
          >
        </h3>
      </div>
      <button class="btn-icon delete-column-btn" @click="emit('delete', column.id)">✕</button>
    </div>
    <div v-if="column.wipLimit" class="progress-bar">
      <div
        class="progress-fill"
        :style="{ width: progressPercent + '%' }"
        :class="{
          'progress-warning': progressPercent >= 70 && progressPercent < 100,
          'progress-danger': progressPercent >= 100,
        }"
      ></div>
    </div>
    <select v-model="sortMode" class="sort-select">
      <option value="none">Без сортировки</option>
      <option value="priority">По приоритету</option>
      <option value="date">По дате</option>
      <option value="name">По имени</option>
    </select>
    <template v-if="isEditing">
      <input
        v-model.number="editWipLimit"
        type="number"
        min="0"
        class="edit-input"
        placeholder="WIP лимит (0 = без лимита)"
      />
      <div class="edit-actions">
        <button class="btn btn-primary btn-sm" @click="saveEdit">Сохранить</button>
        <button class="btn btn-ghost btn-sm" @click="cancelEdit">Отмена</button>
      </div>
    </template>
    <draggable
      :model-value="filteredCards"
      group="cards"
      item-key="id"
      class="cards-list"
      ghost-class="ghost"
      drag-class="dragging"
      handle=".drag-handle"
      :animation="200"
      :delay="100"
      :delay-on-touch-only="true"
      :move="onDragMove"
      :data-wip-limit="column.wipLimit || 0"
      :data-active-count="activeCards.length"
      @change="onDragChange"
      @update:model-value="(val: any) => (props.column.cards = val)"
    >
      <template #item="{ element }">
        <KanbanCard v-if="!element.archived" :card="element" @click="selectedCard = element" />
      </template>
      <template #footer>
        <div v-if="filteredCards.length === 0" class="empty-placeholder">
          Перетащите карточку сюда
        </div>
      </template>
    </draggable>
    <div class="add-card">
      <input v-model="newCardTitle" placeholder="Новая задача..." @keyup.enter="addCard" />
      <button @click="addCard">+</button>
    </div>
    <CardModal
      v-if="selectedCard"
      :card="selectedCard"
      @close="selectedCard = null"
      @update="updateCard"
      @delete="deleteCardFromModal"
      @duplicate="duplicateCard"
    />
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

.column-title-row {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.column-drag-handle {
  font-size: 14px;
  color: var(--text-muted);
  cursor: grab;
  opacity: 0;
  transition: opacity 0.2s;
  padding: 4px;
  touch-action: none;
  user-select: none;
  flex-shrink: 0;
}

.kanban-column:hover .column-drag-handle {
  opacity: 0.5;
}

.column-drag-handle:hover {
  opacity: 1 !important;
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

.delete-column-btn:hover {
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
  align-items: center;
  align-self: center;
  gap: 6px;
  margin-bottom: 8px;
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

.sort-select {
  width: 100%;
  padding: 6px 8px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  background: var(--bg-input);
  color: var(--text-primary);
  outline: none;
  margin-bottom: 8px;
  cursor: pointer;
}
.sort-select option {
  background: var(--bg-column);
  color: var(--text-primary);
}

.progress-bar {
  height: 4px;
  background: var(--bg-input);
  border-radius: 2px;
  margin-bottom: 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-warning {
  background: #f59e0b;
}

.progress-danger {
  background: var(--danger);
}

.cards-list :deep(.ghost) {
  opacity: 0.3;
  background: var(--accent-soft);
  border-radius: 8px;
  border-left-color: var(--accent);
}

.cards-list :deep(.dragging) {
  opacity: 0.9;
  transform: rotate(3deg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.empty-placeholder {
  padding: 24px 12px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  border: 2px dashed var(--bg-hover);
  border-radius: 8px;
  opacity: 0.7;
}

/* ===== Mobile ===== */
@media (max-width: 768px) {
  .kanban-column {
    width: auto;
    padding: 10px;
  }

  .column-header h3 {
    font-size: 15px;
    padding: 6px 8px;
  }

  .add-card input {
    padding: 10px 12px;
    font-size: 16px;
  }

  .add-card button {
    padding: 10px 16px;
    font-size: 18px;
  }

  .sort-select {
    padding: 8px;
    font-size: 14px;
  }

  .delete-column-btn {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
}
</style>
