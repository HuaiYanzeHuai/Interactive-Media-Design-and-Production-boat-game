// position.js
// 用于计算战场上所有可行动的位置（开局 / 重新计算画布大小时调用）
// 导出函数 getAllActionPoints(canvasWidth, canvasHeight)

const LAYERS = {
  CENTER: 'center',     // 中心点（只有一个）
  INNER:  'inner',      // 内圈
  MIDDLE: 'middle',     // 中圈
  OUTER:  'outer'       // 外圈
};

const LAYER_RADII_RATIO = {
  [LAYERS.CENTER]: 0,
  [LAYERS.INNER]:  0.33,
  [LAYERS.MIDDLE]: 0.60,
  [LAYERS.OUTER]:  0.87
};

// 每个环的离散点角度（单位：度）
// 可以根据需要增加密度（越多点越平滑，但计算量越大）
const ANGLES_BY_LAYER = {
  [LAYERS.CENTER]: [0],               // 只有一个点，角度无意义

  // 内圈 → 十字通道（通常4个主要方向）
  [LAYERS.INNER]: [0, 90, 180, 270],

  // 中圈 → 正方形通道（通常4个角或8个点，这里用8个更均匀）
  [LAYERS.MIDDLE]: [0, 45, 90, 135, 180, 225, 270, 315],

  // 外圈 → 正五边形通道（5个主要方向，或10个更细腻）
  [LAYERS.OUTER]: [0, 72, 144, 216, 288]
  // 如果想要更密，可以用： [0, 36, 72, 108, 144, 180, 216, 252, 288, 324]
};

/**
 * 获取当前画布尺寸下，所有可行动的位置数组
 * @param {number} canvasWidth  - 画布宽度
 * @param {number} canvasHeight - 画布高度
 * @returns {Array} 位置对象数组，每个对象包含：
 *   - layer: 'center'|'inner'|'middle'|'outer'
 *   - angleDeg: 角度（度），中心点为0
 *   - x: 画布坐标 x
 *   - y: 画布坐标 y
 *   - radius: 该点的实际半径（像素）
 */
export function getAllActionPoints(canvasWidth, canvasHeight) {
  const cx = canvasWidth / 2;
  const cy = canvasHeight / 2;
  const maxRadius = Math.min(canvasWidth, canvasHeight) / 2 * 0.92;

  const points = [];

  Object.keys(LAYERS).forEach(layerKey => {
    const layer = LAYERS[layerKey];
    const radiusRatio = LAYER_RADII_RATIO[layer];
    const radius = maxRadius * radiusRatio;

    const angles = ANGLES_BY_LAYER[layer] || [];

    angles.forEach(angleDeg => {
      const rad = (angleDeg * Math.PI) / 180;

      const x = cx + radius * Math.cos(rad);
      const y = cy + radius * Math.sin(rad);

      points.push({
        id: `${layer}-${angleDeg}`,   // 唯一标识，可用于后续匹配
        layer,
        angleDeg,
        x: Math.round(x),             // 取整避免浮点误差
        y: Math.round(y),
        radius: Math.round(radius)
      });
    });
  });

  return points;
}

/**
 * 示例：打印所有点（用于调试）
 * @param {Array} points 
 */
export function debugPrintPoints(points) {
  console.group("所有行动点");
  points.forEach(p => {
    console.log(
      `${p.id.padEnd(12)} | layer: ${p.layer.padEnd(7)} | `
      + `angle: ${p.angleDeg.toString().padStart(3)}° | `
      + `x:${p.x.toString().padStart(4)}, y:${p.y.toString().padStart(4)}`
    );
  });
  console.groupEnd();
}

// ──────────────────────────────────────────────
// 使用示例（在 game.html 或其他文件中）
// ──────────────────────────────────────────────
// import { getAllActionPoints } from './position.js';

// function onResizeOrInit() {
//   const points = getAllActionPoints(canvas.width, canvas.height);
//   debugPrintPoints(points);
//   // 你可以把 points 存到全局变量，或用于绘制、碰撞检测等
// }