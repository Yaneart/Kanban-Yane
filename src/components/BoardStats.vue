<script setup lang="ts">
import type { Board } from '@/types'
import { computed } from 'vue'

const props = defineProps<{
  board: Board
}>()

const totalCards = computed(() => {
  return props.board.columns.reduce((sum, col) => sum + col.cards.length, 0)
})

const archivedCards = computed(() => {
  return props.board.columns.reduce(
    (sum, col) => sum + col.cards.filter((c) => c.archived).length,
    0,
  )
})

const activeCards = computed(() => {
  return totalCards.value - archivedCards.value
})

const completionPercent = computed(() => {
  return totalCards.value === 0 ? 0 : Math.round((archivedCards.value / totalCards.value) * 100)
})

const columnStats = computed(() => {
  return props.board.columns.map((col) => ({
    id: col.id,
    title: col.title,
    total: col.cards.length,
    active: col.cards.filter((c) => !c.archived).length,
    archived: col.cards.filter((c) => c.archived).length,
  }))
})

const maxInColumn = computed(() => {
  return Math.max(...columnStats.value.map((c) => c.active), 1)
})
</script>

<template>
  <div class="stats-overview">
    <div class="stat-card">
      <span class="stat-value">{{ activeCards }}</span>
      <span class="stat-label">Активных</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{{ archivedCards }}</span>
      <span class="stat-label">Выполнено</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{{ totalCards }}</span>
      <span class="stat-label">Всего</span>
    </div>
  </div>

  <div class="completion-section">
    <div class="completion-header">
      <span>Прогресс</span>
      <span>{{ completionPercent }}%</span>
    </div>
    <div class="completion-bar">
      <div class="completion-fill" :style="{ width: completionPercent + '%' }"></div>
    </div>
  </div>

  <div class="columns-section">
    <h4>По колонкам</h4>
    <div class="column-stat" v-for="(col, index) in columnStats" :key="index">
      <div class="column-stat-header">
        <span class="column-stat-title">{{ col.title }}</span>
        <span class="column-stat-count">{{ col.active }}</span>
      </div>
      <div class="column-bar">
        <div
          class="column-bar-fill"
          :style="{
            width: (col.active / maxInColumn) * 100 + '%',
            '--bar-index': index,
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-family: 'Syne', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.completion-section {
  margin-bottom: 24px;
}

.completion-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.completion-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  overflow: hidden;
}

.completion-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), #ec4899);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.columns-section h4 {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.column-stat {
  margin-bottom: 14px;
}

.column-stat-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.column-stat-title {
  font-size: 0.8rem;
  color: var(--text-primary);
}

.column-stat-count {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.column-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}

.column-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
  background: hsl(calc(260 - var(--bar-index) * 30), 70%, 60%);
}
</style>
