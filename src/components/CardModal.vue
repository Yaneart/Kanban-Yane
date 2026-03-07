<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Card, Comment, SubTask, Tag } from '@/types'
import { useHistory } from '@/composables/useHistory'
import { availableTags } from '@/data/tags'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/utils/format'
import { marked } from 'marked'

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

onMounted(() => {
  overlayRef.value?.focus()
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

  emit('update', updateCard)
  addHistory(`Редактирование карточки:"${title}"`)
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}

function togglePriority() {
  const priorities: Card['priority'][] = ['low', 'medium', 'high']
  const currentIndex = priorities.indexOf(props.card.priority)
  const nextPriority = priorities[(currentIndex + 1) % priorities.length]

  emit('update', { ...props.card, priority: nextPriority ?? 'low' })
  addHistory(`Смена приоритета на ${nextPriority}`)
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
  emit('update', { ...props.card, tags: newTag })
  addHistory(`${exists ? 'Убрана' : 'Добавлена'} метка "${tag.name}"`)
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
  emit('update', { ...props.card, comments: updateComments })
  addHistory(`Комментарий к "${props.card.title}"`)
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
  emit('update', { ...props.card, archived: true })
  addHistory(`Архивирована карточка "${props.card.title}"`)
  addToast('Карточка архивирована', 'info')
  emit('close')
}

const moveTargetColumns = computed(() =>
  props.columns.filter((c) => c.id !== props.currentColumnId),
)

function moveCard(targetColumnId: string) {
  emit('move', props.card.id, targetColumnId)
  const targetCol = props.columns.find((c) => c.id === targetColumnId)
  addHistory(`Карточка "${props.card.title}" перемещена в "${targetCol?.title}"`)
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
  emit('duplicate', copy)
  addHistory(`Скопирована карточка "${props.card.title}"`)
  addToast('Карточка скопирована', 'success')
  emit('close')
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

        <!-- Просмотр -->
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
            <button class="btn btn-danger" @click="emit('delete', card.id)">Удалить</button>
          </div>
        </div>

        <!-- Редактирование -->
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
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-column);
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  color: var(--text-primary);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
}

.priority-badge {
  padding: 4px 10px;
  font-size: 0.75rem;
}

.priority-badge.low {
  background: var(--priority-low);
  color: #fff;
}

.priority-badge.medium {
  background: var(--priority-medium);
  color: #fff;
}

.priority-badge.high {
  background: var(--priority-high);
  color: #fff;
}

.modal-description {
  margin: 0 0 16px;
  line-height: 1.5;
}

.modal-description.empty {
  color: var(--text-secondary);
  font-style: italic;
}

.modal-deadline {
  margin-bottom: 16px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.modal-deadline.overdue {
  color: var(--priority-high);
  font-weight: 600;
}

.modal-subtasks {
  margin-bottom: 16px;
}

.modal-subtasks h3 {
  margin: 0 0 8px;
  font-size: 1rem;
}

.subtask-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  cursor: pointer;
}

.subtask-item .done {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.modal-move {
  margin-bottom: 16px;
}

.modal-move h3 {
  margin: 0 0 8px;
  font-size: 1rem;
}

.move-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.modal-meta {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  gap: 8px;
}

/* Edit mode */
.edit-field {
  margin-bottom: 16px;
}

.edit-field label {
  display: block;
  margin-bottom: 4px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.edit-field input,
.edit-field textarea {
  width: 100%;
}

.edit-subtask {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.edit-subtask button {
  background: none;
  border: none;
  color: var(--priority-high);
  cursor: pointer;
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
  margin-bottom: 16px;
}

.tag-badge {
  border: 1.5px solid transparent;
  background: transparent;
  opacity: 0.4;
  transition: opacity 0.2s;
}

.tag-badge.active {
  opacity: 1;
  color: #fff;
  border-color: transparent;
}

.modal-comments {
  margin-bottom: 16px;
}

.modal-comments h3 {
  margin: 0 0 8px;
  font-size: 1rem;
}

.comment-item {
  padding: 8px;
  background: var(--bg-input);
  border-radius: 8px;
  margin-bottom: 8px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.comment-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.comment-delete {
  font-size: 14px;
}

.comment-delete:hover {
  color: var(--priority-high);
}

.comment-text {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.4;
}

.comment-add textarea {
  width: 100%;
}

.comment-add button {
  margin-top: 6px;
}

.modal-description :deep(h1),
.modal-description :deep(h2),
.modal-description :deep(h3) {
  margin: 8px 0 4px;
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
  background: var(--bg-input);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85em;
}

.modal-description :deep(pre) {
  background: var(--bg-input);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0 0 8px;
}

.modal-description :deep(pre code) {
  padding: 0;
  background: none;
}

.modal-description :deep(a) {
  color: var(--accent);
}

.modal-description :deep(blockquote) {
  border-left: 3px solid var(--accent);
  margin: 0 0 8px;
  padding-left: 12px;
  color: var(--text-secondary);
}

/* ===== Mobile ===== */
@media (max-width: 768px) {
  .modal-overlay {
    align-items: flex-end;
  }

  .modal-content {
    width: 100%;
    max-width: 100%;
    max-height: 92vh;
    border-radius: 16px 16px 0 0;
    padding: 20px 16px;
    padding-top: 12px;
  }

  .modal-content::before {
    content: '';
    display: block;
    width: 36px;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    margin: 0 auto 12px;
  }

  .modal-close {
    top: 16px;
    right: 16px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .modal-header {
    flex-wrap: wrap;
    gap: 8px;
    padding-right: 40px;
  }

  .modal-header h2 {
    font-size: 1.15rem;
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
    font-size: 13px;
    text-align: center;
    justify-content: center;
    white-space: nowrap;
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
    padding: 10px 12px;
  }
}
</style>
