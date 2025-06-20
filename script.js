// Game variables
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");
const finalLevel = document.getElementById("finalLevel");

// Game state
let gameState = {
  snake: [{ x: 200, y: 200 }],
  direction: { x: 20, y: 0 },
  food: { x: 0, y: 0 },
  score: 0,
  level: 1,
  gameRunning: true,
  paused: false,
  speed: 150,
  lastDirection: { x: 20, y: 0 },
};

const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Initialize game
function initGame() {
  gameState.snake = [{ x: 200, y: 200 }];
  gameState.direction = { x: 20, y: 0 };
  gameState.lastDirection = { x: 20, y: 0 };
  gameState.score = 0;
  gameState.level = 1;
  gameState.gameRunning = true;
  gameState.paused = false;
  gameState.speed = 150;

  generateFood();
  updateUI();
  gameOverScreen.style.display = "none";
  gameLoop();
}

// Generate food at random position
function generateFood() {
  let foodPosition;
  do {
    foodPosition = {
      x: Math.floor(Math.random() * tileCount) * gridSize,
      y: Math.floor(Math.random() * tileCount) * gridSize,
    };
  } while (
    gameState.snake.some(
      (segment) => segment.x === foodPosition.x && segment.y === foodPosition.y
    )
  );

  gameState.food = foodPosition;
}

// Draw game elements
function draw() {
  // Clear canvas with gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#1a1a2e");
  gradient.addColorStop(0.5, "#16213e");
  gradient.addColorStop(1, "#0f3460");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= tileCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvas.height);
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(canvas.width, i * gridSize);
    ctx.stroke();
  }

  // Draw snake with gradient
  gameState.snake.forEach((segment, index) => {
    const gradient = ctx.createRadialGradient(
      segment.x + gridSize / 2,
      segment.y + gridSize / 2,
      0,
      segment.x + gridSize / 2,
      segment.y + gridSize / 2,
      gridSize / 2
    );

    if (index === 0) {
      // Head
      gradient.addColorStop(0, "#4ECDC4");
      gradient.addColorStop(1, "#44A08D");
    } else {
      // Body
      gradient.addColorStop(0, "#667eea");
      gradient.addColorStop(1, "#764ba2");
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(segment.x, segment.y, gridSize - 2, gridSize - 2);

    // Add border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(segment.x, segment.y, gridSize - 2, gridSize - 2);
  });

  // Draw food with glow effect
  const foodGradient = ctx.createRadialGradient(
    gameState.food.x + gridSize / 2,
    gameState.food.y + gridSize / 2,
    0,
    gameState.food.x + gridSize / 2,
    gameState.food.y + gridSize / 2,
    gridSize / 2
  );
  foodGradient.addColorStop(0, "#FFD700");
  foodGradient.addColorStop(0.7, "#FFA500");
  foodGradient.addColorStop(1, "#FF6347");

  ctx.fillStyle = foodGradient;
  ctx.fillRect(gameState.food.x, gameState.food.y, gridSize - 2, gridSize - 2);

  // Add glow effect
  ctx.shadowColor = "#FFD700";
  ctx.shadowBlur = 15;
  ctx.fillRect(
    gameState.food.x + 2,
    gameState.food.y + 2,
    gridSize - 6,
    gridSize - 6
  );
  ctx.shadowBlur = 0;
}

// Update game logic
function update() {
  if (!gameState.gameRunning || gameState.paused) return;

  // Move snake
  const head = {
    x: gameState.snake[0].x + gameState.direction.x,
    y: gameState.snake[0].y + gameState.direction.y,
  };

  // Check wall hitting
  if (
    head.x < 0 ||
    head.x >= canvas.width ||
    head.y < 0 ||
    head.y >= canvas.height
  ) {
    gameOver();
    return;
  }

  // Check self hitting
  if (
    gameState.snake.some(
      (segment) => segment.x === head.x && segment.y === head.y
    )
  ) {
    gameOver();
    return;
  }

  gameState.snake.unshift(head);

  // Check food touch
  if (head.x === gameState.food.x && head.y === gameState.food.y) {
    gameState.score += 10;
    generateFood();

    // Increase level every 100 points
    if (gameState.score % 100 === 0) {
      gameState.level++;
      gameState.speed = Math.max(80, gameState.speed - 10);
    }

    updateUI();
  } else {
    gameState.snake.pop();
  }

  gameState.lastDirection = { ...gameState.direction };
}

// Game loop
function gameLoop() {
  update();
  draw();

  if (gameState.gameRunning) {
    setTimeout(gameLoop, gameState.speed);
  }
}

// Update UI elements
function updateUI() {
  scoreElement.textContent = gameState.score;
  levelElement.textContent = gameState.level;
}

// Game over
function gameOver() {
  gameState.gameRunning = false;
  finalScore.textContent = gameState.score;
  finalLevel.textContent = gameState.level;
  gameOverScreen.style.display = "block";
}

// Control functions
function changeDirection(newDirection) {
  if (!gameState.gameRunning || gameState.paused) return;

  const directions = {
    up: { x: 0, y: -20 },
    down: { x: 0, y: 20 },
    left: { x: -20, y: 0 },
    right: { x: 20, y: 0 },
  };

  const newDir = directions[newDirection];

  // Prevent reverse direction
  if (
    newDir.x !== -gameState.lastDirection.x ||
    newDir.y !== -gameState.lastDirection.y
  ) {
    gameState.direction = newDir;
  }
}

function togglePause() {
  if (!gameState.gameRunning) return;

  gameState.paused = !gameState.paused;
  if (!gameState.paused) {
    gameLoop();
  }
}

function toggleSpeed() {
  const speeds = [200, 150, 100, 80];
  const currentIndex = speeds.indexOf(gameState.speed);
  gameState.speed = speeds[(currentIndex + 1) % speeds.length];
}

function restartGame() {
  initGame();
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
     
      e.preventDefault();
      changeDirection("up");
      break;
    case "ArrowDown":
     
      e.preventDefault();
      changeDirection("down");
      break;
    case "ArrowLeft":
     
      e.preventDefault();
      changeDirection("left");
      break;
    case "ArrowRight":
     
      e.preventDefault();
      changeDirection("right");
      break;
    case " ":
      e.preventDefault();
      togglePause();
      break;

      e.preventDefault();
      restartGame();
      break;
  }
});

// Start the game
initGame();
