const canvas = document.getElementById('reactorCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.6;

function getRandomInt(min, max) {
    return Math.random() * (max - min) + min;
}

class RodMover {
    constructor(particles) {
        this.particles = particles;
        this.heightChangeRate = 80; // Rate at which the height changes
    }

    update() {
        const numBlackBalls = this.particles.fallingBalls.filter(ball => ball.color === 'black').length;

        this.particles.controlRods.forEach((rod, index) => {
            if (index % 2 === 0 && rod.type === 'black') { // Target only black rods at even positions
                if (numBlackBalls > 50 && rod.height > 0) {
                    // Reduce the height of the rod
                    rod.height = Math.max(0, rod.height - this.heightChangeRate);
                } else if (numBlackBalls <= 50 && rod.y + rod.height < canvas.height) {
                    // Increase the height of the rod
                    rod.height = Math.min(canvas.height - rod.y, rod.height + this.heightChangeRate);
                }
            }
        });
    }

    drawRods() {
        this.particles.controlRods.forEach((rod) => {
            ctx.fillStyle = rod.type === 'black' ? 'black' : 'white';
            ctx.fillRect(rod.x, canvas.height - rod.height, rod.width, rod.height);
        });
    }
}



class Particles {
    constructor() {
        this.color = '#A9A9A9';
        this.Radius = 7;
        this.spacing = 35; 
        this.squareSize = 30;
        this.allCircles = [];
        this.controlRods = [];
        this.blueCircles = [];
        this.fallingBalls = [];
        this.squareHitCount = new Map();
        this.collisionCounter = 0;
    }

    isCircleIntersectingRod(circle, rodX, rodWidth) {
        const distX = Math.abs(circle.x - rodX);
        const distY = Math.abs(circle.y - (canvas.height / 2));

        return distX <= (rodWidth / 2 + this.Radius) && distY <= (canvas.height / 2);
    }

    detectCollision(ball, circle) {
        const dx = ball.x - circle.x;
        const dy = ball.y - circle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < ball.radius + this.Radius;
    }

    detectRodCollision(ball, rod) {
        const ballLeft = ball.x - ball.radius;
        const ballRight = ball.x + ball.radius;
        const rodLeft = rod.x;
        const rodRight = rod.x + rod.width;
    
        // Adjusted to ensure more precise collision detection
        return (
            ballRight > rodLeft &&
            ballLeft < rodRight &&
            ball.y + ball.radius >= 0 &&
            ball.y - ball.radius <= canvas.height &&
            ball.y + ball.radius > rod.x && // Ensure the ball has passed the rod's top
            ball.y - ball.radius < rod.x + rod.width // Ensure the ball is within the rod's vertical range
        );
    }

    handleRodCollision(ball, rod) {
        // Only reduce speed for the specific ball that hits the white rod
        if (ball.color === 'black' && rod.type === 'white') {
            // Reduce the ball's speed specifically for this ball when it hits a white rod
            ball.speedY *= 0.7;
            ball.speedX *= 0.7;
            
            // Ensure the ball continues moving past the rod
            ball.y += ball.speedY;
        }
        // If the ball is black and hits a black rod, mark for removal
        else if (ball.color === 'black' && rod.type === 'black') {
            ball.toRemove = true;
        }
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const numColumns = 40; 
        const numRows = Math.floor((canvas.height - this.Radius * 2) / this.spacing);
        this.allCircles = [];

        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numColumns; col++) {
                const x = col * this.spacing + this.Radius + this.spacing / 2;
                const y = row * this.spacing + this.Radius + this.spacing / 2;
                if (x + this.Radius <= canvas.width && y + this.Radius <= canvas.height) {
                    this.allCircles.push({ x, y, color: 'blue' });

                    ctx.fillStyle = '#87CEEB';
                    ctx.fillRect(
                        x - this.squareSize / 2, 
                        y - this.squareSize / 2, 
                        this.squareSize, 
                        this.squareSize
                    );

                    ctx.beginPath();
                    ctx.arc(x, y, this.Radius, 0, Math.PI * 2);
                    ctx.fillStyle = 'grey';
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }

    colorRandomCircles(numberOfCircles) {
        if (this.blueCircles.length === 0) {
            const shuffled = this.allCircles.sort(() => Math.random() - 0.5);
            this.blueCircles = shuffled.slice(0, Math.min(numberOfCircles, this.allCircles.length));
        }

        this.blueCircles.forEach((circle) => {
            ctx.beginPath();
            ctx.arc(circle.x, circle.y, this.Radius, 0, Math.PI * 2);
            ctx.fillStyle = circle.color;
            ctx.fill();
            ctx.closePath();
        });
    }

    drawControlRods() {
        const rodWidth = 5; 
        const borderWidth = 1; 
        const blueColumnWidth = this.spacing * 2;
        const numRodColumns = Math.floor((canvas.width - rodWidth) / blueColumnWidth);

        for (let i = 0; i < numRodColumns; i++) {
            const rodX = i * blueColumnWidth;

            const rodCircles = this.allCircles.filter(circle =>
                this.isCircleIntersectingRod(circle, rodX, rodWidth)
            );

            if (rodCircles.length === 0 && rodX + rodWidth <= canvas.width) {
                ctx.clearRect(rodX - borderWidth, 0, rodWidth + 2 * borderWidth, canvas.height);

                if (i % 2 === 0) {
                    ctx.fillStyle = 'black';
                    ctx.fillRect(rodX, 5, rodWidth, canvas.height * 0.95); 


                } else {
                    ctx.fillStyle = 'black'; 
                    ctx.fillRect(rodX - borderWidth, 4, rodWidth + 2 * borderWidth, canvas.height * 0.95);

                    ctx.fillStyle = 'white';
                    ctx.fillRect(rodX, 5, rodWidth, canvas.height * 0.946); 
                }
                this.controlRods.push({ x: rodX, y: 5, width: rodWidth, type: i % 2 === 0 ? 'black' : 'white' });

            }
        }
    }

    drawFallingBalls() {
        for (let i = this.fallingBalls.length - 1; i >= 0; i--) {
            const ball = this.fallingBalls[i];

            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = ball.color;
            ctx.fill();
            ctx.closePath();

            ball.y += ball.speedY;
            ball.x += ball.speedX;

            this.blueCircles.forEach((circle) => {
                if (this.detectCollision(ball, circle) && circle.color === 'blue') {
                    circle.color = '#A9A9A9';

                    for (let j = 0; j < 3; j++) {
                        const angle = Math.random() * 2 * Math.PI;
                        const speed = 2 + Math.random() * 3;
                        const newBall = {
                            x: circle.x,
                            y: circle.y,
                            radius: 4,
                            speedX: speed * Math.cos(angle),
                            speedY: speed * Math.sin(angle),
                            color: 'black'
                        };
                        this.fallingBalls.push(newBall);
                    }

                    this.collisionCounter++;

                    if (this.collisionCounter % 10 === 0) {
                        this.fallingBalls.splice(i, 1);
                    }
                }
            });

            this.controlRods.forEach((rod) => {
                if (this.detectRodCollision(ball, rod)) {
                    this.handleRodCollision(ball, rod);
                }
            });

            if (ball.toRemove ||
                ball.y - ball.radius > canvas.height ||
                ball.x - ball.radius > canvas.width ||
                ball.x + ball.radius < 0 ||
                ball.y + ball.radius < 0
            ) {
                this.fallingBalls.splice(i, 1);
            }
        }
    }

    addFallingBall() {
        let x, isAboveRod;
        const radius = 8;
        const y = 0;
        const speedY = 2 + Math.random() * 3;
        const speedX = 0;
        const color = 'black';
    
        do {
            x = getRandomInt(5, canvas.width - 5);
            isAboveRod = this.controlRods.some(rod => 
                x > rod.x - radius && x < rod.x + rod.width + radius
            );
        } while (isAboveRod);
    
        this.fallingBalls.push({ x, y, radius, speedX, speedY, color });
    }
    
    initialize() {
        this.draw();
        this.colorRandomCircles(150);
        this.drawControlRods();
    }
}

const particles = new Particles();
particles.initialize();
const rodMover = new RodMover(particles);

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.draw();
    particles.colorRandomCircles(250);
    particles.drawControlRods();
    rodMover.update();
    particles.drawFallingBalls();
    rodMover.drawRods();
    requestAnimationFrame(animate);
}

animate();

addEventListener('resize', function () {
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.6;
    particles.initialize();
});

document.getElementById('startButton').addEventListener('click', function () {
    particles.addFallingBall();
});