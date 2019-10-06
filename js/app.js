const html = document.querySelector("html");
const map = document.getElementById("map")
const head = document.getElementById("snake-head");
let snake = [head];
const borderRect = map.getBoundingClientRect();
head.style.left = "0px";
head.style.top = "0px";
let move;
let currentDirection;
let currentPosition;
let previousPosition;
let currentFood;
let currentHead;
let asteroids = [];
let asteroidInterval;
let hit = false;
let incrementScore;
let count = 0;
let isPlaying;
let scoreDiv = document.querySelector("#score p");
let highScoreDiv = document.querySelector("#high-score p")
let highScore = localStorage.getItem("highestScore");
let score = 0;

console.log(borderRect)
console.log(map.offsetHeight + map.offsetTop)

// const moveBackground = setInterval(() => {
//     if(count % 2 === 0) {
//         html.style.backgroundImage = "url('images/space2ver.png')";
//     } else {
//         html.style.backgroundImage = "url('images/space1ver.png')";
//     }
//     count++;
// },1000)

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
        score = 0;
        highScoreDiv.style.visibility = "hidden";
        clearInterval(move);
        removeAsteroids();
        renderScore();
        startMoving();
        callDownAsteroids();
    }
}
startGame();
spawnFood();

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
    },75)
}

function spawnFood() {
    let newFood = document.createElement("div");
    newFood.id = "food";
    newFood.style.position = "absolute";
    newFood.style.backgroundImage = "url('images/star2.png')";
    newFood.style.backgroundSize = "cover";
    newFood.style.backgroundRepeat = "no-repeat";
    newFood.style.backgroundPosition = "center center";
    newFood.style.height = "20px";
    newFood.style.width = "20px";
    newFood.style.left = Math.round((Math.random()*(map.offsetWidth-20))/20)*20 + "px";
    newFood.style.top = Math.round((Math.random()*(map.offsetHeight-20))/20)*20 + "px";
    snake.forEach(snakeBlock => {
        while(newFood.style.left === snakeBlock.style.left && newFood.style.top === snakeBlock.style.top) {
            newFood.style.left = Math.round((Math.random()*(map.offsetWidth-20))/20)*20 + "px";
            newFood.style.top = Math.round((Math.random()*(map.offsetHeight-20))/20)*20 + "px";
        }
    })
    map.appendChild(newFood);
    console.log(newFood.offsetTop)
}

function removeFood() {
    let currentFood = document.getElementById("food");
    currentFood.parentNode.removeChild(currentFood);
    currentFood = null;
}

function makeAsteroids() {
    let newAsteroid = document.createElement("div");
    newAsteroid.className = "asteroid";
    newAsteroid.style.backgroundColor = "grey";
    newAsteroid.style.border = "1.5px solid black";
    newAsteroid.style.borderRadius = "5px";
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
        if(asteroid.offsetTop+asteroid.offsetHeight > map.offsetTop+map.offsetHeight) {
            asteroid.parentElement.removeChild(asteroid);
            asteroids.shift();
        }
    })
}

function callDownAsteroids() {
    let difficulty = 1;
    asteroidInterval = setInterval(() => {
        difficulty = score > 2000 ? 3 : score > 1000 ? 2 : 1;
        let chance = Math.random()*10+1;
        if(chance > 8 && asteroids.length < difficulty) {
        makeAsteroids();
        }
        moveAsteroids();
    },1000)
}

function growSnake() {
    let newBlock = document.createElement("div");
    newBlock.className = "snake-body"
    newBlock.style.backgroundColor = `${snake.length % 3 === 0 ? "blueviolet" : "rgb(2, 14, 153)"}`
    newBlock.style.border = "1.5px solid black";
    newBlock.style.borderRadius = "5px";
    newBlock.style.position = "absolute";
    newBlock.style.height = "17px";
    newBlock.style.width = "17px";
    map.appendChild(newBlock);
    newBlock.style.left = currentPosition[0] + "px";
    newBlock.style.top = currentPosition[1] + "px";
    snake.push(newBlock)
}

function detectCollision() {
    currentHead = snake[0];
    currentFood = document.getElementById("food");
    headRect = document.getElementById("snake-head").getBoundingClientRect();
    if(hitFood()) {
        growSnake();
        growSnake();
        removeFood();
        spawnFood();
        score += 100;
        renderScore();
    }
    if(hitWall() || hitBody() || hitAsteroid()) {
        endGame();
    }
}

function hitWall() {
    if(head.offsetTop < map.offsetTop || head.offsetTop+head.offsetHeight > map.offsetTop+map.offsetHeight || head.offsetLeft < map.offsetLeft || head.offsetLeft+head.offsetWidth > map.offsetLeft+map.offsetWidth) {
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

function hitAsteroid() {
    hit = false;
    asteroids.forEach(asteroid => {
        if(asteroid.style.left === head.style.left && asteroid.style.top === head.style.top) {
            hit = true;
        }
    })
    return hit;
}

function hitFood() {
    if(currentHead.style.left === currentFood.style.left && currentHead.style.top === currentFood.style.top) {
        return true;
    }
}

function renderScore() {
    scoreDiv.innerText = `SCORE: ${score}`;
}

function endGame() {
    clearInterval(move);
    clearInterval(asteroidInterval);
    clearInterval(incrementScore);
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