const html = document.querySelector("html");
const map = document.getElementById("map")
const head = document.getElementById("snake-head");
let titleHeight = document.getElementById("title").offsetHeight;
console.log(titleHeight);
head.style.left = "0px";
head.style.top = "0px";
let snake = [head];
let move;
let speed = 75;
let currentDirection;
let currentPosition;
let previousPosition;
let currentHead;
let snakePattern;

let food;
let powerUp = null;
let poweredUp = null;
let powerUpInterval;
let returnToNormal;
let asteroids = [];
let asteroidInterval;

let count = 0;
let isPlaying;
let hit = false;

let score = 0;
let scoreMultiplier = 1;
let scoreDiv = document.querySelector("#score p");
let highScoreDiv = document.querySelector("#high-score p")
let highScore = localStorage.getItem("highestScore") ? localStorage.getItem("highestScore") : 0;

document.addEventListener("keydown", (e) => {
    if(isPlaying === true) {
        return;
    } else if(e.which === 32) {
        startGame(e.which);
        isPlaying = true;

    }
})
function startGame(whichKey) {
    if(whichKey=== 32) {  
        head.style.left = "0px";
        head.style.top = "0px";
        snake.forEach((snakeBlock,i) => {
            if(i !== 0) {
                snakeBlock.parentElement.removeChild(snakeBlock);
            }
        })
        snake = [head]
        currentDirection = "right";
        poweredUp = null;
        speed = 75;
        score = 0;
        scoreMultiplier = 1;
        highScoreDiv.style.visibility = "hidden";
        removeAsteroids();
        renderScore();
        startMoving();
        spawnFood();
        callDownAsteroids();
        spawnPowerUp();
    }
}
startGame();

document.addEventListener("keydown", (e) => {
    if(e.which === 37 && currentDirection !== "right" && currentHeadPositionArr[1] !== previousHeadPositionArr[1]) {
        currentDirection = "left";
    }
    if(e.which === 38 && currentDirection !== "down" && currentHeadPositionArr[0] !== previousHeadPositionArr[0]) {
        currentDirection = "up";
    }
    if(e.which === 39 && currentDirection !== "left" && currentHeadPositionArr[1] !== previousHeadPositionArr[1]) {
        currentDirection = "right";
    }
    if(e.which === 40 && currentDirection !== "up" && currentHeadPositionArr[0] !== previousHeadPositionArr[0]) {
        currentDirection = "down";
    }
})

function startMoving() {
    move = setInterval(() => {
        previousHeadPositionArr = [head.offsetLeft, head.offsetTop];

        snake.forEach((block ,i) => {
            currentPosition = [block.offsetLeft, block.offsetTop];
            if(i === 0) {
                if(currentDirection === "left") {
                    block.style.left = (currentPosition[0] - 20) + "px";
                }
                if(currentDirection === "up") {
                    block.style.top = (currentPosition[1] - 20) + "px";
                }
                if(currentDirection === "right") {
                    block.style.left = (currentPosition[0] + 20) + "px";
                }
                if(currentDirection === "down") {
                    block.style.top = (currentPosition[1] + 20) + "px";
                }
                detectCollision();
            } else {
                block.style.left = previousPosition[0] + "px";
                block.style.top = previousPosition[1] + "px";
            }
            previousPosition = currentPosition;
        })
        currentHeadPositionArr = [head.offsetLeft, 
        head.offsetTop];
    }, speed)
}

function spawnFood() {
    food = document.createElement("div");
    food.id = "food";
    food.style.position = "absolute";
    food.style.backgroundImage = "url('images/star2.png')";
    food.style.backgroundSize = "cover";
    food.style.backgroundRepeat = "no-repeat";
    food.style.backgroundPosition = "center center";
    food.style.height = "20px";
    food.style.width = "20px";
    food.style.left = Math.round((Math.random()*(map.offsetWidth-20))/20)*20 + "px";
    food.style.top = Math.round((Math.random()*(map.offsetHeight-20))/20)*20 + "px";
    snake.forEach(snakeBlock => {
        while(food.style.left === snakeBlock.style.left && food.style.top === snakeBlock.style.top) {
            food.style.left = Math.round((Math.random()*(map.offsetWidth-20))/20)*20 + "px";
            food.style.top = Math.round((Math.random()*(map.offsetHeight-20))/20)*20 + "px";
        }
    })
    map.appendChild(food);
}

function removeFood() {
    food.parentNode.removeChild(food);
    food = null;
}

function createAsteroids() {
    let newAsteroid = document.createElement("div");
    newAsteroid.className = "asteroid";
    newAsteroid.style.backgroundImage = "linear-gradient(red, grey, grey)";
    newAsteroid.style.border = "1.5px solid red";
    newAsteroid.style.borderRadius = "5px";
    // newAsteroid.style.borderTopLeftRadius = "10px";
    // newAsteroid.style.borderTopRightRadiusus = "10px";
    newAsteroid.style.position = "absolute";
    newAsteroid.style.height = "17px";
    newAsteroid.style.width = "17px";
    newAsteroid.style.top = "-20px";
    newAsteroid.style.zIndex = 1;
    newAsteroid.style.left = Math.round((Math.random()*(map.offsetWidth-20))/20)*20 + "px";
    asteroids.push(newAsteroid);
    map.appendChild(newAsteroid);
}

function removeAsteroids() {
    while (asteroids.length > 0) {
        asteroids[0].parentNode.removeChild(asteroids[0]);
        asteroids.shift();
    }
}

function moveAsteroids() {
    let asteroidsClone = [...asteroids];
    asteroidsClone.forEach(asteroid => {
        asteroid.style.top = (asteroid.offsetTop+20) + "px";
        snake.forEach(snakeBody => {
            if(asteroid.offsetTop === snakeBody.offsetTop && asteroid.offsetLeft == snakeBody.offsetLeft) {
                endGame();
            }
        })
        if(asteroid.offsetTop+asteroid.offsetHeight > (map.offsetTop-50)+map.offsetHeight) {
            asteroid.parentElement.removeChild(asteroid);
            asteroids.shift();
        }
    })
}

function callDownAsteroids() {
    let difficulty = 1;
    asteroidInterval = setInterval(() => {
        difficulty = score > 3000 ? 3 : score > 1500 ? 2 : 1;
        let chance = Math.random()*10+1;
        if(chance > 8 && asteroids.length < difficulty) {
        createAsteroids();
        }
        moveAsteroids();
    },1000);
}

function createPowerUp() {
    powerUp = document.createElement("div");
    powerUp.id = "power-up";
    powerUp.style.backgroundImage = "linear-gradient(to right, red,orange,yellow,green,blue,purple)"
    powerUp.style.borderRadius = "5px";
    powerUp.style.position = "absolute";
    powerUp.style.height = "20px";
    powerUp.style.width = "20px";
    powerUp.style.left = Math.round((Math.random()*(map.offsetWidth-20))/20)*20 + "px";
    powerUp.style.top = Math.round((Math.random()*(map.offsetHeight-20))/20)*20 + "px";
    snake.forEach(snakeBlock => {
        if(food) {
            while((powerUp.style.left === snakeBlock.style.left && powerUp.style.top === snakeBlock.style.top) || powerUp.style.left === food.style.left && powerUp.style.top === food.style.top) {
                powerUp.style.left = Math.round((Math.random()*(map.offsetWidth-20))/20)*20 + "px";
                powerUp.style.top = Math.round((Math.random()*(map.offsetHeight-20))/20)*20 + "px";
            }
        }
    })
    map.appendChild(powerUp);
}

function spawnPowerUp() {
    powerUpInterval = setInterval(() => {
        if(!powerUp && !poweredUp) {
            createPowerUp();
        }
    },15000)
}

function applyPowerUp() {
    let randomNum = Math.floor(Math.random()*3);
        if(randomNum === 0) {
            poweredUp = "speed";
            speedUpSnake();
        } else if(randomNum === 1){
            poweredUp = "slow";
            slowDownSnake();
        } else {
            poweredUp = "stop";
            clearInterval(asteroidInterval);
        }
        clearInterval(move);
        startMoving();
        powerUp.parentNode.removeChild(powerUp);
        powerUp = null;
        returnToNormal = setTimeout(() => {
            if(!clearInterval(asteroidInterval)) {
                callDownAsteroids();
            }
            speed = 75;
            scoreMultiplier = 1;
            poweredUp = false;
            clearInterval(move);
            startMoving();
        },10000)
}

function speedUpSnake() {
    speed = 50;
    scoreMultiplier = 1.5;
}

function slowDownSnake() {
    speed = 150;
    scoreMultiplier = 2;
}

function removePowerUp() {
    powerUp.parentNode.removeChild(powerUp);
    powerUp = null;
}

function growSnake() {
    let newBody = document.createElement("div");
    newBody.className = "snake-body";
    newBody.style.backgroundColor = `${snake.length % 3 === 0 ? "rgb(27, 0, 88)" : "rgb(2, 14, 153)"}`
    newBody.style.border = "1.5px solid black";
    newBody.style.borderRadius = "5px";
    newBody.style.position = "absolute";
    newBody.style.height = "17px";
    newBody.style.width = "17px";
    map.appendChild(newBody);
    newBody.style.left = currentPosition[0] + "px";
    newBody.style.top = currentPosition[1] + "px";
    snake.push(newBody)
}

function detectCollision() {
    currentHead = snake[0];
    currentFood = document.getElementById("food");
    headRect = document.getElementById("snake-head").getBoundingClientRect();
    if(hitPowerUp()) {
        applyPowerUp();
    }
    if(hitFood()) {
        growSnake();
        growSnake();
        removeFood();
        spawnFood();
        score += 100*scoreMultiplier;
        renderScore();
    }
    if(hitWall() || hitBody() || hitAsteroid()) {
        endGame();
    }
}

function hitWall() {
    if(head.offsetTop < (map.offsetTop-titleHeight) || head.offsetTop+head.offsetHeight > (map.offsetTop-titleHeight)+map.offsetHeight || head.offsetLeft < map.offsetLeft || head.offsetLeft+head.offsetWidth > map.offsetLeft+map.offsetWidth) {
        return true; 
    }
}

function hitBody() {
    hit = false;
    snake.forEach((snakeBlock, i) => {
        if(i !== 0) {
            if(currentHead.style.left === snakeBlock.style.left && currentHead.style.top === snakeBlock.style.top) {
                hit = true;
            }
        }
    })    
    return hit;
}

function hitFood() {
    if(currentHead.style.left === currentFood.style.left && currentHead.style.top === currentFood.style.top) {
        return true;
    }
}

function hitAsteroid() {
    hit = false;
    asteroids.forEach(asteroid => {
        if(asteroid.style.left === head.style.left && asteroid.style.top === head.style.top) {
            hit = true;
        }
    })
    return hit;
}

function hitPowerUp() {
    if(powerUp) {
        if(head.offsetLeft === powerUp.offsetLeft && head.offsetTop === powerUp.offsetTop) {
            return true;
        }
    }
}

function renderScore() {
    scoreDiv.innerText = `SCORE: ${score}`;
}

function endGame() {
    if(powerUp) {
        removePowerUp();
    }
    removeFood();
    clearInterval(move);
    clearTimeout(returnToNormal);
    clearInterval(powerUpInterval);
    clearInterval(asteroidInterval);
    if(score > highScore) {
        highScore = score;
    }
    localStorage.setItem("highestScore", highScore);
    let data = localStorage.getItem("highestScore");
    console.log(localStorage);
    highScoreDiv.innerText = `HIGHSCORE: ${data}`
    highScoreDiv.style.visibility = "visible";
    isPlaying = false;
    renderScore();
}