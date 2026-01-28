const mazeData = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 3, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 3, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

let playerPos = { x: 1, y: 1 };
let steps = 0;
let gemsFound = 0;
const totalGems = 3;

function drawMaze() {
    const mazeElement = document.getElementById('maze');
    mazeElement.innerHTML = '';

    document.getElementById('step-count').textContent = steps;
    document.getElementById('gem-count').textContent = gemsFound;

    for (let y = 0; y < mazeData.length; y++) {
        for (let x = 0; x < mazeData[y].length; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            // --- 漸層迷霧核心邏輯 ---
            const dist = Math.sqrt(Math.pow(x - playerPos.x, 2) + Math.pow(y - playerPos.y, 2));
            const maxViewDistance = 4.5; // 最大視距，超過就全黑
            
            // 計算透明度：距離越近越接近 1，超過視距則為 0
            // 公式：1 - (當前距離 / 最大視距)，並限制在 0 ~ 1 之間
            let opacity = 1 - (dist / maxViewDistance);
            if (opacity < 0) opacity = 0;
            
            // 套用動態透明度
            cell.style.opacity = opacity;

            if (x === playerPos.x && y === playerPos.y) {
                cell.innerHTML = '<span class="player-active">我</span>';
                cell.style.opacity = 1; // 角色本人永遠最亮
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

window.addEventListener('keydown', (e) => {
    let dx = 0, dy = 0;
    if (e.key === 'ArrowUp') dy = -1;
    else if (e.key === 'ArrowDown') dy = 1;
    else if (e.key === 'ArrowLeft') dx = -1;
    else if (e.key === 'ArrowRight') dx = 1;
    else return;

    let nextX = playerPos.x;
    let nextY = playerPos.y;
    let moved = false;

    // 滑動邏輯
    while (mazeData[nextY + dy] && mazeData[nextY + dy][nextX + dx] !== 1) {
        nextX += dx;
        nextY += dy;
        moved = true;

        if (mazeData[nextY][nextX] === 3) {
            mazeData[nextY][nextX] = 0;
            gemsFound++;
        }
        if (mazeData[nextY][nextX] === 2) break;
    }

    if (moved) {
        steps++;
        playerPos.x = nextX;
        playerPos.y = nextY;

        // --- 特效: 觸發畫面震動 ---
        const mazeElement = document.getElementById('maze');
        mazeElement.classList.remove('shake-effect');
        void mazeElement.offsetWidth; // 強制瀏覽器重繪，讓動畫可以重複觸發
        mazeElement.classList.add('shake-effect');

        drawMaze();

        // 檢查勝利
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
});

// 初始化渲染
drawMaze();
