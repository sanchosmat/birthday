(function (root, factory) {
  const config = factory();
  if (typeof module === "object" && module.exports) module.exports = config;
  else root.SashaSpriteConfig = config;
})(typeof window === "object" ? window : globalThis, function () {
  return {
  "image": "sasha-sprites.png",
  "fallback": "sasha-idle.png",
  "baseUrl": "assets/sasha/",
  "frameWidth": 64,
  "frameHeight": 96,
  "columns": 8,
  "rows": 4,
  "pivot": {
    "x": 32,
    "y": 92
  },
  "animations": {
    "idle": {
      "frames": [
        0,
        1,
        2,
        3
      ],
      "fps": 4,
      "loop": true
    },
    "run": {
      "frames": [
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11
      ],
      "fps": 10,
      "loop": true
    },
    "jump": {
      "frames": [
        12,
        13,
        14
      ],
      "fps": null,
      "loop": false
    },
    "fall": {
      "frames": [
        15,
        16
      ],
      "fps": 6,
      "loop": true
    },
    "catch": {
      "frames": [
        17,
        18,
        19,
        20
      ],
      "fps": 10,
      "loop": false
    },
    "hurt": {
      "frames": [
        21,
        22,
        23
      ],
      "fps": 8,
      "loop": false
    },
    "victory": {
      "frames": [
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31
      ],
      "fps": 8,
      "loop": true
    }
  },
  "palette": [
    "#111320",
    "#191b30",
    "#242840",
    "#30374f",
    "#424b69",
    "#5c6380",
    "#8b94a3",
    "#302334",
    "#4c343e",
    "#705047",
    "#1d3530",
    "#2d4d42",
    "#41624f",
    "#647e64",
    "#68513c",
    "#866642",
    "#a98557",
    "#c1a171",
    "#d8bd8d",
    "#e9d3a6",
    "#8b543b",
    "#b97751",
    "#d49568",
    "#e6ae7d",
    "#f0c69b",
    "#f5d5ac",
    "#201e25",
    "#312a2e",
    "#48403d",
    "#796f62",
    "#b7aa90",
    "#e2d7bb"
  ],
  "exportScale": 0.32786885245901637
};
});
