const STORAGE_KEY = 'pandaslab_progress'

export function saveProgress(projectId, code, progress, status, extra = {}) {
  const data = getAllProgress()
  data[projectId] = {
    code,
    progress,
    status,
    lastEdited: new Date().toISOString(),
    ...extra
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getProgress(projectId) {
  const data = getAllProgress()
  return data[projectId] || null
}

export function getAllProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export function deleteProgress(projectId) {
  const data = getAllProgress()
  delete data[projectId]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
