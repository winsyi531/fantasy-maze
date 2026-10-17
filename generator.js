// generator.js — 隨機產生「保證可破」的冰面滑行迷宮
// 用法（瀏覽器）：<script src="generator.js"></script> 之後
//   const { map, steps, path } = MazeGen.generate({ seed: 20261017, gems: 4 });
// 用法（Node）：const MazeGen = require('./generator');
(function (root) {
  const WALL = 1, EMPTY = 0, DOOR = 2, GEM = 3;
  const DIRS = [[0, -1, '上'], [0, 1, '下'], [-1, 0, '左'], [1, 0, '右']];

  // ---- 可重現的亂數（同一個 seed = 同一張地圖，排行榜可以用 seed 當關卡 ID）----
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const isWall = (m, x, y) => y < 0 || y >= m.length || x < 0 || x >= m[y].length || m[y][x] === WALL;

  // 規則與遊戲完全相同：滑到撞牆為止，經過門就停；回傳終點與途經格子
  function slide(m, x, y, dx, dy) {
    const passed = [];
    while (!isWall(m, x + dx, y + dy)) {
      x += dx; y += dy; passed.push([x, y]);
      if (m[y][x] === DOOR) break;
    }
    return passed.length ? { x, y, passed } : null;
  }

  // 停留點圖：從起點能停到的所有位置，以及所有「滑得過」的格子
  function explore(m, start) {
    const k = (x, y) => y * 1000 + x;
    const stops = new Map([[k(start.x, start.y), start]]);
    const swept = new Set(); const edges = new Map();
    const q = [start];
    for (let i = 0; i < q.length; i++) {
      const p = q[i], out = [];
      for (const [dx, dy] of DIRS) {
        const r = slide(m, p.x, p.y, dx, dy); if (!r) continue;
        r.passed.forEach(([x, y]) => swept.add(k(x, y)));
        out.push(k(r.x, r.y));
        if (!stops.has(k(r.x, r.y))) { stops.set(k(r.x, r.y), { x: r.x, y: r.y }); q.push({ x: r.x, y: r.y }); }
      }
      edges.set(k(p.x, p.y), out);
    }
    return { stops, swept, edges, k };
  }

  // 強連通檢查：每個能到的停留點都能回到起點 → 不會有「滑進去就出不來」的死路
  function stronglyConnected(g, start) {
    const rev = new Map(); for (const s of g.stops.keys()) rev.set(s, []);
    for (const [a, outs] of g.edges) for (const b of outs) rev.get(b).push(a);
    const seen = new Set([g.k(start.x, start.y)]); const q = [...seen];
    for (let i = 0; i < q.length; i++) for (const p of rev.get(q[i])) if (!seen.has(p)) { seen.add(p); q.push(p); }
    return seen.size === g.stops.size;
  }

  // BFS 求解 (位置, 已拿寶物 bitmask)：最終驗證 + 計算最少步數當難度
  function solve(m, start) {
    const gi = new Map(); let n = 0;
    m.forEach((row, y) => row.forEach((t, x) => { if (t === GEM) gi.set(y * 1000 + x, n++); }));
    const full = (1 << n) - 1, key = (x, y, s) => (y * 1000 + x) * 4096 + s;
    const prev = new Map([[key(start.x, start.y, 0), null]]); const q = [[start.x, start.y, 0]];
    for (let i = 0; i < q.length; i++) {
      const [x, y, s] = q[i];
      if (m[y][x] === DOOR && s === full) {
        const path = []; let c = key(x, y, s);
        while (prev.get(c)) { path.push(prev.get(c)[1]); c = prev.get(c)[0]; }
        return { steps: path.length, path: path.reverse() };
      }
      for (const [dx, dy, name] of DIRS) {
        const r = slide(m, x, y, dx, dy); if (!r) continue;
        let ns = s; for (const [px, py] of r.passed) { const g = gi.get(py * 1000 + px); if (g !== undefined) ns |= 1 << g; }
        const nk = key(r.x, r.y, ns);
        if (!prev.has(nk)) { prev.set(nk, [key(x, y, s), name]); q.push([r.x, r.y, ns]); }
      }
    }
    return null;
  }

  // 嘗試產生一張候選地圖；不合格回傳 null
  function attempt(o, rnd) {
    const { width: W, height: H, start } = o;
    const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
    const m = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) =>
      (x === 0 || y === 0 || x === W - 1 || y === H - 1) ? WALL : (rnd() < o.wallDensity ? WALL : EMPTY)));
    m[start.y][start.x] = EMPTY;

    // 1) 放門：只放在「滑得過去」的格子上，放完再重算（門會截斷滑行）
    let g = explore(m, start);
    const sweptCells = [...g.swept].map(v => ({ x: v % 1000, y: Math.floor(v / 1000) }))
      .filter(c => !(c.x === start.x && c.y === start.y));
    if (sweptCells.length < 10) return null;
    const door = pick(sweptCells);
    m[door.y][door.x] = DOOR;
    g = explore(m, start);
    if (!g.stops.has(g.k(door.x, door.y))) return null;

    // 2) 強連通 → 只要寶物在可滑過的格子上，必定能全拿並走到門（構造性保證）
    if (o.requireStronglyConnected && !stronglyConnected(g, start)) return null;

    // 3) 放寶物：從可滑過的格子中挑，彼此盡量分散
    const cand = [...g.swept].map(v => ({ x: v % 1000, y: Math.floor(v / 1000) }))
      .filter(c => m[c.y][c.x] === EMPTY && !(c.x === start.x && c.y === start.y));
    if (cand.length < o.gems) return null;
    const gems = [];
    for (let i = 0; i < o.gems; i++) {
      let best = null, bestD = -1;
      for (let t = 0; t < 12; t++) {           // 隨機挑 12 個，取離已放寶物最遠的
        const c = pick(cand);
        if (gems.some(gm => gm.x === c.x && gm.y === c.y)) continue;
        const d = Math.min(...[door, start, ...gems].map(p => Math.abs(p.x - c.x) + Math.abs(p.y - c.y)));
        if (d > bestD) { bestD = d; best = c; }
      }
      if (!best) return null;
      gems.push(best); m[best.y][best.x] = GEM;
    }

    // 4) 最終驗證（不論有沒有強連通都跑，雙重保險）並取得最短解
    const sol = solve(m, start);
    if (!sol || sol.steps < o.minSteps || sol.steps > o.maxSteps) return null;
    return { map: m, start, door, ...sol };
  }

  // 5) 爬山法：隨機加/拆一面牆，仍可破且最短步數變多就保留 → 提升難度
  function harden(res, o, rnd) {
    let best = res;
    for (let i = 0; i < o.hardenIters; i++) {
      const m = best.map.map(r => r.slice());
      const x = 1 + Math.floor(rnd() * (o.width - 2)), y = 1 + Math.floor(rnd() * (o.height - 2));
      if (m[y][x] === EMPTY && !(x === o.start.x && y === o.start.y)) m[y][x] = WALL;
      else if (m[y][x] === WALL) m[y][x] = EMPTY; else continue;
      const g = explore(m, o.start);
      if (o.requireStronglyConnected && !stronglyConnected(g, o.start)) continue;
      // 寶物必須仍在可滑過的格子上
      let ok = true; m.forEach((row, yy) => row.forEach((t, xx) => { if (t === GEM && !g.swept.has(g.k(xx, yy))) ok = false; }));
      if (!ok) continue;
      const sol = solve(m, o.start);
      if (sol && sol.steps > best.steps && sol.steps <= o.maxSteps) best = { ...best, map: m, ...sol };
    }
    return best;
  }

  function generate(opts = {}) {
    const o = Object.assign({
      width: 15, height: 15, start: { x: 1, y: 1 }, gems: 4, wallDensity: 0.3,
      minSteps: 12, maxSteps: 40, maxTries: 5000, hardenIters: 300,
      requireStronglyConnected: true, seed: Date.now(),
    }, opts);
    const rnd = mulberry32(o.seed);
    for (let t = 1; t <= o.maxTries; t++) {
      const res = attempt(o, rnd);
      if (res) { const h = o.hardenIters ? harden(res, o, rnd) : res; return { ...h, seed: o.seed, tries: t }; }
    }
    throw new Error('找不到符合條件的地圖，請放寬 minSteps / wallDensity');
  }

  const api = { generate, solve, slide, explore, TILE: { EMPTY, WALL, DOOR, GEM } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MazeGen = api;
})(typeof window !== 'undefined' ? window : globalThis);
