// functional/function.js
// 正多边形海战 - PVP 核心逻辑（2025-2026 版本草稿）

// =============================================
//  全局状态
// =============================================
let currentTurn = 1;
let currentPlayer = null;           // 'left' 或 'right'
let selectedBoat = null;            // 当前选中的 Boat 实例

const boats = [];                   // 所有船只实例（8艘）
const ports = { left: [], right: [] }; // 船港位置（简化表示）

// 地图相关（极坐标简化表示）
const MAP = {
  center: { type: 'center', r: 0, angle: null },
  inner:  [],   // 内圈位置列表
  mid:    [],   // 中圈
  outer:  [],   // 外圈
  channels: {   // 通道连接关系（后续可扩展为图结构）
    center_inner: [],  // 十字
    inner_mid:    [],  // 正方形
    mid_outer:    []   // 正五边形
  }
};

// =============================================
//  船只类
// =============================================
class Boat {
  constructor(id, side, level) {
    this.id = id;
    this.side = side;           // 'left' / 'right'
    this.level = level;
    this.maxHP = level;
    this.hp = level;
    this.alive = true;
    this.position = null;       // { type: 'inner'|'mid'|'outer'|'center'|'port', angle?: number, index?: number }
    this.staticTurns = 0;       // 连续静止回合数
    this.inPort = true;         // 初始在港口
  }

  isMyTurn() {
    return currentPlayer === this.side;
  }

  canMove() {
    return this.alive && this.isMyTurn();
  }

  canAttack(target) {
    if (!this.alive || !target.alive || !this.isMyTurn()) return false;
    if (this.position.type === target.position.type) return false; // 同圈不能攻击（规则：只能内打外）
    // 简化：只允许相邻圈层攻击，且必须在内圈打外圈
    const layers = ['center','inner','mid','outer'];
    const myIdx = layers.indexOf(this.position.type);
    const tarIdx = layers.indexOf(target.position.type);
    return myIdx < tarIdx && (tarIdx - myIdx === 1);
  }

  moveTo(newPos) {
    if (!this.canMove()) return false;
    // TODO: 检查是否在通道上、是否被堵港、位置是否被敌方占用等
    this.position = newPos;
    this.staticTurns = 0;
    this.inPort = (newPos.type === 'port');
    return true;
  }

  attack(target) {
    if (!this.canAttack(target)) return false;
    target.hp -= 1;
    if (target.hp <= 0) {
      target.hp = 0;
      target.alive = false;
      console.log(`船只 ${target.id} 被击沉`);
      // 更新 UI 按钮为死亡状态
      updateBoatButtonUI(target.id);
    }
    return true;
  }

  checkStaticPunish() {
    if (this.inPort || !this.alive) return;

    let threshold;
    switch (this.position.type) {
      case 'center': threshold = 1; break;
      case 'inner':  threshold = 5; break;
      case 'mid':    threshold = 10; break;
      case 'outer':  threshold = 20; break;
      default: return;
    }

    if (this.staticTurns >= threshold) {
      console.log(`船只 ${this.id} 因静止惩罚沉没`);
      this.alive = false;
      this.hp = 0;
      updateBoatButtonUI(this.id);
    }
  }

  incrementStatic() {
    if (!this.inPort && this.alive && this.position) {
      this.staticTurns++;
      this.checkStaticPunish();
    }
  }
}

// =============================================
//  初始化游戏
// =============================================
function initGame() {
  // 创建 8 艘船
  const config = [
    {side:'left', level:3}, {side:'left', level:2},
    {side:'left', level:1}, {side:'left', level:1},
    {side:'right',level:3}, {side:'right',level:2},
    {side:'right',level:1}, {side:'right',level:1}
  ];

  config.forEach((c, i) => {
    const boat = new Boat(i+1, c.side, c.level);
    boats.push(boat);
    // 初始都在港口
    boat.position = { type: 'port', side: c.side };
  });

  // 随机先手
  currentPlayer = Math.random() > 0.5 ? 'right' : 'left';
  console.log(`先手：${currentPlayer === 'right' ? '右侧（绿色）' : '左侧（黄色）'}`);

  // 初始化 UI 高亮
  updateTurnHighlight();

  // 绘制初始地图
  draw();
}

// =============================================
//  UI 更新相关（与 game.html 交互）
// =============================================
function updateTurnHighlight() {
  // 通过自定义事件通知 game.html 更新左侧/右侧高亮
  const event = new CustomEvent('turnChanged', { detail: { player: currentPlayer } });
  window.dispatchEvent(event);
}

function updateBoatButtonUI(boatId) {
  const event = new CustomEvent('boatUpdated', {
    detail: { boatId, hp: boats[boatId-1].hp, alive: boats[boatId-1].alive }
  });
  window.dispatchEvent(event);
}

function updateSelectedBoatUI(boat) {
  const event = new CustomEvent('boatSelected', { detail: { boatId: boat?.id || null } });
  window.dispatchEvent(event);
}

// =============================================
//  回合结束
// =============================================
function endTurn() {
  // 所有非港口船只静止计数 +1
  boats.forEach(boat => boat.incrementStatic());

  // 切换玩家
  currentPlayer = currentPlayer === 'left' ? 'right' : 'left';
  currentTurn++;

  // 取消选中
  selectedBoat = null;
  updateSelectedBoatUI(null);

  // 更新 UI
  updateTurnHighlight();
  draw();
}

// =============================================
//  行动处理（由 game.html 调用）
// =============================================
function selectBoat(boatId) {
  const boat = boats.find(b => b.id === boatId);
  if (!boat || !boat.alive || boat.side !== currentPlayer) return false;

  selectedBoat = boat;
  updateSelectedBoatUI(boat);
  return true;
}

function tryMove(targetPos) {
  if (!selectedBoat) return false;
  // TODO: 真实移动验证（通道、堵塞、占用等）
  const success = selectedBoat.moveTo(targetPos);
  if (success) {
    draw();
  }
  return success;
}

function tryAttack(targetBoatId) {
  if (!selectedBoat) return false;
  const target = boats.find(b => b.id === targetBoatId);
  if (!target) return false;

  const success = selectedBoat.attack(target);
  if (success) {
    updateBoatButtonUI(target.id);
    draw();
  }
  return success;
}

function skipTurn() {
  // 跳过可能刷新中心增益点（待实现）
  endTurn();
}

// =============================================
//  绘制（简化版，实际需要更复杂的坐标计算）
// =============================================
function draw() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const cx = w/2, cy = h/2;
  const maxR = Math.min(w,h)/2 * 0.88;

  ctx.clearRect(0,0,w,h);

  // 画同心圆
  ctx.strokeStyle = '#5a9be8';
  ctx.lineWidth = 3;
  [0.33, 0.60, 0.87].forEach(r => {
    ctx.beginPath();
    ctx.arc(cx, cy, maxR * r, 0, Math.PI*2);
    ctx.stroke();
  });

  // 中心点
  ctx.fillStyle = '#fff176';
  ctx.beginPath();
  ctx.arc(cx, cy, 16, 0, Math.PI*2);
  ctx.fill();

  // TODO: 画通道（十字、正方形、正五边形）

  // 画船只（极简占位）
  boats.forEach(boat => {
    if (!boat.alive || !boat.position) return;

    let r = 0;
    if (boat.position.type === 'center') r = 0;
    else if (boat.position.type === 'inner') r = maxR * 0.33;
    else if (boat.position.type === 'mid')   r = maxR * 0.60;
    else if (boat.position.type === 'outer') r = maxR * 0.87;

    // 简单放在圆周上（实际应有角度）
    const x = cx + r * Math.cos(Math.PI / 4);
    const y = cy + r * Math.sin(Math.PI / 4);

    ctx.fillStyle = boat.side === 'left' ? '#ffeb3b' : '#4caf50';
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI*2);
    ctx.fill();

    if (boat === selectedBoat) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  });
}

// =============================================
//  与 game.html 通信（事件监听）
// =============================================
window.addEventListener('load', () => {
  initGame();
});

// 监听来自 game.html 的行动请求（示例）
window.addEventListener('requestSelectBoat', e => {
  const { boatId } = e.detail;
  selectBoat(boatId);
});

window.addEventListener('requestMove', e => {
  // 假设 e.detail 有目标位置信息
  tryMove(e.detail.targetPos);
});

window.addEventListener('requestAttack', e => {
  tryAttack(e.detail.targetId);
});

window.addEventListener('requestSkip', () => {
  skipTurn();
});