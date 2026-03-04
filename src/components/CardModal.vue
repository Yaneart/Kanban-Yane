<script setup lang="ts">
import { ref } from 'vue'
import type { Card, SubTask } from '@/types'
import { useHistory } from '@/composables/useHistory'

const props = defineProps<{
  card: Card
}>()

const emit = defineEmits<{
  close: []
  update: [card: Card]
  delete: [id: string]
}>()

const { addHistory } = useHistory()

const isEditing = ref(false)

const editTitle = ref('')
const editDescription = ref('')
const editDeadline = ref('')
const editSubTask = ref<SubTask[]>([])
const newSubTask = ref('')

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

function formaterDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString()
}

function isOverdue(deadline: number) {
  return deadline < Date.now()
}

function subtaskProgress(subtask: SubTask[]) {
  if (!subtask.length) return ''

  const done = subtask.filter((s) => s.done).length
  return `${done}/${subtask.length}`
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content">
        <button class="modal-close" @click="emit('close')">✕</button>

        <!-- Просмотр -->
        <div v-if="!isEditing" class="modal-view">
          <div class="modal-header">
            <h2>{{ card.title }}</h2>
            <span class="priority-badge" :class="card.priority" @click="togglePriority">
              {{ card.priority }}
            </span>
          </div>

          <p v-if="card.description" class="modal-description">
            {{ card.description }}
          </p>
          <p v-else class="modal-description empty">No description</p>

          <div
            v-if="card.deadline"
            class="modal-deadline"
            :class="{ overdue: isOverdue(card.deadline) }"
          >
            Deadline: {{ formaterDate(card.deadline) }}
          </div>

          <div v-if="card.subtask?.length" class="modal-subtasks">
            <h3>Subtasks {{ subtaskProgress(card.subtask) }}</h3>
            <label v-for="st in card.subtask" :key="st.id" class="subtask-item">
              <input type="checkbox" :checked="st.done" @change="toggleSubtask(st)" />
              <span :class="{ done: st.done }">{{ st.text }}</span>
            </label>
          </div>

          <div class="modal-meta">Created: {{ formaterDate(card.createdAt) }}</div>

          <div class="modal-actions">
            <button class="btn-edit" @click="startEditing">Edit</button>
            <button class="btn-delete" @click="emit('delete', card.id)">Delete</button>
          </div>
        </div>

        <!-- Редактирование -->
        <div v-else class="modal-edit">
          <div class="edit-field">
            <label>Title</label>
            <input v-model="editTitle" @keyup.enter="saveEdit" @keyup.escape="cancelEdit" />
          </div>

          <div class="edit-field">
            <label>Description</label>
            <textarea v-model="editDescription" rows="3" />
          </div>

          <div class="edit-field">
            <label>Deadline</label>
            <input type="date" v-model="editDeadline" />
          </div>

          <div class="edit-field">
            <label>Subtasks</label>
            <div v-for="st in editSubTask" :key="st.id" class="edit-subtask">
              <span>{{ st.text }}</span>
              <button @click="removeSubtask(st.id)">✕</button>
            </div>
            <div class="add-subtask">
              <input v-model="newSubTask" placeholder="New subtask..." @keyup.enter="addSubtask" />
              <button @click="addSubtask">+</button>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-save" @click="saveEdit">Save</button>
            <button class="btn-cancel" @click="cancelEdit">Cancel</button>
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
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
}

.modal-close:hover {
  color: var(--text-primary);
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
  border-radius: 12px;
  font-size: 0.75rem;
  text-transform: uppercase;
  cursor: pointer;
  font-weight: 600;
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

.modal-meta {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  gap: 8px;
}

.btn-edit,
.btn-save {
  padding: 8px 20px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
  font-weight: 600;
}

.btn-delete {
  padding: 8px 20px;
  border: none;
  border-radius: 8px;
  background: var(--priority-high);
  color: #fff;
  cursor: pointer;
  font-weight: 600;
}

.btn-cancel {
  padding: 8px 20px;
  border: none;
  border-radius: 8px;
  background: var(--bg-hover);
  color: var(--text-primary);
  cursor: pointer;
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
  padding: 8px 12px;
  border: 1px solid var(--bg-hover);
  border-radius: 8px;
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: 0.9rem;
  box-sizing: border-box;
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
  padding: 6px 10px;
  border: 1px solid var(--bg-hover);
  border-radius: 8px;
  background: var(--bg-input);
  color: var(--text-primary);
}

.add-subtask button {
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
}
</style>
