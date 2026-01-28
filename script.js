const mazeData = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 0, 2],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

let playerPos = { x: 1, y: 1 };

function drawMaze() {
    const mazeElement = document.getElementById('maze');
    mazeElement.innerHTML = ''; // 清空畫布

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
            } else {
                cell.textContent = ''; // 空地
            }
            mazeElement.appendChild(cell);
        }
    }
}

// 監聽鍵盤（這部分代碼與之前相同）
window.addEventListener('keydown', (e) => {
    // 取得目前的座標作為起點
    let nextX = playerPos.x;
    let nextY = playerPos.y;

    // 定義移動的方向向量
    let dx = 0;
    let dy = 0;

    if (e.key === 'ArrowUp')    dy = -1;
    else if (e.key === 'ArrowDown')  dy = 1;
    else if (e.key === 'ArrowLeft')  dx = -1;
    else if (e.key === 'ArrowRight') dx = 1;
    else return; // 如果按的不是方向鍵，就結束

    // --- 關鍵邏輯：連續滑動 ---
    // 檢查「下一格」是否在範圍內，且「下一格」不是牆壁 (1)
    while (
        mazeData[nextY + dy] !== undefined && 
        mazeData[nextY + dy][nextX + dx] !== undefined && 
        mazeData[nextY + dy][nextX + dx] !== 1
    ) {
        // 如果前方沒牆，座標就往前推進一格
        nextX += dx;
        nextY += dy;

        // 如果這格剛好是「門」(2)，就停下來（避免直接滑過頭）
        if (mazeData[nextY][nextX] === 2) break;
    }

    // 更新角色位置並重新繪製
    playerPos.x = nextX;
    playerPos.y = nextY;
    drawMaze();

    // 檢查過關
    if (mazeData[playerPos.y][playerPos.x] === 2) {
        setTimeout(() => {
            alert('你成功逃出了迷宮！');
            playerPos = { x: 1, y: 1 };
            drawMaze();
        }, 100); // 延遲一點點讓畫面先渲染出「我」在門上的樣子
    }
});

drawMaze();
