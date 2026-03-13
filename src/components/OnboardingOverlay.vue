<script setup lang="ts">
import type { OnboardingStep } from '@/composables/useOnboarding'
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue'

const props = defineProps<{
  step: OnboardingStep
  current: number
  total: number
}>()

const emit = defineEmits<{
  next: []
  skip: []
}>()

const tooltipStyle = ref<Record<string, string>>({})

function updatePosition() {
  const el = document.querySelector(props.step.target)
  if (!el) return

  const rect = el.getBoundingClientRect()
  const style: Record<string, string> = { position: 'fixed' }

  switch (props.step.position) {
    case 'bottom':
      style.top = rect.bottom + 12 + 'px'
      style.left = rect.left + rect.width / 2 + 'px'
      style.transform = 'translateX(-50%)'
      break

    case 'top':
      style.bottom = window.innerHeight - rect.top + 12 + 'px'
      style.left = rect.left + rect.width / 2 + 'px'
      style.transform = 'translateX(-50%)'
      break

    case 'right':
      style.top = rect.top + rect.height / 2 + 'px'
      style.left = rect.right + 12 + 'px'
      style.transform = 'translateY(-50%)'
      break

    case 'left':
      style.top = rect.top + rect.height / 2 + 'px'
      style.right = window.innerWidth - rect.left + 12 + 'px'
      style.transform = 'translateY(-50%)'
      break
  }

  tooltipStyle.value = style
}

watch(
  () => props.current,
  () => nextTick(updatePosition),
)

onMounted(() => {
  updatePosition()
  window.addEventListener('resize', updatePosition)
})

onUnmounted(() => window.removeEventListener('resize', updatePosition))
</script>

<template>
  <div class="onboarding-overlay" @click.self="emit('skip')">
    <div class="onboarding-tooltip" :style="tooltipStyle">
      <h4>{{ step.title }}</h4>
      <p>{{ step.text }}</p>
      <div class="onboarding-footer">
        <span class="onboarding-progress">{{ current + 1 }}/{{ total }}</span>
        <div class="onboarding-actions">
          <button class="btn btn-ghost btn-sm" @click="emit('skip')">Пропустить</button>
          <button class="btn btn-accent btn-sm" @click="emit('next')">
            {{ current === total - 1 ? 'Готово' : 'Далее' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.onboarding-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
}

.onboarding-tooltip {
  background: var(--bg-column-solid, #1a1a2e);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  padding: 16px;
  max-width: 260px;
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(139, 92, 246, 0.1);
  z-index: 2001;
}

.onboarding-tooltip h4 {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 700;
  color: #a78bfa;
}

.onboarding-tooltip p {
  margin: 0 0 12px;
  font-size: 12px;
  color: var(--text-primary, #ccc);
  line-height: 1.5;
}

.onboarding-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.onboarding-progress {
  font-size: 10px;
  color: var(--text-muted, #555);
}

.onboarding-actions {
  display: flex;
  gap: 6px;
}
</style>
