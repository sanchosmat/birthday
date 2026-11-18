/* Shared, DOM-free rules. Also usable by Node's built-in test runner. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SashaGameCore = api;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const BASE_SPEED = 82;
  const MAX_SPEED = BASE_SPEED * 4;
  const PLAYER_SPEED = 310;
  const COIN_SIZE = 32;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function createState(totalCoins = 26, width = 960, height = 540, ground = height - 34) {
    return {
      totalCoins, width, height, ground, phase: 'playing', elapsed: 0,
      score: 0, lives: 3, combo: 0, maxCombo: 0, caught: 0, index: 0,
      speed: BASE_SPEED, wait: .5, drop: null, effect: null, event: null,
      player: { x: (width - 40) / 2, y: ground - 64, w: 40, h: 64, vy: 0, facing: 1, moving: false }
    };
  }

  function spawn(state, random = Math.random) {
    if (state.index >= state.totalCoins) return;
    const w = COIN_SIZE, h = COIN_SIZE;
    const proposed = 14 + random() * (state.width - w - 28);
    // Keep late waves reachable even on a short landscape screen.
    const availableTime = (state.ground - state.player.h - h - 10) / state.speed;
    const reach = Math.max(0, availableTime - .22) * PLAYER_SPEED;
    const center = state.player.x + state.player.w / 2;
    const x = clamp(clamp(proposed, center - reach - w / 2, center + reach - w / 2), 14, state.width - w - 14);
    state.drop = { x, y: 10, w, h };
  }

  function jump(state) {
    const p = state.player;
    if (state.phase === 'playing' && p.y >= state.ground - p.h - .5) p.vy = -380;
  }

  function finish(state) {
    if (state.lives <= 0) state.phase = 'gameover';
    else if (state.index >= state.totalCoins) {
      state.phase = 'victory';
      state.score += 1000;
    }
  }

  function resolveDrop(state, caught) {
    if (!state.drop || state.phase !== 'playing') return;
    const d = state.drop;
    if (caught) {
      state.caught++;
      state.combo++;
      state.maxCombo = Math.max(state.maxCombo, state.combo);
      const points = (state.combo >= 10 ? 200 : 100) + (state.combo === 5 ? 250 : 0);
      state.score += points;
      state.speed = Math.min(MAX_SPEED, BASE_SPEED * Math.pow(1.10, state.caught));
      state.event = {
        type: 'catch', x: d.x + d.w / 2, y: d.y, label: '+' + points,
        coin: { x: d.x, y: d.y, w: d.w, h: d.h }
      };
    } else {
      state.lives = Math.max(0, state.lives - 1);
      state.combo = 0;
      state.event = { type: 'miss', x: state.player.x, y: state.player.y - 20, label: 'ПРОПУСК' };
    }
    state.effect = { ...state.event, until: state.elapsed + .65 };
    state.index++;
    state.drop = null;
    state.wait = caught ? .5 : .85;
    finish(state);
  }

  function update(state, dt, input = {}, random = Math.random) {
    state.event = null;
    if (state.phase !== 'playing') return;
    dt = clamp(dt, 0, .05);
    state.elapsed += dt;
    const p = state.player;
    const direction = Number(Boolean(input.right)) - Number(Boolean(input.left));
    p.moving = direction !== 0;
    if (direction) p.facing = direction;
    p.x = clamp(p.x + direction * PLAYER_SPEED * dt, 4, state.width - p.w - 4);
    p.vy += 1100 * dt;
    p.y = Math.min(state.ground - p.h, p.y + p.vy * dt);
    if (p.y === state.ground - p.h) p.vy = 0;

    if (!state.drop) {
      state.wait -= dt;
      if (state.wait <= 0) spawn(state, random);
      return;
    }
    const d = state.drop;
    const previousY = d.y;
    d.y += state.speed * dt;
    const overlapsX = d.x < p.x + p.w && d.x + d.w > p.x;
    // A swept vertical check also catches fast coins between frames.
    if (overlapsX && d.y + d.h >= p.y && previousY <= p.y + p.h) resolveDrop(state, true);
    else if (d.y + d.h >= state.ground) resolveDrop(state, false);
  }

  function resize(state, width, height, ground = height - 34) {
    const ratio = width / state.width;
    const jumpHeight = state.ground - state.player.h - state.player.y;
    const progress = state.drop ? state.drop.y / Math.max(1, state.ground - state.drop.h) : 0;
    state.width = width;
    state.height = height;
    state.ground = ground;
    state.player.x = clamp(state.player.x * ratio, 4, width - state.player.w - 4);
    state.player.y = state.ground - state.player.h - jumpHeight;
    if (state.drop) {
      const d = state.drop;
      d.x = clamp(d.x * ratio, 14, width - d.w - 14);
      d.y = clamp(progress * (state.ground - d.h), 10, state.ground - d.h - 1);
    }
  }

  return { BASE_SPEED, MAX_SPEED, PLAYER_SPEED, COIN_SIZE, createState, spawn, jump, update, resize };
});
