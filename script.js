const levels = [
    // Level 1
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
    // Level 2
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

// 初始化關卡：優先讀取進度，若無則為 0
let currentLevel = parseInt(localStorage.getItem('mazeCurrentLevel')) || 0;
let mazeData = JSON.parse(JSON.stringify(levels[currentLevel]));

let playerPos = { x: 1, y: 1 };
let steps = 0;
let gemsFound = 0;
const totalGems = 3;
let isMoving = false;
let hasFinished = false;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// R 鍵功能改為只重置本關
function resetCurrentLevel() {
    steps = 0;
    gemsFound = 0;
    playerPos = { x: 1, y: 1 };
    mazeData = JSON.parse(JSON.stringify(levels[currentLevel]));
    hasFinished = false;
    isMoving = false;
    document.getElementById('input-container').style.display = 'none';
    drawMaze();
}

function updateLevelButtons() {
    const navs = document.querySelectorAll('.level-nav');
    navs.forEach(nav => {
        const btnPrev = nav.querySelector('button:nth-child(1)');
        const btnNext = nav.querySelector('button:nth-child(2)');
        
        btnPrev.disabled = currentLevel === 0;
        btnNext.disabled = currentLevel === levels.length - 1;
        
        btnPrev.style.opacity = btnPrev.disabled ? "0.3" : "1";
        btnNext.style.opacity = btnNext.disabled ? "0.3" : "1";
    });
}

function changeLevel(delta) {
    const nextLvl = currentLevel + delta;
    if (nextLvl >= 0 && nextLvl < levels.length) {
        currentLevel = nextLvl;
        localStorage.setItem('mazeCurrentLevel', currentLevel); // 儲存進度
        resetCurrentLevel();
        loadLeaderboard();
    }
}

function drawMaze() {
    const mazeElement = document.getElementById('maze');
    if (!mazeElement) return;
    mazeElement.innerHTML = '';
    document.getElementById('step-count').textContent = steps;
    document.getElementById('gem-count').textContent = gemsFound;
    const levelTitle = document.getElementById('level-title');
    if (levelTitle) levelTitle.textContent = `第 ${currentLevel + 1} 關`;
    updateLevelButtons();

    for (let y = 0; y < mazeData.length; y++) {
        for (let x = 0; x < mazeData[y].length; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            const dist = Math.sqrt(Math.pow(x - playerPos.x, 2) + Math.pow(y - playerPos.y, 2));
            const maxViewDistance = 4.5;
            let opacity = 1 - (dist / maxViewDistance);
            if (opacity < 0) opacity = 0;
            if ((mazeData[y][x]===3 || mazeData[y][x]===2) && opacity < 0.15) opacity = 0.15;
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

    isMoving = true;
    while (mazeData[playerPos.y + dy] && mazeData[playerPos.y + dy][playerPos.x + dx] !== 1) {
        playerPos.x += dx; playerPos.y += dy;
        if (mazeData[playerPos.y][playerPos.x] === 3) { mazeData[playerPos.y][playerPos.x] = 0; gemsFound++; }
        drawMaze();
        await sleep(30); 
        if (mazeData[playerPos.y][playerPos.x] === 2) break;
    }
    steps++;
    const mazeElement = document.getElementById('maze');
    if (mazeElement) { mazeElement.classList.remove('shake-effect'); void mazeElement.offsetWidth; mazeElement.classList.add('shake-effect'); }
    drawMaze();

    if (mazeData[playerPos.y][playerPos.x] === 2) {
        if (gemsFound < totalGems) {
            alert(`你還沒集齊所有寶物！（目前：${gemsFound}/${totalGems}）`);
            isMoving = false;
        } else {
            hasFinished = true;
            handleLevelComplete();
        }
    }
    isMoving = false;
}

function handleLevelComplete() {
    const choice = confirm(`恭喜通過第 ${currentLevel + 1} 關！\n是否要留下英雄 ID？\n(確定: 留下ID / 取消: 直接挑戰下一關)`);
    if (choice) {
        document.getElementById('input-container').style.display = 'block';
    } else {
        if (currentLevel < levels.length - 1) changeLevel(1);
        else alert("已征服所有關卡！");
    }
}

async function submitScore() {
    const name = document.getElementById('player-name').value;
    if (!name) return alert("請輸入冒險者 ID！");
    try {
        await db.collection("leaderboard").add({
            name: name, steps: steps, level: currentLevel + 1,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert(`傳奇已載入！`);
        if (currentLevel < levels.length - 1) changeLevel(1);
        else location.reload();
    } catch (error) { alert("上傳失敗"); }
}

async function moveByButton(direction) {
    await handleMove(direction === 'up' ? 'ArrowUp' : direction === 'down' ? 'ArrowDown' : direction === 'left' ? 'ArrowLeft' : 'ArrowRight');
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') { resetCurrentLevel(); return; }
    handleMove(e.key);
});

async function loadLeaderboard() {
    const scoreList = document.getElementById('score-list');
    if (!scoreList) return;
    try {
        const snapshot = await db.collection("leaderboard")
            .where("level", "==", currentLevel + 1)
            .orderBy("steps", "asc").limit(5).get();
        if (snapshot.empty) { scoreList.innerHTML = `<li>第 ${currentLevel + 1} 關尚無紀錄</li>`; return; }
        scoreList.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            scoreList.innerHTML += `<li><span>${data.name}</span> - ${data.steps} 步</li>`;
        });
    } catch (error) { scoreList.innerHTML = '<li>讀取失敗</li>'; }
}

drawMaze();
loadLeaderboard();
