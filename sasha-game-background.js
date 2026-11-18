(function (root, factory) {
  const stages = typeof module === 'object' && module.exports
    ? require('./sasha-game-stage-config.js') : root.SashaGameStages;
  const api = factory(stages);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SashaGameBackground = api;
})(typeof window === 'object' ? window : globalThis, function (stages) {
  'use strict';

  function drawTree(ctx, x, ground, scale, bright) {
    ctx.save();ctx.translate(Math.round(x), Math.round(ground));ctx.scale(scale, scale);
    ctx.fillStyle = '#102e2d';ctx.fillRect(-8,-128,16,128);ctx.fillRect(-31,-110,62,15);
    ctx.fillStyle = '#73572f';ctx.fillRect(-4,-106,8,106);
    ctx.fillStyle = bright ? '#2e6542' : '#23553e';
    [[-57,-153,58,48],[-21,-178,60,60],[12,-147,51,50],[-50,-116,87,43]].forEach(r=>ctx.fillRect(...r));
    ctx.fillStyle = bright ? '#6b9b39' : '#3f7e43';
    [[-52,-152,32,21],[-16,-173,35,29],[26,-142,31,22],[-42,-112,55,21]].forEach(r=>ctx.fillRect(...r));
    ctx.fillStyle='#aac65a';ctx.fillRect(-10,-169,17,9);ctx.fillRect(32,-139,13,8);
    ctx.restore();
  }

  function drawPark(ctx, state, time, reduced) {
    const {width:w,height:h,ground:g}=state;
    ctx.fillStyle='#7fb9cb';ctx.fillRect(0,0,w,h);
    const parallax=reduced?0:(state.player.x/w-.5)*16;
    ctx.fillStyle='#e8edd2';
    for(let i=0;i<5;i++){const x=(i*w/4+time*(reduced?0:2))%(w+120)-60-parallax*.25,y=25+(i%3)*30;ctx.fillRect(Math.round(x),y,68,14);ctx.fillRect(Math.round(x)+17,y-12,30,15)}
    ctx.fillStyle='#7da58a';ctx.fillRect(0,g-180,w,180);
    for(let i=0;i<9;i++)drawTree(ctx,i*w/8-parallax*.6,g-35,.78,false);
    drawTree(ctx,24-parallax,g,1.2,true);drawTree(ctx,w-14-parallax,g,1.4,true);
    ctx.fillStyle='#518342';ctx.fillRect(0,g-19,w,24);
    ctx.fillStyle='#82a64c';for(let x=0;x<w;x+=23)ctx.fillRect(x,g-14+(x%7),12,5);
    ctx.fillStyle='#193b2f';ctx.fillRect(0,g,w,34);ctx.fillStyle='#bcce65';ctx.fillRect(0,g,w,4);
    ctx.fillStyle='#678849';for(let x=0;x<w;x+=31)ctx.fillRect(x,g+5,13,3);
    if(!reduced)for(let i=0;i<7;i++){ctx.fillStyle='#bad07c';ctx.fillRect(Math.round((i*139+time*12)%(w+20)),Math.round(50+(time*14+i*47)%(g-65)),4,3)}
  }

  function extendPaving(ctx, stage, view, width, height, image) {
    if (view.imageBottom >= height) return;
    const middle = width / 2;
    let row = 0;
    for (let top = Math.max(0, view.imageBottom - 1); top < height; row++) {
      const depth = Math.max(24, top - view.horizonY);
      const bottom = Math.min(height, top + Math.max(8, Math.round(depth * .12)));
      const topWidth = depth * .62;
      const bottomWidth = Math.max(24, bottom - view.horizonY) * .62;
      const columns = Math.ceil(width / topWidth) + 2;
      const offset = row % 2 ? .5 : 0;
      for (let column = -columns; column <= columns; column++) {
        const left = Math.round(middle + (column + offset) * topWidth);
        const right = Math.round(middle + (column + 1 + offset) * topWidth);
        const lowerLeft = Math.round(middle + (column + offset) * bottomWidth);
        const lowerRight = Math.round(middle + (column + 1 + offset) * bottomWidth);
        const color = Math.abs(column * 17 + row * 23) % stage.paving.length;
        ctx.fillStyle = stage.paving[color];
        ctx.beginPath();ctx.moveTo(left,top);ctx.lineTo(right,top);
        ctx.lineTo(lowerRight,bottom);ctx.lineTo(lowerLeft,bottom);ctx.closePath();ctx.fill();
        const sample = stage.pavingTexture;
        ctx.save();ctx.clip();ctx.globalAlpha = .32;
        ctx.drawImage(image,sample.x,sample.y,sample.width,sample.height,
          Math.min(left,lowerLeft),top,Math.max(right,lowerRight)-Math.min(left,lowerLeft),bottom-top);
        ctx.restore();
        ctx.strokeStyle = '#776e80';ctx.lineWidth = 1;ctx.stroke();
      }
      top = bottom;
    }
  }

  function create({ stageId = () => 'citySquare', ImageClass = globalThis.Image,
    createCanvas = () => document.createElement('canvas') } = {}) {
    const resources = new Map();
    let cache = null;
    let cacheBuilds = 0;

    function loadImage(url, width, height) {
      return new Promise((resolve, reject) => {
        const image = new ImageClass();image.decoding = 'async';
        image.onload = () => image.naturalWidth === width && image.naturalHeight === height
          ? resolve(image) : reject(new Error('Unexpected background dimensions: ' + url));
        image.onerror = () => reject(new Error('Background failed to load: ' + url));
        image.src = url;
      });
    }

    function ensure(stage) {
      if (resources.has(stage.id)) return resources.get(stage.id);
      const entry = { id: stage.id, mode: stage.id === 'park' ? 'procedural' : 'loading', image: null, cloud: null, error: null };
      resources.set(stage.id, entry);
      if (stage.id === 'park') {
        entry.ready = Promise.resolve({ ok: true, id: stage.id, mode: entry.mode });
        return entry;
      }
      const imageReady = loadImage(stage.buildingSrc, stage.reference.width, stage.reference.height)
        .then(image => { entry.image = image; entry.mode = stage.fullScene ? 'flat' : 'layered'; })
        .catch(async error => {
          entry.error = error.message;
          try {
            entry.image = await loadImage(stage.backgroundSrc, stage.reference.width, stage.reference.height);
            entry.mode = 'flat';
          } catch (failure) { entry.error = failure.message; entry.mode = 'fallback'; }
        });
      const cloudReady = loadImage(stage.cloudSrc, 240, 50)
        .then(image => { entry.cloud = image; }).catch(() => {});
      entry.ready = Promise.all([imageReady, cloudReady]).then(() => ({ ok: !!entry.image, id: stage.id, mode: entry.mode }));
      return entry;
    }

    function buildCache(stage, entry, width, height) {
      const view = stages.camera(stage, width, height);
      const base = createCanvas(), building = createCanvas();
      base.width = building.width = width;base.height = building.height = height;
      const sky = base.getContext('2d'), main = building.getContext('2d');
      sky.imageSmoothingEnabled = main.imageSmoothingEnabled = false;
      for (let y = 0; y < height; y += 8) {
        const mix = Math.min(1, y / Math.max(1, view.horizonY));
        const color = stage.skyTop.map((channel, i) => Math.round(channel + (stage.skyBottom[i] - channel) * mix));
        sky.fillStyle = 'rgb(' + color.join(',') + ')';sky.fillRect(0,y,width,8);
      }
      extendPaving(sky,stage,view,width,height,entry.image);
      main.drawImage(entry.image,view.sourceX,0,view.sourceWidth,stage.reference.height,
        0,view.imageY,width,view.imageHeight);
      cacheBuilds++;
      cache = { id: stage.id, mode: entry.mode, width, height, view, base, building };
      return cache;
    }

    function draw(ctx, state, time, reduced) {
      const stage = stages.getStage(stageId()), entry = ensure(stage);
      if (stage.id === 'park' || !entry.image) { drawPark(ctx,state,time,reduced); return; }
      const { width, height } = state;
      const frame = cache && cache.id === stage.id && cache.mode === entry.mode
        && cache.width === width && cache.height === height ? cache : buildCache(stage,entry,width,height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(frame.base,0,0);
      if (entry.mode === 'flat') ctx.drawImage(frame.building,0,0);
      if (entry.cloud) {
        const shift = reduced ? 0 : time * 2;
        for (let i = 0; i < 2; i++) {
          const x = Math.round((width * (.15 + i * .6) + shift) % (width + 280) - 140);
          ctx.drawImage(entry.cloud,x,Math.round(12 + i * Math.min(64,height * .1)));
        }
      }
      if (entry.mode !== 'flat') ctx.drawImage(frame.building,0,0);
      // Small highlights follow the actual puddles in the reference image.
      const view = frame.view;
      ctx.save();ctx.globalAlpha = reduced ? .2 : .22 + Math.sin(time * .8) * .06;
      ctx.fillStyle = '#e7f3f7';
      for (const [sourceX, sourceY, length] of [[560,810,92],[1450,712,68]]) {
        const x = Math.round((sourceX - view.sourceX) * view.scale + (reduced ? 0 : Math.sin(time * .5)));
        const y = Math.round(view.imageY + sourceY * view.scale);
        ctx.fillRect(x,y,Math.max(3,Math.round(length * view.scale)),1);
      }
      ctx.restore();
    }

    function drawShadow(ctx, state) {
      if (stages.getStage(stageId()).id !== 'citySquare') return;
      const p = state.player, altitude = Math.max(0,state.ground-p.y-p.h);
      const width = Math.max(16,Math.round(30-altitude*.06));
      const x = Math.round(p.x+p.w/2-width/2);
      ctx.save();ctx.globalAlpha = .22-Math.min(.1,altitude*.001);
      ctx.fillStyle = '#3f3447';ctx.fillRect(x+4,state.ground,width-8,1);
      ctx.fillRect(x,state.ground+1,width,2);ctx.fillRect(x+4,state.ground+3,width-8,1);ctx.restore();
    }

    ensure(stages.getStage(stageId()));
    return { draw, drawShadow,
      get ready() { return ensure(stages.getStage(stageId())).ready; },
      get status() { const entry = ensure(stages.getStage(stageId()));return { id: entry.id, mode: entry.mode, error: entry.error, cacheBuilds }; },
      get view() { return cache?.view || null; },
    };
  }

  return { create };
});
