// functional/function.js
// 正多边形海战 - 核心逻辑文件（持续完善中）

// =============================================
//  全局状态
// =============================================
let currentTurn = 0;                // 当前回合数
let activePlayer = null;            // 'left' 或 'right'
let selectedBoat = null;            // 当前选中的船对象

const boats = [];                   // 所有8艘船实例

// 地图相关（待完善）
const center = { x: 0, y: 0 };      // 画布中心（会在绘制时计算）
let radiusInner, radiusMid, radiusOuter;  // 三个圆半径

// =============================================
//  船只类
// =============================================
class Boat {
  constructor(number, side) {   // number:1~8, side:'left'/'right'
    this.number = number;
    this.side = side;

    // 根据序号确定等级与血量
    switch(number) {
      case 1: case 2: case 5: case 6: this.maxHP = 1; break;
      case 3: case 7:                 this.maxHP = 2; break;
      case 4: case 8:                 this.maxHP = 3; break;
      default: this.maxHP = 1;
    }
    this.hp = this.maxHP;

    // 位置（待初始化）
    this.position = null;         // 未来可能是 {circle:'inner', angle:0} 或坐标
    this.staticTurns = 0;         // 静止回合计数
    this.alive = true;
  }

  // 是否在同一圆环
  inSameCircle(other) {
    // 待实现
    return false;
  }

  // 攻击逻辑
  attack(target) {
    if (!this.alive || !target.alive) return;
    // 待完善：判断是否可攻击（相邻 + 内打外规则）
    // ...
    target.hp -= 1;
    if (target.hp <= 0) {
      target.alive = false;
      console.log(`船只 ${target.number} 被击沉！`);
      // sink() 逻辑可在此调用或独立函数
    }
  }

  // 移动逻辑
  moveTo(newPosition) {
    // 待完善：路径验证、通道限制、位置占用规则
    this.position = newPosition;
    this.staticTurns = 0;   // 重置静止计数
  }

  // 静止惩罚检测（每回合调用）
  checkStaticPunish() {
    if (!this.alive || this.position === null) return;
    // 待完善：根据所处圆环判断静止回合阈值
    // 中心1、内5、中10、外20
  }
}

// =============================================
//  游戏初始化
// =============================================
function initGame() {
  // 创建8艘船
  for(let i = 1; i <= 8; i++) {
    const side = (i <= 4) ? 'left' : 'right';
    boats.push(new Boat(i, side));
  }

  // 随机先手已在 game.html 中处理，可同步到这里
  // activePlayer = Math.random() > 0.5 ? 'right' : 'left';

  // 初始化船只位置（船港）
  // 待补充：左右船港坐标或逻辑位置

  draw();  // 首次绘制
}

// =============================================
//  绘制函数（核心渲染）
// =============================================
function draw() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const cx = w/2, cy = h/2;

  ctx.clearRect(0,0,w,h);

  // 计算圆半径（可根据画布大小动态调整）
  const maxR = Math.min(w,h) * 0.45;
  radiusOuter = maxR;
  radiusMid   = maxR * 0.65;
  radiusInner = maxR * 0.35;

  // 绘制同心圆
  ctx.strokeStyle = '#336';
  ctx.lineWidth = 2;

  [radiusInner, radiusMid, radiusOuter].forEach(r => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.stroke();
  });

  // 绘制连接通道（十字、正方形、五边形）
  // 待完善：中心→内：十字
  //       内→中：正方形边
  //       中→外：正五边形边

  // 绘制船只、港口、增益点等
  // 待完善
}

// =============================================
//  回合结束逻辑
// =============================================
function endTurn() {
  // 所有船静止计数 +1（不在港口的）
  boats.forEach(boat => {
    if (boat.alive && boat.position !== 'port') {
      boat.staticTurns++;
      boat.checkStaticPunish();
    }
  });

  // 切换玩家
  activePlayer = activePlayer === 'left' ? 'right' : 'left';
  currentTurn++;

  // 更新UI（高亮当前回合玩家船只按钮）
  updateBoatButtons();

  draw();
}

// =============================================
//  更新船只按钮高亮
// =============================================
function updateBoatButtons() {
  // 待完善：根据 activePlayer 修改 className
  // 亮黄色 / 亮绿色 表示当前回合
}

// =============================================
//  事件绑定建议写在 game.html 中，此处只放纯逻辑
// =============================================

// 初始化
window.addEventListener('load', () => {
  initGame();
});