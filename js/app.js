const html = document.querySelector("html");
const map = document.getElementById("map")
const head = document.getElementById("snake-head");
const interfaceHeight = document.getElementById("interface").offsetHeight;
const powerUpStorage = document.getElementById("powerUp-img");
console.log(interfaceHeight);
head.style.left = "0px";
head.style.top = "0px";
let snake = [head];
let move;
let speed;
let currentDirection;
let currentPosition;
let previousPosition;
let currentHead;
let snakePattern;

let food;
let foodCount;

let powerUp;
let whichPowerUp;
let poweredUp;
let powerUpInterval;
let firstPowerUpText = false;
let returnToNormal;

let warnings = [];
let asteroids = [];
let asteroidInterval;

let lasers = [];
let laserInterval;
let firstAmmoText = false;
let ammo;

let difficulty;
let isPlaying;
let hit;

let score;
let scoreMultiplier;
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
        ammo = 0;
        scoreMultiplier = 1;
        difficulty = 1;
        hit = false;
        difficulty = 1;
        foodCount = 0;
        poweredUp = null;
        highScoreDiv.style.visibility = "hidden";
        powerUpStorage.src = "";
        removeAsteroids();
        renderScore();
        startMoving();
        spawnFood();
        callDownAsteroids();
        applySnakePattern();
        moveLasers();
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
    if(e.which === 65 && whichPowerUp) {
        applyPowerUp();
    }
    if(e.which === 83 && ammo !== 0) {
        createLasers();
        ammo--;
        applySnakePattern();
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
    map.appendChild(food);
    food.style.left = Math.round((Math.random()*(map.offsetWidth-20))/20)*20 + "px";
    food.style.top = Math.round((Math.random()*(map.offsetHeight-20))/20)*20 + "px";
    snake.forEach(snakeBlock => {
        if(food.offsetLeft === snakeBlock.offsetLeft && food.offsetTop === snakeBlock.offsetTop) {
            // food.style.left = (food.offsetLeft+20) + "px";
            food.style.left = `${food.offsetLeft > map.offsetWidth/2 ? food.offsetLeft-20 : food.offsetLeft+20}px`;
            // food.style.top = Math.round((Math.random()*(map.offsetHeight-20))/20)*20 + "px";
            food.style.top = `${food.offsetTop > map.offsetHeight/2 ? food.offsetTop-20 : food.offsetTop+20}px`;
        }
    })
}

function removeFood() {
    food.parentNode.removeChild(food);
    food = null;
}

function createAsteroids() {
    let blink = 0;
    let spawnTopOrBottom = parseInt(`${difficulty === 1 ? 0 : Math.floor(Math.random()*2)}`);
    let randomPosition = Math.round((Math.random()*(map.offsetWidth-20))/20)*20 + "px";
    let indicateAsteroid = document.createElement("img");
    indicateAsteroid.src = "images/warning1.png";
    indicateAsteroid.className = "warning";
    map.appendChild(indicateAsteroid);
    indicateAsteroid.style.height = "20px";
    indicateAsteroid.style.width = "20px";
    indicateAsteroid.style.position = "absolute";
    indicateAsteroid.style.left = randomPosition;
    indicateAsteroid.style.top = `${spawnTopOrBottom === 0 ? 0 : map.offsetHeight-indicateAsteroid.offsetHeight}px`;
    warnings.push(indicateAsteroid)
    let newAsteroid = document.createElement("div");
    newAsteroid.className = `${spawnTopOrBottom === 0 ? "asteroid-top" : "asteroid-bottom"}`;
    newAsteroid.style.backgroundImage = `${spawnTopOrBottom === 0 ? "linear-gradient(red, grey, grey)" : "linear-gradient(grey, grey, red)"}`
    newAsteroid.style.border = "1.5px solid red";
    newAsteroid.style.borderRadius = "5px";
    newAsteroid.style.position = "absolute";
    newAsteroid.style.height = "17px";
    newAsteroid.style.width = "17px";
    newAsteroid.style.zIndex = 2;
    let warningSignal = setInterval(() => {
        if(!isPlaying) {
            indicateAsteroid.parentNode.removeChild(indicateAsteroid);
            clearInterval(warningSignal);
        }
        if(blink === 5) {
            indicateAsteroid.parentNode.removeChild(indicateAsteroid);
            map.appendChild(newAsteroid);
            newAsteroid.style.left = randomPosition;
            newAsteroid.style.top = `${newAsteroid.className === "asteroid-top" ? 0 : (map.offsetHeight-newAsteroid.offsetHeight)}px`;
            asteroids.push(newAsteroid);
            clearInterval(warningSignal);
        }
        if(blink % 2 === 0) {
            indicateAsteroid.style.visibility = "hidden";
        } else {
            indicateAsteroid.style.visibility = "visible";
        }
        blink++;
    },500)
}

function moveAsteroids() {
    let asteroidsClone = [...asteroids];
    asteroidsClone.forEach(asteroid => {
        asteroid.style.top = `${asteroid.className === "asteroid-top" ? (asteroid.offsetTop+20) : (asteroid.offsetTop-20)}px`;
        snake.forEach(snakeBody => {
            if(asteroid.offsetTop === snakeBody.offsetTop && asteroid.offsetLeft == snakeBody.offsetLeft) {
                endGame();
            }
        })
        if((asteroid.offsetTop+asteroid.offsetHeight > (map.offsetTop-interfaceHeight)+map.offsetHeight && asteroid.className === "asteroid-top") || (asteroid.offsetTop < (map.offsetTop-interfaceHeight) && asteroid.className === "asteroid-bottom")) {
            asteroid.parentElement.removeChild(asteroid);
            asteroids.shift();
            warnings.shift();
        }
    })
}

function callDownAsteroids() {
    asteroidInterval = setInterval(() => {
        difficulty = score > 3000 ? 3 : score > 1500 ? 2 : 1;
        // let chance = Math.random()*10+1;
        if(warnings.length < difficulty) {
        createAsteroids();
        }
        moveAsteroids();
    },1000);
}

function removeAsteroids() {
    while (asteroids.length > 0) {
        asteroids[0].parentNode.removeChild(asteroids[0]);
        asteroids.shift();
    }
}

function createLasers() {
    let newLaser = document.createElement("div");
    newLaser.className = `${currentDirection === "left" ? "laser-left" : currentDirection === "up" ? "laser-up" : currentDirection === "right" ? "laser-right" : "laser-down"}`;
    newLaser.style.backgroundImage = `${(newLaser.className === "laser-up" || newLaser.className === "laser-down") ? "url('images/laser-vertical.png')" : "url('images/laser-horizantal.png')"}`;
    newLaser.style.backgroundSize = "cover";
    newLaser.style.backgroundRepeat = "no-repeat";
    newLaser.style.backgroundPosition = "center center";
    newLaser.style.height = "20px";
    newLaser.style.width = "20px";
    newLaser.style.position = "absolute";
    newLaser.style.zIndex = 0;
    map.appendChild(newLaser);
    newLaser.style.left = head.offsetLeft+"px";
    newLaser.style.top = head.offsetTop+"px";
    lasers.push(newLaser);
}

function moveLasers() {
    laserInterval = setInterval(() => {
        let lasersClone = [...lasers];
        lasersClone.forEach((laser, i) => {
            if(laser.className === "laser-left") {
                laser.style.left = (laser.offsetLeft-20)+"px";
            }
            if(laser.className === "laser-right") {
                laser.style.left = (laser.offsetLeft+20)+"px";
            }
            if(laser.className === "laser-up") {
                laser.style.top = (laser.offsetTop-20)+"px";
            }
            if(laser.className === "laser-down") {
                laser.style.top = (laser.offsetTop+20)+"px";
            }
            asteroids.forEach(asteroid => {
                if(laser.offsetTop === asteroid.offsetTop && laser.offsetLeft === asteroid.offsetLeft) {
                    laser.parentElement.removeChild(laser);
                    lasers.splice(lasers.indexOf(laser), 1);
                    asteroid.parentElement.removeChild(asteroid);
                    asteroids.splice(asteroids.indexOf(asteroid), 1)
                    warnings.shift();
                    score += 50;
                    renderScore();
                }
            })
            if((laser.offsetLeft < map.offsetLeft && laser.className === "laser-left") || (laser.offsetLeft+laser.offsetWidth > (map.offsetLeft+map.offsetWidth) && laser.className === "laser-right") || (laser.offsetTop+laser.offsetHeight > (map.offsetTop-interfaceHeight)+map.offsetHeight && laser.className === "laser-down") || (laser.offsetTop < (map.offsetTop-interfaceHeight) && laser.className === "laser-up")) {
                laser.parentElement.removeChild(laser);
                lasers.splice(lasers.indexOf(laser), 1);
            }
        })
    },30)
}

function displayAmmoText() {
    let ammoText = document.createElement("div");
    ammoText.innerText = `+1 LASER${!firstAmmoText ? " (PRESS 'S' TO SHOOT)" : ""}`;
    ammoText.style.position = "absolute";
    ammoText.style.color = "white";
    ammoText.style.left = head.offsetLeft + "px";
    ammoText.style.top = head.offsetTop-20 + "px";
    map.appendChild(ammoText);
    const removeammoText = setTimeout(() => {
        ammoText.parentNode.removeChild(ammoText);
    },1500);
    firstAmmoText = true;
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
    if(!powerUp && !poweredUp && !whichPowerUp) {
        createPowerUp();
    }
}

function storePowerUp() {
    let randomNum = Math.floor(Math.random()*3);
    if(randomNum === 0) {
        whichPowerUp = "speed";
        powerUpStorage.src = "images/speed-up.png";
    } else if(randomNum === 1){
        whichPowerUp = "slow";
        powerUpStorage.src = "images/slow-down.png";

    } else {
        whichPowerUp = "freeze";
        powerUpStorage.src = "images/freeze-time.png";
    }
    displayPowerUpText();
    removePowerUp();
}

function applyPowerUp() {
    if(whichPowerUp === "speed") {
        speedUpSnake();
    } else if(whichPowerUp === "slow"){
        slowDownSnake();
    } else if(whichPowerUp === "freeze"){
        freezeTime()
    }
    clearInterval(move);
    startMoving();
    poweredUp = true;
    returnToNormal = setTimeout(() => {
        if(!clearInterval(asteroidInterval)) {
            callDownAsteroids();
            map.style.filter = "invert(0%)";
        }
        speed = 75;
        scoreMultiplier = 1;
        poweredUp = false;
        whichPowerUp = null;
        powerUp = null;
        powerUpStorage.src = "";
        applySnakePattern();
        clearInterval(move);
        startMoving();
    },10000)
}

function displayPowerUpText() {
    let powerUpText = document.createElement("div");
    powerUpText.innerText = `${whichPowerUp === "speed" ? "SPEED UP (2x SCORE)" : whichPowerUp === "slow" ? "SLOW DOWN" : "FREEZE TIME"}${!firstPowerUpText ? " (PRESS 'A' TO USE)" : ""}`;
    powerUpText.style.position = "absolute";
    powerUpText.style.color = "white";
    powerUpText.style.left = head.offsetLeft + "px";
    powerUpText.style.top = head.offsetTop-20 + "px";
    map.appendChild(powerUpText);
    const removePowerUpText = setTimeout(() => {
        powerUpText.parentNode.removeChild(powerUpText);
    },1500);
    firstPowerUpText = true;
}

function speedUpSnake() {
    speed = 50;
    scoreMultiplier = 2;
    snake.forEach((block, i) => {
        block.style.backgroundColor = `${i % 6 === 0 ? "purple" : i % 5 === 0 ? "blue" : i % 4 === 0 ? "green" : i % 3 === 0 ? "yellow" : i % 2 === 0 ? "orange" : "red"}`
    })
}

function slowDownSnake() {
    speed = 150;
    snake.forEach((block, i) => {
        block.style.backgroundColor = "purple";
    })
}

function freezeTime() {
    clearInterval(asteroidInterval);
    map.style.filter = "invert(80%)";
}

function removePowerUp() {
    powerUp.parentNode.removeChild(powerUp);
    powerUp = null;
}

function applySnakePattern() {
    snake.forEach((block,i) => {
        if(i !== 0) {
            if(i <= ammo) {
                block.style.border = "1.5px solid yellow";
            } else {
                block.style.border = "1.5px solid black";
            }
        }
        if(whichPowerUp === "speed" && poweredUp) {
            block.style.backgroundColor = `${i % 6 === 0 ? "purple" : i % 5 === 0 ? "blue" : i % 4 === 0 ? "green" : i % 3 === 0 ? "yellow" : i % 2 === 0 ? "orange" : "red"}`;
        } else if(whichPowerUp === "slow" && poweredUp) {
            block.style.backgroundColor = "purple";
        } else {
            block.style.backgroundColor = `${i % 3 === 0 ? "#00FFFF" : "#00B2EE"}`
        }
    })
}

function growSnake() {
    let newBody = document.createElement("div");
    newBody.className = "snake-body";
    newBody.style.border = "1.5px solid black";
    newBody.style.borderRadius = "5px";
    newBody.style.position = "absolute";
    newBody.style.height = "17px";
    newBody.style.width = "17px";
    map.appendChild(newBody);
    newBody.style.left = currentPosition[0] + "px";
    newBody.style.top = currentPosition[1] + "px";
    snake.push(newBody);
    if(snake.length % 5 === 0) {
        spawnPowerUp();
    }
    applySnakePattern();
}

function detectCollision() {
    currentHead = snake[0];
    currentFood = document.getElementById("food");
    headRect = document.getElementById("snake-head").getBoundingClientRect();
    if(hitPowerUp()) {
        storePowerUp();
    }
    if(hitFood()) {
        foodCount++;
        if(foodCount % 2 === 0) {
            if(!firstAmmoText){
                displayAmmoText();
            }
            ammo++;
        }
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
    if(head.offsetTop < (map.offsetTop-interfaceHeight) || head.offsetTop+head.offsetHeight > (map.offsetTop-interfaceHeight)+map.offsetHeight || head.offsetLeft < map.offsetLeft || head.offsetLeft+head.offsetWidth > map.offsetLeft+map.offsetWidth) {
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
    poweredUp = false;
    whichPowerUp = null;
    warnings = [];
    removeFood();
    clearInterval(move);
    clearTimeout(returnToNormal);
    clearInterval(powerUpInterval);
    clearInterval(asteroidInterval);
    clearInterval(laserInterval);
    map.style.filter = "invert(0%)";
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