<script setup lang="ts">
import type { Card, Column } from '@/types'
import KanbanCard from './KanbanCard.vue'
import { computed, nextTick, ref } from 'vue'
import draggable from 'vuedraggable'
import { useHistory } from '@/composables/useHistory'
import CardModal from './CardModal.vue'
import { useToast } from '@/composables/useToast'
import { useTemplateStore } from '@/stores/templates'

const props = defineProps<{
  column: Column
  searchQuery: string
  activeTags: string[]
  allColumns: { id: string; title: string }[]
}>()

const emit = defineEmits<{
  delete: [id: string]
  move: [cardId: string, sourceColumnId: string, targetColumnId: string]
  'update-column': [column: Column]
}>()

const newCardTitle = ref('')
const isEditing = ref(false)
const editTitle = ref('')
const editWipLimit = ref<number | undefined>(0)
const { addHistory, saveSnapshot } = useHistory()
const sortMode = ref<'none' | 'priority' | 'date' | 'name'>('none')
const selectedCard = ref<Card | null>(null)
const { addToast } = useToast()
const editInputRef = ref<HTMLInputElement | null>(null)

const templateStore = useTemplateStore()
const { templates } = templateStore
const selectedTemplate = ref('')

const filteredCards = computed(() => {
  const query = props.searchQuery.toLowerCase().trim()
  let cards = props.column.cards.filter((t) => !t.archived)

  if (query) {
    cards = cards.filter((card) => card.title.toLowerCase().includes(query))
  }

  if (props.activeTags.length > 0) {
    cards = cards.filter((card) => card.tags?.some((tag) => props.activeTags.includes(tag.id)))
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
  addHistory(`Колонка переименована в "${title}"`)
  emit('update-column', {
    ...props.column,
    title,
    wipLimit: (editWipLimit.value ?? 0) > 0 ? editWipLimit.value : undefined,
  })
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}

function addCard() {
  if (isOverLimit.value) return
  const title = newCardTitle.value.trim()
  if (!title) return

  const template = templates.find((t) => t.id === selectedTemplate.value)

  const card: Card = {
    id: crypto.randomUUID(),
    title,
    description: template?.description ?? '',
    createdAt: Date.now(),
    priority: template?.priority ?? 'low',
    tags: template ? [...template.tags] : undefined,
    subtask: template ? JSON.parse(JSON.stringify(template.subtasks)) : undefined,
  }

  addHistory(`Добавлена карточка "${title}" в "${props.column.title}"`)
  emit('update-column', { ...props.column, cards: [...props.column.cards, card] })
  addToast('Карточка добавлена', 'success')
  newCardTitle.value = ''
  selectedTemplate.value = ''
}

function onDragChange(event: { added?: { element: Card } }) {
  if (event.added) {
    addHistory(`Карточка "${event.added.element.title}" перемещена в "${props.column.title}"`)
    addToast('Карточка перемещена', 'success')
  }
}

function updateCard(updatedCard: Card) {
  const index = props.column.cards.findIndex((c) => c.id === updatedCard.id)
  if (index !== -1) {
    emit('update-column', {
      ...props.column,
      cards: props.column.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
    })
  }
  selectedCard.value = updatedCard
}

function deleteCardFromModal(id: string) {
  const card = props.column.cards.find((c) => c.id === id)
  if (card) {
    addHistory(`Удалена карточка "${card.title}" из "${props.column.title}"`)
    addToast('Карточка удалена', 'success')
    emit('update-column', { ...props.column, cards: props.column.cards.filter((c) => c.id !== id) })
  }
  selectedCard.value = null
}

function onDragMove(event: { to: HTMLElement; from: HTMLElement }) {
  if (event.to === event.from) return true

  const targetLimit = Number(event.to.dataset.wipLimit) || 0
  const targetCount = Number(event.to.dataset.activeCount) || 0

  if (targetLimit && targetCount >= targetLimit) {
    return false
  }
  return true
}

function moveCard(cardId: string, targetColumnId: string) {
  emit('move', cardId, props.column.id, targetColumnId)
  selectedCard.value = null
}

function duplicateCard(card: Card) {
  emit('update-column', { ...props.column, cards: [...props.column.cards, card] })
}
</script>

<template>
  <div
    class="kanban-column"
    :class="{ 'over-limit': isOverLimit }"
    role="region"
    :aria-label="column.title"
  >
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
        <span class="col-dot"></span>
        <h3 @dblclick="startEditing">{{ column.title }}</h3>
        <span class="col-count"
          >{{ activeCards.length
          }}<template v-if="column.wipLimit">/{{ column.wipLimit }}</template></span
        >
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
      :animation="200"
      :delay="100"
      :delay-on-touch-only="true"
      :move="onDragMove"
      :data-wip-limit="column.wipLimit || 0"
      :data-active-count="activeCards.length"
      @change="onDragChange"
      @update:model-value="(val: Card[]) => emit('update-column', { ...props.column, cards: val })"
      @start="saveSnapshot"
    >
      <template #item="{ element }">
        <KanbanCard
          v-if="!element.archived"
          :card="element"
          @click="selectedCard = element"
          @open="selectedCard = element"
        />
      </template>
      <template #footer>
        <div v-if="filteredCards.length === 0" class="empty-placeholder">
          Перетащите карточку сюда
        </div>
      </template>
    </draggable>
    <div v-if="templates.length" class="template-select">
      <select v-model="selectedTemplate" class="sort-select">
        <option value="">Без шаблона</option>
        <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
      <button
        v-if="selectedTemplate"
        class="btn-icon template-delete"
        title="Удалить шаблон"
        @click="
          () => {
            templateStore.deleteTemplate(selectedTemplate)
            selectedTemplate = ''
          }
        "
      >
        ✕
      </button>
    </div>
    <div class="add-card">
      <input
        class="add-card-input"
        v-model="newCardTitle"
        placeholder="Новая задача..."
        @keyup.enter="addCard"
      />
      <button @click="addCard">+</button>
    </div>
    <CardModal
      v-if="selectedCard"
      :card="selectedCard"
      :columns="allColumns"
      :current-column-id="column.id"
      @close="selectedCard = null"
      @update="updateCard"
      @delete="deleteCardFromModal"
      @duplicate="duplicateCard"
      @move="moveCard"
    />
  </div>
</template>

<style scoped>
.kanban-column {
  background: transparent;
  border-right: 1px solid rgba(255, 255, 255, 0.025);
  padding: 20px 16px;
  flex: 1;
  min-width: 240px;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
}

.kanban-column:last-child {
  border-right: none;
}

/* цветная полоска сверху */
.kanban-column {
  --col-color: 139, 92, 246;
}
.kanban-column:nth-child(2) {
  --col-color: 59, 130, 246;
}
.kanban-column:nth-child(3) {
  --col-color: 236, 72, 153;
}
.kanban-column:nth-child(4) {
  --col-color: 16, 185, 129;
}
.kanban-column:nth-child(5) {
  --col-color: 245, 158, 11;
}
.kanban-column:nth-child(6) {
  --col-color: 239, 68, 68;
}
.kanban-column:nth-child(7) {
  --col-color: 6, 182, 212;
}
.kanban-column:nth-child(8) {
  --col-color: 249, 115, 22;
}
.kanban-column:nth-child(9) {
  --col-color: 34, 197, 94;
}
.kanban-column:nth-child(10) {
  --col-color: 168, 85, 247;
}

.kanban-column::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, rgb(var(--col-color)), rgba(var(--col-color), 0.3));
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-left: 2px;
}

.column-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.column-drag-handle {
  font-size: 12px;
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

.col-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(var(--col-color));
  box-shadow: 0 0 10px rgba(var(--col-color), 0.5);
  flex-shrink: 0;
}

.column-header h3 {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #555;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  transition: all 0.2s;
}

.column-header h3:hover {
  background: rgba(255, 255, 255, 0.04);
  color: #888;
}

.col-count {
  font-size: 10px;
  color: #333;
  background: rgba(255, 255, 255, 0.04);
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: auto;
}

.delete-column-btn {
  font-size: 14px;
  opacity: 0;
  transition: all 0.2s;
}

.kanban-column:hover .delete-column-btn {
  opacity: 1;
}

.delete-column-btn:hover {
  color: var(--danger);
}

.cards-list {
  flex: 1;
  overflow-y: auto;
  min-height: 20px;
}

.cards-list::-webkit-scrollbar {
  width: 4px;
}

.cards-list::-webkit-scrollbar-track {
  background: transparent;
}

.cards-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
}

.cards-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}

.edit-input {
  width: 100%;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 8px;
  margin-bottom: 8px;
  box-sizing: border-box;
  outline: none;
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
}

.edit-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-glow);
}

.edit-actions {
  display: flex;
  align-items: center;
  align-self: center;
  gap: 6px;
  margin-bottom: 8px;
}

.template-select {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  opacity: 0.4;
  transition: opacity 0.2s;
}

.template-select:hover {
  opacity: 0.8;
}

.template-select .sort-select {
  flex: 1;
  margin-bottom: 0;
}

.template-delete {
  color: var(--text-secondary);
  font-size: 12px;
  flex-shrink: 0;
}

.template-delete:hover {
  color: var(--danger);
}

.add-card {
  display: flex;
  gap: 6px;
  margin-top: 4px;
  padding-top: 4px;
}

.add-card input {
  flex: 1;
  padding: 10px 12px;
  border: 1px dashed rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  font-size: 12px;
  font-family: 'Outfit', sans-serif;
  background: transparent;
  color: var(--text-primary);
  outline: none;
  text-align: center;
  transition: all 0.2s;
}

.add-card input::placeholder {
  color: #2a2a35;
}

.add-card input:focus {
  border-style: solid;
  border-color: rgba(139, 92, 246, 0.2);
  background: rgba(139, 92, 246, 0.03);
  color: #888;
}

.add-card button {
  padding: 8px 12px;
  background: transparent;
  color: #2a2a35;
  border: 1px dashed rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  transition: all 0.2s;
}

.add-card button:hover {
  border-color: rgba(139, 92, 246, 0.2);
  color: #555;
  background: rgba(139, 92, 246, 0.03);
}

.kanban-column.over-limit {
  box-shadow: inset 0 0 0 1px rgba(239, 68, 68, 0.3);
}

.sort-select {
  width: 100%;
  padding: 5px 8px;
  border: none;
  border-radius: 6px;
  font-size: 10px;
  font-family: 'Outfit', sans-serif;
  background: transparent;
  color: #333;
  outline: none;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.3s;
  opacity: 0;
}

.kanban-column:hover .sort-select {
  opacity: 0.6;
}

[data-theme='light'] .sort-select option {
  background: #fff;
  color: #333;
}

.sort-select:hover {
  opacity: 1 !important;
  color: #555;
  background: rgba(255, 255, 255, 0.02);
}

.sort-select option {
  background: #0d0d16;
  color: #ccc;
}

.progress-bar {
  height: 2px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 1px;
  margin-bottom: 12px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 1px;
  transition: width 0.3s ease;
  background: linear-gradient(90deg, rgb(var(--col-color)), rgba(var(--col-color), 0.3));
}

.progress-warning {
  background: linear-gradient(90deg, #f59e0b, rgba(245, 158, 11, 0.3));
}

.progress-danger {
  background: linear-gradient(90deg, var(--danger), rgba(239, 68, 68, 0.3));
}

.cards-list :deep(.ghost) {
  opacity: 0.3;
  background: var(--accent-soft);
  border-radius: 14px;
}

.cards-list :deep(.dragging) {
  opacity: 0.9;
  transform: rotate(2deg);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
}

.empty-placeholder {
  padding: 20px 12px;
  text-align: center;
  color: var(--text-muted);
  font-size: 12px;
  border: 1px dashed var(--border-medium);
  border-radius: 12px;
}

/* мобильная версия */
@media (max-width: 768px) {
  .kanban-column {
    min-width: auto;
    padding: 14px 12px;
  }

  .column-header h3 {
    font-size: 13px;
    padding: 6px 8px;
  }

  .add-card input {
    padding: 10px 12px;
    font-size: 16px;
  }

  .add-card button {
    padding: 10px 16px;
    font-size: 16px;
  }

  .sort-select {
    padding: 8px;
    font-size: 14px;
  }

  .delete-column-btn {
    opacity: 1;
    width: 44px;
    height: 44px;
    font-size: 18px;
  }

  .add-card input {
    min-height: 44px;
  }

  .add-card button {
    min-height: 44px;
  }
}
</style>
