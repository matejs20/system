import { initState, loadAppData, state, appData } from './state.js'
import { loadProfile } from './storage.js'

const totalXpEl    = document.getElementById('totalXp')
const totalLevelEl = document.getElementById('totalLevel')
const activeDaysEl = document.getElementById('activeDays')
const weekChart    = document.getElementById('weekChart')
const weekLabels   = document.getElementById('weekLabels')
const bestDayEl    = document.getElementById('bestDay')
const catBreakdown = document.getElementById('catBreakdown')
const weeklyReview = document.getElementById('weeklyReview')
const weeklyContent= document.getElementById('weeklyContent')

const DAY_LABELS = ['sun','mon','tue','wed','thu','fri','sat']
const MONTHS = [
  'january','february','march','april','may','june',
  'july','august','september','october','november','december'
]

async function init() {
  const profile = loadProfile()
  if (!profile) {
    window.location.href = 'index.html'
    return
  }

  await loadAppData()
  initState()
  renderAll()
}

function renderAll() {
  renderSummary()
  renderWeekChart()
  renderBestDay()
  renderCatBreakdown()
  renderWeeklyReview()
}

function renderSummary() {
  const activeDays = Object.keys(state.tasks).filter(k => state.tasks[k].length > 0)

  totalXpEl.textContent    = state.xp
  totalLevelEl.textContent = `LVL ${state.level}`
  activeDaysEl.textContent = activeDays.length
}

function getWeekDays() {
  const days  = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key   = d.toISOString().split('T')[0]
    const label = DAY_LABELS[d.getDay()]
    const tasks = state.tasks[key] ?? []
    const xp    = tasks.filter(t => t.done).reduce((sum, t) => sum + t.xp, 0)
    days.push({ key, label, xp, tasks })
  }

  return days
}

function renderWeekChart() {
  const days  = getWeekDays()
  const maxXp = Math.max(...days.map(d => d.xp), 1)

  weekChart.innerHTML  = ''
  weekLabels.innerHTML = ''

  days.forEach(day => {
    const pct = Math.round((day.xp / maxXp) * 100)

    const wrap = document.createElement('div')
    wrap.className = 'chart-bar-wrap'
    wrap.innerHTML = `
      <span class="chart-bar-val">${day.xp > 0 ? day.xp : ''}</span>
      <div class="chart-bar" style="height:${pct}%;"></div>`
    weekChart.appendChild(wrap)

    const lbl = document.createElement('div')
    lbl.className       = 'chart-bar-label'
    lbl.style.flex      = '1'
    lbl.style.textAlign = 'center'
    lbl.textContent     = day.label
    weekLabels.appendChild(lbl)
  })
}

function renderBestDay() {
  const days = getWeekDays()
  const best = days.reduce((a, b) => a.xp >= b.xp ? a : b)

  if (best.xp === 0) {
    bestDayEl.innerHTML = `<span style="font-size:13px; color:var(--text-muted);">no data this week</span>`
    return
  }

  const done        = best.tasks.filter(t => t.done)
  const [y, m, d]   = best.key.split('-')

  bestDayEl.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="font-size:15px; font-weight:500;">${MONTHS[parseInt(m)-1]} ${parseInt(d)}</div>
        <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">${done.length} tasks completed</div>
      </div>
      <div style="font-size:20px; font-weight:500; color:var(--blue);">+${best.xp} XP</div>
    </div>`
}

function renderCatBreakdown() {
  const allTasks = Object.values(state.tasks).flat()
  const done     = allTasks.filter(t => t.done)

  if (done.length === 0) {
    catBreakdown.innerHTML = `<span style="font-size:13px; color:var(--text-muted);">no completed tasks yet</span>`
    return
  }

  const byCategory = {}
  done.forEach(t => {
    if (!byCategory[t.category]) byCategory[t.category] = { count: 0, xp: 0 }
    byCategory[t.category].count++
    byCategory[t.category].xp += t.xp
  })

  const maxXp = Math.max(...Object.values(byCategory).map(c => c.xp))

  catBreakdown.innerHTML = ''

  Object.entries(byCategory)
    .sort((a, b) => b[1].xp - a[1].xp)
    .forEach(([id, data]) => {
      const cat = appData.categories.find(c => c.id === id)
      const pct = Math.round((data.xp / maxXp) * 100)

      const row = document.createElement('div')
      row.style.marginBottom = '12px'
      row.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <span class="task__cat cat-${id}">${cat?.label ?? id}</span>
          <span style="font-size:12px; color:var(--blue);">+${data.xp} XP · ${data.count} tasks</span>
        </div>
        <div class="xp-bar-bg">
          <div class="xp-bar" style="width:${pct}%;"></div>
        </div>`
      catBreakdown.appendChild(row)
    })
}

function renderWeeklyReview() {
  const today = new Date()

  if (today.getDay() !== 1) {
    weeklyReview.style.display = 'none'
    return
  }

  const days    = getWeekDays()
  const totalXp = days.reduce((sum, d) => sum + d.xp, 0)
  const best    = days.reduce((a, b) => a.xp >= b.xp ? a : b)

  const allTasks  = days.flatMap(d => d.tasks)
  const doneTasks = allTasks.filter(t => t.done)

  const byCategory = {}
  doneTasks.forEach(t => {
    if (!byCategory[t.category]) byCategory[t.category] = 0
    byCategory[t.category] += t.xp
  })

  const weakest = Object.entries(byCategory).sort((a, b) => a[1] - b[1])[0]
  const weakCat = weakest
    ? appData.categories.find(c => c.id === weakest[0])?.label ?? weakest[0]
    : null

  weeklyReview.style.display = 'block'
  weeklyContent.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
      <span style="font-size:13px; color:var(--text-muted);">xp last week</span>
      <span style="font-size:13px; color:var(--blue); font-weight:500;">+${totalXp} XP</span>
    </div>
    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
      <span style="font-size:13px; color:var(--text-muted);">best day</span>
      <span style="font-size:13px; color:var(--text);">${best.label} · +${best.xp} XP</span>
    </div>
    ${weakCat ? `
    <div style="display:flex; justify-content:space-between;">
      <span style="font-size:13px; color:var(--text-muted);">weakest category</span>
      <span style="font-size:13px; color:var(--text);">${weakCat}</span>
    </div>` : ''}
  `
}

init()
