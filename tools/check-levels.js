const fs = require('fs'); const { solve } = require('./solver');
const levels = eval(fs.readFileSync(require('path').join(__dirname,'..','maps.js'),'utf8') + ';levels');
levels.forEach((m, i) => { const r = solve(m); console.log(`第${i+1}關 寶物${r.gems} 最少步數 ${r.steps}  ${r.path ? r.path.join('') : '無解!'}`); });
