(function () {
  'use strict';
  const { cards, categories } = globalThis.TabuDeck;
  const E = globalThis.NLD;
  const $ = s => document.querySelector(s);
  const app = $('#app');
  const modal = $('#modal');
  const cardMap = new Map(cards.map(c => [c.id, c]));
  const categoryMap = new Map(categories.map(c => [c.id, c]));
  const GAME_KEY = 'ni-lo-digas.game.v1', DRAFT_KEY = 'ni-lo-digas.setup.v1';
  const COLORS = [['#efe6ff','#7451c2'],['#e8f1d9','#5e7c36'],['#ffe6dd','#bd6548'],['#e2ecfc','#5376ac'],['#ffe5ed','#b45879'],['#dcf0ef','#438f89']];
  const svg = (name) => {
    const paths = { check:'<path d="m5 12 4 4L19 6"/>', skip:'<path d="M4 7h10a6 6 0 0 1 0 12H7M9 2 4 7l5 5"/>', cross:'<path d="m7 7 10 10M17 7 7 17"/>', sound:'<path d="m11 5-6 4H2v6h3l6 4zM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>', mute:'<path d="m11 5-6 4H2v6h3l6 4zM17 9l5 6M22 9l-5 6"/>', expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>', people:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 5a5 5 0 0 1 3 5"/>', arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>' };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.check}</svg>`;
  };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const signed = n => n > 0 ? `+${n}` : n === 0 ? '0' : `−${Math.abs(n)}`;
  const fmt = n => n.toLocaleString('es-CL');
  let storageWarned = false, toastTimer;
  function toast(message) {
    const node = $('#toast'); node.textContent = message; node.classList.add('visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove('visible'), 3200);
  }
  function readStorage(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
  function writeStorage(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { if (!storageWarned) { storageWarned = true; toast('El navegador no permite guardar. Puedes jugar, pero la partida se perderá al cerrar.'); } }
  }
  function defaultDraft() {
    return { mode:'teams', teams:[{name:'Equipo 1',members:[]},{name:'Equipo 2',members:[]}], players:[{name:'Jugador 1',members:[]},{name:'Jugador 2',members:[]}], categories:categories.map(c => c.id), seconds:60, rounds:3, skipPenalty:-1, sound:true };
  }
  const savedDraft = readStorage(DRAFT_KEY);
  let draft = defaultDraft();
  if (savedDraft && ['teams','players'].includes(savedDraft.mode) && Array.isArray(savedDraft.teams) && Array.isArray(savedDraft.players) && savedDraft.teams.length >= 2 && savedDraft.players.length >= 2 && [...savedDraft.teams,...savedDraft.players].every(t => t && typeof t.name === 'string' && Array.isArray(t.members) && t.members.every(m => typeof m === 'string')) && Array.isArray(savedDraft.categories)) {
    draft = { ...draft, ...savedDraft, categories:savedDraft.categories.filter(id => categoryMap.has(id)) };
  }
  let game = null;
  try { const saved = readStorage(GAME_KEY); if(saved) game = E.restore(saved,cards); } catch { game = null; }
  let screen = 'setup', error = '', deadline = null, audioContext = null, wakeLock = null, starting = false, actionAt = 0, lastSavedSecond = -1;
  const currentEntries = () => draft.mode === 'teams' ? draft.teams : draft.players;
  const deckSize = () => cards.filter(c => draft.categories.includes(c.category)).length;
  const color = i => COLORS[i % COLORS.length];
  const teamMark = (i, size = '') => `<span class="team-mark ${size}" style="background:${color(i)[0]};color:${color(i)[1]}">${String(i+1).padStart(2,'0')}</span>`;
  function syncTime() { if (game?.phase === 'playing' && deadline !== null) game.turn.remainingMs = Math.max(0, deadline-Date.now()); }
  function saveGame() { if(game) { syncTime(); writeStorage(GAME_KEY,game); } }
  function saveDraft() { writeStorage(DRAFT_KEY,draft); }
  function render() {
    const y=window.scrollY;
    app.innerHTML = screen === 'setup' ? setupHTML() : gameHTML();
    document.body.dataset.screen=screen;
    document.body.dataset.focus=String(screen==='game'&&['playing','paused'].includes(game?.phase));
    window.scrollTo(0,y);
  }
  function setupHTML() {
    const entries = currentEntries();
    const selected = new Set(draft.categories);
    const all = selected.size === categories.length;
    return `<div class="screen-intro">
      ${game ? `<div class="resume-banner"><div><p>${game.phase==='finished'?'Tu última partida está guardada.':'Hay una partida esperando.'}</p><span class="muted">${game.config.teams.length} ${game.config.mode==='teams'?'equipos':'jugadores'} · ${game.turnNumber} turnos completados</span></div><div class="resume-actions"><button class="primary" data-action="resume">${game.phase==='finished'?'Ver resultado':'Continuar partida'} ↗</button></div></div>`:''}
      <section class="hero" aria-labelledby="hero-title"><div><div class="eyebrow"><span class="mini-dot"></span>El juego de lo que no puedes decir</div><h1 id="hero-title">Di todo.<br>Menos <em>lo obvio.</em></h1><p class="hero-copy">Tu equipo tiene la respuesta. Tú tienes las pistas.<br>Que no se te escape ninguna palabra prohibida.</p></div>
      <div class="hero-art" aria-hidden="true"><span class="spark">✳</span><div class="mini-card one"><small>NO PUEDES DECIR</small>GUITARRA<div class="card-lines">Cuerdas<br>Música<br>Tocar<br>Eléctrica</div></div><div class="mini-card two"><small>ADIVINA LA PALABRA</small>PALTA<div class="card-lines">Verde<br>Carozo<br>Guacamole<br>Untar</div></div><span class="spark second">✦</span></div></section>
      <div class="setup-layout"><div class="setup-main">
      <section class="panel"><div class="panel-head"><h2 class="panel-title"><span class="step-number">01</span>¿Quiénes juegan?</h2><div class="segmented" role="group" aria-label="Modo de juego"><button data-action="mode" data-mode="teams" class="${draft.mode==='teams'?'active':''}" aria-pressed="${draft.mode==='teams'}">Equipos</button><button data-action="mode" data-mode="players" class="${draft.mode==='players'?'active':''}" aria-pressed="${draft.mode==='players'}">Individual</button></div></div>
      <div class="participant-list">${entries.map((team,i) => `<div class="participant-row">${teamMark(i)}<label class="sr-only" for="name-${i}">Nombre del ${draft.mode==='teams'?'equipo':'jugador'} ${i+1}</label><input id="name-${i}" class="name-input" data-name="${i}" value="${esc(team.name)}" placeholder="${draft.mode==='teams'?'Equipo':'Jugador'} ${i+1}" autocomplete="off">${draft.mode==='teams'?`<button class="member-button" data-action="members" data-index="${i}" aria-label="Integrantes de ${esc(team.name)}">${team.members.length ? `${team.members.length} integrantes` : '+ Integrantes'}</button>`:''}<button class="remove-button" data-action="remove" data-index="${i}" aria-label="Quitar ${esc(team.name)}" ${entries.length<=2?'disabled':''}>×</button></div>`).join('')}</div>
      <button class="add-button" data-action="add">＋ Agregar ${draft.mode==='teams'?'equipo':'jugador'}</button><p class="helper-row">${svg('people')} ${draft.mode==='teams'?'Sin límite fijo de equipos ni integrantes. Los nombres de integrantes son opcionales.':'Sin límite fijo de jugadores. Quien da las pistas suma los aciertos.'}</p></section>
      <section class="panel"><div class="panel-head"><h2 class="panel-title"><span class="step-number">02</span>Elige las cartas</h2><span class="deck-count">${fmt(deckSize())} cartas</span></div>
      <button class="category all ${all?'selected':''}" data-action="all-categories" aria-pressed="${all}"><span class="category-icon">✳</span><span class="category-name">Un poco de todo<small>Las 20 categorías, mezcladas al azar</small></span><span class="category-check">✓</span></button>
      <div class="category-grid">${categories.map(c => `<button class="category ${selected.has(c.id)?'selected':''}" data-action="category" data-category="${c.id}" aria-pressed="${selected.has(c.id)}" aria-label="${esc(c.name)}, ${c.count} cartas"><span class="category-icon" aria-hidden="true">${c.icon}</span><span class="category-name">${esc(c.name)}</span><span class="category-check">✓</span></button>`).join('')}</div><p class="helper-row">Combina las categorías que quieras · 50 cartas por categoría</p></section></div>
      <aside class="panel settings-panel"><div class="panel-head"><h2 class="panel-title"><span class="step-number">03</span>A tu ritmo</h2><span aria-hidden="true">◷</span></div><div class="field-grid"><div class="field"><span class="field-label" id="duration-label">Segundos por turno</span><div class="choice-row" role="group" aria-labelledby="duration-label">${[30,60,90,120].map(s=>`<button class="choice ${draft.seconds===s?'active':''}" data-action="seconds" data-seconds="${s}" aria-pressed="${draft.seconds===s}">${s}<small>s</small></button>`).join('')}</div><label class="custom-time" for="custom-seconds">Otro tiempo <input type="number" id="custom-seconds" min="15" max="600" step="1" value="${draft.seconds}" aria-label="Segundos personalizados"> s</label></div>
      <div class="field"><label for="rounds">Rondas por ${draft.mode==='teams'?'equipo':'jugador'}</label><input class="small-select" type="number" id="rounds" min="1" max="30" step="1" value="${draft.rounds}"><p class="muted" style="font-size:9px;margin-top:7px">Todos juegan la misma cantidad de turnos.</p></div>
      <div class="field" style="grid-column:1/-1"><label for="skip-penalty">Cuando se cambia una carta</label><select class="small-select" id="skip-penalty"><option value="-1" ${draft.skipPenalty===-1?'selected':''}>Restar 1 punto · Con penalización</option><option value="0" ${draft.skipPenalty===0?'selected':''}>Sin penalización · Más relajado</option></select></div></div>
      <div class="rules-preview"><span class="rule-chip"><span class="rule-dot"></span>Acierto <strong>+1</strong></span><span class="rule-chip"><span class="rule-dot red"></span>Tabú <strong>−1</strong></span><span class="rule-chip"><span class="rule-dot gray"></span>Cambiar <strong>${signed(draft.skipPenalty)}</strong></span></div>
      <div class="sound-setting"><span>Sonidos del juego</span><button class="toggle ${draft.sound?'':'off'}" role="switch" aria-checked="${draft.sound}" aria-label="Sonidos del juego" data-action="sound"><span></span></button></div>
      ${error?`<p class="form-error" role="alert">${esc(error)}</p>`:''}<button class="primary wide" data-action="create">Que empiece el juego <span class="arrow">↗</span></button><p class="start-meta">${entries.length} ${draft.mode==='teams'?'equipos':'jugadores'} · ${entries.length*draft.rounds} turnos · ${fmt(deckSize())} cartas</p>
      <p class="muted" style="font-size:9px;margin-top:19px;text-align:center">Para jugar juntos, con un solo dispositivo.<br>La partida se guarda automáticamente aquí.</p></aside></div></div>`;
  }
  function whoPlays() {
    const index=game.turnNumber % game.config.teams.length;
    const round=Math.floor(game.turnNumber/game.config.teams.length)+1;
    const team=game.config.teams[index];
    const speaker=team.members.length?team.members[(round-1)%team.members.length]:null;
    return {index,round,team,speaker};
  }
  function gameHTML() {
    if (!game) { screen='setup'; return setupHTML(); }
    if (game.phase==='ready') return readyHTML();
    if (['playing','paused'].includes(game.phase)) return playHTML();
    return resultsHTML(game.phase==='finished');
  }
  function playTop(label) {
    return `<div class="play-top"><div class="breadcrumb">${label}</div><div class="play-top-actions"><button class="icon-button" data-action="sound" aria-label="${draft.sound?'Silenciar':'Activar sonido'}" aria-pressed="${draft.sound}">${svg(draft.sound?'sound':'mute')}</button><button class="icon-button" data-action="fullscreen" aria-label="Pantalla completa">${svg('expand')}</button></div></div>`;
  }
  function readyHTML() {
    const {index,round,team,speaker}=whoPlays();
    return `<div class="ready-screen screen-intro">${playTop(`Ronda <strong>${round} de ${game.config.rounds}</strong> · Turno ${game.turnNumber+1} de ${game.config.teams.length*game.config.rounds}`)}
      <section class="ready-card"><div class="ready-art" aria-hidden="true"><div class="bubble">?</div><span class="tiny">${index+1}</span></div><div class="eyebrow" style="justify-content:center">${game.turnNumber?'El siguiente turno es de':'Todo listo para comenzar'}</div><h1>${esc(team.name)}</h1><p class="intro">${game.config.mode==='teams'?`${speaker?`<strong>${esc(speaker)}</strong> da las pistas.`:'Elijan quién dará las pistas.'}<br>El resto de su equipo adivina.`:'Da las pistas para que los demás adivinen.<br>Cada acierto suma a tu puntuación.'}<br>Una persona rival vigila las palabras prohibidas.</p>
      <div class="turn-info"><span class="info-tag">◷ ${game.config.seconds} segundos</span><span class="info-tag">✳ ${fmt(game.pool.length)} cartas</span><span class="info-tag">↻ Ronda ${round}</span></div>
      <button class="primary" data-action="start">Estoy listo, ¡vamos! <span class="arrow">↗</span></button><p class="muted" style="font-size:9px;margin-top:13px">Solo quien da pistas y quien vigila deben ver la pantalla.</p></section>
      ${game.turns.length?`<h2 class="section-label">Así va la partida</h2>${scoreTable()}`:`<p class="muted" style="text-align:center;font-size:11px">Acierto +1 · Tabú −1 · Cambiar ${signed(game.config.skipPenalty)}<br>La palabra objetivo y sus variantes también están prohibidas.</p>`}
      <div class="utility-row"><button data-action="home">← Volver al inicio</button>${game.turns.length?'<button data-action="end-game">Finalizar partida</button>':''}</div></div>`;
  }
  function turnCounts(turn) {
    return turn.events.reduce((a,e)=>{a[e.kind]++;a.points+=e.points;return a;},{correct:0,taboo:0,skip:0,points:0});
  }
  function playHTML() {
    const t=game.turn,c=cardMap.get(t.currentCard),paused=game.phase==='paused';
    return `<section class="game-shell focus-game" aria-label="Turno de juego">
      <div class="focus-clock ${t.remainingMs<=10000?'urgent':''}" id="timer-panel"><span id="timer-time" role="timer" aria-label="Tiempo restante">${timeText(t.remainingMs)}</span></div>
      <article class="focus-word-card">${paused?'<div class="focus-paused"><h1>En pausa</h1></div>':`<h1>${esc(c.word)}</h1><ul class="focus-forbidden" aria-label="Palabras prohibidas">${c.forbidden.map(w=>`<li>${esc(w)}</li>`).join('')}</ul>`}</article>
      <div class="focus-actions" aria-label="Acciones de la carta">
        <button class="focus-action skip" data-action="card" data-kind="skip" ${paused?'disabled':''} aria-label="Cambiar carta">Cambiar</button>
        <button class="focus-action taboo" data-action="${paused?'pause':'card'}" ${paused?'':'data-kind="taboo"'} aria-label="${paused?'Continuar jugando':'Tabú'}">${paused?'Continuar':'¡TABÚ!'}</button>
        <button class="focus-action correct" data-action="card" data-kind="correct" ${paused?'disabled':''} aria-label="Carta acertada">Acertar</button>
      </div></section>`;
  }
  function timeText(ms) { const s=Math.max(0,Math.ceil(ms/1000));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }
  function scoreTable() {
    const rows=E.totals(game,false);
    return `<div class="table-wrap"><table aria-label="Tabla de puntuación"><thead><tr><th>${game.config.mode==='teams'?'Equipo':'Jugador'}</th><th class="num">Aciertos</th><th class="num">Tabús</th><th class="num">Cambios</th><th class="num">Puntos</th></tr></thead><tbody>${rows.map(r=>`<tr class="${r.rank===1&&game.turns.length?'leading':''}"><td class="team-cell"><span class="rank">${r.rank}</span>${esc(r.name)}</td><td class="num">${r.correct}</td><td class="num">${r.taboo}</td><td class="num">${r.skip}</td><td class="num"><strong>${signed(r.points)}</strong></td></tr>`).join('')}</tbody></table></div>`;
  }
  function resultsHTML(final) {
    const last=game.turns[game.turns.length-1];
    const counts=last?turnCounts(last):{correct:0,taboo:0,skip:0,points:0};
    const rows=E.totals(game,false), winners=rows.filter(r=>r.rank===1);
    const title=final?(winners.length>1?'¡Tenemos un empate!':`¡Ganó ${esc(winners[0].name)}!`):`Buen turno, ${esc(game.config.teams[last.teamIndex].name)}.`;
    const winnerNames=winners.map(r=>esc(r.name)).join(', ');
    const allCounts=final?rows.reduce((a,r)=>{a.correct+=r.correct;a.taboo+=r.taboo;a.skip+=r.skip;return a;},{correct:0,taboo:0,skip:0}):counts;
    return `<div class="results-screen screen-intro">${playTop(final?'El marcador final':`Ronda <strong>${last.round} de ${game.config.rounds}</strong> · Turno completado`)}
    <section class="results-hero"><div class="result-icon" aria-hidden="true">${final?'★':'✓'}</div><div class="eyebrow" style="justify-content:center">${final?'Partida terminada':last.reason==='time'?'¡Se acabó el tiempo!':'Turno cerrado'}</div><h1>${title}</h1><p>${final?`${winners.length>1?`${winnerNames} · `:''}${signed(winners[0].points)} puntos${game.endReason==='manual'?' · Partida finalizada antes de completar todos los turnos.':` · ${game.config.rounds} rondas completadas.`}`:`${signed(counts.points)} puntos en este turno. ${game.config.mode==='teams'?'El siguiente equipo ya puede prepararse.':'El siguiente jugador ya puede prepararse.'}`}</p><div class="result-stats"><div class="result-stat"><strong>${allCounts.correct}</strong><span>Aciertos</span></div><div class="result-stat"><strong>${allCounts.taboo}</strong><span>Tabús</span></div><div class="result-stat"><strong>${allCounts.skip}</strong><span>Cambios</span></div></div></section>
    <h2 class="section-label">${final?'La tabla de la partida':'Así va el marcador'}</h2>${scoreTable()}<p class="table-note">Acierto +1 · Tabú −1 · Cambiar ${signed(game.config.skipPenalty)}. ${final&&game.endReason==='manual'?'Los participantes pueden haber jugado distinta cantidad de turnos.':'Los empates comparten posición.'}</p>
    <div class="result-actions">${final?`<button class="primary" data-action="rematch">Otra partida, mismos equipos ↗</button><button class="secondary" data-action="home">Nueva configuración</button><button class="secondary" data-action="export">↓ Guardar resultados</button>`:`<button class="primary" data-action="next">Siguiente turno <span class="arrow">↗</span></button><button class="secondary" data-action="end-game">Finalizar partida</button>`}</div>
    ${last?`<details class="turn-log"><summary>${final?'Ver el detalle de los turnos':'Revisar las cartas de este turno'}</summary><ul class="log-list">${(final?game.turns:[last]).map(t=>`${final?`<li><strong>R${t.round} · ${esc(game.config.teams[t.teamIndex].name)}</strong><strong>${signed(turnCounts(t).points)}</strong></li>`:''}${t.events.map(e=>`<li><span>${esc(cardMap.get(e.card).word)}</span><span class="${e.kind}">${e.kind==='correct'?'Acierto':e.kind==='taboo'?'Tabú':'Cambio'} · ${signed(e.points)}</span></li>`).join('')}${!t.events.length?'<li>Sin cartas resueltas.</li>':''}`).join('')}</ul></details>`:''}</div>`;
  }
  function openModal(html) {
    $('#modal-content').innerHTML=`<div class="modal-body">${html}</div>`;
    if(!modal.open)modal.showModal();
  }
  const modalTop=title=>`<div class="modal-top"><h2 id="modal-title">${title}</h2><button class="modal-close" data-action="close-modal" aria-label="Cerrar">×</button></div>`;
  function help() {
    if(game?.phase==='playing'&&screen==='game') pause();
    openModal(`${modalTop('Lo sabes. No lo digas.')}<ol class="rules-list"><li><strong>Armen los equipos o ingresen jugadores.</strong> Elijan las categorías, el tiempo y cuántas rondas jugarán.</li><li><strong>Una persona da pistas.</strong> Su equipo adivina la palabra de arriba, sin ver la pantalla. Una persona rival mira las palabras prohibidas.</li><li><strong>Ni la palabra objetivo, ni las cinco prohibidas.</strong> Tampoco sus plurales, partes o derivados. Sin gestos, sonidos imitativos, iniciales, traducciones, rimas ni «suena como».</li><li><strong>Tres botones, así de simple.</strong> <b>Acertada</b>: +1. <b>TABÚ</b>: −1. <b>Cambiar</b>: −1, o 0 si activaron el modo relajado. Los tres muestran otra carta al instante.</li><li><strong>Cuando suena el reloj, cambia el turno.</strong> La carta pendiente no puntúa. Cada equipo o jugador juega una vez por ronda. Gana quien sume más al finalizar.</li></ol><div class="callout"><strong>Modo individual:</strong> el jugador del turno da las pistas a los demás y recibe los puntos. Para un grupo de dos, una persona adivina y también vigila: es una variante casual de confianza.<br><strong>Un solo dispositivo:</strong> pasen el teléfono entre turnos. Los integrantes de un equipo rotan al dar pistas si ingresaron sus nombres.</div><p class="muted" style="font-size:10px">Adaptación para varios equipos: las penalizaciones se restan al participante del turno. Las cartas se barajan sin repetirse hasta agotar el mazo seleccionado; después se mezclan otra vez.</p><p class="muted" style="font-size:10px;margin-top:12px">Juego independiente, sin afiliación a Hasbro. <a style="text-decoration:underline" href="https://instructions.hasbro.com/es-cl/instruction/taboo-game-instructions" target="_blank" rel="noopener noreferrer">Reglas oficiales de referencia ↗</a></p><div class="modal-actions"><button class="primary" data-action="close-modal">Entendido ↗</button></div>`);
  }
  function members(index) {
    const team=currentEntries()[index];
    openModal(`${modalTop(`¿Quiénes están en ${esc(team.name)}?`)}<p class="muted">Un nombre por línea. Sin límite fijo de integrantes.<br>Se turnarán para dar las pistas en cada ronda.</p><label for="members-input" class="sr-only">Nombres de integrantes</label><textarea id="members-input" placeholder="Alex&#10;Camila&#10;Diego">${esc(team.members.join('\n'))}</textarea><p class="muted" style="font-size:10px">Es opcional. También pueden elegir a quien da pistas en cada turno.</p><div class="modal-actions"><button class="secondary" data-action="close-modal">Cancelar</button><button class="primary" data-action="save-members" data-index="${index}">Guardar integrantes</button></div>`);
  }
  function ensureAudio() {
    if(!draft.sound)return;
    try { const Ctx=window.AudioContext||window.webkitAudioContext;if(Ctx){audioContext ||= new Ctx();audioContext.resume().catch(()=>{});} } catch {}
  }
  function beep(kind) {
    if(!draft.sound)return;
    ensureAudio();if(!audioContext)return;
    try {
      const tones=kind==='correct'?[[659,0,.09],[880,.09,.15]]:kind==='taboo'?[[180,0,.23]]:kind==='end'?[[440,0,.18],[330,.2,.18],[220,.4,.35]]:kind==='tick'?[[650,0,.045]]:[[400,0,.065]];
      for(const [hz,delay,duration] of tones){const o=audioContext.createOscillator(),g=audioContext.createGain(),at=audioContext.currentTime+delay;o.type=kind==='taboo'?'sawtooth':'sine';o.frequency.value=hz;g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(.11,at+.008);g.gain.exponentialRampToValueAtTime(.001,at+duration);o.connect(g);g.connect(audioContext.destination);o.start(at);o.stop(at+duration+.02);}
    } catch {}
  }
  async function keepAwake() { try { if('wakeLock' in navigator)wakeLock=await navigator.wakeLock.request('screen'); } catch {} }
  function releaseAwake() { if(wakeLock){wakeLock.release().catch(()=>{});wakeLock=null;} }
  function pause() {
    if(game?.phase==='playing'){syncTime();if(game.turn.remainingMs<=0){finishTurn();return;}game.phase='paused';deadline=null;releaseAwake();saveGame();render();}
  }
  function togglePause() {
    if(game.phase==='playing')pause();else if(game.phase==='paused'){if(game.turn.remainingMs<=0){finishTurn();return;}ensureAudio();game.phase='playing';deadline=Date.now()+game.turn.remainingMs;actionAt=Date.now();saveGame();keepAwake();render();}
  }
  function finishTurn(reason='time') {
    syncTime();deadline=null;releaseAwake();
    if(E.finishTurn(game,reason)){beep('end');try{navigator.vibrate?.([120,70,120]);}catch{}saveGame();render();window.scrollTo(0,0);}
  }
  async function startCountdown() {
    if(starting||game.phase!=='ready')return;
    starting=true;ensureAudio();
    const node=document.createElement('div');node.className='countdown';node.setAttribute('role','status');document.body.append(node);
    for(let n=3;n>=1;n--){
      if(document.hidden){node.remove();starting=false;toast('Vuelve a pulsar «Estoy listo» para comenzar.');return;}
      node.innerHTML=`<strong>${n}</strong><span>Solo quien da pistas debe ver la carta.</span>`;beep('tick');await new Promise(resolve=>setTimeout(resolve,750));
    }
    node.remove();starting=false;
    if(document.hidden)return;
    if(E.start(game)){deadline=Date.now()+game.turn.remainingMs;lastSavedSecond=-1;actionAt=Date.now();keepAwake();screen='game';saveGame();render();window.scrollTo(0,0);}
  }
  function handleCard(kind) {
    if(screen!=='game'||game.phase!=='playing'||modal.open||Date.now()-actionAt<260)return;
    syncTime();if(game.turn.remainingMs<=0){finishTurn();return;}
    if(E.record(game,kind)){actionAt=Date.now();beep(kind);if(kind==='taboo')try{navigator.vibrate?.(80);}catch{}saveGame();render();}
  }
  function createGame() {
    try {
      const candidate=E.create({mode:draft.mode,teams:currentEntries().map(t=>({name:t.name.trim(),members:draft.mode==='teams'?t.members:[]})),categories:[...draft.categories],seconds:Number(draft.seconds),rounds:Number(draft.rounds),skipPenalty:Number(draft.skipPenalty)},cards);
      const apply=()=>{game=candidate;deadline=null;screen='game';error='';saveDraft();saveGame();render();window.scrollTo(0,0);};
      if(game&&game.phase!=='finished')openModal(`${modalTop('¿Empezar una nueva partida?')}<p class="muted">La partida guardada será reemplazada por esta nueva configuración.</p><div class="modal-actions"><button class="secondary" data-action="close-modal">Cancelar</button><button class="primary" id="confirm-create">Empezar nueva</button></div>`),$('#confirm-create').onclick=()=>{modal.close();apply();};else apply();
    } catch(e){error=e.message;render();$('.form-error')?.scrollIntoView({block:'center',behavior:'smooth'});}
  }
  function endGame() {
    if(game.phase==='playing')pause();
    openModal(`${modalTop('¿Cerrar la partida?')}<p class="muted">Se mostrará la tabla final con los puntos obtenidos hasta ahora. Algunos participantes pueden haber jugado menos turnos.</p><div class="modal-actions"><button class="secondary" data-action="close-modal">Seguir jugando</button><button class="primary" data-action="confirm-end">Ver tabla final</button></div>`);
  }
  function exportResults() {
    const cell=v=>'"'+String(v).replace(/"/g,'""')+'"';
    const safeName=v=>/^[=+\-@\t\r]/.test(v)?"'"+v:v;
    const rows=[['Posición',game.config.mode==='teams'?'Equipo':'Jugador','Puntos','Aciertos','Tabús','Cambios','Turnos'],...E.totals(game,false).map(r=>[r.rank,safeName(r.name),r.points,r.correct,r.taboo,r.skip,r.turns])];
    const csv='\ufeff'+rows.map(r=>r.map(cell).join(';')).join('\r\n');
    if(window.NLD_NATIVE&&window.AndroidGame&&typeof window.AndroidGame.saveResults==='function'){window.AndroidGame.saveResults(csv);return;}
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ni-lo-digas-resultados.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Resultados listos para guardar.');
  }
  async function action(event) {
    const button=event.target.closest('[data-action]');if(!button||button.disabled)return;
    const name=button.dataset.action;
    if(name==='close-modal'){modal.close();return;}
    if(name==='sound'){draft.sound=!draft.sound;saveDraft();if(draft.sound)beep('correct');render();return;}
    if(name==='help'){help();return;}
    if(name==='install-platform'){showInstallGuide(button.dataset.platform);return;}
    if(name==='members'){members(Number(button.dataset.index));return;}
    if(name==='save-members'){currentEntries()[Number(button.dataset.index)].members=$('#members-input').value.split('\n').map(s=>s.trim()).filter(Boolean);saveDraft();modal.close();render();return;}
    if(name==='mode'){draft.mode=button.dataset.mode;error='';saveDraft();render();return;}
    if(name==='add'){const a=currentEntries(),prefix=draft.mode==='teams'?'Equipo':'Jugador';let n=a.length+1;while(a.some(t=>t.name.trim().toLowerCase()===`${prefix} ${n}`.toLowerCase()))n++;a.push({name:`${prefix} ${n}`,members:[]});saveDraft();render();const input=$(`#name-${a.length-1}`);input?.focus();input?.select();return;}
    if(name==='remove'){if(currentEntries().length>2){currentEntries().splice(Number(button.dataset.index),1);saveDraft();render();}return;}
    if(name==='category'){const id=button.dataset.category;draft.categories=draft.categories.includes(id)?draft.categories.filter(c=>c!==id):[...draft.categories,id];error='';saveDraft();render();return;}
    if(name==='all-categories'){draft.categories=draft.categories.length===categories.length?[]:categories.map(c=>c.id);error='';saveDraft();render();return;}
    if(name==='seconds'){draft.seconds=Number(button.dataset.seconds);saveDraft();render();return;}
    if(name==='create'){createGame();return;}
    if(name==='resume'){screen='game';render();window.scrollTo(0,0);return;}
    if(name==='start'){startCountdown();return;}
    if(name==='card'){handleCard(button.dataset.kind);return;}
    if(name==='pause'){togglePause();return;}
    if(name==='undo'){syncTime();if(game.phase==='playing'&&game.turn.remainingMs<=0){finishTurn();return;}if(E.undo(game)){actionAt=Date.now();saveGame();render();toast('Última acción deshecha.');}return;}
    if(name==='next'){E.next(game);saveGame();render();window.scrollTo(0,0);return;}
    if(name==='home'){if(game?.phase==='playing')pause();screen='setup';render();window.scrollTo(0,0);return;}
    if(name==='end-game'){endGame();return;}
    if(name==='confirm-end'){if(['playing','paused'].includes(game.phase))E.finishTurn(game,'manual');game.phase='finished';game.endReason='manual';deadline=null;releaseAwake();modal.close();saveGame();render();window.scrollTo(0,0);return;}
    if(name==='rematch'){game=E.create(game.config,cards);screen='game';saveGame();render();window.scrollTo(0,0);return;}
    if(name==='export'){exportResults();return;}
    if(name==='fullscreen'){try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else toast('Puedes instalar la app para usarla en pantalla completa.');}catch{toast('El navegador no permite pantalla completa aquí.');}return;}
  }
  document.addEventListener('click',action);
  document.addEventListener('input',event=>{if(event.target.matches('[data-name]')){currentEntries()[Number(event.target.dataset.name)].name=event.target.value;saveDraft();}});
  document.addEventListener('change',event=>{
    if(event.target.id==='rounds'){draft.rounds=Number(event.target.value);saveDraft();render();}
    if(event.target.id==='custom-seconds'){draft.seconds=Number(event.target.value);saveDraft();render();}
    if(event.target.id==='skip-penalty'){draft.skipPenalty=Number(event.target.value);saveDraft();render();}
  });
  document.addEventListener('keydown',event=>{
    if(event.repeat||modal.open||screen!=='game'||event.ctrlKey||event.altKey||event.metaKey||['INPUT','TEXTAREA','SELECT','BUTTON','A'].includes(event.target.tagName)||event.target.isContentEditable)return;
    if(['playing','paused'].includes(game?.phase)){
      const map={ArrowLeft:'skip',ArrowRight:'correct',' ':'taboo'};
      if(map[event.key]){event.preventDefault();handleCard(map[event.key]);}
      if(event.key.toLowerCase()==='p'){event.preventDefault();togglePause();}
    }
  });
  $('#help-button').onclick=help;
  $('#brand').onclick=e=>{e.preventDefault();if(game?.phase==='playing')pause();screen='setup';render();window.scrollTo(0,0);};
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&game?.phase==='playing')pause();});
  window.addEventListener('pagehide',()=>{if(game?.phase==='playing'){syncTime();game.phase='paused';deadline=null;}saveGame();releaseAwake();});
  window.addEventListener('pageshow',event=>{if(event.persisted){installState();render();initOffline();}});
  setInterval(()=>{
    if(game?.phase!=='playing'||screen!=='game')return;
    syncTime();if(game.turn.remainingMs<=0){finishTurn();return;}
    const ms=game.turn.remainingMs,s=Math.ceil(ms/1000),time=$('#timer-time'),progress=$('#time-progress');
    if(time)time.textContent=timeText(ms);if(progress)progress.style.width=`${ms/(game.config.seconds*10)}%`;$('#timer-panel')?.classList.toggle('urgent',ms<=10000);
    if(lastSavedSecond!==s){if(s<=5)beep('tick');lastSavedSecond=s;saveGame();}
  },120);
  function installState(){ $('#install-button').hidden=Boolean(window.BUK?.installed()); }
  function showInstallGuide(){ window.BUK.install(); }
  $('#install-button').onclick=()=>{if(game?.phase==='playing')pause();window.BUK.install();};
  function updateOffline(){const ok=window.BUK?.offlineReady;$('#offline-indicator').classList.toggle('ready',!!ok);$('#offline-label').textContent=ok?'Listo sin conexión':'Juega en línea';}
  function initOffline(){updateOffline();window.BUK?.checkOffline();}
  window.addEventListener('buk:offline',updateOffline);
  window.NLDNativePause=()=>{if(game?.phase==='playing')pause();else saveGame();};
  window.NLDNativeBack=()=>{
    if(modal.open){modal.close();return true;}
    if(screen==='game'&&game?.phase==='playing'){pause();return true;}
    if(screen==='game'){screen='setup';render();window.scrollTo(0,0);return true;}
    return false;
  };
  installState();render();initOffline();
})();
