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
let isMoving = false; // 動作鎖定
let hasFinished = false; // 是否已達終點

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

            // 漸層迷霧邏輯
            const dist = Math.sqrt(Math.pow(x - playerPos.x, 2) + Math.pow(y - playerPos.y, 2));
            const maxViewDistance = 4.5;
            let opacity = 1 - (dist / maxViewDistance);
            if (opacity < 0) opacity = 0;

            // 寶物微光處理：在黑暗中保持 0.15 的可見度
            if (mazeData[y][x] === 3 && opacity < 0.15) {
                opacity = 0.15;
            }
            
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

async function handleMove(key) {
    if (isMoving || hasFinished) return; 

    let dx = 0, dy = 0;
    if (key === 'ArrowUp') dy = -1;
    else if (key === 'ArrowDown') dy = 1;
    else if (key === 'ArrowLeft') dx = -1;
    else if (key === 'ArrowRight') dx = 1;
    else return;

    let moved = false;
    isMoving = true;

    while (mazeData[playerPos.y + dy] && mazeData[playerPos.y + dy][playerPos.x + dx] !== 1) {
        playerPos.x += dx;
        playerPos.y += dy;
        moved = true;

        if (mazeData[playerPos.y][playerPos.x] === 3) {
            mazeData[playerPos.y][playerPos.x] = 0;
            gemsFound++;
        }

        drawMaze();
        await sleep(30); 

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
                hasFinished = true; // 鎖定操作
                document.getElementById('input-container').style.display = 'block'; // 顯示 ID 輸入框
                alert(`成功逃脫！請在下方輸入 ID 記錄你的成績。`);
            }
        }
    }
    isMoving = false;
}

async function moveByButton(direction) {
    if (isMoving || hasFinished) return;
    const keyMap = { 'up': 'ArrowUp', 'down': 'ArrowDown', 'left': 'ArrowLeft', 'right': 'ArrowRight' };
    await handleMove(keyMap[direction]);
}

// 排行榜送出邏輯 (Firebase 串接預留)
async function submitScore() {
    const name = document.getElementById('player-name').value;
    if (!name) return alert("請輸入冒險者 ID！");
    
    try {
        // 將成績儲存在雲端資料庫中名為 "leaderboard" 的集合裡
        await db.collection("leaderboard").add({
            name: name,
            steps: steps,
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // 使用伺服器時間
        });
        
        alert(`傳奇已載入石碑！冒險者 ${name}，後會有期。`);
        location.reload(); 
    } catch (error) {
        console.error("資料上傳失敗：", error);
        alert("時空震盪（上傳失敗），請稍後再試。");
    }
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        location.reload();
        return;
    }
    handleMove(e.key);
});

// 初始化
drawMaze();
console.log("%c 冒險者，按下 R 鍵可以重塑時空...", "color: #ff4444; font-style: italic;");
