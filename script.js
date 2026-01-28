// 0:路, 1:牆, 2:門, 3:寶
const mazeData = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

let playerPos = { x: 1, y: 1 };
let steps = 0;
let gemsFound = 0;
const totalGems = 3;
let isMoving = false; // 防止滑動中重複輸入的鎖定開關

// 延遲函數
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function drawMaze() {
    const mazeElement = document.getElementById('maze');
    if (!mazeElement) return;
    mazeElement.innerHTML = '';

    document.getElementById('step-count').textContent = steps;
    document.getElementById('gem-count').textContent = gemsFound;

    for (let y = 0; y < mazeData.length; y++) {
        for (let x = 0; x < mazeData[y].length; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            const dist = Math.sqrt(Math.pow(x - playerPos.x, 2) + Math.pow(y - playerPos.y, 2));
            const maxViewDistance = 4.5;
            let opacity = 1 - (dist / maxViewDistance);
            if (opacity < 0) opacity = 0;
            cell.style.opacity = opacity;

            if (x === playerPos.x && y === playerPos.y) {
                cell.innerHTML = '<span class="player-active">我</span>';
                cell.style.opacity = 1; 
            } else if (mazeData[y][x] === 1) {
                cell.textContent = '牆';
            } else if (mazeData[y][x] === 2) {
                cell.innerHTML = '<span style="color: #ff5722;">門</span>';
            } else if (mazeData[y][x] === 3) {
                cell.innerHTML = '<span class="gem">寶</span>';
            }
            mazeElement.appendChild(cell);
        }
    }
}

// 核心移動邏輯（非同步版本）
async function handleMove(key) {
    if (isMoving) return; // 如果正在滑動，不接受新指令

    let dx = 0, dy = 0;
    if (key === 'ArrowUp') dy = -1;
    else if (key === 'ArrowDown') dy = 1;
    else if (key === 'ArrowLeft') dx = -1;
    else if (key === 'ArrowRight') dx = 1;
    else return;

    let moved = false;
    isMoving = true; // 開啟鎖定

    // 滑動動畫邏輯
    while (mazeData[playerPos.y + dy] && mazeData[playerPos.y + dy][playerPos.x + dx] !== 1) {
        playerPos.x += dx;
        playerPos.y += dy;
        moved = true;

        if (mazeData[playerPos.y][playerPos.x] === 3) {
            mazeData[playerPos.y][playerPos.x] = 0;
            gemsFound++;
        }

        drawMaze(); // 每走一格就重畫一次迷霧和角色
        await sleep(40); // 滑行速度，數值越小越快

        if (mazeData[playerPos.y][playerPos.x] === 2) break;
    }

    if (moved) {
        steps++;
        const mazeElement = document.getElementById('maze');
        if (mazeElement) {
            mazeElement.classList.remove('shake-effect');
            void mazeElement.offsetWidth; 
            mazeElement.classList.add('shake-effect');
        }

        drawMaze();

        if (mazeData[playerPos.y][playerPos.x] === 2) {
            if (gemsFound < totalGems) {
                alert(`你還沒集齊所有寶物！（目前：${gemsFound}/${totalGems}）`);
            } else {
                setTimeout(() => {
                    alert(`恭喜！你用了 ${steps} 步逃出迷宮！`);
                    location.reload();
                }, 100);
            }
        }
    }
    
    isMoving = false; // 移動結束，解鎖
}

// 修改按鈕呼叫，支援非同步
async function moveByButton(direction) {
    if (isMoving) return;
    const keyMap = {
        'up': 'ArrowUp',
        'down': 'ArrowDown',
        'left': 'ArrowLeft',
        'right': 'ArrowRight'
    };
    await handleMove(keyMap[direction]);
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        location.reload();
        return;
    }
    handleMove(e.key);
});

drawMaze();
console.log("%c 冒險者，按下 R 鍵可以重塑時空...", "color: #ff4444; font-style: italic;");
