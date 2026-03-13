import { computed, ref } from 'vue'

const STORAGE_KEY = 'kanban-onboarding-done'

export interface OnboardingStep {
  target: string
  title: string
  text: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

const steps: OnboardingStep[] = [
  {
    target: '.search-input',
    title: 'Поиск',
    text: 'Быстрый поиск карточек по названию',
    position: 'bottom',
  },
  {
    target: '.btn-group',
    title: 'Панели',
    text: 'Фон, теги, история, архив и статистика',
    position: 'bottom',
  },
  {
    target: '.add-card',
    title: 'Новая карточка',
    text: 'Введите название и нажмите Enter или +',
    position: 'top',
  },
  {
    target: '.kanban-card',
    title: 'Карточка',
    text: 'Кликните чтобы открыть, Tab для навигации',
    position: 'right',
  },
]

export function useOnboarding() {
  const isActive = ref(false)
  const currentStep = ref(0)

  function start() {
    if (localStorage.getItem(STORAGE_KEY)) return

    isActive.value = true
    currentStep.value = 0
  }

  function next() {
    if (currentStep.value < steps.length - 1) {
      currentStep.value++
    } else {
      finish()
    }
  }

  function skip() {
    finish()
  }

  function finish() {
    isActive.value = false
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  const currentStepData = computed(() => steps[currentStep.value]!)

  return { isActive, currentStep, steps, start, next, skip, currentStepData }
}
