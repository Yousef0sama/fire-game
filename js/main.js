// massages

alert("use Arrows as 'W' 'A' 'S' 'D' to move and use Space and mouse to fire");
alert("you the blue and the red is enemy and green is food");
alert("the fire decrease health 20");
alert("if you kill an enemy you earn 10 points");
alert("if you eat food you earn 5 points and your health increase 20");
alert("if enemy arrive the right border of screen you lose 10 points");
alert("if you died your points return 0");

// Utility functions
const getRandomHeight = () => {
  let y = Math.round(Math.random() * window.innerHeight);
  y -= y % 5;
  if (y < 30) y = 30;
  if (y > window.innerHeight - 70) y = window.innerHeight - 70;
  return y;
}

const getRandomWidth = () => {
  let x = Math.round(Math.random() * window.innerWidth);
  x -= x % 5;
  if (x < 30) x = 30;
  if (x > window.innerWidth - 70) x = window.innerWidth - 70;
  return x;
}

const isColliding = (bullet, entity) => {
  return (
    bullet.x > entity.x &&
    bullet.x < entity.x + entity.width &&
    bullet.y > entity.y - entity.height / 2 &&
    bullet.y < entity.y + entity.height / 2
  );
}

// Classes
class Entity {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.health = 100;
  }

  updatePosition(element) {
    element.style.top = this.y + 'px';
    element.style.left = this.x + 'px';
  }
}

class Player extends Entity {
  constructor() {
    super(0, 30);
    this.score = 0;
    this.highScore = 0;
    this.pressedKeys = new Set();

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.gameLoop = this.gameLoop.bind(this);

    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);

    this.gameLoop();
  }

  handleKeyDown(event) {
    this.pressedKeys.add(event.keyCode);
  }

  handleKeyUp(event) {
    this.pressedKeys.delete(event.keyCode);
  }

  move() {
    const step = 5;
    if (this.pressedKeys.has(38) || this.pressedKeys.has(87)) { // Arrow Up or W
      if (this.y > 30) this.y -= step;
    }
    if (this.pressedKeys.has(40) || this.pressedKeys.has(83)) { // Arrow Down or S
      if (this.y < window.innerHeight - 70) this.y += step;
    }
    if (this.pressedKeys.has(37) || this.pressedKeys.has(65)) { // Arrow Left or A
      if (this.x > 0) this.x -= step;
    }
    if (this.pressedKeys.has(39) || this.pressedKeys.has(68)) { // Arrow Right or D
      if (this.x < window.innerWidth - 70) this.x += step;
    }

    this.updatePosition(playerElement);

    if (this.x >= food.x - 30 && this.x <= food.x + 30 && this.y >= food.y - 30 && this.y <= food.y + 30) {
      this.eatFood();
      food.destroy();
      food = new Food(getRandomWidth(), getRandomHeight());
    }
  }

  gameLoop() {
    this.move();
    requestAnimationFrame(this.gameLoop);
  }

  reset() {
    this.x = 0;
    this.y = 30;
    this.score = 0;
    this.health = 100;
    this.updateScoreDisplay();
    this.updateHealthDisplay();
    this.updatePosition(playerElement);
  }

  takeDamage() {
    if (this.health <= 20) {
      this.reset();
    } else {
      this.health -= 20;
      this.updateHealthDisplay();
    }
  }

  fire(button) {
    if (button === 32 || button === null) { // Space bar
      const bullet = new Bullet(this.x, this.y, 'right');
      bullet.move();
    }
  }

  eatFood() {
    if (this.health < 100) {
      this.health += 20;
      this.updateHealthDisplay();
    }
    this.score += 5;
    if (this.score >= this.highScore) {
      this.highScore = this.score;
    }
    this.updateScoreDisplay();
  }

  updateScoreDisplay() {
    scoreElement.innerHTML = `Score: ${this.score} High Score: ${this.highScore}`;
  }

  updateHealthDisplay() {
    playerHealthElement.innerHTML = this.health;
    playerHealthElement.style.width = (this.health / 100) * 30 + 'px';
  }
}

class Enemy extends Entity {
  constructor() {
    super(window.innerWidth - 70, 30);
    this.move();
  }

  move() {
    const step = 5;
    this.interval = setInterval(() => {
      this.x -= step;
      this.updatePosition(enemyElement);
      if (this.x < 30) {
        if (player.score > 0) {
          player.score -= 10;
          player.updateScoreDisplay();
        }
        this.reset();
      }
    }, 50);
  }

  reset() {
    clearInterval(this.interval);
    this.x = window.innerWidth - 70;
    this.y = getRandomHeight();
    this.health = 100;
    this.updatePosition(enemyElement);
    enemyHealthElement.innerHTML = this.health;
    enemyHealthElement.style.width = (this.health / 100) * 30 + 'px';
    this.move();
    this.shoot();
  }

  takeDamage() {
    if (this.health <= 20) {
      this.reset();
      player.score += 10;
      if (player.score >= player.highScore) {
        player.highScore = player.score;
      }
      player.updateScoreDisplay();
    } else {
      this.health -= 20;
      enemyHealthElement.innerHTML = this.health;
      enemyHealthElement.style.width = (this.health / 100) * 30 + 'px';
    }
  }

  shoot() {
    setInterval(() => {
      const bullet = new Bullet(this.x, this.y, 'left');
      bullet.move();
    }, 2500);
  }
}

class Bullet {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.element = document.createElement('div');
    this.element.className = this.direction === 'right' ? 'playerBullet' : 'enemyBullet';
    this.element.style.display = 'block';
    this.element.style.top = this.y + 'px';
    this.element.style.left = this.x + 'px';
    document.body.appendChild(this.element);
  }

  move() {
    const step = 1;
    this.interval = setInterval(() => {
      this.x += this.direction === 'right' ? step : -step;
      this.element.style.left = this.x + 'px';
      if (isColliding(this, enemy)) {
        enemy.takeDamage();
        this.destroy();
      }
      if (isColliding(this, player)) {
        player.takeDamage();
        this.destroy();
      }
      if (this.x > window.innerWidth - 40 || this.x < 0) {
        this.destroy();
      }
    }, 1);
  }

  destroy() {
    clearInterval(this.interval);
    this.element.remove();
  }
}

class Food {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.element = document.createElement('div');
    this.element.className = 'food';
    this.element.style.display = 'block';
    this.element.style.top = this.y + 'px';
    this.element.style.left = this.x + 'px';
    document.body.appendChild(this.element);
  }

  destroy() {
    this.element.remove();
  }
}

// HTML Elements
const playerHealthElement = document.querySelector('.playerHealth');
const enemyHealthElement = document.querySelector('.enemyHealth');
const playerElement = document.querySelector('.player');
const enemyElement = document.querySelector('.enemy');
const scoreElement = document.querySelector('.score');

// Create objects
let food = new Food(getRandomWidth(), getRandomHeight());
const player = new Player();
const enemy = new Enemy();

// Player movement and firing
document.addEventListener('keydown', (e) => {
  player.handleKeyDown(e);
  player.fire(e.keyCode);
});

document.addEventListener('keyup', (e) => {
  player.handleKeyUp(e);
});

document.addEventListener('click', () => {
  player.fire(null);
});
