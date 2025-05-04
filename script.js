const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const points = document.querySelector('.points');
let gameTimeout;

const gameState = {
dx : 20,
dy : 0,
nextDx : 20,
nextDy : 0,
scores : 0,
speed : 150,
pause : false,
snake: [{x: 40, y: 200}, {x: 20, y: 200}, {x: 0, y: 200}],
food: [{x: 200, y: 200}],
barriersCount : 10,
barriers : []
};

gameState.barriers = generateBarriers();

function drawBarrier () {
    ctx.fillStyle = "#333"; 
    gameState.barriers.forEach(segment => {
        ctx.fillRect(segment.x, segment.y, 20, 20);
    });
}

function drawSnake() {
    ctx.fillStyle = "green"; 
    gameState.snake.forEach(segment => {
        ctx.fillRect(segment.x, segment.y, 20, 20);
    });
}

function foodGenerate() {
    ctx.fillStyle = "red";
    gameState.food.forEach(segment => {
        ctx.fillRect(segment.x, segment.y, 20, 20);
    });
}

function foodEaten() {
    let newX, newY;
    do {
        newX = Math.floor(Math.random() * (canvas.width / 20)) * 20;
        newY = Math.floor(Math.random() * (canvas.height / 20)) * 20;
    } while (
        gameState.snake.some(segment => segment.x === newX && segment.y === newY) &&
        gameState.barriers.some(b => b.x === newX && b.y === newY)
    );
    
    gameState.food[0].x = newX;
    gameState.food[0].y = newY;

    gameState.speed -= 2
}

function generateBarriers(count = gameState.barriersCount) {
    const barriers = [];
    for (let i = 0; i < count; i++) {
        let newX, newY;
        do {
            newX = Math.floor(Math.random() * (canvas.width / 20)) * 20;
            newY = Math.floor(Math.random() * (canvas.height / 20)) * 20;
        } while (
            gameState.snake.some(segment => segment.x === newX && segment.y == newY) &&
            (gameState.food[0].x === newX && gameState.food[0].y === newY) &&
            barriers.some(segment => segment.x === newX && segment.y === newY)
        );
        barriers.push({x : newX, y : newY})
    }
    return barriers;
}


document.addEventListener('keydown', e => {
    if(!gameState.pause) {
    if (e.key === 'd' && gameState.dx !== -20) {
        gameState.nextDx = 20;
        gameState.nextDy = 0;
    }
    if (e.key === 'a' && gameState.dx !== 20) {
        gameState.nextDx = -20;
        gameState.nextDy = 0;
    }
    if (e.key === 's' && gameState.dy !== -20) {
        gameState.nextDx = 0;
        gameState.nextDy = 20;
    }
    if (e.key === 'w' && gameState.dy !== 20) {
        gameState.nextDx = 0;
        gameState.nextDy = -20;
    }
    }
    if (e.key === ' ') {
        gameState.pause = !gameState.pause;
        document.querySelector('.page-wrapper').classList.toggle('blur');
    }
    
});


function moveSnake() {
    gameState.dx = gameState.nextDx;
    gameState.dy = gameState.nextDy;
    const head = {x: gameState.snake[0].x + gameState.dx, y: gameState.snake[0].y + gameState.dy};
    gameState.snake.unshift(head);

    if (!(head.x === gameState.food[0].x && head.y === gameState.food[0].y)) {
        gameState.snake.pop();
    } else {
        gameState.scores += 1;
        points.innerHTML = gameState.scores;
        foodEaten()
    }
}


function gameLoop() {
    if(isGameOver()) {
        alert("Game Over!");
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(!gameState.pause)
    moveSnake();
    drawSnake();
    drawBarrier();
    foodGenerate();
    gameTimeout = setTimeout(gameLoop, gameState.speed);
}

function isGameOver() {
    const head = gameState.snake[0];
    return (
        head.x < 0 || 
        head.y < 0 || 
        head.x >= canvas.width || 
        head.y >= canvas.height ||
        gameState.barriers.some(barrier => head.x === barrier.x && head.y === barrier.y)
    );
}

document.querySelector('.reset').addEventListener('click', () => {
    clearTimeout(gameTimeout);

    Object.assign(gameState, {
        dx: 20,
        dy: 0,
        nextDx: 20,
        nextDy: 0,
        scores: 0,
        speed: 150,
        pause: false,
        snake: [{x: 40, y: 200}, {x: 20, y: 200}, {x: 0, y: 200}],
        food: [{x: 200, y: 200}],
        barriers: generateBarriers()
    });
    gameLoop();
});


document.querySelector('.play').addEventListener('click', () => {
    document.querySelector('.main-screen').classList.toggle('opacity');
    document.querySelector('.play').disabled = true;
    setTimeout(() => {document.querySelector('.main-screen').classList.toggle('none'); }, 1500);
    setTimeout(() => {
        document.querySelector('.text').classList.toggle('none');
        document.querySelector('.game-container').classList.toggle('none');
        document.querySelector('.reset-game').classList.toggle('none');

        setTimeout(() => {
            document.querySelector('.text').style.opacity = 1;
            document.querySelector('.game-container').style.opacity = 1;
            document.querySelector('.reset-game').style.opacity = 1;
        }, 50);
    
        gameLoop();
    }, 2000);
})


