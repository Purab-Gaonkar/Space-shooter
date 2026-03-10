const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const speedDisplay = document.getElementById("speed-val");
const gameOverScreen = document.getElementById("game-over");
const finalScoreText = document.getElementById("final-score");

let width = window.innerWidth;
let height = window.innerHeight;

canvas.width = width;
canvas.height = height;

window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
});

/* SPRITES */
const shipSprite = new Image();
shipSprite.src = "img/spaceship.jpg"; 

const asteroidSprite = new Image();
asteroidSprite.src = "img/asteroid.png"; 

// Using 128 based on your high-res sprite sheet uploads
const SPRITE_SIZE = 128; 

/* GAME STATE */
let score = 0;
let gameActive = true;
let baseSpeed = 3;
let speedMultiplier = 1;
let frameCount = 0;

const player = {
    x: width / 2 - 30,
    y: height * 0.8,
    size: 60,
    vx: 0,
    vy: 0,
    accel: 0.9,
    friction: 0.85
};

const enemies = [];
const stars = [];
const keys = {};

/* CONTROLS */
window.addEventListener("keydown", e => keys[e.code] = true);
window.addEventListener("keyup", e => keys[e.code] = false);

/* SPAWN ASTEROID */
function spawnEnemy() {
    const size = 70;
    const randomCol = Math.floor(Math.random() * 3);
    const randomRow = Math.floor(Math.random() * 2);

    enemies.push({
        x: Math.random() * (width - size),
        y: -size,
        size: size,
        speed: (baseSpeed + Math.random() * 2) * speedMultiplier,
        rot: 0,
        rotSpeed: (Math.random() - 0.5) * 0.1,
        sx: randomCol * SPRITE_SIZE,
        sy: randomRow * SPRITE_SIZE
    });
}

/* INITIALIZE STARS */
const starCount = Math.floor((width * height) / 4000);
for (let i = 0; i < starCount; i++) {
    stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2,
        speed: Math.random() * 2 + 1
    });
}

/* GAME LOOP */
function gameLoop() {
    if (!gameActive) return;

    // Clear Screen
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, width, height);

    /* DRAW STARS */
    ctx.fillStyle = "#fff";
    stars.forEach(s => {
        s.y += s.speed * speedMultiplier;
        if (s.y > height) {
            s.y = 0;
            s.x = Math.random() * width;
        }
        ctx.fillRect(s.x, s.y, s.size, s.size);
    });

    /* MOVEMENT */
    if (keys["ArrowUp"] || keys["KeyW"]) player.vy -= player.accel;
    if (keys["ArrowDown"] || keys["KeyS"]) player.vy += player.accel;
    if (keys["ArrowLeft"] || keys["KeyA"]) player.vx -= player.accel;
    if (keys["ArrowRight"] || keys["KeyD"]) player.vx += player.accel;

    player.vx *= player.friction;
    player.vy *= player.friction;
    player.x += player.vx;
    player.y += player.vy;

    player.x = Math.max(0, Math.min(width - player.size, player.x));
    player.y = Math.max(0, Math.min(height - player.size, player.y));

    /* DRAW PLAYER */
    ctx.save();
    ctx.translate(player.x + player.size / 2, player.y + player.size / 2);
    ctx.rotate(player.vx * 0.05);
    
    // Draw sprite if loaded, otherwise draw a cyan square so you can still play
    if (shipSprite.complete && shipSprite.naturalWidth !== 0) {
        ctx.drawImage(shipSprite, 0, 0, SPRITE_SIZE, SPRITE_SIZE, -player.size / 2, -player.size / 2, player.size, player.size);
    } else {
        ctx.fillStyle = "cyan";
        ctx.fillRect(-player.size/2, -player.size/2, player.size, player.size);
    }
    ctx.restore();

    /* ENEMIES */
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.y += e.speed;
        e.rot += e.rotSpeed;

        ctx.save();
        ctx.translate(e.x + e.size / 2, e.y + e.size / 2);
        ctx.rotate(e.rot);

        if (asteroidSprite.complete && asteroidSprite.naturalWidth !== 0) {
            ctx.drawImage(asteroidSprite, e.sx, e.sy, SPRITE_SIZE, SPRITE_SIZE, -e.size / 2, -e.size / 2, e.size, e.size);
        } else {
            ctx.fillStyle = "red";
            ctx.fillRect(-e.size/2, -e.size/2, e.size, e.size);
        }
        ctx.restore();

        /* COLLISION */
        const dist = Math.hypot(
            (player.x + player.size / 2) - (e.x + e.size / 2),
            (player.y + player.size / 2) - (e.y + e.size / 2)
        );

        if (dist < (player.size / 2 + e.size / 2) * 0.7) {
            endGame();
            return;
        }

        if (e.y > height + 50) {
            enemies.splice(i, 1);
            score += 10;
            scoreDisplay.innerText = score;
        }
    }

    /* PROGRESSION */
    frameCount++;
    if (frameCount % Math.max(8, Math.floor(40 / speedMultiplier)) === 0) spawnEnemy();
    speedMultiplier += 0.0003;
    speedDisplay.innerText = speedMultiplier.toFixed(2);

    requestAnimationFrame(gameLoop);
}

/* GAME OVER */
function endGame() {
    gameActive = false;
    gameOverScreen.classList.remove("hidden");
    finalScoreText.innerText = `Final Score: ${score}`;
}

// Start immediately
gameLoop();