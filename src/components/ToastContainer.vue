<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div v-for="toast in toasts" :key="toast.id" :class="['toast', `toast-${toast.type}`]">
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.toast {
  padding: 12px 16px 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  background: var(--bg-column);
  color: var(--text-primary);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 16px var(--shadow);
  border: 1px solid var(--bg-hover);
}

.toast-success {
  border-color: var(--priority-low);
}

.toast-error {
  border-color: var(--priority-high);
}

.toast-info {
  border-color: var(--accent);
}

.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
