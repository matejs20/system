import { initState, loadAppData, state, appData,
         addTask, toggleTask, persistState, getTodayKey } from './state.js'
import { loadProfile, saveTasks, clearAll } from './storage.js'

// ── DOM refs ──────────────────────────────────────────────────────────────────
const greeting        = document.getElementById('greeting')
const usernameEl      = document.getElementById('username')
const levelDisplay    = document.getElementById('levelDisplay')
const rankDisplay     = document.getElementById('rankDisplay')
const xpDisplay       = document.getElementById('xpDisplay')
const xpBar           = document.getElementById('xpBar')
const lvlFrom         = document.getElementById('lvlFrom')
const lvlTo           = document.getElementById('lvlTo')
const streakDisplay   = document.getElementById('streakDisplay')
const streakFlame     = document.getElementById('streakFlame')
const streakDots      = document.getElementById('streakDots')
const todayXp         = document.getElementById('todayXp')
const catCount        = document.getElementById('catCount')
const taskList        = document.getElementById('taskList')
const questComplete   = document.getElementById('questComplete')
const addTaskBtn      = document.getElementById('addTaskBtn')
const modalBackdrop   = document.getElementById('modalBackdrop')
const cancelBtn       = document.getElementById('cancelBtn')
const confirmBtn      = document.getElementById('confirmBtn')
const taskInput       = document.getElementById('taskInput')
const taskError       = document.getElementById('taskError')
const catChips        = document.getElementById('catChips')
const catChipError    = document.getElementById('catChipError')
const levelupOverlay  = document.getElementById('levelupOverlay')
const levelupNum      = document.getElementById('levelupNum')
const rankupOverlay   = document.getElementById('rankupOverlay')
const rankupLabel     = document.getElementById('rankupLabel')
const accountBtn      = document.getElementById('accountBtn')
const accountBackdrop = document.getElementById('accountBackdrop')
const accountCloseBtn = document.getElementById('accountCloseBtn')
const logoutBtn       = document.getElementById('logoutBtn')
const navUsername     = document.getElementById('navUsername')
const navClock        = document.getElementById('navClock')
const accountAvatar   = document.getElementById('accountAvatar')
const accountName     = document.getElementById('accountName')
const accountLevel    = document.getElementById('accountLevel')
const accountRank     = document.getElementById('accountRank')
const accountXp       = document.getElementById('accountXp')
const accountStreak   = document.getElementById('accountStreak')
const accountCreated  = document.getElementById('accountCreated')
const accountCats     = document.getElementById('accountCats')
const circleTrack     = document.getElementById('circleTrack')
const circlePct       = document.getElementById('circlePct')
const systemMessage   = document.getElementById('systemMessage')
const systemMsgText   = document.getElementById('systemMessageText')

// ── Constants ─────────────────────────────────────────────────────────────────
const RANKS = ['E-RANK','D-RANK','C-RANK','B-RANK','A-RANK','S-RANK']

// XP thresholds for each rank (cumulative)
const RANK_THRESHOLDS = [0, 500, 1500, 3500, 7000, 12000]

const SYSTEM_MESSAGES = [
  'Discipline is doing what needs to be done, even when you don\'t feel like it.',
  'Small steps every day compound into massive results.',
  'Every completed quest moves you closer to your best version.',
  'The system doesn\'t care about motivation. It cares about consistency.',
  'Hard tasks build the strongest players.',
  'Progress is progress, no matter how small.',
  'Today\'s effort is tomorrow\'s advantage.',
  'Level up your real life — one task at a time.',
]

const CIRCUMFERENCE = 2 * Math.PI * 32  // r=32

let selectedDifficulty = 'easy'
let selectedCategory   = null

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  const profile = loadProfile()
  if (!profile) { window.location.href = 'index.html'; return }

  await loadAppData()
  initState()

  renderGreeting(profile.username)
  renderCategoryChips(profile.categories)
  renderSystemMessage()
  renderAll()
  bindEvents()
  startClock()
}

// ── Clock ─────────────────────────────────────────────────────────────────────
function startClock() {
  function update() {
    const now = new Date()
    const hh  = String(now.getHours()).padStart(2, '0')
    const mm  = String(now.getMinutes()).padStart(2, '0')
    const dd  = String(now.getDate()).padStart(2, '0')
    const mo  = String(now.getMonth() + 1).padStart(2, '0')
    const yy  = now.getFullYear()
    navClock.textContent = `[ ${hh}:${mm} // ${dd}.${mo}.${yy} ]`
  }
  update()
  setInterval(update, 30000)
}

// ── System message ────────────────────────────────────────────────────────────
function renderSystemMessage() {
  const idx = new Date().getDate() % SYSTEM_MESSAGES.length
  systemMsgText.textContent = SYSTEM_MESSAGES[idx]
}

// ── Greeting ──────────────────────────────────────────────────────────────────
function renderGreeting(name) {
  const hour = new Date().getHours()
  let greet = 'good evening'
  if (hour < 12) greet = 'good morning'
  else if (hour < 18) greet = 'good afternoon'

  greeting.textContent    = greet
  usernameEl.textContent  = name
  navUsername.textContent = name
}

// ── Rank ──────────────────────────────────────────────────────────────────────
function getRank(xp) {
  let rank = RANKS[0]
  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= RANK_THRESHOLDS[i]) { rank = RANKS[i]; break }
  }
  return rank
}

// ── Category chips (modal) ────────────────────────────────────────────────────
function renderCategoryChips(categories) {
  catChips.innerHTML = ''
  selectedCategory = null
  updateConfirmBtn()

  categories.forEach(id => {
    const cat = appData.categories.find(c => c.id === id)
    if (!cat) return
    const btn = document.createElement('button')
    btn.type      = 'button'
    btn.className = `chip chip--${cat.color ?? 'blue'}`
    btn.dataset.id = id
    btn.innerHTML = `<i class="ti ${cat.icon}" aria-hidden="true"></i> ${cat.label}`
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'))
      btn.classList.add('active')
      selectedCategory = id
      catChipError.textContent = ''
      updateConfirmBtn()
    })
    catChips.appendChild(btn)
  })
}

function updateConfirmBtn() {
  const hasText = taskInput?.value?.trim().length >= 2
  const hasCat  = !!selectedCategory
  const locked  = !(hasText && hasCat)
  confirmBtn.disabled = locked
  confirmBtn.classList.toggle('btn-primary--locked', locked)
}

// ── Render all ────────────────────────────────────────────────────────────────
function renderAll() {
  renderStats()
  renderTasks()
  renderCircle()
}

function renderStats() {
  const threshold = appData.levelThreshold
  const xpInLevel = state.xp % threshold
  const pct       = Math.round((xpInLevel / threshold) * 100)
  const rank      = getRank(state.xp)

  levelDisplay.textContent = `LVL ${state.level}`
  rankDisplay.textContent  = rank
  xpDisplay.innerHTML      = `${xpInLevel} <span class="stat-value__sub">/ ${threshold} XP</span>`
  xpBar.style.width        = `${pct}%`
  lvlFrom.textContent      = `LVL ${state.level}`
  lvlTo.textContent        = `LVL ${state.level + 1}`
  streakDisplay.textContent = state.streak

  // Flame animation based on streak
  if (state.streak >= 2) {
    streakFlame.classList.add('flame--active')
  } else {
    streakFlame.classList.remove('flame--active')
  }

  renderStreakDots()
  renderMetrics()
}

function renderStreakDots() {
  streakDots.innerHTML = ''
  for (let i = 0; i < 7; i++) {
    const dot = document.createElement('div')
    dot.className = 'streak-dot'
    if (i < state.streak && i < 6) dot.classList.add('done')
    if (i === Math.min(state.streak, 6)) dot.classList.add('today')
    streakDots.appendChild(dot)
  }
}

function renderMetrics() {
  const today    = getTodayKey()
  const tasks    = state.tasks[today] ?? []
  const done     = tasks.filter(t => t.done)
  const xpEarned = done.reduce((sum, t) => sum + t.xp, 0)
  const cats     = new Set(tasks.map(t => t.category))

  todayXp.textContent  = `+${xpEarned}`
  catCount.textContent = cats.size
}

function renderCircle() {
  const today  = getTodayKey()
  const tasks  = state.tasks[today] ?? []
  const total  = tasks.length
  const done   = tasks.filter(t => t.done).length
  const pct    = total === 0 ? 0 : Math.round((done / total) * 100)
  const offset = CIRCUMFERENCE * (1 - pct / 100)

  circleTrack.style.strokeDasharray  = CIRCUMFERENCE
  circleTrack.style.strokeDashoffset = offset
  circlePct.textContent = `${pct}%`

  // Flash on 100%
  if (pct === 100 && total > 0) {
    circleTrack.classList.add('circle-track--done')
  } else {
    circleTrack.classList.remove('circle-track--done')
  }
}

function renderTasks() {
  const today = getTodayKey()
  const tasks = state.tasks[today] ?? []
  taskList.innerHTML = ''

  if (tasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <i class="ti ti-sword" aria-hidden="true"></i>
        <p>no quests assigned.</p>
      </div>`
    questComplete.classList.remove('show')
    return
  }

  tasks.forEach(task => {
    const div = document.createElement('div')
    div.className = 'task'
    div.innerHTML = `
      <div class="task__check ${task.done ? 'done' : ''}" data-id="${task.id}">
        <i class="ti ti-check" aria-hidden="true"></i>
      </div>
      <span class="task__cat cat-${task.category}">${getCatLabel(task.category)}</span>
      <span class="task__text ${task.done ? 'done' : ''}">${task.text}</span>
      <span class="task__xp">+${task.xp} XP</span>`
    taskList.appendChild(div)
  })

  const allDone = tasks.length > 0 && tasks.every(t => t.done)
  questComplete.classList.toggle('show', allDone)
}

function getCatLabel(id) {
  return appData.categories.find(c => c.id === id)?.label ?? id
}

// ── Account modal ─────────────────────────────────────────────────────────────
function openAccount() {
  const profile = loadProfile()
  const rank    = getRank(state.xp)

  accountAvatar.textContent  = profile.username.slice(0, 2).toUpperCase()
  accountName.textContent    = profile.username
  accountLevel.textContent   = `LVL ${state.level}`
  accountRank.textContent    = rank
  accountXp.textContent      = `${state.xp} XP (total)`
  accountStreak.textContent  = `${state.streak} days`

  const date = new Date(profile.createdAt)
  accountCreated.textContent = `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}.`

  const catLabels = profile.categories
    .map(id => appData.categories.find(c => c.id === id)?.label ?? id)
    .join(', ')
  accountCats.textContent = catLabels

  accountBackdrop.classList.add('show')
}

function closeAccount() {
  accountBackdrop.classList.remove('show')
}

// ── Events ────────────────────────────────────────────────────────────────────
function bindEvents() {
  addTaskBtn.addEventListener('click', openModal)
  cancelBtn.addEventListener('click', closeModal)

  modalBackdrop.addEventListener('click', e => {
    if (e.target === modalBackdrop) closeModal()
  })

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeAccount() }
  })

  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      selectedDifficulty = btn.dataset.d
    })
  })

  taskInput.addEventListener('input', updateConfirmBtn)

  taskList.addEventListener('click', e => {
    const check = e.target.closest('.task__check')
    if (!check) return
    const prevLevel = state.level
    const prevRank  = getRank(state.xp)

    toggleTask(check.dataset.id)
    renderAll()

    if (state.level > prevLevel) showLevelUp(state.level)
    const newRank = getRank(state.xp)
    if (newRank !== prevRank && RANKS.indexOf(newRank) > RANKS.indexOf(prevRank)) {
      showRankUp(newRank)
    }
  })

  confirmBtn.addEventListener('click', handleAddTask)

  levelupOverlay.addEventListener('click', () => levelupOverlay.classList.remove('show'))
  rankupOverlay.addEventListener('click', () => rankupOverlay.classList.remove('show'))

  accountBtn.addEventListener('click', openAccount)
  accountCloseBtn.addEventListener('click', closeAccount)
  accountBackdrop.addEventListener('click', e => {
    if (e.target === accountBackdrop) closeAccount()
  })

  logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure? All data will be deleted.')) {
      clearAll()
      window.location.href = 'index.html'
    }
  })
}

function openModal() {
  taskInput.value        = ''
  taskError.textContent  = ''
  catChipError.textContent = ''
  selectedDifficulty     = 'easy'
  selectedCategory       = null

  document.querySelectorAll('.diff-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.d === 'easy')
  })
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'))
  updateConfirmBtn()

  modalBackdrop.classList.add('show')
  taskInput.focus()
}

function closeModal() {
  modalBackdrop.classList.remove('show')
}

function handleAddTask() {
  const text = taskInput.value.trim()
  if (text.length < 2) {
    taskError.textContent = 'name must be at least 2 characters'
    return
  }
  if (!selectedCategory) {
    catChipError.textContent = 'select a category'
    return
  }

  taskError.textContent    = ''
  catChipError.textContent = ''

  addTask({
    text,
    category:   selectedCategory,
    difficulty: selectedDifficulty,
    xp:         appData.xpValues[selectedDifficulty],
  })

  closeModal()
  renderAll()
}

function showLevelUp(level) {
  levelupNum.textContent = level
  levelupOverlay.classList.add('show')
}

function showRankUp(rank) {
  rankupLabel.textContent = rank
  rankupOverlay.classList.add('show')
}

init()
