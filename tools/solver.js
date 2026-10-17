// 冰面滑行迷宮求解器：狀態 = (位置, 已拿寶物 bitmask)，BFS 求最少步數
const TILE = { EMPTY: 0, WALL: 1, DOOR: 2, GEM: 3 };
const DIRS = [[0,-1,'上'],[0,1,'下'],[-1,0,'左'],[1,0,'右']];

function isWall(map, x, y) {
  return y < 0 || y >= map.length || x < 0 || x >= map[y].length || map[y][x] === TILE.WALL;
}
// 與遊戲 handleMove 相同規則：一直滑到撞牆；經過寶物就拿；踩到門立刻停
function slide(map, x, y, dx, dy, gemIndex) {
  let got = 0, moved = false;
  while (!isWall(map, x + dx, y + dy)) {
    x += dx; y += dy; moved = true;
    const g = gemIndex.get(y * 100 + x);
    if (g !== undefined) got |= 1 << g;
    if (map[y][x] === TILE.DOOR) break;
  }
  return moved ? { x, y, got } : null;
}
function solve(map, start = { x: 1, y: 1 }) {
  const gemIndex = new Map(); let n = 0;
  map.forEach((row, y) => row.forEach((t, x) => { if (t === TILE.GEM) gemIndex.set(y * 100 + x, n++); }));
  const full = (1 << n) - 1;
  const key = (x, y, m) => (y * 100 + x) * (1 << n) + m;
  const prev = new Map(); const q = [[start.x, start.y, 0]];
  prev.set(key(start.x, start.y, 0), null);
  for (let i = 0; i < q.length; i++) {
    const [x, y, m] = q[i];
    if (map[y][x] === TILE.DOOR && m === full) {
      const path = []; let k = key(x, y, m);
      while (prev.get(k)) { path.push(prev.get(k).dir); k = prev.get(k).from; }
      return { steps: path.length, path: path.reverse(), gems: n, states: q.length };
    }
    for (const [dx, dy, name] of DIRS) {
      const r = slide(map, x, y, dx, dy, gemIndex); if (!r) continue;
      const nm = m | r.got, nk = key(r.x, r.y, nm);
      if (!prev.has(nk)) { prev.set(nk, { from: key(x, y, m), dir: name }); q.push([r.x, r.y, nm]); }
    }
  }
  return { steps: -1, gems: n, states: q.length };
}
if (typeof module !== 'undefined') module.exports = { solve, slide, isWall, TILE, DIRS };
