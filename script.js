// 關卡地圖資料庫 (目前設定 2 關)
const levels = [
    // Level 1: 原始地圖
    [
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
    ],
    // Level 2: 隨機新地圖 (絕對有解、無孤島)
    [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 3, 1],
        [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 1, 3, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
        [1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
];

let currentLevel = 0; 
let mazeData = JSON.parse(JSON.stringify(levels[currentLevel])); // 深拷貝當前地圖

let playerPos = { x: 1, y: 1 };
let steps = 0;
let gemsFound = 0;
const totalGems = 3;
let isMoving = false;
let hasFinished = false;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function drawMaze() {
    const mazeElement = document.getElementById('maze');
    if (!mazeElement) return;
    mazeElement.innerHTML = '';

    document.getElementById('step-count').textContent = steps;
    document.getElementById('gem-count').textContent = gemsFound;
    
    // 更新標題顯示
    const levelTitle = document.getElementById('level-title');
    if (levelTitle) levelTitle.textContent = `第 ${currentLevel + 1} 關`;

    for (let y = 0; y < mazeData.length; y++) {
        for (let x = 0; x < mazeData[y].length; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            const dist = Math.sqrt(Math.pow(x - playerPos.x, 2) + Math.pow(y - playerPos.y, 2));
            const maxViewDistance = 4.5;
            let opacity = 1 - (dist / maxViewDistance);
            if (opacity < 0) opacity = 0;

            if ((mazeData[y][x] === 3 || mazeData[y][x] === 2) && opacity < 0.15) {
                opacity = 0.15;
            }
            
            cell.style.opacity = opacity;

            if (x === playerPos.x && y === playerPos.y) {
                cell.innerHTML = '<span class="player-active">我</span>';
                cell.style.opacity = 1; 
            } else if (mazeData[y][x] === 1) {
                cell.textContent = '牆';
            } else if (mazeData[y][x] === 2) {
                cell.innerHTML = '<span class="door-glow">門</span>';
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
                isMoving = false;
            } else {
                hasFinished = true;
                handleLevelComplete();
            }
            return;
        }
    }
    isMoving = false;
}

// 處理關卡完成的邏輯
function handleLevelComplete() {
    const isLastLevel = currentLevel === levels.length - 1;
    let msg = `恭喜通過第 ${currentLevel + 1} 關！\n`;
    
    if (!isLastLevel) {
        const choice = confirm(msg + "按下「確定」前往下一關，或「取消」記錄本關成績。");
        if (choice) {
            startNextLevel();
        } else {
            showInput();
        }
    } else {
        alert(msg + "你已征服所有地牢！請留下你的傳奇紀錄。");
        showInput();
    }
}

function showInput() {
    document.getElementById('input-container').style.display = 'block';
}

function startNextLevel() {
    currentLevel++;
    steps = 0;
    gemsFound = 0;
    playerPos = { x: 1, y: 1 };
    mazeData = JSON.parse(JSON.stringify(levels[currentLevel]));
    hasFinished = false;
    isMoving = false;
    drawMaze();
    loadLeaderboard();
}

async function moveByButton(direction) {
    await handleMove(direction === 'up' ? 'ArrowUp' : direction === 'down' ? 'ArrowDown' : direction === 'left' ? 'ArrowLeft' : 'ArrowRight');
}

async function submitScore() {
    const name = document.getElementById('player-name').value;
    if (!name) return alert("請輸入冒險者 ID！");
    
    try {
        await db.collection("leaderboard").add({
            name: name,
            steps: steps,
            level: currentLevel + 1, // 儲存關卡編號
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert(`傳奇已載入第 ${currentLevel + 1} 關石碑！後會有期。`);
        location.reload(); 
    } catch (error) {
        console.error(error);
        alert("上傳失敗。");
    }
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') { location.reload(); return; }
    handleMove(e.key);
});

async function loadLeaderboard() {
    const scoreList = document.getElementById('score-list');
    if (!scoreList) return;

    try {
        // 關鍵：根據 level 進行查詢
        const snapshot = await db.collection("leaderboard")
            .where("level", "==", currentLevel + 1)
            .orderBy("steps", "asc")
            .limit(5)
            .get();

        if (snapshot.empty) {
            scoreList.innerHTML = `<li>第 ${currentLevel + 1} 關尚無紀錄</li>`;
            return;
        }

        scoreList.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const li = document.createElement('li');
            li.style.padding = "5px 0";
            li.style.borderBottom = "1px ridge #333";
            li.innerHTML = `<span>${data.name}</span> - ${data.steps} 步`;
            scoreList.appendChild(li);
        });
    } catch (error) {
        console.error(error);
        scoreList.innerHTML = '<li>讀取失敗</li>';
    }
}

drawMaze();
loadLeaderboard();
