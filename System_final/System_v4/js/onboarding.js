import { loadAppData, appData } from './state.js'
import { saveProfile, loadProfile } from './storage.js'

const step1         = document.getElementById('step1')
const step2         = document.getElementById('step2')
const usernameInput = document.getElementById('username')
const usernameError = document.getElementById('usernameError')
const categoryGrid  = document.getElementById('categoryGrid')
const categoryError = document.getElementById('categoryError')
const nextBtn       = document.getElementById('nextBtn')
const submitBtn     = document.getElementById('submitBtn')

const loadingOverlay = document.getElementById('loadingOverlay')
const matrixCanvas   = document.getElementById('matrixCanvas')
const matrixStatus   = document.getElementById('matrixStatus')
const welcomeText    = document.getElementById('welcomeText')

let selectedCategories = []
let confirmedUsername  = ''

// Subcategory descriptions shown on hover
const CATEGORY_SUBS = {
  vjezba:    ['Training', 'Steps', 'Cardio', 'Physical activity'],
  skola:     ['Uni / school', 'Studying', 'Exam prep', 'Lectures'],
  zdravlje:  ['Health', 'Sleep', 'Nutrition', 'Hydration'],
  hobi:      ['Hobbies', 'Creativity', 'Reading', 'Personal time'],
  posao:     ['Work', 'Meetings', 'Deadlines', 'Planning'],
  ucenje:    ['Learning', 'Courses', 'Practice', 'Research'],
  projekti:  ['Your projects', 'Programming', 'Building', 'This site'],
  sport:     ['Sport', 'Competitions', 'Team', 'Performance'],
  socijalno: ['Friends', 'Family', 'Social events', 'Community'],
}

async function init() {
  const existing = loadProfile()
  if (existing) {
    window.location.href = 'app.html'
    return
  }

  await loadAppData()
  renderCategories()
  bindEvents()
}

function renderCategories() {
  categoryGrid.innerHTML = ''
  appData.categories.forEach(cat => {
    const subs = CATEGORY_SUBS[cat.id] ?? []
    const subHtml = subs.map(s => `<span>${s}</span>`).join('')

    const btn = document.createElement('button')
    btn.type      = 'button'
    btn.className = 'category-btn'
    btn.dataset.id = cat.id
    btn.innerHTML = `
      <div class="cat-btn__main">
        <i class="ti ${cat.icon}" aria-hidden="true"></i>
        <span class="cat-btn__label">${cat.label}</span>
      </div>
      <div class="cat-btn__subs">${subHtml}</div>`

    btn.addEventListener('click', () => toggleCategory(cat.id, btn))
    categoryGrid.appendChild(btn)
  })
}

function toggleCategory(id, btn) {
  if (selectedCategories.includes(id)) {
    selectedCategories = selectedCategories.filter(c => c !== id)
    btn.classList.remove('active')
  } else {
    selectedCategories.push(id)
    btn.classList.add('active')
  }
}

function bindEvents() {
  nextBtn.addEventListener('click', () => {
    const val = usernameInput.value.trim()
    if (val.length < 2) {
      usernameError.textContent = 'name must be at least 2 characters'
      return
    }
    usernameError.textContent = ''
    confirmedUsername = val
    step1.style.display = 'none'
    step2.style.display = 'block'
  })

  usernameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') nextBtn.click()
  })

  submitBtn.addEventListener('click', () => {
    if (selectedCategories.length < 2) {
      categoryError.textContent = 'select at least 2 categories'
      return
    }
    categoryError.textContent = ''

    const profile = {
      username:   confirmedUsername,
      categories: selectedCategories,
      createdAt:  new Date().toISOString(),
    }

    saveProfile(profile)
    runMatrixEffect(confirmedUsername, () => {
      window.location.href = 'app.html'
    })
  })
}

// ── MATRIX LOADING + TYPEWRITER ──────────────────────────────────────────────

function runMatrixEffect(username, callback) {
  if (!loadingOverlay || !matrixCanvas) { callback(); return }

  loadingOverlay.style.display = 'flex'
  const ctx = matrixCanvas.getContext('2d')

  function resizeCanvas() {
    matrixCanvas.width  = window.innerWidth
    matrixCanvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  const chars   = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ'
  const charArr = chars.split('')
  const fontSize = 14
  const columns  = Math.floor(matrixCanvas.width / fontSize) + 1
  const drops    = Array(columns).fill(1)
  let animationFrameId

  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.07)'
    ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height)
    ctx.font = fontSize + 'px "Share Tech Mono", monospace'

    for (let i = 0; i < drops.length; i++) {
      const text = charArr[Math.floor(Math.random() * charArr.length)]
      const x = i * fontSize
      const y = drops[i] * fontSize

      if (Math.random() > 0.97)       ctx.fillStyle = '#e8f4ff'  // white tip
      else if (Math.random() > 0.6)   ctx.fillStyle = '#00b4ff'  // blue
      else                            ctx.fillStyle = '#0070aa'  // blue-dim trail

      ctx.fillText(text, x, y)

      if (y > matrixCanvas.height && Math.random() > 0.975) drops[i] = 0
      drops[i]++
    }
    animationFrameId = requestAnimationFrame(draw)
  }

  animationFrameId = requestAnimationFrame(draw)

  // Status sequence
  const steps = [
    '> INITIALIZING CORE SYSTEMS...',
    '> LOADING DISCIPLINE PROTOCOLS...',
    '> SYNCING DATABASE...',
    '> SYSTEM ONLINE.',
  ]
  let stepIdx = 0
  if (matrixStatus) matrixStatus.textContent = steps[0]

  const statusInterval = setInterval(() => {
    stepIdx++
    if (stepIdx < steps.length) {
      if (matrixStatus) matrixStatus.textContent = steps[stepIdx]
    } else {
      clearInterval(statusInterval)
    }
  }, 650)

  // Typewriter welcome at 1.4s
  setTimeout(() => {
    if (welcomeText) typeWriter(welcomeText, `WELCOME, ${username.toUpperCase()}, TO THE SYSTEM`, 55)
  }, 1400)

  // Redirect after 3.8s
  setTimeout(() => {
    cancelAnimationFrame(animationFrameId)
    window.removeEventListener('resize', resizeCanvas)
    callback()
  }, 3800)
}

/**
 * Types text into an element character by character, with a blinking cursor.
 */
function typeWriter(el, text, speed = 60) {
  el.textContent = ''
  el.style.opacity = '1'

  let i = 0
  const cursor = document.createElement('span')
  cursor.className = 'matrix-cursor'
  cursor.textContent = '_'
  el.appendChild(cursor)

  const interval = setInterval(() => {
    if (i < text.length) {
      el.insertBefore(document.createTextNode(text[i]), cursor)
      i++
    } else {
      clearInterval(interval)
      // keep cursor blinking after done
    }
  }, speed)
}

init()
