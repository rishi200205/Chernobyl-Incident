const canvas = document.getElementById('reactorCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.6;

function getRandomInt(min, max) {
    return Math.random() * (max - min) + min;
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
            }
        }
    }

    drawFallingBalls() {
        this.fallingBalls.forEach((ball, index) => {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = ball.color;
            ctx.fill();
            ctx.closePath();

            ball.y += ball.speedY;
            ball.x += ball.speedX;

            // Check for collision with blue circles
            this.blueCircles.forEach((circle, circleIndex) => {
                if (this.detectCollision(ball, circle) && circle.color === 'blue') {
                    circle.color = '#A9A9A9';
                    
                    // Generate three new balls
                    for (let i = 0; i < 3; i++) {
                        const angle = Math.random() * 2 * Math.PI;
                        const speed = 2 + Math.random() * 3;
                        const newBall = {
                            x: circle.x,
                            y: circle.y,
                            radius: 5,
                            speedX: speed * Math.cos(angle),
                            speedY: speed * Math.sin(angle),
                            color: 'black'
                        };
                        this.fallingBalls.push(newBall);
                    }
                }
            });

            if (
                ball.y - ball.radius > canvas.height ||
                ball.x - ball.radius > canvas.width ||
                ball.x + ball.radius < 0 ||
                ball.y + ball.radius < 0
            ) {
                this.fallingBalls.splice(index, 1);
            }
        });
    }

    addFallingBall() {
        const x = getRandomInt(5, canvas.width - 5);
        const y = 0;
        const radius = 5;
        const speedY = 2 + Math.random() * 3;
        const speedX = 0;
        const color = 'black';

        this.fallingBalls.push({ x, y, radius, speedX, speedY, color });
    }

    initialize() {
        this.draw();
        this.colorRandomCircles(100);
        this.drawControlRods();
    }
}

const particles = new Particles();
particles.initialize();

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.draw();
    particles.colorRandomCircles(100);
    particles.drawControlRods();
    particles.drawFallingBalls();
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
