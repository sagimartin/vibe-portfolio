/* Contact chat: a stateful, guided conversation that ends in a ready-made mailto: link.
   Framework-free on purpose (it manipulates its own DOM); <Contact /> mounts and unmounts it. */

const EMAIL = 'hello@sagimartin.com'
const ICO = {
  up: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>',
  right:
    '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const el = (tag, cls, txt) => {
  const n = document.createElement(tag)
  if (cls) n.className = cls
  if (txt != null) n.textContent = txt
  return n
}

let T = null
let lang = 'en'
let reduceMotion = false
let cOffs = []
let cTimers = []

const toast = (() => {
  let timer = 0
  let node = null
  return (msg) => {
    if (!node) {
      node = el('div', 'toast')
      node.setAttribute('role', 'status')
      document.body.appendChild(node)
    }
    node.textContent = msg
    node.classList.add('on')
    clearTimeout(timer)
    timer = setTimeout(() => node.classList.remove('on'), 1800)
  }
})()

const CHAT = { topic: null, ans: {}, free: '', note: '', start: '', sel: {} }
try {
  const s = JSON.parse(sessionStorage.getItem('sagi-chat') || 'null')
  if (s && typeof s === 'object') Object.assign(CHAT, s)
} catch {
  /* ignore */
}
if (CHAT.topic === 'hi') {
  CHAT.topic = null
  CHAT.ans = {}
  CHAT.sel = {}
}
const saveChat = () => {
  try {
    sessionStorage.setItem(
      'sagi-chat',
      JSON.stringify({
        topic: CHAT.topic,
        ans: CHAT.ans,
        free: CHAT.free,
        note: CHAT.note,
        start: CHAT.start,
        sel: CHAT.sel
      })
    )
  } catch {
    /* ignore */
  }
}
const TOPICS = ['shopify', 'ux', 'other']
const STEPQ = {
  name: ['qName', 'ansName', 'lbName'],
  exist: ['qExist', 'ansExist', 'lbExist'],
  plat: ['qPlat', 'ansPlat', 'lbPlat'],
  uxplat: ['qPlat', 'ansUxPlat', 'lbPlat'],
  brand: ['qBrand', 'ansBrand', 'lbBrand'],
  lang: ['qLang', 'ansLang', 'lbLang'],
  mkt: ['qMkt', 'ansMkt', 'lbMkt'],
  prod: ['qProd', 'ansProd', 'lbProd'],
  integ: ['qInteg', 'ansInteg', 'lbInteg'],
  about: ['qAbout', 'ansAbout', 'lbAbout'],
  site: ['qSite', 'ansSite', 'lbSite'],
  prob: ['qProb', 'ansProb', 'lbProb'],
  idea: ['qIdea', 'ansIdea', 'lbIdea'],
  time: ['qTime', 'ansTime', 'lbTime']
}
const SITE_RE = /^(https?:\/\/)?[^\s/]+\.[^\s/]{2,}(\/\S*)?$/i
const TYPEFIRST = { name: 1, site: 1, prod: 1, about: 1, prob: 1, idea: 1 }
const STEPPH = {
    about: 'phAbout',
    site: 'phSite',
    name: 'phName',
    plat: 'phPlat',
    lang: 'phLang',
    mkt: 'phMkt',
    prod: 'phProd',
    prob: 'phProb'
  },
  OTHER = { plat: 4, lang: 3, mkt: 3 },
  MULTI = { integ: 5 }
const stepsFor = (k) => {
  const a = CHAT.ans
  switch (k) {
    case 'shopify':
      return [
        'name',
        'exist',
        a.exist && a.exist.i >= 1 ? 'site' : null,
        a.exist && a.exist.i === 1 ? 'plat' : null,
        a.exist && a.exist.i === 0 ? 'brand' : null,
        'lang',
        'mkt',
        'prod',
        'about',
        'time'
      ].filter(Boolean)
    case 'ux':
      return ['name', 'site', 'uxplat', 'prob', 'time']
    case 'other':
      return ['name', 'idea', 'time']
    case 'free':
      return ['name']
    default:
      return []
  }
}
const ansText = (s) => {
  const a = CHAT.ans[s],
    t = T[lang],
    key = STEPQ[s][1]
  if (a && typeof a === 'object') {
    if (a.d) return a.d
    if (a.m) {
      const p = a.m.map((i) => t[key][i])
      if (a.t) p.push(a.t)
      return p.join(', ')
    }
    return t[key][a.i]
  }
  return a
}
function cChat(m) {
  let alive = true
  cOffs.push(() => {
    alive = false
  })
  const frame = el('div', 'cframe')
  const hd = el('div', 'cf-head')
  const av = el('span', 'cf-av', 'MS')
  const who = el('div', 'cf-who')
  const nm = el('strong', '', 'Martin Sági')
  const st = el('span', 'cf-st')
  st.append(el('span', 'dot'))
  const sr = el('span', '', T[lang].reply)
  st.appendChild(sr)
  who.append(nm, st)
  hd.append(av, who)
  const chat = el('div', 'cchat')
  chat.setAttribute('role', 'log')
  chat.setAttribute('aria-live', 'polite')
  chat.setAttribute('aria-label', 'Chat')
  const form = el('form', 'cf-in')
  const inp = el('textarea')
  inp.id = 'cchatin'
  inp.rows = 1
  inp.autocomplete = 'off'
  inp.maxLength = 300
  const goB = el('button', 'go')
  goB.type = 'submit'
  goB.innerHTML = ICO.up
  goB.setAttribute('aria-label', 'Send')
  const soB = el('button', 'so')
  soB.type = 'button'
  const smA = el('a', 'sm')
  smA.rel = 'noopener'
  form.append(inp, goB, soB, smA)
  frame.append(hd, chat, form)
  m.appendChild(frame)
  let shown = 0,
    busy = false,
    chipsNode = null,
    prevNode = null,
    sentNode = null,
    undoNode = null
  const coarse = matchMedia('(pointer:coarse)').matches
  let paragraph = false
  const grow = () => {
    inp.style.height = 'auto'
    inp.style.height = Math.min(inp.scrollHeight, 150) + 'px'
  }
  inp.addEventListener('input', grow)
  const focusIn = () => inp.focus({ preventScroll: !coarse })
  const setBusy = (v) => {
    busy = v
    inp.readOnly = v
    inp.classList.toggle('wait', v)
  }
  const clock = () =>
    new Date().toLocaleTimeString(lang === 'hu' ? 'hu-HU' : 'en-GB', { hour: '2-digit', minute: '2-digit' })
  const down = (smooth) => {
    chat.style.scrollBehavior = smooth && !reduceMotion ? 'smooth' : 'auto'
    chat.scrollTop = chat.scrollHeight
  }
  const wait = (ms) =>
    new Promise((res) => {
      cTimers.push(setTimeout(res, ms))
    })
  function pending() {
    const k = CHAT.topic
    if (!k) return null
    for (const s of stepsFor(k)) {
      if (CHAT.ans[s] === undefined) return s
    }
    return null
  }
  function compose(noteOverride, aboutMax) {
    const t = T[lang],
      k = CHAT.topic
    let subject, body
    if (k === 'free') {
      subject = t.subjFree
      body = t.hiLine + '\n\n' + CHAT.free
    } else {
      subject = t.chatSubj[TOPICS.indexOf(k)]
      const intro = { shopify: t.introShop, ux: t.introUx, other: t.introOther }[k]
      const lines = []
      let aboutBlock = ''
      stepsFor(k).forEach((s) => {
        const raw = CHAT.ans[s]
        if (raw === undefined || s === 'name') return
        if (s === 'about' && typeof raw === 'string') {
          aboutBlock = aboutMax && raw.length > aboutMax ? raw.slice(0, aboutMax).trimEnd() + '…' : raw
          return
        }
        const [, a, lb] = STEPQ[s]
        if (s === 'prob' && typeof raw === 'string') {
          lines.push(
            t[lb] +
              ':\n' +
              (aboutMax && raw.length > aboutMax ? raw.slice(0, aboutMax).trimEnd() + '…' : raw) +
              '\n'
          )
          return
        }
        if ((a === 'ansSite' || a === 'ansIdea' || a === 'ansProb') && typeof raw === 'object' && raw.i === 0)
          return
        lines.push(t[lb] + ': ' + ansText(s))
      })
      body =
        t.hiLine +
        '\n\n' +
        intro +
        (lines.length ? '\n\n' + lines.join('\n') : '') +
        (aboutBlock ? '\n\n' + t.lbAbout + ':\n' + aboutBlock : '')
    }
    const note = noteOverride !== undefined ? noteOverride : CHAT.note
    if (note) body += '\n\n' + t.lbNote + ':\n' + note
    const nmv = typeof CHAT.ans.name === 'string' ? CHAT.ans.name : ''
    body += '\n\n' + t.bye + (nmv ? '\n' + nmv : '') + '\n'
    return { subject, body }
  }
  function mailHref() {
    let note = CHAT.note,
      am = 0,
      h
    for (let i = 0; i < 80; i++) {
      const q = compose(note, am)
      h = `mailto:${EMAIL}?subject=${encodeURIComponent(q.subject)}&body=${encodeURIComponent(q.body.replace(/\n/g, '\r\n'))}`
      if (h.length <= 1900) break
      if (note) {
        note = note.slice(0, Math.max(0, note.length - 60)).trimEnd()
        if (note.length < 2) note = ''
      } else {
        const raw = Math.max(
          typeof CHAT.ans.about === 'string' ? CHAT.ans.about.length : 0,
          typeof CHAT.ans.prob === 'string' ? CHAT.ans.prob.length : 0
        )
        if (!raw || am === 100) break
        am = Math.max(100, (am || raw) - 80)
      }
    }
    return h
  }
  function build() {
    const t = T[lang],
      M = []
    const bot = (text, x) => M.push(Object.assign({ r: 'bot', text }, x || {}))
    const me = (text) => M.push({ r: 'me', text })
    bot(t.chatHi)
    bot(t.chatQ)
    const k = CHAT.topic
    let item = { ph: t.ph0, items: [], q: t.chatQ }
    if (!k) {
      item.items = t.chatOpts.map((o, i) => ({
        label: o,
        fn: () => {
          CHAT.topic = TOPICS[i]
          advance()
        }
      }))
    } else {
      me(k === 'free' ? CHAT.free : t.chatOpts[TOPICS.indexOf(k)])
      let pend = null,
        blocked = false
      for (const s of stepsFor(k)) {
        const [q, a] = STEPQ[s]
        bot(t[q])
        if (CHAT.ans[s] !== undefined) {
          me(ansText(s))
          if (s === 'name' && typeof CHAT.ans.name === 'string') bot(t.greetName(CHAT.ans.name.slice(0, 40)))
          if (s === 'uxplat' && CHAT.ans[s].i !== 0) {
            bot(t.cantHelp)
            blocked = true
            break
          }
        } else {
          pend = s
          item.q = t[q]
          item.ph = STEPPH[s] ? t[STEPPH[s]] : t.phAns
          if (s in TYPEFIRST) item.typeFirst = true
          if (s === 'site') {
            item.defVal = 'www.'
            item.mode = 'url'
          }
          if (s === 'about' || s === 'prob' || s === 'idea') {
            item.paragraph = true
            item.max = 800
          }
          if (s === 'uxplat') {
            item.lock = true
            item.ph = t.phLock
          }
          const opts = t[a] || []
          if (s in MULTI) {
            const ns = MULTI[s]
            item.multi = s
            CHAT.sel[s] = CHAT.sel[s] || []
            item.items = opts.map((o, i) =>
              i === ns
                ? {
                    label: o,
                    cls: 'ghost',
                    fn: () => {
                      CHAT.ans[s] = { i }
                      delete CHAT.sel[s]
                      advance()
                    }
                  }
                : {
                    label: o,
                    toggle: true,
                    pressed: CHAT.sel[s].includes(i),
                    fn: () => {
                      const L = CHAT.sel[s],
                        j = L.indexOf(i)
                      if (j >= 0) L.splice(j, 1)
                      else L.push(i)
                      saveChat()
                      return j < 0
                    }
                  }
            )
            item.items.push({
              label: t.next,
              cls: 'main nx',
              next: true,
              fn: () => {
                if (!CHAT.sel[s].length) return
                CHAT.ans[s] = { m: CHAT.sel[s].slice().sort((x, y) => x - y) }
                delete CHAT.sel[s]
                advance()
              }
            })
          } else
            item.items = opts.map((o, i) =>
              OTHER[s] === i
                ? {
                    label: o,
                    cls: 'ghost',
                    fn: () => {
                      inp.placeholder = t[STEPPH[s]]
                      inp.setAttribute('aria-label', t[STEPPH[s]])
                      focusIn()
                    }
                  }
                : {
                    label: o,
                    fn: () => {
                      CHAT.ans[s] = { i }
                      advance()
                    }
                  }
            )
          break
        }
      }
      if (blocked) {
        item = { ph: t.phEnd, items: [], q: t.cantHelp, blocked: true, lock: true }
      } else if (!pend) {
        if (k === 'free') bot(t.freeReply)
        bot(k === 'free' ? t.readyHi : t.ready)
        if (CHAT.note) {
          me(CHAT.note)
          bot(t.noted)
        }
        item = { ph: t.phNote, items: [], q: t.ready, ready: true, preview: compose(), href: mailHref() }
      }
    }
    item.r = 'chips'
    item.undo = !!k
    M.push(item)
    return M
  }
  function addMsg(x) {
    const mk = (cls, text) => {
      const b = el('div', 'bub ' + cls)
      b.append(el('span', 'bx', text))
      return b
    }
    if (x.r === 'bot') {
      const row = el('div', 'brow')
      const a = el('span', 'av', 'MS')
      a.setAttribute('aria-hidden', 'true')
      row.append(a, mk('bot', x.text))
      chat.appendChild(row)
      return row
    }
    const b = mk('me', x.text)
    chat.appendChild(b)
    upgradeMine()
    return b
  }
  function initials() {
    const n = CHAT.ans && CHAT.ans.name
    if (typeof n !== 'string') return ''
    const ps = n
      .trim()
      .split(/\s+/)
      .map((w) => (w.match(/\p{L}/u) || [''])[0])
      .filter(Boolean)
    if (!ps.length) return ''
    return (ps[0] + (ps.length > 1 ? ps[ps.length - 1] : '')).toLocaleUpperCase(lang === 'hu' ? 'hu' : 'en')
  }
  function upgradeMine() {
    const ini = initials()
    if (!ini) return
    chat.querySelectorAll(':scope>.bub.me').forEach((b) => {
      const row = el('div', 'mrow')
      const a = el('span', 'av mine', ini)
      a.setAttribute('aria-hidden', 'true')
      chat.insertBefore(row, b)
      row.append(b, a)
    })
  }
  function typing() {
    const row = el('div', 'brow')
    const a = el('span', 'av', 'MS')
    a.setAttribute('aria-hidden', 'true')
    const b = el('div', 'bub bot typing')
    b.append(el('i'), el('i'), el('i'))
    row.append(a, b)
    chat.appendChild(row)
    down(true)
    return row
  }
  function syncNext(c) {
    const nx = c.querySelector('.nx')
    if (!nx) return
    const s = pending()
    nx.disabled = !(s && CHAT.sel[s] && CHAT.sel[s].length)
  }
  function placeUndo(x) {
    if (undoNode) {
      undoNode.remove()
      undoNode = null
    }
    if (!x.undo) return
    const rows = [...chat.querySelectorAll('.brow:not(.sent)')],
      last = rows[rows.length - 1]
    if (!last) return
    const t = T[lang]
    const u = el('button', 'undo')
    u.type = 'button'
    u.setAttribute('aria-label', t.back)
    u.title = t.back
    u.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>'
    u.addEventListener('click', undo)
    last.appendChild(u)
    undoNode = u
  }
  inp.addEventListener('focus', () => {
    if (coarse)
      setTimeout(
        () => frame.scrollIntoView({ block: 'end', behavior: reduceMotion ? 'auto' : 'smooth' }),
        320
      )
  })
  if (window.visualViewport && coarse) {
    const vv = () => {
      if (document.activeElement === inp) frame.scrollIntoView({ block: 'end' })
    }
    visualViewport.addEventListener('resize', vv)
    cOffs.push(() => visualViewport.removeEventListener('resize', vv))
  }
  let typeTok = 0
  async function typeDef(str) {
    const tok = ++typeTok
    if (reduceMotion) {
      inp.value = str
      return
    }
    inp.value = ''
    await wait(420)
    for (let i = 1; i <= str.length; i++) {
      if (tok !== typeTok || !alive || inp.value !== str.slice(0, i - 1)) return
      inp.value = str.slice(0, i)
      grow()
      const L = inp.value.length
      try {
        inp.setSelectionRange(L, L)
      } catch {
        /* ignore */
      }
      await wait(130 + Math.random() * 110)
    }
  }
  function showChips(x, focus) {
    typeTok++
    if (chipsNode) {
      chipsNode.remove()
      chipsNode = null
    }
    if (prevNode) {
      prevNode.remove()
      prevNode = null
    }
    placeUndo(x)
    const t = T[lang]
    inp.placeholder = x.ph
    inp.inputMode = x.mode || 'text'
    inp.maxLength = x.max || 300
    paragraph = !!x.paragraph
    inp.enterKeyHint = x.paragraph ? 'enter' : 'send'
    if (x.defVal !== undefined) {
      if (!inp.value) typeDef(x.defVal)
    } else if (inp.value === 'www.') inp.value = ''
    inp.setAttribute('aria-label', x.ph)
    form.classList.toggle('para', !!x.paragraph)
    form.classList.toggle('ready', !!x.ready)
    form.classList.toggle('blocked', !!x.blocked)
    if (x.ready || x.blocked) {
      clearTimeout(armTm)
      armTm = 0
      soB.classList.remove('arm')
      soB.textContent = t.chatAgain
    }
    inp.disabled = !!x.lock
    goB.disabled = !!x.lock
    if (x.blocked) soB.textContent = t.chatAgain
    if (x.ready) {
      smA.href = x.href
      smA.textContent = t.send
      smA.insertAdjacentHTML('beforeend', ICO.right)
    }
    if (x.preview) {
      const d = el('details', 'cprev')
      d.open = true
      const sm = el('summary', '', t.prevTitle)
      const sj = el('div', 'ps')
      sj.append(el('strong', '', t.prevSubj + ': '), el('span', '', x.preview.subject))
      const pre = el('pre', '', x.preview.body.trim())
      const pv = el('small', '', t.privacy)
      d.append(sm, sj, pre, pv)
      chat.appendChild(d)
      prevNode = d
    }
    if (x.items.length) {
      const c = el('div', 'chips')
      c.setAttribute('role', 'group')
      c.setAttribute('aria-label', x.q)
      x.items.forEach((it) => {
        let n
        n = el('button', it.cls || '', it.label)
        n.type = 'button'
        if (it.toggle) {
          n.classList.add('tg')
          n.setAttribute('aria-pressed', String(!!it.pressed))
          n.classList.toggle('on', !!it.pressed)
          n.addEventListener('click', () => {
            const on = it.fn()
            n.setAttribute('aria-pressed', String(on))
            n.classList.toggle('on', on)
            syncNext(c)
          })
        } else n.addEventListener('click', it.fn)
        c.appendChild(n)
      })
      c.addEventListener('keydown', (e) => {
        const bs = [...c.querySelectorAll('button:not([disabled])')],
          i = bs.indexOf(document.activeElement)
        if (i < 0) return
        if (e.key === 'Escape') {
          focusIn()
          return
        }
        let j = i
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % bs.length
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + bs.length) % bs.length
        else if (e.key === 'Home') j = 0
        else if (e.key === 'End') j = bs.length - 1
        else return
        e.preventDefault()
        bs[j].focus()
      })
      chat.appendChild(c)
      chipsNode = c
      syncNext(c)
    }
    down(true)
    if (focus && coarse && !x.typeFirst && (x.ready || x.items.length) && document.activeElement === inp)
      inp.blur()
    if (focus && !x.lock && (!coarse || x.typeFirst || (!x.ready && !x.items.length))) {
      focusIn()
      if (x.defVal !== undefined) {
        const L = inp.value.length
        try {
          inp.setSelectionRange(L, L)
        } catch {
          /* ignore */
        }
      }
    }
  }
  function renderAll(focus) {
    chat.textContent = ''
    chipsNode = null
    prevNode = null
    sentNode = null
    undoNode = null
    CHAT.start = CHAT.start || clock()
    chat.appendChild(el('div', 'cdiv', T[lang].today + ', ' + CHAT.start))
    const M = build(),
      ci = M.findIndex((x) => x.r === 'chips')
    for (let i = 0; i < ci; i++) addMsg(M[i])
    shown = ci
    showChips(M[ci], focus)
    down(false)
  }
  async function advance() {
    if (busy) return
    saveChat()
    setBusy(true)
    if (undoNode) {
      undoNode.remove()
      undoNode = null
    }
    if (sentNode) {
      sentNode.remove()
      sentNode = null
    }
    const M = build(),
      ci = M.findIndex((x) => x.r === 'chips')
    if (chipsNode) {
      chipsNode.remove()
      chipsNode = null
    }
    if (prevNode) {
      prevNode.remove()
      prevNode = null
    }
    for (let i = shown; i < ci && alive; i++) {
      const x = M[i]
      if (x.r === 'bot') {
        const ty = typing()
        await wait(clamp(450 + x.text.length * 16, 600, 1700))
        if (!alive) return
        ty.remove()
      }
      addMsg(x)
      down(true)
    }
    if (!alive) return
    shown = ci
    setBusy(false)
    showChips(M[ci], true)
  }
  function undo() {
    const k = CHAT.topic
    if (!k || busy) return
    if (CHAT.note) {
      const parts = CHAT.note.split('\n')
      parts.pop()
      CHAT.note = parts.join('\n')
    } else {
      let done = false
      const st = stepsFor(k)
      for (let i = st.length - 1; i >= 0; i--) {
        if (CHAT.ans[st[i]] !== undefined) {
          delete CHAT.ans[st[i]]
          done = true
          break
        }
      }
      if (!done) {
        CHAT.topic = null
        CHAT.free = ''
      }
    }
    saveChat()
    renderAll(true)
  }
  function reset() {
    CHAT.topic = null
    CHAT.ans = {}
    CHAT.free = ''
    CHAT.note = ''
    CHAT.start = ''
    CHAT.sel = {}
    try {
      sessionStorage.removeItem('sagi-chat')
    } catch {
      /* ignore */
    }
    setBusy(false)
    renderAll(true)
  }
  let armTm = 0
  const disarm = () => {
    clearTimeout(armTm)
    armTm = 0
    soB.classList.remove('arm')
  }
  soB.addEventListener('click', () => {
    if (!armTm) {
      soB.textContent = T[lang].confirmReset
      soB.classList.add('arm')
      armTm = setTimeout(() => {
        disarm()
        soB.textContent = T[lang].chatAgain
      }, 3500)
      return
    }
    disarm()
    reset()
  })
  smA.addEventListener('click', () => {
    cTimers.push(
      setTimeout(() => {
        if (!alive || busy) return
        if (sentNode) sentNode.remove()
        const row = addMsg({ r: 'bot', text: '' })
        const bx = row.querySelector('.bx'),
          tt = T[lang],
          lk = el('a', '', tt.sentLink)
        lk.href = 'mailto:' + EMAIL
        bx.append(tt.sentPre, lk, tt.sentPost)
        row.classList.add('sent')
        if (chipsNode) chat.insertBefore(row, chipsNode)
        sentNode = row
        down(true)
      }, 900)
    )
  })
  async function nudge(v, key) {
    setBusy(true)
    addMsg({ r: 'me', text: v })
    down(true)
    const ty = typing()
    await wait(700)
    if (!alive) return
    ty.remove()
    addMsg({ r: 'bot', text: T[lang][key || 'prodHint'] })
    down(true)
    setBusy(false)
    focusIn()
    if (pending() === 'site') {
      typeDef('www.')
    }
    if (pending() === 'site') {
      const L = inp.value.length
      try {
        inp.setSelectionRange(L, L)
      } catch {
        /* ignore */
      }
    }
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    if (busy || inp.disabled) return
    typeTok++
    let v = inp.value.trim()
    if (!v) return
    inp.value = ''
    grow()
    const k = CHAT.topic,
      p = pending()
    if (p === 'about' && v.replace(/\s+/g, ' ').length < 15) {
      nudge(v, 'aboutHint')
      return
    }
    if (p === 'time' && v.length > 60) {
      nudge(v, 'timeHint')
      return
    }
    if (p !== 'about' && p !== 'prob') v = v.replace(/\s*\n+\s*/g, ' ')
    if (p === 'site') v = v.replace(/^www\.(?=https?:\/\/)/i, '')
    if (p === 'prod' && !/\d/.test(v)) {
      nudge(v, 'prodHint')
      return
    }
    if (p === 'site' && !SITE_RE.test(v)) {
      nudge(v, 'siteHint')
      return
    }
    if (!k) {
      CHAT.topic = 'free'
      CHAT.free = v
    } else if (p) {
      if (p in MULTI) {
        CHAT.ans[p] = { m: (CHAT.sel[p] || []).slice().sort((x, y) => x - y), t: v }
        delete CHAT.sel[p]
      } else CHAT.ans[p] = v
    } else {
      let n = CHAT.note ? CHAT.note + '\n' + v : v
      if (n.length > 600) {
        n = n.slice(0, 600)
        toast(T[lang].limitMsg)
      }
      CHAT.note = n
    }
    advance()
  })
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (paragraph && !(e.metaKey || e.ctrlKey)) return
      if (e.shiftKey) return
      e.preventDefault()
      form.requestSubmit()
    } else if (e.key === 'Escape') inp.blur()
    else if (e.key === 'ArrowDown') {
      const b = chipsNode && chipsNode.querySelector('button:not([disabled])')
      if (b) {
        e.preventDefault()
        b.focus()
      }
    }
  })
  renderAll(false)
  if (!coarse) {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            io.disconnect()
            if (document.activeElement === document.body || !document.activeElement) focusIn()
          }
        }),
      { threshold: 0.6 }
    )
    io.observe(frame)
    cOffs.push(() => io.disconnect())
  }
}

export function createChat(container, options) {
  T = options.strings
  lang = options.lang
  reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  cOffs.splice(0).forEach((f) => f())
  cTimers.splice(0).forEach(clearTimeout)
  container.textContent = ''
  cChat(container)

  return function destroy() {
    cOffs.splice(0).forEach((f) => f())
    cTimers.splice(0).forEach(clearTimeout)
    container.textContent = ''
  }
}
