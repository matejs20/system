import { initState, loadAppData, state, appData, getTodayKey } from './state.js'
import { loadProfile } from './storage.js'

const calGrid        = document.getElementById('calGrid')
const monthLabel     = document.getElementById('monthLabel')
const prevMonthBtn   = document.getElementById('prevMonth')
const nextMonthBtn   = document.getElementById('nextMonth')
const dayDetail      = document.getElementById('dayDetail')
const dayDetailLabel = document.getElementById('dayDetailLabel')
const dayDetailTasks = document.getElementById('dayDetailTasks')

const MONTHS = [
  'january','february','march','april','may','june',
  'july','august','september','october','november','december'
]

let currentYear  = new Date().getFullYear()
let currentMonth = new Date().getMonth()

async function init() {
  const profile = loadProfile()
  if (!profile) {
    window.location.href = 'index.html'
    return
  }

  await loadAppData()
  initState()
  renderCalendar()
  bindEvents()
}

function renderCalendar() {
  calGrid.innerHTML = ''
  monthLabel.textContent = `${MONTHS[currentMonth]} ${currentYear}`

  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay  = new Date(currentYear, currentMonth + 1, 0)
  const today    = getTodayKey()

  let startDow = firstDay.getDay()
  if (startDow === 0) startDow = 7
  startDow -= 1

  // Empty padding cells at start of month
  for (let i = 0; i < startDow; i++) {
    const empty = document.createElement('div')
    empty.className = 'cal-day empty'
    calGrid.appendChild(empty)
  }

  // Day cells
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const tasks   = state.tasks[dateKey] ?? []
    const isToday = dateKey === today

    const div = document.createElement('div')
    div.className   = 'cal-day'
    div.textContent = d
    div.dataset.key = dateKey

    if (tasks.length > 0) {
      const allDone = tasks.every(t => t.done)
      div.classList.add(allDone ? 'completed' : 'has-tasks')
    }

    if (isToday) div.classList.add('today')

    calGrid.appendChild(div)
  }
}

function showDayDetail(dateKey) {
  const tasks = state.tasks[dateKey] ?? []

  const [year, month, day] = dateKey.split('-')
  dayDetailLabel.textContent = `${MONTHS[parseInt(month) - 1]} ${parseInt(day)}, ${year}`

  dayDetail.style.display  = 'block'
  dayDetailTasks.innerHTML = ''

  if (tasks.length === 0) {
    dayDetailTasks.innerHTML = `
      <div class="empty-state" style="padding:1rem 0;">
        <p>no quests assigned.</p>
      </div>`
    return
  }

  tasks.forEach(task => {
    const div = document.createElement('div')
    div.className = 'task'
    div.innerHTML = `
      <div class="task__check ${task.done ? 'done' : ''}">
        <i class="ti ti-check" aria-hidden="true"></i>
      </div>
      <span class="task__cat cat-${task.category}">${getCatLabel(task.category)}</span>
      <span class="task__text ${task.done ? 'done' : ''}">${task.text}</span>
      <span class="task__xp">+${task.xp} XP</span>`
    dayDetailTasks.appendChild(div)
  })
}

function getCatLabel(id) {
  return appData.categories.find(c => c.id === id)?.label ?? id
}

function bindEvents() {
  prevMonthBtn.addEventListener('click', () => {
    currentMonth--
    if (currentMonth < 0) { currentMonth = 11; currentYear-- }
    dayDetail.style.display = 'none'
    renderCalendar()
  })

  nextMonthBtn.addEventListener('click', () => {
    currentMonth++
    if (currentMonth > 11) { currentMonth = 0; currentYear++ }
    dayDetail.style.display = 'none'
    renderCalendar()
  })

  calGrid.addEventListener('click', e => {
    const day = e.target.closest('.cal-day')
    if (!day || day.classList.contains('empty')) return

    document.querySelectorAll('.cal-day').forEach(d => d.classList.remove('active'))
    day.classList.add('active')

    showDayDetail(day.dataset.key)
  })
}

init()
