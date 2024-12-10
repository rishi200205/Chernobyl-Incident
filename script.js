const canvas = document.getElementById('reactorCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

function getRandomInt(min, max) {
    return Math.random() * (max - min) + min;
}

function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

class Particles {
    constructor() {
        this.color = '#A9A9A9';
        this.Radius = 7;
        this.spacing = 35; 
        this.squareSize = 30;
        this.allCircles = [];
        this.controlRods = [];
    }

    isCircleIntersectingRod(circle, rodX, rodWidth) {

        const distX = Math.abs(circle.x - rodX);
        const distY = Math.abs(circle.y - (canvas.height / 2));

        if (distX <= (rodWidth / 2 + this.Radius) && 
            distY <= (canvas.height / 2)) {
            return true;
        }
        return false;
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const numColumns = 39; 
        const numRows = Math.floor((canvas.height - this.Radius * 2) / this.spacing);
        this.allCircles = [];

        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numColumns; col++) {
                const x = col * this.spacing + this.Radius + this.spacing / 2;
                const y = row * this.spacing + this.Radius + this.spacing / 2;
                if (x + this.Radius <= canvas.width && y + this.Radius <= canvas.height) {
                    this.allCircles.push({ x, y });
                    
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
        const shuffled = this.allCircles.sort(() => Math.random() - 0.5);
        const selectedCircles = shuffled.slice(0, Math.min(numberOfCircles, this.allCircles.length));
        selectedCircles.forEach((circle) => {
            ctx.beginPath();
            ctx.arc(circle.x, circle.y, this.Radius, 0, Math.PI * 2);
            ctx.fillStyle = 'blue';
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
            
                if (i % 2 === 0) {
                  

                  ctx.fillStyle = 'black'; 
                  ctx.fillRect(rodX - borderWidth, 0, rodWidth + 2 * borderWidth, canvas.height);
                  
                  ctx.fillStyle = 'white';
                  ctx.fillRect(rodX, 0, rodWidth, canvas.height);
                 

                } else {
                  ctx.fillStyle = 'black';
                  ctx.fillRect(rodX, 0, rodWidth, canvas.height*0.95);

                }
            }
        }
    }

    initialize() {
        this.draw();
        this.colorRandomCircles(200);
        this.drawControlRods();
    }
}

const particles = new Particles();
particles.initialize();

addEventListener('resize', function () {
    canvas.width = window.innerWidth * 0.6;
    canvas.height = window.innerHeight * 0.6;
    particles.initialize();
});