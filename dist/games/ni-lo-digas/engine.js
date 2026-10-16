/* Ni lo digas — reglas y estado independientes de la interfaz. */
(function (root) {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  function shuffle(items, rng = Math.random) {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function create(config, cards, rng) {
    if (!Array.isArray(config.teams) || config.teams.length < 2) throw new Error('Agrega al menos dos equipos o jugadores.');
    if (config.teams.some(t => !t.name.trim())) throw new Error('Cada participante necesita un nombre.');
    const names = config.teams.map(t => t.name.trim().toLocaleLowerCase('es'));
    if (new Set(names).size !== names.length) throw new Error('Usa nombres distintos para los equipos o jugadores.');
    if (!Number.isInteger(config.rounds) || config.rounds < 1 || config.rounds > 30) throw new Error('Elige entre 1 y 30 rondas.');
    if (!Number.isInteger(config.seconds) || config.seconds < 15 || config.seconds > 600) throw new Error('El turno debe durar entre 15 y 600 segundos.');
    if (![-1, 0].includes(config.skipPenalty)) throw new Error('La penalización por pasar debe ser −1 o 0.');
    const pool = cards.filter(c => config.categories.includes(c.category)).map(c => c.id);
    if (!pool.length) throw new Error('Selecciona al menos una categoría.');
    return { version: 1, config: clone(config), pool, deck: shuffle(pool, rng), nextIndex: 0,
      pending: [], cycles: 0, phase: 'ready', turnNumber: 0, turn: null, turns: [], createdAt: Date.now() };
  }
  function draw(game, previous, rng) {
    if (game.pending.length) return game.pending.pop();
    if (game.nextIndex >= game.deck.length) {
      game.deck = shuffle(game.pool, rng);
      game.nextIndex = 0;
      game.cycles++;
      if (game.deck.length > 1 && game.deck[0] === previous) [game.deck[0], game.deck[1]] = [game.deck[1], game.deck[0]];
    }
    return game.deck[game.nextIndex++];
  }
  function start(game) {
    if (game.phase !== 'ready') return false;
    game.turn = { teamIndex: game.turnNumber % game.config.teams.length,
      round: Math.floor(game.turnNumber / game.config.teams.length) + 1,
      remainingMs: game.config.seconds * 1000, events: [], currentCard: draw(game) };
    game.phase = 'playing';
    return true;
  }
  function record(game, kind) {
    if (game.phase !== 'playing' || game.turn.remainingMs <= 0 || !['correct', 'taboo', 'skip'].includes(kind)) return false;
    const points = kind === 'correct' ? 1 : kind === 'taboo' ? -1 : game.config.skipPenalty;
    game.turn.events.push({ card: game.turn.currentCard, kind, points });
    game.turn.currentCard = draw(game, game.turn.currentCard);
    return true;
  }
  function undo(game) {
    if (!['playing', 'paused'].includes(game.phase) || !game.turn.events.length) return false;
    const event = game.turn.events.pop();
    game.pending.push(game.turn.currentCard);
    game.turn.currentCard = event.card;
    return true;
  }
  function finishTurn(game, reason = 'time') {
    if (!['playing', 'paused'].includes(game.phase)) return false;
    game.turns.push({ ...clone(game.turn), reason });
    game.turn = null;
    game.turnNumber++;
    game.phase = game.turnNumber >= game.config.teams.length * game.config.rounds ? 'finished' : 'summary';
    return true;
  }
  function next(game) {
    if (game.phase !== 'summary') return false;
    game.phase = 'ready';
    return true;
  }
  function totals(game, live = true) {
    const rows = game.config.teams.map((team, index) => ({ ...team, index, points: 0, correct: 0, taboo: 0, skip: 0, turns: 0 }));
    const turns = live && game.turn ? [...game.turns, game.turn] : game.turns;
    for (const turn of turns) {
      const row = rows[turn.teamIndex];
      row.turns++;
      for (const event of turn.events) { row.points += event.points; row[event.kind]++; }
    }
    const sorted = rows.sort((a, b) => b.points - a.points || a.index - b.index);
    let last = null, rank = 0;
    sorted.forEach((row, i) => { if (last !== row.points) rank = i + 1; row.rank = rank; last = row.points; });
    return sorted;
  }
  function restore(raw, cards) {
    const game = typeof raw === 'string' ? JSON.parse(raw) : clone(raw);
    const ids = new Set(cards.map(c => c.id));
    if (!game || game.version !== 1 || !game.config || !Array.isArray(game.deck) || !Array.isArray(game.turns)) throw new Error('Partida incompatible.');
    if (!['ready', 'playing', 'paused', 'summary', 'finished'].includes(game.phase)) throw new Error('Estado de partida inválido.');
    create(game.config, cards);
    if (!Array.isArray(game.pool) || !Array.isArray(game.pending) || !game.pool.length || game.pool.some(id => !ids.has(id)) || game.deck.some(id => !ids.has(id)) || game.pending.some(id => !ids.has(id))) throw new Error('El mazo cambió.');
    if (!Number.isInteger(game.nextIndex) || game.nextIndex < 0 || game.nextIndex > game.deck.length) throw new Error('Mazo inválido.');
    if (!Number.isInteger(game.turnNumber) || game.turnNumber !== game.turns.length || game.turnNumber > game.config.teams.length * game.config.rounds) throw new Error('Turnos inválidos.');
    for (const turn of [...game.turns, ...(game.turn ? [game.turn] : [])]) {
      if (!Number.isInteger(turn.teamIndex) || turn.teamIndex < 0 || turn.teamIndex >= game.config.teams.length || !Array.isArray(turn.events) || !ids.has(turn.currentCard) || !Number.isFinite(turn.remainingMs) || turn.remainingMs < 0 || turn.remainingMs > game.config.seconds * 1000) throw new Error('Turno inválido.');
      for (const e of turn.events) if (!ids.has(e.card) || !['correct', 'taboo', 'skip'].includes(e.kind) || e.points !== (e.kind === 'correct' ? 1 : e.kind === 'taboo' ? -1 : game.config.skipPenalty)) throw new Error('Puntuación inválida.');
    }
    if (['playing', 'paused'].includes(game.phase) && !game.turn) throw new Error('Falta el turno actual.');
    if (game.phase === 'playing') game.phase = 'paused';
    return game;
  }
  root.NLD = { shuffle, create, start, record, undo, finishTurn, next, totals, restore };
  if (typeof module !== 'undefined') module.exports = root.NLD;
})(globalThis);
