const game = document.getElementById('game');
const bird = document.getElementById('bird');
const obstacles = document.getElementById('obstacles');
const tomatoesContainer = document.getElementById('tomatoes');
const bulletsContainer = document.getElementById('bullets');

let birdTop = 250;
let birdLeft = 50;
let gravity = 2;
let gameHeight = 600;
let gameWidth = 400;
let obstacleWidth = 60;
let obstacleGap = 150;
let obstacleSpeed = 2;
let score = 0;
let gameRunning = true;

// Obstacle pattern: Array of gap positions (top position of the gap)
const obstaclePattern = [100, 200, 300, 400]; // Example pattern

// Tomatoes (enemies) array
let tomatoes = [];

// Bullets array
let bullets = [];

function updateBird() {
    if (gameRunning) {
        birdTop += gravity; // Apply gravity
        bird.style.top = birdTop + 'px';
        bird.style.left = birdLeft + 'px';

        // Check if bird hits the ground or ceiling
        if (birdTop > gameHeight - 40 || birdTop < 0) {
            resetBird();
        }
    }
}

function createObstacle() {
    if (!gameRunning) return;

    // Cycle through the obstacle pattern
    for (let i = 0; i < obstaclePattern.length; i++) {
        let gapPosition = obstaclePattern[i];

        // Create top obstacle
        let topObstacle = document.createElement('div');
        topObstacle.classList.add('obstacle');
        topObstacle.style.height = gapPosition + 'px';
        topObstacle.style.left = gameWidth + i * 200 + 'px'; // Spacing between obstacles

        // Create bottom obstacle
        let bottomObstacle = document.createElement('div');
        bottomObstacle.classList.add('obstacle');
        bottomObstacle.style.height = gameHeight - gapPosition - obstacleGap + 'px';
        bottomObstacle.style.left = gameWidth + i * 200 + 'px';
        bottomObstacle.style.top = gapPosition + obstacleGap + 'px';

        obstacles.appendChild(topObstacle);
        obstacles.appendChild(bottomObstacle);

        moveObstacles(topObstacle, bottomObstacle);
    }
}

function moveObstacles(topObstacle, bottomObstacle) {
    let obstacleInterval = setInterval(() => {
        if (!gameRunning) {
            clearInterval(obstacleInterval);
            return;
        }

        let topObstacleLeft = parseInt(topObstacle.style.left);
        let bottomObstacleLeft = parseInt(bottomObstacle.style.left);

        topObstacle.style.left = topObstacleLeft - obstacleSpeed + 'px';
        bottomObstacle.style.left = bottomObstacleLeft - obstacleSpeed + 'px';

        // Remove obstacles when they go off-screen
        if (topObstacleLeft < -obstacleWidth) {
            obstacles.removeChild(topObstacle);
            obstacles.removeChild(bottomObstacle);
            score++;
            console.log('Score: ' + score);
        }

        // Check for collision
        if (checkCollision(topObstacle, bottomObstacle)) {
            resetBird();
        }
    }, 20);
}

function checkCollision(topObstacle, bottomObstacle) {
    let birdRect = bird.getBoundingClientRect();
    let topObstacleRect = topObstacle.getBoundingClientRect();
    let bottomObstacleRect = bottomObstacle.getBoundingClientRect();

    if (birdRect.right > topObstacleRect.left && birdRect.left < topObstacleRect.right &&
        (birdRect.top < topObstacleRect.bottom || birdRect.bottom > bottomObstacleRect.top)) {
        return true;
    }
    return false;
}

function resetBird() {
    // Reset bird position
    birdTop = 250;
    birdLeft = 50;
    bird.style.top = birdTop + 'px';
    bird.style.left = birdLeft + 'px';
}

// Create a tomato (enemy)
function createTomato() {
    if (!gameRunning) return;

    let tomato = document.createElement('div');
    tomato.classList.add('tomato');
    tomato.style.top = Math.random() * (gameHeight - 40) + 'px'; // Random vertical position
    tomato.style.left = gameWidth + 'px'; // Start from the right side
    tomatoesContainer.appendChild(tomato);

    tomatoes.push(tomato);

    moveTomato(tomato);
}

// Move tomato towards the bird
function moveTomato(tomato) {
    let tomatoInterval = setInterval(() => {
        if (!gameRunning) {
            clearInterval(tomatoInterval);
            return;
        }

        let tomatoLeft = parseInt(tomato.style.left);
        tomato.style.left = tomatoLeft - 2 + 'px'; // Move left

        // Remove tomato if it goes off-screen
        if (tomatoLeft < -40) {
            tomatoesContainer.removeChild(tomato);
            tomatoes = tomatoes.filter(t => t !== tomato);
        }

        // Check for collision with bird
        if (checkTomatoCollision(tomato)) {
            resetBird();
        }
    }, 20);
}

// Check collision between bird and tomato
function checkTomatoCollision(tomato) {
    let birdRect = bird.getBoundingClientRect();
    let tomatoRect = tomato.getBoundingClientRect();

    if (birdRect.right > tomatoRect.left && birdRect.left < tomatoRect.right &&
        birdRect.bottom > tomatoRect.top && birdRect.top < tomatoRect.bottom) {
        return true;
    }
    return false;
}

// Create a bullet
function createBullet() {
    if (!gameRunning) return;

    let bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.style.top = birdTop + 15 + 'px'; // Align with bird
    bullet.style.left = birdLeft + 40 + 'px'; // Start from bird's right side
    bulletsContainer.appendChild(bullet);

    bullets.push(bullet);

    moveBullet(bullet);
}

// Move bullet forward
function moveBullet(bullet) {
    let bulletInterval = setInterval(() => {
        if (!gameRunning) {
            clearInterval(bulletInterval);
            return;
        }

        let bulletLeft = parseInt(bullet.style.left);
        bullet.style.left = bulletLeft + 5 + 'px'; // Move right

        // Remove bullet if it goes off-screen
        if (bulletLeft > gameWidth) {
            bulletsContainer.removeChild(bullet);
            bullets = bullets.filter(b => b !== bullet);
        }

        // Check for collision with tomatoes
        tomatoes.forEach((tomato, index) => {
            if (checkBulletCollision(bullet, tomato)) {
                bulletsContainer.removeChild(bullet);
                tomatoesContainer.removeChild(tomato);
                bullets = bullets.filter(b => b !== bullet);
                tomatoes.splice(index, 1);
            }
        });
    }, 20);
}

// Check collision between bullet and tomato
function checkBulletCollision(bullet, tomato) {
    let bulletRect = bullet.getBoundingClientRect();
    let tomatoRect = tomato.getBoundingClientRect();

    if (bulletRect.right > tomatoRect.left && bulletRect.left < tomatoRect.right &&
        bulletRect.bottom > tomatoRect.top && bulletRect.top < tomatoRect.bottom) {
        return true;
    }
    return false;
}

// Handle keydown events for movement and shooting
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    switch (e.code) {
        case 'ArrowUp': // Move up
            birdTop -= 40;
            break;
        case 'ArrowDown': // Move down
            birdTop += 40;
            break;
        case 'ArrowLeft': // Move left
            birdLeft -= 40;
            break;
        case 'ArrowRight': // Move right
            birdLeft += 40;
            break;
        case 'KeyF': // Shoot bullet
            createBullet();
            break;
    }

    // Update bird position
    bird.style.top = birdTop + 'px';
    bird.style.left = birdLeft + 'px';
});

// Game loop
setInterval(updateBird, 20);
setInterval(createObstacle, 3000); // Create obstacles every 3 seconds
setInterval(createTomato, 2000); // Create tomatoes every 2 seconds