<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Card, Comment, SubTask, Tag } from '@/types'
import { useHistory } from '@/composables/useHistory'
import { availableTags } from '@/data/tags'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/utils/format'
import { marked } from 'marked'
import { useTemplateStore } from '@/stores/templates'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useFocusTrap } from '@/composables/useFocusTrap'

const props = defineProps<{
  card: Card
  columns: { id: string; title: string }[]
  currentColumnId: string
}>()

const emit = defineEmits<{
  close: []
  update: [card: Card]
  delete: [id: string]
  duplicate: [card: Card]
  move: [cardId: string, targetColumnId: string]
}>()

const priorityLabels: Record<Card['priority'], string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
}

const overlayRef = ref<HTMLElement | null>(null)
const { addHistory } = useHistory()
const isEditing = ref(false)
const editTitle = ref('')
const editDescription = ref('')
const editDeadline = ref('')
const editSubTask = ref<SubTask[]>([])
const newSubTask = ref('')
const newComment = ref('')
const { addToast } = useToast()
const { addTemplate } = useTemplateStore()

useFocusTrap(overlayRef)

onMounted(() => {
  overlayRef.value?.focus()
})

useKeyboardShortcuts({
  onDelete() {
    emit('delete', props.card.id)
  },
})

const parsedDescription = computed(() => {
  if (!props.card.description) return ''
  return marked(props.card.description)
})

function startEditing() {
  editTitle.value = props.card.title
  editDescription.value = props.card.description
  editDeadline.value = props.card.deadline
    ? new Date(props.card.deadline).toISOString().slice(0, 10)
    : ''
  editSubTask.value = JSON.parse(JSON.stringify(props.card.subtask ?? []))
  isEditing.value = true
}

function saveEdit() {
  const title = editTitle.value.trim()
  if (!title) return

  const updateCard: Card = {
    ...props.card,
    title,
    description: editDescription.value.trim(),
    deadline: editDeadline.value ? new Date(editDeadline.value).getTime() : undefined,
    subtask: JSON.parse(JSON.stringify(editSubTask.value)),
  }

  addHistory(`Редактирование карточки:"${title}"`)
  emit('update', updateCard)
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}

function togglePriority() {
  const priorities: Card['priority'][] = ['low', 'medium', 'high']
  const currentIndex = priorities.indexOf(props.card.priority)
  const nextPriority = priorities[(currentIndex + 1) % priorities.length]

  addHistory(`Смена приоритета на ${nextPriority}`)
  emit('update', { ...props.card, priority: nextPriority ?? 'low' })
  addToast('Приоритет сменен', 'info')
}

function addSubtask() {
  const text = newSubTask.value.trim()
  if (!text) return

  editSubTask.value.push({
    id: crypto.randomUUID(),
    text,
    done: false,
  })

  newSubTask.value = ''
}

function removeSubtask(id: string) {
  editSubTask.value = editSubTask.value.filter((e) => e.id !== id)
}

function toggleSubtask(subtask: SubTask) {
  const updatedSubtask = (props.card.subtask || []).map((s) => {
    return s.id === subtask.id ? { ...s, done: !s.done } : s
  })

  emit('update', { ...props.card, subtask: updatedSubtask })
}

function isOverdue(deadline: number) {
  return deadline < Date.now()
}

function subtaskProgress(subtask: SubTask[]) {
  if (!subtask.length) return ''

  const done = subtask.filter((s) => s.done).length
  return `${done}/${subtask.length}`
}

function toggleTag(tag: Tag) {
  const currentTag = props.card.tags || []
  const exists = currentTag.find((s) => s.id === tag.id)

  const newTag = exists ? currentTag.filter((s) => s.id !== tag.id) : [...currentTag, tag]
  addHistory(`${exists ? 'Убрана' : 'Добавлена'} метка "${tag.name}"`)
  emit('update', { ...props.card, tags: newTag })
}

function hasTag(tagId: string) {
  return (props.card.tags || []).some((t) => t.id === tagId)
}

function addComment() {
  const text = newComment.value.trim()
  if (!text) return

  const comment: Comment = {
    id: crypto.randomUUID(),
    text,
    createdAt: Date.now(),
  }

  const updateComments = [...(props.card.comments || []), comment]
  addHistory(`Комментарий к "${props.card.title}"`)
  emit('update', { ...props.card, comments: updateComments })
  addToast('Комментарий добавлен', 'info')
  newComment.value = ''
}

function deleteComment(id: string) {
  const updatedComments = (props.card.comments || []).filter((t) => t.id !== id)
  addHistory(`Удален Комментарий`)
  addToast('Комментарий удалён', 'info')
  emit('update', { ...props.card, comments: updatedComments })
}

function archivedCard() {
  addHistory(`Архивирована карточка "${props.card.title}"`)
  emit('update', { ...props.card, archived: true })
  addToast('Карточка архивирована', 'info')
  emit('close')
}

const moveTargetColumns = computed(() =>
  props.columns.filter((c) => c.id !== props.currentColumnId),
)

function moveCard(targetColumnId: string) {
  const targetCol = props.columns.find((c) => c.id === targetColumnId)
  addHistory(`Карточка "${props.card.title}" перемещена в "${targetCol?.title}"`)
  emit('move', props.card.id, targetColumnId)
  addToast('Карточка перемещена', 'success')
  emit('close')
}

function duplicateCard() {
  const copy: Card = {
    ...JSON.parse(JSON.stringify(props.card)),
    id: crypto.randomUUID(),
    title: props.card.title + ' (копия)',
    createdAt: Date.now(),
  }
  addHistory(`Скопирована карточка "${props.card.title}"`)
  emit('duplicate', copy)
  addToast('Карточка скопирована', 'success')
  emit('close')
}

function saveAsTemplate() {
  const name = prompt('Название шаблона')?.trim()

  if (!name) return

  addTemplate({
    name,
    priority: props.card.priority,
    tags: props.card.tags ?? [],
    subtasks: props.card.subtask ?? [],
    description: props.card.description,
  })
}
</script>

<template>
  <Teleport to="body">
    <div
      ref="overlayRef"
      class="modal-overlay"
      @click.self="emit('close')"
      @keydown.escape="emit('close')"
      tabindex="0"
    >
      <div class="modal-content">
        <button class="btn-icon modal-close" @click="emit('close')">✕</button>

        <!-- просмотр -->
        <div v-if="!isEditing" class="modal-view">
          <div class="modal-header">
            <h2>{{ card.title }}</h2>
            <span class="badge priority-badge" :class="card.priority" @click="togglePriority">
              {{ priorityLabels[card.priority] }}
            </span>
          </div>
          <div class="modal-tags">
            <span
              v-for="tag in availableTags"
              :key="tag.id"
              class="badge tag-badge"
              :class="{ active: hasTag(tag.id) }"
              :style="
                hasTag(tag.id)
                  ? { background: tag.color }
                  : { borderColor: tag.color, color: tag.color }
              "
              @click="toggleTag(tag)"
            >
              {{ tag.name }}
            </span>
          </div>

          <div v-if="card.description" class="modal-description" v-html="parsedDescription"></div>
          <p v-else class="modal-description empty">Нет описания</p>

          <div
            v-if="card.deadline"
            class="modal-deadline"
            :class="{ overdue: isOverdue(card.deadline) }"
          >
            Дедлайн: {{ formatDate(card.deadline) }}
          </div>

          <div v-if="card.subtask?.length" class="modal-subtasks">
            <h3>Подзадачи {{ subtaskProgress(card.subtask) }}</h3>
            <label v-for="st in card.subtask" :key="st.id" class="subtask-item">
              <input type="checkbox" :checked="st.done" @change="toggleSubtask(st)" />
              <span :class="{ done: st.done }">{{ st.text }}</span>
            </label>
          </div>

          <div class="modal-comments">
            <h3>Комментарии {{ card.comments?.length ? `(${card.comments.length})` : '' }}</h3>
            <div v-for="c in card.comments" :key="c.id" class="comment-item">
              <div class="comment-header">
                <span class="comment-time">{{ formatDate(c.createdAt) }}</span>
                <button class="btn-icon comment-delete" @click="deleteComment(c.id)">✕</button>
              </div>
              <p class="comment-text">{{ c.text }}</p>
            </div>
            <div class="comment-add">
              <textarea
                v-model="newComment"
                class="textarea"
                placeholder="Написать комментарий..."
                rows="2"
                @keydown.ctrl.enter="addComment"
              />
              <button class="btn btn-accent btn-sm" @click="addComment">Отправить</button>
            </div>
          </div>

          <div v-if="moveTargetColumns.length" class="modal-move">
            <h3>Переместить в</h3>
            <div class="move-buttons">
              <button
                v-for="col in moveTargetColumns"
                :key="col.id"
                class="btn btn-primary btn-sm"
                @click="moveCard(col.id)"
              >
                {{ col.title }}
              </button>
            </div>
          </div>

          <div class="modal-meta">Создано: {{ formatDate(card.createdAt) }}</div>

          <div class="modal-actions">
            <button class="btn btn-accent" @click="startEditing">Редактировать</button>
            <button class="btn btn-primary" @click="duplicateCard">Копировать</button>
            <button class="btn btn-primary" @click="archivedCard">Архив</button>
            <button class="btn btn-primary" @click="saveAsTemplate">Шаблон</button>
            <button class="btn btn-danger" @click="emit('delete', card.id)">Удалить</button>
          </div>
        </div>

        <!-- редактирование -->
        <div v-else class="modal-edit">
          <div class="edit-field">
            <label>Название</label>
            <input
              class="input input-bordered"
              v-model="editTitle"
              @keyup.enter="saveEdit"
              @keyup.escape="cancelEdit"
            />
          </div>

          <div class="edit-field">
            <label>Описание</label>
            <textarea
              v-model="editDescription"
              class="textarea"
              rows="3"
              placeholder="Поддерживается Markdown: **жирный**, *курсив*, # заголовок, - список, `код`"
            />
          </div>

          <div class="edit-field">
            <label>Дедлайн</label>
            <input type="date" class="input input-bordered" v-model="editDeadline" />
          </div>

          <div class="edit-field">
            <label>Подзадачи</label>
            <div v-for="st in editSubTask" :key="st.id" class="edit-subtask">
              <span>{{ st.text }}</span>
              <button @click="removeSubtask(st.id)">✕</button>
            </div>
            <div class="add-subtask">
              <input
                v-model="newSubTask"
                class="input"
                placeholder="Новая подзадача..."
                @keyup.enter="addSubtask"
              />
              <button class="btn btn-accent btn-sm" @click="addSubtask">+</button>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn btn-accent" @click="saveEdit">Сохранить</button>
            <button class="btn btn-ghost" @click="cancelEdit">Отмена</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--modal-overlay);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--modal-bg);
  border: 1px solid var(--border-medium);
  border-radius: 16px;
  padding: 28px;
  width: 90%;
  max-width: 520px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  color: var(--modal-text);
  box-shadow:
    0 24px 64px var(--shadow),
    0 0 80px var(--accent-glow);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  color: var(--modal-text-dim);
  font-size: 16px;
}

.modal-close:hover {
  color: var(--modal-text-muted);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--modal-heading);
}

.priority-badge {
  padding: 4px 10px;
  font-size: 0.7rem;
  border-radius: 6px;
}

.priority-badge.low {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.priority-badge.medium {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.priority-badge.high {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.modal-description {
  margin: 0 0 20px;
  line-height: 1.6;
  font-size: 13px;
  color: var(--modal-text-sub);
}

.modal-description.empty {
  color: var(--modal-text-dim);
  font-style: italic;
}

.modal-deadline {
  margin-bottom: 20px;
  font-size: 12px;
  color: var(--modal-text-muted);
}

.modal-deadline.overdue {
  color: #ef4444;
  font-weight: 600;
}

.modal-subtasks {
  margin-bottom: 20px;
}

.modal-subtasks h3 {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--modal-text-muted);
}

.subtask-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  cursor: pointer;
  font-size: 13px;
  color: var(--modal-text-body);
}

.subtask-item .done {
  text-decoration: line-through;
  color: var(--modal-text-dim);
}

.modal-move {
  margin-bottom: 20px;
}

.modal-move h3 {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--modal-text-muted);
}

.move-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.modal-meta {
  font-size: 10px;
  color: var(--modal-text-dim);
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal-actions {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.modal-actions .btn {
  padding: 8px 4px;
  font-size: 11px;
  text-align: center;
  justify-content: center;
  white-space: nowrap;
}

/* режим редактирования */
.edit-field {
  margin-bottom: 20px;
}

.edit-field label {
  display: block;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--modal-text-muted);
}

.edit-field input,
.edit-field textarea {
  width: 100%;
}

.edit-subtask {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 13px;
  color: var(--modal-text-body);
}

.edit-subtask button {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 12px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.edit-subtask button:hover {
  opacity: 1;
}

.add-subtask {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.add-subtask input {
  flex: 1;
}

.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 20px;
}

.tag-badge {
  border: 1.5px solid transparent;
  background: transparent;
  opacity: 0.4;
  transition: all 0.2s;
}

.tag-badge:hover {
  opacity: 0.7;
}

.tag-badge.active {
  opacity: 1;
  color: #fff;
  border-color: transparent;
}

.modal-comments {
  margin-bottom: 20px;
}

.modal-comments h3 {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--modal-text-muted);
}

.comment-item {
  padding: 10px 12px;
  background: var(--modal-card-bg);
  border: 1px solid var(--modal-card-border);
  border-radius: 10px;
  margin-bottom: 8px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.comment-time {
  font-size: 10px;
  color: var(--modal-text-dim);
}

.comment-delete {
  font-size: 12px;
  color: var(--modal-text-dim);
}

.comment-delete:hover {
  color: #ef4444;
}

.comment-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--modal-text-body);
}

.comment-add textarea {
  width: 100%;
}

.comment-add button {
  margin-top: 8px;
}

.modal-description :deep(h1),
.modal-description :deep(h2),
.modal-description :deep(h3) {
  margin: 8px 0 4px;
  color: var(--modal-heading);
}

.modal-description :deep(p) {
  margin: 0 0 8px;
}

.modal-description :deep(ul),
.modal-description :deep(ol) {
  margin: 0 0 8px;
  padding-left: 20px;
}

.modal-description :deep(code) {
  background: var(--modal-card-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85em;
}

.modal-description :deep(pre) {
  background: var(--modal-card-bg);
  padding: 12px;
  border-radius: 10px;
  overflow-x: auto;
  margin: 0 0 8px;
}

.modal-description :deep(pre code) {
  padding: 0;
  background: none;
}

.modal-description :deep(a) {
  color: #a78bfa;
}

.modal-description :deep(blockquote) {
  border-left: 2px solid var(--accent);
  margin: 0 0 8px;
  padding-left: 12px;
  color: var(--modal-text-muted);
}

/* мобильная версия */
@media (max-width: 768px) {
  .modal-overlay {
    align-items: flex-end;
  }

  .modal-content {
    width: 100%;
    max-width: 100%;
    max-height: 92vh;
    border-radius: 16px 16px 0 0;
    padding: 16px 16px 20px;
    animation: slideUp 0.3s ease-out;
  }

  .modal-content::before {
    content: '';
    display: block;
    width: 36px;
    height: 4px;
    background: var(--modal-grab);
    border-radius: 2px;
    margin: 0 auto 12px;
  }

  .modal-close {
    top: 16px;
    right: 16px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }

  .modal-header {
    flex-wrap: wrap;
    gap: 8px;
    padding-right: 40px;
  }

  .modal-header h2 {
    font-size: 1.1rem;
    width: 100%;
  }

  .modal-tags {
    gap: 8px;
  }

  .tag-badge {
    padding: 6px 12px;
    font-size: 0.75rem;
  }

  .modal-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .modal-actions .btn {
    padding: 12px 8px;
    font-size: 12px;
    text-align: center;
    justify-content: center;
    white-space: nowrap;
    min-height: 44px;
  }

  .subtask-item {
    padding: 8px 0;
  }

  .subtask-item input[type='checkbox'] {
    width: 20px;
    height: 20px;
  }

  .comment-add textarea {
    font-size: 16px;
  }

  .edit-field input,
  .edit-field textarea {
    font-size: 16px;
    padding: 12px 14px;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.modal-content::-webkit-scrollbar {
  width: 4px;
}

.modal-content::-webkit-scrollbar-track {
  background: transparent;
}

.modal-content::-webkit-scrollbar-thumb {
  background: var(--modal-scrollbar);
  border-radius: 2px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: var(--modal-text-dim);
}
</style>
