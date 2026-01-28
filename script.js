// 0:路, 1:牆, 2:門, 3:寶
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
    
    // 更新上方看板
    document.getElementById('step-count').textContent = steps;
    document.getElementById('gem-count').textContent = gemsFound;

    for (let y = 0; y < mazeData.length; y++) {
        for (let x = 0; x < mazeData[y].length; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            if (x === playerPos.x && y === playerPos.y) {
                cell.innerHTML = '<span style="color: #ffeb3b;">我</span>';
            } else if (mazeData[y][x] === 1) {
                cell.textContent = '牆';
            } else if (mazeData[y][x] === 2) {
                cell.innerHTML = '<span style="color: #ff5722;">門</span>';
            } else if (mazeData[y][x] === 3) {
                cell.innerHTML = '<span class="gem">寶</span>';
            } else {
                cell.textContent = '';
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

    let moved = false;
    let nextX = playerPos.x;
    let nextY = playerPos.y;

    while (
        mazeData[nextY + dy] !== undefined && 
        mazeData[nextY + dy][nextX + dx] !== 1
    ) {
        nextX += dx;
        nextY += dy;
        moved = true;

        // 如果滑動過程中碰到「寶」，立刻吃掉它
        if (mazeData[nextY][nextX] === 3) {
            mazeData[nextY][nextX] = 0; // 變成路
            gemsFound++;
        }

        // 碰到門就停下
        if (mazeData[nextY][nextX] === 2) break;
    }

    if (moved) {
        steps++; // 只要有移動，步數就 +1
        playerPos.x = nextX;
        playerPos.y = nextY;
        drawMaze();
    }

    if (mazeData[playerPos.y][playerPos.x] === 2) {
        if (gemsFound < totalGems) {
            alert(`你還沒集齊所有寶物！（目前：${gemsFound}/${totalGems}）`);
        } else {
            setTimeout(() => {
                alert(`恭喜！你用了 ${steps} 步逃出迷宮！`);
                location.reload(); // 重新開始
            }, 100);
        }
    }
});

drawMaze();
