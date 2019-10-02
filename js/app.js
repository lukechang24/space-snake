const map = document.getElementById("map")
const head = document.getElementById("snake-head");
let snake = [head];
const borderRect = map.getBoundingClientRect();
head.style.left = "0px";
head.style.top = "0px";
let move;
let moveLeft;
let moveUp;
let moveRight;
let moveDown;
let currentDirection;
let currentPosition;
let previousPosition;
let currentHeadPositionArr;
let previousHeadPositionArr;
let intervals = [];
let currentFood;
let currentHead;
let headRect;
let score = 0;
let incrementScore;
let scoreDiv = document.getElementById("score");

document.addEventListener("keydown", (e) => {
    if(e.which === 13) {  
        clearInterval(move);
        renderScore();
        score = 0;
        head.style.left = "0px";
        head.style.top = "0px";
        snake.forEach((snakeBody,i) => {
            if(i !== 0) {
                snakeBody.parentElement.removeChild(snakeBody);
            }
        })
        snake = [head]
        currentDirection = "right";
        startMoving();
        renderScore();
    }
})


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
        previousHeadPositionArr = [head.style.left.split("p")[0], head.style.top.split("p")[0]]
        snake.forEach((block ,i) => {
            currentPosition = [block.style.left.split("p")[0], block.style.top.split("p")[0]];
            if(i === 0) {
                if(currentDirection === "left") {
                    block.style.left = parseInt(currentPosition[0]) - 20 + "px";
                }
                if(currentDirection === "up") {
                    block.style.top = parseInt(currentPosition[1]) - 20 + "px";
                }
                if(currentDirection === "right") {
                    block.style.left = parseInt(currentPosition[0]) + 20 + "px";
                }
                if(currentDirection === "down") {
                    block.style.top = parseInt(currentPosition[1]) + 20 + "px";
                }
                detectCollision();
            } else {
                block.style.left = previousPosition[0] + "px";
                block.style.top = previousPosition[1] + "px";
            }
            previousPosition = currentPosition;
        })
        currentHeadPositionArr = [head.style.left.split("p")[0], 
        head.style.top.split("p")[0]];
    },60)
}

function spawnFood() {
    let newFood = document.createElement("div");
    newFood.id = "food";
    newFood.style.position = "absolute";
    newFood.style.backgroundColor = "blue";
    newFood.style.height = "20px";
    newFood.style.width = "20px";
    newFood.style.left = Math.round((Math.random()*(borderRect.right-borderRect.left-20))/20)*20 + "px";
    newFood.style.top = Math.round((Math.random()*(borderRect.bottom-borderRect.top-20))/20)*20 + "px";
    snake.forEach(snakeBlock => {
        if(newFood.style.left === snakeBlock.style.left && newFood.style.top === snakeBlock.style.top) {
            newFood.style.left = Math.round((Math.random()*(borderRect.right-borderRect.left-20))/20)*20 + "px";
            newFood.style.top = Math.round((Math.random()*(borderRect.bottom-borderRect.top-20))/20)*20 + "px";
        }
    })
    map.appendChild(newFood);
}
spawnFood();

function removeFood() {
    let currentFood = document.getElementById("food");
    currentFood.parentNode.removeChild(currentFood);
    currentFood = null;
}

function detectCollision() {
    currentHead = snake[0];
    currentFood = document.getElementById("food");
    headRect = document.getElementById("snake-head").getBoundingClientRect();
    if(hitFood()) {
        growSnake();
        removeFood();
        spawnFood();
        score += 100;
        renderScore();
    }
    if(hitWall() || hitBody()) {
        clearInterval(move);
        clearInterval(incrementScore);
    }
}

function hitWall() {
    if(headRect.top < 0 || headRect.bottom > borderRect.bottom || headRect.left < borderRect.left || headRect.right > borderRect.right) {
        return true; 
    }
}

function hitBody() {
    let hit = false;
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

function renderScore() {
    scoreDiv.innerText = `SCORE: ${score}`;
}
function growSnake() {
    let newBlock = document.createElement("div");
    newBlock.className = "snake-body"
    newBlock.style.backgroundColor = `${snake.length % 3 === 0 ? "black" : "red"}`
    newBlock.style.border = "1.5px solid black";
    newBlock.style.position = "absolute";
    newBlock.style.height = "17px";
    newBlock.style.width = "17px";
    map.appendChild(newBlock);
    newBlock.style.left = currentPosition[0] + "px";
    newBlock.style.top = currentPosition[1] + "px";
    snake.push(newBlock)
}
