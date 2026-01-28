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
    mazeElement.innerHTML = ''; // 清空原本的迷宮

    for (let y = 0; y < mazeData.length; y++) {
        for (let x = 0; x < mazeData[y].length; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            if (x === playerPos.x && y === playerPos.y) {
                cell.innerHTML = '<span style="color: #ffeb3b; font-weight: bold;">我</span>';
            } else if (mazeData[y][x] === 1) {
                cell.textContent = '牆';
            } else if (mazeData[y][x] === 2) {
                cell.innerHTML = '<span style="color: #ff5722;">門</span>';
            } else {
                cell.textContent = ''; // 空地不需要放任何東西
            }
            
            mazeElement.appendChild(cell);
        }
    }
}

window.addEventListener('keydown', (e) => {
    let newX = playerPos.x;
    let newY = playerPos.y;

    if (e.key === 'ArrowUp') newY--;
    if (e.key === 'ArrowDown') newY++;
    if (e.key === 'ArrowLeft') newX--;
    if (e.key === 'ArrowRight') newX++;

    // 碰撞檢查：如果目標不是「牆」
    if (mazeData[newY] && mazeData[newY][newX] !== 1) {
        playerPos.x = newX;
        playerPos.y = newY;
    }

    // 檢查是否過關
    if (mazeData[playerPos.y][playerPos.x] === 2) {
        alert('你成功逃出了迷宮！');
        playerPos = { x: 1, y: 1 }; // 重置
    }

    drawMaze();
});

drawMaze();
