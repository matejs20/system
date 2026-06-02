const PROFILE_KEY = 'system_profile'
const TASKS_KEY   = 'system_tasks'
const STATE_KEY   = 'system_state'

export function saveProfile(profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  } catch (err) {
    console.error('SYSTEM STORAGE ERROR (saveProfile):', err)
  }
}

export function loadProfile() {
  try {
    const data = localStorage.getItem(PROFILE_KEY)
    return data ? JSON.parse(data) : null
  } catch (err) {
    console.error('SYSTEM STORAGE ERROR (loadProfile) - Korumpirani podaci:', err)
    return null // Siguran povratak kako se aplikacija ne bi srušila
  }
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  } catch (err) {
    console.error('SYSTEM STORAGE ERROR (saveTasks):', err)
  }
}

export function loadTasks() {
  try {
    const data = localStorage.getItem(TASKS_KEY)
    return data ? JSON.parse(data) : {}
  } catch (err) {
    console.error('SYSTEM STORAGE ERROR (loadTasks) - Korumpirani podaci:', err)
    return {} // Vraća prazan objekt kako bi state.js i dalje mogao raditi s njim
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state))
  } catch (err) {
    console.error('SYSTEM STORAGE ERROR (saveState):', err)
  }
}

export function loadState() {
  try {
    const data = localStorage.getItem(STATE_KEY)
    return data ? JSON.parse(data) : null
  } catch (err) {
    console.error('SYSTEM STORAGE ERROR (loadState) - Korumpirani podaci:', err)
    return null
  }
}

export function clearAll() {
  try {
    localStorage.removeItem(PROFILE_KEY)
    localStorage.removeItem(TASKS_KEY)
    localStorage.removeItem(STATE_KEY)
  } catch (err) {
    console.error('SYSTEM STORAGE ERROR (clearAll):', err)
  }
}