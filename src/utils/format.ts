export function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString()
}

export function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString()
}
