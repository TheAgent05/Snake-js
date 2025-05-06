const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const points = document.querySelector('.points');
const record = document.querySelector('.record');
const barrierInput = document.querySelector('#barriers-counter');
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
food: [{x: 200, y: 200, spawnTime: Date.now()}],
barriersCount : 10,
barriers : [],
highScore : JSON.parse(localStorage.getItem("record")) || 0
};

const gameSounds = {
start : new Audio('source/sounds/start.mp3'),
death : new Audio('source/sounds/death.mp3'),
food : new Audio('source/sounds/food.mp3')
};

gameSounds.start.volume = 0.15;
gameSounds.death.volume = 0.15;
gameSounds.food.volume = 0.15;

barrierInput.addEventListener('input', function() {
    if (barrierInput.valueAsNumber > barrierInput.max) {
        barrierInput.valueAsNumber = barrierInput.max;
    } else if (barrierInput.valueAsNumber < barrierInput.min) {
        barrierInput.valueAsNumber = barrierInput.min;
    }
  });

function drawBarrier () {
    ctx.fillStyle = "#333"; 
    gameState.barriers.forEach(segment => {
        ctx.fillRect(segment.x, segment.y, 20, 20);
    });
}

function drawSnake() {
    ctx.fillStyle = "#6bbb37"; 
    gameState.snake.forEach(segment => {
        ctx.fillRect(segment.x, segment.y, 20, 20);
    });
    ctx.fillStyle = "#67b335"; 
    ctx.fillRect(gameState.snake[0].x, gameState.snake[0].y, 20, 20);
}

function foodGenerate() {
    const food = gameState.food[0];
    const animationDuration = 300;
    const elapsed = Date.now() - food.spawnTime;
    const progress = Math.min(elapsed / animationDuration, 1);

    const size = 20 * progress;
    const offset = (20 - size) / 2;

    ctx.fillStyle = "red";
    ctx.fillRect(food.x + offset, food.y + offset, size, size);
}
function foodEaten() {
    let newX, newY;
    do {
        newX = Math.floor(Math.random() * (canvas.width / 20)) * 20;
        newY = Math.floor(Math.random() * (canvas.height / 20)) * 20;
    } while (
        gameState.snake.some(segment => segment.x === newX && segment.y === newY) ||
        gameState.barriers.some(b => b.x === newX && b.y === newY)
    );
    
    gameState.food[0] = {
        x: newX,
        y: newY,
        spawnTime: Date.now()
    };

    if (gameState.scores > gameState.highScore) {
        gameState.highScore = gameState.scores;
        record.innerHTML = gameState.highScore;
        localStorage.setItem("record", JSON.stringify(gameState.highScore));
    }
    gameState.speed = Math.max(80, gameState.speed - 2);
}

function generateBarriers(count = gameState.barriersCount) {
    const barriers = [];
    for (let i = 0; i < count; i++) {
        let newX, newY;
        do {
            newX = Math.floor(Math.random() * (canvas.width / 20)) * 20;
            newY = Math.floor(Math.random() * (canvas.height / 20)) * 20;
        } while (
            gameState.snake.some(segment => segment.x === newX && segment.y == newY) ||
            (gameState.food[0].x === newX && gameState.food[0].y === newY) ||
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
        gameSounds.food.play();
        gameState.scores += 1;
        points.innerHTML = gameState.scores;
        foodEaten()
    }
}



function gameLoop() {
    if(isGameOver()) {
        gameSounds.death.play();
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
    if (gameState.scores > gameState.highScore) {
    localStorage.setItem("record", JSON.stringify(gameState.scores));
    }

    const head = gameState.snake[0];
    const selfCollision = gameState.snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);

    return (
        head.x < 0 || 
        head.y < 0 || 
        head.x >= canvas.width || 
        head.y >= canvas.height ||
        gameState.barriers.some(barrier => head.x === barrier.x && head.y === barrier.y) ||
        selfCollision
    );
}

document.querySelector('.reset').addEventListener('click', () => {
    clearTimeout(gameTimeout);
    points.innerHTML = 0;

    Object.assign(gameState, {
        dx: 20,
        dy: 0,
        nextDx: 20,
        nextDy: 0,
        scores: 0,
        speed: 150,
        pause: false,
        snake: [{x: 40, y: 200}, {x: 20, y: 200}, {x: 0, y: 200}],
        food: [{x: 200, y: 200, spawnTime: Date.now()}],
        barriers: generateBarriers()
    });
    gameLoop();
});


document.querySelector('.play').addEventListener('click', () => {
    gameSounds.start.play();  
    gameState.barriersCount = barrierInput.valueAsNumber;
    gameState.barriers = generateBarriers();

    record.textContent = gameState.highScore;

    const mainScreen = document.querySelector('.main-screen');
    const playButton = document.querySelector('.play');
    mainScreen.classList.toggle('opacity');
    playButton.disabled = true;

    setTimeout(() => {
        mainScreen.classList.toggle('none');
    }, 1500);

    setTimeout(() => {
        const textWrapper = document.querySelector('.text-wrapper');
        const gameContainer = document.querySelector('.game-container');
        const resetGame = document.querySelector('.reset-game');

        textWrapper.classList.toggle('none');
        gameContainer.classList.toggle('none');
        resetGame.classList.toggle('none');

        setTimeout(() => {
            textWrapper.style.opacity = 1;
            gameContainer.style.opacity = 1;
            resetGame.style.opacity = 1;
        }, 50);

        drawSnake();
        drawBarrier();
        foodGenerate();
        setTimeout(() => {
            gameLoop();
        }, 1500);
    }, 2000);
});


