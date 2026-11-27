/* ============================================================
   피클 합동 비서실 🥒
   - 로컬 데모 모드 (localStorage + BroadcastChannel)
   - Firebase Realtime Database 연결 시 모든 기기 실시간 동기화
   - @챗지피티 / 🤖 버튼으로 OpenAI API 호출 (키는 이 브라우저에만!)
   ============================================================ */
(() => {
  'use strict';

  /* ---------------- 저장 키 ---------------- */
  const LS = {
    me: 'pickleOffice.me.v1',
    db: 'pickleOffice.db.v1',
    cfg: 'pickleOffice.firebase.v1',
    key: 'pickleOffice.openai.key.v1',
    model: 'pickleOffice.openai.model.v1',
    bot: 'pickleOffice.bot.v1',
  };

  /* ---------------- 팔레트 ---------------- */
  const COLORS = {
    lilac: { main: '#BFA6E6', soft: '#EFE7FA', deep: '#8A66C0', name: '라일락' },
    mint: { main: '#9FDCBF', soft: '#E8F7EF', deep: '#64B292', name: '민트' },
    peach: { main: '#F9B99C', soft: '#FDEDE5', deep: '#DD8560', name: '복숭아' },
    butter: { main: '#F5D98B', soft: '#FBF3D9', deep: '#D3AE4E', name: '버터' },
    sky: { main: '#A3CBEC', soft: '#E7F2FB', deep: '#6A9BC9', name: '하늘' },
    rose: { main: '#F2AEC1', soft: '#FCE9EE', deep: '#D68198', name: '로즈' },
    sage: { main: '#BFD48F', soft: '#EFF4E1', deep: '#93A85F', name: '세이지' },
    cocoa: { main: '#D0B092', soft: '#F5EBE0', deep: '#A58066', name: '코코아' },
  };
  const COLOR_IDS = ['lilac', 'mint', 'peach', 'butter', 'sky', 'rose', 'sage', 'cocoa'];

  const ROOMS = {
    work: { name: '작업실', emoji: '💻', desc: '조용히 집중하는 곳' },
    meeting: { name: '회의실', emoji: '🗣️', desc: '머리 맞대는 곳' },
    lounge: { name: '카페', emoji: '☕', desc: '잠깐 쉬어가는 곳' },
  };
  const ROOM_IDS = ['work', 'meeting', 'lounge'];
  const CONSONANTS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const QUICK_STATUS = ['집중 중 🎧', '회의 중 🗣️', '커피 타임 ☕', '자리 비움 🌿', '기분 좋음 ✨'];

  /* 방마다 피클이 서는 자리 (바닥 기준 %, 아래에서 위로) */
  const SLOTS = {
    work: [
      { x: 14, y: 58 }, { x: 36, y: 50 }, { x: 58, y: 58 },
      { x: 80, y: 50 }, { x: 24, y: 88 }, { x: 50, y: 84 }, { x: 74, y: 90 },
    ],
    meeting: [
      { x: 20, y: 66 }, { x: 46, y: 58 }, { x: 78, y: 66 },
      { x: 30, y: 94 }, { x: 60, y: 94 }, { x: 88, y: 88 },
    ],
    lounge: [
      { x: 18, y: 66 }, { x: 44, y: 74 }, { x: 66, y: 64 },
      { x: 86, y: 74 }, { x: 34, y: 96 }, { x: 56, y: 94 }, { x: 76, y: 96 },
    ],
  };

  /* ---------------- 글자 모양 ---------------- */
  const GLYPHS = {
    'ㄱ': { paths: ['M30 26 H70 V74'], eyes: [44, 48, 60, 48], mouth: [50, 62] },
    'ㄴ': { paths: ['M30 24 V74 H70'], eyes: [44, 46, 58, 46], mouth: [50, 60] },
    'ㄷ': { paths: ['M70 26 H30 V74 H70'], eyes: [44, 48, 58, 48], mouth: [50, 60] },
    'ㄹ': { paths: ['M70 24 H30 V48 H66 V72 H28'], eyes: [44, 57, 56, 57], mouth: [50, 65] },
    'ㅁ': { paths: ['M30 26 H70 V74 H30 Z'], eyes: [43, 48, 57, 48], mouth: [50, 58] },
    'ㅂ': { paths: ['M32 24 V76', 'M68 24 V76', 'M32 48 H68', 'M32 76 H68'], eyes: [43, 58, 57, 58], mouth: [50, 67] },
    'ㅅ': { paths: ['M50 22 L30 78', 'M50 22 L70 78'], eyes: [44, 52, 56, 52], mouth: [50, 63] },
    'ㅇ': { paths: ['M50 52 m-24 0 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0'], eyes: [43, 50, 57, 50], mouth: [50, 62] },
    'ㅈ': { paths: ['M22 26 H78', 'M50 26 L30 78', 'M50 26 L70 78'], eyes: [44, 52, 56, 52], mouth: [50, 63] },
    'ㅊ': { paths: ['M42 10 H58', 'M22 26 H78', 'M50 26 L30 78', 'M50 26 L70 78'], eyes: [44, 54, 56, 54], mouth: [50, 65] },
    'ㅋ': { paths: ['M30 26 H70 V76', 'M30 50 H54'], eyes: [42, 62, 54, 62], mouth: [46, 71] },
    'ㅌ': { paths: ['M70 26 H30 V76 H70', 'M30 50 H66'], eyes: [44, 62, 56, 62], mouth: [50, 71] },
    'ㅍ': { paths: ['M24 28 H76', 'M36 28 V76', 'M64 28 V76', 'M24 76 H76'], eyes: [43, 54, 57, 54], mouth: [50, 63] },
    'ㅎ': { paths: ['M42 12 H58', 'M26 30 H74', 'M50 62 m-20 0 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0'], eyes: [44, 58, 56, 58], mouth: [50, 68] },
  };

  /* ---------------- 상태 ---------------- */
  let state = { pickles: {}, messages: [], notes: [] };
  let me = null;
  let mode = 'local';
  let fb = null;
  let bc = null;
  let cardTarget = null;
  let editDraft = null;
  let joinMode = false;
  let aiToggleOn = false;
  let thinking = false;
  let booted = false;

  const bot = {
    id: 'chatgpt',
    name: '챗지피티',
    color: 'mint',
    room: 'meeting',
    pos: { x: 74, y: 92 },
    status: '무엇이든 물어보세요',
  };
  try {
    const raw = localStorage.getItem(LS.bot);
    if (raw) { const b = JSON.parse(raw); if (b && b.status) bot.status = b.status; }
  } catch (e) { /* 무시 */ }

  /* ---------------- 작은 도구들 ---------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const uid = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 9973;
    return h;
  }

  function colorOf(id) { return COLORS[id] || COLORS.lilac; }

  function saveMe() {
    try { localStorage.setItem(LS.me, JSON.stringify(me)); } catch (e) { /* 무시 */ }
  }
  function loadMe() {
    try {
      const raw = localStorage.getItem(LS.me);
      if (raw) {
        const m = JSON.parse(raw);
        if (m && m.id && m.name) return m;
      }
    } catch (e) { /* 무시 */ }
    return null;
  }

  function timeLabel(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const diff = Date.now() - ts;
    if (diff < 60000) return '방금';
    if (diff < 3600000) return Math.floor(diff / 60000) + '분 전';
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const sameDay = new Date().toDateString() === d.toDateString();
    if (sameDay) return (d.getHours() < 12 ? '오전 ' : '오후 ') + (d.getHours() % 12 || 12) + ':' + mm;
    return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + hh + ':' + mm;
  }

  /* ---------------- 글자 그리기 ---------------- */
  function eye(x, y) {
    return `<circle cx="${x}" cy="${y}" r="5.1" fill="#FFFCF6"/>` +
      `<circle cx="${x}" cy="${y}" r="2.7" fill="#5B4560"/>` +
      `<circle cx="${x + 1.1}" cy="${y - 1.2}" r="0.9" fill="#FFFFFF" opacity=".95"/>`;
  }

  function feet(color) {
    return `<g class="feet">` +
      `<ellipse cx="36" cy="93" rx="7" ry="4.6" fill="${color}"/>` +
      `<ellipse cx="64" cy="93" rx="7" ry="4.6" fill="${color}"/>` +
      `</g>`;
  }

  function glyph(consonant, colorId, opts = {}) {
    if (consonant === 'BOT') return botSVG();
    const g = GLYPHS[consonant] || GLYPHS['ㅇ'];
    const c = colorOf(colorId);
    const delay = opts.delay || 0;
    const paths = g.paths.map((d) => `<path d="${d}"/>`).join('');
    const mouth = g.mouth
      ? `<path d="M${g.mouth[0] - 4.5} ${g.mouth[1]} q4.5 4.4 9 0" fill="none" stroke="#6A5372" stroke-width="2.4" stroke-linecap="round" opacity=".45"/>`
      : '';
    return `<svg class="glyph" viewBox="0 0 100 100" aria-hidden="true">
      <g fill="none" stroke="#FFFCF4" stroke-width="25.5" stroke-linecap="round" stroke-linejoin="round">${paths}</g>
      <g fill="none" stroke="${c.main}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round">${paths}</g>
      ${feet(c.deep)}
      <ellipse cx="${g.eyes[0] - 8.5}" cy="${g.eyes[1] + 9.5}" rx="4.4" ry="2.9" fill="#F08098" opacity=".33"/>
      <ellipse cx="${g.eyes[2] + 8.5}" cy="${g.eyes[3] + 9.5}" rx="4.4" ry="2.9" fill="#F08098" opacity=".33"/>
      <g class="eyes" style="animation-delay:${delay}s">${eye(g.eyes[0], g.eyes[1])}${eye(g.eyes[2], g.eyes[3])}</g>
      ${mouth}
    </svg>`;
  }

  function botSVG() {
    return `<svg class="glyph" viewBox="0 0 100 100" aria-hidden="true">
      <line x1="50" y1="26" x2="50" y2="14" stroke="#7CC5A6" stroke-width="4" stroke-linecap="round"/>
      <circle cx="50" cy="10" r="5.4" fill="#F7DE9A" stroke="#7CC5A6" stroke-width="2"/>
      <rect x="8" y="50" width="8" height="20" rx="4" fill="#98D6BC"/>
      <rect x="84" y="50" width="8" height="20" rx="4" fill="#98D6BC"/>
      <rect x="17" y="26" width="66" height="62" rx="23" fill="#B4E6D1" stroke="#FFFCF4" stroke-width="5"/>
      <rect x="17" y="26" width="66" height="62" rx="23" fill="none" stroke="#7CC5A6" stroke-width="2" opacity=".45"/>
      <rect x="27" y="39" width="46" height="30" rx="13" fill="#F8FFFB" opacity=".92"/>
      <g class="eyes" style="animation-delay:0.6s">
        <circle cx="41" cy="53" r="4.6" fill="#4C5B58"/>
        <circle cx="59" cy="53" r="4.6" fill="#4C5B58"/>
        <circle cx="42.4" cy="51.4" r="1.5" fill="#FFFFFF" opacity=".95"/>
        <circle cx="60.4" cy="51.4" r="1.5" fill="#FFFFFF" opacity=".95"/>
      </g>
      <path d="M45 63 q5 3.6 10 0" fill="none" stroke="#6E8F85" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
      <ellipse cx="31" cy="61" rx="4" ry="2.6" fill="#F08098" opacity=".28"/>
      <ellipse cx="69" cy="61" rx="4" ry="2.6" fill="#F08098" opacity=".28"/>
    </svg>`;
  }

  /* ---------------- 시드 데이터 ---------------- */
  function seed() {
    const now = Date.now();
    const pickles = {
      s2: { id: 's2', name: '2호', consonant: 'ㄱ', color: 'mint', room: 'meeting', pos: { x: 22, y: 66 }, status: '회의 자료 정리 중 📊', sample: true, updatedAt: now - 60000 },
      s3: { id: 's3', name: '3호', consonant: 'ㅁ', color: 'peach', room: 'lounge', pos: { x: 24, y: 72 }, status: '커피 한 잔 하고 왔어요 ☕', sample: true, updatedAt: now - 90000 },
      s5: { id: 's5', name: '5호', consonant: 'ㅅ', color: 'butter', room: 'work', pos: { x: 72, y: 74 }, status: '이메일 답장 쓰는 중 ✉️', sample: true, updatedAt: now - 120000 },
    };
    const messages = [
      { id: 'm1', authorId: 's2', authorName: '2호', authorColor: 'mint', authorConsonant: 'ㄱ', text: '다들 좋은 하루 보내고 있죠? 오늘 회의는 3시에 어때요?', ts: now - 1000 * 60 * 52 },
      { id: 'm2', authorId: 's5', authorName: '5호', authorColor: 'butter', authorConsonant: 'ㅅ', text: '좋아요! 그 전까지 메일 정리해둘게요 ✉️', ts: now - 1000 * 60 * 47 },
      { id: 'm3', authorId: 's3', authorName: '3호', authorColor: 'peach', authorConsonant: 'ㅁ', text: '저는 커피 내려둘게요. 다들 뭐 마실래요? ☕', ts: now - 1000 * 60 * 38 },
      { id: 'm4', authorId: 'chatgpt', authorName: '챗지피티', authorColor: 'mint', authorConsonant: 'BOT', text: '안녕하세요! 저는 이 비서실의 AI 동료예요. 채팅창에 @챗지피티 라고 부르면 도와드릴게요 🤖', ts: now - 1000 * 60 * 30, bot: true },
    ];
    const notes = [
      { id: 'n1', authorId: 's2', authorName: '2호', authorColor: 'mint', kind: 'memo', text: '오늘 3시 회의 — 안건은 이번 주 할 일 나누기!', ts: now - 1000 * 60 * 50, done: false, updatedAt: now - 1000 * 60 * 50 },
      { id: 'n2', authorId: 's5', authorName: '5호', authorColor: 'butter', kind: 'todo', text: '비서실 공용 커피 원두 사기', ts: now - 1000 * 60 * 44, done: false, updatedAt: now - 1000 * 60 * 44 },
      { id: 'n3', authorId: 's3', authorName: '3호', authorColor: 'peach', kind: 'memo', text: '금요일엔 다 같이 카페에서 수다 타임 ☕', ts: now - 1000 * 60 * 33, done: false, updatedAt: now - 1000 * 60 * 33 },
    ];
    return { pickles, messages, notes };
  }

  function freshMe() {
    return { id: uid(), name: '1호', consonant: 'ㅇ', color: 'lilac' };
  }

  function ensureMe() {
    if (!me) me = loadMe() || freshMe();
    const p = state.pickles[me.id];
    if (!p) {
      state.pickles[me.id] = {
        id: me.id, name: me.name, consonant: me.consonant, color: me.color,
        room: 'work', pos: pickSlot('work', state.pickles, me.id),
        status: '', sample: false, updatedAt: Date.now(),
      };
    }
  }

  function pickSlot(roomId, pickles, exceptId) {
    const list = Array.isArray(SLOTS[roomId]) ? SLOTS[roomId] : SLOTS.work;
    const used = Object.values(pickles || {})
      .filter((p) => p.room === roomId && p.id !== exceptId && p.pos)
      .map((p) => p.pos);
    for (const slot of list) {
      if (!used.some((u) => Math.hypot(u.x - slot.x, u.y - slot.y) < 14)) return { x: slot.x, y: slot.y };
    }
    const base = list[Math.floor(Math.random() * list.length)];
    return { x: clamp(base.x + (Math.random() * 10 - 5), 10, 90), y: clamp(base.y + (Math.random() * 8 - 4), 30, 95) };
  }

  /* ---------------- 로컬 저장 / 동기화 ---------------- */
  function snapshot() {
    return { pickles: state.pickles, messages: state.messages.slice(-300), notes: state.notes };
  }

  function localPublish() {
    try { localStorage.setItem(LS.db, JSON.stringify(snapshot())); } catch (e) { /* 무시 */ }
    try { if (bc) bc.postMessage({ t: 'state', state: snapshot() }); } catch (e) { /* 무시 */ }
  }

  function applyRemote(next) {
    if (!next) return;
    const merged = mergeState(state, next);
    state = merged;
    ensureMe();
    renderAll();
  }

  function mergeState(a, b) {
    const pickles = Object.assign({}, a.pickles);
    Object.values(b.pickles || {}).forEach((p) => {
      const cur = pickles[p.id];
      if (!cur || (p.updatedAt || 0) >= (cur.updatedAt || 0)) pickles[p.id] = p;
    });
    const mergeList = (x, y) => {
      const map = new Map();
      (x || []).forEach((o) => map.set(o.id, o));
      (y || []).forEach((o) => {
        const cur = map.get(o.id);
        if (!cur || (o.updatedAt || o.ts || 0) >= (cur.updatedAt || cur.ts || 0)) map.set(o.id, o);
      });
      return Array.from(map.values()).sort((p, q) => (p.ts || p.updatedAt || 0) - (q.ts || q.updatedAt || 0));
    };
    return {
      pickles,
      messages: mergeList(a.messages, b.messages).slice(-300),
      notes: mergeList(a.notes, b.notes),
    };
  }

  function syncPickle(p) {
    if (mode === 'firebase' && fb) { try { fb.refs.pickles.child(p.id).set(p); } catch (e) { /* 무시 */ } }
    else localPublish();
  }
  function syncMessage(m) {
    if (mode === 'firebase' && fb) { try { fb.refs.messages.child(m.id).set(m); } catch (e) { /* 무시 */ } }
    else localPublish();
  }
  function syncNote(n) {
    if (mode === 'firebase' && fb) { try { fb.refs.notes.child(n.id).set(n); } catch (e) { /* 무시 */ } }
    else localPublish();
  }
  function removeNoteRemote() {
    if (mode === 'firebase' && fb) return;
    localPublish();
  }

  function toArray(obj) {
    if (!obj) return [];
    return Object.keys(obj).map((k) => obj[k]).filter(Boolean);
  }

  /* ---------------- 렌더 ---------------- */
  function renderAll() {
    renderHeader();
    renderOffice();
    renderMessages();
    renderNotes();
    renderPeople();
    renderStats();
    renderFoot();
  }

  function renderHeader() {
    const mine = state.pickles[me.id];
    $('#meAvatar').innerHTML = glyph(me.consonant, me.color, {});
    $('#meName').textContent = me.name;
    $('#meStatus').textContent = (mine && mine.status) || '상태를 남겨보세요';
    const st = $('#statusInput');
    if (document.activeElement !== st) st.value = (mine && mine.status) || '';
    $('#connPill').dataset.mode = mode;
    $('#connPill').querySelector('b').textContent = mode === 'firebase' ? '실시간 연결' : '로컬 데모';
    $('#greeting').textContent = greetingText();
  }

  function greetingText() {
    const h = new Date().getHours();
    let g = '좋은 하루예요';
    if (h >= 5 && h < 11) g = '좋은 아침이에요';
    else if (h >= 11 && h < 17) g = '좋은 오후예요';
    else if (h >= 17 && h < 22) g = '좋은 저녁이에요';
    else g = '늦은 밤이네요';
    const tail = ['오늘도 다정하게 함께 일해요 🌿', '피클들이 모여 있는 사무실이에요 🥒', '필요한 건 화이트보드에 붙여두세요 📌'][new Date().getMinutes() % 3];
    return `${g}. ${tail}`;
  }

  function pickleEl(p, isMe) {
    const el = document.createElement('div');
    el.className = 'pickle' + (isMe ? ' is-me' : '') + (p.bot ? ' is-bot' : '');
    el.dataset.id = p.id;
    const h = hash(p.id);
    el.style.left = (p.pos ? p.pos.x : 50) + '%';
    el.style.top = (p.pos ? p.pos.y : 80) + '%';
    el.style.setProperty('--delay', ((h % 30) / 10).toFixed(1) + 's');
    el.style.setProperty('--bob', (3.1 + (h % 14) / 10).toFixed(1) + 's');
    const bubbleText = p.bot ? bot.status : (p.status || '');
    el.innerHTML =
      `<div class="bubble"></div>` +
      `<div class="body">${glyph(p.bot ? 'BOT' : p.consonant, p.color, { delay: ((h % 50) / 10).toFixed(1) })}</div>` +
      `<div class="shadow"></div>` +
      (isMe ? '<span class="me-badge">나</span>' : '') +
      (p.bot ? '<span class="bot-badge">🤖 AI</span>' : '');
    el.querySelector('.bubble').textContent = bubbleText;

    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      if (isMe) startDrag(e, p, el);
    });
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isMe) return;
      openCard(p);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); openCard(p); }
    });
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', `${p.name}${p.bot ? ' (AI 동료)' : ''} — ${bubbleText || '상태 없음'}`);
    return el;
  }

  function renderOffice() {
    ROOM_IDS.forEach((roomId) => {
      const layer = document.querySelector(`.pickle-layer[data-layer="${roomId}"]`);
      if (!layer) return;
      layer.innerHTML = '';
      const list = Object.values(state.pickles)
        .filter((p) => p.room === roomId)
        .sort((a, b) => (a.id === me.id ? -1 : b.id === me.id ? 1 : String(a.name).localeCompare(String(b.name))));
      list.forEach((p) => layer.appendChild(pickleEl(p, p.id === me.id)));
      if (roomId === bot.room) layer.appendChild(pickleEl(Object.assign({ bot: true }, bot), false));

      const count = layer.querySelectorAll('.pickle').length;
      const chip = document.querySelector(`.room[data-room="${roomId}"] .room-count`);
      if (chip) chip.textContent = String(count);
      const room = document.querySelector(`.room[data-room="${roomId}"]`);
      if (room) {
        const mine = state.pickles[me.id];
        room.classList.toggle('is-mine', !!mine && mine.room === roomId);
      }
    });
  }

  function renderMessages() {
    const wrap = $('#messages');
    if (!wrap) return;
    const nearBottom = wrap.scrollHeight - wrap.scrollTop - wrap.clientHeight < 90;
    wrap.innerHTML = '';
    const list = state.messages.slice(-200);
    if (!list.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.innerHTML = '<div class="em">💬</div><p>아직 대화가 없어요.<br>먼저 다정하게 인사해볼까요?</p>';
      const b = document.createElement('button');
      b.className = 'btn soft';
      b.type = 'button';
      b.textContent = '👋 안녕하세요!';
      b.addEventListener('click', () => sendChat('안녕하세요! 잘 부탁드려요 🥒'));
      empty.appendChild(b);
      wrap.appendChild(empty);
      $('#chatCount').textContent = String(state.messages.length);
      return;
    }
    list.forEach((m) => wrap.appendChild(messageEl(m)));
    if (thinking) wrap.appendChild(typingEl());
    if (nearBottom || list.length) wrap.scrollTop = wrap.scrollHeight;
    $('#chatCount').textContent = String(state.messages.length);
  }

  function messageEl(m) {
    const mine = m.authorId === me.id;
    const row = document.createElement('div');
    row.className = 'msg' + (mine ? ' is-me' : '') + (m.bot ? ' is-bot' : '');
    const ava = document.createElement('div');
    ava.className = 'ava';
    ava.innerHTML = glyph(m.bot ? 'BOT' : (m.authorConsonant || 'ㅇ'), m.authorColor || 'lilac', {});
    const wrap = document.createElement('div');
    wrap.className = 'wrap';
    const meta = document.createElement('span');
    meta.className = 'meta';
    meta.textContent = `${m.bot ? '🤖 ' : ''}${m.authorName} · ${timeLabel(m.ts)}`;
    const text = document.createElement('div');
    text.className = 'text';
    text.textContent = m.text;
    wrap.appendChild(meta);
    wrap.appendChild(text);
    row.appendChild(ava);
    row.appendChild(wrap);
    return row;
  }

  function typingEl() {
    const row = document.createElement('div');
    row.className = 'msg is-bot';
    row.id = 'typingRow';
    const ava = document.createElement('div');
    ava.className = 'ava';
    ava.innerHTML = botSVG();
    const wrap = document.createElement('div');
    wrap.className = 'wrap';
    const meta = document.createElement('span');
    meta.className = 'meta';
    meta.textContent = '🤖 챗지피티 · 생각 중';
    const text = document.createElement('div');
    text.className = 'text typing-dots';
    text.innerHTML = '<i></i><i></i><i></i>';
    wrap.appendChild(meta);
    wrap.appendChild(text);
    row.appendChild(ava);
    row.appendChild(wrap);
    return row;
  }

  function renderNotes() {
    const wrap = $('#notes');
    if (!wrap) return;
    wrap.innerHTML = '';
    const list = state.notes.slice().sort((a, b) => (a.ts || 0) - (b.ts || 0));
    if (!list.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.style.gridColumn = '1 / -1';
      empty.innerHTML = '<div class="em">📌</div><p>화이트보드가 비어 있어요.<br>메모나 할 일을 붙여보세요.</p>';
      wrap.appendChild(empty);
      return;
    }
    list.forEach((n) => wrap.appendChild(noteEl(n)));
  }

  function noteEl(n) {
    const c = colorOf(n.authorColor);
    const card = document.createElement('div');
    card.className = 'note' + (n.done ? ' done' : '');
    card.style.setProperty('--note', c.soft);

    const pin = document.createElement('span');
    pin.className = 'pin';
    pin.textContent = n.kind === 'todo' ? '📎' : '📌';
    card.appendChild(pin);

    if (n.kind === 'todo') {
      const check = document.createElement('button');
      check.className = 'check';
      check.type = 'button';
      check.textContent = '✓';
      check.setAttribute('aria-label', n.done ? '할 일 되돌리기' : '할 일 끝내기');
      check.addEventListener('click', (e) => { e.stopPropagation(); toggleNote(n.id); });
      card.appendChild(check);
    }

    const text = document.createElement('div');
    text.className = 'note-text';
    text.textContent = n.text;
    card.appendChild(text);

    const foot = document.createElement('div');
    foot.className = 'note-foot';
    const who = document.createElement('span');
    who.className = 'who';
    who.textContent = n.authorName + (n.kind === 'todo' ? ' · 할 일' : '');
    foot.appendChild(who);
    if (n.authorId === me.id) {
      const del = document.createElement('button');
      del.className = 'del';
      del.type = 'button';
      del.textContent = '×';
      del.setAttribute('aria-label', '이 메모 지우기');
      del.addEventListener('click', (e) => { e.stopPropagation(); deleteNote(n.id); });
      foot.appendChild(del);
    }
    card.appendChild(foot);
    return card;
  }

  function renderPeople() {
    const wrap = $('#peopleList');
    if (!wrap) return;
    wrap.innerHTML = '';

    const rows = [];
    rows.push(botEl());

    Object.values(state.pickles)
      .sort((a, b) => (a.id === me.id ? -1 : b.id === me.id ? 1 : String(a.name).localeCompare(String(b.name))))
      .forEach((p) => rows.push(personEl(p)));
    rows.forEach((r) => wrap.appendChild(r));
  }

  function botEl() {
    const b = document.createElement('button');
    b.className = 'person';
    b.type = 'button';
    const keyed = !!getKey();
    b.innerHTML =
      `<span class="pa">${botSVG()}</span>` +
      `<span class="pi"><span class="pn">챗지피티 <span class="sample" style="background:#E5F6EE;color:#4E8E76">AI</span></span>` +
      `<span class="ps">${escapeHTML(bot.status)}</span></span>` +
      `<span class="pr">${keyed ? '준비됨' : '키 필요'}</span>`;
    b.addEventListener('click', () => openCard(Object.assign({ bot: true }, bot)));
    return b;
  }

  function personEl(p) {
    const b = document.createElement('button');
    b.className = 'person';
    b.type = 'button';
    const status = (p.status || '아직 상태가 없어요').trim();
    b.innerHTML =
      `<span class="pa" style="background:${colorOf(p.color).soft}">${glyph(p.consonant, p.color, {})}</span>` +
      `<span class="pi"><span class="pn">${escapeHTML(p.name)}${p.id === me.id ? ' <span class="sample" style="background:#EFE7FA;color:#7A5CA8">나</span>' : ''}${p.sample ? ' <span class="sample">샘플</span>' : ''}</span>` +
      `<span class="ps">${escapeHTML(status)}</span></span>` +
      `<span class="pr">${ROOMS[p.room] ? ROOMS[p.room].name : '작업실'}</span>`;
    b.addEventListener('click', () => openCard(p));
    return b;
  }

  function renderStats() {
    const wrap = $('#stats');
    if (!wrap) return;
    const people = Object.keys(state.pickles).length;
    wrap.innerHTML =
      `<span class="stat">함께하는 피클 <b>${people}</b></span>` +
      `<span class="stat">화이트보드 <b>${state.notes.length}</b></span>` +
      `<span class="stat">대화 <b>${state.messages.length}</b></span>` +
      `<span class="stat" id="aiStat" style="cursor:pointer">🤖 챗지피티 <b>${getKey() ? '준비됨' : '키 필요'}</b></span>`;
    const ai = $('#aiStat');
    if (ai) ai.addEventListener('click', openAI);
  }

  function renderFoot() {
    const el = $('#footNote');
    if (!el) return;
    el.textContent = mode === 'firebase'
      ? '실시간 DB에 연결되어 있어요. 같은 링크를 연 모든 기기에서 함께 써요.'
      : '지금은 이 브라우저에만 저장되는 데모 모드예요. ⚙️ 설정에서 Firebase를 연결하면 모든 기기에서 함께 써요.';
  }

  function escapeHTML(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------------- 내 피클 ---------------- */
  function setStatus(text) {
    const p = state.pickles[me.id];
    if (!p) return;
    p.status = text.slice(0, 40);
    p.updatedAt = Date.now();
    syncPickle(p);
    renderHeader();
    const el = document.querySelector(`.pickle[data-id="${p.id}"] .bubble`);
    if (el) el.textContent = p.status;
    renderPeople();
    if (text) toast('상태를 남겼어요: ' + text);
  }

  function moveTo(roomId, opts = {}) {
    const p = state.pickles[me.id];
    if (!p || !ROOMS[roomId]) return;
    if (p.room === roomId && !opts.force) return;
    p.room = roomId;
    p.pos = pickSlot(roomId, state.pickles, me.id);
    p.updatedAt = Date.now();
    syncPickle(p);
    renderOffice();
    renderPeople();
    if (!opts.silent) toast(`${ROOMS[roomId].name}로 이동했어요 ${ROOMS[roomId].emoji}`);
  }

  function startDrag(e, p, el) {
    if (e.button != null && e.button !== 0) return;
    const roomEl = document.querySelector(`.room[data-room="${p.room}"]`);
    if (!roomEl) return;
    const floor = roomEl.querySelector('.floor');
    const rect = floor.getBoundingClientRect();
    const sx = e.clientX;
    const sy = e.clientY;
    let moved = false;
    let raf = 0;

    const onMove = (ev) => {
      if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 5) return;
      if (!moved) { moved = true; el.classList.add('is-dragging'); }
      const x = ((ev.clientX - rect.left) / rect.width) * 100;
      const y = ((ev.clientY - rect.top) / rect.height) * 100;
      p.pos = { x: clamp(x, 7, 93), y: clamp(y, 26, 97) };
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          el.style.left = p.pos.x + '%';
          el.style.top = p.pos.y + '%';
        });
      }
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      el.classList.remove('is-dragging');
      if (moved) {
        p.updatedAt = Date.now();
        syncPickle(p);
      } else {
        openMe(false);
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp, { once: true });
    window.addEventListener('pointercancel', onUp, { once: true });
  }

  function openMe(join) {
    joinMode = !!join;
    const mine = state.pickles[me.id] || {};
    editDraft = {
      name: join ? suggestName() : me.name,
      consonant: join ? CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)] : me.consonant,
      color: join ? COLOR_IDS[Math.floor(Math.random() * COLOR_IDS.length)] : me.color,
      status: mine.status || '',
    };
    $('#meTitle').textContent = join ? '새 피클로 참여하기' : '내 피클 꾸미기';
    $('#meSub').textContent = join
      ? '새 이름과 자음을 고르면 새 피클로 입장해요. 지금 피클은 오피스에서 사라져요.'
      : '이름과 자음, 색을 바꾸면 오피스에 바로 반영돼요.';
    $('#meNameInput').value = editDraft.name;
    $('#meStatusInput').value = editDraft.status;
    drawMeChoosers();
    updateMePreview();
    showModal('#modalMe');
  }

  function suggestName() {
    const nums = Object.values(state.pickles)
      .map((p) => parseInt(String(p.name).replace(/[^0-9]/g, ''), 10))
      .filter((n) => !isNaN(n));
    return (nums.length ? Math.max.apply(null, nums) + 1 : 4) + '호';
  }

  function drawMeChoosers() {
    const cg = $('#consonantGrid');
    cg.innerHTML = '';
    CONSONANTS.forEach((c) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cbtn' + (editDraft.consonant === c ? ' is-on' : '');
      b.textContent = c;
      b.addEventListener('click', () => { editDraft.consonant = c; drawMeChoosers(); updateMePreview(); });
      cg.appendChild(b);
    });
    const kg = $('#colorGrid');
    kg.innerHTML = '';
    COLOR_IDS.forEach((id) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch' + (editDraft.color === id ? ' is-on' : '');
      b.style.background = colorOf(id).main;
      b.title = colorOf(id).name;
      b.setAttribute('aria-label', colorOf(id).name);
      b.addEventListener('click', () => { editDraft.color = id; drawMeChoosers(); updateMePreview(); });
      kg.appendChild(b);
    });
  }

  function updateMePreview() {
    const name = ($('#meNameInput').value || '').trim() || '이름 없음';
    $('#mePreview').innerHTML = glyph(editDraft.consonant, editDraft.color, {}) +
      `<span class="preview-name">${escapeHTML(name)}</span>`;
  }

  function saveMeModal() {
    const name = ($('#meNameInput').value || '').trim().slice(0, 12) || '1호';
    const status = ($('#meStatusInput').value || '').trim().slice(0, 40);
    if (joinMode) {
      const oldId = me.id;
      delete state.pickles[oldId];
      if (mode === 'firebase' && fb) { try { fb.refs.pickles.child(oldId).remove(); } catch (e) { /* 무시 */ } }
      me = { id: uid(), name, consonant: editDraft.consonant, color: editDraft.color };
      saveMe();
      ensureMe();
      state.pickles[me.id].status = status;
      state.pickles[me.id].room = 'work';
      state.pickles[me.id].pos = pickSlot('work', state.pickles, me.id);
      syncPickle(state.pickles[me.id]);
      if (mode !== 'firebase') localPublish();
      hideModal('#modalMe');
      renderAll();
      toast(`${name}(으)로 새로 입장했어요 🥒`);
      return;
    }
    me.name = name;
    me.consonant = editDraft.consonant;
    me.color = editDraft.color;
    saveMe();
    const p = state.pickles[me.id];
    if (p) {
      p.name = name;
      p.consonant = editDraft.consonant;
      p.color = editDraft.color;
      p.status = status;
      p.updatedAt = Date.now();
      syncPickle(p);
    }
    hideModal('#modalMe');
    renderAll();
    toast('내 피클을 저장했어요 ✨');
  }

  /* ---------------- 대화 ---------------- */
  function sendChat(raw) {
    const text = String(raw || '').trim();
    if (!text) return;
    const msg = {
      id: uid(), authorId: me.id, authorName: me.name, authorColor: me.color,
      authorConsonant: me.consonant, text: text.slice(0, 200), ts: Date.now(),
    };
    state.messages.push(msg);
    if (state.messages.length > 300) state.messages = state.messages.slice(-300);
    syncMessage(msg);
    renderMessages();
    const ask = stripMention(text);
    if (ask !== null) {
      if (!ask) { toast('@챗지피티 뒤에 궁금한 것을 적어주세요'); return; }
      askBot(ask);
    } else if (aiToggleOn) {
      askBot(text);
    }
  }

  const MENTION = /@(챗지피티|지피티|chatgpt|gpt)\s*/i;
  function stripMention(text) {
    if (!MENTION.test(text)) return null;
    return text.replace(MENTION, '').trim();
  }

  /* ---------------- ChatGPT ---------------- */
  function getKey() {
    try { return (localStorage.getItem(LS.key) || '').trim(); } catch (e) { return ''; }
  }
  function getModel() {
    try { return localStorage.getItem(LS.model) || 'gpt-4o-mini'; } catch (e) { return 'gpt-4o-mini'; }
  }
  function setBotStatus(s) {
    bot.status = String(s || '').slice(0, 60);
    try { localStorage.setItem(LS.bot, JSON.stringify({ status: bot.status })); } catch (e) { /* 무시 */ }
    const el = document.querySelector('.pickle.is-bot .bubble');
    if (el) el.textContent = bot.status;
  }

  async function askBot(prompt) {
    const question = String(prompt || '').trim();
    if (!question) return;
    const key = getKey();
    if (!key) {
      setBotStatus('API 키를 먼저 넣어주세요 🔑');
      toast('챗지피티를 쓰려면 API 키가 필요해요', { label: '키 넣기', fn: () => openAI() });
      return;
    }
    if (thinking) { toast('챗지피티가 아직 답을 쓰고 있어요 💭'); return; }

    thinking = true;
    setBotStatus('생각 중이에요… 💭');
    renderMessages();

    const source = state.messages.slice();
    if (source.length && source[source.length - 1].authorId === me.id && String(source[source.length - 1].text).indexOf(question) >= 0) source.pop();
    const history = source
      .filter((m) => !m.bot && m.text && Date.now() - (m.ts || 0) < 1000 * 60 * 60 * 6)
      .slice(-8)
      .map((m) => ({ role: 'user', content: `${m.authorName}: ${m.text}` }));

    const sys =
      "너는 '피클 합동 비서실'에서 함께 일하는 다정한 AI 동료 '챗지피티'야. " +
      '사무실 동료들과 대화하듯 한국어로 친근하고 짧게(보통 2~4문장) 답해. ' +
      '필요하면 할 일을 짧게 정리해주고, 모르면 모른다고 말해. 이모지는 가끔만 써.';

    let answer = '';
    try {
      answer = await callOpenAI(key, getModel(), [
        { role: 'system', content: sys },
        ...history,
        { role: 'user', content: question },
      ]);
    } catch (err) {
      thinking = false;
      const msg = err && err.message ? err.message : '알 수 없는 오류';
      setBotStatus('대답을 못 했어요 🥲');
      postBotMessage(`앗, 지금은 대답하기 어려워요. (${msg})`);
      return;
    }
    thinking = false;
    setBotStatus(answer.replace(/\s+/g, ' ').slice(0, 42) || '대답을 남겼어요 ✨');
    postBotMessage(answer);
  }

  function postBotMessage(text) {
    const msg = {
      id: uid(), authorId: 'chatgpt', authorName: '챗지피티', authorColor: 'mint',
      authorConsonant: 'BOT', text: String(text).slice(0, 1200), ts: Date.now(), bot: true,
    };
    state.messages.push(msg);
    if (state.messages.length > 300) state.messages = state.messages.slice(-300);
    syncMessage(msg);
    renderMessages();
    renderOffice();
    renderPeople();
  }

  async function callOpenAI(key, model, messages, maxTokens = 420) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 45000);
    let res;
    try {
      res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
        body: JSON.stringify({ model: model || 'gpt-4o-mini', messages, temperature: 0.75, max_tokens: maxTokens }),
        signal: ctrl.signal,
      });
    } catch (e) {
      clearTimeout(timer);
      if (e && e.name === 'AbortError') throw new Error('응답이 너무 늦어요');
      throw new Error('키가 올바른지, 인터넷이 연결되어 있는지 확인해 주세요');
    }
    clearTimeout(timer);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const detail = data && data.error && data.error.message ? data.error.message : 'HTTP ' + res.status;
      if (res.status === 401) throw new Error('API 키가 올바르지 않아요');
      if (res.status === 429) throw new Error('요청이 잠시 몰렸어요. 조금 뒤에 다시');
      if (res.status === 404) throw new Error('모델 이름을 확인해 주세요');
      if (res.status === 403) throw new Error('이 키로는 사용할 수 없어요');
      throw new Error(detail.slice(0, 80));
    }
    const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!text) throw new Error('빈 응답이 왔어요');
    return String(text).trim();
  }

  function openAI() {
    const inp = $('#keyInput');
    const key = getKey();
    inp.value = key;
    $('#modelSelect').value = getModel();
    updateAIStatus();
    showModal('#modalAI');
  }

  function updateAIStatus() {
    const key = getKey();
    const el = $('#keyStatus');
    if (!el) return;
    if (key) {
      const tail = key.length > 8 ? key.slice(-4) : '';
      el.className = 'key-status ok';
      el.textContent = `이 브라우저에 키가 저장되어 있어요 · sk-…${tail} · 모델 ${getModel()}`;
    } else {
      el.className = 'key-status';
      el.textContent = '아직 키가 없어요. 아래에 붙여넣고 저장하면 챗지피티가 대답할 수 있어요.';
    }
  }

  function saveKey() {
    const v = ($('#keyInput').value || '').trim();
    const model = $('#modelSelect').value || 'gpt-4o-mini';
    if (!v) {
      $('#setAIMsg').textContent = '키를 붙여넣어 주세요.';
      return;
    }
    try {
      localStorage.setItem(LS.key, v);
      localStorage.setItem(LS.model, model);
    } catch (e) {
      $('#setAIMsg').textContent = '브라우저 저장에 실패했어요.';
      return;
    }
    $('#setAIMsg').textContent = '저장했어요. 이제 채팅에서 @챗지피티 라고 불러보세요 🤖';
    $('#setAIMsg').className = 'set-msg ok';
    updateAIStatus();
    setBotStatus('대답 준비 완료! 무엇이든 물어보세요 🤖');
    renderPeople();
    renderStats();
    renderOffice();
  }

  function clearKey() {
    try { localStorage.removeItem(LS.key); } catch (e) { /* 무시 */ }
    $('#keyInput').value = '';
    $('#setAIMsg').textContent = '키를 지웠어요.';
    $('#setAIMsg').className = 'set-msg';
    updateAIStatus();
    setBotStatus('무엇이든 물어보세요 🤖');
    renderPeople();
    renderStats();
  }

  async function testKey() {
    const key = ($('#keyInput').value || '').trim() || getKey();
    if (!key) { $('#setAIMsg').textContent = '먼저 키를 붙여넣어 주세요.'; return; }
    const msgEl = $('#setAIMsg');
    msgEl.className = 'set-msg';
    msgEl.textContent = '연결을 확인하는 중…';
    try {
      const out = await callOpenAI(key, $('#modelSelect').value || 'gpt-4o-mini', [
        { role: 'user', content: '연결 확인. "안녕!"이라고만 답해줘.' },
      ], 20);
      msgEl.className = 'set-msg ok';
      msgEl.textContent = `연결 성공! 챗지피티가 "${out.slice(0, 40)}" 라고 인사했어요.`;
    } catch (e) {
      msgEl.className = 'set-msg';
      msgEl.textContent = '연결 실패: ' + (e.message || '알 수 없는 오류');
    }
  }

  /* ---------------- 화이트보드 ---------------- */
  let noteKind = 'memo';

  function addNote() {
    const input = $('#noteInput');
    const text = (input.value || '').trim();
    if (!text) { input.focus(); return; }
    const n = {
      id: uid(), authorId: me.id, authorName: me.name, authorColor: me.color,
      kind: noteKind, text: text.slice(0, 140), ts: Date.now(), done: false, updatedAt: Date.now(),
    };
    state.notes.push(n);
    syncNote(n);
    input.value = '';
    renderNotes();
    renderStats();
    toast(noteKind === 'todo' ? '할 일을 붙였어요 📎' : '메모를 붙였어요 📌');
    const ask = stripMention(text);
    if (ask !== null) {
      setTimeout(() => { if (ask) askBot(ask); else toast('@챗지피티 뒤에 궁금한 것을 적어주세요'); }, 250);
    }
  }

  function toggleNote(id) {
    const n = state.notes.find((x) => x.id === id);
    if (!n) return;
    n.done = !n.done;
    n.updatedAt = Date.now();
    syncNote(n);
    renderNotes();
  }

  function deleteNote(id) {
    const idx = state.notes.findIndex((x) => x.id === id);
    if (idx < 0) return;
    const [n] = state.notes.splice(idx, 1);
    if (mode === 'firebase' && fb) { try { fb.refs.notes.child(id).remove(); } catch (e) { /* 무시 */ } }
    else localPublish();
    renderNotes();
    renderStats();
    toast('메모를 지웠어요', {
      label: '되돌리기',
      fn: () => {
        state.notes.push(n);
        syncNote(n);
        renderNotes();
        renderStats();
      },
    });
  }

  /* ---------------- 모달 ---------------- */
  function showModal(sel) {
    const el = $(sel);
    if (!el) return;
    el.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function hideModal(sel) {
    const el = $(sel);
    if (!el) return;
    el.hidden = true;
    if (!$$('.modal-backdrop').some((m) => !m.hidden)) document.body.style.overflow = '';
  }
  function closeAllModals() {
    $$('.modal-backdrop').forEach((m) => { m.hidden = true; });
    document.body.style.overflow = '';
  }

  function switchTab(name) {
    $$('.tab').forEach((t) => {
      const on = t.dataset.tab === name;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
    });
    $$('.pane').forEach((p) => p.classList.toggle('is-active', p.dataset.pane === name));
  }

  function openCard(p) {
    cardTarget = p;
    $('#cardHero').innerHTML = glyph(p.bot ? 'BOT' : p.consonant, p.color, {});
    $('#cardTitle').textContent = p.name;
    $('#cardStatus').textContent = p.bot ? (bot.status || '무엇이든 물어보세요 🤖') : (p.status || '아직 상태 메시지가 없어요');
    const room = ROOMS[p.room];
    $('#cardRoom').textContent = room ? `${room.emoji} ${room.name}에 있어요` : '';
    $('#cardHi').textContent = p.bot ? '🤖 질문하기' : '👋 인사하기';
    $('#cardHi').dataset.bot = p.bot ? '1' : '';
    showModal('#modalCard');
  }

  /* ---------------- 설정 / Firebase ---------------- */
  function readConfig() {
    try {
      const raw = localStorage.getItem(LS.cfg);
      if (raw) {
        const v = JSON.parse(raw);
        if (v && v.databaseURL) return v;
      }
    } catch (e) { /* 무시 */ }
    const file = window.PICKLE_FIREBASE_CONFIG;
    if (file && typeof file === 'object' && file.databaseURL) return file;
    return null;
  }

  function openSettings() {
    const cfg = readConfig();
    $('#cfgInput').value = cfg ? JSON.stringify(cfg, null, 2) : '';
    $('#setMode').innerHTML = mode === 'firebase'
      ? '지금은 <b>실시간 DB 연결됨</b> 상태예요. 다른 기기와 함께 쓰고 있어요.'
      : '지금은 <b>로컬 데모</b> 상태예요. 설정을 넣으면 모든 기기에서 함께 써요.';
    $('#setMsg').textContent = '';
    $('#setMsg').className = 'set-msg';
    showModal('#modalSettings');
  }

  async function connectFromSettings() {
    const raw = ($('#cfgInput').value || '').trim();
    const msg = $('#setMsg');
    msg.className = 'set-msg';
    if (!raw) {
      msg.textContent = 'Firebase 설정(JSON)을 붙여넣어 주세요.';
      return;
    }
    let cfg;
    if (/^https?:\/\//i.test(raw)) cfg = { databaseURL: raw.replace(/\/+$/, '') };
    else {
      try { cfg = JSON.parse(raw); } catch (e) { msg.textContent = 'JSON 형식이 아니에요. firebaseConfig를 그대로 붙여넣어 주세요.'; return; }
    }
    if (!cfg || !cfg.databaseURL) { msg.textContent = 'databaseURL이 필요해요.'; return; }
    msg.textContent = '연결하는 중…';
    try {
      await connectFirebase(cfg);
      localStorage.setItem(LS.cfg, JSON.stringify(cfg));
      msg.className = 'set-msg ok';
      msg.textContent = '연결됐어요! 이제 모든 기기에서 실시간으로 함께 써요 ✨';
      setTimeout(() => { hideModal('#modalSettings'); }, 900);
    } catch (e) {
      msg.textContent = '연결하지 못했어요: ' + (e.message || e.code || '알 수 없는 오류');
    }
  }

  async function connectFirebase(cfg) {
    if (!window.firebase) throw new Error('Firebase SDK를 불러오지 못했어요. 네트워크를 확인해 주세요.');
    await disconnectFirebase();
    const app = firebase.initializeApp(cfg, 'pickle-office-' + Math.random().toString(36).slice(2, 8));
    const db = firebase.database(app);
    let snap;
    try {
      snap = await withTimeout(db.ref('office').once('value'), 15000, '연결이 응답하지 않아요. databaseURL과 규칙을 확인해 주세요.');
    } catch (e) {
      try { await app.delete(); } catch (e2) { /* 무시 */ }
      if (e && e.code === 'PERMISSION_DENIED') throw new Error('규칙에서 읽기/쓰기를 허용해 주세요 (테스트 규칙)');
      if (e && e.message === 'permission_denied') throw new Error('규칙에서 읽기/쓰기를 허용해 주세요 (테스트 규칙)');
      throw e;
    }

    fb = {
      app,
      db,
      refs: {
        pickles: db.ref('office/pickles'),
        messages: db.ref('office/messages'),
        notes: db.ref('office/notes'),
      },
    };
    mode = 'firebase';

    const val = snap.val();
    if (!val || !val.pickles || !Object.keys(val.pickles).length) {
      const seedData = Object.keys(state.pickles).length ? snapshot() : Object.assign(seed(), snapshot());
      try { await db.ref('office').set(JSON.parse(JSON.stringify(seedData))); } catch (e) { /* 규칙이 쓰기를 막으면 아래에서 읽기만 */ }
    } else {
      state.pickles = val.pickles || {};
      state.messages = toArray(val.messages).sort((a, b) => (a.ts || 0) - (b.ts || 0));
      state.notes = toArray(val.notes);
    }
    ensureMe();
    try {
      await fb.refs.pickles.child(me.id).set(JSON.parse(JSON.stringify(state.pickles[me.id])));
    } catch (e) {
      toast('읽기만 가능한 규칙이에요. 쓰려면 규칙을 확인해 주세요.');
    }

    fb.refs.pickles.on('value', (s) => {
      state.pickles = s.val() || {};
      ensureMe();
      renderOffice();
      renderPeople();
      renderHeader();
      renderStats();
    });
    fb.refs.messages.on('value', (s) => {
      state.messages = toArray(s.val()).sort((a, b) => (a.ts || 0) - (b.ts || 0)).slice(-300);
      renderMessages();
      renderStats();
    });
    fb.refs.notes.on('value', (s) => {
      state.notes = toArray(s.val());
      renderNotes();
      renderStats();
    });

    renderAll();
    toast('실시간 DB에 연결됐어요 ✨');
  }

  async function disconnectFirebase() {
    if (!fb) return;
    try {
      Object.values(fb.refs || {}).forEach((r) => r.off && r.off());
      await fb.app.delete();
    } catch (e) { /* 무시 */ }
    fb = null;
    mode = 'local';
  }

  async function goLocal() {
    await disconnectFirebase();
    try { localStorage.removeItem(LS.cfg); } catch (e) { /* 무시 */ }
    mode = 'local';
    localPublish();
    renderAll();
    $('#setMode').innerHTML = '지금은 <b>로컬 데모</b> 상태예요.';
    $('#setMsg').className = 'set-msg ok';
    $('#setMsg').textContent = '로컬 모드로 돌아왔어요.';
  }

  function withTimeout(promise, ms, message) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error(message)), ms);
      promise.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
    });
  }

  /* ---------------- 토스트 ---------------- */
  function toast(text, action) {
    const stack = $('#toastStack');
    if (!stack) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.appendChild(document.createTextNode(text));
    let removed = false;
    const remove = () => {
      if (removed) return;
      removed = true;
      clearTimeout(timer);
      el.classList.add('out');
      setTimeout(() => el.remove(), 240);
    };
    if (action) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = action.label;
      b.addEventListener('click', () => { action.fn(); remove(); });
      el.appendChild(b);
    }
    stack.appendChild(el);
    const timer = setTimeout(remove, action ? 6000 : 2800);
  }

  /* ---------------- 이벤트 연결 ---------------- */
  function wire() {
    // 탭
    $$('.tab').forEach((tab) => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // 방 이동
    $$('.room').forEach((room) => {
      room.addEventListener('click', (e) => {
        if (e.target.closest('.pickle')) return;
        moveTo(room.dataset.room);
      });
      room.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); moveTo(room.dataset.room); }
      });
    });

    // 상태
    const st = $('#statusInput');
    const commit = () => setStatus(st.value.trim());
    st.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } });
    st.addEventListener('blur', () => { const mine = state.pickles[me.id]; if (mine && st.value.trim() !== (mine.status || '')) commit(); });
    $('#statusSave').addEventListener('click', commit);

    const qs = $('#quickStatus');
    QUICK_STATUS.forEach((s) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'qs';
      b.textContent = s;
      b.addEventListener('click', () => { st.value = s; setStatus(s); });
      qs.appendChild(b);
    });

    // 내 피클
    $('#btnMe').addEventListener('click', () => openMe(false));
    $('#btnJoin').addEventListener('click', () => openMe(true));
    $('#meNameInput').addEventListener('input', updateMePreview);
    $('#meSave').addEventListener('click', saveMeModal);

    // 대화
    $('#chatForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#chatInput');
      sendChat(input.value);
      input.value = '';
      input.focus();
    });
    $('#aiToggle').addEventListener('click', () => {
      aiToggleOn = !aiToggleOn;
      $('#aiToggle').classList.toggle('is-on', aiToggleOn);
      $('#aiToggle').setAttribute('aria-pressed', String(aiToggleOn));
      $('#chatInput').placeholder = aiToggleOn ? '챗지피티에게 물어보기 — 그냥 적으면 돼요' : '다정한 한마디를 남겨보세요';
      toast(aiToggleOn ? '이제 보내는 말을 챗지피티에게도 물어봐요 🤖' : '챗지피티 호출을 껐어요');
    });

    // 화이트보드
    $('#noteTypes').addEventListener('click', (e) => {
      const b = e.target.closest('.chip');
      if (!b) return;
      noteKind = b.dataset.kind;
      $$('#noteTypes .chip').forEach((c) => c.classList.toggle('is-on', c === b));
      $('#noteInput').placeholder = noteKind === 'todo' ? '할 일을 적어보세요 (@챗지피티 라고 부를 수도 있어요)' : '화이트보드에 남길 메모를 적어보세요';
    });
    $('#noteForm').addEventListener('submit', (e) => { e.preventDefault(); addNote(); });

    // 초대 링크
    $('#btnInvite').addEventListener('click', async () => {
      const url = location.href.split('#')[0];
      try {
        await navigator.clipboard.writeText(url);
        toast(mode === 'firebase' ? '초대 링크를 복사했어요 🔗' : '링크를 복사했어요. 실시간 연결 후 함께 쓸 수 있어요 🔗');
      } catch (e) {
        toast('링크: ' + url);
      }
    });

    // 모달 공통
    $$('[data-close]').forEach((b) => b.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-backdrop');
      if (modal) hideModal('#' + modal.id);
    }));
    $$('.modal-backdrop').forEach((m) => {
      m.addEventListener('pointerdown', (e) => {
        if (e.target === m) hideModal('#' + m.id);
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllModals();
    });

    // 캐릭터 카드
    $('#cardHi').addEventListener('click', () => {
      if (!cardTarget) return;
      const isBot = cardTarget.bot;
      const name = cardTarget.name;
      hideModal('#modalCard');
      switchTab('chat');
      if (isBot) {
        const input = $('#chatInput');
        input.value = '@챗지피티 ';
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
        toast('챗지피티에게 물어보세요 🤖');
      } else {
        sendChat(`${name}님, 안녕하세요! 👋`);
        toast(`${name}님에게 인사를 건넸어요 👋`);
      }
    });
    $('#cardMove').addEventListener('click', () => {
      if (!cardTarget) return;
      moveTo(cardTarget.room);
      hideModal('#modalCard');
    });

    // 설정
    $('#connPill').addEventListener('click', openSettings);
    $('#btnSettings').addEventListener('click', openSettings);
    $('#btnConnect').addEventListener('click', connectFromSettings);
    $('#btnLocalMode').addEventListener('click', goLocal);
    $('#copyRules').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText($('#rulesPre').textContent);
        toast('규칙을 복사했어요 📋');
      } catch (e) {
        toast('복사하지 못했어요. 직접 선택해 주세요.');
      }
    });

    // 챗지피티 설정
    const aiBtn = $('#btnAI');
    if (aiBtn) aiBtn.addEventListener('click', openAI);
    const keyToggle = $('#keyToggle');
    if (keyToggle) keyToggle.addEventListener('click', () => {
      const inp = $('#keyInput');
      inp.type = inp.type === 'password' ? 'text' : 'password';
      keyToggle.textContent = inp.type === 'password' ? '보기' : '가리기';
    });
    $('#btnSaveKey').addEventListener('click', saveKey);
    $('#btnClearKey').addEventListener('click', clearKey);
    $('#btnTestKey').addEventListener('click', testKey);

    // 창이 다시 보이면 시간 갱신
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) renderHeader();
    });
  }

  /* ---------------- 부팅 ---------------- */
  function boot() {
    if (booted) return;
    booted = true;

    // 로컬 상태
    let stored = null;
    try { stored = JSON.parse(localStorage.getItem(LS.db) || 'null'); } catch (e) { stored = null; }
    me = loadMe();
    if (stored && stored.pickles) {
      state = { pickles: stored.pickles || {}, messages: stored.messages || [], notes: stored.notes || [] };
      if (!me) me = freshMe();
    } else {
      if (!me) me = freshMe();
      const s = seed();
      state = s;
    }
    ensureMe();
    saveMe();
    localPublish();

    // 다른 탭과 실시간 공유
    if ('BroadcastChannel' in window) {
      try { bc = new BroadcastChannel('pickle-office'); } catch (e) { bc = null; }
    }
    if (bc) bc.onmessage = (ev) => {
      if (ev && ev.data && ev.data.t === 'state') applyRemote(ev.data.state);
    };
    window.addEventListener('storage', (e) => {
      if (e.key !== LS.db || !e.newValue) return;
      try { applyRemote(JSON.parse(e.newValue)); } catch (err) { /* 무시 */ }
    });

    wire();
    renderAll();

    if (!stored) {
      setTimeout(() => toast('1호로 피클 합동 비서실에 들어왔어요 🥒 방을 눌러 이동해보세요'), 700);
    }

    // 주변에서 톡톡
    setInterval(() => {
      if (document.hidden) return;
      const cands = Object.values(state.pickles).filter((p) => p.status && p.room === state.pickles[me.id]?.room);
      if (!cands.length) return;
      const p = cands[Math.floor(Math.random() * cands.length)];
      const el = document.querySelector(`.pickle[data-id="${p.id}"]`);
      if (!el) return;
      el.classList.add('show-bubble');
      setTimeout(() => el.classList.remove('show-bubble'), 3600);
    }, 6500);

    // 시간에 따라 인사말 갱신
    setInterval(renderHeader, 60000);

    // 저장된 Firebase 설정이 있으면 조용히 연결
    const cfg = readConfig();
    if (cfg && cfg.databaseURL) {
      connectFirebase(cfg).catch((e) => {
        const pill = $('#connPill');
        if (pill) pill.querySelector('b').textContent = '연결 실패';
        toast('실시간 DB에 연결하지 못했어요: ' + (e.message || '알 수 없는 오류'));
      });
    }
  }

  boot();
})();
