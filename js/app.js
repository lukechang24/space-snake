const map = document.getElementById("map")
const head = document.getElementById("snake-head");
const powerUpStorage = document.getElementById("powerUp");
const powerUpImg = document.getElementById("powerUp-img");
const menuButton = document.getElementById("menu-button")
const playButton = document.getElementById("playButton");
const instructionButton = document.getElementById("instructionButton");
const instructionScreen = document.getElementById("instruction-screen")
const startScreen = document.getElementById("start-screen");
const topScreen = document.getElementById("top-screen");
const bottomScreen = document.getElementById("bottom-screen");
const playAgainText = document.querySelector("#play-again p");
let onTitleScreen = true;
let onInstructionScreen = false;

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
let bossSpawned;

let lasers = [];
let laserInterval;
let ammo;
let currentAmmo;
let firstAmmoText = false;

let difficulty;
let isPlaying;
let hit;
let stopMoving;

let score;
let scoreMultiplier;
let scoreDiv = document.querySelector("#score p");
let highScoreDiv = document.querySelector("#high-score p")
let highScore = localStorage.getItem("highestScore") ? localStorage.getItem("highestScore") : 0;
let interfaceHeight;

let laserSound = new Audio("audio/laser-sound.wav");
let gameOverSound = new Audio("audio/gameover-sound.wav")
let eatingSound = new Audio("audio/eating-sound.wav")
eatingSound.volume = 0.5;

function showInstructions() {
    onInstructionScreen = true;
    startScreen.style.display = "none";
    instructionScreen.style.display = "flex";
}

function backToStartScreen() {
    onInstructionScreen = false;
    startScreen.style.display = "flex";
    instructionScreen.style.display = "none";
    onTitleScreen = true;
    map.style.display = "none";
    topScreen.style.display = "none";
    bottomScreen.style.display = "none";
    highScoreDiv.style.visibility = "hidden";
}

function showGame() {
    startScreen.style.display = "none";
    map.style.display = "flex";
    topScreen.style.display = "flex";
    bottomScreen.style.display = "flex";
    onTitleScreen = false;
    interfaceHeight = document.getElementById("top-screen").offsetHeight;
    playAgainText.innerText = "PRESS SPACE TO START";
    head.style.left = "0px";
    head.style.top = "0px";
}

document.addEventListener("keydown", (e) => {
    if(isPlaying || onTitleScreen || onInstructionScreen) {
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
                snakeBlock.parentNode.removeChild(snakeBlock);
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
        stopMoving = false;
        difficulty = 1;
        bossSpawned = false;
        foodCount = 0;
        whichPowerUp = null;
        poweredUp = null;
        highScoreDiv.style.visibility = "hidden";
        powerUpStorage.style.visibility = "hidden";
        menuButton.style.visibility = "hidden";
        playAgainText.style.visibility = "hidden";
        removeAsteroids();
        renderScore();
        startMoving();
        spawnFood();
        callDownAsteroids();
        applySnakePattern();
        moveLasers();
    }
}

document.addEventListener("keydown", (e) => {
    if(!isPlaying) {
        return;
    }
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
    if(e.which === 65 && whichPowerUp && !poweredUp) {
        applyPowerUp();
    }
    if(e.which === 83 && ammo !== 0) {
        laserSound.play();
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
                if(currentDirection === "left" && block.offsetLeft === 0 || currentDirection === "up" && block.offsetTop === 0 || currentDirection === "right" && block.offsetLeft+block.offsetWidth === map.offsetWidth || currentDirection === "down" && block.offsetTop+block.offsetHeight === map.offsetHeight) {
                    applySnakePattern();
                    endGame();
                    stopMoving = true;
                }
                if(currentDirection === "left" && !stopMoving) {
                    block.style.left = (currentPosition[0] - 20) + "px";
                }
                if(currentDirection === "up" && !stopMoving) {
                    block.style.top = (currentPosition[1] - 20) + "px";
                }
                if(currentDirection === "right" && !stopMoving) {
                    block.style.left = (currentPosition[0] + 20) + "px";
                }
                if(currentDirection === "down" && !stopMoving) {
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
            food.style.left = `${food.offsetLeft > map.offsetWidth/2 ? food.offsetLeft-20 : food.offsetLeft+20}px`;
            food.style.top = `${food.offsetTop > map.offsetHeight/2 ? food.offsetTop-20 : food.offsetTop+20}px`;
        }
    })
}

function removeFood() {
    food.parentNode.removeChild(food);
    food = null;
}

function createAsteroids(pos, dir) {
    let blink = 0;
    let indicateAsteroid = document.createElement("img");
    indicateAsteroid.src = "images/warning2.png";
    indicateAsteroid.className = "warning";
    map.appendChild(indicateAsteroid);
    indicateAsteroid.style.height = "20px";
    indicateAsteroid.style.width = "20px";
    indicateAsteroid.style.position = "absolute";
    indicateAsteroid.style.left = `${dir === 2 ? 0 : dir === 3 ? map.offsetWidth-20 : pos}px`
    indicateAsteroid.style.top = `${dir === 0 ? 0 : dir === 1 ? map.offsetHeight-indicateAsteroid.offsetHeight : pos}px`;
    warnings.push(indicateAsteroid)
    let newAsteroid = document.createElement("div");
    newAsteroid.className = `${dir === 0 ? "asteroid-top" : dir === 1 ?  "asteroid-bottom" : dir === 2 ? "asteroid-left" : "asteroid-right"}`;
    newAsteroid.style.backgroundImage = `${dir === 0 ? "linear-gradient(red, grey, grey)" : dir === 1 ? "linear-gradient(grey, grey, red)" : dir === 2 ? "linear-gradient(to right, red, grey, grey)" : "linear-gradient(to right, grey, grey, red)"}`;
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
            newAsteroid.style.left = `${newAsteroid.className === "asteroid-left" ? 0 : newAsteroid.className === "asteroid-right" ? map.offsetWidth-newAsteroid.offsetWidth : pos}px`;
            newAsteroid.style.top = `${newAsteroid.className === "asteroid-top" ? 0 : newAsteroid.className === "asteroid-bottom" ? (map.offsetHeight-newAsteroid.offsetHeight) : pos}px`;
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
        if(asteroid.className === "asteroid-top") {
            asteroid.style.top = (asteroid.offsetTop+20)+"px";
        }
        if(asteroid.className === "asteroid-bottom") {
            asteroid.style.top = (asteroid.offsetTop-20)+"px";
        }
        if(asteroid.className === "asteroid-left") {
            asteroid.style.left = (asteroid.offsetLeft+20)+"px";
        }
        if(asteroid.className === "asteroid-right") {
            asteroid.style.left = (asteroid.offsetLeft-20)+"px";
        }
        snake.forEach(snakeBody => {
            if(asteroid.offsetTop === snakeBody.offsetTop && asteroid.offsetLeft === snakeBody.offsetLeft) {
                endGame();
            }
        })
        if((asteroid.offsetTop+asteroid.offsetHeight > (map.offsetTop-interfaceHeight)+map.offsetHeight && asteroid.className === "asteroid-top") || (asteroid.offsetTop < (map.offsetTop-interfaceHeight) && asteroid.className === "asteroid-bottom") || (asteroid.offsetLeft+asteroid.offsetWidth > map.offsetLeft+map.offsetWidth && asteroid.className === "asteroid-left") || (asteroid.offsetLeft < map.offsetLeft && asteroid.className === "asteroid-right")) {
            asteroid.parentNode.removeChild(asteroid);
            asteroids.shift();
            warnings.shift();
        }
    })
}

function callDownAsteroids() {
    asteroidInterval = setInterval(() => {
        let chanceToSpawn = Math.random()*10;
        difficulty = score > 2000 ? 3 : score > 1000 ? 2 : 1;
        if(chanceToSpawn > 6 && warnings.length < difficulty) {
            let whichDir = Math.floor(Math.random()*4);
            let randomPosition = `${whichDir === 0 || whichDir === 1 ? Math.round((Math.random()*(map.offsetWidth-20))/20)*20 : Math.round((Math.random()*(map.offsetHeight-20))/20)*20}`;
            if(score > 2000 && !bossSpawned) {
                createBoss(whichDir);
                return;
            }
            createAsteroids(randomPosition, whichDir);
        }
        moveAsteroids();
    },1000);
}

function createBoss(dir) {
    if(dir === 0 || dir === 1) {
        for(let i = 0; i < map.offsetWidth/20; i++) {
            createAsteroids((i*20), dir);
        }
    } else {
        for(let i = 0; i < map.offsetHeight/20; i++) {
            createAsteroids((i*20), dir);
        }
    }
    bossSpawned = true;
}

function removeAsteroids() {
    while(asteroids.length > 0) {
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
                if(((laser.offsetTop === asteroid.offsetTop || laser.offsetTop === asteroid.offsetTop-20 && laser.className === "laser-top") && laser.offsetLeft === asteroid.offsetLeft) || ((laser.offsetTop === asteroid.offsetTop || laser.offsetTop === asteroid.offsetTop+20 && laser.className === "laser-down") && laser.offsetLeft === asteroid.offsetLeft) || ((laser.offsetLeft === asteroid.offsetLeft || laser.offsetLeft === asteroid.offsetLeft-20 && laser.className === "laser-left") && laser.offsetTop === asteroid.offsetTop) || ((laser.offsetLeft === asteroid.offsetLeft || laser.offsetLeft === asteroid.offsetLeft+20 && laser.className === "laser-right")&& laser.offsetTop === asteroid.offsetTop)) {
                    laser.parentNode.removeChild(laser);
                    lasers.splice(lasers.indexOf(laser), 1);
                    asteroid.parentNode.removeChild(asteroid);
                    asteroids.splice(asteroids.indexOf(asteroid), 1)
                    warnings.shift();
                    score += 50;
                    renderScore();
                }
            })
            if((laser.offsetLeft < map.offsetLeft && laser.className === "laser-left") || (laser.offsetLeft+laser.offsetWidth > (map.offsetLeft+map.offsetWidth) && laser.className === "laser-right") || (laser.offsetTop+laser.offsetHeight > (map.offsetTop-interfaceHeight)+map.offsetHeight && laser.className === "laser-down") || (laser.offsetTop < (map.offsetTop-interfaceHeight) && laser.className === "laser-up")) {
                laser.parentNode.removeChild(laser);
                lasers.splice(lasers.indexOf(laser), 1);
            }
        })
    },30)
}

function displayAmmoText() {
    let ammoText = document.createElement("div");
    ammoText.innerText = `+1 AMMO ${!firstAmmoText ? "(PRESS 'S' TO SHOOT)" : ""}`;
    ammoText.style.position = "absolute";
    ammoText.style.color = "white";
    ammoText.style.left = head.offsetLeft + "px";
    ammoText.style.top = head.offsetTop-20 + "px";
    ammoText.style.zIndex = 2;
    map.appendChild(ammoText);
    const removeammoText = setTimeout(() => {
        ammoText.parentNode.removeChild(ammoText);
    },1500);
    firstAmmoText = true;
}

function removeLasers() {
    while(lasers.length > 0) {
        lasers[0].parentNode.removeChild(lasers[0]);
        lasers.shift();
    }
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
    powerUpStorage.style.visibility = "visible";
    let randomNum = Math.floor(Math.random()*3);
    if(randomNum === 0) {
        whichPowerUp = "infinite-ammo";
        powerUpImg.src = "images/infinite-ammo.png";
    } else if(randomNum === 1){
        whichPowerUp = "decrease-speed";
        powerUpImg.src = "images/decrease-speed.png";

    } else {
        whichPowerUp = "freeze";
        powerUpImg.src = "images/freeze-time.png";
    }
    displayPowerUpText();
    removePowerUp();
}

function applyPowerUp() {
    if(whichPowerUp === "infinite-ammo") {
        rapidFireSnake();
    } else if(whichPowerUp === "decrease-speed"){
        slowDownSnake();
    } else if(whichPowerUp === "freeze"){
        freezeTime();
    } else {
        return;
    }
    clearInterval(move);
    startMoving();
    poweredUp = true;
    applySnakePattern();
    returnToNormal = setTimeout(() => {
        if(!clearInterval(asteroidInterval)) {
            callDownAsteroids();
            map.style.filter = "invert(0%)";
        }
        speed = 75;
        scoreMultiplier = 1;
        if(whichPowerUp === "infinite-ammo") {
            ammo = currentAmmo;
        }
        poweredUp = false;
        whichPowerUp = null;
        powerUp = null;
        powerUpImg.src = "";
        powerUpStorage.style.visibility = "hidden";
        applySnakePattern();
        clearInterval(move);
        startMoving();
    },10000)
}

function displayPowerUpText() {
    let powerUpText = document.createElement("div");
    powerUpText.innerText = `${whichPowerUp === "infinite-ammo" ? "INFINITE AMMO" : whichPowerUp === "decrease-speed" ? "DECREASE SPEED" : "FREEZE TIME"}${!firstPowerUpText ? " (PRESS 'A' TO USE)" : ""}`;
    powerUpText.style.position = "absolute";
    powerUpText.style.color = "white";
    powerUpText.style.left = head.offsetLeft + "px";
    powerUpText.style.top = head.offsetTop-20 + "px";
    powerUpText.style.zIndex = 2;
    map.appendChild(powerUpText);
    const removePowerUpText = setTimeout(() => {
        powerUpText.parentNode.removeChild(powerUpText);
    },3000);
    firstPowerUpText = true;
}

function rapidFireSnake() {
    snake.forEach((block, i) => {
        block.style.backgroundColor = "gold";
    })
    currentAmmo = ammo;
    ammo = 1000;
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
                block.style.backgroundColor = "yellow";
            } else {
                block.style.border = "1.5px solid black";
                block.style.backgroundColor = "red";
            }
        }
        if(whichPowerUp === "infinite-ammo" && poweredUp) {
            block.style.backgroundColor = "gold";
        } else if(whichPowerUp === "decrease-speed" && poweredUp) {
            block.style.backgroundColor = "purple";
        } else {
            block.style.backgroundColor = `${block.style.backgroundColor === "yellow" ? "yellow" : "#00B2EE"}`;
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
    if(snake.length % 10 === 0) {
        spawnPowerUp();
    }
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
        eatingSound.play();
        growSnake();
        growSnake();
        applySnakePattern();
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
    if(head.offsetLeft === currentFood.offsetLeft && head.offsetTop === currentFood.offsetTop) {
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
    if(lasers.length > 0) {
        removeLasers();
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
    playAgainText.innerText = "PRESS SPACE TO PLAY AGAIN";
    playAgainText.style.visibility = "visible";
    powerUpStorage.style.visibility = "hidden";
    menuButton.style.visibility = "visible";

    isPlaying = false;
    renderScore();
    gameOverSound.play();
}