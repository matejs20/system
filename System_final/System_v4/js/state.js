// POPRAVLJENO: Dodan saveTasks u import listu kako bi se promjene stvarno zapisivale!
import { loadProfile, loadTasks, loadState, saveState, saveTasks } from './storage.js'

export let appData = null

export const state = {
  profile:    null,
  tasks:      {},
  xp:         0,
  level:      1,
  streak:     0,
  lastActive: null,
  selectedDay: getTodayKey(),
}

export function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

export async function loadAppData() {
  try {
    const res = await fetch('./data.json')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    appData = await res.json()
    console.log('appData loaded:', appData)
  } catch (err) {
    console.error('loadAppData failed, using system fallbacks:', err)
    appData = {
      categories: [
        { id: 'vjezba',   label: 'Vježbanje', icon: 'ti-run',       color: 'blue'   },
        { id: 'skola',    label: 'Škola',     icon: 'ti-book',      color: 'purple' },
        { id: 'zdravlje', label: 'Zdravlje',  icon: 'ti-heart',     color: 'teal'   },
        { id: 'hobi',     label: 'Hobi',      icon: 'ti-palette',   color: 'amber'  },
        { id: 'posao',    label: 'Posao',     icon: 'ti-briefcase', color: 'gray'   },
        { id: 'ucenje',   label: 'Učenje',    icon: 'ti-brain',     color: 'coral'  },
        { id: 'projekti', label: 'Projekti',  icon: 'ti-stack-2',   color: 'pink'   }
      ],
      xpValues: { easy: 25, medium: 50, hard: 100 },
      levelThreshold: 500
    }
  }
}

export function initState() {
  const profile    = loadProfile()
  const tasks      = loadTasks()
  const savedState = loadState()

  state.profile = profile
  state.tasks   = tasks || {} // Osiguravamo da je objekt čak i ako je prazan

  if (savedState) {
    state.xp         = savedState.xp
    state.level      = savedState.level
    state.streak     = savedState.streak
    state.lastActive = savedState.lastActive
  }

  checkStreak()
}

function checkStreak() {
  const today     = getTodayKey()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = yesterday.toISOString().split('T')[0]

  if (!state.lastActive) return
  if (state.lastActive === yesterdayKey) return
  if (state.lastActive === today) return

  state.streak = 0
  persistState()
}

export function addTask(task) {
  const day = state.selectedDay

  if (!state.tasks[day]) state.tasks[day] = []

  state.tasks[day].push({
    id:         crypto.randomUUID(),
    text:       task.text,
    category:   task.category,
    difficulty: task.difficulty,
    done:       false,
    xp:         task.xp,
  })

  // POPRAVLJENO: Obavezno spremamo zadatke nakon dodavanja!
  saveTasks(state.tasks)
}

/**
 * Označava zadatak obavljenim ili neobavljenim.
 * @returns {Object} Vraća objekt { leveledUp: boolean, task: Object } kako bi UI znao reagirati.
 */
export function toggleTask(taskId) {
  const day   = state.selectedDay
  const tasks = state.tasks[day] ?? []
  const task  = tasks.find(t => t.id === taskId)

  if (!task) return { leveledUp: false, task: null }

  task.done = !task.done
  let leveledUp = false

  if (task.done) {
    state.xp += task.xp
    leveledUp = checkLevelUp()
    updateStreak()
  } else {
    state.xp = Math.max(0, state.xp - task.xp)
    checkLevelDown()
  }

  // POPRAVLJENO: Spremanje novog stanja zadataka i profila u LocalStorage
  saveTasks(state.tasks)
  persistState()

  return { leveledUp, task }
}

function checkLevelUp() {
  const newLevel = Math.floor(state.xp / appData.levelThreshold) + 1
  if (newLevel > state.level) {
    state.level = newLevel
    return true // Triggers screen animation
  }
  return false
}

function checkLevelDown() {
  const expectedLevel = Math.floor(state.xp / appData.levelThreshold) + 1
  if (expectedLevel < state.level) {
    state.level = expectedLevel
  }
}

function updateStreak() {
  const today = getTodayKey()
  if (state.lastActive === today) return
  state.streak    += 1
  state.lastActive = today
  persistState()
}

export function persistState() {
  saveState({
    xp:         state.xp,
    level:      state.level,
    streak:     state.streak,
    lastActive: state.lastActive,
  })
}