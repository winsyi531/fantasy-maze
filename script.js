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
    let newX = playerPos.x;
    let newY = playerPos.y;
    if (e.key === 'ArrowUp') newY--;
    if (e.key === 'ArrowDown') newY++;
    if (e.key === 'ArrowLeft') newX--;
    if (e.key === 'ArrowRight') newX++;

    if (mazeData[newY] && mazeData[newY][newX] !== 1) {
        playerPos.x = newX;
        playerPos.y = newY;
        drawMaze(); // 移動後重新渲染
    }
    
    if (mazeData[playerPos.y][playerPos.x] === 2) {
        alert('你逃出來了！');
        playerPos = { x: 1, y: 1 };
        drawMaze();
    }
});

drawMaze();
