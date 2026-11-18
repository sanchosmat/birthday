/* Sprite playback is deliberately independent of the 40x64 physics collider. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SashaGameSprites = api;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';

  function choosePose(state) {
    if (state.phase === 'victory') return { name: 'victory' };
    if (state.phase === 'menu' || state.phase === 'gameover') return { name: 'idle' };
    if (state.effect && state.effect.until > state.elapsed) {
      const age = Math.max(0, .65 - (state.effect.until - state.elapsed));
      if (state.effect.type === 'miss' && age < 3 / 8) return { name: 'hurt', age };
      if (state.effect.type === 'catch' && age < 4 / 10) return { name: 'catch', age };
    }
    const player = state.player;
    if (player.vy < 0) {
      return { name: 'jump', phase: player.vy < -260 ? 0 : player.vy < -100 ? 1 : 2 };
    }
    if (player.y < state.ground - player.h - .5) return { name: 'fall' };
    return { name: player.moving ? 'run' : 'idle' };
  }

  function frameAt(animation, elapsed, reduced = false, phase = 0) {
    if (reduced) return animation.frames[0];
    let index = animation.fps ? Math.floor(Math.max(0, elapsed) * animation.fps) : phase;
    index = animation.loop ? index % animation.frames.length
      : Math.max(0, Math.min(animation.frames.length - 1, index));
    return animation.frames[index];
  }

  function placement(config, player, options = {}) {
    const scale = Math.max(1, Math.round(options.scale || 1));
    return {
      centerX: Math.round(options.centerX ?? player.x + player.w / 2),
      feetY: Math.round(options.feetY ?? player.y + player.h),
      left: -config.pivot.x * scale,
      top: -config.pivot.y * scale,
      width: config.frameWidth * scale,
      height: config.frameHeight * scale,
      facing: (options.facing ?? player.facing) < 0 ? -1 : 1,
      scale,
    };
  }

  function create(config, { ImageClass = globalThis.Image } = {}) {
    let source = null;
    let mode = 'loading';
    let error = null;
    let previousAnimation = null;
    let startedAt = 0;
    let lastFrame = null;
    const baseUrl = config.baseUrl || '';

    function loadImage(url, width, height) {
      return new Promise((resolve, reject) => {
        const image = new ImageClass();
        image.decoding = 'async';
        image.onload = () => {
          if (image.naturalWidth !== width || image.naturalHeight !== height) {
            reject(new Error('Unexpected sprite dimensions: ' + url));
          } else resolve(image);
        };
        image.onerror = () => reject(new Error('Sprite image failed to load: ' + url));
        image.src = url;
      });
    }

    const ready = loadImage(baseUrl + config.image,
      config.frameWidth * config.columns, config.frameHeight * config.rows)
      .then(image => { source = image; mode = 'atlas'; return { ok: true, mode }; })
      .catch(async atlasError => {
        error = atlasError;
        try {
          source = await loadImage(baseUrl + config.fallback, config.frameWidth, config.frameHeight);
          mode = 'fallback';
          return { ok: true, mode };
        } catch (fallbackError) {
          error = fallbackError;
          mode = 'error';
          return { ok: false, mode };
        }
      });

    function draw(ctx, state, time, reduced, options) {
      if (!source) return false;
      const pose = choosePose(state);
      if (pose.name !== previousAnimation) {
        previousAnimation = pose.name;
        startedAt = time;
      }
      const animation = config.animations[pose.name];
      const index = frameAt(animation, pose.age ?? time - startedAt, reduced, pose.phase);
      const frame = mode === 'atlas' ? index : 0;
      const sx = (frame % config.columns) * config.frameWidth;
      const sy = Math.floor(frame / config.columns) * config.frameHeight;
      const position = placement(config, state.player, options);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.translate(position.centerX, position.feetY);
      ctx.scale(position.facing, 1);
      ctx.drawImage(source, sx, sy, config.frameWidth, config.frameHeight,
        position.left, position.top, position.width, position.height);
      ctx.restore();
      lastFrame = { animation: pose.name, frame, ...position };
      return true;
    }

    return {
      ready,
      draw,
      reset() { previousAnimation = null; startedAt = 0; lastFrame = null; },
      get status() { return { mode, error: error?.message || null }; },
      get lastFrame() { return lastFrame; },
    };
  }

  return { create, choosePose, frameAt, placement };
});
