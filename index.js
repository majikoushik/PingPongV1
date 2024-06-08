// Canvas Pong
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.9;

// Key Codes
var LEFT = 37;
var RIGHT = 39;
var reAnimId;
var flipFlag = true;

// Keep track of pressed keys
var keys = {
  LEFT: false,
  RIGHT: false
};

var backgroundImage = new Image();
backgroundImage.src = "green-bg.jpg";

var ballImage = new Image();
ballImage.src = "ball.png";
const ballImageSize = 40;
const ballImageScale = 1;
var targetHitSoundObj;
var backgroundSoundObj;
var endGameSoundObj;

class sound {
  constructor(src, volume) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    this.sound.volume = volume;
    document.body.appendChild(this.sound);
    this.play = function () {
      this.sound.play();
    };
    this.stop = function () {
      this.sound.pause();
    };
    this.refresh = function () {
      this.sound.currentTime = 0;
    }
  }
}

// Create a rectangle object - for paddles, ball, etc
function makeRect(x, y, width, height, speed, color) {
  if (!color) color = '#000000';
  return {
    x: x,
    y: y,
    w: width,
    h: height,
    s: speed,
    c: color,
    draw: function () {
      context.fillStyle = this.c;
      context.fillRect(this.x, this.y, this.w, this.h);
    },
    imageDraw: function () {
      context.drawImage(ballImage, this.x, this.y, ballImageSize * ballImageScale, ballImageSize * ballImageScale);
    }
  };
}

// Create the paddles
var paddleWidth = 100;
var paddleHeight = 25;
var paddle = makeRect(canvas.width / 2 - paddleWidth / 2, canvas.height - 40, paddleWidth, paddleHeight, 5, '#BC0000');

// Create the ball
var ballLength = ballImageSize; //15;
var ballSpeed = 2;
var ball = makeRect(0, 0, ballLength, ballLength, ballSpeed, '#000000');

// Modify the ball object to have two speed properties, one for X and one for Y
ball.sX = ballSpeed;
ball.sY = ballSpeed / 2;

// Randomize initial direction
if (Math.random() > 0.5) {
  ball.sX *= -1;
}
// Randomize initial direction
if (Math.random() > 0.5) {
  ball.sY *= -1;
}

// Reset the ball's position and speed after scoring
function resetBall() {
  ball.x = canvas.width / 2 - ball.w / 2;
  ball.y = canvas.height / 2 - ball.w / 2;
  ball.sX = ballSpeed;
  ball.sY = ballSpeed / 2;
}

// Bounce the ball off of a paddle
function bounceBall() {
  // Increase and reverse the Y speed
  if (ball.sY > 0) {
    ball.sY += 1;
    // Add some "spin"
    if (keys.LEFT) {
      ball.sX -= 1;
    } else if (keys.RIGHT) {
      ball.sX += 1;
    }
  } else {
    ball.sY -= 1;
    if (flipFlag) {
      ball.sX -= 1;
    }
    else {
      ball.sX += 1;
    }
    flipFlag = !flipFlag;
  }
  ball.sY *= -1;
}

// Listen for keydown events
canvas.addEventListener('keydown', function (e) {
  if (e.keyCode === LEFT) {
    keys.LEFT = true;
  }
  if (e.keyCode === RIGHT) {
    keys.RIGHT = true;
  }
});

// Listen for keyup events
canvas.addEventListener('keyup', function (e) {
  if (e.keyCode === LEFT) {
    keys.LEFT = false;
  }
  if (e.keyCode === RIGHT) {
    keys.RIGHT = false;
  }
});

// Show the menu
function menu() {
  erase();
  // Show the menu
  context.fillStyle = '#000000';
  context.font = '24px Arial';
  context.textAlign = 'center';
  context.fillText('PONG', canvas.width / 2, canvas.height / 4);
  context.font = '18px Arial';
  context.fillText('Click to Start', canvas.width / 2, canvas.height / 3);
  context.font = '14px Arial';
  // Start the game on a click
  canvas.addEventListener('click', startGame);
}

// Start the game
function startGame() {
  // Don't accept any more clicks
  canvas.removeEventListener('click', startGame);
  // backgroundSoundObj = new sound("sounds/game-ball-tap.wav", 0.3);
  // backgroundSoundObj.play();
  targetHitSoundObj = new sound("sounds/game-ball-tap.wav", 0.6);
  endGameSoundObj = new sound("sounds/game-bonus-reached.wav", 0.6);
  // Put the ball in place
  resetBall();
  // Kick off the game loop
  draw();
}

// Show the end game screen
function endGame() {
  endGameSoundObj.stop();
  endGameSoundObj.refresh();
  endGameSoundObj.play();
  erase();
  context.fillStyle = '#000000';
  context.font = '24px Arial';
  context.textAlign = 'center';
  context.fillText('Click to Refresh', canvas.width / 2, (canvas.height / 4) * 3);
  canvas.addEventListener('click', startGame);
  window.cancelAnimationFrame(reAnimId);
}

// Clear the canvas
function erase(withImage = false) {
  if (withImage) {
    context.fillStyle = context.createPattern(backgroundImage, "repeat");;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fill();
  } else {
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// Main draw loop
function draw() {
  erase(true);
  // Move the paddles
  if (keys.LEFT) {
    paddle.x -= paddle.s;
  }
  if (keys.RIGHT) {
    paddle.x += paddle.s;
  }
  // Move the ball
  ball.x += ball.sX;
  ball.y += ball.sY;
  // Bounce the ball off the top/bottom
  if (ball.x < 0 || ball.x + ball.w > canvas.width) {
    targetHitSoundObj.stop();
    targetHitSoundObj.refresh();
    targetHitSoundObj.play();
    ball.sX *= -1;
  }
  // Don't let the paddles go off screen
  if (paddle.x < 0) {
    paddle.x = 0;
  }
  if (paddle.x + paddle.w > canvas.width) {
    paddle.x = canvas.width - paddle.w;
  }
  //Bounce the ball off the paddles
  if (ball.x + ball.w / 2 >= paddle.x && ball.x + ball.w / 2 <= paddle.x + paddle.w) {
    if (ball.y + ball.h >= paddle.y) {
      targetHitSoundObj.stop();
      targetHitSoundObj.refresh();
      targetHitSoundObj.play();
      bounceBall();
    }
  }
  if (ball.y <= 0) {
    targetHitSoundObj.stop();
    targetHitSoundObj.refresh();
    targetHitSoundObj.play();
    bounceBall();
  }

  // Draw the paddles and ball
  paddle.draw();
  ball.imageDraw();
  // End the game or keep going
  if (ball.y > paddle.y) {
    endGame();
  } else {
    reAnimId = window.requestAnimationFrame(draw);
  }
}

// Show the menu to start the game
menu();
canvas.focus();
