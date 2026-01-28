// 0 代表路，1 代表「牆」，2 代表出口「門」
const mazeData = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 0, 2], // 2 是出口
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

let playerPos = { x: 1, y: 1 }; // 「我」的起始位置

function drawMaze() {
    const mazeElement = document.getElementById('maze');
    let html = '';
    for (let y = 0; y < mazeData.length; y++) {
        for (let x = 0; x < mazeData[y].length; x++) {
            if (x === playerPos.x && y === playerPos.y) {
                html += '<span style="color: #ffeb3b; font-weight: bold;">我</span>';
            } else if (mazeData[y][x] === 1) {
                html += '牆';
            } else if (mazeData[y][x] === 2) {
                html += '<span style="color: #ff5722;">門</span>';
            } else {
                html += '&nbsp;&nbsp;'; // 空地
            }
        }
        html += '<br>';
    }
    mazeElement.innerHTML = html;
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
