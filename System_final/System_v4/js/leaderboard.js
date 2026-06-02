import { initState, loadAppData, state } from './state.js'
import { loadProfile } from './storage.js'

const myRankEl    = document.getElementById('myRank')
const myAvatarEl  = document.getElementById('myAvatar')
const myNameEl    = document.getElementById('myName')
const myLevelEl   = document.getElementById('myLevel')
const myXpEl      = document.getElementById('myXp')
const loadingState= document.getElementById('loadingState')
const errorState  = document.getElementById('errorState')
const emptyState  = document.getElementById('emptyState')
const lbCard      = document.getElementById('lbCard')
const lbList      = document.getElementById('lbList')
const refreshBtn  = document.getElementById('refreshBtn')

const STORAGE_KEY = 'system_leaderboard'

async function init() {
  const profile = loadProfile()
  if (!profile) {
    window.location.href = 'index.html'
    return
  }

  await loadAppData()
  initState()

  renderMyCard(profile)
  await loadLeaderboard(profile)

  refreshBtn.addEventListener('click', () => loadLeaderboard(profile))
}

function renderMyCard(profile) {
  const initials = profile.username.slice(0, 2).toUpperCase()
  myAvatarEl.textContent = initials
  myNameEl.textContent   = profile.username
  myLevelEl.textContent  = `LVL ${state.level}`
  myXpEl.textContent     = `${state.xp} XP`
}

async function loadLeaderboard(profile) {
  showLoading()

  try {
    await pushMyScore(profile)
    const players = await fetchScores()
    renderLeaderboard(players, profile.username)
  } catch (err) {
    showError()
    console.error('Leaderboard error:', err)
  }
}

async function pushMyScore(profile) {
  await window.storage.set(
    `lb_${profile.username}`,
    JSON.stringify({
      username: profile.username,
      xp:       state.xp,
      level:    state.level,
    }),
    true
  )
}

async function fetchScores() {
  const result = await window.storage.list('lb_', true)

  if (!result || !result.keys || result.keys.length === 0) return []

  const players = []

  for (const key of result.keys) {
    try {
      const entry = await window.storage.get(key, true)
      if (entry && entry.value) {
        players.push(JSON.parse(entry.value))
      }
    } catch (err) {
      console.warn(`Skipping corrupted leaderboard entry (${key}):`, err)
      continue
    }
  }

  return players.sort((a, b) => b.xp - a.xp)
}

function renderLeaderboard(players, myUsername) {
  hideLoading()

  if (players.length === 0) {
    emptyState.style.display = 'block'
    lbCard.style.display     = 'none'
    return
  }

  lbCard.style.display     = 'block'
  emptyState.style.display = 'none'
  lbList.innerHTML         = ''

  const myRank = players.findIndex(p => p.username === myUsername) + 1
  myRankEl.textContent = myRank > 0 ? `#${myRank}` : '—'

  players.forEach((player, i) => {
    const rank     = i + 1
    const isMe     = player.username === myUsername
    const initials = player.username.slice(0, 2).toUpperCase()

    const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : ''
    const rankLabel = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`

    const row = document.createElement('div')
    row.className = 'lb-row'

    if (isMe) {
      row.style.background    = 'var(--blue-glow)'
      row.style.borderRadius  = 'var(--radius-md)'
      row.style.padding       = '8px'
      row.style.margin        = '0 -8px'
    }

    row.innerHTML = `
      <div class="lb-rank ${rankClass}">${rankLabel}</div>
      <div class="lb-avatar">${initials}</div>
      <div class="lb-name">${player.username}${isMe ? ' <span style="font-size:11px; color:var(--blue);">(you)</span>' : ''}</div>
      <div class="lb-lvl">LVL ${player.level}</div>
      <div class="lb-xp">${player.xp} XP</div>`

    lbList.appendChild(row)
  })
}

function showLoading() {
  loadingState.style.display = 'block'
  errorState.style.display   = 'none'
  emptyState.style.display   = 'none'
  lbCard.style.display       = 'none'
}

function hideLoading() {
  loadingState.style.display = 'none'
}

function showError() {
  loadingState.style.display = 'none'
  errorState.style.display   = 'block'
  // POPRAVLJENO: Eksplicitno skrivamo ostale kontejnere kako ne bi došlo do preklapanja sučelja
  emptyState.style.display   = 'none'
  lbCard.style.display       = 'none'
}

init()
// POPRAVLJENO: Uklonjena zalutala zatvorena zagrada koja je rušila kompajler!