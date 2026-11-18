(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SashaGameStages = api;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const stages = {
    park: { id: 'park', groundInset: 34 },
    citySquare: {
      id: 'citySquare',
      fullScene: true,
      backgroundSrc: 'assets/sasha-game/city-square-background.png',
      buildingSrc: 'assets/sasha-game/city-square-buildings.png',
      cloudSrc: 'assets/sasha-game/city-square-clouds.png',
      reference: {
        width: 1672, height: 941,
        // Measured from the local scene reference, where the doors meet the square.
        horizonY: 668,
        facade: { left: 255, top: 300, right: 1425, bottom: 670 },
        sign: { left: 616, top: 350, right: 1096, bottom: 388 },
      },
      portraitCrop: { x: 230, width: 1220 },
      groundYRatio: .88,
      horizonYRatio: .76,
      portraitHorizonYRatio: .58,
      wideHorizonYRatio: .8,
      skyTop: [50, 143, 234],
      skyBottom: [49, 154, 242],
      // Sampled from the foreground paving in the reference, not a generic floor.
      paving: ['#a7878e', '#977c89', '#a0808a', '#a38a94', '#b0969b'],
      pavingTexture: { x: 1010, y: 880, width: 48, height: 24 },
    },
  };

  function getStage(id = 'citySquare') { return stages[id] || stages.park; }

  function groundY(stage, width, height) {
    return stage.groundYRatio ? Math.round(height * stage.groundYRatio) : height - stage.groundInset;
  }

  function camera(stage, width, height) {
    if (!stage.reference) return { groundY: groundY(stage, width, height) };
    const portrait = width / height < 1.2;
    const sourceX = portrait ? stage.portraitCrop.x : 0;
    const sourceWidth = portrait ? stage.portraitCrop.width : stage.reference.width;
    const scale = width / sourceWidth;
    const horizonRatio = portrait ? stage.portraitHorizonYRatio
      : width / height > 2.4 ? stage.wideHorizonYRatio : stage.horizonYRatio;
    const horizonY = Math.round(height * horizonRatio);
    const imageY = Math.round(horizonY - stage.reference.horizonY * scale);
    const imageHeight = Math.round(stage.reference.height * scale);
    return { sourceX, sourceWidth, scale, horizonY, imageY, imageHeight,
      imageBottom: imageY + imageHeight, groundY: groundY(stage, width, height), portrait };
  }

  return { stages, getStage, groundY, camera };
});
