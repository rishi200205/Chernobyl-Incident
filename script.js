const canvas = document.getElementById('reactorCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');

// Canvas size
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

// Constants
const particles = [];
const moderators = [];
const controlRods = [];
const waterSquares = [];
const particleRadius = 5;
const gridSize = 20; // For water squares

// Utility functions
function getRandomInt(min, max) {
  return Math.random() * (max - min) + min;
}

// Particle class
class Particle {
  constructor(x, y, color, speed, direction, type = 'neutron') {
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = speed;
    this.direction = direction;
    this.type = type;
    this.radius = particleRadius;
    this.alive = true;
  }

  move() {
    this.x += Math.cos(this.direction) * this.speed;
    this.y += Math.sin(this.direction) * this.speed;

    // Remove particles if they go out of bounds
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
      this.alive = false;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

// Water square class
class WaterSquare {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.temperature = 0; // 0 = cold, 1 = hot, 2 = steam
  }

  draw() {
    if (this.temperature === 0) ctx.fillStyle = 'blue';
    else if (this.temperature === 1) ctx.fillStyle = 'red';
    else return; // Steam disappears

    ctx.fillRect(this.x, this.y, gridSize, gridSize);
  }

  heatUp() {
    if (this.temperature < 2) this.temperature++;
  }
}

// Initialize the water coolant grid
function initializeWaterGrid() {
  for (let y = 0; y < canvas.height; y += gridSize) {
    for (let x = 0; x < canvas.width; x += gridSize) {
      waterSquares.push(new WaterSquare(x, y));
    }
  }
}

// Heat water squares based on particle positions
function heatWater(x, y) {
  const col = Math.floor(x / gridSize);
  const row = Math.floor(y / gridSize);
  const square = waterSquares.find(w => w.x === col * gridSize && w.y === row * gridSize);
  if (square) square.heatUp();
}

// Initialize uranium and other components
function initializeUranium() {
  for (let i = 0; i < 15; i++) {
    particles.push(new Particle(
      getRandomInt(canvas.width * 0.2, canvas.width * 0.8),
      getRandomInt(canvas.height * 0.2, canvas.height * 0.8),
      'green',
      0,
      0,
      'uranium'
    ));
  }

  // Add moderators
  for (let i = 0; i < 10; i++) {
    moderators.push({
      x: getRandomInt(canvas.width * 0.2, canvas.width * 0.8),
      y: getRandomInt(canvas.height * 0.2, canvas.height * 0.8),
      radius: particleRadius * 2,
      color: 'gray',
    });
  }

  // Add control rods
  for (let i = 0; i < 5; i++) {
    controlRods.push({
      x: getRandomInt(canvas.width * 0.1, canvas.width * 0.9),
      y: getRandomInt(canvas.height * 0.1, canvas.height * 0.9),
      radius: particleRadius * 3,
      color: 'black',
    });
  }
}

// Main animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw water
  waterSquares.forEach(square => square.draw());

  // Draw moderators
  moderators.forEach(moderator => {
    ctx.beginPath();
    ctx.arc(moderator.x, moderator.y, moderator.radius, 0, Math.PI * 2);
    ctx.fillStyle = moderator.color;
    ctx.fill();
    ctx.closePath();
  });

  // Draw control rods
  controlRods.forEach(rod => {
    ctx.beginPath();
    ctx.arc(rod.x, rod.y, rod.radius, 0, Math.PI * 2);
    ctx.fillStyle = rod.color;
    ctx.fill();
    ctx.closePath();
  });

  particles.forEach((particle, index) => {
    if (!particle.alive) {
      particles.splice(index, 1);
      return;
    }

    particle.move();
    particle.draw();

    // Heat water
    heatWater(particle.x, particle.y);

    // Trigger chain reaction
    if (particle.type === 'neutron') {
      particles.forEach((target) => {
        if (target.type === 'uranium' && Math.hypot(particle.x - target.x, particle.y - target.y) < particleRadius * 2) {
          particle.alive = false;
          target.alive = false;
          fission(target.x, target.y);
        }
      });

      // Slow down neutron if it passes a moderator
      moderators.forEach(moderator => {
        if (Math.hypot(particle.x - moderator.x, particle.y - moderator.y) < moderator.radius) {
          particle.speed *= 0.5;
        }
      });

      // Absorb neutron if it hits a control rod
      controlRods.forEach(rod => {
        if (Math.hypot(particle.x - rod.x, particle.y - rod.y) < rod.radius) {
          particle.alive = false;
        }
      });
    }
  });

  requestAnimationFrame(animate);
}

// Fission reaction
function fission(x, y) {
  // Create radioactive byproducts
  for (let i = 0; i < 3; i++) {
    particles.push(new Particle(
      x,
      y,
      'red',
      getRandomInt(2, 5),
      getRandomInt(0, Math.PI * 2),
      'byproduct'
    ));
  }

  // Create new neutrons for the chain reaction
  for (let i = 0; i < 2; i++) {
    particles.push(new Particle(
      x,
      y,
      'white',
      getRandomInt(3, 6),
      getRandomInt(0, Math.PI * 2),
      'neutron'
    ));
  }
}

// Start the simulation
startButton.addEventListener('click', () => {
  startButton.style.display = 'none'; // Hide the button
  initializeWaterGrid();
  initializeUranium();
  particles.push(new Particle(canvas.width / 2, canvas.height / 2, 'white', 4, Math.random() * Math.PI * 2, 'neutron')); // Start with one neutron
  animate();
});
