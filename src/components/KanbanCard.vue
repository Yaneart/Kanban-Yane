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

function startEditing() {
  editTitle.value = props.card.title
  editDiscription.value = props.card.description
  isEditing.value = true
}

function saveEdit() {
  const title = editTitle.value.trim()
  if (!title) return
  props.card.title = title
  props.card.description = editDiscription.value.trim()
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}
</script>

<template>
  <div class="kanban-card" @dblclick="startEditing">
    <button class="delete-btn" @click="emit('delete', card.id)">x</button>

    <template v-if="isEditing">
      <input
        v-model="editTitle"
        class="edit-input"
        @keyup.enter="saveEdit"
        @keyup.escape="cancelEdit"
      />
      <textarea v-model="editDiscription" class="edit-textarea" @keyup.escape="cancelEdit" />
      <div class="edit-actions">
        <button class="save-btn" @click="saveEdit">Сохранить</button>
        <button class="cancel-btn" @click="cancelEdit">Отмена</button>
      </div>
    </template>

    <template v-else>
      <h4>{{ card.title }}</h4>
      <p>{{ card.description }}</p>
    </template>
  </div>
</template>

<style scoped>
.kanban-card {
  position: relative;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.kanban-card h4 {
  margin: 0 0 4px;
  font-size: 14px;
}

.kanban-card p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: none;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  padding: 0 4px;
}

.delete-btn:hover {
  color: #e74c3c;
}

.edit-input {
  width: 100%;
  padding: 4px 8px;
  font-size: 14px;
  font-weight: bold;
  border: 1px solid #4a90d9;
  border-radius: 4px;
  margin-bottom: 4px;
  box-sizing: border-box;
}

.edit-textarea {
  width: 100%;
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #4a90d9;
  border-radius: 4px;
  resize: vertical;
  min-height: 40px;
  box-sizing: border-box;
}

.edit-actions {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.save-btn {
  padding: 4px 8px;
  background: #4a90d9;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.cancel-btn {
  padding: 4px 8px;
  background: #ccc;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
</style>
