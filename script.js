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

// 核心移動邏輯函數
function handleMove(key) {
    let dx = 0, dy = 0;
    if (key === 'ArrowUp') dy = -1;
    else if (key === 'ArrowDown') dy = 1;
    else if (key === 'ArrowLeft') dx = -1;
    else if (key === 'ArrowRight') dx = 1;
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
            mazeData[nextY][next
